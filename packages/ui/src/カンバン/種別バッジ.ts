import { SpanC } from "sengen-ui";
import { 札種別配色 } from "../テーマ";
import * as styles from "./style.css";

const 既定配色 = "#8078a4";

// 札の次の扱い方を示す種別を色分けして表示するバッジ（LV1拡張）
export class 種別バッジ extends SpanC {
  constructor(種別: string) {
    super({ class: styles.種別バッジ });
    this.種別を設定する(種別);
  }

  種別を設定する(種別: string): this {
    this.setTextContent(種別);
    this.setStyleCSS({ backgroundColor: 札種別配色[種別] ?? 既定配色 });
    return this;
  }
}
