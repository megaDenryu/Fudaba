import { button, div, span, LV2部品集約Base, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import { 札作成サービス, type I札作成配線 } from "../カンバン/札作成/札作成サービス";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { シート開閉状態 } from "./シート開閉状態";
import { 作成シート内容を取得する } from "./作成シート内容";
import { 作成シート部品 } from "./作成シート部品";
import * as styles from "./style.css";

export interface I作成シート配線 extends I札作成配線 { on閉じる(): void }

export class 作成シート extends LV2部品集約Base<作成シート部品, 札作成サービス>
  implements I配線可能<I作成シート配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I作成シート配線>("作成シート");
  private readonly _部品 = new 作成シート部品();
  private readonly _サービス = new 札作成サービス(this._部品.作成, this._配線);

  constructor() {
    super();
    this._componentRoot = this._ルートを構築する(this._部品, this._サービス);
  }

  protected _ルートを構築する(部品: 作成シート部品, サービス: 札作成サービス): DivC {
    const 文言 = 作成シート内容を取得する(現在ロケールを取得する());
    const 作成 = 部品.作成;
    部品.背景.onClick(() => this._配線.先.on閉じる());
    部品.本体.childs([
      div({ class: styles.シートヘッダ }).childs([
        span({ text: 文言.シートタイトル, class: styles.タイトル }),
        button({ text: 文言.閉じるボタン, class: styles.シート閉じるボタン })
          .onClick(() => this._配線.先.on閉じる()),
      ]),
      span({ text: 文言.種別ラベル, class: styles.シートフィールドラベル }), 作成.種別,
      span({ text: 文言.タイトルラベル, class: styles.シートフィールドラベル }), 作成.タイトル,
      span({ text: 文言.本文ラベル, class: styles.シートフィールドラベル }), 作成.本文, 作成.添付,
      span({ text: 文言.担当者ラベル, class: styles.シートフィールドラベル }),
      作成.担当者, 作成.担当者候補,
      span({ text: 文言.ラベルラベル, class: styles.シートフィールドラベル }),
      作成.ラベル, 作成.ラベル候補,
      span({ text: 文言.作成者ラベル, class: styles.シートフィールドラベル }), 作成.作成者,
      button({ text: 文言.作成ボタン, class: styles.シート保存ボタン }).onClick(() => サービス.作成する()),
    ]);
    return div().childs([部品.背景, 部品.本体]);
  }

  配線する(配線: I作成シート配線): this { this._配線.配線する(配線); return this; }
  開く(): void { this._部品.開閉状態を設定する(シート開閉状態.value.開); }
  閉じる(): void { this._部品.開閉状態を設定する(シート開閉状態.value.閉); }
  クリアする(): void { this._サービス.クリアする(); }
  担当者候補を更新する(候補: readonly string[]): void { this._サービス.担当者候補を更新する(候補); }
  ラベル候補を更新する(候補: readonly string[]): void { this._サービス.ラベル候補を更新する(候補); }
}
