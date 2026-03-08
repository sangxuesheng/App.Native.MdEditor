# 文件树功能测试指南

## ⚠️ 重要提示

由于添加了新的 FileTree 组件，需要**重新构建前端**才能测试新功能。

---

## 📋 测试前准备

### 步骤 1: 重新构建前端

在**系统终端**中执行（需要 Node.js 环境）：

```bash
# 进入前端目录
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 重新构建
npm run build
```

**预期输出**：
```
> md-editor-frontend@1.0.0 build
> vite build

vite v5.3.1 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-abc123.css     12.34 kB
dist/assets/index-def456.js     567.89 kB
✓ built in 12.34s
```

### 步骤 2: 验证构建产物

```bash
# 检查 dist 目录
ls -la dist/

# 应该看到新的时间戳（刚刚构建的）
```

---

## 🔨 构建 FPK

### 方法 1: 使用一键命令

在**系统终端**中执行：

```bash
# 设置变量
PROJECT_DIR="/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor"
FNPACK="/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64"
BUILD_DIR="/tmp/fpk_filetree_$(date +%s)"

# 创建构建目录
mkdir -p "$BUILD_DIR"

# 复制文件
rsync -av \
  --exclude='node_modules*' \
  --exclude='.git' \
  --exclude='app/ui/frontend/src' \
  --exclude='*.md' \
  "$PROJECT_DIR/" "$BUILD_DIR/"

# 更新版本号为 1.1.0
cd "$BUILD_DIR"
sed -i '' 's/version=.*/version=1.1.0/' manifest

# 构建 fpk
"$FNPACK" build

# 显示结果
echo "✅ FPK 位置: $BUILD_DIR/App.Native.MdEditor.fpk"
ls -lh "$BUILD_DIR/App.Native.MdEditor.fpk"

# 在 Finder 中打开
open "$BUILD_DIR"
```

### 方法 2: 分步执行

```bash
# 1. 创建临时目录
BUILD_DIR="/tmp/fpk_filetree_test"
mkdir -p "$BUILD_DIR"

# 2. 复制项目
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor"
rsync -av --exclude='node_modules*' --exclude='.git' . "$BUILD_DIR/"

# 3. 更新版本号
cd "$BUILD_DIR"
sed -i '' 's/version=1.0.0/version=1.1.0/' manifest

# 4. 构建
"/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64" build

# 5. 查看结果
ls -lh App.Native.MdEditor.fpk
```

---

## 🧪 测试清单

### 1. 基础功能测试

#### 1.1 文件树显示
- [ ] 应用启动后，左侧显示文件树
- [ ] 文件树顶部有搜索框
- [ ] 显示"文件"标题

#### 1.2 目录浏览
- [ ] 显示授权目录列表
- [ ] 点击目录前的 ▶ 图标可以展开
- [ ] 展开后图标变为 ▼
- [ ] 再次点击可以折叠

#### 1.3 文件打开
- [ ] 点击 .md 文件名
- [ ] 编辑器加载文件内容
- [ ] 预览区显示渲染结果
- [ ] 状态栏显示"已加载: /path/to/file.md"
- [ ] 当前文件在文件树中高亮显示

#### 1.4 文件搜索
- [ ] 在搜索框输入关键词
- [ ] 文件列表实时过滤
- [ ] 只显示匹配的文件和目录
- [ ] 清空搜索框恢复完整列表

#### 1.5 文件树切换
- [ ] 点击工具栏 📁 按钮
- [ ] 文件树隐藏，编辑区变宽
- [ ] 再次点击，文件树显示

### 2. 布局兼容性测试

#### 2.1 水平布局
- [ ] 点击水平布局按钮
- [ ] 文件树在左侧
- [ ] 编辑器在右上
- [ ] 预览在右下

#### 2.2 垂直布局
- [ ] 点击垂直布局按钮
- [ ] 文件树在最左侧
- [ ] 编辑器在中间
- [ ] 预览在最右侧

#### 2.3 仅编辑器
- [ ] 点击仅编辑器按钮
- [ ] 文件树在左侧
- [ ] 编辑器占据右侧全部空间

#### 2.4 仅预览
- [ ] 点击仅预览按钮
- [ ] 文件树在左侧
- [ ] 预览区占据右侧全部空间

### 3. 边界情况测试

#### 3.1 空目录
- [ ] 展开空目录
- [ ] 显示"暂无文件"提示

#### 3.2 无权限目录
- [ ] 尝试访问非授权目录
- [ ] 显示错误提示
- [ ] 不会崩溃

#### 3.3 网络错误
- [ ] 模拟网络错误
- [ ] 显示"网络错误"提示
- [ ] 可以重试

#### 3.4 大量文件
- [ ] 打开包含大量文件的目录
- [ ] 滚动流畅
- [ ] 搜索响应快速

### 4. 交互测试

#### 4.1 快速点击
- [ ] 快速点击多个文件
- [ ] 正确加载最后点击的文件
- [ ] 不会出现错误

#### 4.2 搜索性能
- [ ] 输入搜索关键词
- [ ] 实时过滤响应快速
- [ ] 不会卡顿

#### 4.3 展开/折叠
- [ ] 快速展开/折叠多个目录
- [ ] 状态正确保持
- [ ] 不会出现错误

---

## 📊 测试环境

### 推荐测试环境

1. **飞牛 NAS 真机测试**
   - 最真实的测试环境
   - 可以测试授权目录功能
   - 可以测试实际的文件读写

2. **本地开发测试**
   - 快速迭代
   - 方便调试
   - 需要模拟授权目录

### 测试数据准备

创建测试目录结构：

```bash
# 在飞牛 NAS 上创建测试目录
mkdir -p /vol1/markdown_test/docs
mkdir -p /vol1/markdown_test/notes
mkdir -p /vol1/markdown_test/projects

# 创建测试文件
echo "# 测试文档 1" > /vol1/markdown_test/test1.md
echo "# 测试文档 2" > /vol1/markdown_test/docs/test2.md
echo "# 笔记" > /vol1/markdown_test/notes/note.md
echo "# 项目说明" > /vol1/markdown_test/projects/README.md
```

---

## 🐛 已知问题

### 问题 1: 文件树不显示

**可能原因**：
- 前端未重新构建
- 授权目录未配置

**解决方法**：
1. 确认前端已重新构建
2. 检查 `TRIM_DATA_ACCESSIBLE_PATHS` 环境变量

### 问题 2: 点击文件无反应

**可能原因**：
- 文件路径不在授权目录内
- 后端 API 错误

**解决方法**：
1. 查看浏览器控制台错误
2. 查看后端日志：`/var/apps/App.Native.MdEditor/var/md-editor.log`

### 问题 3: 搜索不工作

**可能原因**：
- JavaScript 错误
- 组件未正确加载

**解决方法**：
1. 打开浏览器开发者工具
2. 查看 Console 错误信息

---

## 📝 测试报告模板

```markdown
## 文件树功能测试报告

**测试时间**: 2026-02-23
**测试环境**: 飞牛 NAS / 本地开发
**版本**: 1.1.0

### 测试结果

#### 基础功能
- [ ] 文件树显示: ✅ / ❌
- [ ] 目录展开/折叠: ✅ / ❌
- [ ] 文件打开: ✅ / ❌
- [ ] 文件搜索: ✅ / ❌
- [ ] 文件树切换: ✅ / ❌

#### 布局兼容性
- [ ] 水平布局: ✅ / ❌
- [ ] 垂直布局: ✅ / ❌
- [ ] 仅编辑器: ✅ / ❌
- [ ] 仅预览: ✅ / ❌

#### 发现的问题
1. 问题描述...
2. 问题描述...

#### 改进建议
1. 建议...
2. 建议...
```

---

## 🚀 部署到飞牛 NAS

### 1. 上传 FPK

将构建好的 `App.Native.MdEditor.fpk` 上传到飞牛 NAS

### 2. 安装

```bash
# SSH 连接到 NAS
ssh user@nas-ip

# 安装 fpk
appcenter-cli install-fpk /path/to/App.Native.MdEditor.fpk

# 启动应用
appcenter-cli start App.Native.MdEditor
```

### 3. 访问测试

```
http://飞牛NAS地址:18080
```

---

## 💡 测试技巧

1. **使用浏览器开发者工具**
   - F12 打开开发者工具
   - 查看 Console 错误
   - 查看 Network 请求

2. **查看后端日志**
   ```bash
   tail -f /var/apps/App.Native.MdEditor/var/md-editor.log
   ```

3. **测试不同场景**
   - 空目录
   - 大量文件
   - 深层嵌套
   - 特殊字符文件名

4. **性能监控**
   - 打开 Performance 面板
   - 记录操作过程
   - 分析性能瓶颈

---

**重要**: 必须先重新构建前端（npm run build），否则看不到新功能！

