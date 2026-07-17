import { button, div, LV2HtmlComponentBase, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import type { 札編集部品 } from "./札編集/札編集部品";
import * as styles from "./style.css";

interface I詳細パネルヘッダ配線 { on閉じる(): void }

// ヘッダだけを構成するLV2素部品。内包するのはLV1部品のみ。
export class 詳細パネルヘッダ extends LV2HtmlComponentBase
  implements I配線可能<I詳細パネルヘッダ配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I詳細パネルヘッダ配線>("詳細パネルヘッダ");

  constructor(編集: 札編集部品) {
    super();
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    this._componentRoot = div({ class: styles.詳細ヘッダ }).childs([
      div({ class: styles.詳細ヘッダ本体 }).childs([
        div({ class: styles.詳細メタ行 }).childs([編集.種別バッジ, 編集.id表示]),
        編集.タイトル,
      ]),
      button({ text: 文言.閉じるボタン, class: styles.詳細閉じるボタン }).onClick(() =>
        this._配線.先.on閉じる(),
      ),
    ]);
  }

  配線する(配線: I詳細パネルヘッダ配線): this {
    this._配線.配線する(配線);
    return this;
  }
}
