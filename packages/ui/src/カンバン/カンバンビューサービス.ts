import type { 札クライアント } from "../通信/札クライアント";
import type { 札DTO, 札作成入力, 札更新入力 } from "../通信/札型";
import { カンバンビュー部品 } from "./カンバンビュー部品";
import { 状態表示ラベル } from "./状態表示ラベル";
import { 担当者候補一覧を抽出する } from "./担当者候補抽出";
import { 札カード } from "./札カード";

// カンバンビューのロジック層。API呼び出しと4列への振り分けを担い、
// ビュー本体は配線に徹する（AgentRoomのルーム一覧サイドバーサービスと同じ構成方針）
export class カンバンビューサービス {
  constructor(
    private readonly _クライアント: 札クライアント,
    private readonly _部品: カンバンビュー部品,
    private readonly _状態表示: 状態表示ラベル,
  ) {}

  async 更新する(): Promise<readonly 札DTO[] | undefined> {
    try {
      const 一覧 = await this._クライアント.一覧を取得する();
      this._列へ振り分ける(一覧);
      const 担当者候補 = 担当者候補一覧を抽出する(一覧);
      this._部品.新規作成フォーム.担当者候補を更新する(担当者候補);
      this._部品.詳細パネル.担当者候補を更新する(担当者候補);
      this._状態表示.クリアする();
      return 一覧;
    } catch (エラー) {
      this._状態表示.エラーを表示する(
        エラー instanceof Error ? エラー.message : "札一覧の取得に失敗しました",
      );
      return undefined;
    }
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

  private _列へ振り分ける(一覧: readonly 札DTO[]): void {
    for (const 列 of this._部品.列一覧) {
      const 対象カード一覧 = 一覧
        .filter((札) => 札.状態 === 列.状態値)
        .map((札) =>
          new 札カード(札).配線する({ on選択: () => this._部品.詳細パネル.表示する(札) }),
        );
      列.カード一覧を差し替える(対象カード一覧);
    }
  }
}
