const path = require('path')
const fs = require('fs')
let Database
let dbInstance = null

function getAppDataPath() {
  // 飞牛环境：使用系统提供的 var 目录
  const trimVar = process.env.TRIM_PKGVAR
  if (trimVar) {
    return path.join(trimVar, 'app.db')
  }

  // 开发环境：使用相对路径
  const appRoot = path.join(__dirname, '..')
  const varDir = path.join(appRoot, 'var')

  try {
    if (!fs.existsSync(varDir)) {
      fs.mkdirSync(varDir, { recursive: true })
    }
  } catch (e) {
    console.error('[db] cannot ensure var dir exists:', varDir, e.message)
  }

  return path.join(varDir, 'app.db')
}

function getDb() {
  if (dbInstance) return dbInstance

  const dbPath = getAppDataPath()

  try {
    // 惰性加载依赖，避免在构建环境下出错
    // 实际运行前需要在 app/server 目录安装 better-sqlite3
    Database = require('better-sqlite3')
  } catch (e) {
    console.error('[db] missing dependency better-sqlite3, please install it in app/server:')
    console.error('      cd app/server && npm install better-sqlite3')
    throw e
  }

  dbInstance = new Database(dbPath)
  dbInstance.pragma('journal_mode = WAL')

  initSchema(dbInstance)

  return dbInstance
}

function initSchema(db) {
  // 全局设置表（Key-Value）
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `).run()

  // 导出配置预设表
  db.prepare(`
    CREATE TABLE IF NOT EXISTS export_presets (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      is_default   INTEGER NOT NULL DEFAULT 0,
      config_json  TEXT NOT NULL,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL,
      last_used_at INTEGER
    )
  `).run()

  // 导出自定义主题（仅保存主题名和 CSS，供导出配置面板使用）
  db.prepare(`
    CREATE TABLE IF NOT EXISTS export_custom_themes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      css        TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run()

  // 最近文件
  db.prepare(`
    CREATE TABLE IF NOT EXISTS recent_files (
      path        TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      last_opened INTEGER NOT NULL,
      open_count  INTEGER NOT NULL DEFAULT 1
    )
  `).run()

  // 收藏夹
  db.prepare(`
    CREATE TABLE IF NOT EXISTS favorites (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      path        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      added_at    INTEGER NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0
    )
  `).run()

  // 文生图历史记录
  db.prepare(`
    CREATE TABLE IF NOT EXISTS ai_image_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt      TEXT NOT NULL,
      url         TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    )
  `).run()

  // 历史索引（正文仍存文件，索引用于查询/统计）
  db.prepare(`
    CREATE TABLE IF NOT EXISTS history_index (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path   TEXT NOT NULL,
      version_num INTEGER NOT NULL,
      file_name   TEXT NOT NULL,
      timestamp   INTEGER NOT NULL,
      size        INTEGER NOT NULL,
      lines       INTEGER NOT NULL,
      label       TEXT,
      auto_saved  INTEGER NOT NULL,
      UNIQUE (file_path, version_num)
    )
  `).run()
}

module.exports = {
  getDb,
}

