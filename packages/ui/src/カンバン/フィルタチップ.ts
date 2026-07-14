import { SpanC, 配線ポート, type I配線可能 } from "sengen-ui";
import { フィルタチップ選択状態 } from "./フィルタチップ選択状態";
import * as styles from "./style.css";

export interface Iフィルタチップ配線 {
  on選択(): void;
}

// フィルタバーに並ぶクリック可能なチップ（LV1拡張）。クリックのたびに親（フィルタバー）へ
// 通知するだけで、選択状態そのものは親が真実を持ち選択状態を反映する()経由で反映させる
export class フィルタチップ extends SpanC implements I配線可能<Iフィルタチップ配線> {
  private readonly _配線 = new 配線ポート<Iフィルタチップ配線>("フィルタチップ");

  constructor(表示文字列: string) {
    super({ text: 表示文字列, class: styles.フィルタチップ });
    this.setAttribute(フィルタチップ選択状態.attribute, フィルタチップ選択状態.value.未選択);
    this.onClick(() => this._配線.先.on選択());
  }

  配線する(配線: Iフィルタチップ配線): this {
    this._配線.配線する(配線);
    return this;
  }

  選択状態を設定する(選択中: boolean): this {
    this.setAttribute(
      フィルタチップ選択状態.attribute,
      選択中 ? フィルタチップ選択状態.value.選択中 : フィルタチップ選択状態.value.未選択,
    );
    return this;
  }
}
