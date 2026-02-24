# 升级到 v1.3.0 说明

## 📦 构建状态

✅ **FPK 已成功构建**
- 文件位置: `/vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor/App.Native.MdEditor2.fpk`
- 版本: v1.3.0
- 构建时间: 2026-02-24

## ⚠️ 升级说明

由于应用已经安装了旧版本（v1.2.2），需要先卸载旧版本才能安装新版本。

### 方法 1: 通过 Web UI 升级（推荐）

1. **卸载旧版本**
   - 打开飞牛 NAS Web UI
   - 进入"应用中心"
   - 找到"Markdown 编辑器 v2"
   - 点击"卸载"
   - 确认卸载

2. **安装新版本**
   - 在应用中心点击"本地安装"
   - 上传文件: `App.Native.MdEditor2.fpk`
   - 或使用命令行:
     ```bash
     appcenter-cli install-fpk /vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor/App.Native.MdEditor2.fpk
     ```

### 方法 2: 使用 install-local（如果支持覆盖安装）

```bash
cd /vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor
appcenter-cli install-local .
```

## 📋 版本对比

### 当前已安装版本 (v1.2.2)
- 基础编辑功能
- 文件树和自动保存
- 工具栏和主题切换
- 新建文件功能

### 新版本 (v1.3.0) 新增功能
- ✨ **另存为功能**
  - 选择保存位置
  - 文件冲突检测
  - 覆盖确认

- ✨ **导出功能**
  - 导出为 HTML（支持主题）
  - 导出为 Markdown
  - 导出为 TXT
  - PDF 导出提示

- ✨ **设置对话框**
  - 主题配置
  - 自动保存配置
  - 编辑器配置（字体、行高、Tab等）
  - 配置持久化

- ✨ **UI/UX 优化**
  - 新增工具栏按钮
  - 主题切换图标优化
  - 统一的对话框样式

## 🔍 验证安装

安装完成后，验证版本：

```bash
appcenter-cli list | grep MdEditor
```

应该显示：
```
│ App.Native.MdEditor2   │ Markdown 编辑器 v2 │ 1.3.0      │ running │ nodejs_v22      │
```

## 📝 注意事项

1. **数据备份**: 卸载前建议备份重要的 Markdown 文件
2. **配置保留**: 用户配置保存在浏览器 localStorage 中，不会丢失
3. **草稿恢复**: 草稿数据也保存在浏览器中，不受影响

## 🚀 快速升级命令

```bash
# 1. 从 Web UI 卸载旧版本

# 2. 安装新版本
cd /vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor
appcenter-cli install-fpk App.Native.MdEditor2.fpk

# 3. 验证版本
appcenter-cli list | grep MdEditor
```

## 📚 相关文档

- [版本发布说明](RELEASE_NOTES_v1.3.0.md)
- [快速开始指南](QUICKSTART_v1.3.0.md)
- [测试指南](TESTING_GUIDE.md)

## ✅ 当前状态

- ✅ FPK 已构建（v1.3.0）
- ⏳ 等待从 Web UI 卸载旧版本
- ⏳ 等待安装新版本

---

**构建时间**: 2026-02-24  
**FPK 位置**: `/vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor/App.Native.MdEditor2.fpk`  
**版本**: v1.3.0

