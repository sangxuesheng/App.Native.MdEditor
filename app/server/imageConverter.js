/**
 * 图片转换模块 - 支持 HEIC/HEIF 转换为 JPEG
 * 使用 FFmpeg 进行转换
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

/**
 * 检查 FFmpeg 是否可用
 */
async function checkFFmpeg() {
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    return stdout.includes('ffmpeg version');
  } catch (error) {
    return false;
  }
}

/**
 * 检查转换工具状态
 */
async function getConverterStatus() {
  const ffmpegAvailable = await checkFFmpeg();
  
  return {
    ok: true,
    available: ffmpegAvailable,
    tools: {
      ffmpeg: ffmpegAvailable
    },
    recommended: ffmpegAvailable ? 'FFmpeg' : null
  };
}

/**
 * 使用 FFmpeg 转换图片
 * @param {Buffer} inputBuffer - 输入图片的 Buffer
 * @param {string} inputFormat - 输入格式（如 'heic'）
 * @param {Object} options - 转换选项
 * @returns {Promise<Buffer>} 转换后的图片 Buffer
 */
async function convertWithFFmpeg(inputBuffer, inputFormat, options = {}) {
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.${inputFormat}`);
  const outputFile = path.join(tempDir, `output_${Date.now()}.${options.format || 'jpg'}`);
  
  try {
    // 写入临时输入文件
    fs.writeFileSync(inputFile, inputBuffer);
    
    // 构建 FFmpeg 命令
    let command = `ffmpeg -i "${inputFile}"`;
    
    // 添加质量参数
    if (options.quality) {
      const qscale = Math.round((100 - options.quality) / 10); // 转换为 FFmpeg 的 qscale (2-31)
      command += ` -q:v ${Math.max(2, Math.min(31, qscale))}`;
    }
    
    // 添加尺寸限制
    if (options.maxWidth || options.maxHeight) {
      const width = options.maxWidth || -1;
      const height = options.maxHeight || -1;
      command += ` -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease"`;
    }
    
    // 输出文件
    command += ` "${outputFile}" -y`;
    
    console.log('FFmpeg 命令:', command);
    
    // 执行转换
    const { stdout, stderr } = await execAsync(command);
    console.log('FFmpeg 输出:', stderr); // FFmpeg 的日志输出到 stderr
    
    // 读取转换后的文件
    const outputBuffer = fs.readFileSync(outputFile);
    
    // 清理临时文件
    try {
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);
    } catch (cleanupError) {
      console.error('清理临时文件失败:', cleanupError);
    }
    
    return outputBuffer;
  } catch (error) {
    // 清理临时文件
    try {
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (cleanupError) {
      console.error('清理临时文件失败:', cleanupError);
    }
    
    throw new Error(`FFmpeg 转换失败: ${error.message}`);
  }
}

/**
 * 转换图片
 * @param {Buffer} inputBuffer - 输入图片的 Buffer
 * @param {string} originalFilename - 原始文件名
 * @param {Object} options - 转换选项
 * @param {string} options.format - 输出格式，默认 'jpeg'
 * @param {number} options.quality - 质量 (1-100)，默认 85
 * @param {number} options.maxWidth - 最大宽度（可选）
 * @param {number} options.maxHeight - 最大高度（可选）
 * @returns {Promise<Object>} 转换结果
 */
async function convertImage(inputBuffer, originalFilename, options = {}) {
  const ext = path.extname(originalFilename).toLowerCase();
  const inputFormat = ext.replace('.', '');
  
  // 检查是否需要转换
  if (!['.heic', '.heif'].includes(ext)) {
    throw new Error(`不支持的格式: ${ext}`);
  }
  
  // 检查 FFmpeg 是否可用
  const ffmpegAvailable = await checkFFmpeg();
  
  if (!ffmpegAvailable) {
    throw new Error('FFmpeg 未安装或不可用。请安装 FFmpeg: apt-get install ffmpeg 或 yum install ffmpeg');
  }
  
  // 设置默认选项
  const convertOptions = {
    format: options.format || 'jpeg',
    quality: options.quality || 85,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight
  };
  
  console.log(`开始转换 ${originalFilename} (${inputFormat} -> ${convertOptions.format})`);
  
  // 使用 FFmpeg 转换
  const outputBuffer = await convertWithFFmpeg(inputBuffer, inputFormat, convertOptions);
  
  console.log(`转换完成: ${inputBuffer.length} bytes -> ${outputBuffer.length} bytes`);
  
  // 计算压缩率
  const compressionRatio = ((1 - outputBuffer.length / inputBuffer.length) * 100).toFixed(2);
  
  return {
    buffer: outputBuffer,
    originalSize: inputBuffer.length,
    convertedSize: outputBuffer.length,
    compressionRatio: `${compressionRatio}%`,
    originalFormat: inputFormat,
    convertedFormat: convertOptions.format
  };
}

module.exports = {
  convertImage,
  getConverterStatus,
  checkFFmpeg
};
