# PNG 导出问题总结

## 当前问题
1. Mermaid 图表在预览区显示黑色背景
2. PNG 导出时 Blob URL 加载失败
3. 表格也显示黑色背景

## 根本原因
Mermaid 使用的是 `theme: 'default'`，在某些情况下会使用深色背景。
需要使用 `theme: 'neutral'` 或 `theme: 'base'` 并配置透明背景。

## 解决方案

### 方案 1：使用 neutral 主题（推荐）
```javascript
mermaidModule.initialize({ 
  startOnLoad: false,
  theme: 'neutral',  // 使用 neutral 主题，默认浅色
  securityLevel: 'loose'
})
```

### 方案 2：使用 base 主题 + 自定义变量
```javascript
mermaidModule.initialize({ 
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#fff',
    primaryTextColor: '#000',
    primaryBorderColor: '#000',
    lineColor: '#000',
    secondaryColor: '#f4f4f4',
    tertiaryColor: '#fff',
    background: '#fff',
    mainBkg: '#fff',
    secondBkg: '#f4f4f4'
  }
})
```

### 方案 3：强制白色背景（最简单）
不修改 Mermaid 配置，在 PNG 导出时给 SVG 添加白色背景：

```javascript
// 在 Canvas 上先绘制白色背景
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, width, height);
// 然后绘制 SVG
ctx.drawImage(tempImg, 0, 0, width, height);
```

## 建议
使用方案 1（neutral 主题），最简单且效果最好。
