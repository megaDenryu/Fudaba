import { button, div, img, LV2HtmlComponentBase, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 添付プレビュー内容を取得する } from "./添付プレビュー内容";
import { 添付プレビュー開閉状態 } from "./詳細パネル状態";
import * as styles from "./style.css";

export interface I添付プレビュー配線 {
  on閉じる(): void;
}

// 添付画像の原寸表示オーバーレイ（LV2素部品）。ページ遷移ゼロ原則（DESIGN.md）に従い、
// 詳細パネル/詳細シート内に同居させ、position:fixedで画面全体を覆う形にする
export class 添付プレビュー extends LV2HtmlComponentBase implements I配線可能<I添付プレビュー配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I添付プレビュー配線>("添付プレビュー");
  private readonly _画像領域: DivC;

  constructor() {
    super();
    this._画像領域 = div({ class: styles.添付プレビュー画像領域 });
    this._componentRoot = this._ルートを構築する(this._画像領域);
  }

  配線する(配線: I添付プレビュー配線): this {
    this._配線.配線する(配線);
    return this;
  }

  表示する(url: string, ファイル名: string): void {
    this._画像領域
      .clearChildren()
      .child(img({ src: url, alt: ファイル名, class: styles.添付プレビュー画像 }));
    this._componentRoot.setAttribute(添付プレビュー開閉状態.attribute, 添付プレビュー開閉状態.value.開);
  }

  閉じる(): void {
    this._componentRoot.setAttribute(添付プレビュー開閉状態.attribute, 添付プレビュー開閉状態.value.閉);
    this._画像領域.clearChildren();
  }

  private _ルートを構築する(画像領域: DivC): DivC {
    const 文言 = 添付プレビュー内容を取得する(現在ロケールを取得する());
    return (
      div({ class: styles.添付プレビュー背景 })
        .setAttribute(添付プレビュー開閉状態.attribute, 添付プレビュー開閉状態.value.閉)
        .onClick(() => this._配線.先.on閉じる())
        .child(
          div({ class: styles.添付プレビュー本体 })
            .onClick((event) => event.stopPropagation())
            .childs([
                button({ text: 文言.閉じるボタン, class: styles.添付プレビュー閉じるボタン }).onClick(() =>
                  this._配線.先.on閉じる(),
                ),
                画像領域]))
    );
  }
}
