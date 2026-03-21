现在的布局有左右布局，仅预览和井编辑，我需要再增加一个专注模式，请针对于专注模式写出你相关的开发计划，以及针对移动端的一些开发计划# 千问Office格式支持实施计划

> 基于项目现状分析制定的完整Office格式支持方案  
> **核心原则：零回归、渐进增强、风险可控**

---

## TL;DR 结论

**可行性评估**：
- **docx/xlsx**：高可行性 ✅
- **pptx读取**：中低可行性 ⚠️（建议降级为实验性功能）

**建议优先级**：docx > xlsx > pptx（实验性）

**架构适配性**：现有 [fileFormats.js](file:///vol4/1000/开发文件夹/mac/app/ui/frontend/src/constants/fileFormats.js) + [App.jsx](file:///vol4/1000/开发文件夹/mac/app/ui/frontend/src/App.jsx) + [server.js](file:///vol4/1000/开发文件夹/mac/app/server/server.js) 架构非常适合扩展Office支持。

**关键优化**：✅ **独立Office组件 + 最小化App.jsx修改 + 安全防护**

---

## 一、项目现状与约束分析

### 1.1 当前架构优势
| 模块 | 现状 | 扩展友好度 |
|------|------|------------|
| **格式分类** | [fileFormats.js](file:///vol4/1000/开发文件夹/mac/app/ui/frontend/src/constants/fileFormats.js) 已有完整分类体系 | ⭐⭐⭐⭐⭐ |
| **文件加载** | [App.jsx](file:///vol4/1000/开发文件夹/mac/app/ui/frontend/src/App.jsx) 统一loadFile入口 | ⭐⭐⭐⭐⭐ |
| **API设计** | [server.js](file:///vol4/1000/开发文件夹/mac/app/server/server.js) 支持文本/二进制/PDF处理 | ⭐⭐⭐⭐ |
| **导出能力** | 已有HTML/MD/PDF/PNG导出功能 | ⭐⭐⭐⭐ |

### 1.2 技术债务风险
- **server.js体积过大**：3319行代码，存在重复路由片段
- **App.jsx文件过大**：核心组件过于臃肿，继续添加功能会降低可维护性
- **缺乏模块化**：新功能直接堆砌会显著增加维护成本
- **性能要求严格**：移动端60FPS流畅体验，触摸响应<50ms

### 1.3 功能约束
- **零回归要求**：现有.md功能必须100%保持不变
- **离线优先**：无CDN依赖，所有依赖本地打包
- **安全要求**：路径校验、防XSS、压缩炸弹防护
- **环境限制**：飞牛NAS Node.js环境可能不完全支持Worker Thread

---

## 二、技术选型与架构设计

### 2.1 核心技术栈
| 功能 | 技术方案 | 理由 |
|------|----------|------|
| **docx读取** | `mammoth` | 轻量级，专为.docx转HTML设计 |
| **docx写入** | `docx` | 功能完整，支持复杂格式 |
| **xlsx读取** | `xlsx` | 行业标准，功能全面 |
| **xlsx写入** | `xlsx` | 同上 |
| **pptx读取** | 降级方案 | 实验性，仅显示文件信息 |
| **HTML净化** | `DOMPurify` | 防XSS攻击，白名单过滤 |
| **异步处理** | 主线程+超时 | MVP阶段避免Worker兼容性问题 |

### 2.2 **独立组件架构设计（关键优化）**
```
app/ui/frontend/
├── src/
│   ├── components/
│   │   ├── office/              # Office专用组件（完全独立）
│   │   │   ├── OfficePreview.jsx    # Office预览组件（含HTML净化）
│   │   │   └── OfficeStatusBanner.jsx # 状态提示组件
│   │   └── ...                  # 现有组件
│   ├── hooks/
│   │   └── useOfficeHandler.js  # Office处理逻辑Hook（完全独立）
│   ├── utils/
│   │   └── officeConverter.js   # Office转换工具
│   ├── constants/
│   │   └── fileFormats.js       # 格式常量（只需扩展）
│   └── App.jsx                  # **仅需最小化修改**
```

### 2.3 **App.jsx最小化修改策略**
```javascript
// app/ui/frontend/src/App.jsx
// 只需要添加这几行，避免文件继续膨胀

// 新增导入（仅2行）
import { useOfficeHandler } from './hooks/useOfficeHandler';
import { isOfficeFormat } from './constants/fileFormats';

function App() {
  // ... 现有代码 ...
  
  // 新增Hook调用（仅1行）
  const { loadOfficeFile, exportToOffice } = useOfficeHandler();
  
  const loadFile = useCallback(async (path) => {
    const format = getFormatFromPath(path);
    
    // 新增Office格式判断（仅3行）
    if (isOfficeFormat(format)) {
      return loadOfficeFile(path, format);
    }
    
    // ... 现有其他格式处理逻辑（完全不变）...
  }, [loadOfficeFile]); // 添加依赖（仅1处修改）
  
  // ... 其他现有代码（完全不变）...
}
```

### 2.4 后端架构分层
```
app/server/
├── server.js              # 只做路由分发
├── routes/
│   ├── fileRoutes.js      # 现有文件相关路由
│   └── officeRoutes.js    # 新增Office路由
└── handlers/
    ├── fileHandler.js     # 文件处理逻辑
    └── officeHandler.js   # Office处理逻辑（主线程+超时）
```

### 2.5 API路径策略
**选择：统一挂载到 `/api/file/office/*`**
- 保持与现有 `/api/file`、`/api/files` 命名一致性
- 逻辑上属于文件操作的子集
- 减少API路径分散带来的维护成本

---

## 三、API契约与安全规范

### 3.1 **统一API响应结构**
```javascript
// 成功响应
{
  "ok": true,
  "format": "docx",
  "content": "提取的文本内容",
  "metadata": {
    "wordCount": 1234,
    "truncated": false,
    "warnings": ["部分格式无法转换"]
  }
}

// 错误响应
{
  "ok": false,
  "code": "OFFICE_TOO_LARGE",
  "message": "文件超过25MB限制",
  "httpStatus": 413
}
```

### 3.2 **错误码与HTTP状态映射**
| 错误码 | HTTP状态 | 说明 |
|--------|----------|------|
| OFFICE_TOO_LARGE | 413 | 文件超过大小限制 |
| OFFICE_PARSE_TIMEOUT | 408 | 解析超时（10秒） |
| OFFICE_FORMAT_UNSUPPORTED | 400 | 不支持的Office格式 |
| ZIP_BOMB_DETECTED | 400 | 检测到压缩炸弹 |
| OFFICE_PARSE_ERROR | 500 | 解析错误 |

### 3.3 **安全防护策略**
#### HTML净化（防止XSS）
```javascript
// app/ui/frontend/src/components/office/OfficePreview.jsx
import DOMPurify from 'dompurify';

const sanitizeHtml = (htmlContent) => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'span'],
    ALLOWED_ATTR: []
  });
};

// 安全渲染
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewContent) }} />
```

#### ZIP炸弹防护（三重限制）
```javascript
// app/server/handlers/officeHandler.js
const OFFICE_SECURITY_LIMITS = {
  MAX_UNCOMPRESSED_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES: 1000,                          // 最多1000个文件
  MAX_COMPRESSION_RATIO: 100                // 压缩比不超过100:1
};

function validateZipSafety(zipBuffer) {
  const stats = getZipStats(zipBuffer);
  if (stats.uncompressedSize > OFFICE_SECURITY_LIMITS.MAX_UNCOMPRESSED_SIZE) {
    throw new SecurityError('ZIP_BOMB_DETECTED');
  }
  if (stats.fileCount > OFFICE_SECURITY_LIMITS.MAX_FILES) {
    throw new SecurityError('TOO_MANY_FILES');
  }
  if (stats.compressionRatio > OFFICE_SECURITY_LIMITS.MAX_COMPRESSION_RATIO) {
    throw new SecurityError('SUSPICIOUS_COMPRESSION');
  }
}
```

#### 宏文件处理
- 检测Office文件是否包含宏
- 如果包含宏，显示明确警告："此文件包含宏，可能存在安全风险"
- 提供"继续加载"或"取消"选项

### 3.4 **数据库配置方案（修正）**
```javascript
// 正确的settings存储方式（key/value键值表）
// 存储结构：{"officeSupport": {"enabled": true, "pptxExperimental": false}}

// 读取配置
const getOfficeSettings = async () => {
  const stmt = await db.prepare('SELECT value FROM settings WHERE key = ?');
  const result = await stmt.get('officeSupport');
  return result ? JSON.parse(result.value) : { enabled: true, pptxExperimental: false };
};

// 更新配置
const updateOfficeSettings = async (settings) => {
  await db.run(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ['officeSupport', JSON.stringify(settings)]
  );
};
```

---

## 四、分阶段实施计划

### Phase 0: 架构准备（2-3天）
**目标：建立安全的扩展基础**

#### 4.1 创建独立Office模块
```javascript
// app/ui/frontend/src/hooks/useOfficeHandler.js
import { useCallback, useRef, useEffect } from 'react';
import { getFormatFromPath } from '../constants/fileFormats';

export const useOfficeHandler = () => {
  const currentLoadController = useRef(null);
  const officeDataRef = useRef(null);
  
  const loadOfficeFile = useCallback(async (path, format) => {
    // 立即显示加载状态
    setStatus('正在加载Office文档...');
    setContent('[正在加载文档内容...]');
    
    // 取消之前的请求
    if (currentLoadController.current) {
      currentLoadController.current.abort();
    }
    
    const controller = new AbortController();
    currentLoadController.current = controller;
    
    try {
      const response = await fetch(`/api/file/office/extract?path=${encodeURIComponent(path)}`, {
        signal: controller.signal
      });
      const data = await response.json();
      
      if (data.ok) {
        setContent(data.content);
        setCurrentFileFormat(format);
        return true;
      } else {
        // 降级到二进制模式
        return await doLoadFile(path, FORMAT_UNSUPPORTED, 'binary');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Office加载失败，降级到二进制模式:', error);
        return await doLoadFile(path, FORMAT_UNSUPPORTED, 'binary');
      }
    }
  }, []);
  
  // 内存清理
  useEffect(() => {
    return () => {
      if (currentLoadController.current) {
        currentLoadController.current.abort();
      }
      officeDataRef.current = null;
    };
  }, []);
  
  return { loadOfficeFile };
};
```

#### 4.2 Office预览组件（含安全净化）
```javascript
// app/ui/frontend/src/components/office/OfficePreview.jsx
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

const sanitizeHtml = (htmlContent) => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'span'],
    ALLOWED_ATTR: []
  });
};

export const OfficePreview = ({ content, format }) => {
  const [sanitizedContent, setSanitizedContent] = useState('');
  
  useEffect(() => {
    if (content) {
      setSanitizedContent(sanitizeHtml(content));
    }
  }, [content]);
  
  return (
    <div className="office-preview">
      {format === 'docx' && (
        <div className="office-preview-warning">
          <AlertTriangle size={16} />
          <span>Word文档转换预览（可能有格式损失）</span>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
};
```

#### 4.3 后端Office处理器
```javascript
// app/server/handlers/officeHandler.js
const mammoth = require('mammoth');
const xlsx = require('xlsx');

class OfficeHandler {
  static async extractText(filePath, format) {
    // 超时机制（10秒）
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OFFICE_PARSE_TIMEOUT')), 10000);
    });
    
    try {
      const result = await Promise.race([
        this.parseOfficeFile(filePath, format),
        timeoutPromise
      ]);
      return { ok: true, content: result, format };
    } catch (error) {
      if (error.message === 'OFFICE_PARSE_TIMEOUT') {
        return { ok: false, code: 'OFFICE_PARSE_TIMEOUT', message: 'Office文件解析超时' };
      }
      return { ok: false, code: 'OFFICE_PARSE_ERROR', message: error.message };
    }
  }
  
  static async parseOfficeFile(filePath, format) {
    if (format === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (format === 'xlsx') {
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames.slice(0, 3); // 限制3个sheet
      
      let textContent = '';
      sheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const limitedData = jsonData.slice(0, 1000); // 限制1000行
        textContent += `\nSheet: ${name}\n`;
        textContent += limitedData.map(row => row.join('\t')).join('\n');
      });
      
      return textContent;
    }
  }
}
```

### Phase 1: DOCX MVP（5-7天）
**目标：可用的docx读写能力**

#### 4.4 格式常量扩展
```javascript
// app/ui/frontend/src/constants/fileFormats.js
export const FORMAT_DOCX = 'docx';
export const FORMAT_XLSX = 'xlsx';

export const EXT_TO_FORMAT = {
  // ... 现有格式
  '.docx': FORMAT_DOCX,
  '.xlsx': FORMAT_XLSX
};

export const SUPPORTED_EXTENSIONS = new Set([
  ...Object.keys(EXT_TO_FORMAT),
  '.docx', '.xlsx'
]);

export const isOfficeFormat = (format) => {
  return ['docx', 'xlsx'].includes(format);
};
```

#### 4.5 DOCX导出实现（动态加载）
```javascript
// app/ui/frontend/src/hooks/useOfficeHandler.js
const exportAsDocx = async (content, fileName) => {
  setStatus('加载Word导出模块...');
  
  try {
    // Vite动态导入（正确语法）
    const { Document, Packer, Paragraph, HeadingLevel } = await import('docx');
    
    const paragraphs = [];
    content.split('\n').forEach(line => {
      if (line.startsWith('# ')) {
        paragraphs.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 }));
      } else if (line.startsWith('## ')) {
        paragraphs.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 }));
      } else if (line.trim() === '') {
        // 空行
      } else {
        paragraphs.push(new Paragraph(line));
      }
    });
    
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    // 下载逻辑
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('DOCX导出失败:', error);
    showToast('Word导出失败，请稍后重试', 'error');
  } finally {
    setStatus('就绪');
  }
};
```

### Phase 2: XLSX增强（3-5天）
**目标：基础表格读写能力**

#### 4.6 XLSX读取限制
```javascript
// app/server/handlers/officeHandler.js
static async parseOfficeFile(filePath, format) {
  // ... docx处理 ...
  } else if (format === 'xlsx') {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames.slice(0, 3); // 限制3个sheet
    
    let textContent = '';
    sheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      const limitedData = jsonData.slice(0, 1000); // 限制1000行
      textContent += `\nSheet: ${name}\n`;
      textContent += limitedData.map(row => row.join('\t')).join('\n');
    });
    
    return textContent;
  }
}
```

### Phase 3: PPTX实验（5-7天，可选）
**目标：实验性文件信息展示**

#### 4.7 PPTX降级方案
- **不提供预览**：仅显示文件基本信息（大小、创建时间等）
- **明确标识**：在文件树中显示"实验性"标记
- **用户提示**："PPTX文件暂不支持预览，可作为二进制文件查看"

---

## 五、性能优化策略

### 5.1 **缓存策略（双阈值）**
```javascript
// app/ui/frontend/src/hooks/useOfficeHandler.js
const MAX_CACHE_ITEMS = 20;
const MAX_CACHE_BYTES = 30 * 1024 * 1024; // 30MB

class LRUCache {
  constructor(maxItems, maxBytes) {
    this.cache = new Map();
    this.maxItems = maxItems;
    this.maxBytes = maxBytes;
    this.totalBytes = 0;
  }
  
  set(key, value) {
    const bytes = new Blob([JSON.stringify(value)]).size;
    
    // 清理空间
    while (this.cache.size >= this.maxItems || 
           this.totalBytes + bytes > this.maxBytes) {
      const firstKey = this.cache.keys().next().value;
      const firstValue = this.cache.get(firstKey);
      this.totalBytes -= new Blob([JSON.stringify(firstValue)]).size;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
    this.totalBytes += bytes;
  }
  
  get(key) {
    return this.cache.get(key);
  }
}

const fileContentCache = new LRUCache(MAX_CACHE_ITEMS, MAX_CACHE_BYTES);
```

### 5.2 **文件切换优化**
```javascript
// 防抖机制（100ms）
const switchFileDebounce = useRef(null);

const handleFileSwitch = useCallback((filePath) => {
  if (switchFileDebounce.current) {
    clearTimeout(switchFileDebounce.current);
  }
  
  switchFileDebounce.current = setTimeout(() => {
    loadFile(filePath);
  }, 100);
}, [loadFile]);
```

### 5.3 **渲染性能优化**
```javascript
// 大文件优化
const monacoOptions = {
  ...existingOptions,
  minimap: { enabled: content.length < 50000 },
  folding: content.length < 100000,
};

// 预览区防抖
useEffect(() => {
  const timer = setTimeout(() => {
    if (previewContentRef.current !== content) {
      renderPreview(content, currentFileFormat);
    }
  }, 50);
  return () => clearTimeout(timer);
}, [content, currentFileFormat]);
```

### 5.4 **Office文件针对性布局策略**
基于项目[移动端60FPS流畅体验](#a337267d-741c-4dd0-89ff-36f015cc9ce1)要求和Office文件特殊性，实施以下**Office文件布局规范**：

#### **默认布局：仅预览模式（preview-only）**
```javascript
// app/ui/frontend/src/App.jsx
const getEffectiveLayout = useCallback((format, userPreferred)))) => {
  // Office文件默认使用仅预览模式
  if (isOfficeFormat(format)) {
    return 'preview-only';
  }
  
  // 其他格式保持原有逻辑
  if (userPreferredLayout === 'auto') {
    return isMobile ? 'vertical' : 'vertical';
  }
  return userPreferredLayout;
}, []);
```

#### **严格禁用双栏布局**
- **不提供左右布局选项**：避免性能影响和用户误解
- **明确禁用UI控件**：在布局切换中禁用vertical选项

#### **用户控制选项（预览↔编辑切换）**
```jsx
{/* Office文件布局切换控件 */}
{isOfficeFormat(currentFileFormat) && (
  <div className="office-layout-controls">
    <button 
      onClick={() => setLayout('preview-only')}
      className={layout === 'preview-only' ? 'active' : ''}
    >
      预览模式
    </button>
    <button 
      onClick={() => setLayout('editor-only')}
      className={layout === 'editor-only' ? 'active' : ''}
    >
      编辑模式
    </button>
    {/* 严格禁用左右布局 */}
    <button disabled title="Office文件不支持双栏布局">
      双栏布局
    </button>
  </div>
)}
```

#### **明确转换预览提示**
``jsx
// app/ui/frontend/src/components/office/OfficePreview.jsx
export const OfficePreview = ({ content, format }) => {
  return (
    <div className={`office-preview ${format}`}>
      {/* Office文件专属提示 - 必须显示 */}
      <div className="office-preview-header">
        <AlertTriangle size={16} />
        <span>
          {format === 'docx' ? 'Word文档转换预览' : 'Excel表格转换预览'}
          （可能有格式损失）
        </span>
      </div>
      
      {/* 安全渲染内容 */}
      <div 
        className="office-content" 
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} 
      />
    </div>
  );
};
```

#### **布局状态管理**
```javascript
// app/ui/frontend/src/App.jsx
const [layout, setLayout] = useState('auto');

useEffect(() => {
  const format = getFormatFromPath(currentFilePath);
  if (isOfficeFormat(format)) {
    // Office文件强制使用preview-only，除非用户明确切换到编辑模式
    if (layout !== 'editor-only') {
      setLayout('preview-only');
    }
  }
}, [currentFilePath, layout]);
```

#### **移动端特别考虑**
- **简化交互控件**：使用底部弹出菜单而非顶部按钮组  
- **性能优先保障**：大Office文件自动降级到纯文本模式
- **60FPS流畅体验**：确保布局切换和渲染不造成卡顿

#### **导出场景处理**
- **从Markdown导出的DOCX文件**：仍按相同规则处理，默认进入预览模式
- **明确功能区分**：显示"这是从Markdown导出的Word文档，如需编辑请修改原始.md文件"

#### **用户体验流程**
```
用户打开.docx文件
    ↓
自动进入"仅预览模式"
    ↓
显示"转换预览，可能有格式损失"警告
    ↓
用户可选择：
   - 继续预览（默认）
   - 切换到"编辑模式"查看提取的文本
   - 导出为其他格式
   - 返回编辑原始.md文件
```

#### **技术实现约束**
- **禁止在App.jsx中堆砌布局逻辑**：所有Office布局逻辑封装在独立组件中
- **最小化核心文件修改**：App.jsx仅添加必要的布局判断（≤5行）
- **动态加载优化**：布局切换控件按需渲染，避免影响初始性能
- **资源清理保障**：组件卸载时清理布局相关状态和引用

---

## 六、回滚与兼容性保障

### 6.1 **特性开关控制**
```javascript
// 前端动态控制
const { officeSupport } = await getOfficeSettings();

if (!officeSupport.enabled) {
  // 降级到二进制模式
  return await doLoadFile(path, FORMAT_UNSUPPORTED, 'binary');
}
```

### 6.2 **回滚行为**
- **开关关闭**：Office文件自动降级为二进制查看模式
- **接口兼容**：旧API保持向后兼容，不影响现有功能
- **数据清理**：清除Office相关缓存和设置数据

### 6.3 **环境兼容性**
- **Worker检测**：检测Node.js环境是否支持Worker Thread
- **降级方案**：不支持时使用主线程+超时机制
- **性能监控**：添加性能指标监控，确保不影响核心体验

---

## 七、测试与验证策略

### 7.1 **自动化测试**
```javascript
// 单元测试示例
describe('OfficeHandler', () => {
  test('should reject files larger than 25MB', async () => {
    const result = await officeHandler.extract('/large.docx');
    expect(result.code).toBe('OFFICE_TOO_LARGE');
  });
  
  test('should timeout after 10 seconds', async () => {
    // 模拟超时场景
  });
  
  test('should sanitize HTML content', () => {
    const maliciousHtml = '<script>alert("xss")</script><p>safe</p>';
    const cleanHtml = sanitizeHtml(maliciousHtml);
    expect(cleanHtml).not.toContain('<script>');
    expect(cleanHtml).toContain('<p>safe</p>');
  });
});

// 端到端测试
// 切换文件压力测试脚本
const stressTest = async () => {
  const files = ['/test1.docx', '/test2.xlsx', '/test3.docx'];
  for (let i = 0; i < 30; i++) {
    const file = files[i % files.length];
    await loadFile(file);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```

### 7.2 **回归测试清单**
- [ ] 所有现有.md功能100%正常
- [ ] 文件树性能不受影响（大量文件场景）
- [ ] 内存占用增加可控（<10%）
- [ ] 移动端性能保持60FPS
- [ ] 授权目录与路径安全回归
- [ ] 并发回归（同时开多个大文件解析）
- [ ] **App.jsx修改最小化验证**（确保只修改了必要的几行）
- [ ] **安全防护验证**（XSS、ZIP炸弹、宏文件）

### 7.3 **性能验收指标**
- **文件切换响应时间**：< 100ms
- **大文件切换首反馈**：< 200ms
- **内存增加**：< 10%
- **连续切换30次**：无明显掉帧
- **峰值内存**：可回落，不持续爬升

---

## 八、工期与资源评估

| 阶段 | 范围 | 保守估计 | 乐观估计 |
|------|------|----------|----------|
| **Phase 0** | 架构准备（独立模块+安全防护） | 2-3天 | 2天 |
| **Phase 1** | DOCX MVP（读写+安全+性能） | 5-7天 | 5天 |
| **Phase 2** | XLSX增强（限制+优化） | 3-5天 | 3天 |
| **Phase 3** | PPTX实验（降级方案） | 5-7天 | 5天 |
| **总计** | 完整方案 | **15-22天** | **15天** |

**建议策略**：先交付Phase 0+1（DOCX MVP，7-10天），收集用户反馈后再决定是否继续投入。

---

## 九、风险控制与回滚

### 9.1 **风险缓解措施**
- **特性开关**：通过数据库配置动态启停
- **模块隔离**：Office逻辑完全独立，不影响核心链路
- **监控机制**：添加性能指标和错误监控
- **回滚方案**：快速禁用Office支持或回退到旧版本
- **安全防护**：XSS净化、ZIP炸弹防护、宏文件检测

### 9.2 **上线策略**
1. **内部测试**：先在开发环境充分验证
2. **灰度发布**：小范围用户试用
3. **监控观察**：收集性能数据和用户反馈
4. **全面推广**：确认稳定后全量发布

---

## 十、附录：关键实现细节

### 10.1 **Worker Thread备选方案**
```
// officeWorker.js - 实际可运行的Worker（Phase B优化）
const { parentPort, workerData } = require('worker_threads');
const mammoth = require('mammoth');

parentPort.on('message', async (data) => {
  try {
    const { filePath, format, operation } = data;
    let result;
    
    if (operation === 'extract' && format === 'docx') {
      const docResult = await mammoth.extractRawText({ path: filePath });
      result = { success: true, content: docResult.value };
    }
    
    parentPort.postMessage(result);
  } catch (error) {
    parentPort.postMessage({ 
      success: false, 
      error: { 
        code: 'OFFICE_PARSE_ERROR', 
        message: error.message 
      } 
    });
  }
});
```

### 10.2 **动态导入实现**
```
// Vite动态导入（正确语法）
const { Document, Packer } = await import('docx');
const xlsx = await import('xlsx');
```

### 10.3 **内存清理**
```
useEffect(() => {
  return () => {
    // 清理缓存
    fileContentCache.clear();
    // 清理大文件引用
    officeDataRef.current = null;
    // 取消请求
    if (currentLoadController.current) {
      currentLoadController.current.abort();
    }
  };
}, []);
```

### 10.4 **App.jsx实际改动清单**
- **导入语句**：`import { useOfficeHandler } from './hooks/useOfficeHandler';`
- **Hook调用**：`const { loadOfficeFile } = useOfficeHandler();`
- **格式判断**：`if (isOfficeFormat(format)) { return loadOfficeFile(path, format); }`
- **状态管理**：添加loading和error状态处理
- **布局切换**：Office文件默认editor-only布局
- **导出集成**：在exportContent函数中添加Office导出分支
- **总计约15-20行**，保持最小侵入原则

---

**文档版本**：v2.0  
**最后更新**：2026-03-19  
**负责人**：开发团队  
**状态**：待实施