#!/usr/bin/env node
/**
 * 构建后处理脚本
 * 重写 dist/index.html，暂时禁用 MathJax 和 Mermaid
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html 不存在');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// 提取 Vite 生成的资源引用
const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
const preloadMatches = html.matchAll(/<link rel="modulepreload" crossorigin href="([^"]+)">/g);

if (!scriptMatch || !cssMatch) {
  console.error('❌ 无法找到 Vite 生成的资源引用');
  process.exit(1);
}

const mainScript = scriptMatch[1];
const mainCss = cssMatch[1];
const preloads = Array.from(preloadMatches).map(m => m[1]);

// 重写 HTML - 不包含任何 CDN
const newHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Markdown 编辑器</title>
    <!-- 模拟 MathJax 和 Mermaid，避免 CDN 阻塞 -->
    <script>
      // 模拟 MathJax
      window.MathJax = {
        tex: {},
        typesetPromise: () => Promise.resolve()
      };
      // 模拟 Mermaid
      window.mermaid = {
        initialize: () => {},
        run: () => Promise.resolve()
      };
    </script>
    <!-- Vite 生成的资源 -->
    <script type="module" crossorigin src="${mainScript}"></script>
${preloads.map(p => `    <link rel="modulepreload" crossorigin href="${p}">`).join('\n')}
    <link rel="stylesheet" crossorigin href="${mainCss}">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

fs.writeFileSync(indexPath, newHtml, 'utf8');
console.log('✅ 已重写 dist/index.html（无 CDN 依赖，模拟 MathJax 和 Mermaid）');
