import { 札API操作サービス } from "../カンバン/札API操作サービス";
import { 札一覧表示情報を取得する } from "../カンバン/札一覧表示情報";
import type { 札作成要求 } from "../カンバン/札作成要求";
import type { 状態表示ラベル } from "../カンバン/状態表示ラベル";
import { 札状態選択肢 } from "../カンバン/定数";
import { 淀んでいるか } from "../カンバン/淀み判定";
import type { キャラクライアント } from "../通信/キャラクライアント";
import type { 稼働クライアント } from "../通信/稼働クライアント";
import type { 札クライアント } from "../通信/札クライアント";
import type { 札DTO, 札更新入力 } from "../通信/札型";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { モバイル札ビュー内容を取得する } from "./モバイル札ビュー内容";
import type { モバイル札ビュー部品 } from "./モバイル札ビュー部品";
import { 札リストカード } from "./札リストカード";

export class モバイル札ビューサービス {
  private _選択状態: string = 札状態選択肢[0];
  private _一覧: readonly 札DTO[] = [];
  private _AI名: ReadonlySet<string> = new Set();
  private _稼働: ReadonlyMap<string, string> = new Map();
  private readonly _文言 = モバイル札ビュー内容を取得する(現在ロケールを取得する());
  private readonly _操作: 札API操作サービス;

  constructor(
    private readonly _client: 札クライアント, private readonly _キャラ: キャラクライアント,
    private readonly _稼働client: 稼働クライアント, private readonly _部品: モバイル札ビュー部品,
    private readonly _状態: 状態表示ラベル,
  ) {
    this._操作 = new 札API操作サービス(_client, _状態, {
      添付超過: this._文言.添付サイズ超過メッセージを作る,
      作成失敗: this._文言.エラー札作成失敗, 更新失敗: this._文言.エラー札更新失敗,
      添付追加失敗: this._文言.エラー添付追加失敗, 添付削除失敗: this._文言.エラー添付削除失敗,
    }, () => this.更新する());
  }

  async 更新する(): Promise<readonly 札DTO[] | undefined> {
    try {
      this._一覧 = await this._client.一覧を取得する();
      const 情報 = await 札一覧表示情報を取得する(this._一覧, this._キャラ, this._稼働client);
      this._AI名 = 情報.AI担当者名集合; this._稼働 = 情報.稼働状態マップ;
      this._候補を反映する(情報.担当者候補, 情報.ラベル候補);
      this._リストへ反映する(); this._状態.クリアする();
      return this._一覧;
    } catch (error) {
      this._状態.エラーを表示する(error instanceof Error ? error.message : this._文言.エラー札一覧取得失敗);
      return undefined;
    }
  }

  状態タブを選択する(状態: string): void {
    this._選択状態 = 状態; this._部品.状態タブ.選択状態を設定する(状態); this._リストへ反映する();
  }
  選択中の状態(): string { return this._選択状態; }
  async 作成する(要求: 札作成要求): Promise<void> {
    await this._操作.作成する(要求, () => { this._部品.作成シート.クリアする(); this._部品.作成シート.閉じる(); });
  }
  async 保存する(id: number, 変更: 札更新入力): Promise<void> {
    await this._操作.保存する(id, 変更, (札) => this._部品.詳細シート.保存完了を反映する(札));
  }
  async 担当を解除する(id: number): Promise<void> { await this.保存する(id, { 担当者: null }); }
  async 添付を追加する(id: number, file: File): Promise<void> {
    await this._操作.添付を追加する(id, file, (札) => this._部品.詳細シート.添付一覧を反映する(札));
  }
  async 添付を削除する(id: number, 保存名: string): Promise<void> {
    await this._操作.添付を削除する(id, 保存名, (札) => this._部品.詳細シート.添付一覧を反映する(札));
  }

  private _候補を反映する(担当者: readonly string[], ラベル: readonly string[]): void {
    this._部品.詳細シート.担当者候補を更新する(担当者); this._部品.作成シート.担当者候補を更新する(担当者);
    this._部品.詳細シート.ラベル候補を更新する(ラベル); this._部品.作成シート.ラベル候補を更新する(ラベル);
  }
  private _リストへ反映する(): void {
    const cards = this._一覧.filter((札) => 札.状態 === this._選択状態)
      .map((札) => new 札リストカード(札, 淀んでいるか(札, this._AI名, this._稼働))
        .配線する({ on選択: () => this._部品.詳細シート.表示する(札) }));
    this._部品.リスト.全件を差し替える(cards);
  }
}
