# 代码折叠功能测试指南

## 问题诊断

如果标题折叠功能没有生效，可能的原因：

### 1. Monaco Editor 的 Markdown 折叠限制
Monaco Editor 对 Markdown 的折叠支持可能不如预期。默认情况下，它主要支持：
- 代码块折叠（```）
- 列表折叠（有缩进的列表）
- 而**不一定支持标题折叠**

### 2. 解决方案

#### 方案 A：使用代码块和列表（当前可用）
这些在 Monaco Editor 中是可以折叠的：

**代码块**:
```markdown
```javascript
function test() {
  console.log('test');
}
```
```

**缩进列表**:
```markdown
- 项目 1
  - 子项 1.1
  - 子项 1.2
- 项目 2
```

#### 方案 B：自定义折叠提供器（需要额外开发）
如果需要标题折叠，需要：
1. 注册自定义的 Markdown 折叠提供器
2. 实现标题识别逻辑
3. 计算折叠范围

## 当前配置

```javascript
options={{
  folding: true,                        // 启用折叠
  showFoldingControls: 'always',        // 始终显示控件
  foldingStrategy: 'auto',              // 自动策略
  foldingHighlight: true,               // 高亮折叠区域
  foldingMaximumRegions: 5000,          // 最大折叠区域
  unfoldOnClickAfterEndOfLine: true     // 点击行尾展开
}}
```

## 测试步骤

### 测试 1：代码块折叠（应该可用）

创建以下内容：
```markdown
这是一些文本

```javascript
function hello() {
  console.log('Hello');
  console.log('World');
}
```

更多文本
```

**预期结果**：代码块左侧应该有折叠按钮

### 测试 2：列表折叠（应该可用）

创建以下内容：
```markdown
- 主列表项 1
  - 子项 1.1
  - 子项 1.2
    - 子子项 1.2.1
- 主列表项 2
```

**预期结果**：有缩进的列表项应该可以折叠

### 测试 3：标题折叠（可能不可用）

创建以下内容：
```markdown
# 第一章

这是第一章的内容

## 1.1 小节

小节内容

# 第二章

第二章内容
```

**实际情况**：Monaco Editor 可能不支持标题折叠

## 如果需要标题折叠功能

### 选项 1：使用其他编辑器组件
- CodeMirror 6 - 更好的 Markdown 支持
- Ace Editor - 支持自定义折叠

### 选项 2：实现自定义折叠提供器

需要在 `handleEditorMount` 中添加：

```javascript
const handleEditorMount = (editor) => {
  editorRef.current = editor
  
  // 注册自定义 Markdown 折叠提供器
  monaco.languages.registerFoldingRangeProvider('markdown', {
    provideFoldingRanges: (model) => {
      const ranges = []
      const lines = model.getLinesContent()
      
      // 查找标题并计算折叠范围
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const headingMatch = line.match(/^(#{1,6})\s/)
        
        if (headingMatch) {
          const level = headingMatch[1].length
          let endLine = i + 1
          
          // 找到下一个同级或更高级标题
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j]
            const nextMatch = nextLine.match(/^(#{1,6})\s/)
            
            if (nextMatch && nextMatch[1].length <= level) {
              endLine = j - 1
              break
            }
            endLine = j
          }
          
          if (endLine > i) {
            ranges.push({
              start: i + 1,
              end: endLine + 1,
              kind: monaco.languages.FoldingRangeKind.Region
            })
          }
        }
      }
      
      return ranges
    }
  })
  
  // 其他快捷键配置...
}
```

## 建议

### 短期方案
1. 使用现有的代码块和列表折叠功能
2. 在文档中说明当前支持的折叠类型

### 长期方案
如果标题折叠是必需功能：
1. 实现自定义折叠提供器（上面的代码）
2. 或考虑切换到其他编辑器组件

## 验证当前功能

请测试以下内容，看哪些可以折叠：

```markdown
# 测试文档

## 代码块测试

```javascript
function test() {
  console.log('test');
}
```

## 列表测试

- 项目 1
  - 子项 1.1
  - 子项 1.2
- 项目 2
  - 子项 2.1

## 引用块测试

> 这是引用
> 多行引用
> 继续引用
```

**请告诉我哪些内容可以折叠，我将根据实际情况调整方案。**

---

**状态**: 等待测试反馈
