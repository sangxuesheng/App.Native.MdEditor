# Mermaid 中文支持补充说明

## ✅ 完全支持中文的图表类型

以下图表类型可以直接使用中文，无需任何特殊处理：

### 1. journey（用户旅程图）✅
```mermaid
journey
    title 用户旅程
    section 访问网站
      打开首页: 5: 用户
      浏览内容: 4: 用户
    section 注册
      填写表单: 3: 用户
      验证邮箱: 2: 用户, 系统
```

### 2. flowchart（流程图）✅
```mermaid
flowchart LR
    开始 --> 处理 --> 结束
    处理 --> 错误处理
    错误处理 --> 结束
```

### 3. sequenceDiagram（时序图）✅
```mermaid
sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    用户->>系统: 发送请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 显示结果
```

### 4. gantt（甘特图）✅
```mermaid
gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 开发阶段
    需求分析           :a1, 2024-01-01, 30d
    系统设计           :a2, after a1, 20d
    编码实现           :a3, after a2, 40d
    section 测试阶段
    单元测试           :b1, after a3, 10d
    集成测试           :b2, after b1, 15d
```

### 5. pie（饼图）✅
```mermaid
pie
    title 市场份额
    "产品A" : 45
    "产品B" : 30
    "产品C" : 15
    "其他" : 10
```

### 6. stateDiagram（状态图）✅
```mermaid
stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中: 开始处理
    处理中 --> 已完成: 处理成功
    处理中 --> 失败: 处理失败
    失败 --> 待处理: 重试
    已完成 --> [*]
```

### 7. gitGraph（Git 图）✅
```mermaid
gitGraph
    commit id: "初始提交"
    branch 开发分支
    checkout 开发分支
    commit id: "添加功能"
    commit id: "修复bug"
    checkout main
    merge 开发分支
    commit id: "发布版本"
```

---

## ⚠️ 需要引号的图表类型

### 1. erDiagram（实体关系图）
**需要用引号包裹中文实体名和关系名**

```mermaid
erDiagram
    "用户" ||--o{ "订单" : "创建"
    "订单" ||--|{ "订单项" : "包含"
    "商品" ||--o{ "订单项" : "属于"
    
    "用户" {
        int id PK "用户ID"
        string name "姓名"
        string email "邮箱"
    }
```

### 2. classDiagram（类图）
**需要用引号包裹中文类名**

```mermaid
classDiagram
    class "用户类" {
        +int id
        +string 姓名
        +登录()
        +注销()
    }
    
    class "订单类" {
        +int id
        +decimal 金额
        +创建订单()
    }
    
    "用户类" --> "订单类" : 创建
```

---

## 📊 完整对比表

| 图表类型 | 中文支持 | 是否需要引号 | 推荐度 |
|---------|---------|-------------|--------|
| journey | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| flowchart | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| sequenceDiagram | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| gantt | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| pie | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| stateDiagram | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| gitGraph | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| graph | ✅ 完全支持 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| erDiagram | ⚠️ 有限支持 | ✅ 需要 | ⭐⭐⭐ |
| classDiagram | ⚠️ 有限支持 | ✅ 需要 | ⭐⭐⭐ |

---

## 💡 使用建议

### 优先使用完全支持的图表类型
如果可以选择，优先使用对中文完全支持的图表类型：
- 用户流程 → journey
- 业务流程 → flowchart
- 系统交互 → sequenceDiagram
- 项目计划 → gantt
- 数据占比 → pie
- 状态流转 → stateDiagram

### 必须使用 erDiagram 或 classDiagram 时
记得用引号包裹所有中文内容：
```mermaid
erDiagram
    "用户表" ||--o{ "订单表" : "一对多"
```

---

## 🎯 最佳实践示例

### 示例 1：用户注册流程（journey）
```mermaid
journey
    title 用户注册流程
    section 访问
      打开注册页面: 5: 用户
      查看注册说明: 4: 用户
    section 填写信息
      输入用户名: 3: 用户
      输入密码: 3: 用户
      输入邮箱: 3: 用户
    section 验证
      提交表单: 4: 用户
      邮箱验证: 3: 用户, 系统
      注册成功: 5: 用户, 系统
```

### 示例 2：订单处理流程（flowchart）
```mermaid
flowchart TD
    A[用户下单] --> B{库存充足?}
    B -->|是| C[创建订单]
    B -->|否| D[提示缺货]
    C --> E[支付]
    E --> F{支付成功?}
    F -->|是| G[发货]
    F -->|否| H[取消订单]
    G --> I[完成]
    H --> I
    D --> I
```

### 示例 3：系统交互（sequenceDiagram）
```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库
    
    用户->>前端: 点击登录
    前端->>后端: 发送登录请求
    后端->>数据库: 验证用户信息
    数据库-->>后端: 返回验证结果
    后端-->>前端: 返回登录状态
    前端-->>用户: 显示登录结果
```

---

**更新日期**: 2025-03-03  
**版本**: v1.1  
**测试状态**: ✅ 已验证
