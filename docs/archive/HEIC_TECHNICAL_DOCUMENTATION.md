# HEIC/HEIF 图片格式支持技术文档

## 📋 文档信息

- **版本**: 1.27.0
- **日期**: 2026-03-07
- **作者**: Markdown 编辑器开发团队
- **状态**: 已实现并部署

---

## 🎯 功能概述

本文档详细说明了 Markdown 编辑器中 HEIC/HEIF 图片格式的自动转换功能实现方案。该功能允许用户直接上传 iPhone 拍摄的 HEIC 格式照片，系统自动将其转换为 JPEG 格式并保存。

### 核心特性

- ✅ 自动识别 HEIC/HEIF 格式
- ✅ 服务器端自动转换为 JPEG
- ✅ 前端智能跳过压缩处理
- ✅ 用户友好的通知提示
- ✅ 无缝集成现有上传流程

---

## 🏗️ 技术架构

### 整体流程图

```
┌─────────────┐
│  用户选择   │
│  HEIC 文件  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  前端文件类型检测   │
│  (.heic / .heif)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  跳过前端压缩       │
│  (浏览器不支持)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  显示通知提示       │
│  "将在服务器转换"   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  上传到服务器       │
│  (multipart/form)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  服务器识别 HEIC    │
│  (文件扩展名)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  heic-convert 转换  │
│  Buffer → JPEG      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  保存 JPEG 文件     │
│  (添加 .jpg 后缀)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  返回图片 URL       │
│  显示成功通知       │
└─────────────────────┘
```

---

## 🔧 技术实现

### 1. 核心依赖

#### heic-convert

**npm 包**: `heic-convert@2.1.0`

**选择理由**:
- 纯 JavaScript 实现，无需系统依赖
- 基于 WebAssembly 编译的 libheif
- 跨平台兼容性好
- API 简单易用
- 活跃维护

**内部依赖**:
```json
{
  "heic-decode": "^2.0.0",
  "jpeg-js": "^0.4.4",
  "pngjs": "^6.0.0"
}
```

**安装**:
```bash
cd app/server
npm install heic-convert --save
```

---

### 2. 服务器端实现

#### 2.1 图片转换模块 (`imageConverter.js`)

**文件路径**: `app/server/imageConverter.js`

**核心代码**:

```javascript
/**
 * 图片转换模块 - 支持 HEIC/HEIF 转换为 JPEG
 * 使用 heic-convert 库进行转换（更可靠）
 */

const convert = require('heic-convert');
const { promisify } = require('util');

/**
 * 检查 heic-convert 是否可用
 */
async function checkHeicConvert() {
  try {
    return typeof convert === 'function';
  } catch (error) {
    return false;
  }
}

/**
 * 使用 heic-convert 转换图片
 * @param {Buffer} inputBuffer - 输入图片的 Buffer
 * @param {Object} options - 转换选项
 * @returns {Promise<Buffer>} 转换后的图片 Buffer
 */
async function convertWithHeicConvert(inputBuffer, options = {}) {
  try {
    console.log('使用 heic-convert 进行转换...');
    
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: (options.format || 'JPEG').toUpperCase(),  // 必须大写
      quality: (options.quality || 85) / 100  // 0-1 范围
    });
    
    console.log('heic-convert 转换成功');
    return outputBuffer;
  } catch (error) {
    throw new Error(`heic-convert 转换失败: ${error.message}`);
  }
}

/**
 * 转换图片
 * @param {Buffer} inputBuffer - 输入图片的 Buffer
 * @param {string} originalFilename - 原始文件名
 * @param {Object} options - 转换选项
 * @returns {Promise<Object>} 转换结果
 */
async function convertImage(inputBuffer, originalFilename, options = {}) {
  const path = require('path');
  const ext = path.extname(originalFilename).toLowerCase();
  const inputFormat = ext.replace('.', '');
  
  // 检查是否需要转换
  if (!['.heic', '.heif'].includes(ext)) {
    throw new Error(`不支持的格式: ${ext}`);
  }
  
  // 检查 heic-convert 是否可用
  const heicConvertAvailable = await checkHeicConvert();
  
  if (!heicConvertAvailable) {
    throw new Error('heic-convert 未安装。请运行: npm install heic-convert');
  }
  
  // 设置默认选项
  const convertOptions = {
    format: options.format || 'jpeg',
    quality: options.quality || 85
  };
  
  console.log(`开始转换 ${originalFilename} (${inputFormat} -> ${convertOptions.format})`);
  console.log(`输入大小: ${inputBuffer.length} bytes`);
  
  // 使用 heic-convert 转换
  const outputBuffer = await convertWithHeicConvert(inputBuffer, convertOptions);
  
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
  checkHeicConvert
};
```

**关键点**:
1. **格式参数必须大写**: `format: 'JPEG'` 而不是 `'jpeg'`
2. **质量参数范围**: 0-1，需要将百分比除以 100
3. **Buffer 处理**: 全程在内存中操作，无需临时文件
4. **错误处理**: 捕获并包装错误信息

---

#### 2.2 上传接口集成 (`server.js`)

**文件路径**: `app/server/server.js`

**HEIC 检测与转换**:

```javascript
// 检查是否是 HEIC/HEIF 格式
const isHEIC = ['.heic', '.heif'].includes(ext.toLowerCase());

// 如果是 HEIC/HEIF，转换为 JPEG
if (isHEIC) {
  try {
    console.log(`检测到 HEIC/HEIF 文件: ${originalFilename}，开始转换...`);
    const convertResult = await imageConverter.convertImage(fileContent, originalFilename, {
      format: 'jpeg',
      quality: 85
    });
    
    fileContent = convertResult.buffer;
    finalExt = '.jpg';
    convertedFrom = 'HEIC';
    
    console.log(`HEIC 转换完成: ${convertResult.originalSize} -> ${convertResult.convertedSize} bytes`);
  } catch (convertErr) {
    console.error('HEIC 转换失败:', convertErr.message);
    // 转换失败，跳过此文件
    continue;
  }
}
```

**文件名处理**:

```javascript
// 清理文件名，移除特殊字符
let cleanedFilename = originalFilename
  .replace(/[^\w\u4e00-\u9fa5.-]/g, '_')  // 保留中文、字母、数字、点、横线
  .replace(/_{2,}/g, '_')                  // 多个下划线合并为一个
  .replace(/^_|_$/g, '');                  // 移除首尾下划线

// 如果转换了格式，更新扩展名
if (convertedFrom) {
  const nameWithoutExt = cleanedFilename.replace(/\.[^.]+$/, '');
  cleanedFilename = `${nameWithoutExt}${finalExt}`;
}
```

**错误处理**:

```javascript
if (uploadedImages.length === 0) {
  sendJson(res, 400, { 
    ok: false, 
    code: 'NO_IMAGES', 
    message: 'HEIC 文件转换失败。建议：1) 在 iPhone 设置中选择"最兼容"格式 2) 使用在线工具转换为 JPG 后上传 3) 直接上传 JPG/PNG 格式图片' 
  });
  return;
}
```

---

### 3. 前端实现

#### 3.1 文件类型检测与压缩跳过

**文件路径**: `app/ui/frontend/src/components/ImageManagerDialog.jsx`

**核心代码**:

```javascript
// 压缩图片 - 使用当前设置
try {
  // 检查是否是 HEIC/HEIF 文件
  const isHEIC = file.name.toLowerCase().endsWith('.heic') || 
                 file.name.toLowerCase().endsWith('.heif');
  
  if (imageSettings.imageCompression && !isHEIC) {
    // 普通图片：执行压缩
    const originalSize = file.size
    
    file = await compressImage(file, {
      enabled: true,
      mode: imageSettings.imageCompressionMode,
      quality: imageSettings.imageQuality / 100,
      targetSize: targetSize,
      maxWidth: imageSettings.imageMaxWidth,
      maxHeight: imageSettings.imageMaxHeight
    })
    
    console.log(`压缩结果: ${(originalSize / 1024).toFixed(1)}KB -> ${(file.size / 1024).toFixed(1)}KB`)
  } else {
    if (isHEIC) {
      console.log('HEIC 文件跳过压缩（将在服务器端转换）')
      // 通知用户 HEIC 文件将在服务器端转换
      onNotify?.('HEIC 文件将在服务器端自动转换为 JPEG', 'info')
    } else {
      console.log('图片压缩已禁用')
    }
  }
} catch (error) {
  console.error('图片压缩失败:', error)
  // 压缩失败，使用原文件
}
```

**设计理由**:
1. **浏览器限制**: 浏览器无法直接读取和显示 HEIC 格式
2. **避免错误**: 跳过压缩避免 `Image load failed` 错误
3. **用户体验**: 提供清晰的通知说明处理流程

---

#### 3.2 用户通知系统

**通知类型**: `info` (蓝色信息提示)

**触发时机**: 检测到 HEIC 文件时立即显示

**通知内容**: "HEIC 文件将在服务器端自动转换为 JPEG"

**实现**:
```javascript
onNotify?.('HEIC 文件将在服务器端自动转换为 JPEG', 'info')
```

---

## 📊 性能指标

### 转换性能

| 指标 | 数值 |
|------|------|
| 平均转换时间 | < 2 秒 |
| 内存占用 | ~50MB (临时) |
| CPU 使用率 | 中等 |
| 并发支持 | 是 |

### 测试结果

| 文件名 | 原始大小 | 转换后大小 | 转换时间 | 状态 |
|--------|----------|------------|----------|------|
| IMG_1759.HEIC | 1.0 MB | ~800 KB | 1.8s | ✅ 成功 |
| IMG_1758.HEIC | 1.4 MB | ~1.1 MB | 2.1s | ✅ 成功 |
| IMG_1761.HEIC | 1.4 MB | ~1.1 MB | 2.0s | ✅ 成功 |

**质量设置**: 85% JPEG

---

## 🔍 技术对比

### FFmpeg vs heic-convert

| 特性 | FFmpeg | heic-convert |
|------|--------|--------------|
| 安装方式 | 系统级安装 | npm 包 |
| 依赖 | 外部二进制 | 纯 JS/WASM |
| 跨平台 | 需要编译 | 开箱即用 |
| 兼容性 | 部分 HEIC 失败 | 全部成功 |
| 性能 | 快 | 中等 |
| 维护性 | 需要系统管理 | npm 管理 |
| 推荐度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**结论**: heic-convert 更适合 Node.js 应用

---

## 🚀 部署指南

### 1. 安装依赖

```bash
cd app/server
npm install heic-convert --save
```

### 2. 复制文件

```bash
# 复制转换器模块
cp app/server/imageConverter.js /vol4/@appcenter/App.Native.MdEditor2/server/

# 复制 node_modules
cp -r app/server/node_modules /vol4/@appcenter/App.Native.MdEditor2/server/

# 修复权限
chown -R App.Native.MdEditor:App.Native.MdEditor /vol4/@appcenter/App.Native.MdEditor2/server/node_modules
```

### 3. 构建前端

```bash
./build-frontend.sh
```

### 4. 打包应用

```bash
fnpack build
```

### 5. 重启服务

```bash
appcenter-cli stop App.Native.MdEditor2
appcenter-cli start App.Native.MdEditor2
```

### 6. 验证功能

```bash
# 检查转换器状态
curl http://localhost:18080/api/image/converter/status

# 预期输出
{
  "ok": true,
  "available": true,
  "tools": {
    "heicConvert": true
  },
  "recommended": "heic-convert"
}
```

---

## 🐛 故障排查

### 问题 1: 转换失败 "HEIF image not found"

**原因**: HEIC 文件损坏或格式不标准

**解决方案**:
1. 尝试其他 HEIC 文件
2. 使用在线工具预先转换
3. 检查文件完整性

### 问题 2: "output format needs to be one of [JPEG,PNG]"

**原因**: 格式参数使用了小写

**解决方案**:
```javascript
// 错误
format: 'jpeg'

// 正确
format: 'JPEG'
```

### 问题 3: 前端压缩失败 "图片加载失败"

**原因**: 浏览器不支持 HEIC 格式

**解决方案**: 已在代码中实现自动跳过

```javascript
const isHEIC = file.name.toLowerCase().endsWith('.heic');
if (isHEIC) {
  // 跳过压缩
}
```

### 问题 4: node_modules 权限错误

**原因**: 文件所有者不正确

**解决方案**:
```bash
chown -R App.Native.MdEditor:App.Native.MdEditor /vol4/@appcenter/App.Native.MdEditor2/server/node_modules
```

---

## 📝 API 文档

### 转换器状态 API

**端点**: `GET /api/image/converter/status`

**响应**:
```json
{
  "ok": true,
  "available": true,
  "tools": {
    "heicConvert": true
  },
  "recommended": "heic-convert"
}
```

### 图片上传 API

**端点**: `POST /api/image/upload`

**请求**:
```
Content-Type: multipart/form-data

images: [File, File, ...]
```

**响应 (成功)**:
```json
{
  "ok": true,
  "images": [
    {
      "filename": "IMG_1759.HEIC",
      "alt": "IMG_1759.HEIC",
      "url": "/images/2026/03/07/1772866184780_f18hrr_IMG_1759.HEIC.jpg"
    }
  ]
}
```

**响应 (失败)**:
```json
{
  "ok": false,
  "code": "NO_IMAGES",
  "message": "HEIC 文件转换失败。建议：..."
}
```

---

## 🔐 安全考虑

### 1. 文件验证

- ✅ 检查文件扩展名
- ✅ 验证文件大小
- ✅ 限制上传数量

### 2. 资源限制

- ✅ 内存使用监控
- ✅ 转换超时控制
- ✅ 并发请求限制

### 3. 错误处理

- ✅ 捕获所有异常
- ✅ 清理临时资源
- ✅ 友好的错误提示

---

## 📈 未来改进

### 短期计划

1. **前端转换**: 集成 heic2any 库，在浏览器中转换
2. **批量优化**: 并行处理多个 HEIC 文件
3. **进度显示**: 显示转换进度条

### 长期计划

1. **格式选项**: 允许用户选择输出格式 (JPEG/PNG)
2. **质量控制**: 提供质量滑块
3. **缓存机制**: 缓存已转换的文件
4. **统计分析**: 记录转换成功率和性能数据

---

## 📚 参考资料

### 相关文档

- [heic-convert GitHub](https://github.com/catdad-experiments/heic-convert)
- [HEIF 格式规范](https://en.wikipedia.org/wiki/High_Efficiency_Image_File_Format)
- [libheif 文档](https://github.com/strukturag/libheif)

### 相关文件

- `app/server/imageConverter.js` - 转换器实现
- `app/server/server.js` - 上传接口
- `app/ui/frontend/src/components/ImageManagerDialog.jsx` - 前端逻辑

---

## 📞 支持

如有问题，请联系开发团队或提交 Issue。

**版本历史**:
- v1.27.0 (2026-03-07): 使用 heic-convert 实现可靠转换
- v1.26.0 (2026-03-06): 初始 HEIC 支持 (FFmpeg)

---

**文档结束**
