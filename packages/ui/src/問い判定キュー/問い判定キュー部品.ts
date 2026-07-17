import { button, div, span, textInput, TextAreaC, type DivC, type SpanC, type TextInputC } from "sengen-ui";
import { 作成者名を読み込む } from "../作成者名記憶";
import * as styles from "./style.css";

export class 問い判定キュー部品 {
  readonly 件数: SpanC = span({ class: styles.件数 });
  readonly タイトル: SpanC = span({ class: styles.タイトル });
  readonly 本文: DivC = div({ class: styles.本文 });
  readonly メタ: SpanC = span({ class: styles.メタ });
  readonly 添付領域: DivC = div({ class: styles.添付領域 });
  readonly 選択肢領域: DivC = div({ class: styles.選択肢領域 });
  readonly 状態: SpanC = span({ class: styles.状態 });
  readonly 回答者: TextInputC = textInput({
    class: styles.回答者, placeholder: "回答者名", value: 作成者名を読み込む(),
  });
  readonly メモ = new TextAreaC({ class: styles.メモ, placeholder: "回答メモ（任意）", rows: 2 });
  readonly 更新ボタン = button({ text: "更新", class: styles.更新ボタン });

}
