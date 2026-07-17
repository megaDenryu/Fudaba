import { 添付URLを組み立てる } from "../../通信/添付URL";
import type { 配線ポート } from "sengen-ui";
import type { I保存完了部品, I保存操作部品, I担当解除部品, I札編集配線 } from "./札編集配線";
import type { 札編集部品 } from "./札編集部品";
import type { 札編集状態サービス } from "./札編集状態サービス";

export class 札編集操作サービス {
  constructor(
    private readonly _部品: 札編集部品,
    private readonly _状態: 札編集状態サービス,
    private readonly _保存: I保存操作部品,
    private readonly _保存完了: I保存完了部品,
    private readonly _担当解除: I担当解除部品,
    private readonly _配線: 配線ポート<I札編集配線>,
    private readonly _担当解除確認: string,
  ) {
    this._入力イベントを配線する();
    this._添付イベントを配線する();
  }

  編集開始を反映する(): void { this._保存.隠す(); this._保存完了.隠す(); }
  保存完了を反映する(): void { this._保存.隠す(); this._保存完了.表示する(); }
  閉じる(): void { this._保存.隠す(); this._保存完了.隠す(); this._部品.添付プレビュー.閉じる(); }

  private _入力イベントを配線する(): void {
    this._部品.タイトル.onInput(() => this._変更を検査する());
    this._部品.本文.addTextAreaEventListener("input", () => this._変更を検査する())
      .on画像貼り付け((ファイル) => this._添付を追加する(ファイル))
      .on画像ドロップ((ファイル) => this._添付を追加する(ファイル))
      .on保存ショートカット(() => this._保存する());
    this._部品.チェックリスト.配線する({ on変更: () => this._変更を検査する() });
    this._部品.種別選択.onSelectChange(() => {
      this._部品.種別バッジ.種別を設定する(this._部品.種別選択.getValue());
      this._変更を検査する();
    });
    this._部品.状態.onSelectChange(() => this._変更を検査する());
    this._部品.担当者.onInput(() => this._変更を検査する());
    this._部品.ラベル.onInput(() => {
      this._状態.ラベル候補を再計算する();
      this._変更を検査する();
    });
    this._保存.onClick(() => this._保存する());
    this._担当解除.onClick(() => this._担当を解除する());
  }

  private _添付イベントを配線する(): void {
    this._部品.添付一覧.配線する({
      on追加: (ファイル) => this._添付を追加する(ファイル),
      on原寸表示: (保存名) => this._プレビューを開く(保存名),
      on削除: (保存名) => this._添付を削除する(保存名),
    });
    this._部品.添付プレビュー.配線する({ on閉じる: () => this._部品.添付プレビュー.閉じる() });
  }

  private _変更を検査する(): void {
    if (this._状態.変更があるか()) { this._保存.表示する(); this._保存完了.隠す(); }
    else this._保存.隠す();
  }

  private _保存する(): void {
    const 札 = this._状態.表示中を取得する();
    if (札 !== null) this._配線.先.on保存(札.id, this._状態.更新入力を作る());
  }

  private _添付を追加する(ファイル: File): void {
    const 札 = this._状態.表示中を取得する();
    if (札 !== null) this._配線.先.on添付追加(札.id, ファイル);
  }

  private _添付を削除する(保存名: string): void {
    const 札 = this._状態.表示中を取得する();
    if (札 !== null) this._配線.先.on添付削除(札.id, 保存名);
  }

  private _プレビューを開く(保存名: string): void {
    const 札 = this._状態.表示中を取得する();
    const 対象 = 札?.添付一覧.find((添付) => 添付.保存名 === 保存名);
    if (対象 !== undefined) this._部品.添付プレビュー.表示する(
      添付URLを組み立てる(保存名), 対象.ファイル名,
    );
  }

  private _担当を解除する(): void {
    const 札 = this._状態.表示中を取得する();
    if (札 !== null && window.confirm(this._担当解除確認)) this._配線.先.on担当解除(札.id);
  }
}
