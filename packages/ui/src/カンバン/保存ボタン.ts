import { ButtonC } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import { 詳細保存ボタン表示状態 } from "./詳細パネル状態";
import * as styles from "./style.css";

// 詳細パネルの保存ボタン（LV1拡張）。パネルを開いた直後（未編集）は隠れており、
// フォームが元の札の値から変更されたときだけ表示する（data-attribute管理、
// SengenUIガイド第13条）
export class 保存ボタン extends ButtonC {
  constructor() {
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    super({ text: 文言.保存ボタン, class: styles.詳細保存ボタン });
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
