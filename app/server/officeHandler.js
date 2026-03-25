const fs = require('fs')

const OFFICE_SECURITY_LIMITS = {
  // Office 主文件大小限制（符合你的实施计划）
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25MB

  // ZIP 炸弹防护三重限制（符合实施计划示例）
  MAX_UNCOMPRESSED_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES: 1000,
  MAX_COMPRESSION_RATIO: 100, // 解压后/压缩包

  // 解析超时（主线程 Promise.race）
  PARSE_TIMEOUT_MS: 10 * 1000,

  // Phase A 读取限制（与本次默认一致）
  // 为支持“多页（多 Sheet）切换”，允许暴露前 N 个 sheet 名称并按需读取
  MAX_SHEETS: 20,
  // 单次返回行数（无限滚动按需拉取）
  MAX_ROWS: 200,
  MAX_COLS: 50,
  MAX_DOCX_CHARS: 50000,
  // 单个 sheet 允许浏览的最大行数上限（避免超大表格拖垮内存/CPU）
  MAX_TOTAL_ROWS: 5000,
}

function httpStatusFromCode(code) {
  switch (code) {
    case 'OFFICE_TOO_LARGE':
      return 413
    case 'OFFICE_PARSE_TIMEOUT':
      return 408
    case 'OFFICE_FORMAT_UNSUPPORTED':
      return 400
    case 'ZIP_BOMB_DETECTED':
      return 400
    case 'OFFICE_PARSE_ERROR':
      return 500
    default:
      return 400
  }
}

function truncateString(str, maxChars) {
  if (typeof str !== 'string') return { text: '', truncated: false }
  if (maxChars <= 0) return { text: '', truncated: false }
  if (str.length <= maxChars) return { text: str, truncated: false }
  return { text: str.slice(0, maxChars), truncated: true }
}

async function validateOfficeZipSafety(filePath) {
  // 解析 ZIP 结构、统计 uncompressed 大小、条目数，并做 vbaProject.bin 宏检测
  let yauzl = null
  try {
    yauzl = require('yauzl')
  } catch (e) {
    // MVP：如果缺依赖，降级为仅文件大小限制（仍然不会执行宏）
    return { macroDetected: false, zipSafetySkipped: true }
  }

  const fileStats = fs.statSync(filePath)
  if (fileStats.size > OFFICE_SECURITY_LIMITS.MAX_FILE_SIZE_BYTES) {
    return { tooLarge: true }
  }

  return await new Promise((resolve, reject) => {
    let zipFile = null
    let uncompressedSize = 0
    let fileCount = 0
    let compressedSize = 0
    let macroDetected = false

    yauzl.open(filePath, { lazyEntries: true }, (err, zip) => {
      if (err) return reject(err)
      zipFile = zip

      zipFile.readEntry()

      zipFile.on('entry', (entry) => {
        fileCount += 1
        if (entry.uncompressedSize) uncompressedSize += entry.uncompressedSize
        if (entry.compressedSize) compressedSize += entry.compressedSize

        // 宏检测：vbaProject.bin
        const name = (entry.fileName || '').toLowerCase()
        if (name.endsWith('vbaproject.bin') || name.includes('/vbaproject.bin')) {
          macroDetected = true
        }

        // 三重限制快速裁剪（避免跑太久）
        if (uncompressedSize > OFFICE_SECURITY_LIMITS.MAX_UNCOMPRESSED_SIZE || fileCount > OFFICE_SECURITY_LIMITS.MAX_FILES) {
          try {
            zipFile.close()
          } catch (_) {}
          return reject(new Error('ZIP_BOMB_DETECTED'))
        }

        zipFile.readEntry()
      })

      zipFile.on('end', () => {
        const ratio = compressedSize > 0 ? uncompressedSize / compressedSize : Number.POSITIVE_INFINITY
        if (ratio > OFFICE_SECURITY_LIMITS.MAX_COMPRESSION_RATIO) {
          return reject(new Error('ZIP_BOMB_DETECTED'))
        }
        resolve({ macroDetected, zipSafetySkipped: false })
      })

      zipFile.on('error', (e) => reject(e))
    })
  })
}

async function extractDocxText(filePath, { maxChars, macroDetected }) {
  let mammoth = null
  try {
    mammoth = require('mammoth')
  } catch (e) {
    return {
      ok: false,
      code: 'OFFICE_PARSE_ERROR',
      message: '缺少 docx 解析依赖（mammoth）',
      httpStatus: httpStatusFromCode('OFFICE_PARSE_ERROR'),
      metadata: { macroDetected },
    }
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('OFFICE_PARSE_TIMEOUT')), OFFICE_SECURITY_LIMITS.PARSE_TIMEOUT_MS)
  })

  try {
    const result = await Promise.race([
      mammoth.extractRawText({ path: filePath }),
      timeoutPromise,
    ])

    const extracted = (result && result.value) ? String(result.value) : ''
    const { text, truncated } = truncateString(extracted, maxChars)
    const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0

    return {
      ok: true,
      format: 'docx',
      content: text,
      metadata: {
        wordCount,
        truncated,
        maxChars,
        macroDetected: !!macroDetected,
        warnings: macroDetected ? ['此文件包含宏，已禁用执行风险。'] : [],
      },
    }
  } catch (e) {
    const code = e && e.message ? e.message : 'OFFICE_PARSE_ERROR'
    if (code === 'OFFICE_PARSE_TIMEOUT') {
      return {
        ok: false,
        code: 'OFFICE_PARSE_TIMEOUT',
        message: 'Office文件解析超时',
        httpStatus: httpStatusFromCode('OFFICE_PARSE_TIMEOUT'),
        metadata: { macroDetected },
      }
    }
    return {
      ok: false,
      code: 'OFFICE_PARSE_ERROR',
      message: 'Office 解析失败',
      httpStatus: httpStatusFromCode('OFFICE_PARSE_ERROR'),
      metadata: { macroDetected },
    }
  }
}

function normalizeRow(row, colCount) {
  const r = Array.isArray(row) ? row : []
  return Array.from({ length: colCount }).map((_, c) => {
    const v = r[c]
    return v === undefined || v === null ? '' : String(v)
  })
}

async function extractXlsxTable(filePath, { maxRows, maxCols, maxSheets, sheetIndex, rowOffset, rowLimit, macroDetected }) {
  let xlsx = null
  try {
    xlsx = require('xlsx')
  } catch (e) {
    return {
      ok: false,
      code: 'OFFICE_PARSE_ERROR',
      message: '缺少 xlsx 解析依赖（xlsx）',
      httpStatus: httpStatusFromCode('OFFICE_PARSE_ERROR'),
      metadata: { macroDetected },
    }
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('OFFICE_PARSE_TIMEOUT')), OFFICE_SECURITY_LIMITS.PARSE_TIMEOUT_MS)
  })

  try {
    const workbook = await Promise.race([
      Promise.resolve(xlsx.readFile(filePath)),
      timeoutPromise,
    ])

    const sheetNames = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : []
    const usedSheets = sheetNames.slice(0, maxSheets)

    if (usedSheets.length === 0) {
      return {
        ok: true,
        format: 'xlsx',
        content: { kind: 'table', sheetName: '', rows: [], rowCount: 0, colCount: 0 },
        metadata: { sheetCount: 0, sheetNames: [], truncatedSheets: false, truncatedRows: false, truncatedCols: false, macroDetected: !!macroDetected, warnings: macroDetected ? ['此文件包含宏，已禁用执行风险。'] : [] },
      }
    }

    const safeSheetIndex = Number.isFinite(sheetIndex) ? sheetIndex : 0
    const resolvedIndex = Math.max(0, Math.min(safeSheetIndex, usedSheets.length - 1))
    const selectedSheetName = usedSheets[resolvedIndex]

    // Phase A：返回指定 sheet 的二维表格（无限滚动分段加载）
    const sheet = workbook.Sheets[selectedSheetName]
    const json2D = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    const headerRaw = Array.isArray(json2D) && json2D.length ? json2D[0] : []
    const bodyRawAll = Array.isArray(json2D) ? json2D.slice(1) : []

    const totalRowsRaw = bodyRawAll.length
    const cappedTotalRows = Math.min(totalRowsRaw, OFFICE_SECURITY_LIMITS.MAX_TOTAL_ROWS)
    const bodyRaw = bodyRawAll.slice(0, cappedTotalRows)

    const safeOffset = Number.isFinite(rowOffset) ? rowOffset : 0
    const offset = Math.max(0, Math.min(safeOffset, cappedTotalRows))
    const limit = Math.max(1, Math.min(Number.isFinite(rowLimit) ? rowLimit : maxRows, maxRows))
    const chunkRaw = bodyRaw.slice(offset, offset + limit)

    // 计算列数：header + 全部 body（只统计 capped 范围内）取最大，再钳制 maxCols
    let colCount = Array.isArray(headerRaw) ? headerRaw.length : 0
    for (const r of bodyRaw) {
      if (Array.isArray(r)) colCount = Math.max(colCount, r.length)
    }
    colCount = Math.min(colCount, maxCols)

    const headerRow = normalizeRow(headerRaw, colCount)
    const rows = chunkRaw.map((r) => normalizeRow(r, colCount))

    const hasMore = offset + rows.length < cappedTotalRows
    const truncatedRows = cappedTotalRows < totalRowsRaw
    const truncatedCols = (() => {
      if (colCount < maxCols) {
        // 仍可能存在原始列数大于 maxCols
      }
      return (Array.isArray(headerRaw) && headerRaw.length > maxCols) || bodyRaw.some((r) => Array.isArray(r) && r.length > maxCols)
    })()

    return {
      ok: true,
      format: 'xlsx',
      content: {
        kind: 'table',
        sheetName: selectedSheetName,
        sheetIndex: resolvedIndex,
        headerRow,
        rows,
        rowOffset: offset,
        rowLimit: limit,
        totalRows: cappedTotalRows,
        hasMore,
        rowCount: rows.length,
        colCount,
      },
      metadata: {
        sheetCount: sheetNames.length,
        sheetNames: usedSheets,
        truncatedSheets: sheetNames.length > maxSheets,
        truncatedRows,
        truncatedCols,
        macroDetected: !!macroDetected,
        warnings: [
          ...(macroDetected ? ['此文件包含宏，已禁用执行风险。'] : []),
          ...(truncatedRows ? [`表格行数过多，仅允许浏览前 ${OFFICE_SECURITY_LIMITS.MAX_TOTAL_ROWS} 行。`] : []),
        ],
      },
    }
  } catch (e) {
    const code = e && e.message ? e.message : 'OFFICE_PARSE_ERROR'
    if (code === 'OFFICE_PARSE_TIMEOUT') {
      return {
        ok: false,
        code: 'OFFICE_PARSE_TIMEOUT',
        message: 'Office文件解析超时',
        httpStatus: httpStatusFromCode('OFFICE_PARSE_TIMEOUT'),
        metadata: { macroDetected },
      }
    }
    return {
      ok: false,
      code: 'OFFICE_PARSE_ERROR',
      message: 'Office 解析失败',
      httpStatus: httpStatusFromCode('OFFICE_PARSE_ERROR'),
      metadata: { macroDetected },
    }
  }
}

async function extractOfficePreview(filePath, format, options = {}) {
  // 安全：大小限制
  let stats = null
  try {
    stats = fs.statSync(filePath)
  } catch (e) {
    return {
      ok: false,
      code: 'OFFICE_PARSE_ERROR',
      message: '读取文件失败',
      httpStatus: 500,
    }
  }
  if (!stats || stats.size > OFFICE_SECURITY_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      code: 'OFFICE_TOO_LARGE',
      message: `文件超过 ${Math.round(OFFICE_SECURITY_LIMITS.MAX_FILE_SIZE_BYTES / 1024 / 1024)}MB 限制`,
      httpStatus: httpStatusFromCode('OFFICE_TOO_LARGE'),
    }
  }

  // 安全：zip 风险、宏检测
  let zipSafety = null
  try {
    zipSafety = await validateOfficeZipSafety(filePath)
  } catch (e) {
    const msg = e && e.message ? e.message : 'ZIP_BOMB_DETECTED'
    return {
      ok: false,
      code: msg === 'ZIP_BOMB_DETECTED' ? 'ZIP_BOMB_DETECTED' : 'ZIP_BOMB_DETECTED',
      message: '检测到疑似压缩炸弹或高风险压缩内容',
      httpStatus: httpStatusFromCode('ZIP_BOMB_DETECTED'),
    }
  }

  const macroDetected = !!zipSafety?.macroDetected

  if (format === 'docx') {
    return await extractDocxText(filePath, {
      maxChars: OFFICE_SECURITY_LIMITS.MAX_DOCX_CHARS,
      macroDetected,
    })
  }

  if (format === 'xlsx') {
    const sheetIndexRaw = options && options.sheetIndex
    const sheetIndex = Number.isFinite(sheetIndexRaw) ? sheetIndexRaw : parseInt(String(sheetIndexRaw ?? '0'), 10)
    const rowOffsetRaw = options && options.rowOffset
    const rowOffset = Number.isFinite(rowOffsetRaw) ? rowOffsetRaw : parseInt(String(rowOffsetRaw ?? '0'), 10)
    const rowLimitRaw = options && options.rowLimit
    const rowLimit = rowLimitRaw === undefined ? undefined : (Number.isFinite(rowLimitRaw) ? rowLimitRaw : parseInt(String(rowLimitRaw), 10))
    return await extractXlsxTable(filePath, {
      maxRows: OFFICE_SECURITY_LIMITS.MAX_ROWS,
      maxCols: OFFICE_SECURITY_LIMITS.MAX_COLS,
      maxSheets: OFFICE_SECURITY_LIMITS.MAX_SHEETS,
      sheetIndex: Number.isFinite(sheetIndex) ? sheetIndex : 0,
      rowOffset: Number.isFinite(rowOffset) ? rowOffset : 0,
      rowLimit: (rowLimit !== undefined && Number.isFinite(rowLimit)) ? rowLimit : undefined,
      macroDetected,
    })
  }

  return {
    ok: false,
    code: 'OFFICE_FORMAT_UNSUPPORTED',
    message: '不支持的 Office 格式',
    httpStatus: httpStatusFromCode('OFFICE_FORMAT_UNSUPPORTED'),
  }
}

module.exports = {
  extractOfficePreview,
  OFFICE_SECURITY_LIMITS,
}

