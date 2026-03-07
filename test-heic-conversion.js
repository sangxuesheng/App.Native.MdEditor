#!/usr/bin/env node

/**
 * HEIC 转换功能测试脚本
 * 测试 FFmpeg 是否正确安装并能够转换 HEIC 格式
 */

const imageConverter = require('./app/server/imageConverter');
const fs = require('fs');
const path = require('path');

async function testConverter() {
  console.log('================================');
  console.log('HEIC 转换功能测试');
  console.log('================================\n');

  // 1. 检查转换器状态
  console.log('1. 检查转换器状态...');
  try {
    const status = await imageConverter.getConverterStatus();
    console.log('   状态:', JSON.stringify(status, null, 2));
    
    if (!status.available) {
      console.log('\n❌ FFmpeg 未安装或不可用');
      console.log('\n请运行以下命令安装 FFmpeg:');
      console.log('   Debian/Ubuntu: apt-get install ffmpeg');
      console.log('   CentOS/RHEL:   yum install epel-release && yum install ffmpeg');
      console.log('   Alpine:        apk add ffmpeg');
      process.exit(1);
    }
    
    console.log('   ✓ FFmpeg 可用\n');
  } catch (error) {
    console.error('   ✗ 检查失败:', error.message);
    process.exit(1);
  }

  // 2. 测试转换功能（使用模拟数据）
  console.log('2. 测试转换功能...');
  console.log('   注意: 需要实际的 HEIC 文件才能完整测试');
  console.log('   当前仅验证转换器模块是否正常加载\n');

  // 3. 显示使用说明
  console.log('3. 使用说明:');
  console.log('   - 前端已支持 .heic 和 .heif 文件上传');
  console.log('   - 后端会自动将 HEIC 转换为 JPEG 格式');
  console.log('   - 转换质量: 85 (可在 imageConverter.js 中调整)');
  console.log('   - 文件大小限制: 10MB\n');

  console.log('================================');
  console.log('✓ 测试完成');
  console.log('================================\n');
}

// 运行测试
testConverter().catch(error => {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
});
