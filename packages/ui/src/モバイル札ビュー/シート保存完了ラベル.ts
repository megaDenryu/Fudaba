import { SpanC } from "sengen-ui";
import { 詳細保存完了ラベル表示状態 } from "../カンバン/詳細パネル状態";
import * as styles from "./style.css";

// 詳細シートの保存完了ラベル（LV1拡張）。保存成功直後だけ表示する
export class シート保存完了ラベル extends SpanC {
  constructor() {
    super({ text: "保存しました", class: styles.シート保存完了ラベル });
    this.隠す();
  }

  表示する(): this {
    this.setAttribute(詳細保存完了ラベル表示状態.attribute, 詳細保存完了ラベル表示状態.value.表示);
    return this;
  }

  隠す(): this {
    this.setAttribute(
      詳細保存完了ラベル表示状態.attribute,
      詳細保存完了ラベル表示状態.value.非表示,
    );
    return this;
  }
}
