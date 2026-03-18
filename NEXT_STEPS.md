# 🎯 多图床支持 - 下一步行动计划

## 📊 当前状态

✅ Phase 1: 后端架构 (100%)  
✅ Phase 2: 集成指南 (100%)  
✅ Phase 3: 前端 UI (100%)  
⏳ **待执行**: 实际集成到主服务  
⏳ Phase 4: 测试与优化 (0%)

---

## 🚀 立即执行的 3 个步骤

### 步骤 1: 后端集成 (30 分钟)

**操作**: 将图床功能集成到 `app/server/server.js`

**参考文档**: `IMAGEBED_SERVER_PATCH.js` 或 `IMAGEBED_PHASE2_GUIDE.md`

**需要添加的代码**:
1. 导入 ImageBedManager 和 imagebedApi
2. 初始化 imagebedManager
3. 添加 readMultipartBody 函数
4. 添加图床 API 路由处理

**安装依赖**:
```bash
cd app/server
npm install busboy qiniu ali-oss cos-nodejs-sdk-v5 @octokit/rest sharp
```

---

### 步骤 2: 前端集成 (30 分钟)

**操作**: 将图床设置面板集成到 `ImageManagerDialog.jsx`

**需要添加**:
1. 导入 `ImagebedSettingsPanel` 组件
2. 添加"图床设置"标签页按钮
3. 添加标签页内容区域

**代码位置**: 参考 `IMAGEBED_PHASE3_COMPLETION.md`

---

### 步骤 3: 构建部署 (10 分钟)

```bash
# 构建前端
cd app/ui/frontend
npm run build

# 部署应用
cd /vol4/1000/开发文件夹/mac
bash build-and-deploy.sh --local

# 验证服务
curl http://localhost:18080/api/imagebed/list
```

---

## 📋 快速验证清单

集成完成后，验证以下功能：

- [ ] 访问 http://192.168.2.2:18080/
- [ ] 打开图片管理对话框
- [ ] 看到"图床设置"标签页
- [ ] 可以添加新图床
- [ ] 可以测试连接
- [ ] 可以设置默认图床
- [ ] 可以上传图片

---

## 📚 参考文档

| 文档 | 用途 |
|------|------|
| `IMAGEBED_INTEGRATION_CHECKLIST.md` | 详细集成清单 |
| `IMAGEBED_SERVER_PATCH.js` | 后端补丁代码 |
| `IMAGEBED_PHASE2_GUIDE.md` | 后端集成指南 |
| `IMAGEBED_PHASE3_COMPLETION.md` | 前端集成指南 |
| `IMAGEBED_PHASE4_TESTING_GUIDE.md` | 测试指南 |

---

## 💡 提示

- 集成前建议备份 `server.js` 和 `ImageManagerDialog.jsx`
- 按照文档中的代码位置标记进行集成
- 每完成一个步骤就测试一次
- 遇到问题参考故障排查部分

---

**预计完成时间**: 1-2 小时  
**难度**: 中等  
**风险**: 低
