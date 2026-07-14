import { SpanC } from "sengen-ui";
import * as styles from "./style.css";

// 札IDを「#8」のように薄く小さい添え字として表示するラベル（LV1拡張）。
// 詳細パネルのヘッダで種別バッジと並べるメタ情報として使う。
// 表示中の札が切り替わるたびに設定し直す動的更新が必要なため、裸のSpanCではなく
// LV1拡張クラスに昇格させている（SengenUIガイド第4条）
export class 詳細ID表示 extends SpanC {
  constructor() {
    super({ class: styles.カードID });
  }

  設定する(id: number): this {
    this.setTextContent(`#${id}`);
    return this;
  }
}
