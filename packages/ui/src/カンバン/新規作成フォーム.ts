import { button, div, LV2部品集約Base, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import { 作成者名を読み込む } from "../作成者名記憶";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 新規作成フォーム内容を取得する } from "./新規作成フォーム内容";
import { 札作成サービス, type I札作成配線 } from "./札作成/札作成サービス";
import { 札作成部品 } from "./札作成/札作成部品";
import * as styles from "./style.css";

export type I新規作成フォーム配線 = I札作成配線;

export class 新規作成フォーム extends LV2部品集約Base<札作成部品, 札作成サービス>
  implements I配線可能<I新規作成フォーム配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I新規作成フォーム配線>("新規作成フォーム");
  private readonly _部品: 札作成部品;
  private readonly _サービス: 札作成サービス;

  constructor() {
    super();
    const 文言 = 新規作成フォーム内容を取得する(現在ロケールを取得する());
    this._部品 = new 札作成部品({
      入力class: styles.フォーム担当者, タイトルclass: styles.フォーム入力, 本文class: styles.フォーム本文,
      種別class: styles.フォームセレクト, 本文行数: 2, モバイル添付: false,
      担当者候補ID: "fudaba-新規作成フォーム-担当者候補",
      ラベル候補ID: "fudaba-新規作成フォーム-ラベル候補",
      タイトル案内: 文言.タイトルプレースホルダー, 本文案内: 文言.本文プレースホルダー,
      担当者案内: 文言.担当者プレースホルダー, ラベル案内: 文言.ラベルプレースホルダー,
      作成者案内: 文言.作成者プレースホルダー, 作成者初期値: 作成者名を読み込む(),
    });
    this._サービス = new 札作成サービス(this._部品, this._配線);
    this._componentRoot = this._ルートを構築する(this._部品, this._サービス);
  }

  protected _ルートを構築する(部品: 札作成部品, サービス: 札作成サービス): DivC {
    const 文言 = 新規作成フォーム内容を取得する(現在ロケールを取得する());
    return div({ class: styles.新規フォーム }).childs([
      div({ class: styles.新規フォーム行 }).childs([
        部品.種別, 部品.タイトル, 部品.担当者, 部品.担当者候補,
        部品.ラベル, 部品.ラベル候補, 部品.作成者,
      ]),
      div({ class: styles.作成エディタ }).childs([
        div({ class: styles.フォーム本文領域 }).childs([部品.本文, 部品.添付]),
        button({ text: 文言.作成ボタン, class: styles.フォームボタン }).onClick(() => サービス.作成する()),
      ]),
    ]);
  }

  配線する(配線: I新規作成フォーム配線): this { this._配線.配線する(配線); return this; }
  クリアする(): void { this._サービス.クリアする(); }
  担当者候補を更新する(候補: readonly string[]): void { this._サービス.担当者候補を更新する(候補); }
  ラベル候補を更新する(候補: readonly string[]): void { this._サービス.ラベル候補を更新する(候補); }
}
