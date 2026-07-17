import type { 札DTO, 札更新入力 } from "../../通信/札型";
import { ラベル文字列を配列にする, ラベル配列を文字列にする } from "../ラベル入力パース";
import { 編集値に変更があるか } from "../詳細パネル変更検知";
import type { I担当解除部品 } from "./札編集配線";
import type { 札編集部品 } from "./札編集部品";

export class 札編集状態サービス {
  private _表示中の札: 札DTO | null = null;
  private _ラベル候補一覧: readonly string[] = [];

  constructor(
    private readonly _部品: 札編集部品,
    private readonly _担当解除: I担当解除部品,
  ) {}

  表示する(札: 札DTO): void {
    this._表示中の札 = 札;
    this._部品.種別バッジ.種別を設定する(札.種別);
    this._部品.id表示.設定する(札.id);
    this._部品.タイトル.setValue(札.タイトル).setAttribute("title", 札.タイトル);
    this._部品.本文.setValue(札.本文);
    this._部品.チェックリスト.設定する(札.チェック項目一覧);
    this._部品.添付一覧.更新する(札.添付一覧);
    this._部品.種別選択.setValue(札.種別);
    this._部品.状態.setValue(札.状態);
    this._部品.担当者.setValue(札.担当者 ?? "");
    this._担当解除.担当状態を反映する(札.担当者);
    this._部品.ラベル.setValue(ラベル配列を文字列にする(札.ラベル一覧));
    this._ラベル候補を反映する();
  }

  閉じる(): void { this._表示中の札 = null; }
  表示中を取得する(): 札DTO | null { return this._表示中の札; }

  担当者候補を更新する(候補一覧: readonly string[]): void {
    this._部品.担当者候補.候補を設定する(候補一覧);
  }

  ラベル候補を更新する(候補一覧: readonly string[]): void {
    this._ラベル候補一覧 = [...候補一覧];
    this._ラベル候補を反映する();
  }

  ラベル候補を再計算する(): void { this._ラベル候補を反映する(); }

  添付一覧を反映する(札: 札DTO): void {
    this._表示中の札 = 札;
    this._部品.添付一覧.更新する(札.添付一覧);
  }

  更新入力を作る(): 札更新入力 {
    const 担当者 = this._部品.担当者.getValue().trim();
    return {
      種別: this._部品.種別選択.getValue(),
      タイトル: this._部品.タイトル.getValue().trim(),
      本文: this._部品.本文.getValue(),
      状態: this._部品.状態.getValue(),
      担当者: 担当者.length === 0 ? null : 担当者,
      ラベル一覧: ラベル文字列を配列にする(this._部品.ラベル.getValue()),
      チェック項目一覧: this._部品.チェックリスト.取得する(),
    };
  }

  変更があるか(): boolean {
    if (this._表示中の札 === null) return false;
    const 更新 = this.更新入力を作る();
    return 編集値に変更があるか(this._表示中の札, {
      種別: 更新.種別 ?? "",
      タイトル: 更新.タイトル ?? "",
      本文: 更新.本文 ?? "",
      状態: 更新.状態 ?? "",
      担当者: 更新.担当者 ?? "",
      ラベル一覧: this._部品.ラベル.getValue(),
      チェック項目一覧: 更新.チェック項目一覧 ?? [],
    });
  }

  private _ラベル候補を反映する(): void {
    this._部品.ラベル候補.複数ラベル候補を設定する(
      this._部品.ラベル.getValue(), this._ラベル候補一覧,
    );
  }
}
