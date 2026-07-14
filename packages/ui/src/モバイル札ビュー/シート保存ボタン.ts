import { ButtonC } from "sengen-ui";
import { 詳細保存ボタン表示状態 } from "../カンバン/詳細パネル状態";
import * as styles from "./style.css";

// 詳細シートの保存ボタン（LV1拡張）。フォームが元の札の値から変更されたときだけ表示する
// （data-attribute管理、SengenUIガイド第13条）。表示状態の意味はカンバン詳細パネルの
// 保存ボタンと同一のため、状態定数を共有する
export class シート保存ボタン extends ButtonC {
  constructor() {
    super({ text: "保存", class: styles.シート保存ボタン });
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
