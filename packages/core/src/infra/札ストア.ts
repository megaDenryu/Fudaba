import Database from "better-sqlite3";
import type { メンバー名 } from "../domain/メンバー名.js";
import type { 札, 札変更内容 } from "../domain/札.js";
import type { 札ID } from "../domain/札ID.js";
import type { 札種別 } from "../domain/札種別.js";
import type { 担当者 } from "../domain/担当者.js";
import type { 札リンク } from "../domain/札リンク.js";
import { データベースを初期化する } from "./データベース初期化.js";
import { 札リポジトリ } from "./札リポジトリ.js";

// 永続化の窓口となるファサード。スキーマ初期化を担い、実際の読み書きは
// 札リポジトリに委譲する（AgentRoomのメッセージストアと同じ構成）
export class 札ストア {
  private readonly 札: 札リポジトリ;

  private constructor(private readonly db: Database.Database) {
    this.札 = new 札リポジトリ(db);
  }

  static ファイルから開く(パス: string): 札ストア {
    return 札ストア.初期化(new Database(パス));
  }

  static メモリ上に作る(): 札ストア {
    return 札ストア.初期化(new Database(":memory:"));
  }

  private static 初期化(db: Database.Database): 札ストア {
    データベースを初期化する(db);
    return new 札ストア(db);
  }

  追加する(引数: {
    種別: 札種別;
    タイトル: string;
    本文: string;
    担当者: 担当者;
    作成者: メンバー名;
    リンク: 札リンク;
  }): 札 {
    return this.札.追加する(引数);
  }

  一覧を取得する(): 札[] {
    return this.札.一覧を取得する();
  }

  IDで取得する(id: 札ID): 札 | null {
    return this.札.IDで取得する(id);
  }

  更新する(id: 札ID, 変更: 札変更内容): 札 | null {
    return this.札.更新する(id, 変更);
  }

  閉じる(): void {
    this.db.close();
  }
}
