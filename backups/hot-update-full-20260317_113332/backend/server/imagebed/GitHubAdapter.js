/**
 * GitHub 图床适配器
 * 将图片存储到 GitHub 仓库
 */

const crypto = require('crypto');
const ImageBedAdapter = require('./ImageBedAdapter');

class GitHubAdapter extends ImageBedAdapter {
  constructor(config = {}) {
    super(config);
    this.type = 'github';
    this.name = config.name || 'GitHub';
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch || 'main';
    this.token = config.token;
    // CDN 域名配置，默认使用 jsdelivr 加速
    this.cdnDomain = config.cdnDomain || 'jsdelivr';
    // 确保 path 不以 / 开头，且以 / 结尾
    let path = config.path || 'images/';
    if (path.startsWith('/')) path = path.slice(1);
    if (!path || path === '/') path = 'images/';  // 如果为空或仅是 /，使用默认值
    if (!path.endsWith('/')) path += '/';
    this.path = path;
  }

  /**
   * 验证配置
   */
  async validateConfig(config) {
    if (!config.owner || !config.repo || !config.token) {
      return { valid: false, error: 'Missing required fields: owner, repo, token' };
    }
    return { valid: true };
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      const response = await this.makeRequest('GET', `/repos/${this.owner}/${this.repo}`);
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: `GitHub API error: ${response.status}` };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 发送 HTTP 请求到 GitHub API
   */
  async makeRequest(method, path, body = null) {
    const url = `https://api.github.com${path}`;
    const options = {
      method,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MdEditor-ImageBed',
      },
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
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
      const filename = this.generateFilename(options.filename || 'image.jpg');
      
      // 生成年月日路径
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const datePath = `${year}/${month}/${day}`;
      
      // 构建完整路径：images/2026/03/17/filename.png
      const filePath = `${this.path}${datePath}/${filename}`;
      console.log('[GitHubAdapter] 上传配置 - owner:', this.owner, 'repo:', this.repo, 'path:', this.path);
      console.log('[GitHubAdapter] 生成的文件名:', filename);
      console.log('[GitHubAdapter] 最终路径:', filePath);
      const content = fileBuffer.toString('base64');

      const response = await this.makeRequest(
        'PUT',
        `/repos/${this.owner}/${this.repo}/contents/${filePath}`,
        {
          message: `Upload image: ${filename}`,
          content,
          branch: this.branch,
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.data.message}`);
      }

      // 根据配置的 CDN 域名构建 URL
      let url;
      switch (this.cdnDomain) {
        case 'jsdelivr':
          // jsDelivr CDN: https://cdn.jsdelivr.net/gh/user/repo@branch/path
          url = `https://cdn.jsdelivr.net/gh/${this.owner}/${this.repo}@${this.branch}/${filePath}`;
          break;
        case 'ghproxy':
          // ghproxy 加速: https://ghproxy.com/https://raw.githubusercontent.com/...
          url = `https://ghproxy.com/https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${filePath}`;
          break;
        case 'fastgit':
          // FastGit 加速: https://raw.fastgit.org/user/repo/branch/path
          url = `https://raw.fastgit.org/${this.owner}/${this.repo}/${this.branch}/${filePath}`;
          break;
        case 'raw':
        default:
          // 原始 GitHub URL
          url = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${filePath}`;
          break;
      }

      return {
        url,
        filename,
        size: fileBuffer.length,
        originalName: options.filename,
        mimeType: options.mimeType || 'image/jpeg',
      };
    } catch (err) {
      throw new Error(`Failed to upload to GitHub: ${err.message}`);
    }
  }

  /**
   * 删除图片
   */
  async delete(url) {
    try {
      // 从 URL 中提取文件路径
      const match = url.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.+)$/);
      if (!match) {
        return { success: false, error: 'Invalid GitHub URL format' };
      }

      const filePath = match[1];

      // 获取文件信息以获取 SHA
      const getResponse = await this.makeRequest(
        'GET',
        `/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${this.branch}`
      );

      if (!getResponse.ok) {
        return { success: false, error: 'File not found' };
      }

      const sha = getResponse.data.sha;

      // 删除文件
      const deleteResponse = await this.makeRequest(
        'DELETE',
        `/repos/${this.owner}/${this.repo}/contents/${filePath}`,
        {
          message: `Delete image: ${filePath}`,
          sha,
          branch: this.branch,
        }
      );

      if (deleteResponse.ok) {
        return { success: true };
      } else {
        return { success: false, error: deleteResponse.data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 获取图片列表
   */
  async list(options = {}) {
    try {
      const response = await this.makeRequest(
        'GET',
        `/repos/${this.owner}/${this.repo}/contents/${this.path}?ref=${this.branch}`
      );

      if (!response.ok) {
        return { images: [], total: 0, hasMore: false };
      }

      const files = Array.isArray(response.data) ? response.data : [];
      const images = files
        .filter(file => file.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
        .map(file => ({
          filename: file.name,
          url: file.download_url,
          size: file.size,
          mimeType: 'image/jpeg',
          createdAt: Date.now(),
        }));

      return {
        images,
        total: images.length,
        hasMore: false,
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
      owner: this.owner,
      repo: this.repo,
      branch: this.branch,
      path: this.path,
    };
  }
}

module.exports = GitHubAdapter;
