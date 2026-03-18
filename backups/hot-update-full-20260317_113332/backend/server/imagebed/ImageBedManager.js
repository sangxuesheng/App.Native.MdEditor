/**
 * 图床管理器
 * 管理多个图床配置和适配器实例
 */

const crypto = require('crypto');
const LocalAdapter = require('./LocalAdapter');
const GitHubAdapter = require('./GitHubAdapter');
const QiniuAdapter = require('./QiniuAdapter');
const AliyunOSSAdapter = require('./AliyunOSSAdapter');
const TencentCOSAdapter = require('./TencentCOSAdapter');
const CustomAdapter = require('./CustomAdapter');

class ImageBedManager {
  constructor(db, encryptionKey) {
    this.db = db;
    this.encryptionKey = encryptionKey;
    this.adapters = new Map(); // 缓存适配器实例
    this.initDatabase();
  }

  /**
   * 初始化数据库表
   */
  initDatabase() {
    // 图床配置表
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS imagebed_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        config_json TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    // 图片记录表
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS imagebed_images (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT,
        size INTEGER,
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        imagebed_id INTEGER NOT NULL,
        imagebed_type TEXT,
        imagebed_url TEXT,
        local_path TEXT,
        description TEXT,
        tags TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY(imagebed_id) REFERENCES imagebed_configs(id)
      )
    `).run();

    // 初始化默认的本地存储配置
    this.ensureDefaultLocalConfig();
  }

  /**
   * 确保存在默认的本地存储配置
   */
  ensureDefaultLocalConfig() {
    try {
      const existing = this.db.prepare(
        'SELECT id FROM imagebed_configs WHERE type = ? AND is_default = 1'
      ).get('local');

      if (!existing) {
        const now = Date.now();
        this.db.prepare(`
          INSERT OR IGNORE INTO imagebed_configs (name, type, is_default, config_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run('本地存储', 'local', 1, '{}', now, now);
      }
    } catch (err) {
      console.error('[ImageBedManager] Failed to ensure default local config:', err);
    }
  }

  /**
   * 加密配置
   */
  encryptConfig(config) {
    if (!this.encryptionKey) {
      return config;
    }

    try {
      const plaintext = JSON.stringify(config);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
      const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();

      return {
        __enc: 'aes-gcm',
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        data: encrypted.toString('base64'),
      };
    } catch (err) {
      console.error('[ImageBedManager] Encryption failed:', err);
      return config;
    }
  }

  /**
   * 解密配置
   */
  decryptConfig(encrypted) {
    if (!encrypted || encrypted.__enc !== 'aes-gcm' || !this.encryptionKey) {
      return encrypted;
    }

    try {
      const iv = Buffer.from(encrypted.iv, 'base64');
      const tag = Buffer.from(encrypted.tag, 'base64');
      const data = Buffer.from(encrypted.data, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(tag);
      const plaintext = decipher.update(data) + decipher.final('utf8');
      return JSON.parse(plaintext);
    } catch (err) {
      console.error('[ImageBedManager] Decryption failed:', err);
      return encrypted;
    }
  }

  /**
   * 获取或创建适配器实例
   */
  async getAdapter(configId) {
    if (this.adapters.has(configId)) {
      return this.adapters.get(configId);
    }

    const config = this.db.prepare(
      'SELECT * FROM imagebed_configs WHERE id = ?'
    ).get(configId);

    if (!config) {
      throw new Error(`Imagebed config not found: ${configId}`);
    }

    let configData = JSON.parse(config.config_json);
    configData = this.decryptConfig(configData);

    let adapter;
    switch (config.type) {
      case 'local':
        adapter = new LocalAdapter({ name: config.name, ...configData });
        break;
      case 'github':
        adapter = new GitHubAdapter({ name: config.name, ...configData });
        break;
      case 'qiniu':
        adapter = new QiniuAdapter({ name: config.name, ...configData });
        break;
      case 'aliyun':
        adapter = new AliyunOSSAdapter({ name: config.name, ...configData });
        break;
      case 'tencent':
        adapter = new TencentCOSAdapter({ name: config.name, ...configData });
        break;
      case 'custom':
        adapter = new CustomAdapter({ name: config.name, ...configData });
        break;
      default:
        throw new Error(`Unknown imagebed type: ${config.type}`);
    }

    this.adapters.set(configId, adapter);
    return adapter;
  }

  /**
   * 获取所有图床配置
   */
  getAllConfigs() {
    try {
      const configs = this.db.prepare(
        'SELECT id, name, type, is_default, created_at, updated_at FROM imagebed_configs ORDER BY is_default DESC, created_at ASC'
      ).all();

      return configs.map(config => ({
        id: config.id,
        name: config.name,
        type: config.type,
        isDefault: config.is_default === 1,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
      }));
    } catch (err) {
      console.error('[ImageBedManager] Failed to get all configs:', err);
      return [];
    }
  }

  /**
   * 获取默认图床配置
   */
  getDefaultConfig() {
    try {
      const config = this.db.prepare(
        'SELECT id FROM imagebed_configs WHERE is_default = 1 LIMIT 1'
      ).get();

      return config ? config.id : null;
    } catch (err) {
      console.error('[ImageBedManager] Failed to get default config:', err);
      return null;
    }
  }

  /**
   * 设置默认图床
   */
  setDefaultConfig(configId) {
    try {
      const now = Date.now();
      this.db.prepare('UPDATE imagebed_configs SET is_default = 0').run();
      this.db.prepare(
        'UPDATE imagebed_configs SET is_default = 1, updated_at = ? WHERE id = ?'
      ).run(now, configId);
      return true;
    } catch (err) {
      console.error('[ImageBedManager] Failed to set default config:', err);
      return false;
    }
  }

  /**
   * 添加图床配置
   */
  addConfig(name, type, config) {
    try {
      const now = Date.now();
      const encryptedConfig = this.encryptConfig(config);
      const configJson = JSON.stringify(encryptedConfig);

      const result = this.db.prepare(`
        INSERT INTO imagebed_configs (name, type, is_default, config_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, type, 0, configJson, now, now);

      // 清除缓存
      this.adapters.delete(result.lastInsertRowid);

      return result.lastInsertRowid;
    } catch (err) {
      console.error('[ImageBedManager] Failed to add config:', err);
      throw err;
    }
  }

  /**
   * 更新图床配置
   */
  updateConfig(configId, name, config) {
    try {
      const now = Date.now();
      const encryptedConfig = this.encryptConfig(config);
      const configJson = JSON.stringify(encryptedConfig);

      this.db.prepare(`
        UPDATE imagebed_configs SET name = ?, config_json = ?, updated_at = ? WHERE id = ?
      `).run(name, configJson, now, configId);

      // 清除缓存
      this.adapters.delete(configId);

      return true;
    } catch (err) {
      console.error('[ImageBedManager] Failed to update config:', err);
      throw err;
    }
  }

  /**
   * 删除图床配置
   */
  deleteConfig(configId) {
    try {
      // 不允许删除默认配置
      const config = this.db.prepare(
        'SELECT is_default FROM imagebed_configs WHERE id = ?'
      ).get(configId);

      if (config && config.is_default === 1) {
        throw new Error('Cannot delete default imagebed');
      }

      this.db.prepare('DELETE FROM imagebed_configs WHERE id = ?').run(configId);
      this.adapters.delete(configId);

      return true;
    } catch (err) {
      console.error('[ImageBedManager] Failed to delete config:', err);
      throw err;
    }
  }

  /**
   * 测试图床连接
   */
  async testConnection(configId) {
    try {
      const adapter = await this.getAdapter(configId);
      return await adapter.testConnection();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 上传图片
   */
  async uploadImage(fileBuffer, options = {}) {
    try {
      const configId = options.imagebedId || this.getDefaultConfig();
      if (!configId) {
        throw new Error('No imagebed configured');
      }

      const adapter = await this.getAdapter(configId);
      const result = await adapter.upload(fileBuffer, options);

      // 保存图片记录
      const imageId = crypto.randomBytes(8).toString('hex');
      const now = Date.now();

      this.db.prepare(`
        INSERT INTO imagebed_images (
          id, filename, original_name, size, mime_type,
          imagebed_id, imagebed_type, imagebed_url,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        imageId,
        result.filename,
        options.filename,
        result.size,
        options.mimeType,
        configId,
        adapter.type,
        result.url,
        now,
        now
      );

      return {
        id: imageId,
        ...result,
      };
    } catch (err) {
      console.error('[ImageBedManager] Failed to upload image:', err);
      throw err;
    }
  }

  /**
   * 删除图片
   */
  async deleteImage(imageId) {
    try {
      const image = this.db.prepare(
        'SELECT * FROM imagebed_images WHERE id = ?'
      ).get(imageId);

      if (!image) {
        throw new Error('Image not found');
      }

      const adapter = await this.getAdapter(image.imagebed_id);
      const result = await adapter.delete(image.imagebed_url);

      if (result.success) {
        this.db.prepare('DELETE FROM imagebed_images WHERE id = ?').run(imageId);
      }

      return result;
    } catch (err) {
      console.error('[ImageBedManager] Failed to delete image:', err);
      throw err;
    }
  }

  /**
   * 获取图片列表
   */
  getImageList(options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const imagebedId = options.imagebedId;

      let query = 'SELECT * FROM imagebed_images';
      const params = [];

      if (imagebedId) {
        query += ' WHERE imagebed_id = ?';
        params.push(imagebedId);
      }

      query += ' ORDER BY created_at DESC';

      const total = this.db.prepare(
        query.replace('SELECT *', 'SELECT COUNT(*) as count')
      ).get(...params).count;

      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const images = this.db.prepare(query).all(...params);

      return {
        images: images.map(img => ({
          id: img.id,
          filename: img.filename,
          originalName: img.original_name,
          size: img.size,
          mimeType: img.mime_type,
          url: img.imagebed_url,
          imagebedType: img.imagebed_type,
          createdAt: img.created_at,
        })),
        total,
        hasMore: offset + limit < total,
      };
    } catch (err) {
      console.error('[ImageBedManager] Failed to get image list:', err);
      return { images: [], total: 0, hasMore: false };
    }
  }
}

module.exports = ImageBedManager;
