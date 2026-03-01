#!/usr/bin/env node
/**
 * 构建后处理脚本
 * 在 dist/index.html 中添加 Mermaid 预加载脚本
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html 不存在');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// 检查是否已经有 Mermaid 预加载脚本
if (html.includes('window.mermaid = mermaid')) {
  console.log('✅ Mermaid 预加载脚本已存在');
  process.exit(0);
}

// 在 MathJax 脚本后添加 Mermaid 预加载
const mermaidScript = `    <!-- Mermaid 预加载 -->
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      window.mermaid = mermaid;
    </script>
`;

html = html.replace(
  /(<script id="MathJax-script"[^>]*><\/script>)/,
  `$1\n${mermaidScript}`
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ 已添加 Mermaid 预加载脚本到 dist/index.html');
