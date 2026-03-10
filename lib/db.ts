import { mkdirSync } from "node:fs";
import path from "node:path";

import { seedDatabase } from "@/lib/seed";

export type D1Value = string | number | null;

export interface D1PreparedStatementLike {
  bind(...values: D1Value[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch(statements: D1PreparedStatementLike[]): Promise<unknown[]>;
}

type BetterSqliteStatementInstance = import("better-sqlite3").Statement;
type BetterSqliteDatabaseInstance = import("better-sqlite3").Database;

class BetterSqliteStatement implements D1PreparedStatementLike {
  constructor(
    private readonly statement: BetterSqliteStatementInstance,
    private readonly values: D1Value[] = []
  ) {}

  bind(...values: D1Value[]) {
    return new BetterSqliteStatement(this.statement, values);
  }

  async first<T = Record<string, unknown>>() {
    return (this.statement.get(...this.values) as T | undefined) ?? null;
  }

  async all<T = Record<string, unknown>>() {
    return {
      results: this.statement.all(...this.values) as T[]
    };
  }

  async run() {
    return this.statement.run(...this.values);
  }

  execute() {
    return this.statement.run(...this.values);
  }
}

class BetterSqliteDatabase implements D1DatabaseLike {
  constructor(private readonly database: BetterSqliteDatabaseInstance) {}

  prepare(query: string) {
    return new BetterSqliteStatement(this.database.prepare(query));
  }

  async batch(statements: D1PreparedStatementLike[]) {
    const sqliteStatements = statements as BetterSqliteStatement[];
    const transaction = this.database.transaction(() =>
      sqliteStatements.map((statement) => statement.execute())
    );
    return transaction();
  }
}

let nodeDbPromise: Promise<D1DatabaseLike> | null = null;

type CloudflareModule = {
  getCloudflareContext(): {
    env: {
      DB?: D1DatabaseLike;
    };
  };
};

async function getCloudflareDb() {
  try {
    const importModule = new Function("specifier", "return import(specifier);") as (
      specifier: string
    ) => Promise<CloudflareModule>;
    const { getCloudflareContext } = await importModule("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    return (env as { DB?: D1DatabaseLike }).DB ?? null;
  } catch {
    return null;
  }
}

function initializeNodeDatabase(db: BetterSqliteDatabaseInstance) {
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

async function getNodeDb() {
  if (!nodeDbPromise) {
    nodeDbPromise = (async () => {
      const { default: BetterSqlite3 } = await import("better-sqlite3");
      const dbPath =
        process.env.ROOMRAVEN_DB_PATH ?? path.join(process.cwd(), "data", "roomraven.db");
      mkdirSync(path.dirname(dbPath), { recursive: true });
      const db = new BetterSqlite3(dbPath);
      initializeNodeDatabase(db);
      return new BetterSqliteDatabase(db);
    })();
  }

  return nodeDbPromise;
}

export async function getDb() {
  const db = await getCloudflareDb();

  if (!db) {
    return getNodeDb();
  }

  return db;
}
