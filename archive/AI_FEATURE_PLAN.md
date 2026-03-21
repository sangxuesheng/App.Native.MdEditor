# AI 功能开发计划 - Markdown 编辑器

## 📋 项目概述

为飞牛 NAS Markdown 编辑器添加 AI 对话助手功能，提供智能写作辅助。

**参考项目**：Doocs MD 编辑器的 AI 对话助手  
**当前版本**：v1.27.65  
**目标版本**：v1.28.0

---

## 🎯 功能规划

### 核心功能（MVP）

#### 1. AI 对话面板 ⭐⭐⭐⭐⭐
- **位置**：右侧侧边栏（可展开/收起）
- **功能**：
  - 多轮对话
  - 流式响应（SSE）
  - 会话管理（保存/加载/删除）
  - 引用全文功能

#### 2. 快捷指令 ⭐⭐⭐⭐⭐
- **预设指令**：
  - 润色文本
  - 翻译成英文
  - 翻译成中文
  - 总结内容
  - 扩写内容
  - 改写内容
- **自定义指令**：支持用户添加

#### 3. AI 服务配置 ⭐⭐⭐⭐⭐
- **内置服务**（免费）：
  - 端点：`https://proxy-ai.doocs.org/v1`
  - 无需 API Key
  - 26+ 个模型可选
- **商业服务**：
  - OpenAI
  - DeepSeek
  - 通义千问
  - 其他主流 AI 服务

#### 4. 选中文本处理 ⭐⭐⭐⭐
- 选中文本后显示 AI 工具按钮
- 快速应用快捷指令
- 一键插入 AI 回复

---

## 🏗️ 技术架构

### 组件结构

```
App.jsx (主应用)
├─ Toolbar (工具栏)
├─ Editor (Monaco Editor)
├─ Preview (预览区)
└─ AISidebar (AI 侧边栏) ← 新增
    ├─ AIToggleButton (展开/收起按钮)
    ├─ AIChatPanel (对话面板)
    │   ├─ ChatMessages (消息列表)
    │   ├─ QuickCommands (快捷指令)
    │   ├─ ChatInput (输入框)
    │   └─ ChatControls (控制按钮)
    └─ AIConfigPanel (配置面板)
```

### 数据流

```
用户输入
    ↓
AIChatPanel
    ↓
useAIChat Hook
    ↓
AI Service (fetch SSE)
    ↓
流式响应
    ↓
更新消息列表
    ↓
显示给用户
```

---

## 📝 实施计划

### 阶段 1：基础架构（4 小时）

#### 1.1 创建 AI 相关文件结构
```
app/ui/frontend/src/
├─ components/
│   └─ ai/
│       ├─ AISidebar.jsx          (AI 侧边栏容器)
│       ├─ AIToggleButton.jsx     (展开/收起按钮)
│       ├─ AIChatPanel.jsx        (对话面板)
│       ├─ AIConfigPanel.jsx      (配置面板)
│       ├─ ChatMessage.jsx        (单条消息)
│       └─ QuickCommand.jsx       (快捷指令按钮)
├─ hooks/
│   ├─ useAIChat.js               (对话逻辑)
│   ├─ useAIConfig.js             (配置管理)
│   └─ useQuickCommands.js        (快捷指令)
├─ utils/
│   ├─ aiService.js               (AI 服务调用)
│   └─ aiStorage.js               (会话存储)
└─ constants/
    └─ aiConfig.js                (AI 配置常量)
```

#### 1.2 实现基础 UI
- AI 侧边栏容器
- 展开/收起动画
- 基础样式

---

### 阶段 2：AI 对话功能（6 小时）

#### 2.1 实现流式对话
```javascript
// useAIChat.js
export function useAIChat() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  
  async function sendMessage(content) {
    // 添加用户消息
    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    
    // 创建 AI 回复消息
    const aiMsg = { role: 'assistant', content: '', done: false }
    setMessages(prev => [...prev, aiMsg])
    
    // 流式响应
    await streamResponse(aiMsg)
  }
  
  async function streamResponse(aiMsg) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [...messages],
        stream: true,
      }),
    })
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))
          const content = data.choices[0]?.delta?.content
          if (content) {
            aiMsg.content += content
            setMessages([...messages])
          }
        }
      }
    }
    
    aiMsg.done = true
  }
  
  return { messages, sendMessage, isStreaming }
}
```

#### 2.2 实现会话管理
```javascript
// useAIStorage.js
export function useAIStorage() {
  function saveConversation(id, messages) {
    const conversations = JSON.parse(localStorage.getItem('ai_conversations') || '{}')
    conversations[id] = {
      id,
      messages,
      timestamp: Date.now(),
      title: messages[0]?.content.slice(0, 20) || '新对话',
    }
    localStorage.setItem('ai_conversations', JSON.stringify(conversations))
  }
  
  function loadConversation(id) {
    const conversations = JSON.parse(localStorage.getItem('ai_conversations') || '{}')
    return conversations[id]?.messages || []
  }
  
  function deleteConversation(id) {
    const conversations = JSON.parse(localStorage.getItem('ai_conversations') || '{}')
    delete conversations[id]
    localStorage.setItem('ai_conversations', JSON.stringify(conversations))
  }
  
  return { saveConversation, loadConversation, deleteConversation }
}
```

---

### 阶段 3：快捷指令（2 小时）

#### 3.1 实现快捷指令系统
```javascript
// useQuickCommands.js
export function useQuickCommands() {
  const defaultCommands = [
    {
      id: 'polish',
      label: '润色',
      template: '请润色以下内容：\n\n{{sel}}',
    },
    {
      id: 'translate-en',
      label: '翻译成英文',
      template: '请将以下内容翻译为英文：\n\n{{sel}}',
    },
    {
      id: 'translate-zh',
      label: '翻译成中文',
      template: 'Please translate the following content into Chinese:\n\n{{sel}}',
    },
    {
      id: 'summary',
      label: '总结',
      template: '请对以下内容进行总结：\n\n{{sel}}',
    },
  ]
  
  function applyCommand(command, selectedText) {
    return command.template.replace('{{sel}}', selectedText)
  }
  
  return { defaultCommands, applyCommand }
}
```

---

### 阶段 4：AI 配置（2 小时）

#### 4.1 实现配置管理
```javascript
// useAIConfig.js
export function useAIConfig() {
  const [config, setConfig] = useState({
    type: 'default',
    endpoint: 'https://proxy-ai.doocs.org/v1',
    apiKey: '',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    temperature: 1,
    maxTokens: 1024,
  })
  
  // 从 localStorage 加载配置
  useEffect(() => {
    const saved = localStorage.getItem('ai_config')
    if (saved) {
      setConfig(JSON.parse(saved))
    }
  }, [])
  
  // 保存配置到 localStorage
  useEffect(() => {
    localStorage.setItem('ai_config', JSON.stringify(config))
  }, [config])
  
  return { config, setConfig }
}
```

#### 4.2 支持的 AI 服务
```javascript
// constants/aiConfig.js
export const AI_SERVICES = [
  {
    value: 'default',
    label: '内置服务（免费）',
    endpoint: 'https://proxy-ai.doocs.org/v1',
    models: [
      'Qwen/Qwen2.5-7B-Instruct',
      'Qwen/Qwen2.5-Coder-7B-Instruct',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      'THUDM/GLM-Z1-9B-0414',
      // ... 更多模型
    ],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  // ... 更多服务
]
```

---

### 阶段 5：UI 优化和集成（2 小时）

#### 5.1 集成到主应用
```jsx
// App.jsx
function App() {
  const [showAISidebar, setShowAISidebar] = useState(false)
  
  return (
    <div className="app">
      <Toolbar />
      <div className="main-content">
        <Editor />
        <Preview />
        {showAISidebar && <AISidebar />}
      </div>
      <AIToggleButton onClick={() => setShowAISidebar(!showAISidebar)} />
    </div>
  )
}
```

#### 5.2 样式优化
```css
/* AI 侧边栏样式 */
.ai-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: var(--bg-color);
  border-left: 1px solid var(--border-color);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.ai-sidebar.open {
  transform: translateX(0);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .ai-sidebar {
    width: 100%;
  }
}
```

---

## 📊 工作量评估

| 阶段 | 内容 | 预计时间 |
|---|---|---|
| 1. 基础架构 | 文件结构、基础 UI | 4 小时 |
| 2. AI 对话 | 流式响应、会话管理 | 6 小时 |
| 3. 快捷指令 | 指令系统、应用逻辑 | 2 小时 |
| 4. AI 配置 | 配置管理、服务支持 | 2 小时 |
| 5. UI 优化 | 集成、样式、测试 | 2 小时 |
| **总计** | | **16 小时** |

---

## 🎯 MVP 功能清单

### 必须实现（P0）
- ✅ AI 对话面板
- ✅ 流式响应
- ✅ 内置服务（免费）
- ✅ 4 个快捷指令
- ✅ 会话保存/加载

### 建议实现（P1）
- ✅ 引用全文功能
- ✅ 选中文本快捷操作
- ✅ 配置面板
- ✅ 多 AI 服务支持

### 可选实现（P2）
- ⏸️ AI 文生图
- ⏸️ 自定义快捷指令
- ⏸️ 导出对话记录
- ⏸️ 语音输入

---

## 🚀 开始实施

### 第一步：创建基础文件结构
我将开始创建 AI 功能的基础文件和组件。

### 第二步：实现核心功能
逐步实现对话、快捷指令、配置等核心功能。

### 第三步：测试和优化
在真实环境中测试，优化性能和用户体验。

---

**准备好开始实施了吗？我将从创建基础文件结构开始。** 🚀
