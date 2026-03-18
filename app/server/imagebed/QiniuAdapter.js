/**
 * 七牛云图床适配器
 * 将图片存储到七牛云 OSS
 */

const crypto = require('crypto');
const ImageBedAdapter = require('./ImageBedAdapter');

class QiniuAdapter extends ImageBedAdapter {
  constructor(config = {}) {
    super(config);
    this.type = 'qiniu';
    this.name = config.name || '七牛云';
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.bucket = config.bucket;
    this.domain = config.domain;
    this.zone = config.zone || 'Zone_CN_East';
    this.qiniu = null;
    this.initQiniu();
  }

  /**
   * 初始化七牛云 SDK
   */
  initQiniu() {
    try {
      const qiniu = require('qiniu');
      const mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
      
      const config = new qiniu.conf.Config();
      config.zone = qiniu.zone[this.zone];
      
      this.bucketManager = new qiniu.rs.BucketManager(mac, config);
      this.uploader = new qiniu.form_up.FormUploader(config);
      this.mac = mac;
      this.qiniu = qiniu;
    } catch (err) {
      console.error('[QiniuAdapter] Failed to initialize Qiniu SDK:', err);
    }
  }

  /**
   * 验证配置
   */
  async validateConfig(config) {
    if (!config.accessKey || !config.secretKey || !config.bucket || !config.domain) {
      return { valid: false, error: 'Missing required fields: accessKey, secretKey, bucket, domain' };
    }
    return { valid: true };
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      if (!this.bucketManager) {
        return { success: false, error: 'Qiniu SDK not initialized' };
      }

      return new Promise((resolve) => {
        this.bucketManager.listPrefix(this.bucket, { prefix: '', limit: 1 }, (err, respBody, respInfo) => {
          if (respInfo.statusCode === 200) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: `Qiniu API error: ${respInfo.statusCode}` });
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
   * 生成上传 token
   */
  generateUploadToken() {
    const putPolicy = new this.qiniu.rs.PutPolicy({
      scope: this.bucket,
      expires: 3600,
    });
    return putPolicy.uploadToken(this.mac);
  }

  /**
   * 上传图片
   */
  async upload(fileBuffer, options = {}) {
    try {
      if (!this.uploader) {
        throw new Error('Qiniu SDK not initialized');
      }

      const filename = this.generateFilename(options.filename || 'image.jpg');
      const uploadToken = this.generateUploadToken();

      return new Promise((resolve, reject) => {
        const putExtra = new this.qiniu.form_up.PutExtra();
        
        this.uploader.put(uploadToken, filename, fileBuffer, putExtra, (err, respBody, respInfo) => {
          if (err) {
            reject(new Error(`Failed to upload to Qiniu: ${err.message}`));
          } else if (respInfo.statusCode === 200) {
            const url = `${this.domain}/${respBody.key}`;
            resolve({
              url,
              filename: respBody.key,
              size: fileBuffer.length,
              originalName: options.filename,
              mimeType: options.mimeType || 'image/jpeg',
            });
          } else {
            reject(new Error(`Qiniu API error: ${respInfo.statusCode}`));
          }
        });
      });
    } catch (err) {
      throw new Error(`Failed to upload to Qiniu: ${err.message}`);
    }
  }

  /**
   * 删除图片
   */
  async delete(url) {
    try {
      if (!this.bucketManager) {
        return { success: false, error: 'Qiniu SDK not initialized' };
      }

      // 从 URL 中提取文件名
      const filename = url.replace(this.domain + '/', '');

      return new Promise((resolve) => {
        this.bucketManager.delete(this.bucket, filename, (err, respBody, respInfo) => {
          if (respInfo.statusCode === 200) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: `Qiniu API error: ${respInfo.statusCode}` });
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
      if (!this.bucketManager) {
        return { images: [], total: 0, hasMore: false };
      }

      const limit = options.limit || 20;
      const marker = options.marker || '';

      return new Promise((resolve) => {
        this.bucketManager.listPrefix(this.bucket, { prefix: '', limit, marker }, (err, respBody, respInfo) => {
          if (respInfo.statusCode === 200) {
            const images = respBody.items
              .filter(item => /\.(jpg|jpeg|png|gif|webp)$/i.test(item.key))
              .map(item => ({
                filename: item.key,
                url: `${this.domain}/${item.key}`,
                size: item.fsize,
                mimeType: 'image/jpeg',
                createdAt: item.putTime / 10000, // 七牛时间戳单位是 100ns
              }));

            resolve({
              images,
              total: respBody.items.length,
              hasMore: respBody.markerNext ? true : false,
              marker: respBody.markerNext,
            });
          } else {
            resolve({ images: [], total: 0, hasMore: false });
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
      domain: this.domain,
      zone: this.zone,
    };
  }
}

module.exports = QiniuAdapter;
