import { div, type DivC } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 札編集部品 } from "../カンバン/札編集/札編集部品";
import { シート担当解除ボタン } from "./シート担当解除ボタン";
import { シート保存完了ラベル } from "./シート保存完了ラベル";
import { シート保存ボタン } from "./シート保存ボタン";
import { 詳細シート内容を取得する } from "./詳細シート内容";
import { シート開閉状態 } from "./シート開閉状態";
import * as styles from "./style.css";

export class 詳細シート部品 {
  readonly 保存ボタン = new シート保存ボタン();
  readonly 保存完了ラベル = new シート保存完了ラベル();
  readonly 担当解除ボタン = new シート担当解除ボタン();
  readonly 背景: DivC = div({ class: styles.シート背景 }).setAttribute(
    シート開閉状態.attribute, シート開閉状態.value.閉,
  );
  readonly 本体: DivC = div({ class: styles.シート本体 }).setAttribute(
    シート開閉状態.attribute, シート開閉状態.value.閉,
  );
  readonly 編集: 札編集部品;

  constructor() {
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    this.編集 = new 札編集部品({
      タイトルclass: styles.シート入力,
      本文class: styles.シート本文入力,
      セレクトclass: styles.シートセレクト,
      担当者class: styles.シート入力,
      ラベルclass: styles.シート入力,
      本文行数: 5,
      担当者候補ID: "fudaba-モバイル詳細シート-担当者候補",
      ラベル候補ID: "fudaba-モバイル詳細シート-ラベル候補",
      担当者プレースホルダー: 文言.担当者プレースホルダー,
      ラベルプレースホルダー: 文言.ラベルプレースホルダー,
    });
  }

  開閉状態を設定する(値: string): void {
    this.背景.setAttribute(シート開閉状態.attribute, 値);
    this.本体.setAttribute(シート開閉状態.attribute, 値);
  }
}
