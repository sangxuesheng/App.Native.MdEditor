# 移动端 & 平板端优化审计（2026-03-15）

面向“手机 + 平板（含 iPad/Android 平板）”的专项检查与落地建议清单。重点关注：断点策略、触控可用性、软键盘与视口、弹窗/抽屉、性能与资源加载。

## 范围与结论

### 本次检查范围
- 前端：`app/ui/frontend`（Vite + React）
- 服务端：`app/server/server.js`（静态资源 + API）
- 检查方式：静态扫描 + 关键入口/样式/交互组件人工阅读（不包含运行时真机调试结论）

### 已落地（2026-03-15）
- 断点统一：移动端单列从 `<=768px` 调整为 `<768px`（`max-width: 767px`），并在 CSS/JS 同步。
- 触控命中区：顶部工具栏按钮与主操作按钮在触控设备提升到 `44px` 级别。
- iOS 防缩放：触控设备文本输入统一 `font-size: 16px`，并提升文件树搜索框高度。
- Resizer：触控命中区扩大（不改变可视分隔线宽度）。
- 服务端缓存：`/assets/` hash 静态资源加入长期缓存（`immutable`），稳定静态资源加入 1 天缓存。

注：行号在后续改动中可能漂移，建议用文件内搜索关键字定位。

### 当前移动/平板适配的“做得不错”的基础
- 视口与键盘适配：用 `visualViewport` 动态写入 `--app-viewport-height` / `--app-keyboard-inset`，并对 iPhone Safari 地址栏高度异常做了保护（`app/ui/frontend/src/App.jsx:2218`）。
- Safe Area：全局 `env(safe-area-inset-*)` 变量与布局 padding 已覆盖工具栏/主内容/对话框（`app/ui/frontend/src/index.css:11`、`app/ui/frontend/src/App.css:118`、`app/ui/frontend/src/components/Dialog.css:14`）。
- 移动端单列体验：`mobile-single-column` + 编辑/预览切换 + 大纲抽屉/文件树抽屉 + 边缘滑动（`app/ui/frontend/src/App.jsx:7147`、`app/ui/frontend/src/App.css:757`）。
- 触控滚动与穿透治理：`overscroll-behavior` / `touch-action` + `usePreventScrollThrough`（`app/ui/frontend/src/hooks/usePreventScrollThrough.jsx:9`、`app/ui/frontend/src/App.css:804`）。

### 仍然值得继续优化的核心点（摘要）
1. 断点与布局策略需要持续收敛：已将“手机单列”阈值调整为 `<768px`，后续可继续补齐平板专属布局微调（见 P0-1）。
2. 触控命中区需要统一规范：已对顶部工具栏与主操作按钮在触控设备提升到 `44px` 级别，后续可继续覆盖更多“列表/卡片操作点”（见 P0-2）。
3. iOS 自动缩放治理：已对触控设备文本输入统一 `16px` 并提升文件树搜索框高度，后续可在真机上回归确认所有弹窗输入场景（见 P0-3）。
4. 工程内大量 `:hover` 样式未做 hover 能力门控，触屏设备上可能出现“粘滞 hover/误高亮”（全局普遍现象，例：`app/ui/frontend/src/App.css:223`）。
5. 仍有少量组件在移动/平板高度上使用 `100vh/100vh - xx`，与现有 `--app-viewport-height` 体系不一致，可能在地址栏/软键盘场景出现裁切（`app/ui/frontend/src/components/SettingsDialog.css:257` 等）。
6. 静态资源缓存策略：已对 `/assets/` hash 资源增加长期缓存，对稳定资源增加 1 天缓存；后续可再补充压缩（br/gzip）与字体加载策略（见 P1-4）。

## 优化清单（按优先级）

下面的优先级含义：
- P0：移动/平板“可用性/体验明显阻断”或影响面大，建议优先修
- P1：提升明显、风险可控，适合排入近期迭代
- P2：长线收益或需要较多改造，适合有节奏推进

### P0（优先处理）

#### P0-1 平板断点策略统一：避免 768px “夹层体验”
**现象**
- 此前 JS/CSS 在 `768px` 临界值存在“平板退化成手机单列”的风险；已统一为 `<768px`（`max-width: 767px`），让 iPad 竖屏更像平板而不是手机。
- 工程里还存在 `max-width: 767px` 的断点写法（`app/ui/frontend/src/components/ExportDialog.jsx:69`、`app/ui/frontend/src/App.jsx:4805`），导致 767/768 临界处行为不一致。

**建议**
- 明确并统一断点含义（建议一套即可）：
  - `mobile`: `< 768px`（`max-width: 767px` 或 `767.98px`）
  - `tablet`: `>= 768px && < 1024px`
  - `compact`: `< 1024px`（维持现有“抽屉/紧凑布局”概念）
- 同步调整：
  - `window.matchMedia('(max-width: 768px)')` 改为 `(max-width: 767px)`（`app/ui/frontend/src/App.jsx:1564`、`app/ui/frontend/src/App.jsx:2190` 等）
  - 相关 CSS `@media (max-width: 768px)` 改为 `@media (max-width: 767px)`，并对平板单独补充 `@media (min-width: 768px) and (max-width: 1024px)` 的布局微调
- 最终目标：平板竖屏不必强制单列，但仍可保持“紧凑模式”（抽屉、较小间距）以避免拥挤。

#### P0-2 触控命中区统一到 40-44px：顶部工具栏与主操作按钮
**现象**
- 顶部文件树按钮使用 `.btn-icon`（32x32）（`app/ui/frontend/src/App.css:209`、`app/ui/frontend/src/App.jsx:7091`）。
- 顶部“导出配置/发布/保存”按钮通过 inline style 固定 32px 高（`app/ui/frontend/src/App.jsx:7120`）。
- 编辑工具栏 `.toolbar-btn` 高度 28px（移动 compact 下 36px），仍偏小（`app/ui/frontend/src/components/EditorToolbar.css:53`、`app/ui/frontend/src/components/EditorToolbar.css:23`）。

**建议**
- 以 `@media (pointer: coarse)` 为主维度统一触控尺寸规范：
  - 关键按钮（顶部、底部、对话框关闭）最小 `44px`（或 `40px` 起步，44 更稳）
  - 图标按钮可保持视觉 28/32，但扩大 padding/伪元素命中区
- 避免用 inline style 写死高度，统一用 class + CSS（否则响应式很难覆盖）。

#### P0-3 输入框字体与高度：避免 iOS 自动缩放与误触
**现象**
- 文件树搜索框：高度 32px、字体 12px（`app/ui/frontend/src/components/FileSearchBox.css:6`）。
- 新建文件/文件夹等 `.form-input` 多为 14px（`app/ui/frontend/src/components/NewFileDialog.css:323`、`app/ui/frontend/src/components/NewFolderDialog.css:87`）。

**建议**
- 在触摸设备上（或 iOS UA/WebView 上）将输入框 `font-size` 提升到 `16px`，并适当增大高度（如 40-44px）。
- 参考现有轻量编辑器对 iOS 的处理方式：移动端将 textarea 设为 16px（`app/ui/frontend/src/components/LightweightEditor.css:36`）。

### P1（近期收益大）

#### P1-1 将残留的 `100vh` 统一到 `--app-viewport-height`
**现象**
- 部分弹窗在平板/移动下使用 `height: calc(100vh - xx)` 或 `max-height: 100vh`（例：`app/ui/frontend/src/components/SettingsDialog.css:257`、`app/ui/frontend/src/components/SaveAsDialog.css:324`、`app/ui/frontend/src/components/FileHistoryDialog.css:329`、`app/ui/frontend/src/components/FirstScreenLoader.css:14`、`app/ui/frontend/src/components/ai/ai-styles.css:116`、`app/ui/frontend/src/components/MenuBar.css:313`）。

**建议**
- 将这些高度逻辑替换为 `calc(var(--app-viewport-height) - ...)`，与现有 `visualViewport` 体系一致（`app/ui/frontend/src/App.jsx:2218`）。
- 保留 `svh/dvh` 作为兜底，但尽量只在一个体系里维护，减少“某些弹窗跟随、某些弹窗不跟随”的割裂。

#### P1-2 Hover 样式门控：避免触屏“粘滞 hover”
**现象**
- 工程中大量 `:hover`（顶部按钮、列表项、滚动条、卡片等）未通过 `(hover:hover)` 限制（例：`app/ui/frontend/src/App.css:223`、`app/ui/frontend/src/components/EditorToolbar.css:69`、`app/ui/frontend/src/components/FileTree.css:37`）。

**建议**
- 将 hover 效果包裹在：
  - `@media (hover: hover) and (pointer: fine) { ... }`
- 触摸设备保留 `:active`/按下反馈即可，避免视觉误导。

#### P1-3 分隔条（Resizer）触控命中区扩大
**现象**
- Resizer 可视宽度 4px，命中区仅通过 `left/right: -2px` 扩到 8px（`app/ui/frontend/src/components/Resizer.css:8`）。

**建议**
- 在 `@media (pointer: coarse)` 下将 `.resizer-handle` 扩大到 16-24px 命中区（视觉仍保持 4px 线）。

#### P1-4 服务端静态资源缓存策略（移动端二次打开明显变快）
**现象**
- 服务端对 `index.html` 做了 `no-cache`（很好），但对其他静态资源（JS/CSS/字体）未设置明确缓存头（`app/server/server.js:2898`）。
- Vite 构建产物的文件名带 hash（`app/ui/frontend/vite.config.js:32`），适合设置长期缓存。

**建议**
- 对 `dist/assets/*`（hash 资源）返回：
  - `Cache-Control: public, max-age=31536000, immutable`
- 对 `code-themes/`、`katex/`、`mathjax/` 等相对稳定资源设置至少 `max-age=86400` 或更长，减少移动端重复下载。

### P2（中长期/可选）

#### P2-1 移动端编辑器策略：考虑引入 LightweightEditor 作为“默认/可选”
**现象**
- 工程内已有 `LightweightEditor`（`app/ui/frontend/src/components/LightweightEditor.jsx:7`），但主应用当前仍以 Monaco 为主（`app/ui/frontend/src/App.jsx:65`、`app/ui/frontend/src/App.jsx:7346`）。

**建议**
- 在 `mobile-single-column` 下提供“轻量编辑模式”：
  - 默认轻量（首屏更快、内存更小）
  - 需要高级能力时再切 Monaco（按需加载 chunk）
- 平板端可保持 Monaco，但要确保触控命中区与软键盘场景体验稳定。

#### P2-2 资源加载与离线/弱网：Mermaid CDN 改为本地按需加载
**现象**
- `index.html` 通过 CDN 引入 Mermaid（`app/ui/frontend/index.html:18`），移动端在弱网/无外网场景可能失败。
- 代码中已有 `loadChunk('mermaid')` 的思路（`app/ui/frontend/src/utils/performanceOptimization.jsx:264`），但当前主逻辑使用 `window.mermaid`（`app/ui/frontend/src/App.jsx:45`）。

**建议**
- 统一 Mermaid 加载策略：优先本地 dynamic import，CDN 作为兜底（或完全移除 CDN，提升可控性）。

#### P2-3 减少“全局阻止缩放/手势”的副作用
**现象**
- viewport 设置 `maximum-scale=1.0`（`app/ui/frontend/index.html:6`），且移动端通过 `touchend` 阻止双击缩放（`app/ui/frontend/src/utils/performanceOptimization.jsx:287`）。

**建议**
- 评估是否必须禁用缩放（可访问性与可用性权衡）：
  - 如果要禁用，尽量用 `touch-action: manipulation` 精准作用在按钮/列表项上，而不是全局拦截双击。
  - 如果允许缩放，可移除 `maximum-scale` 与全局双击拦截，减少对系统手势的干扰。

#### P2-4 统一“减少动画”策略
**现象**
- 移动端会加 `.reduce-motion` class（`app/ui/frontend/src/utils/performanceOptimization.jsx:294`），但目前 CSS 未见对应全局降动效规则。
- 仅首屏 loader 对 `prefers-reduced-motion` 做了适配（`app/ui/frontend/src/components/FirstScreenLoader.css:272`）。

**建议**
- 增加全局 `prefers-reduced-motion` 与 `.reduce-motion` 的降级规则，覆盖主要 transition/animation，提升低端机与省电模式体验。

## 平板端专项策略（建议落地方式）

### 目标体验
- iPad/Android 平板横屏：默认双栏（文件树可折叠/半持久）、编辑预览可分栏，Resizer 可用且不难拖。
- 平板竖屏：不要被迫“手机单列”，但也不要硬塞三列；建议提供：
  - 双栏（编辑/预览）+ 抽屉式文件树
  - 或者单栏（编辑/预览）但保留“更大的触控按钮与更少的边距”，并提供快速切换

### 建议实现路线
1. 统一断点（先解决 767/768/1024 的一致性）
2. 把“平板模式”从 `isCompactViewport` 里拆出更明确的状态（比如 `isTabletCompactViewport` 已有，继续用它做平板专属微调）（`app/ui/frontend/src/App.jsx:1592`）
3. 平板专属 CSS：用 `@media (min-width: 768px) and (max-width: 1024px)` 做 spacing、按钮尺寸、面板宽度的微调

## 回归测试清单（移动/平板）

建议至少覆盖下面场景（含横竖屏切换与软键盘）：
- 手机：编辑/预览切换、文件树抽屉开合、边缘滑动、长按菜单、对话框输入（新建/重命名/保存/设置/历史）
- 平板竖屏：编辑/预览分栏策略是否合理、顶部工具栏是否拥挤、抽屉是否遮挡关键按钮
- 平板横屏：Resizer 拖拽、文件树侧栏/抽屉、导出配置面板开合后的布局稳定性
- 键盘：软键盘弹起时编辑区不被遮挡、关闭键盘后高度恢复；iOS Safari 地址栏收起/出现不导致半屏（`--app-viewport-height` 相关）
- 性能：首次打开（弱网/无外网）、二次打开（缓存是否生效）、大文件/大量图片/大量 mermaid 时的滚动与输入延迟

## 附录：关键文件速查

- 断点与视口：`app/ui/frontend/src/App.jsx:1560`、`app/ui/frontend/src/App.jsx:2186`、`app/ui/frontend/src/App.css:1435`
- 顶部工具栏：`app/ui/frontend/src/App.jsx:7089`、`app/ui/frontend/src/App.css:118`
- 移动端单列/抽屉：`app/ui/frontend/src/App.jsx:7147`、`app/ui/frontend/src/App.css:360`
- 通用对话框：`app/ui/frontend/src/components/Dialog.css:9`
- 文件树/搜索：`app/ui/frontend/src/components/FileTree.css:1`、`app/ui/frontend/src/components/FileSearchBox.css:6`
- 服务端静态资源：`app/server/server.js:78`、`app/server/server.js:2898`
