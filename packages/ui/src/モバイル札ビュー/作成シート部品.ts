import { div, type DivC } from "sengen-ui";
import { 作成者名を読み込む } from "../作成者名記憶";
import { 札作成部品 } from "../カンバン/札作成/札作成部品";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { シート開閉状態 } from "./シート開閉状態";
import { 作成シート内容を取得する } from "./作成シート内容";
import * as styles from "./style.css";

export class 作成シート部品 {
  readonly 背景: DivC = div({ class: styles.シート背景 });
  readonly 本体: DivC = div({ class: styles.シート本体 });
  readonly 作成: 札作成部品;

  constructor() {
    const 文言 = 作成シート内容を取得する(現在ロケールを取得する());
    this.作成 = new 札作成部品({
      入力class: styles.シート入力, タイトルclass: styles.シート入力, 本文class: styles.シート本文入力,
      種別class: styles.シートセレクト, 本文行数: 3, モバイル添付: true,
      担当者候補ID: "fudaba-モバイル作成シート-担当者候補",
      ラベル候補ID: "fudaba-モバイル作成シート-ラベル候補",
      タイトル案内: 文言.タイトルプレースホルダー, 本文案内: 文言.本文プレースホルダー,
      担当者案内: 文言.担当者プレースホルダー, ラベル案内: 文言.ラベルプレースホルダー,
      作成者案内: 文言.作成者プレースホルダー, 作成者初期値: 作成者名を読み込む(),
    });
    this.開閉状態を設定する(シート開閉状態.value.閉);
  }

  開閉状態を設定する(値: string): void {
    this.背景.setAttribute(シート開閉状態.attribute, 値);
    this.本体.setAttribute(シート開閉状態.attribute, 値);
  }
}
