# EditorToolbar 图表模板优化说明

## 优化内容

### 问题
classDiagram 模板中的中文类名没有使用引号包裹，可能导致渲染失败。

### 需要修改的模板

#### 当前 classDiagram 模板（有问题）
```javascript
class: `${'```'}mermaid
classDiagram
    class 动物 {
        +String 名称
        +int 年龄
        +吃()
        +睡()
    }
    class 狗 {
        +吠叫()
    }
    动物 <|-- 狗
${'```'}`
```

#### 修改后的 classDiagram 模板（推荐）
```javascript
class: `${'```'}mermaid
classDiagram
    class "动物" {
        +String 名称
        +int 年龄
        +吃()
        +睡()
    }
    class "狗" {
        +吠叫()
    }
    "动物" <|-- "狗"
${'```'}`
```

### 已正确的模板

#### ✅ erDiagram 模板（已使用引号）
```javascript
er: `${'```'}mermaid
erDiagram
    "用户" ||--o{ "订单" : "创建"
    "订单" ||--|{ "订单项" : "包含"
    "商品" ||--o{ "订单项" : "属于"

    "用户" {
        int id "用户ID（主键）"
        string name "姓名"
        string email "邮箱"
    }
${'```'}`
```

## 修改位置

文件：`/vol4/1000/开发文件夹/mac/app/ui/frontend/src/components/EditorToolbar.jsx`

大约在第 110-120 行的 `class` 模板定义处。

## 修改步骤

1. 找到 `class:` 模板定义
2. 为所有中文类名添加引号：`class "动物"`
3. 为继承关系中的类名添加引号：`"动物" <|-- "狗"`

## 验证

修改后，用户点击"类图"按钮插入的模板应该可以直接使用中文，不会出现解析错误。

---

**状态**: 待修改  
**优先级**: 中  
**影响**: 提升用户体验，避免中文类图渲染失败
