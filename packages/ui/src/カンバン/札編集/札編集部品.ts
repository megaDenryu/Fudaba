import { select, textInput, type SelectC, type TextInputC } from "sengen-ui";
import { チェックリスト編集 } from "../チェックリスト編集/チェックリスト編集";
import { 候補リストC } from "../候補リストC";
import { 添付一覧 } from "../添付一覧";
import { 添付貼り付け対応本文入力 } from "../添付貼り付け対応本文入力";
import { 添付プレビュー } from "../添付プレビュー";
import { 種別バッジ } from "../種別バッジ";
import { 詳細ID表示 } from "../詳細ID表示";
import { 札状態選択肢, 札種別選択肢 } from "../定数";

export interface 札編集部品設定 {
  readonly タイトルclass: string;
  readonly 本文class: string;
  readonly セレクトclass: string;
  readonly 担当者class: string;
  readonly ラベルclass: string;
  readonly 本文行数: number;
  readonly 担当者候補ID: string;
  readonly ラベル候補ID: string;
  readonly 担当者プレースホルダー: string;
  readonly ラベルプレースホルダー: string;
}

// PC・モバイルの札編集画面が共有する部品DTO。イベント配線と状態はサービスへ委譲する。
export class 札編集部品 {
  readonly 種別バッジ = new 種別バッジ("");
  readonly id表示 = new 詳細ID表示();
  readonly タイトル: TextInputC;
  readonly 本文: 添付貼り付け対応本文入力;
  readonly チェックリスト = new チェックリスト編集();
  readonly 種別選択: SelectC;
  readonly 状態: SelectC;
  readonly 担当者: TextInputC;
  readonly 担当者候補: 候補リストC;
  readonly ラベル: TextInputC;
  readonly ラベル候補: 候補リストC;
  readonly 添付一覧 = new 添付一覧();
  readonly 添付プレビュー = new 添付プレビュー();

  constructor(readonly 設定: 札編集部品設定) {
    this.タイトル = textInput({ class: 設定.タイトルclass });
    this.本文 = new 添付貼り付け対応本文入力({ rows: 設定.本文行数, class: 設定.本文class })
      .入力に合わせて高さを調整する();
    this.種別選択 = select({
      options: 札種別選択肢.map((値) => ({ value: 値, text: 値 })), class: 設定.セレクトclass,
    });
    this.状態 = select({
      options: 札状態選択肢.map((値) => ({ value: 値, text: 値 })), class: 設定.セレクトclass,
    });
    this.担当者 = textInput({
      placeholder: 設定.担当者プレースホルダー, class: 設定.担当者class,
    }).setAttribute("list", 設定.担当者候補ID);
    this.担当者候補 = new 候補リストC(設定.担当者候補ID);
    this.ラベル = textInput({
      placeholder: 設定.ラベルプレースホルダー, class: 設定.ラベルclass,
    }).setAttribute("list", 設定.ラベル候補ID);
    this.ラベル候補 = new 候補リストC(設定.ラベル候補ID);
  }
}
