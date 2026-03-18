/**
 * 腾讯云 COS 图床适配器
 * 将图片存储到腾讯云 COS
 */

const crypto = require('crypto');
const ImageBedAdapter = require('./ImageBedAdapter');

class TencentCOSAdapter extends ImageBedAdapter {
  constructor(config = {}) {
    super(config);
    this.type = 'tencent';
    this.name = config.name || '腾讯云 COS';
    this.secretId = config.secretId;
    this.secretKey = config.secretKey;
    this.bucket = config.bucket;
    this.region = config.region;
    this.domain = config.domain;
    this.client = null;
    this.initClient();
  }

  /**
   * 初始化腾讯云 COS 客户端
   */
  initClient() {
    try {
      const COS = require('cos-nodejs-sdk-v5');
      this.client = new COS({
        SecretId: this.secretId,
        SecretKey: this.secretKey,
      });
    } catch (err) {
      console.error('[TencentCOSAdapter] Failed to initialize COS client:', err);
    }
  }

  /**
   * 验证配置
   */
  async validateConfig(config) {
    if (!config.secretId || !config.secretKey || !config.bucket || !config.region) {
      return { valid: false, error: 'Missing required fields: secretId, secretKey, bucket, region' };
    }
    return { valid: true };
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      if (!this.client) {
        return { success: false, error: 'COS client not initialized' };
      }

      return new Promise((resolve) => {
        this.client.getBucket({
          Bucket: this.bucket,
          Region: this.region,
          MaxKeys: 1,
        }, (err, data) => {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true });
          }
        });
      });
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
        throw new Error('COS client not initialized');
      }

      const filename = this.generateFilename(options.filename || 'image.jpg');

      return new Promise((resolve, reject) => {
        this.client.putObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: filename,
          Body: fileBuffer,
          ContentType: options.mimeType || 'image/jpeg',
        }, (err, data) => {
          if (err) {
            reject(new Error(`Failed to upload to Tencent COS: ${err.message}`));
          } else {
            // 使用自定义域名或默认 COS 域名
            const url = this.domain 
              ? `${this.domain}/${filename}`
              : `https://${this.bucket}.cos.${this.region}.myqcloud.com/${filename}`;

            resolve({
              url,
              filename,
              size: fileBuffer.length,
              originalName: options.filename,
              mimeType: options.mimeType || 'image/jpeg',
            });
          }
        });
      });
    } catch (err) {
      throw new Error(`Failed to upload to Tencent COS: ${err.message}`);
    }
  }

  /**
   * 删除图片
   */
  async delete(url) {
    try {
      if (!this.client) {
        return { success: false, error: 'COS client not initialized' };
      }

      // 从 URL 中提取文件名
      let filename;
      if (this.domain) {
        filename = url.replace(this.domain + '/', '');
      } else {
        const match = url.match(/\/([^/]+)$/);
        filename = match ? match[1] : url;
      }

      return new Promise((resolve) => {
        this.client.deleteObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: filename,
        }, (err, data) => {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true });
          }
        });
      });
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

      return new Promise((resolve) => {
        this.client.getBucket({
          Bucket: this.bucket,
          Region: this.region,
          MaxKeys: maxKeys,
          Marker: marker,
        }, (err, data) => {
          if (err) {
            resolve({ images: [], total: 0, hasMore: false });
          } else {
            const images = (data.Contents || [])
              .filter(obj => /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.Key))
              .map(obj => {
                const url = this.domain
                  ? `${this.domain}/${obj.Key}`
                  : `https://${this.bucket}.cos.${this.region}.myqcloud.com/${obj.Key}`;

                return {
                  filename: obj.Key,
                  url,
                  size: obj.Size,
                  mimeType: 'image/jpeg',
                  createdAt: new Date(obj.LastModified).getTime(),
                };
              });

            resolve({
              images,
              total: images.length,
              hasMore: data.IsTruncated === 'true',
              marker: data.NextMarker,
            });
          }
        });
      });
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
      bucket: this.bucket,
      region: this.region,
      domain: this.domain,
    };
  }
}

module.exports = TencentCOSAdapter;
