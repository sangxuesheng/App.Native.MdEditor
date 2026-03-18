/**
 * 本地存储适配器
 * 将图片存储在本地服务器
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ImageBedAdapter = require('./ImageBedAdapter');

class LocalAdapter extends ImageBedAdapter {
  constructor(config = {}) {
    super(config);
    this.type = 'local';
    this.name = config.name || '本地存储';
    
    // 本地存储路径
    this.basePath = config.basePath || this.getDefaultBasePath();
    this.originalsDir = path.join(this.basePath, 'originals');
    this.thumbnailsDir = path.join(this.basePath, 'thumbnails');
    
    // 确保目录存在
    this.ensureDirectories();
  }

  /**
   * 获取默认的本地存储路径
   */
  getDefaultBasePath() {
    const trimVar = process.env.TRIM_PKGVAR;
    if (trimVar) {
      return path.join(trimVar, 'images');
    }
    
    // 开发环境
    const appRoot = path.join(__dirname, '../..');
    return path.join(appRoot, 'shares', 'images');
  }

  /**
   * 确保目录存在
   */
  ensureDirectories() {
    try {
      if (!fs.existsSync(this.basePath)) {
        fs.mkdirSync(this.basePath, { recursive: true });
      }
      if (!fs.existsSync(this.originalsDir)) {
        fs.mkdirSync(this.originalsDir, { recursive: true });
      }
      if (!fs.existsSync(this.thumbnailsDir)) {
        fs.mkdirSync(this.thumbnailsDir, { recursive: true });
      }
    } catch (err) {
      console.error('[LocalAdapter] Failed to create directories:', err);
    }
  }

  /**
   * 验证配置
   */
  async validateConfig(config) {
    try {
      const basePath = config.basePath || this.getDefaultBasePath();
      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
      }
      return { valid: true };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      this.ensureDirectories();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 生成唯一的文件名
   */
  generateFilename(originalName) {
    const ext = path.extname(originalName);
    const uuid = crypto.randomBytes(8).toString('hex');
    return `${uuid}${ext}`;
  }

  /**
   * 上传图片
   */
  async upload(fileBuffer, options = {}) {
    try {
      const filename = this.generateFilename(options.filename || 'image.jpg');
      const filePath = path.join(this.originalsDir, filename);
      
      // 写入文件
      fs.writeFileSync(filePath, fileBuffer);
      
      // 获取文件大小
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      // 生成本地 URL（相对路径）
      const url = `/api/image/local/${filename}`;
      
      return {
        url,
        filename,
        size,
        originalName: options.filename,
        mimeType: options.mimeType || 'image/jpeg',
      };
    } catch (err) {
      throw new Error(`Failed to upload image: ${err.message}`);
    }
  }

  /**
   * 删除图片
   */
  async delete(url) {
    try {
      // 从 URL 中提取文件名
      const match = url.match(/\/api\/image\/local\/(.+)$/);
      if (!match) {
        return { success: false, error: 'Invalid URL format' };
      }
      
      const filename = match[1];
      const filePath = path.join(this.originalsDir, filename);
      const thumbnailPath = path.join(this.thumbnailsDir, `${path.parse(filename).name}_thumb${path.extname(filename)}`);
      
      // 删除原始文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // 删除缩略图
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 获取图片列表
   */
  async list(options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      
      const files = fs.readdirSync(this.originalsDir);
      const total = files.length;
      
      // 分页
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedFiles = files.slice(start, end);
      
      const images = paginatedFiles.map(filename => {
        const filePath = path.join(this.originalsDir, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          url: `/api/image/local/${filename}`,
          size: stats.size,
          mimeType: 'image/jpeg',
          createdAt: stats.mtime.getTime(),
        };
      });
      
      return {
        images,
        total,
        hasMore: end < total,
      };
    } catch (err) {
      return { images: [], total: 0, hasMore: false, error: err.message };
    }
  }

  /**
   * 获取图片文件
   */
  getImageFile(filename) {
    const filePath = path.join(this.originalsDir, filename);
    
    // 安全检查：防止路径遍历
    const normalized = path.normalize(filePath);
    if (!normalized.startsWith(this.originalsDir)) {
      throw new Error('Invalid file path');
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    return filePath;
  }

  /**
   * 获取配置信息
   */
  getConfig() {
    return {
      type: this.type,
      name: this.name,
      basePath: this.basePath,
    };
  }
}

module.exports = LocalAdapter;
