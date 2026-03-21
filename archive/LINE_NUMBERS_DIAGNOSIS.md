# 🔍 代码行号问题诊断

## 问题现状

根据用户反馈：
1. **左边（导出对话框）**：有行号的位置（双列布局），但行号是空的
2. **右边（快捷导出）**：没有双列布局，完全没有行号

## 诊断步骤

### 步骤 1: 启用行号并查看控制台

1. 打开导出配置面板
2. 勾选"代码块行号"
3. 打开浏览器控制台（F12）
4. 查看控制台输出

### 步骤 2: 查看详细日志

启用行号后，控制台应该显示：

```
[代码行号] exportConfig.codeLineNumbers: true
[代码行号] 开始处理代码块
[代码行号] 找到代码块数量: 3
[代码行号] 处理代码块 1
[代码行号] 代码块 1 HTML 长度: 500
[代码行号] 代码块 1 HTML 预览: <span class="hljs-keyword">function</span>...
[代码行号] 代码块 1 有 5 行
[代码行号] 代码块 1 前3行: ["<span class="hljs-keyword">function</span>...", "...", "..."]
[代码行号] 代码块 1 行号 HTML 长度: 200
[代码行号] 代码块 1 行号 HTML 预览: <section style="...">1</section>...
[代码行号] 代码块 1 处理完成
```

### 步骤 3: 检查关键信息

请提供以下信息：

#### 信息 1: 行数检测
```
[代码行号] 代码块 1 有 X 行
```
- 如果 X = 1，说明分割失败
- 如果 X > 1，说明分割成功

#### 信息 2: HTML 预览
```
[代码行号] 代码块 1 HTML 预览: ...
```
- 检查是否包含 `<br>` 标签
- 检查是否包含换行符

#### 信息 3: 前3行内容
```
[代码行号] 代码块 1 前3行: [...]
```
- 检查每行是否正确分割
- 检查是否有空行

## 可能的问题

### 问题 1: 代码块没有 `<br>` 标签

**症状：**
```
[代码行号] 代码块 1 有 1 行
```

**原因：** `rehype-highlight` 可能使用换行符而不是 `<br>` 标签

**解决方案：** 修改分割逻辑，同时支持 `<br>` 和换行符

### 问题 2: 代码块被跳过

**症状：**
```
[代码行号] 代码块 1 已处理，跳过
```

**原因：** 代码块已经有 `.line-numbers` 类（旧实现添加的）

**解决方案：** 移除旧实现的代码

### 问题 3: 行号 HTML 是空的

**症状：**
```
[代码行号] 代码块 1 行号 HTML 长度: 0
```

**原因：** `lines` 数组是空的或只有一个元素

**解决方案：** 检查分割逻辑

## 临时测试方案

### 方案 1: 手动检查代码块结构

在浏览器控制台中运行：

```javascript
const code = document.querySelector('pre code');
console.log('innerHTML:', code.innerHTML);
console.log('包含 <br>:', code.innerHTML.includes('<br>'));
console.log('包含换行符:', code.innerHTML.includes('\n'));
console.log('textContent:', code.textContent);
```

### 方案 2: 手动测试分割

在浏览器控制台中运行：

```javascript
const code = document.querySelector('pre code');
const html = code.innerHTML;

// 测试 <br> 分割
const linesBr = html.split(/<br\s*\/?>/i);
console.log('按 <br> 分割:', linesBr.length, '行');
console.log('前3行:', linesBr.slice(0, 3));

// 测试换行符分割
const linesN = html.split(/\n/);
console.log('按 \\n 分割:', linesN.length, '行');
console.log('前3行:', linesN.slice(0, 3));
```

### 方案 3: 检查是否有 line-numbers 类

在浏览器控制台中运行：

```javascript
const code = document.querySelector('pre code');
console.log('classList:', code.classList);
console.log('有 line-numbers 类:', code.classList.contains('line-numbers'));
console.log('有 .line-numbers 子元素:', !!code.querySelector('.line-numbers'));
```

## 修复建议

### 建议 1: 改进分割逻辑

如果 `<br>` 分割失败，尝试使用换行符：

```javascript
// 按 <br> 或换行符分割成行
let lines = codeHtml.split(/<br\s*\/?>/i)

// 如果只有1行，尝试用换行符分割
if (lines.length <= 1) {
  lines = codeHtml.split(/\n/)
}

// 过滤空行
lines = lines.filter(line => line.trim() !== '')
```

### 建议 2: 移除旧实现

删除或注释掉第 217-233 行的代码：

```javascript
// 处理代码块行号 - 使用 data 属性方式
if (exportConfig.codeLineNumbers) {
  const codeBlocks = preview.querySelectorAll('pre code')
  codeBlocks.forEach(block => {
    // ... 这段代码可能导致冲突
  })
}
```

### 建议 3: 强制重新处理

修改跳过逻辑，强制重新处理：

```javascript
// 跳过已经处理过的代码块
if (codeElement.querySelector('section.line-numbers')) {  // 改为 section.line-numbers
  console.log(`[代码行号] 代码块 ${index + 1} 已处理，跳过`)
  return
}
```

## 下一步

1. **启用行号**
2. **查看控制台日志**
3. **提供以下信息：**
   - `[代码行号] 代码块 1 有 X 行`
   - `[代码行号] 代码块 1 HTML 预览: ...`
   - `[代码行号] 代码块 1 前3行: [...]`
4. **运行临时测试方案**
5. **提供测试结果**

根据这些信息，我可以准确定位问题并提供修复方案。

---

**请按照上述步骤操作，并提供控制台的完整日志输出！**
