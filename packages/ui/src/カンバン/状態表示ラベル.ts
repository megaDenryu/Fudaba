import { SpanC } from "sengen-ui";
import * as styles from "./style.css";

// 通信エラー等を表示する小さなラベル（LV1拡張）。空文字のときはCSSで非表示になる
export class 状態表示ラベル extends SpanC {
  constructor() {
    super({ class: styles.状態表示 });
  }

  エラーを表示する(メッセージ: string): this {
    this.setTextContent(メッセージ);
    return this;
  }

  クリアする(): this {
    this.setTextContent("");
    return this;
  }
}
