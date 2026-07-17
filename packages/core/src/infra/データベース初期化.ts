import type Database from "better-sqlite3";

interface テーブル列情報 {
  readonly name: string;
}

function 列情報として絞る(行: unknown): テーブル列情報 {
  if (typeof 行 === "object" && 行 !== null && "name" in 行 && typeof 行.name === "string") {
    return { name: 行.name };
  }
  throw new Error(`PRAGMA table_infoの行が想定形式と一致しません: ${JSON.stringify(行)}`);
}

// 既存のfudaba.sqlite3（labels列導入前）を読み込んだときの後方互換マイグレーション。
// CREATE TABLE IF NOT EXISTSは既存テーブルへ列を追加しないため、PRAGMAで列の有無を
// 確認してから明示的にALTER TABLEする（参照: CLAUDE.md「版ごとの型＋最新への変換」原則の
// テーブルスキーマ版）
function labels列を保証する(db: Database.Database): void {
  const 列一覧 = db
    .prepare("PRAGMA table_info(fudaba_items)")
    .all()
    .map(列情報として絞る);
  const labels列が存在する = 列一覧.some((列) => 列.name === "labels");
  if (!labels列が存在する) {
    db.exec(`ALTER TABLE fudaba_items ADD COLUMN labels TEXT NOT NULL DEFAULT '[]'`);
  }
}

// 既存のfudaba.sqlite3（attachments列導入前）を読み込んだときの後方互換マイグレーション。
// labels列を保証する()と同じ方針（PRAGMAで列の有無を確認してからALTER TABLE）
function attachments列を保証する(db: Database.Database): void {
  const 列一覧 = db
    .prepare("PRAGMA table_info(fudaba_items)")
    .all()
    .map(列情報として絞る);
  const attachments列が存在する = 列一覧.some((列) => 列.name === "attachments");
  if (!attachments列が存在する) {
    db.exec(`ALTER TABLE fudaba_items ADD COLUMN attachments TEXT NOT NULL DEFAULT '[]'`);
  }
}

function checklist列を保証する(db: Database.Database): void {
  const 列一覧 = db.prepare("PRAGMA table_info(fudaba_items)").all().map(列情報として絞る);
  if (!列一覧.some((列) => 列.name === "checklist")) {
    db.exec(`ALTER TABLE fudaba_items ADD COLUMN checklist TEXT NOT NULL DEFAULT '[]'`);
  }
}

function 問いattachments列を保証する(db: Database.Database): void {
  const 列一覧 = db.prepare("PRAGMA table_info(fudaba_questions)").all().map(列情報として絞る);
  if (!列一覧.some((列) => 列.name === "attachments")) {
    db.exec(`ALTER TABLE fudaba_questions ADD COLUMN attachments TEXT NOT NULL DEFAULT '[]'`);
  }
}

// 旧4分類のうち意味が曖昧だった「タスク」「メモ」を、扱い方が分かる名称へ移行する。
// バグと決定は意味が明確なので維持する。更新は冪等で、既存DBを何度開いても結果は同じ。
function 旧札種別を移行する(db: Database.Database): void {
  db.prepare("UPDATE fudaba_items SET kind = '実装' WHERE kind = 'タスク'").run();
  db.prepare("UPDATE fudaba_items SET kind = '記録' WHERE kind = 'メモ'").run();
}

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
      labels TEXT NOT NULL DEFAULT '[]',
      attachments TEXT NOT NULL DEFAULT '[]',
      checklist TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_fudaba_items_updated_at ON fudaba_items(updated_at);
    CREATE TABLE IF NOT EXISTS fudaba_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      choices TEXT NOT NULL,
      related_item_id INTEGER,
      room_link TEXT,
      creator TEXT NOT NULL,
      created_at TEXT NOT NULL,
      attachments TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS fudaba_answers (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      choice_id TEXT NOT NULL,
      respondent TEXT NOT NULL,
      note TEXT NOT NULL,
      answered_at TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES fudaba_questions(id)
    );
    CREATE INDEX IF NOT EXISTS idx_fudaba_answers_question_id ON fudaba_answers(question_id);
    CREATE TABLE IF NOT EXISTS fudaba_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_fudaba_comments_item_id ON fudaba_comments(item_id, id);
    CREATE TABLE IF NOT EXISTS fudaba_item_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_item_id INTEGER NOT NULL,
      target_item_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      creator TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(source_item_id, target_item_id, kind)
    );
    CREATE INDEX IF NOT EXISTS idx_fudaba_item_links_source ON fudaba_item_links(source_item_id);
    CREATE INDEX IF NOT EXISTS idx_fudaba_item_links_target ON fudaba_item_links(target_item_id);
  `);
  labels列を保証する(db);
  attachments列を保証する(db);
  checklist列を保証する(db);
  問いattachments列を保証する(db);
  旧札種別を移行する(db);
}
