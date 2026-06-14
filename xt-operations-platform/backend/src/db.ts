import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'operations.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrateMaterials() {
  const cols = db.prepare("PRAGMA table_info(materials)").all() as any[];
  const colNames = cols.map((c: any) => c.name);

  if (!colNames.includes('category_id')) {
    db.exec("ALTER TABLE materials ADD COLUMN category_id TEXT");
  }
  if (!colNames.includes('tags')) {
    db.exec("ALTER TABLE materials ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");
  }
  if (!colNames.includes('file_size')) {
    db.exec("ALTER TABLE materials ADD COLUMN file_size INTEGER NOT NULL DEFAULT 0");
  }
  if (!colNames.includes('dimensions')) {
    db.exec("ALTER TABLE materials ADD COLUMN dimensions TEXT DEFAULT ''");
  }
  if (!colNames.includes('reviewer')) {
    db.exec("ALTER TABLE materials ADD COLUMN reviewer TEXT DEFAULT ''");
  }
  if (!colNames.includes('review_comment')) {
    db.exec("ALTER TABLE materials ADD COLUMN review_comment TEXT DEFAULT ''");
  }
}

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS crowd_packs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      rules TEXT NOT NULL DEFAULT '[]',
      logic TEXT NOT NULL DEFAULT 'AND',
      status TEXT NOT NULL DEFAULT 'active',
      user_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS material_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'image',
      category_id TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      content TEXT NOT NULL DEFAULT '{}',
      file_url TEXT DEFAULT '',
      fallback_url TEXT DEFAULT '',
      file_size INTEGER NOT NULL DEFAULT 0,
      dimensions TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      reviewer TEXT DEFAULT '',
      review_comment TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES material_categories(id)
    );

    CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category_id);
    CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
    CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);

    CREATE TABLE IF NOT EXISTS resource_positions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      priority_base INTEGER NOT NULL DEFAULT 340,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'online',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS position_configs (
      id TEXT PRIMARY KEY,
      resource_position_id TEXT NOT NULL,
      crowd_pack_id TEXT,
      material_id TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 340,
      start_time TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      channels TEXT NOT NULL DEFAULT '[]',
      device_type TEXT NOT NULL DEFAULT 'all',
      gray_ratio INTEGER NOT NULL DEFAULT 100,
      ab_group TEXT DEFAULT '',
      freq_limit_type TEXT NOT NULL DEFAULT 'none',
      freq_limit_count INTEGER NOT NULL DEFAULT 0,
      regions TEXT NOT NULL DEFAULT '[]',
      region_type TEXT NOT NULL DEFAULT 'whitelist',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (resource_position_id) REFERENCES resource_positions(id),
      FOREIGN KEY (crowd_pack_id) REFERENCES crowd_packs(id),
      FOREIGN KEY (material_id) REFERENCES materials(id)
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'fixed',
      start_time TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      cron_expression TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (config_id) REFERENCES position_configs(id)
    );

    CREATE TABLE IF NOT EXISTS rule_chain (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      rule_type TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      params TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (config_id) REFERENCES position_configs(id)
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      position_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      user_id TEXT DEFAULT '',
      device_info TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_config ON analytics_events(config_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_position ON analytics_events(position_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_configs_position ON position_configs(resource_position_id);
    CREATE INDEX IF NOT EXISTS idx_configs_status ON position_configs(status);
    CREATE INDEX IF NOT EXISTS idx_schedules_config ON schedules(config_id);
  `);

  // Run migrations for existing databases
  migrateMaterials();
}

export default db;
