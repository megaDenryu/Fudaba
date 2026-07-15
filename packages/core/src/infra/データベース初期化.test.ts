import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { データベースを初期化する } from "./データベース初期化.js";
import { 札リポジトリ } from "./札リポジトリ.js";
import { メンバー名 } from "../domain/メンバー名.js";
import { 札種別 } from "../domain/札種別.js";
import { 札ラベル一覧 } from "../domain/札ラベル一覧.js";
import { 未割当 } from "../domain/担当者.js";
import { 未リンク } from "../domain/札リンク.js";

// labels列導入前のスキーマを再現し、既存fudaba.sqlite3を開いたときに
// データベースを初期化する()が後方互換マイグレーションできることを検証する
function 旧スキーマのdbを作る(): Database.Database {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE fudaba_items (
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
  `);
  return db;
}

describe("データベースを初期化する", () => {
  it("labels列が無い既存DBにも列を追加して開ける", () => {
    const db = 旧スキーマのdbを作る();
    db.prepare(
      `INSERT INTO fudaba_items (kind, title, body, status, assignee, creator, room_link, created_at, updated_at)
       VALUES ('タスク', '旧データ', '本文', '未着手', NULL, 'claude', NULL, '2026-07-14T00:00:00.000Z', '2026-07-14T00:00:00.000Z')`,
    ).run();

    expect(() => データベースを初期化する(db)).not.toThrow();

    const 列一覧 = db.prepare("PRAGMA table_info(fudaba_items)").all();
    const labels列 = 列一覧.find(
      (列): 列 is { name: string } =>
        typeof 列 === "object" && 列 !== null && "name" in 列 && 列.name === "labels",
    );
    expect(labels列).toBeDefined();
    const attachments列 = 列一覧.find(
      (列): 列 is { name: string } =>
        typeof 列 === "object" && 列 !== null && "name" in 列 && 列.name === "attachments",
    );
    expect(attachments列).toBeDefined();

    const リポジトリ = new 札リポジトリ(db);
    const 一覧 = リポジトリ.一覧を取得する();
    expect(一覧).toHaveLength(1);
    expect(一覧[0]?.種別.値).toBe("実装");
    expect(一覧[0]?.ラベル一覧.値一覧).toEqual([]);
    expect(一覧[0]?.添付一覧.一覧).toEqual([]);
  });

  it("マイグレーション後も新規追加でラベルを保存できる", () => {
    const db = 旧スキーマのdbを作る();
    データベースを初期化する(db);
    const リポジトリ = new 札リポジトリ(db);
    const 追加済み = リポジトリ.追加する({
      種別: 札種別.create("バグ"),
      タイトル: "新データ",
      本文: "",
      担当者: 未割当,
      作成者: メンバー名.create("claude"),
      リンク: 未リンク,
      ラベル一覧: 札ラベル一覧.create(["jimbo"]),
    });
    expect(追加済み.ラベル一覧.値一覧).toEqual(["jimbo"]);
  });

  it("2回呼んでも例外にならない(冪等)", () => {
    const db = 旧スキーマのdbを作る();
    データベースを初期化する(db);
    expect(() => データベースを初期化する(db)).not.toThrow();
  });

  it("labels列はあるがattachments列が無い中間スキーマにも列を追加できる（現行mainからの実移行経路）", () => {
    const db = 旧スキーマのdbを作る();
    db.exec(`ALTER TABLE fudaba_items ADD COLUMN labels TEXT NOT NULL DEFAULT '[]'`);
    db.prepare(
      `INSERT INTO fudaba_items (kind, title, body, status, assignee, creator, room_link, labels, created_at, updated_at)
       VALUES ('タスク', '中間データ', '本文', '未着手', NULL, 'claude', NULL, '["jimbo"]', '2026-07-14T00:00:00.000Z', '2026-07-14T00:00:00.000Z')`,
    ).run();

    expect(() => データベースを初期化する(db)).not.toThrow();

    const リポジトリ = new 札リポジトリ(db);
    const 一覧 = リポジトリ.一覧を取得する();
    expect(一覧).toHaveLength(1);
    expect(一覧[0]?.種別.値).toBe("実装");
    expect(一覧[0]?.ラベル一覧.値一覧).toEqual(["jimbo"]);
    expect(一覧[0]?.添付一覧.一覧).toEqual([]);
  });
});
