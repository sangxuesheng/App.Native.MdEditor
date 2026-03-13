#!/usr/bin/env node
/**
 * 构建前复制 highlight.js 代码主题 CSS 到 public/code-themes/
 * 使代码主题从本地加载，避免 CDN 延迟
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../node_modules/highlight.js/styles');
const destDir = path.join(__dirname, '../public/code-themes');

const themes = [
  'github.min.css',
  'github-dark.min.css',
  'vs.min.css',
  'vs2015.min.css',
  'atom-one-dark.min.css',
  'nord.min.css',
  'monokai.min.css',
];
const base16Themes = [
  'base16/dracula.min.css',
  'base16/material.min.css',
  'base16/solarized-light.min.css',
  'base16/solarized-dark.min.css',
];

if (!fs.existsSync(srcDir)) {
  console.error('[copy-code-themes] highlight.js styles 目录不存在:', srcDir);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.mkdirSync(path.join(destDir, 'base16'), { recursive: true });

let copied = 0;
for (const f of themes) {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
  }
}
for (const f of base16Themes) {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
  }
}

console.log(`[copy-code-themes] 已复制 ${copied} 个主题到 public/code-themes/`);
