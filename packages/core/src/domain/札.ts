import { type 添付, type 添付DTO } from "./添付.js";
import { 検証エラー } from "./検証エラー.js";
import { メンバー名 } from "./メンバー名.js";
import { 札ID } from "./札ID.js";
import { 札種別 } from "./札種別.js";
import { 札状態 } from "./札状態.js";
import { type 担当者, 担当者をDTO値にする } from "./担当者.js";
import { type 札リンク, 札リンクをDTO値にする } from "./札リンク.js";
import { 札ラベル一覧 } from "./札ラベル一覧.js";
import { 札添付一覧 } from "./札添付一覧.js";
import { 札チェックリスト, type 札チェック項目DTO } from "./札チェックリスト.js";

const タイトル最大文字数 = 200;
const 本文最大文字数 = 20_000;

// 部分更新の入力。キーが省略されたフィールドは「変更なし」を意味し、DBのCOALESCEに
// 頼らずドメイン層で明示的に扱う（担当者は未割当への明示変更とキー省略を区別する必要があるため）
export interface 札変更内容 {
  readonly 種別: 札種別 | undefined;
  readonly タイトル: string | undefined;
  readonly 本文: string | undefined;
  readonly 状態: 札状態 | undefined;
  readonly 担当者: 担当者 | undefined;
  readonly ラベル一覧: 札ラベル一覧 | undefined;
  readonly チェックリスト?: 札チェックリスト;
}

// 人間とAIが共有する作業アイテム。WBS・バグシート・タスクリストの最小共通形（DESIGN.md参照）
export class 札 {
  private constructor(
    readonly id: 札ID,
    readonly 種別: 札種別,
    readonly タイトル: string,
    readonly 本文: string,
    readonly 状態: 札状態,
    readonly 担当者: 担当者,
    readonly 作成者: メンバー名,
    readonly リンク: 札リンク,
    readonly ラベル一覧: 札ラベル一覧,
    readonly 添付一覧: 札添付一覧,
    readonly チェックリスト: 札チェックリスト,
    readonly 作成時刻ISO: string,
    readonly 更新時刻ISO: string,
  ) {}

  static create(引数: {
    id: number;
    種別: 札種別;
    タイトル: string;
    本文: string;
    状態: 札状態;
    担当者: 担当者;
    作成者: メンバー名;
    リンク: 札リンク;
    ラベル一覧: 札ラベル一覧;
    添付一覧: 札添付一覧;
    チェックリスト?: 札チェックリスト;
    作成時刻ISO: string;
    更新時刻ISO: string;
  }): 札 {
    const タイトル = 引数.タイトル.trim();
    if (タイトル.length === 0 || タイトル.length > タイトル最大文字数) {
      throw new 検証エラー(
        `札のタイトルは1〜${タイトル最大文字数}文字である必要があります: "${引数.タイトル}"`,
      );
    }
    if (引数.本文.length > 本文最大文字数) {
      throw new 検証エラー(`札の本文は${本文最大文字数}文字以内である必要があります`);
    }
    return new 札(
      札ID.create(引数.id),
      引数.種別,
      タイトル,
      引数.本文,
      引数.状態,
      引数.担当者,
      引数.作成者,
      引数.リンク,
      引数.ラベル一覧,
      引数.添付一覧,
      引数.チェックリスト ?? 札チェックリスト.空(),
      引数.作成時刻ISO,
      引数.更新時刻ISO,
    );
  }

  // 部分更新を適用した新しい札を返す（不変性優先。既存インスタンスは変更しない）。
  // 添付一覧は札変更内容の対象外（専用エンドポイント経由でのみ変更される）なので常に維持する
  変更を適用する(変更: 札変更内容, 更新時刻ISO: string): 札 {
    const 状態 = 変更.状態 ?? this.状態;
    const チェックリスト = 変更.チェックリスト ?? this.チェックリスト;
    if (状態.値 === "完了" && チェックリスト.未完了件数 > 0) {
      throw new 検証エラー(
        `未完了のチェック項目が${チェックリスト.未完了件数}件あるため札を完了にできません。` +
        "項目を完了するか、独立した子札へ切り出してください",
      );
    }
    return 札.create({
      id: this.id.値,
      種別: 変更.種別 ?? this.種別,
      タイトル: 変更.タイトル ?? this.タイトル,
      本文: 変更.本文 ?? this.本文,
      状態,
      担当者: 変更.担当者 ?? this.担当者,
      作成者: this.作成者,
      リンク: this.リンク,
      ラベル一覧: 変更.ラベル一覧 ?? this.ラベル一覧,
      添付一覧: this.添付一覧,
      チェックリスト,
      作成時刻ISO: this.作成時刻ISO,
      更新時刻ISO,
    });
  }

  // 添付追加・削除は他のフィールドを一切変更しない専用操作として分離する（AgentRoomの
  // 添付APIが札変更内容のPATCHと混ざると「部分更新の対象外フィールド」の扱いが曖昧になるため）
  添付を追加する(対象: 添付, 更新時刻ISO: string): 札 {
    return 札.create({
      id: this.id.値,
      種別: this.種別,
      タイトル: this.タイトル,
      本文: this.本文,
      状態: this.状態,
      担当者: this.担当者,
      作成者: this.作成者,
      リンク: this.リンク,
      ラベル一覧: this.ラベル一覧,
      添付一覧: this.添付一覧.追加する(対象),
      チェックリスト: this.チェックリスト,
      作成時刻ISO: this.作成時刻ISO,
      更新時刻ISO,
    });
  }

  添付を除外する(保存名: string, 更新時刻ISO: string): 札 {
    return 札.create({
      id: this.id.値,
      種別: this.種別,
      タイトル: this.タイトル,
      本文: this.本文,
      状態: this.状態,
      担当者: this.担当者,
      作成者: this.作成者,
      リンク: this.リンク,
      ラベル一覧: this.ラベル一覧,
      添付一覧: this.添付一覧.除外する(保存名),
      チェックリスト: this.チェックリスト,
      作成時刻ISO: this.作成時刻ISO,
      更新時刻ISO,
    });
  }

  toJSON(): 札DTO {
    return {
      id: this.id.値,
      種別: this.種別.値,
      タイトル: this.タイトル,
      本文: this.本文,
      状態: this.状態.値,
      担当者: 担当者をDTO値にする(this.担当者),
      作成者: this.作成者.値,
      ルーム名: 札リンクをDTO値にする(this.リンク),
      ラベル一覧: this.ラベル一覧.値一覧,
      添付一覧: this.添付一覧.一覧.map((添付) => 添付.toJSON()),
      チェック項目一覧: this.チェックリスト.項目一覧,
      分解推奨: this.チェックリスト.分解推奨か,
      作成時刻: this.作成時刻ISO,
      更新時刻: this.更新時刻ISO,
    };
  }
}

export interface 札DTO {
  readonly id: number;
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 状態: string;
  readonly 担当者: string | null;
  readonly 作成者: string;
  readonly ルーム名: string | null;
  readonly ラベル一覧: readonly string[];
  readonly 添付一覧: readonly 添付DTO[];
  readonly チェック項目一覧: readonly 札チェック項目DTO[];
  readonly 分解推奨: boolean;
  readonly 作成時刻: string;
  readonly 更新時刻: string;
}
