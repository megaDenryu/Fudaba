import { ButtonC } from "sengen-ui";
import { 詳細保存ボタン表示状態 } from "./詳細パネル状態";
import * as styles from "./style.css";

// 詳細パネルの保存ボタン（LV1拡張）。パネルを開いた直後（未編集）は隠れており、
// フォームが元の札の値から変更されたときだけ表示する（data-attribute管理、
// SengenUIガイド第13条）
export class 保存ボタン extends ButtonC {
  constructor() {
    super({ text: "保存", class: styles.詳細保存ボタン });
    this.隠す();
  }

  表示する(): this {
    this.setAttribute(詳細保存ボタン表示状態.attribute, 詳細保存ボタン表示状態.value.表示);
    return this;
  }

  隠す(): this {
    this.setAttribute(詳細保存ボタン表示状態.attribute, 詳細保存ボタン表示状態.value.非表示);
    return this;
  }
}
