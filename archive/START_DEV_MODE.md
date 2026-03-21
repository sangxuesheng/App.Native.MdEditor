# 🚀 启动开发模式指南

## 方案一：使用 Vite 开发服务器（推荐）

### 前提条件
确保已安装 Node.js 和 npm：
```bash
node --version  # 应该显示 v16+ 或更高
npm --version   # 应该显示 8+ 或更高
```

### 启动步骤
```bash
# 1. 进入前端目录
cd /vol4/1000/开发文件夹/mac/app/ui/frontend

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# 本机: http://localhost:3000
# 局域网（含手机热更新调试）: http://NAS_IP:3000
```

### 热更新（HMR）
- 修改前端代码后保存，浏览器会自动刷新或局部更新，无需手动刷新。
- 后端需单独在 18080 运行，Vite 会把 `/api`、`/health` 等代理到 `http://localhost:18080`。
- 若在局域网用手机访问 `http://NAS_IP:3000`，同样享受热更新，便于真机调试。

### 移动端联调建议
- 真机优先访问 `http://NAS_IP:3000`，用于观察移动端布局、软键盘、长按菜单和触摸交互。
- 当开发态验证通过后，再切换到 `http://NAS_IP:18080` 复测一次，确认安装态表现一致。
- 推荐按 [`MOBILE_TEST_CHECKLIST.md`](./MOBILE_TEST_CHECKLIST.md) 逐项回归，避免修复一个点又回归另一个点。

### 开发服务器特性
- ✅ 热模块替换（HMR）- 修改代码即时生效
- ✅ 快速启动和重载
- ✅ 源码映射（Source Maps）- 方便调试
- ✅ `host: true`：局域网可访问，手机可连 NAS_IP:3000 做热更新调试

---

## 方案二：使用测试页面（快速测试）

### 测试可拉缩面板基础功能
```bash
# 直接在浏览器中打开测试页面
open /vol4/1000/开发文件夹/mac/app/ui/frontend/test-resizable.html

# 或使用 Python 简单服务器
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
python3 -m http.server 8000

# 然后访问: http://localhost:8000/test-resizable.html
```

---

## 方案三：构建并使用生产版本

### 构建步骤
```bash
# 1. 进入前端目录
cd /vol4/1000/开发文件夹/mac/app/ui/frontend

# 2. 构建生产版本
npm run build

# 3. 预览构建结果
npm run preview

# 或使用项目构建脚本
cd /vol4/1000/开发文件夹/mac
./build-frontend.sh
```

---

## 方案四：使用后端服务器

### 启动完整应用
```bash
# 1. 先构建前端
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
npm run build

# 2. 启动后端服务器
cd /vol4/1000/开发文件夹/mac/app/server
node server.js

# 3. 访问应用
# 根据服务器配置访问相应端口
```

---

## 🔧 故障排查

### Node.js 未安装
```bash
# 检查 Node.js 是否安装
node --version

# 如果未安装，请安装 Node.js
# 访问: https://nodejs.org/
# 或使用包管理器安装
```

### npm 命令未找到
```bash
# 检查 npm 路径
which npm

# 添加到 PATH（临时）
export PATH="/usr/local/bin:$PATH"

# 或使用完整路径
/usr/local/bin/npm run dev
```

### 端口被占用
```bash
# 检查端口占用
lsof -i :5173

# 或更改端口
npm run dev -- --port 3000
```

### 依赖安装失败
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 测试可拉缩面板功能

### 桌面端测试
1. 打开应用
2. 拖动文件树和编辑器之间的分隔条
3. 拖动编辑器和预览区之间的分隔条
4. 观察分隔条悬停高亮效果
5. 测试最小尺寸限制

### 移动端测试
1. 使用浏览器开发者工具切换到移动设备模式
2. 或在实际移动设备上访问
3. 测试触摸拖动操作
4. 测试横屏/竖屏切换

### 功能验证
- [ ] 鼠标拖动流畅
- [ ] 触摸拖动响应
- [ ] 分隔条悬停效果
- [ ] 最小尺寸限制生效
- [ ] 刷新后尺寸保存
- [ ] 布局模式切换正常
- [ ] 主题切换样式正确

---

## 🎯 快速开始（推荐流程）

```bash
# 1. 快速测试基础功能
open /vol4/1000/开发文件夹/mac/app/ui/frontend/test-resizable.html

# 2. 如果 Node.js 已安装，启动开发服务器
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
npm install  # 首次运行
npm run dev

# 3. 在浏览器中打开显示的地址（通常是 http://localhost:5173）

# 4. 开始测试可拉缩面板功能！
```

---

## 📖 相关文档

- `RESIZABLE_PANEL_FEATURE.md` - 功能详细说明
- `FINAL_REPORT.md` - 完成报告
- `CHECKLIST.md` - 测试检查清单

---

**提示**: 如果遇到问题，请先查看控制台错误信息，大多数问题都能通过错误提示快速定位。

祝测试顺利！🎉
