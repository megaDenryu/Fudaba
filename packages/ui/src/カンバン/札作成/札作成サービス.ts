import type { 配線ポート } from "sengen-ui";
import { 作成者名を保存する } from "../../作成者名記憶";
import { ラベル文字列を配列にする } from "../ラベル入力パース";
import type { 札作成要求 } from "../札作成要求";
import type { 札作成部品 } from "./札作成部品";

export interface I札作成配線 { on作成(要求: 札作成要求): void }

export class 札作成サービス {
  private _ラベル候補一覧: readonly string[] = [];

  constructor(
    private readonly _部品: 札作成部品,
    private readonly _配線: 配線ポート<I札作成配線>,
  ) {
    _部品.タイトル.onEnterKey(() => this.作成する());
    _部品.本文.on画像貼り付け((file) => _部品.添付.追加する(file))
      .on画像ドロップ((file) => _部品.添付.追加する(file))
      .on保存ショートカット(() => this.作成する());
    _部品.ラベル.onInput(() => this._ラベル候補を反映する());
  }

  作成する(): void {
    const タイトル = this._部品.タイトル.getValue().trim();
    const 作成者 = this._部品.作成者.getValue().trim();
    if (タイトル.length === 0 || 作成者.length === 0) return;
    作成者名を保存する(作成者);
    const 担当者 = this._部品.担当者.getValue().trim();
    this._配線.先.on作成({
      内容: {
        種別: this._部品.種別.getValue(), タイトル, 本文: this._部品.本文.getValue(),
        担当者: 担当者.length === 0 ? undefined : 担当者, 作成者,
        ラベル一覧: ラベル文字列を配列にする(this._部品.ラベル.getValue()),
      },
      添付ファイル一覧: this._部品.添付.ファイル一覧(),
    });
  }

  クリアする(): void {
    this._部品.タイトル.setValue(""); this._部品.本文.setValue("");
    this._部品.担当者.setValue(""); this._部品.ラベル.setValue(""); this._部品.添付.クリアする();
  }

  担当者候補を更新する(候補: readonly string[]): void { this._部品.担当者候補.候補を設定する(候補); }
  ラベル候補を更新する(候補: readonly string[]): void {
    this._ラベル候補一覧 = [...候補]; this._ラベル候補を反映する();
  }

  private _ラベル候補を反映する(): void {
    this._部品.ラベル候補.複数ラベル候補を設定する(
      this._部品.ラベル.getValue(), this._ラベル候補一覧,
    );
  }
}
