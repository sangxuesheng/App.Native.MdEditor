# COSE 集成开发计划

> Create Once, Sync Everywhere — 将 doocs/cose 的多平台文章同步能力集成到本项目 Markdown 编辑器中

---

## 一、COSE 项目深度分析

### 1.1 项目本质

cose 是一个 **Chrome 浏览器扩展**（Manifest V3），核心能力：
- 读取 doocs/md 编辑器中的文章内容（标题 + HTML 正文 + Markdown 原文 + 微信公众号格式 HTML）
- 通过 `chrome.scripting.executeScript` 在各平台的 Tab 页注入脚本，自动填写标题和正文
- 支持登录状态检测，同步前提示用户哪些平台已登录

### 1.2 技术架构

```
cose/
├── apps/extension/
│   ├── src/background.js    # Service Worker：消息调度、平台同步逻辑（核心）
│   ├── src/content.js       # Content Script：注入所有页面，桥接页面 ↔ 扩展
│   ├── src/inject.js        # 注入脚本：在平台页面填写内容
│   └── src/offscreen.js     # Offscreen Document：登录检测等需要 DOM 的操作
├── packages/core/
│   └── src/platforms/       # 30+ 平台的同步函数
└── packages/detection/
    └── src/platforms/       # 30+ 平台的登录状态检测
```

### 1.3 消息通信协议（核心）

cose content.js 监听 `window.postMessage`，通过字段 `source: 'cose-page'` 识别来源，
响应时返回 `source: 'cose-extension'`。每条消息带唯一 `requestId` 用于匹配响应。

```js
// 页面 → 扩展：获取平台列表
window.postMessage({ source: 'cose-page', type: 'GET_PLATFORMS', requestId: 'r1' }, '*')

// 页面 → 扩展：渐进式检测登录状态（推荐）
window.postMessage({
  source: 'cose-page',
  type: 'CHECK_PLATFORM_STATUS_PROGRESSIVE',
  requestId: 'r2',
  payload: { platforms: [...] }
}, '*')

// 页面 → 扩展：开始同步批次（重置 Tab 分组）
window.postMessage({ source: 'cose-page', type: 'START_SYNC_BATCH', requestId: 'r3' }, '*')

// 页面 → 扩展：同步到指定平台
window.postMessage({
  source: 'cose-page',
  type: 'SYNC_TO_PLATFORM',
  requestId: 'r4',
  payload: {
    platformId: 'wechat',
    content: {
      title: '文章标题',
      body: '<p>渲染后 HTML</p>',
      markdown: '# 原始 Markdown',
      wechatHtml: '<p style="...">带内联样式的 HTML</p>'
    }
  }
}, '*')

// 扩展 → 页面：请求响应
window.postMessage({ source: 'cose-extension', requestId: 'r4', result: { success: true } }, '*')

// 扩展 → 页面：渐进式登录状态推送（每个平台检测完立即推）
window.postMessage({
  source: 'cose-extension',
  type: 'PLATFORM_STATUS_UPDATE',
  platformId: 'wechat',
  result: { loggedIn: true, username: '用户名', avatar: '头像URL' },
  completed: 5, total: 30
}, '*')

// 扩展 → 页面：全部检测完成
window.postMessage({ source: 'cose-extension', type: 'PLATFORM_STATUS_COMPLETE', total: 30 }, '*')
```

### 1.4 平台数据结构

```js
{
  id: 'wechat',          // 唯一标识
  name: 'WeChat',         // 英文名
  title: '微信公众号',    // 中文显示名
  icon: 'https://...',   // 平台图标 URL
  url: 'https://...',    // 平台主页
  publishUrl: 'https://...' // 发布/编辑页面 URL
}
```

### 1.5 支持的 30+ 平台（已验证）

| 类别 | 平台 |
|------|------|
| 媒体 | 微信公众号、今日头条、知乎、抖音文章、小红书、百家号、网易号、搜狐号、微博文章、B站专栏、少数派、X/Twitter |
| 博客 | CSDN、博客园、掘金、Medium、思否、InfoQ、简书、开源中国、51CTO |
| 云平台 | 腾讯云、阿里云、华为云、华为开发者、百度云千帆、支付宝开放平台、魔搭社区、火山引擎、电子发烧友 |

### 1.6 内容格式分层

| 格式 | 字段 | 使用平台 |
|------|------|---------|
| 渲染后 HTML | `body` | CSDN、掘金、知乎、InfoQ 等 |
| 微信样式 HTML | `wechatHtml` | 微信、搜狐、百家号、抖音、小红书、B站等 |
| Markdown 原文 | `markdown` | 腾讯云、阿里云、思否、博客园、火山引擎等 |
| 文章标题 | `title` | 所有平台 |

**本项目现有能力对应关系：**
- `title` → 当前文件名（去掉 `.md` 扩展名）
- `body` → unified 渲染后的 HTML（`previewHtml` state）
- `markdown` → Monaco Editor 中的原始内容（`content` state）
- `wechatHtml` → `wechatExporter.js` 中的 `processForWeChat()` 函数（**已有完整实现**）

---

## 二、集成方案

### 2.0 关于「不安装扩展」的可行性分析

**核心问题**：COSE 同步平台的技术原理是 `chrome.scripting.executeScript`，
即在用户已登录的浏览器标签页中注入 JS 脚本填写内容。
这个能力是**浏览器扩展的专属权限**，普通 Web 应用无法获得。

下表列出了「不安装扩展」的各种替代思路及其可行性：

| 方案 | 原理 | 可行性 | 致命问题 |
|------|------|--------|----------|
| 服务端 Puppeteer | NAS 服务器跑无头浏览器 | ❌ 不可行 | 服务端没有用户的登录 Cookie，每次需重新登录，面临验证码/设备风控 |
| 直接调用平台 API | 通过后端 HTTP 请求发布 | ❌ 几乎不可行 | 各平台无公开发布 API（或需资质申请），COSE 用注入方式正是因为 API 不可用 |
| 书签小工具（Bookmarklet） | 用户点击书签执行 JS | ⚠️ 极度受限 | 现代浏览器严格限制 bookmarklet 跨页面操作，无法打开新标签页并注入 |
| 用户脚本（Tampermonkey） | 类扩展的用户脚本管理器 | ⚠️ 仍需安装 | 本质上还是要安装 Tampermonkey 扩展，体验不比直接用 COSE 好 |
| Web Serial/USB API | 通过硬件通道控制浏览器 | ❌ 完全不可行 | 与需求无关 |

**结论**：实现「一键同步到多平台，且不需要安装任何浏览器扩展」，
在现有 Web 技术条件下**没有轻量可行的方案**。
COSE 选择做扩展，正是因为这是**唯一能在用户已登录浏览器环境中操作第三方网站的技术路径**。

**折中建议（降低安装门槛）**：
- COSE 已上架 Chrome Web Store，安装只需一次点击，约 10 秒完成
- 可在 UI 中内嵌安装引导（一键跳转商店页面），大幅降低用户感知摩擦
- 安装后永久有效，不影响日常使用
- 如果目标用户只是自己，安装一次扩展是完全可接受的成本

---

### 2.1 方案选择：适配 COSE 扩展协议（推荐）

本项目是 NAS 上的 Web 应用，最轻量的集成路径是适配 COSE 的 postMessage 协议。

**关键可行性依据**：COSE content.js 配置为注入所有 `http://*/*` 和 `https://*/*` 页面，
因此本项目所有运行环境均天然被注入，postMessage 协议直接可用：

| 环境 | 地址 | COSE 是否注入 |
|------|------|---------------|
| NAS 生产环境 | `http://192.168.2.2:18080/` | ✅ 匹配 `http://*/*` |
| 本地开发模式 | `http://localhost:3000/` | ✅ 匹配 `http://*/*` |
| 本地开发模式 | `http://127.0.0.1:3000/` | ✅ 匹配 `http://*/*` |

```
本项目前端（NAS http://192.168.2.2:18080 或 开发 http://localhost:3000）
    ↓  window.postMessage({ source: 'cose-page', ... })
COSE content.js（注入到本项目页面的 Chrome 扩展）
    ↓  chrome.runtime.sendMessage
COSE background.js（Service Worker）
    ↓  chrome.tabs.create + chrome.scripting.executeScript
各平台网站（自动填写标题和正文，自动保存草稿）
```

### 2.2 工作量评估

| 工作项 | 预估工时 |
|--------|----------|
| coseClient.js 通信封装 | 4小时 |
| SyncDialog.jsx UI 组件 | 1天 |
| SyncDialog.css 样式 | 半天 |
| contentPacker.js 内容打包 | 2小时 |
| MenuBar 添加"发布"入口 | 1小时 |
| App.jsx 状态集成 | 2小时 |
| COSE 未安装引导页面 | 2小时 |
| 联调测试 | 1天 |
| **合计** | **约 4-5 天** |

---

## 三、详细开发任务

### Phase 1：通信桥接层

#### 1.1 新建 `src/utils/coseClient.js`

封装与 COSE 扩展的 postMessage 通信为 Promise 接口：

```js
// src/utils/coseClient.js
const COSE_PAGE   = 'cose-page'
const COSE_EXT    = 'cose-extension'
let reqCounter    = 0

function sendMessage(type, payload = null, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const requestId = `cose_${++reqCounter}_${Date.now()}`
    const timer = setTimeout(() => {
      window.removeEventListener('message', handler)
      reject(new Error('COSE 扩展未响应，请确认已安装并启用 COSE 扩展'))
    }, timeoutMs)
    const handler = (e) => {
      if (e.source !== window) return
      if (!e.data || e.data.source !== COSE_EXT) return
      if (e.data.requestId !== requestId) return
      clearTimeout(timer)
      window.removeEventListener('message', handler)
      e.data.error ? reject(new Error(e.data.error)) : resolve(e.data.result)
    }
    window.addEventListener('message', handler)
    window.postMessage({ source: COSE_PAGE, type, requestId, payload }, '*')
  })
}

export async function detectCOSE(timeout = 2000) {
  try { await sendMessage('GET_PLATFORMS', null, timeout); return true }
  catch { return false }
}
export const getPlatforms = ()                    => sendMessage('GET_PLATFORMS')
export const startSyncBatch = ()                  => sendMessage('START_SYNC_BATCH')
export const syncToPlatform = (platformId, content) =>
  sendMessage('SYNC_TO_PLATFORM', { platformId, content }, 60000)

export function checkPlatformsProgressive(platforms, onUpdate, onComplete) {
  const handler = (e) => {
    if (!e.data || e.data.source !== COSE_EXT) return
    if (e.data.type === 'PLATFORM_STATUS_UPDATE')  onUpdate?.(e.data)
    if (e.data.type === 'PLATFORM_STATUS_COMPLETE') {
      window.removeEventListener('message', handler)
      onComplete?.()
    }
  }
  window.addEventListener('message', handler)
  return sendMessage('CHECK_PLATFORM_STATUS_PROGRESSIVE', { platforms })
}
```

#### 1.2 新建 `src/utils/contentPacker.js`

```js
// src/utils/contentPacker.js
import { processForWeChat } from './wechatExporter'

export async function packContent({ title, markdown, renderedHtml, primaryColor = '#0F4C81' }) {
  const wechatHtml = await processForWeChat(renderedHtml, primaryColor)
  return {
    title: title || '无标题',
    body: renderedHtml,
    markdown,
    wechatHtml
  }
}
```

---

### Phase 2：UI 组件

#### 2.1 新建 `src/components/SyncDialog.jsx`

**功能设计**：

```
┌─────────────────────────────────────────┐
│  发布到平台                          [×] │
├─────────────────────────────────────────┤
│  [全选] [取消全选]   [重新检测]          │
├─────────────────────────────────────────┤
│  ☑ 🔵 微信公众号    ✓ 已登录 张三      │
│  ☑ 🟠 CSDN         ✓ 已登录 user123    │
│  ☐ 🔴 掘金          未登录             │
│  ☐ 📋 今日头条      检测中...          │
│  ... （30+ 平台，可滚动）              │
├─────────────────────────────────────────┤
│  已选 2 个平台                          │
│                       [开始同步]         │
└─────────────────────────────────────────┘

同步进行中：
┌─────────────────────────────────────────┐
│  ✅ 微信公众号  已同步并保存为草稿       │
│  ⏳ CSDN       同步中...               │
│  ❌ 掘金        同步失败：未找到编辑器  │
└─────────────────────────────────────────┘
```

**状态设计**：
```js
const [coseInstalled, setCoseInstalled] = useState(null)  // null=检测中, true/false
const [platforms, setPlatforms] = useState([])            // 全部平台列表
const [loginStatus, setLoginStatus] = useState({})        // { platformId: { loggedIn, username, avatar } }
const [detectProgress, setDetectProgress] = useState({ done: 0, total: 0 })
const [selected, setSelected] = useState(new Set())       // 已勾选的 platformId
const [syncResults, setSyncResults] = useState({})        // { platformId: { status, message } }
const [isSyncing, setIsSyncing] = useState(false)
```

**组件行为**：
1. 对话框打开时，调用 `detectCOSE()` 检测扩展
2. 检测成功后，调用 `getPlatforms()` 获取平台列表
3. 立即调用 `checkPlatformsProgressive()` 开始渐进式登录检测
4. 每个平台检测结果返回后，更新 loginStatus，自动勾选已登录平台
5. 用户点击「开始同步」：
   - 调用 `packContent()` 打包内容（含 wechatHtml，耗时操作，需 loading 提示）
   - 调用 `startSyncBatch()` 重置 Tab 分组
   - 遍历已选平台，逐个调用 `syncToPlatform()`，实时更新结果

---

### Phase 3：与主应用集成

#### 3.1 修改 `MenuBar.jsx`

在菜单栏添加「发布」按钮（位置：文件菜单右侧，或工具栏末尾）：

```jsx
// 在 MenuBar.jsx 的合适位置添加
<button
  className="menu-button publish-btn"
  onClick={onPublish}
  title="发布到多个平台 (需要 COSE 扩展)"
>
  发布
</button>
```

#### 3.2 修改 `App.jsx`

```jsx
// 添加 SyncDialog 导入
import SyncDialog from './components/SyncDialog'

// 添加状态
const [showSyncDialog, setShowSyncDialog] = useState(false)

// 传给 MenuBar
<MenuBar
  ...
  onPublish={() => setShowSyncDialog(true)}
/>

// 在 JSX 末尾添加
{showSyncDialog && (
  <SyncDialog
    onClose={() => setShowSyncDialog(false)}
    title={currentPath ? currentPath.split('/').pop().replace(/\.md$/, '') : '无标题'}
    markdown={content}
    renderedHtml={previewHtml}
  />
)}
```

---

## 四、关键问题点与应对方案

### 问题 1：COSE 扩展未安装

**现象**：`detectCOSE()` 超时（2秒内无响应）

**应对**：
- SyncDialog 显示「未检测到 COSE 扩展」提示
- 提供 Chrome Web Store 安装链接：
  `https://chromewebstore.google.com/detail/ilhikcdphhpjofhlnbojifbihhfmmhfk`
- 提供开发者模式手动加载说明
- 检测按钮允许用户安装后手动重新检测

---

### 问题 2：wechatHtml 生成耗时

**现象**：`processForWeChat()` 需要运行 juice CSS 内联，文章较长时可能需要 1-3 秒

**应对**：
- 「开始同步」点击后，先显示「正在准备内容...」loading 状态
- `packContent()` 完成后再开始逐平台同步
- 可考虑在 SyncDialog 打开时就开始预处理，用户选择平台期间完成准备

---

### 问题 3：HTTP 局域网/本地环境的兼容性

**分析**：COSE manifest.json 的 content_scripts 配置为：
```json
"matches": ["http://*/*", "https://*/*"]
```
这意味着 content.js **会注入到以下所有地址**：

| 环境 | 地址 | 说明 |
|------|------|------|
| NAS 生产 | `http://192.168.2.2:18080/` | 局域网 IP，HTTP |
| 本地开发 | `http://localhost:3000/` | 本机，HTTP |
| 本地开发 | `http://127.0.0.1:3000/` | 本机，HTTP |

**潜在问题**：Chrome 对局域网 IP（非 localhost）的 HTTP 页面有时会有额外安全限制。

**验证方式**：安装 COSE 后，分别在 NAS 地址和 localhost 开发地址打开 DevTools，
检查 Console 是否有 `[COSE Content Script] Loaded!` 日志。

**应对方案**：
- `localhost:3000` 通常无问题，优先在开发环境验证
- 若 NAS 的局域网 IP 注入失败：在 Chrome 扩展管理页面，找到 COSE 扩展，
  开启「允许访问文件网址」选项
- 长期方案：为 NAS 配置 HTTPS（安全性更好，且完全消除此类问题）

---

### 问题 4：平台登录状态需要用户先登录各平台

**现象**：COSE 是「填写内容」工具，不是「自动登录」工具。
用户需要在浏览器中已登录各平台，COSE 才能检测到登录状态并成功填写。

**应对**：
- UI 上清晰说明：「请先在浏览器中登录目标平台」
- 对于「未登录」的平台，允许用户手动勾选强制同步（COSE 会打开登录页面）
- 登录状态图标颜色区分：绿色=已登录，灰色=未登录，黄色=检测中

---

### 问题 5：部分平台同步成功率问题

**现象**：各平台的编辑器（ProseMirror / CodeMirror / UEditor / 自研）行为不同，
部分平台的 paste 事件注入不一定100%成功（尤其是框架版本更新后）。

**应对**：
- 同步后提示用户「请检查内容是否完整」
- 对于失败的平台，显示具体错误信息
- 微信公众号是最重要的平台，COSE 有专门的重试逻辑，成功率高
- 建议用户同步后手动检查一遍再发布

---

### 问题 6：COSE 仓库更新后如何跟进

**核心原则**：本项目只依赖 COSE 的 **postMessage 通信协议**，不依赖其内部实现。
只要 COSE 不改变通信协议（极少发生），本项目无需任何改动。

**需要关注的更新类型**：

| 更新类型 | 影响 | 处理方式 |
|----------|------|----------|
| 新增平台 | 自动获益（下次用户打开同步面板即可看到新平台） | 无需改动 |
| 修复某平台同步 | 自动获益 | 无需改动 |
| 通信协议变更（极少） | 需要同步更新 `coseClient.js` | 监控 COSE 的 CHANGELOG |
| 平台对象字段变更 | 可能影响 UI 显示 | 做好字段空值处理 |

**建议**：
- 在项目文档中记录当前适配的 COSE 版本
- 关注 COSE 仓库的 Release 和 CHANGELOG
- 定期（每月）检查 COSE 是否有 Breaking Change
- GitHub 仓库可设置 Watch → Releases 接收更新通知

**监控 COSE 通信协议变化的方式**：
```bash
# 检查 content.js 的消息处理逻辑是否变化
git diff HEAD~1 HEAD -- apps/extension/src/content.js
```

---

### 问题 7：性能 — wechatHtml 的重复生成

**现象**：用户每次打开 SyncDialog 都要重新生成 wechatHtml，
对于长文章（如 10000 字+），juice CSS 内联耗时可能较长。

**应对**：
- 缓存最后一次生成的 wechatHtml，与 markdown 内容做哈希比对
- 若内容未变化，直接使用缓存结果
- 或在用户点击「发布」按钮时才触发生成（避免提前消耗资源）

---

### 问题 8：同步对话框中的图片问题

**现象**：本项目的图片存储在 NAS 本地，图片 URL 为内网地址
（如 `http://192.168.2.2:18080/api/images/xxx.png`）。
这些图片 URL 在各平台服务器无法访问，导致图片无法显示。

**应对方案**（优先级排序）：
1. **短期**：在同步面板添加提示「内网图片在外网平台不可见，建议先上传到公网图床」
2. **中期**：集成图床上传功能（如七牛云、阿里云 OSS），在打包内容时自动将内网图片上传并替换 URL
3. **长期**：在 `contentPacker.js` 中增加图片 URL 替换逻辑

---

## 五、开发路线图

```
第1天
  ├── 创建 src/utils/coseClient.js（通信封装）
  ├── 创建 src/utils/contentPacker.js（内容打包）
  └── 基础测试：确认 COSE 扩展在本项目页面可正常通信

第2天
  ├── 创建 SyncDialog.jsx（骨架 + COSE 检测 + 安装引导）
  └── 实现平台列表展示 + 渐进式登录状态检测

第3天
  ├── 实现平台勾选逻辑（全选/取消/单选）
  └── 实现「开始同步」流程（内容打包 → 逐平台同步 → 结果展示）

第4天
  ├── SyncDialog.css 样式（三主题适配）
  ├── MenuBar.jsx 添加「发布」按钮
  └── App.jsx 集成 SyncDialog

第5天
  ├── 完整功能联调（至少测试微信、CSDN、掘金）
  ├── 边界情况处理（扩展未安装、网络超时、内容过长等）
  └── 构建部署验证
```

---

## 六、文件清单

### 新增文件

```
app/ui/frontend/src/
├── utils/
│   ├── coseClient.js          # COSE 通信封装（Promise API）
│   └── contentPacker.js       # 文章内容打包（title/body/markdown/wechatHtml）
└── components/
    ├── SyncDialog.jsx          # 发布对话框主组件
    └── SyncDialog.css          # 对话框样式（三主题适配）
```

### 修改文件

```
app/ui/frontend/src/
├── components/
│   └── MenuBar.jsx             # 添加「发布」按钮及 onPublish prop
└── App.jsx                     # 引入 SyncDialog，添加 showSyncDialog 状态
```

---

## 七、快速验证方法

开始开发前，先用以下方式验证 COSE 扩展是否能在本项目页面正常工作。
**建议优先在本地开发环境（localhost:3000）验证，再验证 NAS 生产环境。**

**Step 1：确认 COSE content script 已注入**

打开目标页面（`http://localhost:3000/` 或 `http://192.168.2.2:18080/`），
打开 DevTools → Console，查看是否有以下日志：
```
[COSE Content Script] Loaded!
[COSE Content Script] URL: http://localhost:3000/
```
如果没有，说明扩展未注入，参考「问题 3」的应对方案。

**Step 2：测试 postMessage 通信**

在 DevTools Console 中执行：
```js
// 监听 COSE 响应
window.addEventListener('message', e => {
  if (e.data?.source === 'cose-extension') {
    console.log('✅ COSE 响应成功:', e.data)
  }
})

// 请求平台列表
window.postMessage({ source: 'cose-page', type: 'GET_PLATFORMS', requestId: 'test_001' }, '*')

// 预期：约 500ms 内看到包含 30+ 平台的响应
// 如果 2 秒内没有响应，说明通信不通
```

**两个环境的验证状态记录**：

| 环境 | 地址 | content script 注入 | postMessage 通信 |
|------|------|---------------------|------------------|
| 本地开发 | `http://localhost:3000/` | 待验证 | 待验证 |
| NAS 生产 | `http://192.168.2.2:18080/` | 待验证 | 待验证 |

---

## 八、参考资源

| 资源 | 地址 |
|------|------|
| COSE GitHub 仓库 | https://github.com/doocs/cose |
| COSE Chrome 扩展 | https://chromewebstore.google.com/detail/ilhikcdphhpjofhlnbojifbihhfmmhfk |
| COSE 视频教程 | https://www.bilibili.com/video/BV1ZxqnB1E2C/ |
| doocs/md 编辑器 | https://github.com/doocs/md |

---

*文档版本：v1.0*  
*生成日期：2026-03-12*  
*适配 COSE 版本：main branch（截至 2026-02-24 最新 push）*
