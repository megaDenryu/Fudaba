import { 状態表示ラベル } from "../カンバン/状態表示ラベル";
import { 担当者候補一覧を抽出する } from "../カンバン/担当者候補抽出";
import { 札状態選択肢 } from "../カンバン/定数";
import { ラベル候補一覧を抽出する } from "../カンバン/ラベル候補抽出";
import type { 札クライアント } from "../通信/札クライアント";
import type { 札DTO, 札作成入力, 札更新入力 } from "../通信/札型";
import { モバイル札ビュー部品 } from "./モバイル札ビュー部品";
import { 札リストカード } from "./札リストカード";

// モバイル札ビューのロジック層。API呼び出しと選択中の状態タブへの絞り込みを担う
// （カンバンビューサービスと同じ構成方針。状態は単一選択のセグメントタブで表す）
export class モバイル札ビューサービス {
  private _選択中の状態: string = 札状態選択肢[0];
  private _最新一覧: readonly 札DTO[] = [];

  constructor(
    private readonly _クライアント: 札クライアント,
    private readonly _部品: モバイル札ビュー部品,
    private readonly _状態表示: 状態表示ラベル,
  ) {}

  async 更新する(): Promise<readonly 札DTO[] | undefined> {
    try {
      const 一覧 = await this._クライアント.一覧を取得する();
      this._最新一覧 = 一覧;
      this._リストへ反映する();
      const 担当者候補 = 担当者候補一覧を抽出する(一覧);
      const ラベル候補 = ラベル候補一覧を抽出する(一覧);
      this._部品.詳細シート.担当者候補を更新する(担当者候補);
      this._部品.詳細シート.ラベル候補を更新する(ラベル候補);
      this._部品.作成シート.担当者候補を更新する(担当者候補);
      this._状態表示.クリアする();
      return 一覧;
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "札一覧の取得に失敗しました",
      );
      return undefined;
    }
  }

  状態タブを選択する(状態: string): void {
    this._選択中の状態 = 状態;
    this._部品.状態タブ.選択状態を設定する(状態);
    this._リストへ反映する();
  }

  選択中の状態(): string {
    return this._選択中の状態;
  }

  async 作成する(内容: 札作成入力): Promise<void> {
    try {
      await this._クライアント.作成する(内容);
      this._部品.作成シート.クリアする();
      this._部品.作成シート.閉じる();
      await this.更新する();
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "札の作成に失敗しました",
      );
    }
  }

  async 保存する(id: number, 変更: 札更新入力): Promise<void> {
    try {
      await this._クライアント.更新する(id, 変更);
      const 一覧 = await this.更新する();
      const 保存後の札 = 一覧?.find((札) => 札.id === id);
      if (保存後の札 !== undefined) {
        this._部品.詳細シート.保存完了を反映する(保存後の札);
      }
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "札の更新に失敗しました",
      );
    }
  }

  private _リストへ反映する(): void {
    const 対象カード一覧 = this._最新一覧
      .filter((札) => 札.状態 === this._選択中の状態)
      .map((札) =>
        new 札リストカード(札).配線する({ on選択: () => this._部品.詳細シート.表示する(札) }),
      );
    this._部品.リスト.全件を差し替える(対象カード一覧);
  }
}
