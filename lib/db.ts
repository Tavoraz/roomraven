import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { seedDatabase } from "@/lib/seed";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "roomraven.db");

declare global {
  var __roomravenDb: Database.Database | undefined;
}

function initialize(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      default_locale TEXT NOT NULL,
      supported_locales_json TEXT NOT NULL,
      enabled_room_types_json TEXT NOT NULL,
      category_links_json TEXT NOT NULL,
      logo_data_url TEXT,
      primary_color TEXT NOT NULL,
      secondary_color TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      surface_color TEXT NOT NULL,
      font_family TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS room_templates (
      id TEXT PRIMARY KEY,
      room_type TEXT NOT NULL,
      name TEXT NOT NULL,
      rules_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS layout_sessions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      room_type TEXT NOT NULL,
      locale TEXT NOT NULL,
      input_json TEXT NOT NULL,
      option_ids_json TEXT NOT NULL,
      tournament_state_json TEXT NOT NULL,
      status TEXT NOT NULL,
      winner_option_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS layout_options (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      rank_index INTEGER NOT NULL,
      score REAL NOT NULL,
      render_mode TEXT NOT NULL,
      image_url TEXT,
      fallback_svg TEXT NOT NULL,
      prompt TEXT NOT NULL,
      layout_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comparison_votes (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      round INTEGER NOT NULL,
      matchup_index INTEGER NOT NULL,
      left_option_id TEXT NOT NULL,
      right_option_id TEXT NOT NULL,
      winner_option_id TEXT NOT NULL,
      loser_option_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_projects (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      locale TEXT NOT NULL,
      shopping_list_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalog_imports (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      imported_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      session_id TEXT,
      room_type TEXT NOT NULL,
      locale TEXT NOT NULL,
      event_type TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  seedDatabase(db);
}

export function getDb() {
  if (!global.__roomravenDb) {
    mkdirSync(dataDir, { recursive: true });
    global.__roomravenDb = new Database(dbPath);
    initialize(global.__roomravenDb);
  }

  return global.__roomravenDb;
}
