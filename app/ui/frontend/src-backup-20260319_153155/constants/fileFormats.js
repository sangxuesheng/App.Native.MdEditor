/**
 * 全格式支持 - 格式分类与 Monaco 语言映射
 * 首批支持格式：MD、文本类、图片类；非支持格式按兜底规则处理
 */

// 格式分类
export const FORMAT_MD = 'md'
export const FORMAT_TEXT = 'text'
export const FORMAT_IMAGE = 'image'
export const FORMAT_PDF = 'pdf'
export const FORMAT_UNSUPPORTED = 'unsupported'

// 扩展名 → 格式分类
export const EXT_TO_FORMAT = {
  '.md': FORMAT_MD,
  '.text': FORMAT_TEXT,
  '.txt': FORMAT_TEXT,
  '.env': FORMAT_TEXT,
  '.ini': FORMAT_TEXT,
  '.strm': FORMAT_TEXT,
  '.js': FORMAT_TEXT,
  '.ts': FORMAT_TEXT,
  '.html': FORMAT_TEXT,
  '.htm': FORMAT_TEXT,
  '.css': FORMAT_TEXT,
  '.scss': FORMAT_TEXT,
  '.less': FORMAT_TEXT,
  '.json': FORMAT_TEXT,
  '.py': FORMAT_TEXT,
  '.java': FORMAT_TEXT,
  '.c': FORMAT_TEXT,
  '.cpp': FORMAT_TEXT,
  '.cc': FORMAT_TEXT,
  '.cxx': FORMAT_TEXT,
  '.go': FORMAT_TEXT,
  '.rs': FORMAT_TEXT,
  '.php': FORMAT_TEXT,
  '.rb': FORMAT_TEXT,
  '.sh': FORMAT_TEXT,
  '.sql': FORMAT_TEXT,
  '.ml': FORMAT_TEXT,
  '.yaml': FORMAT_TEXT,
  '.yml': FORMAT_TEXT,
  '.vue': FORMAT_TEXT,
  '.pdf': FORMAT_PDF,
  '.png': FORMAT_IMAGE,
  '.jpg': FORMAT_IMAGE,
  '.jpeg': FORMAT_IMAGE,
  '.gif': FORMAT_IMAGE,
  '.bmp': FORMAT_IMAGE,
  '.webp': FORMAT_IMAGE
}

// 扩展名 → Monaco 语言 ID
export const EXT_TO_LANGUAGE = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.py': 'python',
  '.vue': 'vue',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.sql': 'sql',
  '.sh': 'shell',
  '.go': 'go',
  '.rs': 'rust',
  '.php': 'php',
  '.rb': 'ruby',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.ml': 'ocaml',
  '.md': 'markdown',
  '.txt': 'plaintext',
  '.text': 'plaintext',
  '.env': 'plaintext',
  '.ini': 'plaintext',
  '.strm': 'plaintext',
  '.pdf': 'plaintext'
}

// 首批支持格式（MD + 文本类 + 图片类），用于筛选
export const SUPPORTED_EXTENSIONS = new Set(Object.keys(EXT_TO_FORMAT))

/**
 * 从文件路径获取格式分类
 * @param {string} filePath - 文件路径或文件名
 * @returns {string} 'md' | 'text' | 'image' | 'unsupported'
 */
export function getFormatFromPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return FORMAT_UNSUPPORTED
  const ext = '.' + (filePath.split('.').pop() || '').toLowerCase()
  if (ext === '.') return FORMAT_UNSUPPORTED
  return EXT_TO_FORMAT[ext] || FORMAT_UNSUPPORTED
}

/**
 * 从文件路径获取 Monaco 语言 ID
 * @param {string} filePath - 文件路径或文件名
 * @returns {string} Monaco 语言 ID
 */
export function getLanguageFromPath(filePath) {
  if (!filePath || typeof filePath !== 'string') return 'plaintext'
  const ext = '.' + (filePath.split('.').pop() || '').toLowerCase()
  return EXT_TO_LANGUAGE[ext] || 'plaintext'
}

/**
 * 是否为首批支持格式
 */
export function isSupportedFormat(filePath) {
  return getFormatFromPath(filePath) !== FORMAT_UNSUPPORTED
}

/**
 * 获取格式对应的 CSS 着色类名（用于文件列表）
 * 蓝：MD | 灰：文本 | 绿：图片 | 红：非支持
 */
export function getFormatColorClass(filePath) {
  const format = getFormatFromPath(filePath)
  switch (format) {
  case FORMAT_MD: return 'format-md'
  case FORMAT_TEXT: return 'format-text'
  case FORMAT_IMAGE: return 'format-image'
  case FORMAT_PDF: return 'format-pdf'
  default: return 'format-unsupported'
  }
}
