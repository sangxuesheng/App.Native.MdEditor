# 🎉 代码行号问题 - 最终修复

## 问题根源

通过用户提供的浏览器控制台测试，发现了真正的问题：

### 测试结果
```javascript
包含 <br>: false          ❌ 代码块不使用 <br> 标签
包含换行符: true          ✅ 代码块使用换行符 \n
有 line-numbers 类: true  ✅ 旧实现添加的类
有 .line-numbers 子元素: false  ❌ 双列布局没有生成
```

### 根本原因

1. **分割逻辑错误**
   - 代码使用 `split(/<br\s*\/?>/i)` 分割
   - 但 `rehype-highlight` 生成的代码使用 `\n`（换行符）
   - 结果：只分割出 1 行，被跳过

2. **旧实现冲突**
   - 第 217-233 行的旧实现给 `<code>` 添加了 `line-numbers` 类
   - 这个类导致代码块靠右（已修复）
   - 但没有生成双列布局

## 修复方案

### 修复 1: 改用换行符分割

**修复前：**
```javascript
const lines = codeHtml.split(/<br\s*\/?>/i)
```

**修复后：**
```javascript
// 按换行符或 <br> 分割成行
let lines = codeHtml.split(/\n/)

// 如果换行符分割失败，尝试 <br>
if (lines.length <= 1) {
  lines = codeHtml.split(/<br\s*\/?>/i)
}

// 过滤空行
lines = lines.filter(line => line.trim() !== '')
```

### 修复 2: 使用换行符连接

**修复前：**
```javascript
const codeInnerHtml = lines.join('<br/>')
```

**修复后：**
```javascript
const codeInnerHtml = lines.join('\n')
```

## 工作流程

### 修复前
```
1. 代码块 HTML: "function...\n  console.log...\n}"
2. 按 <br> 分割: ["function...\n  console.log...\n}"]  ← 只有1行
3. 检查行数: 1 行
4. 跳过处理 ❌
```

### 修复后
```
1. 代码块 HTML: "function...\n  console.log...\n}"
2. 按 \n 分割: ["function...", "  console.log...", "}"]  ← 3行
3. 过滤空行: ["function...", "  console.log...", "}"]
4. 生成行号: 1, 2, 3
5. 生成双列布局 ✅
```

## 测试验证

### 步骤 1: 清除缓存并刷新
```
Ctrl + Shift + Delete  (清除缓存)
Ctrl + F5              (强制刷新)
```

### 步骤 2: 启用行号
1. 打开"导出配置"面板
2. 勾选"代码块行号"
3. 关闭配置面板

### 步骤 3: 查看控制台
应该看到：
```
[代码行号] exportConfig.codeLineNumbers: true
[代码行号] 开始处理代码块
[代码行号] 找到代码块数量: 3
[代码行号] 处理代码块 1
[代码行号] 代码块 1 有 5 行  ← 应该 > 1
[代码行号] 代码块 1 处理完成
```

### 步骤 4: 查看预览
代码块应该显示：
```
  1  function greet(name) {
  2    console.log(`Hello, ${name}!`);
  3    return `Welcome to Markdown Editor`;
  4  }
  5  
  6  const message = greet('用户');
```

### 步骤 5: 导出测试
1. 导出 HTML（两种方式都测试）
   - 快捷导出（导出 → HTML）
   - 对话框导出（导出 → 更多选项 → HTML）
2. 在浏览器中打开
3. 验证行号是否显示

## 预期效果

### 左边（导出对话框）
- ✅ 有双列布局
- ✅ 行号列有内容（1, 2, 3...）
- ✅ 代码列有内容
- ✅ 代码左对齐

### 右边（快捷导出）
- ✅ 有双列布局
- ✅ 行号列有内容（1, 2, 3...）
- ✅ 代码列有内容
- ✅ 代码左对齐

## 修改文件清单

### App.jsx - 2 处修复

#### 修复 1: 改用换行符分割（第 4280 行附近）
```javascript
// 按换行符或 <br> 分割成行
let lines = codeHtml.split(/\n/)

// 如果换行符分割失败，尝试 <br>
if (lines.length <= 1) {
  lines = codeHtml.split(/<br\s*\/?>/i)
}

// 过滤空行
lines = lines.filter(line => line.trim() !== '')
```

#### 修复 2: 使用换行符连接（第 4300 行附近）
```javascript
// 生成代码列 HTML - 使用换行符连接
const codeInnerHtml = lines.join('\n')
```

## 技术细节

### rehype-highlight 的输出格式

`rehype-highlight` 生成的代码块使用换行符分隔：

```html
<code class="hljs language-javascript">
<span class="hljs-keyword">function</span> greet() {
    <span class="hljs-variable">console</span>.log();
}
</code>
```

注意：行与行之间是换行符 `\n`，不是 `<br>` 标签。

### 为什么之前使用 <br>？

可能是因为：
1. 某些 Markdown 渲染器使用 `<br>` 标签
2. 或者是从其他项目复制的代码
3. 但 `rehype-highlight` 不使用 `<br>`

### 为什么要过滤空行？

```javascript
lines = lines.filter(line => line.trim() !== '')
```

因为代码块开头和结尾可能有空的换行符：
```
"\nfunction hello() {\n  console.log();\n}\n"
```

分割后：
```
["", "function hello() {", "  console.log();", "}", ""]
```

过滤后：
```
["function hello() {", "  console.log();", "}"]
```

## 常见问题

### Q1: 修复后还是没有行号？

**解决方案：**
1. 清除浏览器缓存
2. 强制刷新（Ctrl + F5）
3. 确认"代码块行号"已勾选
4. 查看控制台日志

### Q2: 行号显示但代码靠右？

**解决方案：**
1. 这是之前的问题，应该已经修复
2. 如果还有问题，检查 CSS 是否正确加载

### Q3: 行号和代码不对齐？

**解决方案：**
1. 检查 `line-height` 是否一致（应该都是 1.75）
2. 检查字体是否是等宽字体

### Q4: 复制代码时包含行号？

**解决方案：**
1. 检查 `.line-numbers` 是否有 `user-select: none`
2. 尝试在不同浏览器中测试

## 🎉 修复完成

现在代码行号功能应该完全正常工作了：

- ✅ 代码块不靠右
- ✅ 行号正确显示
- ✅ 双列布局正确生成
- ✅ 快捷导出和对话框导出都正常
- ✅ 行号和代码对齐
- ✅ 复制代码时不包含行号

---

**修复完成时间：** 2025-03-09
**关键发现：** rehype-highlight 使用换行符而不是 <br> 标签
**最终修复：** 改用换行符分割代码行
**测试状态：** 待用户验证

## 感谢

感谢用户提供的详细测试结果，这帮助我们快速定位到了问题的根源！
