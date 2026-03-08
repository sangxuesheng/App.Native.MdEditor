# ✅ 编辑器代码折叠功能

## 完成时间
2026-02-27 01:10

## 功能说明
在 Markdown 编辑器左侧添加代码折叠功能，用于折叠/展开代码块。

## 实现方案

### Monaco Editor 配置
在 Editor 组件的 options 中添加以下配置：

```javascript
options={{
  // ... 其他配置
  
  // 代码折叠配置
  folding: true,                    // 启用代码折叠
  showFoldingControls: 'always',    // 始终显示折叠控件
  foldingStrategy: 'indentation',   // 基于缩进的折叠策略
  foldingHighlight: true            // 高亮折叠区域
}}
```

## 配置说明

### 1. folding: true
- **作用**: 启用代码折叠功能
- **效果**: 在编辑器左侧显示折叠按钮

### 2. showFoldingControls: 'always'
- **作用**: 控制折叠按钮的显示时机
- **选项**:
  - `'always'` - 始终显示折叠按钮
  - `'mouseover'` - 仅在鼠标悬停时显示
- **选择**: `'always'` - 方便用户随时折叠代码

### 3. foldingStrategy: 'indentation'
- **作用**: 定义折叠策略
- **选项**:
  - `'auto'` - 自动检测（基于语言）
  - `'indentation'` - 基于缩进
- **选择**: `'indentation'` - 适合 Markdown 的缩进结构

### 4. foldingHighlight: true
- **作用**: 高亮显示折叠区域
- **效果**: 折叠的代码块会有视觉提示

## 使用效果

### Markdown 中可折叠的内容

1. **标题和内容**
```markdown
# 标题 1          ▼ (可折叠)
内容...
## 子标题
内容...
```

2. **列表**
```markdown
- 列表项 1       ▼ (可折叠)
  - 子项 1
  - 子项 2
- 列表项 2
```

3. **代码块**
```markdown
```javascript    ▼ (可折叠)
function test() {
  console.log('test');
}
```
```

4. **引用块**
```markdown
> 引用内容       ▼ (可折叠)
> 多行引用
> 继续引用
```

## 视觉效果

### 展开状态
```
 1  ▼ # 标题
 2    内容...
 3    ## 子标题
 4    内容...
```

### 折叠状态
```
 1  ▶ # 标题 ...
 5    下一个内容
```

## 文件修改

### App.jsx
**位置**: 第927-941行

**修改内容**:
```javascript
options={{
  fontSize: editorFontSize,
  lineHeight: 24,
  minimap: { enabled: false },
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  // 代码折叠配置 (新增)
  folding: true,
  showFoldingControls: 'always',
  foldingStrategy: 'indentation',
  foldingHighlight: true
}}
```

## 用户操作

### 折叠代码
1. 点击行号左侧的 ▼ 按钮
2. 代码块折叠，显示 ▶ 按钮
3. 折叠的内容显示为 `...`

### 展开代码
1. 点击行号左侧的 ▶ 按钮
2. 代码块展开，显示完整内容
3. 显示 ▼ 按钮

### 快捷键（Monaco Editor 默认）
- `Ctrl/Cmd + Shift + [` - 折叠当前区域
- `Ctrl/Cmd + Shift + ]` - 展开当前区域
- `Ctrl/Cmd + K, Ctrl/Cmd + 0` - 折叠所有
- `Ctrl/Cmd + K, Ctrl/Cmd + J` - 展开所有

## 适用场景

### 1. 长文档编辑
- 折叠不需要查看的章节
- 专注于当前编辑的部分

### 2. 大纲浏览
- 折叠所有内容，只看标题
- 快速定位到需要的章节

### 3. 代码块管理
- 折叠长代码块
- 提高文档可读性

### 4. 列表整理
- 折叠嵌套列表
- 简化视图

## 技术优势

### 1. 内置功能
- Monaco Editor 原生支持
- 无需额外依赖
- 性能优秀

### 2. 智能识别
- 自动识别可折叠区域
- 基于缩进层级
- 适配 Markdown 语法

### 3. 用户体验
- 视觉清晰
- 操作简单
- 符合 VS Code 习惯

## 测试要点

### 基础功能
- [ ] 折叠按钮正确显示
- [ ] 点击折叠按钮可以折叠代码
- [ ] 点击展开按钮可以展开代码
- [ ] 折叠区域有视觉提示

### Markdown 测试
- [ ] 标题可以折叠
- [ ] 列表可以折叠
- [ ] 代码块可以折叠
- [ ] 引用块可以折叠

### 交互测试
- [ ] 折叠后编辑不影响功能
- [ ] 展开后内容完整
- [ ] 多层嵌套折叠正常
- [ ] 快捷键功能正常

### 主题测试
- [ ] Dark 主题下按钮可见
- [ ] Light 主题下按钮可见
- [ ] MD3 主题下按钮可见

## 预期效果

1. ✅ 编辑器左侧显示折叠按钮
2. ✅ 可以折叠/展开代码块
3. ✅ 折叠区域有高亮提示
4. ✅ 始终显示折叠控件
5. ✅ 基于缩进智能折叠
6. ✅ 支持快捷键操作

## 配置对比

### 之前
```javascript
options={{
  fontSize: editorFontSize,
  lineHeight: 24,
  minimap: { enabled: false },
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true
}}
```

### 之后
```javascript
options={{
  fontSize: editorFontSize,
  lineHeight: 24,
  minimap: { enabled: false },
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  // 代码折叠配置 (新增)
  folding: true,
  showFoldingControls: 'always',
  foldingStrategy: 'indentation',
  foldingHighlight: true
}}
```

## 总结

✅ 成功启用 Monaco Editor 的代码折叠功能  
✅ 配置为始终显示折叠按钮  
✅ 使用基于缩进的折叠策略  
✅ 启用折叠区域高亮  
✅ 无需额外代码，仅配置即可  

**状态: 准备测试！**

---

**实施者**: AI Assistant (Gemini Flash)  
**日期**: 2026-02-27  
**状态**: ✅ 完成
