import { div, span, LV2部品集約Base, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import type { 札DTO } from "../通信/札型";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細パネルヘッダ } from "./詳細パネルヘッダ";
import { 詳細パネル部品 } from "./詳細パネル部品";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import { 詳細パネル開閉状態 } from "./詳細パネル状態";
import { 札編集操作サービス } from "./札編集/札編集操作サービス";
import type { I札編集配線 } from "./札編集/札編集配線";
import { 札編集状態サービス } from "./札編集/札編集状態サービス";
import * as styles from "./style.css";

export type I詳細パネル配線 = I札編集配線;

export class 詳細パネル extends LV2部品集約Base<詳細パネル部品, 札編集操作サービス>
  implements I配線可能<I詳細パネル配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I詳細パネル配線>("詳細パネル");
  private readonly _部品 = new 詳細パネル部品();
  private readonly _状態 = new 札編集状態サービス(this._部品.編集, this._部品.担当解除ボタン);
  private readonly _サービス: 札編集操作サービス;

  constructor() {
    super();
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    this._サービス = new 札編集操作サービス(
      this._部品.編集, this._状態, this._部品.保存ボタン, this._部品.保存完了ラベル,
      this._部品.担当解除ボタン, this._配線, 文言.担当解除確認メッセージ,
    );
    this._componentRoot = this._ルートを構築する(this._部品, this._サービス);
  }

  protected _ルートを構築する(部品: 詳細パネル部品, _サービス: 札編集操作サービス): DivC {
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    const 編集 = 部品.編集;
    return div({ class: styles.詳細パネル }).setAttribute(
      詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.閉,
    ).childs([
      new 詳細パネルヘッダ(編集).配線する({ on閉じる: () => this._配線.先.on閉じる() }),
      div({ text: 文言.本文ラベル, class: styles.詳細ラベル }), 編集.本文, 編集.チェックリスト,
      div({ class: styles.詳細フィールド単独 }).childs([
        span({ text: 文言.種別ラベル, class: styles.詳細ラベル }), 編集.種別選択,
      ]),
      div({ class: styles.詳細行 }).childs([
        div({ class: styles.詳細フィールド }).childs([
          span({ text: 文言.状態ラベル, class: styles.詳細ラベル }), 編集.状態,
        ]),
        div({ class: styles.詳細フィールド }).childs([
          span({ text: 文言.担当者ラベル, class: styles.詳細ラベル }), 編集.担当者,
          編集.担当者候補, 部品.担当解除ボタン,
        ]),
      ]),
      div({ class: styles.詳細フィールド単独 }).childs([
        span({ text: 文言.ラベルラベル, class: styles.詳細ラベル }), 編集.ラベル, 編集.ラベル候補,
      ]),
      編集.添付一覧,
      div({ class: styles.詳細保存ボタン行 }).childs([
        部品.保存ボタン, 部品.保存完了ラベル,
      ]),
      部品.協働表示, 編集.添付プレビュー,
    ]);
  }

  配線する(配線: I詳細パネル配線): this { this._配線.配線する(配線); return this; }
  表示する(札: 札DTO): void {
    this._状態.表示する(札); this._サービス.編集開始を反映する();
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.開);
    void this._部品.協働表示.表示する(札.id);
  }
  保存完了を反映する(札: 札DTO): void { this._状態.表示する(札); this._サービス.保存完了を反映する(); }
  閉じる(): void {
    this._状態.閉じる(); this._サービス.閉じる();
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.閉);
  }
  担当者候補を更新する(候補: readonly string[]): void { this._状態.担当者候補を更新する(候補); }
  ラベル候補を更新する(候補: readonly string[]): void { this._状態.ラベル候補を更新する(候補); }
  添付一覧を反映する(札: 札DTO): void { this._状態.添付一覧を反映する(札); }
}
