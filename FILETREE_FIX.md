# 授权目录显示问题修复

## 🐛 问题描述

文件树显示"目标路径不在授权目录内"错误，无法显示授权目录。

## 🔧 问题原因

`isUnderRoot` 函数的逻辑有问题：当目标路径正好是授权根目录时，`path.relative(root, target)` 返回空字符串，导致判断失败。

## ✅ 已修复

已更新 `app/server/server.js` 中的 `isUnderRoot` 函数：

```javascript
function isUnderRoot(target, root) {
  const rel = path.relative(root, target);
  // 如果 rel 为空字符串，说明 target 就是 root，也应该允许
  // 如果 rel 不以 .. 开头且不是绝对路径，说明 target 在 root 下
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
```

## 🚀 部署修复版本

### 步骤 1: 重新构建前端（可选）

如果前端没有变化，可以跳过这一步。

```bash
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"
npm run build
```

### 步骤 2: 构建新的 FPK

```bash
BUILD_DIR="/tmp/fpk_fix_$(date +%s)" && \
mkdir -p "$BUILD_DIR" && \
rsync -av --exclude='node_modules*' --exclude='.git' --exclude='app/ui/frontend/src' \
  "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/" "$BUILD_DIR/" && \
cd "$BUILD_DIR" && \
sed -i '' 's/version=.*/version=1.1.1/' manifest && \
"/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64" build && \
echo "✅ FPK: $BUILD_DIR/App.Native.MdEditor.fpk" && \
ls -lh "$BUILD_DIR/App.Native.MdEditor.fpk" && \
open "$BUILD_DIR"
```

### 步骤 3: 上传并更新

1. 从 Finder 中复制 `App.Native.MdEditor.fpk`
2. 上传到飞牛 NAS
3. 在 NAS 上执行：

```bash
# 停止旧版本
appcenter-cli stop App.Native.MdEditor

# 卸载旧版本
appcenter-cli uninstall App.Native.MdEditor

# 安装新版本
appcenter-cli install-fpk /path/to/App.Native.MdEditor.fpk

# 启动应用
appcenter-cli start App.Native.MdEditor
```

### 步骤 4: 验证修复

1. 打开应用：`http://NAS地址:18080`
2. 查看左侧文件树
3. 应该能看到授权目录列表
4. 点击目录可以展开
5. 点击文件可以打开

## 🧪 测试要点

### 1. 授权目录显示
- [ ] 文件树显示所有授权目录
- [ ] 目录名称正确显示
- [ ] 不再显示"目标路径不在授权目录内"错误

### 2. 目录浏览
- [ ] 点击目录可以展开
- [ ] 显示子目录和 .md 文件
- [ ] 目录排在文件前面

### 3. 文件操作
- [ ] 点击文件可以打开
- [ ] 编辑器加载文件内容
- [ ] 可以保存文件

## 📝 版本更新

- **版本**: 1.1.0 → 1.1.1
- **类型**: Bug 修复
- **变更**: 修复授权目录路径判断逻辑

## 🔍 技术细节

### 修复前

```javascript
function isUnderRoot(target, root) {
  const rel = path.relative(root, target);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
  // 问题：当 rel 为空字符串时（target === root），返回 false
}
```

### 修复后

```javascript
function isUnderRoot(target, root) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
  // 修复：允许 rel 为空字符串的情况
}
```

### 测试用例

```javascript
// 测试 1: 目标路径就是根目录
isUnderRoot('/vol1/data', '/vol1/data')
// 修复前: false ❌
// 修复后: true ✅

// 测试 2: 目标路径在根目录下
isUnderRoot('/vol1/data/test.md', '/vol1/data')
// 修复前: true ✅
// 修复后: true ✅

// 测试 3: 目标路径不在根目录下
isUnderRoot('/vol2/data', '/vol1/data')
// 修复前: false ✅
// 修复后: false ✅
```

## 💡 快速部署（一键命令）

```bash
# 完整流程
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend" && \
npm run build && \
cd .. && \
BUILD_DIR="/tmp/fpk_fix_$(date +%s)" && \
mkdir -p "$BUILD_DIR" && \
rsync -av --exclude='node_modules*' --exclude='.git' --exclude='app/ui/frontend/src' . "$BUILD_DIR/" && \
cd "$BUILD_DIR" && \
sed -i '' 's/version=.*/version=1.1.1/' manifest && \
"/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64" build && \
echo "✅ 修复版本已构建: $BUILD_DIR/App.Native.MdEditor.fpk" && \
open "$BUILD_DIR"
```

---

**重要**: 这是一个关键的 bug 修复，建议立即部署到生产环境。

