import { SpanC } from "sengen-ui";
import * as styles from "./style.css";

// 札カードや詳細パネルに並ぶ、クリック不可の静止ラベル表示（LV1拡張）
export class ラベルチップ extends SpanC {
  constructor(ラベル: string) {
    super({ text: ラベル, class: styles.ラベルチップ });
  }
}
