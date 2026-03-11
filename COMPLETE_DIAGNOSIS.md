# 🔍 代码行号问题 - 完整排查清单

## 问题现状

从截图看：
- **左边（对话框导出）**：有行号的空间，但没有数字
- **右边（快捷导出）**：完全没有行号空间

## 所有可能的问题

### 问题 1: renderMarkdown 没有被调用
**症状：** 控制台没有任何日志

**原因：** 
- 内容没有变化
- renderMarkdown 没有被触发

**检查方法：**
```javascript
// 在控制台查找
"Markdown 渲染完成"
```

**解决方案：**
- 修改 Markdown 内容触发重新渲染
- 或者在 useEffect 中也添加行号处理

---

### 问题 2: exportConfig.codeLineNumbers 是 false
**症状：** 日志显示 `exportConfig.codeLineNumbers: false`

**原因：**
- 配置没有保存
- 配置面板的状态没有同步到 exportConfig

**检查方法：**
```javascript
console.log('exportConfig:', exportConfig);
console.log('codeLineNumbers:', exportConfig.codeLineNumbers);
```

**解决方案：**
- 检查 ExportConfigPanel 的 onChange 是否正确触发
- 检查 updateConfig 函数是否正确更新状态

---

### 问题 3: 代码行号处理逻辑没有执行
**症状：** 控制台有 `[代码行号] exportConfig.codeLineNumbers: true` 但没有后续日志

**原因：**
- if 条件判断失败
- 代码块数量为 0
- forEach 循环没有执行

**检查方法：**
```javascript
const codeBlocks = document.querySelectorAll('pre code');
console.log('代码块数量:', codeBlocks.length);
```

**解决方案：**
- 确认 previewRef.current 存在
- 确认有代码块

---

### 问题 4: 代码块被跳过
**症状：** 日志显示 `代码块 1 已处理，跳过`

**原因：**
- 代码块已经有 `.line-numbers` 子元素
- 或者是 Mermaid 图表

**检查方法：**
```javascript
const code = document.querySelector('pre code');
console.log('有 .line-numbers 子元素:', !!code.querySelector('.line-numbers'));
console.log('是 Mermaid:', code.classList.contains('language-mermaid'));
```

**解决方案：**
- 修改跳过逻辑
- 或者强制重新处理

---

### 问题 5: 分割逻辑失败（只有 1 行）
**症状：** 日志显示 `代码块 1 有 1 行`

**原因：**
- 换行符分割失败
- 代码块确实只有 1 行

**检查方法：**
```javascript
const code = document.querySelector('pre code');
const html = code.innerHTML;
const lines = html.split(/\n/).filter(line => line.trim() !== '');
console.log('分割后行数:', lines.length);
console.log('前3行:', lines.slice(0, 3));
```

**解决方案：**
- 改进分割逻辑
- 尝试不同的分割方式

---

### 问题 6: DOM 更新时机问题
**症状：** 处理完成但预览中看不到

**原因：**
- DOM 更新后又被覆盖
- 或者更新的不是正确的元素

**检查方法：**
```javascript
// 处理后立即检查
const code = document.querySelector('pre code');
console.log('有双列布局:', !!code.querySelector('section.line-numbers'));
console.log('innerHTML:', code.innerHTML.substring(0, 200));
```

**解决方案：**
- 在 DOM 更新后延迟处理
- 或者使用 MutationObserver 监听变化

---

### 问题 7: 导出时 HTML 获取方式问题
**症状：** 预览中有行号，但导出的 HTML 没有

**原因：**
- `previewRef.current?.innerHTML` 获取的是旧的 HTML
- 或者在行号处理之前就获取了

**检查方法：**
```javascript
console.log('previewRef.current?.innerHTML:', previewRef.current?.innerHTML.substring(0, 500));
```

**解决方案：**
- 确保在行号处理完成后再导出
- 或者在导出时重新处理

---

### 问题 8: useEffect 和 renderMarkdown 的执行顺序
**症状：** 不确定哪个先执行

**原因：**
- useEffect 在组件挂载时执行
- renderMarkdown 在内容变化时执行
- 可能存在竞态条件

**检查方法：**
```javascript
// 在两个地方都添加日志
console.log('[useEffect] 执行');
console.log('[renderMarkdown] 执行');
```

**解决方案：**
- 在两个地方都添加行号处理
- 或者统一处理逻辑

---

### 问题 9: 旧实现的残留影响
**症状：** 代码块有 `line-numbers` 类但没有双列布局

**原因：**
- 旧实现虽然被注释了，但之前添加的类还在
- 浏览器缓存了旧的状态

**检查方法：**
```javascript
const code = document.querySelector('pre code');
console.log('classList:', code.classList);
console.log('dataset:', code.dataset);
```

**解决方案：**
- 清除浏览器缓存
- 或者在新实现中先清除旧的类和属性

---

### 问题 10: CSS 样式问题
**症状：** 双列布局生成了但看不见

**原因：**
- CSS 样式没有加载
- 或者被其他样式覆盖

**检查方法：**
```javascript
const lineNumbers = document.querySelector('section.line-numbers');
if (lineNumbers) {
  console.log('行号列存在');
  console.log('computed style:', window.getComputedStyle(lineNumbers));
} else {
  console.log('行号列不存在');
}
```

**解决方案：**
- 检查 CSS 是否正确加载
- 使用内联样式确保优先级

---

## 排查顺序

### 第 1 步：基础检查
```javascript
// 1. 检查配置
console.log('exportConfig.codeLineNumbers:', exportConfig.codeLineNumbers);

// 2. 检查代码块
const codeBlocks = document.querySelectorAll('pre code');
console.log('代码块数量:', codeBlocks.length);

// 3. 检查第一个代码块
const code = codeBlocks[0];
console.log('innerHTML 长度:', code.innerHTML.length);
console.log('classList:', code.classList);
```

### 第 2 步：检查分割
```javascript
const code = document.querySelector('pre code');
const html = code.innerHTML;

// 测试换行符分割
const lines = html.split(/\n/).filter(line => line.trim() !== '');
console.log('分割后行数:', lines.length);
console.log('前3行:', lines.slice(0, 3));
```

### 第 3 步：检查 DOM 结构
```javascript
const code = document.querySelector('pre code');
console.log('有 section.line-numbers:', !!code.querySelector('section.line-numbers'));
console.log('有 section.code-scroll:', !!code.querySelector('section.code-scroll'));
```

### 第 4 步：手动测试
运行之前提供的手动处理代码，看是否能显示行号。

---

## 立即执行的诊断脚本

请在控制台运行以下完整的诊断脚本：

```javascript
console.log('========== 代码行号诊断开始 ==========');

// 1. 检查配置
console.log('1. 配置检查:');
try {
  console.log('  exportConfig.codeLineNumbers:', exportConfig.codeLineNumbers);
} catch (e) {
  console.log('  ❌ exportConfig 不可访问');
}

// 2. 检查代码块
console.log('\n2. 代码块检查:');
const codeBlocks = document.querySelectorAll('pre code');
console.log('  代码块数量:', codeBlocks.length);

if (codeBlocks.length > 0) {
  const code = codeBlocks[0];
  console.log('  第一个代码块:');
  console.log('    classList:', Array.from(code.classList));
  console.log('    innerHTML 长度:', code.innerHTML.length);
  console.log('    innerHTML 预览:', code.innerHTML.substring(0, 100));
  
  // 3. 检查分割
  console.log('\n3. 分割检查:');
  const html = code.innerHTML;
  const linesN = html.split(/\n/);
  const linesNFiltered = linesN.filter(line => line.trim() !== '');
  console.log('  按 \\n 分割:', linesN.length, '行');
  console.log('  过滤空行后:', linesNFiltered.length, '行');
  console.log('  前3行:', linesNFiltered.slice(0, 3).map(l => l.substring(0, 50)));
  
  // 4. 检查 DOM 结构
  console.log('\n4. DOM 结构检查:');
  console.log('  有 section.line-numbers:', !!code.querySelector('section.line-numbers'));
  console.log('  有 section.code-scroll:', !!code.querySelector('section.code-scroll'));
  console.log('  有 .line-numbers 类:', code.classList.contains('line-numbers'));
  
  // 5. 检查样式
  console.log('\n5. 样式检查:');
  const lineNumbers = code.querySelector('section.line-numbers');
  if (lineNumbers) {
    const style = window.getComputedStyle(lineNumbers);
    console.log('  行号列样式:');
    console.log('    display:', style.display);
    console.log('    textAlign:', style.textAlign);
    console.log('    color:', style.color);
  } else {
    console.log('  ❌ 没有找到行号列');
  }
}

console.log('\n========== 代码行号诊断结束 ==========');
```

---

## 下一步行动

1. **运行诊断脚本**
2. **提供完整的输出结果**
3. **根据结果确定具体问题**
4. **实施针对性修复**

请运行上述诊断脚本，并提供完整的控制台输出！
