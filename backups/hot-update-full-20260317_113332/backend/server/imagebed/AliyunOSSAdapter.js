/**
 * 阿里云 OSS 图床适配器
 * 将图片存储到阿里云 OSS
 */

const crypto = require('crypto');
const ImageBedAdapter = require('./ImageBedAdapter');

class AliyunOSSAdapter extends ImageBedAdapter {
  constructor(config = {}) {
    super(config);
    this.type = 'aliyun';
    this.name = config.name || '阿里云 OSS';
    this.region = config.region;
    this.accessKeyId = config.accessKeyId;
    this.accessKeySecret = config.accessKeySecret;
    this.bucket = config.bucket;
    this.domain = config.domain;
    this.client = null;
    this.initClient();
  }

  /**
   * 初始化阿里云 OSS 客户端
   */
  initClient() {
    try {
      const OSS = require('ali-oss');
      this.client = new OSS({
        region: this.region,
        accessKeyId: this.accessKeyId,
        accessKeySecret: this.accessKeySecret,
        bucket: this.bucket,
      });
    } catch (err) {
      console.error('[AliyunOSSAdapter] Failed to initialize OSS client:', err);
    }
  }

  /**
   * 验证配置
   */
  async validateConfig(config) {
    if (!config.region || !config.accessKeyId || !config.accessKeySecret || !config.bucket) {
      return { valid: false, error: 'Missing required fields: region, accessKeyId, accessKeySecret, bucket' };
    }
    return { valid: true };
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      if (!this.client) {
        return { success: false, error: 'OSS client not initialized' };
      }

      await this.client.list({ 'max-keys': 1 });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 生成唯一的文件名
   */
  generateFilename(originalName) {
    const ext = originalName.split('.').pop();
    const uuid = crypto.randomBytes(8).toString('hex');
    return `${uuid}.${ext}`;
  }

  /**
   * 上传图片
   */
  async upload(fileBuffer, options = {}) {
    try {
      if (!this.client) {
        throw new Error('OSS client not initialized');
      }

      const filename = this.generateFilename(options.filename || 'image.jpg');
      
      const result = await this.client.put(filename, fileBuffer, {
        headers: {
          'Content-Type': options.mimeType || 'image/jpeg',
        },
      });

      // 使用自定义域名或默认 OSS 域名
      const url = this.domain ? `${this.domain}/${filename}` : result.url;

      return {
        url,
        filename,
        size: fileBuffer.length,
        originalName: options.filename,
        mimeType: options.mimeType || 'image/jpeg',
      };
    } catch (err) {
      throw new Error(`Failed to upload to Aliyun OSS: ${err.message}`);
    }
  }

  /**
   * 删除图片
   */
  async delete(url) {
    try {
      if (!this.client) {
        return { success: false, error: 'OSS client not initialized' };
      }

      // 从 URL 中提取文件名
      let filename;
      if (this.domain) {
        filename = url.replace(this.domain + '/', '');
      } else {
        const match = url.match(/\/([^/]+)$/);
        filename = match ? match[1] : url;
      }

      await this.client.delete(filename);
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
      if (!this.client) {
        return { images: [], total: 0, hasMore: false };
      }

      const maxKeys = options.limit || 20;
      const marker = options.marker || '';

      const result = await this.client.list({
        'max-keys': maxKeys,
        marker,
      });

      const images = result.objects
        ? result.objects
            .filter(obj => /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.name))
            .map(obj => {
              const url = this.domain ? `${this.domain}/${obj.name}` : obj.url;
              return {
                filename: obj.name,
                url,
                size: obj.size,
                mimeType: 'image/jpeg',
                createdAt: new Date(obj.lastModified).getTime(),
              };
            })
        : [];

      return {
        images,
        total: images.length,
        hasMore: result.isTruncated,
        marker: result.nextMarker,
      };
    } catch (err) {
      return { images: [], total: 0, hasMore: false, error: err.message };
    }
  }

  /**
   * 获取配置信息
   */
  getConfig() {
    return {
      type: this.type,
      name: this.name,
      region: this.region,
      bucket: this.bucket,
      domain: this.domain,
    };
  }
}

module.exports = AliyunOSSAdapter;
