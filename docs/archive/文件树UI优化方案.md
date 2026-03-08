# 文件树 UI 优化方案

## 目标
1. 现代化的文件树样式（类似你提供的截图）
2. 文件夹展开/折叠时有流畅动画
3. 保持收藏夹功能

## CSS 修改要点

### 1. 节点样式优化
```css
.tree-node-content {
  padding: 8px 12px;
  border-radius: 6px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.tree-node-content:hover {
  background: var(--hover-bg);
  transform: translateX(2px);  /* 悬停时轻微右移 */
}
```

### 2. 图标动画
```css
.tree-node-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tree-node-icon.expanded {
  transform: rotate(90deg);  /* 展开时旋转90度 */
}
```

### 3. 子节点展开动画
```css
.tree-node-children {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 4. 收藏星标动画
```css
.tree-node-favorite {
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}
```

## JavaScript 修改要点

### FileTree.jsx 需要添加展开动画逻辑

```javascript
// 在 renderNode 函数中
const renderNode = (node, level = 0) => {
  const isExpanded = expanded.has(node.path);
  
  return (
    <div key={node.path} className="tree-node">
      <div className="tree-node-content" onClick={...}>
        {hasChildren && (
          <span className={`tree-node-icon ${isExpanded ? 'expanded' : ''}`}>
            ▶
          </span>
        )}
        <span className="tree-node-name">{node.name}</span>
        {isFav && <span className="tree-node-favorite">★</span>}
      </div>
      
      {hasChildren && (
        <div 
          className={`tree-node-children ${isExpanded ? 'expanded' : ''}`}
          style={{
            maxHeight: isExpanded ? `${children.length * 40}px` : '0',
            opacity: isExpanded ? 1 : 0
          }}
        >
          {children.map(child => renderNode(child, level + 1))}
        </div>
      )}
    </div>
  );
};
```

## 实现步骤

1. 备份当前文件
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src/components
cp FileTree.css FileTree.css.backup
cp FileTree.jsx FileTree.jsx.backup
```

2. 修改 FileTree.css（应用上述样式）

3. 修改 FileTree.jsx（添加动画逻辑）

4. 构建测试
```bash
cd /vol4/1000/开发文件夹/mac
bash build-complete.sh
```

## 预期效果

- ✅ 文件夹图标展开时平滑旋转90度
- ✅ 子节点展开时从上到下滑出
- ✅ 节点悬停时轻微右移
- ✅ 收藏星标有呼吸动画
- ✅ 圆角设计更现代
- ✅ 间距更合理

---
创建时间: 2025-03-03
版本: v1.20.5.3
