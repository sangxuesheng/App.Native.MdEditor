# 🔧 代码行号问题 - 深度排查和最终修复

## 已完成的修复

### 修复 1: 注释掉旧实现 ✅
**位置：** 第 217-233 行

**问题：** 旧实现只添加 `line-numbers` 类，不生成双列布局

**修复：** 完全注释掉旧实现，只使用新的双列布局

### 修复 2: 改用换行符分割 ✅
**位置：** 第 4280 行附近

**问题：** 使用 `<br>` 分割，但代码块使用换行符

**修复：** 改用 `\n` 分割

### 修复 3: 使用换行符连接 ✅
**位置：** 第 4300 行附近

**问题：** 使用 `<br/>` 连接，导致显示问题

**修复：** 改用 `\n` 连接

## 测试步骤

### 步骤 1: 完全清除缓存
```
1. 按 Ctrl + Shift + Delete
2. 选择"全部时间"
3. 勾选"缓存的图片和文件"
4. 点击"清除数据"
```

### 步骤 2: 强制刷新应用
```
1. 按 Ctrl + F5 强制刷新
2. 或者关闭浏览器标签页，重新打开
```

### 步骤 3: 启用代码行号
```
1. 打开"导出配置"面板
2. 勾选"代码块行号"
3. 关闭配置面板
```

### 步骤 4: 查看控制台日志
```
按 F12 打开控制台，应该看到：

[代码行号] exportConfig.codeLineNumbers: true
[代码行号] 开始处理代码块
[代码行号] 找到代码块数量: 3
[代码行号] 处理代码块 1
[代码行号] 代码块 1 HTML 长度: 500
[代码行号] 代码块 1 HTML 预览: <span class="hljs-keyword">...
[代码行号] 代码块 1 有 5 行  ← 关键：应该 > 1
[代码行号] 代码块 1 前3行: ["...", "...", "..."]
[代码行号] 代码块 1 行号 HTML 长度: 200
[代码行号] 代码块 1 行号 HTML 预览: <section...
[代码行号] 代码块 1 处理完成
[代码行号] 所有代码块处理完成
```

### 步骤 5: 检查预览
```
预览区域的代码块应该显示：

  1  function greet(name) {
  2    console.log(`Hello, ${name}!`);
  3    return `Welcome to Markdown Editor`;
  4  }
```

### 步骤 6: 导出测试
```
1. 快捷导出：导出 → HTML 文件
2. 对话框导出：导出 → 更多选项 → HTML
3. 两种方式都应该有行号
```

## 如果还是不显示行号

### 诊断 1: 检查是否真的启用了
在控制台运行：
```javascript
console.log('exportConfig.codeLineNumbers:', exportConfig.codeLineNumbers);
```

如果是 `false`，说明没有启用。

### 诊断 2: 检查代码块结构
在控制台运行：
```javascript
const code = document.querySelector('pre code');
console.log('code.innerHTML:', code.innerHTML.substring(0, 200));
console.log('code.classList:', code.classList);
console.log('有 section.line-numbers:', !!code.querySelector('section.line-numbers'));
```

### 诊断 3: 手动触发处理
在控制台运行：
```javascript
// 手动处理代码块
const codeBlocks = document.querySelectorAll('pre code');
console.log('找到代码块:', codeBlocks.length);

codeBlocks.forEach((codeElement, index) => {
  const codeHtml = codeElement.innerHTML;
  const lines = codeHtml.split(/\n/).filter(line => line.trim() !== '');
  console.log(`代码块 ${index + 1} 有 ${lines.length} 行`);
  
  if (lines.length > 1) {
    const lineNumbersHtml = lines
      .map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`)
      .join('');
    
    const codeInnerHtml = lines.join('\n');
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
    
    const lineNumberColumnStyles = 'text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);color:#666;';
    
    const dualColumnHtml = `
      <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
        <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
        <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
      </section>
    `;
    
    codeElement.innerHTML = dualColumnHtml;
    console.log(`代码块 ${index + 1} 处理完成`);
  }
});
```

如果手动处理后显示了行号，说明自动处理没有执行。

### 诊断 4: 检查 renderMarkdown 是否执行
在控制台查找：
```
Markdown 渲染完成
```

如果没有这个日志，说明 `renderMarkdown` 没有执行。

## 可能的问题和解决方案

### 问题 1: renderMarkdown 没有执行
**症状：** 控制台没有任何 `[代码行号]` 日志

**原因：** 内容没有变化，renderMarkdown 没有被触发

**解决方案：** 
1. 修改 Markdown 内容（添加一个空格）
2. 或者刷新页面

### 问题 2: exportConfig.codeLineNumbers 是 false
**症状：** 日志显示 `exportConfig.codeLineNumbers: false`

**原因：** 配置没有保存或没有启用

**解决方案：**
1. 重新打开"导出配置"
2. 确认"代码块行号"已勾选
3. 关闭配置面板
4. 刷新页面

### 问题 3: 代码块被跳过
**症状：** 日志显示 `代码块 1 已处理，跳过`

**原因：** 代码块已经有 `.line-numbers` 子元素

**解决方案：**
1. 刷新页面
2. 或者手动删除旧的双列布局

### 问题 4: 只有 1 行
**症状：** 日志显示 `代码块 1 有 1 行`

**原因：** 分割失败

**解决方案：**
1. 检查代码块是否真的有多行
2. 运行诊断 2 检查代码块结构

## 终极解决方案

如果以上所有方法都不起作用，使用这个**终极方案**：

### 方案：在 useEffect 中也添加行号处理

在第 1300 行附近（useEffect 的末尾），添加：

```javascript
// 应用代码行号到预览（确保预览中也有行号）
if (exportConfig.codeLineNumbers) {
  setTimeout(() => {
    const codeBlocks = preview.querySelectorAll('pre code');
    codeBlocks.forEach((codeElement) => {
      // 跳过已处理的
      if (codeElement.querySelector('section.line-numbers')) return;
      
      const codeHtml = codeElement.innerHTML;
      let lines = codeHtml.split(/\n/).filter(line => line.trim() !== '');
      
      if (lines.length > 1) {
        const lineNumbersHtml = lines
          .map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`)
          .join('');
        
        const codeInnerHtml = lines.join('\n');
        const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
        
        const lineNumberColumnStyles = 'text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);color:#666;';
        
        const dualColumnHtml = `
          <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
            <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
            <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
          </section>
        `;
        
        codeElement.innerHTML = dualColumnHtml;
      }
    });
  }, 100);
}
```

这样可以确保预览中的代码块也会被处理。

## 修改文件清单

### App.jsx - 3 处修复
1. **第 217-233 行**：注释掉旧实现
2. **第 4280 行**：改用换行符分割
3. **第 4300 行**：使用换行符连接

## 🎯 预期效果

修复后应该：
- ✅ 预览中显示行号
- ✅ 快捷导出有行号
- ✅ 对话框导出有行号
- ✅ 代码左对齐
- ✅ 行号右对齐，灰色

---

**请按照测试步骤操作，并提供控制台的完整日志！**

如果还是不行，请运行诊断 3（手动触发处理），看看是否能显示行号。
