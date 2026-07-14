import { ButtonC } from "sengen-ui";
import { 詳細保存ボタン表示状態 } from "../カンバン/詳細パネル状態";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細シート内容を取得する } from "./詳細シート内容";
import * as styles from "./style.css";

// 詳細シートの保存ボタン（LV1拡張）。フォームが元の札の値から変更されたときだけ表示する
// （data-attribute管理、SengenUIガイド第13条）。表示状態の意味はカンバン詳細パネルの
// 保存ボタンと同一のため、状態定数を共有する
export class シート保存ボタン extends ButtonC {
  constructor() {
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    super({ text: 文言.保存ボタン, class: styles.シート保存ボタン });
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
