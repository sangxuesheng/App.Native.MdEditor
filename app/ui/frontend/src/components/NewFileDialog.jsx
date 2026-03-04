import React, { useState, useEffect } from 'react';
import './NewFileDialog.css';

const TEMPLATES = [
  {
    id: 'blank',
    name: '空白文档',
    description: '创建一个空白的 Markdown 文件',
    content: ''
  },
  {
    id: 'note',
    name: '笔记',
    description: '适合日常笔记和记录',
    content: `# 笔记标题

**日期**: ${new Date().toLocaleDateString('zh-CN')}

## 内容

在这里记录你的想法...

## 标签

#标签1 #标签2
`
  },
  {
    id: 'document',
    name: '文档',
    description: '适合正式文档和报告',
    content: `# 文档标题

**作者**: 
**日期**: ${new Date().toLocaleDateString('zh-CN')}
**版本**: 1.0

## 摘要

简要描述文档内容...

## 目录

- [第一章](#第一章)
- [第二章](#第二章)
- [第三章](#第三章)

## 第一章

内容...

## 第二章

内容...

## 第三章

内容...

## 参考文献

1. 参考资料1
2. 参考资料2
`
  },
  {
    id: 'blog',
    name: '博客文章',
    description: '适合博客和技术文章',
    content: `---
title: 文章标题
date: ${new Date().toISOString().split('T')[0]}
tags: [标签1, 标签2]
categories: [分类]
---

# 文章标题

## 引言

在这里写引言...

## 正文

### 小节1

内容...

### 小节2

内容...

## 总结

总结内容...

## 参考链接

- [链接1](https://example.com)
- [链接2](https://example.com)
`
  },
  {
    id: 'todo',
    name: '待办清单',
    description: '任务和待办事项管理',
    content: `# 待办清单

**日期**: ${new Date().toLocaleDateString('zh-CN')}

## 今日任务

- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 本周计划

- [ ] 计划1
- [ ] 计划2
- [ ] 计划3

## 已完成

- [x] 已完成的任务1
- [x] 已完成的任务2

## 备注

其他需要记录的内容...
`
  },
  {
    id: 'meeting',
    name: '会议记录',
    description: '会议纪要和讨论记录',
    content: `# 会议记录

**日期**: ${new Date().toLocaleDateString('zh-CN')}
**时间**: 
**地点**: 
**参会人员**: 

## 会议议程

1. 议题1
2. 议题2
3. 议题3

## 讨论内容

### 议题1

讨论内容...

**决议**: 

### 议题2

讨论内容...

**决议**: 

### 议题3

讨论内容...

**决议**: 

## 行动项

- [ ] 行动项1 - 负责人: XXX - 截止日期: YYYY-MM-DD
- [ ] 行动项2 - 负责人: XXX - 截止日期: YYYY-MM-DD

## 下次会议

**时间**: 
**议题**: 
`
  }
];

const NewFileDialog = ({ onClose, onConfirm, rootDirs, theme }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleCreate = async () => {
    if (!fileName.trim()) {
      setError('请输入文件名');
      return;
    }

    // 确保文件名以 .md 结尾
    let finalFileName = fileName.trim();
    if (!finalFileName.endsWith('.md')) {
      finalFileName += '.md';
    }

    // 获取模板内容
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    const content = template ? template.content : '';

    // 直接调用onConfirm，将文件名和内容传递给父组件
    // 路径选择将在保存时由父组件处理
    onConfirm(finalFileName, content);
    onClose();
  };

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className={`dialog-overlay ${theme === 'light' ? 'theme-light' : 'theme-dark'}`} onClick={onClose}>
      <div className="dialog-content new-file-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>新建文件</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>文件名称 *</label>
            <div className="file-name-input">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="新建文件名称"
                className="form-input"
                autoFocus
              />
              <span className="file-extension">.md</span>
            </div>
          </div>

          <div className="form-group">
            <label>模板</label>
            <div className="template-grid">
              {TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="template-icon">
                    {template.id === 'blank' && '📄'}
                    {template.id === 'note' && '📝'}
                    {template.id === 'document' && '📋'}
                    {template.id === 'blog' && '✍️'}
                    {template.id === 'todo' && '✅'}
                    {template.id === 'meeting' && '📅'}
                  </div>
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="template-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button 
            className="btn-primary" 
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? '创建中...' : '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFileDialog;

