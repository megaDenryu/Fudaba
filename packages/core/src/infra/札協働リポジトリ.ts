import type Database from "better-sqlite3";
import { 検証エラー } from "../domain/検証エラー.js";

export interface 札コメントDTO {
  readonly id: number;
  readonly 札ID: number;
  readonly 作成者: string;
  readonly 本文: string;
  readonly 作成時刻: string;
}

export type 札リンク種別 = "親子" | "依存";

export interface 札関係リンクDTO {
  readonly id: number;
  readonly 元札ID: number;
  readonly 先札ID: number;
  readonly 種別: 札リンク種別;
  readonly 作成者: string;
  readonly 作成時刻: string;
}

function コメント行を読む(行: unknown): 札コメントDTO {
  if (
    typeof 行 === "object" && 行 !== null &&
    "id" in 行 && typeof 行.id === "number" &&
    "item_id" in 行 && typeof 行.item_id === "number" &&
    "author" in 行 && typeof 行.author === "string" &&
    "body" in 行 && typeof 行.body === "string" &&
    "created_at" in 行 && typeof 行.created_at === "string"
  ) return { id: 行.id, 札ID: 行.item_id, 作成者: 行.author, 本文: 行.body, 作成時刻: 行.created_at };
  throw new Error(`札コメントのDB行が不正です: ${JSON.stringify(行)}`);
}

function リンク行を読む(行: unknown): 札関係リンクDTO {
  if (
    typeof 行 === "object" && 行 !== null &&
    "id" in 行 && typeof 行.id === "number" &&
    "source_item_id" in 行 && typeof 行.source_item_id === "number" &&
    "target_item_id" in 行 && typeof 行.target_item_id === "number" &&
    "kind" in 行 && (行.kind === "親子" || 行.kind === "依存") &&
    "creator" in 行 && typeof 行.creator === "string" &&
    "created_at" in 行 && typeof 行.created_at === "string"
  ) return {
    id: 行.id, 元札ID: 行.source_item_id, 先札ID: 行.target_item_id,
    種別: 行.kind, 作成者: 行.creator, 作成時刻: 行.created_at,
  };
  throw new Error(`札関係リンクのDB行が不正です: ${JSON.stringify(行)}`);
}

export class 札協働リポジトリ {
  constructor(private readonly db: Database.Database) {}

  コメントを追加する(札ID: number, 作成者: string, 本文: string): 札コメントDTO {
    const 整形済み本文 = 本文.trim();
    if (整形済み本文.length === 0) throw new 検証エラー("コメント本文は空にできません");
    if (作成者.trim().length === 0) throw new 検証エラー("コメント作成者は空にできません");
    const 作成時刻 = new Date().toISOString();
    const 結果 = this.db.prepare(
      "INSERT INTO fudaba_comments (item_id, author, body, created_at) VALUES (?, ?, ?, ?)",
    ).run(札ID, 作成者.trim(), 整形済み本文, 作成時刻);
    return { id: Number(結果.lastInsertRowid), 札ID, 作成者: 作成者.trim(), 本文: 整形済み本文, 作成時刻 };
  }

  コメント一覧を取得する(札ID: number): 札コメントDTO[] {
    return this.db.prepare(
      "SELECT * FROM fudaba_comments WHERE item_id = ? ORDER BY id ASC",
    ).all(札ID).map(コメント行を読む);
  }

  リンクを追加する(元札ID: number, 先札ID: number, 種別: 札リンク種別, 作成者: string): 札関係リンクDTO {
    if (元札ID === 先札ID) throw new 検証エラー("札を自分自身へリンクできません");
    if (作成者.trim().length === 0) throw new 検証エラー("リンク作成者は空にできません");
    const 既存 = this.db.prepare(
      "SELECT id FROM fudaba_item_links WHERE source_item_id = ? AND target_item_id = ? AND kind = ?",
    ).get(元札ID, 先札ID, 種別);
    if (既存 !== undefined) throw new 検証エラー("同じ札関係リンクが既に存在します");
    const 作成時刻 = new Date().toISOString();
    const 結果 = this.db.prepare(
      `INSERT INTO fudaba_item_links (source_item_id, target_item_id, kind, creator, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(元札ID, 先札ID, 種別, 作成者.trim(), 作成時刻);
    return { id: Number(結果.lastInsertRowid), 元札ID, 先札ID, 種別, 作成者: 作成者.trim(), 作成時刻 };
  }

  リンク一覧を取得する(札ID?: number): 札関係リンクDTO[] {
    const 行一覧 = 札ID === undefined
      ? this.db.prepare("SELECT * FROM fudaba_item_links ORDER BY id ASC").all()
      : this.db.prepare(
          "SELECT * FROM fudaba_item_links WHERE source_item_id = ? OR target_item_id = ? ORDER BY id ASC",
        ).all(札ID, 札ID);
    return 行一覧.map(リンク行を読む);
  }
}
