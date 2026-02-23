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

const NewFileDialog = ({ onClose, onConfirm, rootDirs }) => {
  const [step, setStep] = useState(1); // 1: 选择模板, 2: 选择位置和文件名
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [fileName, setFileName] = useState('');
  const [selectedDir, setSelectedDir] = useState('');
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 加载可用目录
    if (rootDirs && rootDirs.length > 0) {
      setDirectories(rootDirs);
      setSelectedDir(rootDirs[0].path);
    }
  }, [rootDirs]);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError('');
    }
  };

  const handleCreate = async () => {
    if (!fileName.trim()) {
      setError('请输入文件名');
      return;
    }

    if (!selectedDir) {
      setError('请选择保存位置');
      return;
    }

    // 确保文件名以 .md 结尾
    let finalFileName = fileName.trim();
    if (!finalFileName.endsWith('.md')) {
      finalFileName += '.md';
    }

    // 构建完整路径
    const fullPath = `${selectedDir}/${finalFileName}`;

    // 获取模板内容
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    const content = template ? template.content : '';

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fullPath, content })
      });

      const data = await response.json();

      if (data.ok) {
        onConfirm(fullPath, content);
        onClose();
      } else {
        setError(data.message || '创建文件失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
      console.error('Create file error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content new-file-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>新建文件</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          {step === 1 && (
            <div className="template-selection">
              <h3>选择模板</h3>
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
          )}

          {step === 2 && (
            <div className="file-details">
              <h3>文件信息</h3>
              
              <div className="form-group">
                <label>模板</label>
                <div className="selected-template-info">
                  <span className="template-name">{selectedTemplateData?.name}</span>
                  <button className="btn-link" onClick={handleBack}>更改</button>
                </div>
              </div>

              <div className="form-group">
                <label>保存位置</label>
                <select 
                  value={selectedDir} 
                  onChange={(e) => setSelectedDir(e.target.value)}
                  className="form-select"
                >
                  {directories.map(dir => (
                    <option key={dir.path} value={dir.path}>
                      {dir.name} ({dir.path})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>文件名</label>
                <div className="file-name-input">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="输入文件名"
                    className="form-input"
                    autoFocus
                  />
                  <span className="file-extension">.md</span>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          {step === 1 && (
            <>
              <button className="btn-secondary" onClick={onClose}>取消</button>
              <button className="btn-primary" onClick={handleNext}>下一步</button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="btn-secondary" onClick={handleBack}>上一步</button>
              <button 
                className="btn-primary" 
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? '创建中...' : '创建'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewFileDialog;

