import type { 札クライアント } from "../通信/札クライアント";
import type { 札DTO, 札作成入力, 札更新入力 } from "../通信/札型";
import { ファイルをデータURLに変換する } from "./添付データURL変換";
import { 添付最大バイト数 } from "./定数";
import { カンバンビュー部品 } from "./カンバンビュー部品";
import {
  初期カンバンフィルタ状態,
  種別選択を切り替える,
  担当者選択を切り替える,
  ラベル選択を切り替える,
  type カンバンフィルタ状態,
} from "./フィルタ状態";
import { 札がフィルタに一致するか } from "./フィルタ判定";
import { 状態表示ラベル } from "./状態表示ラベル";
import { 担当者候補一覧を抽出する } from "./担当者候補抽出";
import { ラベル候補一覧を抽出する } from "./ラベル候補抽出";
import { 札カード } from "./札カード";

// カンバンビューのロジック層。API呼び出しと4列への振り分けを担い、
// ビュー本体は配線に徹する（AgentRoomのルーム一覧サイドバーサービスと同じ構成方針）。
// フィルタ状態（種別・担当者・ラベル）もここで一元管理し、更新のたびに再適用する
export class カンバンビューサービス {
  private _フィルタ状態: カンバンフィルタ状態 = 初期カンバンフィルタ状態;
  private _最新一覧: readonly 札DTO[] = [];

  constructor(
    private readonly _クライアント: 札クライアント,
    private readonly _部品: カンバンビュー部品,
    private readonly _状態表示: 状態表示ラベル,
  ) {}

  async 更新する(): Promise<readonly 札DTO[] | undefined> {
    try {
      const 一覧 = await this._クライアント.一覧を取得する();
      this._最新一覧 = 一覧;
      this._列へ振り分ける();
      const 担当者候補 = 担当者候補一覧を抽出する(一覧);
      const ラベル候補 = ラベル候補一覧を抽出する(一覧);
      this._部品.新規作成フォーム.担当者候補を更新する(担当者候補);
      this._部品.新規作成フォーム.ラベル候補を更新する(ラベル候補);
      this._部品.詳細パネル.担当者候補を更新する(担当者候補);
      this._部品.詳細パネル.ラベル候補を更新する(ラベル候補);
      this._部品.フィルタバー.担当者候補一覧を更新する(担当者候補);
      this._部品.フィルタバー.ラベル候補一覧を更新する(ラベル候補);
      this._部品.フィルタバー.選択状態を反映する(this._フィルタ状態);
      this._状態表示.クリアする();
      return 一覧;
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "札一覧の取得に失敗しました",
      );
      return undefined;
    }
  }

  種別フィルタを切り替える(種別: string): void {
    this._フィルタ状態 = 種別選択を切り替える(this._フィルタ状態, 種別);
    this._フィルタを再適用する();
  }

  担当者フィルタを切り替える(担当者: string): void {
    this._フィルタ状態 = 担当者選択を切り替える(this._フィルタ状態, 担当者);
    this._フィルタを再適用する();
  }

  ラベルフィルタを切り替える(ラベル: string): void {
    this._フィルタ状態 = ラベル選択を切り替える(this._フィルタ状態, ラベル);
    this._フィルタを再適用する();
  }

  private _フィルタを再適用する(): void {
    this._部品.フィルタバー.選択状態を反映する(this._フィルタ状態);
    this._列へ振り分ける();
  }

  async 作成する(内容: 札作成入力): Promise<void> {
    try {
      await this._クライアント.作成する(内容);
      this._部品.新規作成フォーム.クリアする();
      await this.更新する();
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "札の作成に失敗しました",
      );
    }
  }

  // 保存後もパネルは開いたままにする。閉じる操作は「閉じる」ボタン（on閉じる配線）
  // だけの責務とし、ここでは保存後の最新値をパネルへ反映するだけに留める
  async 保存する(id: number, 変更: 札更新入力): Promise<void> {
    try {
      await this._クライアント.更新する(id, 変更);
      const 一覧 = await this.更新する();
      const 保存後の札 = 一覧?.find((札) => 札.id === id);
      if (保存後の札 !== undefined) {
        this._部品.詳細パネル.保存完了を反映する(保存後の札);
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
        this._部品.詳細パネル.添付一覧を反映する(対象);
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
        this._部品.詳細パネル.添付一覧を反映する(対象);
      }
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "添付の削除に失敗しました",
      );
    }
  }

  private _列へ振り分ける(): void {
    const フィルタ済み一覧 = this._最新一覧.filter((札) =>
      札がフィルタに一致するか(札, this._フィルタ状態),
    );
    for (const 列 of this._部品.列一覧) {
      const 対象カード一覧 = フィルタ済み一覧
        .filter((札) => 札.状態 === 列.状態値)
        .map((札) =>
          new 札カード(札).配線する({ on選択: () => this._部品.詳細パネル.表示する(札) }),
        );
      列.カード一覧を差し替える(対象カード一覧);
    }
  }
}
