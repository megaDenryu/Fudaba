import { button, div, LV2HtmlComponentBase, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import type { 札編集部品 } from "../カンバン/札編集/札編集部品";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細シート内容を取得する } from "./詳細シート内容";
import * as styles from "./style.css";

interface I詳細シートヘッダ配線 { on閉じる(): void }

export class 詳細シートヘッダ extends LV2HtmlComponentBase
  implements I配線可能<I詳細シートヘッダ配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I詳細シートヘッダ配線>("詳細シートヘッダ");

  constructor(編集: 札編集部品) {
    super();
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    this._componentRoot = div({ class: styles.シートヘッダ }).childs([
      div({ class: styles.シートヘッダ本体 }).childs([
        div({ class: styles.シートメタ行 }).childs([編集.種別バッジ, 編集.id表示]),
        編集.タイトル,
      ]),
      button({ text: 文言.閉じるボタン, class: styles.シート閉じるボタン }).onClick(() =>
        this._配線.先.on閉じる(),
      ),
    ]);
  }

  配線する(配線: I詳細シートヘッダ配線): this {
    this._配線.配線する(配線);
    return this;
  }
}
