# GPT5.4-专注模式与移动端开发计划（兼容现有架构版）

> 目标：在现有“左右布局（预览 + 编辑）”基础上新增“专注模式”，并补齐移动端方案。  
> 强约束：**不通过给 `app/ui/frontend/src/App.jsx` 堆业务逻辑来实现功能**，新增逻辑模块化外置。

---

## 1. 需求确认与范围

### 1.1 当前已存在能力（必须复用）
- 现有布局状态：`vertical | editor-only | preview-only`
- 移动端基础设施：`mobileActivePane`
- 响应式判定：`isAdaptiveSinglePaneViewport`
- 现有移动端手势切换机制

### 1.2 新增能力
- 新增专注模式（Focus Mode）
  - 目标是隐藏非必要 UI，提升沉浸编辑/阅读体验
  - 专注模式是“显示状态”，不是重建一套布局体系

### 1.3 非功能约束
- `App.jsx` 最小修改（建议控制在 **≤7行新增**）
- 通过特性开关控制（支持动态启用/禁用）
- 有明确回滚路径（关闭开关即恢复旧行为）
- 零回归：原有布局与移动端交互不破坏

---

## 2. 状态模型（修正版）

## 2.1 统一原则
**保留现有 `layout` 状态，不重定义并行模型。**

建议：
- 继续使用：`layout = 'vertical' | 'editor-only' | 'preview-only'`
- 新增：
  - `isFocusMode: boolean`（是否进入专注模式）
  - `focusTarget?: 'editor' | 'preview'`（专注时优先显示目标，可选）

这样可避免：
- 与现有布局逻辑冲突
- `editor-only/preview-only` 语义重复
- 状态机复杂度上升

## 2.2 特性开关
新增配置（示意）：
- `features.focusMode.enabled = true/false`

行为约定：
- `enabled = false`：隐藏所有专注模式入口，完全走旧逻辑
- `enabled = true`：按新逻辑工作
- 支持运行时开关，便于灰度与回滚

---

## 3. 架构实现策略（App.jsx 不增肥）

## 3.1 目录与模块
建议新增：
- `src/components/focusMode/FocusModeLayer.jsx`
  - 负责专注态 UI 收敛（隐藏侧栏/工具栏/状态区）
- `src/components/focusMode/FocusModeToggle.jsx`
  - 专注模式入口（按钮/菜单项）
- `src/hooks/useFocusModeHandler.js`
  - 管理 `isFocusMode`、快捷键、持久化、生命周期副作用
- `src/utils/focusModeFeatureFlag.js`
  - 专注模式开关读取与兼容处理

## 3.2 App.jsx 改动边界
`App.jsx` 仅允许：
1. 引入 `useFocusModeHandler` 与 `FocusModeLayer`
2. 在根容器挂载专注态 class 或包裹层
3. 透传现有必要状态（`layout/mobileActivePane/isAdaptiveSinglePaneViewport`）

禁止：
- 在 `App.jsx` 新增专注模式业务分支树
- 在 `App.jsx` 直接处理移动端键盘适配
- 在 `App.jsx` 编写手势细节

---

## 4. 桌面端开发计划

## 阶段 A：状态与交互定义（0.5 天）
- 在不改 `layout` 语义前提下新增 `isFocusMode`
- 快捷键：
  - `Ctrl/Cmd + Shift + F` 切换专注模式
  - `Esc` 退出专注模式
- 入口：视图菜单 + 工具栏按钮（受 feature flag 控制）

交付物：
- 状态流转图
- 快捷键冲突清单

## 阶段 B：UI 收敛层实现（1 天）
- 实现 `FocusModeLayer`：
  - 隐藏非必要 UI（侧栏、非关键工具、状态区）
  - 保留核心编辑与预览能力
- 不改动原布局组件核心职责

交付物：
- 桌面端专注模式可切换
- 退出路径完整（快捷键/按钮）

## 阶段 C：一致性与可访问性（0.5 天）
- 保证切换不丢失：
  - 光标
  - 滚动位置
  - 未保存内容
- A11y：aria-label、焦点回退、可键盘操作

交付物：
- 回归检查表
- A11y 检查结论

---

## 5. 大屏专注优化与移动端零变化保障（新增）

## 5.1 大屏专注优化（仅大屏生效）
- 新增大屏专注增强配置（示意）：
  - `features.focusMode.widescreen.enabled`
  - `features.focusMode.widescreen.cursorCentering`（默认 `false`）
- 仅在大屏断点（建议 `>=1440px`）启用：
  - 正文列宽收敛（建议 `max-width: 72~88ch`）
  - 内容容器水平居中
  - 可选“插入点跟随居中”（Typewriter scrolling）

## 5.2 移动端零结构变化原则
- 大屏专注增强**不作用于移动端**，移动端保持现有机制：
  - 继续使用 `mobileActivePane`
  - 继续使用 `isAdaptiveSinglePaneViewport`
  - 继续使用现有手势切换
- 禁止因大屏优化引入移动端新导航体系（如重建底部 Tab 体系）

## 5.3 强制保护条件（防误伤）
- 当 `isAdaptiveSinglePaneViewport === true` 时：
  - 强制禁用 `widescreen` 相关样式
  - 强制禁用 `cursorCentering` 滚动策略
- 目标：确保移动端“零结构改动、零交互重构”

---

## 6. 移动端开发计划（复用现有机制）

## 阶段 M1：复用现有移动架构（0.5 天）
- 复用 `mobileActivePane` 管理专注态下的展示面
- 复用 `isAdaptiveSinglePaneViewport` 判定逻辑
- 复用既有手势切换，仅补充专注态边界规则

交付物：
- 移动端专注态交互图（基于现有流程）

## 阶段 M2：专注态移动 UI 优化（1 天）
- 专注态下收敛顶部/底部非核心控件
- 保留必要退出入口（避免“迷失”）
- 不新增一套独立 Tab 架构，避免重复建设

交付物：
- 与现有移动流程兼容的专注 UI

## 阶段 M3：键盘与性能优化（1 天）
- 键盘适配：处理可视区变化、避免输入遮挡
- 优化重绘：使用 class 切换优先，减少频繁布局计算
- 专注态暂停非必要后台任务（可选）

交付物：
- 键盘场景稳定
- 切换与滚动流畅

## 阶段 M4：兼容测试（0.5~1 天）
- iOS Safari / Android Chrome
- 竖屏/横屏
- 键盘弹出/收起
- 大文档连续编辑

交付物：
- 测试报告
- 缺陷与修复记录

---

## 7. 性能与质量门槛（新增）

建议验收指标：
- 切换延迟 P95 < 100ms
- 关键交互保持 60FPS（移动端）
- 连续切换 30 次无状态错乱
- 进入专注后无明显额外内存飙升

建议监控点：
- 专注模式进入率/停留时长
- 移动端键盘场景报错率
- 切换失败率与回退次数

---

## 8. 任务拆分（可直接进迭代）

- 任务1：实现 `useFocusModeHandler`（状态、快捷键、持久化）
- 任务2：实现 `FocusModeLayer`（UI 收敛层）
- 任务3：接入 feature flag（动态启停 + 回滚）
- 任务4：移动端复用 `mobileActivePane` 的专注态联调
- 任务5：键盘适配与性能优化
- 任务6：回归测试 + 兼容测试 + 性能验证

---

## 9. 风险与对策

- 风险：与现有 `layout` 逻辑耦合，改动引发回归  
  对策：仅新增 `isFocusMode` 显示态，不改 `layout` 语义。

- 风险：移动端改造重复建设  
  对策：复用 `mobileActivePane` 与现有手势机制，禁止重做一套导航体系。

- 风险：开关失效导致线上不可控  
  对策：专注模式所有入口都挂在 feature flag 下，并验证动态禁用可即时回退。

- 风险：高频切换卡顿  
  对策：以 class 切换驱动样式收敛，减少 JS 重算与多余重绘。

---

## 10. 结论

本版计划已吸收改进意见：
- 兼容现有状态模型（不重建并行布局体系）
- 复用现有移动端基础设施（不重复造轮子）
- 明确特性开关、动态启停、回滚机制
- 强化性能指标与验收门槛

可在 **不让 `App.jsx` 继续膨胀** 的前提下，完成专注模式与移动端能力升级。
