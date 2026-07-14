import { 状態表示ラベル } from "../カンバン/状態表示ラベル";
import { 担当者候補一覧を抽出する, 担当者候補を合成する } from "../カンバン/担当者候補抽出";
import { ファイルをデータURLに変換する } from "../カンバン/添付データURL変換";
import { 札状態選択肢, 添付最大バイト数 } from "../カンバン/定数";
import { ラベル候補一覧を抽出する } from "../カンバン/ラベル候補抽出";
import type { キャラクライアント } from "../通信/キャラクライアント";
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
    private readonly _キャラクライアント: キャラクライアント,
    private readonly _部品: モバイル札ビュー部品,
    private readonly _状態表示: 状態表示ラベル,
  ) {}

  async 更新する(): Promise<readonly 札DTO[] | undefined> {
    try {
      const 一覧 = await this._クライアント.一覧を取得する();
      this._最新一覧 = 一覧;
      this._リストへ反映する();
      const 担当者候補 = await this._担当者候補を取得する(一覧);
      const ラベル候補 = ラベル候補一覧を抽出する(一覧);
      this._部品.詳細シート.担当者候補を更新する(担当者候補);
      this._部品.詳細シート.ラベル候補を更新する(ラベル候補);
      this._部品.作成シート.担当者候補を更新する(担当者候補);
      this._部品.作成シート.ラベル候補を更新する(ラベル候補);
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

  async 添付を追加する(id: number, ファイル: File): Promise<void> {
    if (ファイル.size > 添付最大バイト数) {
      this._状態表示.エラーを表示する(
        `添付ファイルは${添付最大バイト数 / (1024 * 1024)}MB以下である必要があります`,
      );
      return;
    }
    try {
      const データURL = await ファイルをデータURLに変換する(ファイル);
      await this._クライアント.添付を追加する(id, { ファイル名: ファイル.name, データURL });
      const 一覧 = await this.更新する();
      const 対象 = 一覧?.find((札) => 札.id === id);
      if (対象 !== undefined) {
        this._部品.詳細シート.添付一覧を反映する(対象);
      }
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "添付の追加に失敗しました",
      );
    }
  }

  async 添付を削除する(id: number, 保存名: string): Promise<void> {
    try {
      await this._クライアント.添付を削除する(id, 保存名);
      const 一覧 = await this.更新する();
      const 対象 = 一覧?.find((札) => 札.id === id);
      if (対象 !== undefined) {
        this._部品.詳細シート.添付一覧を反映する(対象);
      }
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "添付の削除に失敗しました",
      );
    }
  }

  // キャラ一覧の取得はAgentRoomサーバーへの依存を伴う付随情報のため、失敗しても
  // 札一覧表示自体は壊さず、札由来の候補だけにサイレントフォールバックする
  private async _担当者候補を取得する(札一覧: readonly 札DTO[]): Promise<string[]> {
    try {
      const キャラ一覧 = await this._キャラクライアント.一覧を取得する();
      return 担当者候補を合成する(札一覧, キャラ一覧);
    } catch {
      return 担当者候補一覧を抽出する(札一覧);
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
