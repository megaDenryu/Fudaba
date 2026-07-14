import { SpanC } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import { 詳細保存完了ラベル表示状態 } from "./詳細パネル状態";
import * as styles from "./style.css";

// 詳細パネルの保存完了ラベル（LV1拡張）。保存成功直後だけ「保存しました」を表示し、
// 次の編集開始や別札への切り替えで隠す（data-attribute管理、SengenUIガイド第13条）
export class 保存完了ラベル extends SpanC {
  constructor() {
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    super({ text: 文言.保存完了メッセージ, class: styles.詳細保存完了ラベル });
    this.隠す();
  }

  表示する(): this {
    this.setAttribute(詳細保存完了ラベル表示状態.attribute, 詳細保存完了ラベル表示状態.value.表示);
    return this;
  }

  隠す(): this {
    this.setAttribute(詳細保存完了ラベル表示状態.attribute, 詳細保存完了ラベル表示状態.value.非表示);
    return this;
  }
}
