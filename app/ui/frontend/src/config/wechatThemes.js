

export const wechatThemes = {
  // 默认主题 - 蓝色科技风
  default: {
    id: 'default',
    name: '默认主题',
    description: '清新蓝色，适合科技类文章',
    colors: {
      primary: '#3daeff',
      secondary: '#f7f7f7',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e5e5e5',
      codeBg: '#f6f8fa',
      codeText: '#24292e',
      quoteBg: '#f0f9ff',
      quoteBorder: '#3daeff',
      linkColor: '#3daeff',
      h1Color: '#3daeff',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 绿色主题 - 清新自然
  green: {
    id: 'green',
    name: '清新绿',
    description: '自然绿色，适合生活、健康类文章',
    colors: {
      primary: '#52c41a',
      secondary: '#f6ffed',
      text: '#333333',
      textSecondary: '#666666',
      border: '#d9f7be',
      codeBg: '#f6ffed',
      codeText: '#389e0d',
      quoteBg: '#f6ffed',
      quoteBorder: '#52c41a',
      linkColor: '#52c41a',
      h1Color: '#52c41a',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 橙色主题 - 活力热情
  orange: {
    id: 'orange',
    name: '活力橙',
    description: '温暖橙色，适合创意、设计类文章',
    colors: {
      primary: '#fa8c16',
      secondary: '#fff7e6',
      text: '#333333',
      textSecondary: '#666666',
      border: '#ffd591',
      codeBg: '#fff7e6',
      codeText: '#d46b08',
      quoteBg: '#fff7e6',
      quoteBorder: '#fa8c16',
      linkColor: '#fa8c16',
      h1Color: '#fa8c16',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 紫色主题 - 优雅神秘
  purple: {
    id: 'purple',
    name: '优雅紫',
    description: '神秘紫色，适合艺术、文化类文章',
    colors: {
      primary: '#722ed1',
      secondary: '#f9f0ff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#d3adf7',
      codeBg: '#f9f0ff',
      codeText: '#531dab',
      quoteBg: '#f9f0ff',
      quoteBorder: '#722ed1',
      linkColor: '#722ed1',
      h1Color: '#722ed1',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 红色主题 - 热烈激情
  red: {
    id: 'red',
    name: '热情红',
    description: '热烈红色，适合营销、活动类文章',
    colors: {
      primary: '#f5222d',
      secondary: '#fff1f0',
      text: '#333333',
      textSecondary: '#666666',
      border: '#ffa39e',
      codeBg: '#fff1f0',
      codeText: '#cf1322',
      quoteBg: '#fff1f0',
      quoteBorder: '#f5222d',
      linkColor: '#f5222d',
      h1Color: '#f5222d',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 青色主题 - 清爽专业
  cyan: {
    id: 'cyan',
    name: '清爽青',
    description: '清爽青色，适合商务、专业类文章',
    colors: {
      primary: '#13c2c2',
      secondary: '#e6fffb',
      text: '#333333',
      textSecondary: '#666666',
      border: '#87e8de',
      codeBg: '#e6fffb',
      codeText: '#08979c',
      quoteBg: '#e6fffb',
      quoteBorder: '#13c2c2',
      linkColor: '#13c2c2',
      h1Color: '#13c2c2',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 极简黑白主题
  minimal: {
    id: 'minimal',
    name: '极简黑白',
    description: '简约黑白，适合严肃、正式类文章',
    colors: {
      primary: '#000000',
      secondary: '#f5f5f5',
      text: '#333333',
      textSecondary: '#666666',
      border: '#d9d9d9',
      codeBg: '#f5f5f5',
      codeText: '#000000',
      quoteBg: '#fafafa',
      quoteBorder: '#000000',
      linkColor: '#000000',
      h1Color: '#000000',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  },

  // 金色主题 - 高端奢华
  gold: {
    id: 'gold',
    name: '奢华金',
    description: '高端金色，适合品牌、奢侈品类文章',
    colors: {
      primary: '#faad14',
      secondary: '#fffbe6',
      text: '#333333',
      textSecondary: '#666666',
      border: '#ffe58f',
      codeBg: '#fffbe6',
      codeText: '#d48806',
      quoteBg: '#fffbe6',
      quoteBorder: '#faad14',
      linkColor: '#faad14',
      h1Color: '#faad14',
      h2Color: '#333333',
      h3Color: '#666666',
    }
  }
}

/**
 * 生成微信公众号样式 CSS
 */
export function generateWechatCSS(theme) {
  const colors = theme.colors

  return `
    <style>
      /* 微信公众号样式 - ${theme.name} */
      .wechat-content {
        font-size: 16px;
        color: ${colors.text};
        line-height: 1.75;
        letter-spacing: 0.5px;
        word-wrap: break-word;
        word-break: break-word;
        text-align: justify;
      }

      /* 标题样式 */
      .wechat-content h1 {
        font-size: 24px;
        font-weight: bold;
        color: ${colors.h1Color};
        text-align: center;
        margin: 30px 0 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid ${colors.primary};
      }

      .wechat-content h2 {
        font-size: 22px;
        font-weight: bold;
        color: ${colors.h2Color};
        margin: 25px 0 15px;
        padding-left: 10px;
        border-left: 4px solid ${colors.primary};
      }

      .wechat-content h3 {
        font-size: 20px;
        font-weight: bold;
        color: ${colors.h3Color};
        margin: 20px 0 12px;
      }

      .wechat-content h4 {
        font-size: 18px;
        font-weight: bold;
        color: ${colors.text};
        margin: 18px 0 10px;
      }

      /* 段落样式 */
      .wechat-content p {
        margin: 15px 0;
        line-height: 1.75;
      }

      /* 引用块样式 */
      .wechat-content blockquote {
        margin: 20px 0;
        padding: 15px 20px;
        background: ${colors.quoteBg};
        border-left: 4px solid ${colors.quoteBorder};
        border-radius: 4px;
        color: ${colors.textSecondary};
        font-style: italic;
      }

      .wechat-content blockquote p {
        margin: 0;
      }

      /* 代码块样式 */
      .wechat-content pre {
        margin: 20px 0;
        padding: 15px;
        background: ${colors.codeBg};
        border: 1px solid ${colors.border};
        border-radius: 4px;
        overflow-x: auto;
        font-size: 14px;
        line-height: 1.6;
      }

      .wechat-content code {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        color: ${colors.codeText};
      }

      .wechat-content :not(pre) > code {
        padding: 2px 6px;
        background: ${colors.codeBg};
        border: 1px solid ${colors.border};
        border-radius: 3px;
        font-size: 14px;
        color: ${colors.codeText};
      }

      /* 链接样式 */
      .wechat-content a {
        color: ${colors.linkColor};
        text-decoration: none;
        border-bottom: 1px solid ${colors.linkColor};
        transition: all 0.2s;
      }

      .wechat-content a:hover {
        opacity: 0.8;
      }

      /* 列表样式 */
      .wechat-content ul,
      .wechat-content ol {
        margin: 15px 0;
        padding-left: 30px;
      }

      .wechat-content li {
        margin: 8px 0;
        line-height: 1.75;
      }

      /* 表格样式 */
      .wechat-content table {
        width: 100%;
        margin: 20px 0;
        border-collapse: collapse;
        border: 1px solid ${colors.border};
      }

      .wechat-content th {
        background: ${colors.secondary};
        color: ${colors.text};
        font-weight: bold;
        padding: 12px;
        border: 1px solid ${colors.border};
        text-align: left;
      }

      .wechat-content td {
        padding: 10px 12px;
        border: 1px solid ${colors.border};
      }

      .wechat-content tr:nth-child(even) {
        background: ${colors.secondary};
      }

      /* 图片样式 */
      .wechat-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 20px auto;
        border-radius: 4px;
      }

      .wechat-content figure {
        margin: 20px 0;
        text-align: center;
      }

      .wechat-content figcaption {
        margin-top: 10px;
        font-size: 14px;
        color: ${colors.textSecondary};
        text-align: center;
      }

      /* 分割线样式 */
      .wechat-content hr {
        margin: 30px 0;
        border: none;
        border-top: 1px solid ${colors.border};
      }

      /* 强调样式 */
      .wechat-content strong {
        font-weight: bold;
        color: ${colors.text};
      }

      .wechat-content em {
        font-style: italic;
      }

      /* 删除线 */
      .wechat-content del {
        text-decoration: line-through;
        color: ${colors.textSecondary};
      }

      /* 高亮 */
      .wechat-content mark {
        background: ${colors.secondary};
        padding: 2px 4px;
        border-radius: 2px;
      }
    </style>
  `
}

/**
 * 获取所有主题列表
 */
export function getAllThemes() {
  return Object.values(wechatThemes)
}

/**
 * 根据 ID 获取主题
 */
export function getThemeById(id) {
  return wechatThemes[id] || wechatThemes.default
}
