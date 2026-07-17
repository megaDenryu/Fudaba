import { 札協働表示 } from "../札協働表示/札協働表示";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 担当解除ボタン } from "./担当解除ボタン";
import { 保存完了ラベル } from "./保存完了ラベル";
import { 保存ボタン } from "./保存ボタン";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import { 札編集部品 } from "./札編集/札編集部品";
import * as styles from "./style.css";

export class 詳細パネル部品 {
  readonly 保存ボタン = new 保存ボタン();
  readonly 保存完了ラベル = new 保存完了ラベル();
  readonly 担当解除ボタン = new 担当解除ボタン();
  readonly 協働表示 = new 札協働表示();
  readonly 編集: 札編集部品;

  constructor() {
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    this.編集 = new 札編集部品({
      タイトルclass: styles.詳細タイトル入力,
      本文class: styles.詳細本文入力,
      セレクトclass: styles.詳細状態セレクト,
      担当者class: styles.詳細担当者入力,
      ラベルclass: styles.詳細ラベル入力欄,
      本文行数: 6,
      担当者候補ID: "fudaba-詳細パネル-担当者候補",
      ラベル候補ID: "fudaba-詳細パネル-ラベル候補",
      担当者プレースホルダー: 文言.担当者プレースホルダー,
      ラベルプレースホルダー: 文言.ラベルプレースホルダー,
    });
  }
}
