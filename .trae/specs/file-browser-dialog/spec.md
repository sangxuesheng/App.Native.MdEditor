# 文件浏览对话框改进 Spec

## Why
当前的保存、复制、移动、另存等对话框使用简单的下拉框选择保存位置，用户体验不够直观。用户需要更直观的文件浏览界面，能够看到完整的目录结构，并支持新建文件夹等操作。

## What Changes
- 修改SaveAsDialog组件，将保存位置选择从下拉框改为左右分栏的文件浏览器
- 左侧显示一级目录（根目录）
- 右侧显示选中一级目录下的二级目录，支持展开/折叠
- 右侧支持新建文件夹功能
- 添加文件夹展开/折叠动画效果
- UI按钮样式与项目保持一致
- 窗口大小自适应内容

## Impact
- Affected specs: SaveAsDialog, CopyDialog, MoveDialog（如果存在）
- Affected code: SaveAsDialog.jsx, SaveAsDialog.css

## ADDED Requirements

### Requirement: 文件浏览器界面
系统 SHALL 提供左右分栏的文件浏览器界面用于选择保存位置。

#### Scenario: 用户打开保存对话框
- **WHEN** 用户点击保存或另存为按钮
- **THEN** 显示对话框，左侧显示一级目录列表，右侧显示选中目录的二级目录

### Requirement: 目录展开功能
系统 SHALL 支持在右侧展开/折叠二级目录。

#### Scenario: 用户点击二级目录
- **WHEN** 用户点击右侧的二级目录
- **THEN** 目录展开显示其子目录，再次点击则折叠

### Requirement: 新建文件夹功能
系统 SHALL 在右侧提供新建文件夹功能。

#### Scenario: 用户点击新建文件夹按钮
- **WHEN** 用户点击新建文件夹按钮
- **THEN** 显示输入框，用户输入文件夹名称后创建新文件夹

### Requirement: 动画效果
系统 SHALL 为文件夹展开/折叠提供平滑的动画效果。

#### Scenario: 用户展开/折叠目录
- **WHEN** 用户点击展开/折叠目录
- **THEN** 显示平滑的展开/折叠动画

### Requirement: 自适应窗口大小
系统 SHALL 根据内容自动调整对话框大小。

#### Scenario: 对话框内容变化
- **WHEN** 对话框内容发生变化（如展开目录）
- **THEN** 对话框大小自动调整以适应内容

## MODIFIED Requirements

### Requirement: 保存对话框
修改现有的保存对话框，使用新的文件浏览器界面替换下拉框选择。

#### Scenario: 用户选择保存位置
- **WHEN** 用户在文件浏览器中选择目录
- **THEN** 选中目录高亮显示，并在目标路径预览中显示完整路径
