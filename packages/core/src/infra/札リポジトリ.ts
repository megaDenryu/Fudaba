import type Database from "better-sqlite3";
import { type 添付 } from "../domain/添付.js";
import { 添付未検出エラー } from "../domain/添付未検出エラー.js";
import { メンバー名 } from "../domain/メンバー名.js";
import { 札, type 札変更内容 } from "../domain/札.js";
import { 札ID } from "../domain/札ID.js";
import {
  札添付一覧,
  札添付一覧をDTO値にする,
  札添付一覧をDTO値から作る,
} from "../domain/札添付一覧.js";
import { 札種別 } from "../domain/札種別.js";
import { 札状態 } from "../domain/札状態.js";
import { type 担当者, 担当者をDTO値にする, 担当者をDTO値から作る } from "../domain/担当者.js";
import {
  type 札リンク,
  札リンクをDTO値にする,
  札リンクをDTO値から作る,
} from "../domain/札リンク.js";
import {
  type 札ラベル一覧,
  札ラベル一覧をDTO値にする,
  札ラベル一覧をDTO値から作る,
} from "../domain/札ラベル一覧.js";
import { 札行に絞る, type 札行 } from "./行検証.js";

function 行から札を復元する(行: 札行): 札 {
  return 札.create({
    id: 行.id,
    種別: 札種別.create(行.kind),
    タイトル: 行.title,
    本文: 行.body,
    状態: 札状態.create(行.status),
    担当者: 担当者をDTO値から作る(行.assignee),
    作成者: メンバー名.create(行.creator),
    リンク: 札リンクをDTO値から作る(行.room_link),
    ラベル一覧: 札ラベル一覧をDTO値から作る(行.labels),
    添付一覧: 札添付一覧をDTO値から作る(行.attachments),
    作成時刻ISO: 行.created_at,
    更新時刻ISO: 行.updated_at,
  });
}

// fudaba_itemsテーブルへの読み書きに責務を絞ったリポジトリ
export class 札リポジトリ {
  constructor(private readonly db: Database.Database) {}

  追加する(引数: {
    種別: 札種別;
    タイトル: string;
    本文: string;
    担当者: 担当者;
    作成者: メンバー名;
    リンク: 札リンク;
    ラベル一覧: 札ラベル一覧;
  }): 札 {
    const 時刻ISO = new Date().toISOString();
    const 状態 = 札状態.既定();
    const 添付一覧 = 札添付一覧.空();
    const 結果 = this.db
      .prepare(
        `INSERT INTO fudaba_items (kind, title, body, status, assignee, creator, room_link, labels, attachments, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        引数.種別.値,
        引数.タイトル,
        引数.本文,
        状態.値,
        担当者をDTO値にする(引数.担当者),
        引数.作成者.値,
        札リンクをDTO値にする(引数.リンク),
        札ラベル一覧をDTO値にする(引数.ラベル一覧),
        札添付一覧をDTO値にする(添付一覧),
        時刻ISO,
        時刻ISO,
      );
    return 札.create({
      id: Number(結果.lastInsertRowid),
      種別: 引数.種別,
      タイトル: 引数.タイトル,
      本文: 引数.本文,
      状態,
      担当者: 引数.担当者,
      作成者: 引数.作成者,
      リンク: 引数.リンク,
      ラベル一覧: 引数.ラベル一覧,
      添付一覧,
      作成時刻ISO: 時刻ISO,
      更新時刻ISO: 時刻ISO,
    });
  }

  一覧を取得する(): 札[] {
    const 行一覧 = this.db
      .prepare("SELECT * FROM fudaba_items ORDER BY updated_at DESC, id DESC")
      .all();
    return 行一覧.map((生行) => 行から札を復元する(札行に絞る(生行)));
  }

  IDで取得する(id: 札ID): 札 | null {
    const 生行 = this.db.prepare("SELECT * FROM fudaba_items WHERE id = ?").get(id.値);
    if (生行 === undefined) return null;
    return 行から札を復元する(札行に絞る(生行));
  }

  更新する(id: 札ID, 変更: 札変更内容): 札 | null {
    const 既存 = this.IDで取得する(id);
    if (既存 === null) return null;
    const 更新時刻ISO = new Date().toISOString();
    const 更新後 = 既存.変更を適用する(変更, 更新時刻ISO);
    this.db
      .prepare(
        `UPDATE fudaba_items
         SET kind = ?, title = ?, body = ?, status = ?, assignee = ?, labels = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(
        更新後.種別.値,
        更新後.タイトル,
        更新後.本文,
        更新後.状態.値,
        担当者をDTO値にする(更新後.担当者),
        札ラベル一覧をDTO値にする(更新後.ラベル一覧),
        更新時刻ISO,
        id.値,
      );
    return 更新後;
  }

  添付を追加する(id: 札ID, 対象: 添付): 札 | null {
    const 既存 = this.IDで取得する(id);
    if (既存 === null) return null;
    const 更新時刻ISO = new Date().toISOString();
    const 更新後 = 既存.添付を追加する(対象, 更新時刻ISO);
    this._添付一覧を保存する(id, 更新後.添付一覧, 更新時刻ISO);
    return 更新後;
  }

  // 対象の札が存在しない場合はnull、札は存在するが指定保存名の添付が無い場合は
  // 添付未検出エラーを送出する（PATCH更新するの「存在しないID=null」と区別する必要があるため）
  添付を除外する(id: 札ID, 保存名: string): 札 | null {
    const 既存 = this.IDで取得する(id);
    if (既存 === null) return null;
    if (!既存.添付一覧.含むか(保存名)) {
      throw new 添付未検出エラー(保存名);
    }
    const 更新時刻ISO = new Date().toISOString();
    const 更新後 = 既存.添付を除外する(保存名, 更新時刻ISO);
    this._添付一覧を保存する(id, 更新後.添付一覧, 更新時刻ISO);
    return 更新後;
  }

  private _添付一覧を保存する(id: 札ID, 添付一覧: 札添付一覧, 更新時刻ISO: string): void {
    this.db
      .prepare(`UPDATE fudaba_items SET attachments = ?, updated_at = ? WHERE id = ?`)
      .run(札添付一覧をDTO値にする(添付一覧), 更新時刻ISO, id.値);
  }
}
