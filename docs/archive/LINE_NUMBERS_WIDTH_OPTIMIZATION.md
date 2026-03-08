# ✅ 行号宽度优化

## 完成时间
2026-02-27 02:10

## 问题描述
编辑器左侧的行号区域太宽，占用了过多的编辑空间。

## 解决方案

### 添加行号宽度配置
在 Monaco Editor 配置中添加 `lineNumbersMinChars` 选项。

### 修改内容

**修改前**:
```javascript
options={{
  fontSize: editorFontSize,
  lineHeight: 24,
  // ... 其他配置
  fontLigatures: true,
  // 代码折叠配置
  folding: true,
  // ...
}}
```

**修改后**:
```javascript
options={{
  fontSize: editorFontSize,
  lineHeight: 24,
  // ... 其他配置
  fontLigatures: true,
  // 行号配置
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  // 代码折叠配置
  folding: true,
  // ...
}}
```

## 配置说明

### lineNumbers
- 类型: `'on' | 'off' | 'relative' | 'interval'`
- 值: `'on'`
- 说明: 显示行号

### lineNumbersMinChars
- 类型: `number`
- 值: `3`
- 说明: 行号区域的最小字符宽度
- 默认值: `5`（Monaco Editor 默认）

## 效果对比

### 修改前
```
行号宽度: 约 68px (5个字符宽度)
```

**示例**:
```
     1  # 标题
     2  内容
     3  
    10  更多内容
   100  第100行
```

### 修改后
```
行号宽度: 约 50px (3个字符宽度)
```

**示例**:
```
  1  # 标题
  2  内容
  3  
 10  更多内容
100  第100行
```

## 宽度计算

### 字符宽度
- 1个字符: 约 10-12px（取决于字体）
- 3个字符: 约 30-36px
- 加上左右边距: 约 50-55px

### 对比
- **修改前**: 5个字符 = 约 68px
- **修改后**: 3个字符 = 约 50px
- **节省空间**: 约 18px

## 适用场景

### 3个字符宽度适合
- ✅ 文件行数 < 1000 行（大多数 Markdown 文件）
- ✅ 需要更多编辑空间
- ✅ 小屏幕设备

### 可能不够的情况
- ⚠️ 文件行数 > 999 行
- ⚠️ 行号会显示为 "1000"（4个字符）
- ⚠️ 此时行号区域会自动扩展

## Monaco Editor 行为

### 自动扩展
Monaco Editor 会根据实际行数自动调整行号宽度：
- 行数 < 100: 使用 `lineNumbersMinChars` 设置（3个字符）
- 行数 100-999: 使用 3个字符
- 行数 >= 1000: 自动扩展到 4个字符
- 行数 >= 10000: 自动扩展到 5个字符

### 示例
```javascript
// 文件有 50 行
行号宽度: 3个字符 (  1,  2, ..., 50)

// 文件有 500 行
行号宽度: 3个字符 (  1,  2, ..., 500)

// 文件有 5000 行
行号宽度: 4个字符 (   1,   2, ..., 5000)
```

## 其他行号配置选项

### lineNumbers: 'relative'
显示相对行号（类似 Vim）:
```
  3  上面第3行
  2  上面第2行
  1  上面第1行
  0  当前行 (光标所在)
  1  下面第1行
  2  下面第2行
```

### lineNumbers: 'interval'
每隔一定行数显示行号:
```
  1  第1行
     第2行
     第3行
     第4行
  5  第5行
     第6行
```

### lineNumbers: 'off'
不显示行号（不推荐）

## 建议

### 当前设置（推荐）
```javascript
lineNumbers: 'on',
lineNumbersMinChars: 3
```

**理由**:
- ✅ 适合大多数 Markdown 文件（< 1000 行）
- ✅ 节省编辑空间
- ✅ 行号仍然清晰可读
- ✅ 自动适应更长的文件

### 如果需要更窄
```javascript
lineNumbers: 'on',
lineNumbersMinChars: 2
```

**注意**: 2个字符只适合 < 100 行的文件

### 如果需要更宽
```javascript
lineNumbers: 'on',
lineNumbersMinChars: 4
```

**适用**: 经常编辑超过 1000 行的文件

## 文件修改

### App.jsx
**位置**: 第960-962行

**添加内容**:
```javascript
// 行号配置
lineNumbers: 'on',
lineNumbersMinChars: 3,
```

## 验证

### 检查配置
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src
grep -A2 "行号配置" App.jsx
```

### 预期输出
```javascript
// 行号配置
lineNumbers: 'on',
lineNumbersMinChars: 3,
```

## 视觉效果

### 修改前
```
┌────────┬──────────────────────────────┐
│     1  │ # 标题                       │
│     2  │ 内容                         │
│     3  │                              │
│    10  │ 更多内容                     │
└────────┴──────────────────────────────┘
  68px      编辑区
```

### 修改后
```
┌─────┬─────────────────────────────────┐
│  1  │ # 标题                          │
│  2  │ 内容                            │
│  3  │                                 │
│ 10  │ 更多内容                        │
└─────┴─────────────────────────────────┘
 50px     编辑区（更宽）
```

## 总结

✅ 成功缩窄行号区域宽度  
✅ 从 5个字符减少到 3个字符  
✅ 节省约 18px 编辑空间  
✅ 适合大多数 Markdown 文件  
✅ 自动适应更长的文件  

**状态: 已完成！**

---

**实施者**: AI Assistant (Gemini Flash)  
**日期**: 2026-02-27  
**状态**: ✅ 完成
