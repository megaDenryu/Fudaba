import { SpanC } from "sengen-ui";
import { 詳細保存完了ラベル表示状態 } from "../カンバン/詳細パネル状態";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細シート内容を取得する } from "./詳細シート内容";
import * as styles from "./style.css";

// 詳細シートの保存完了ラベル（LV1拡張）。保存成功直後だけ表示する
export class シート保存完了ラベル extends SpanC {
  constructor() {
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    super({ text: 文言.保存完了メッセージ, class: styles.シート保存完了ラベル });
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
