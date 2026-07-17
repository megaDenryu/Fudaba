import Database from "better-sqlite3";
import type { 添付 } from "../domain/添付.js";
import type { メンバー名 } from "../domain/メンバー名.js";
import type { 札, 札変更内容 } from "../domain/札.js";
import type { 札ID } from "../domain/札ID.js";
import type { 札種別 } from "../domain/札種別.js";
import type { 担当者 } from "../domain/担当者.js";
import type { 札リンク } from "../domain/札リンク.js";
import type { 札ラベル一覧 } from "../domain/札ラベル一覧.js";
import { データベースを初期化する } from "./データベース初期化.js";
import { 札リポジトリ } from "./札リポジトリ.js";
import type { 問い, 問い選択肢, 回答済み問い, 未回答問い } from "../domain/問い.js";
import type { 問いID } from "../domain/問いID.js";
import { 問いリポジトリ, type 回答イベントDTO } from "./問いリポジトリ.js";
import {
  札協働リポジトリ,
  type 札コメントDTO,
  type 札関係リンクDTO,
  type 札リンク種別,
} from "./札協働リポジトリ.js";

// GET /api/fudaba/items のラベル絞り込み。指定した全ラベルを持つ札だけを返す（AND条件）
export interface 札一覧フィルタ {
  readonly ラベル一覧: readonly string[];
  readonly キーワード?: string;
}

// 永続化の窓口となるファサード。スキーマ初期化を担い、実際の読み書きは
// 札リポジトリに委譲する（AgentRoomのメッセージストアと同じ構成）
export class 札ストア {
  private readonly 札: 札リポジトリ;
  private readonly 問い: 問いリポジトリ;
  private readonly 協働: 札協働リポジトリ;

  private constructor(private readonly db: Database.Database) {
    this.札 = new 札リポジトリ(db);
    this.問い = new 問いリポジトリ(db);
    this.協働 = new 札協働リポジトリ(db);
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
    ラベル一覧: 札ラベル一覧;
  }): 札 {
    return this.札.追加する(引数);
  }

  一覧を取得する(フィルタ?: 札一覧フィルタ): 札[] {
    const 全件 = this.札.一覧を取得する();
    if (フィルタ === undefined) {
      return 全件;
    }
    const キーワード = フィルタ.キーワード?.trim().toLocaleLowerCase("ja") ?? "";
    return 全件.filter((札) =>
      フィルタ.ラベル一覧.every((ラベル) => 札.ラベル一覧.含むか(ラベル)) &&
      (キーワード.length === 0 || `${札.タイトル}\n${札.本文}`.toLocaleLowerCase("ja").includes(キーワード)),
    );
  }

  IDで取得する(id: 札ID): 札 | null {
    return this.札.IDで取得する(id);
  }

  更新する(id: 札ID, 変更: 札変更内容): 札 | null {
    return this.札.更新する(id, 変更);
  }

  添付を追加する(id: 札ID, 対象: 添付): 札 | null {
    return this.札.添付を追加する(id, 対象);
  }

  添付を除外する(id: 札ID, 保存名: string): 札 | null {
    return this.札.添付を除外する(id, 保存名);
  }

  問いを追加する(引数: {
    タイトル: string;
    本文: string;
    選択肢一覧: readonly 問い選択肢[];
    関連札ID: number | null;
    ルーム名: string | null;
    作成者: string;
  }): 未回答問い {
    return this.問い.追加する(引数);
  }

  問い一覧を取得する(kind?: "未回答" | "回答済み"): 問い[] {
    return this.問い.一覧を取得する(kind);
  }

  問いをIDで取得する(id: 問いID): 問い | null {
    return this.問い.IDで取得する(id);
  }

  問いに回答する(id: 問いID, 選択肢ID: string, 回答者: string, メモ: string): 回答済み問い {
    return this.問い.回答する(id, 選択肢ID, 回答者, メモ);
  }

  問いに添付を追加する(id: 問いID, 対象: 添付): 問い | null {
    return this.問い.添付を追加する(id, 対象);
  }

  回答イベントを取得する(基準連番: number, 問いID一覧: readonly number[]): 回答イベントDTO[] {
    return this.問い.回答イベントを取得する(基準連番, 問いID一覧);
  }

  コメントを追加する(札ID: number, 作成者: string, 本文: string): 札コメントDTO {
    return this.協働.コメントを追加する(札ID, 作成者, 本文);
  }

  コメント一覧を取得する(札ID: number): 札コメントDTO[] {
    return this.協働.コメント一覧を取得する(札ID);
  }

  札関係リンクを追加する(元札ID: number, 先札ID: number, 種別: 札リンク種別, 作成者: string): 札関係リンクDTO {
    return this.協働.リンクを追加する(元札ID, 先札ID, 種別, 作成者);
  }

  札関係リンク一覧を取得する(札ID?: number): 札関係リンクDTO[] {
    return this.協働.リンク一覧を取得する(札ID);
  }

  閉じる(): void {
    this.db.close();
  }
}
