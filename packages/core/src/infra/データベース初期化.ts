import type Database from "better-sqlite3";

// スキーマ作成を1箇所に集約する。AgentRoomのDBとは別ファイル（fudaba.sqlite3）に持つ
// （参照: Jimbo/ARCHITECTURE.md「DBファイルは機能ごとに独立」）
export function データベースを初期化する(db: Database.Database): void {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS fudaba_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      assignee TEXT,
      creator TEXT NOT NULL,
      room_link TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_fudaba_items_updated_at ON fudaba_items(updated_at);
  `);
}
