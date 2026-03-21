// 在浏览器控制台中运行此脚本来诊断滚动问题

console.log('=== 滚动问题诊断 ===\n');

// 1. 检查 DOM 结构
console.log('1. DOM 结构检查:');
const app = document.querySelector('.app');
const mainContent = document.querySelector('.main-content');
const editorToolbar = document.querySelector('.editor-toolbar');
const container = document.querySelector('.editor-preview-container');
const editorPane = document.querySelector('.editor-pane');
const previewPane = document.querySelector('.preview-pane');

console.log('  ✓ .app:', app ? '存在' : '❌ 不存在');
console.log('  ✓ .main-content:', mainContent ? '存在' : '❌ 不存在');
console.log('  ✓ .editor-toolbar:', editorToolbar ? '存在' : '❌ 不存在');
console.log('  ✓ .editor-preview-container:', container ? '存在' : '❌ 不存在');
console.log('  ✓ .editor-pane:', editorPane ? '存在' : '❌ 不存在');
console.log('  ✓ .preview-pane:', previewPane ? '存在' : '❌ 不存在');

if (!container) {
  console.error('\n❌ 致命错误: editor-preview-container 不存在！');
  console.log('   这意味着修改没有生效，请检查：');
  console.log('   1. 是否重新构建了前端？');
  console.log('   2. 是否刷新了页面（Ctrl+F5）？');
  console.log('   3. 是否清除了浏览器缓存？');
  process.exit(1);
}

// 2. 检查高度
console.log('\n2. 高度检查:');
console.log('  App height:', app?.offsetHeight, 'px');
console.log('  Main-content height:', mainContent?.offsetHeight, 'px');
console.log('  Editor-toolbar height:', editorToolbar?.offsetHeight, 'px');
console.log('  Container height:', container?.offsetHeight, 'px');
console.log('  Editor-pane height:', editorPane?.offsetHeight, 'px');
console.log('  Preview-pane height:', previewPane?.offsetHeight, 'px');

if (container && container.offsetHeight === 0) {
  console.error('\n❌ 问题: editor-preview-container 高度为 0！');
}

// 3. 检查计算样式
console.log('\n3. 计算样式检查:');
if (container) {
  const containerStyle = window.getComputedStyle(container);
  console.log('  Container:');
  console.log('    flex:', containerStyle.flex);
  console.log('    min-height:', containerStyle.minHeight);
  console.log('    display:', containerStyle.display);
  console.log('    order:', containerStyle.order);
}

if (editorPane) {
  const editorStyle = window.getComputedStyle(editorPane);
  console.log('  Editor-pane:');
  console.log('    flex:', editorStyle.flex);
  console.log('    min-height:', editorStyle.minHeight);
  console.log('    overflow:', editorStyle.overflow);
  console.log('    overflow-y:', editorStyle.overflowY);
}

if (previewPane) {
  const previewStyle = window.getComputedStyle(previewPane);
  console.log('  Preview-pane:');
  console.log('    flex:', previewStyle.flex);
  console.log('    min-height:', previewStyle.minHeight);
  console.log('    overflow:', previewStyle.overflow);
  console.log('    overflow-y:', previewStyle.overflowY);
}

// 4. 检查 Monaco Editor
console.log('\n4. Monaco Editor 检查:');
const monacoEditor = document.querySelector('.monaco-editor');
console.log('  Monaco Editor:', monacoEditor ? '存在' : '❌ 不存在');
if (monacoEditor) {
  console.log('  Monaco height:', monacoEditor.offsetHeight, 'px');
  console.log('  Monaco scrollHeight:', monacoEditor.scrollHeight, 'px');
  const monacoStyle = window.getComputedStyle(monacoEditor);
  console.log('  Monaco overflow:', monacoStyle.overflow);
}

// 5. 检查内容高度
console.log('\n5. 内容高度检查:');
const markdownBody = document.querySelector('.markdown-body');
if (markdownBody) {
  console.log('  Markdown-body height:', markdownBody.offsetHeight, 'px');
  console.log('  Markdown-body scrollHeight:', markdownBody.scrollHeight, 'px');
}

// 6. 总结
console.log('\n=== 诊断总结 ===');
let hasIssues = false;

if (!container) {
  console.error('❌ editor-preview-container 不存在');
  hasIssues = true;
}

if (container && container.offsetHeight === 0) {
  console.error('❌ editor-preview-container 高度为 0');
  hasIssues = true;
}

if (editorPane && editorPane.offsetHeight === 0) {
  console.error('❌ editor-pane 高度为 0');
  hasIssues = true;
}

if (previewPane && previewPane.offsetHeight === 0) {
  console.error('❌ preview-pane 高度为 0');
  hasIssues = true;
}

if (!hasIssues) {
  console.log('✅ 布局结构看起来正常');
  console.log('\n请检查：');
  console.log('1. 是否有足够的内容？（需要超过可视高度才会显示滚动条）');
  console.log('2. 尝试在编辑器中输入 50+ 行内容');
  console.log('3. 尝试使用鼠标滚轮滚动');
  console.log('4. 检查是否有 JavaScript 错误');
}

console.log('\n=== 诊断完成 ===');
