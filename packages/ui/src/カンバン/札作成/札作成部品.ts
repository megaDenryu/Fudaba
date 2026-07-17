import { select, textInput, type SelectC, type TextInputC } from "sengen-ui";
import { 候補リストC } from "../候補リストC";
import { 作成時添付欄 } from "../作成時添付欄";
import { 添付貼り付け対応本文入力 } from "../添付貼り付け対応本文入力";
import { 札種別選択肢 } from "../定数";

export interface 札作成部品設定 {
  readonly 入力class: string; readonly タイトルclass: string; readonly 本文class: string; readonly 種別class: string;
  readonly 本文行数: number; readonly モバイル添付: boolean;
  readonly 担当者候補ID: string; readonly ラベル候補ID: string;
  readonly タイトル案内: string; readonly 本文案内: string;
  readonly 担当者案内: string; readonly ラベル案内: string; readonly 作成者案内: string;
  readonly 作成者初期値: string;
}

export class 札作成部品 {
  readonly 種別: SelectC;
  readonly タイトル: TextInputC;
  readonly 本文: 添付貼り付け対応本文入力;
  readonly 添付: 作成時添付欄;
  readonly 担当者: TextInputC;
  readonly 担当者候補: 候補リストC;
  readonly ラベル: TextInputC;
  readonly ラベル候補: 候補リストC;
  readonly 作成者: TextInputC;

  constructor(readonly 設定: 札作成部品設定) {
    this.種別 = select({
      options: 札種別選択肢.map((値, index) => ({ value: 値, text: 値, selected: index === 0 })),
      class: 設定.種別class,
    });
    this.タイトル = textInput({ placeholder: 設定.タイトル案内, class: 設定.タイトルclass });
    this.本文 = new 添付貼り付け対応本文入力({
      placeholder: 設定.本文案内, rows: 設定.本文行数, class: 設定.本文class,
    }).入力に合わせて高さを調整する();
    this.添付 = new 作成時添付欄(設定.モバイル添付);
    this.担当者 = textInput({ placeholder: 設定.担当者案内, class: 設定.入力class })
      .setAttribute("list", 設定.担当者候補ID);
    this.担当者候補 = new 候補リストC(設定.担当者候補ID);
    this.ラベル = textInput({ placeholder: 設定.ラベル案内, class: 設定.入力class })
      .setAttribute("list", 設定.ラベル候補ID);
    this.ラベル候補 = new 候補リストC(設定.ラベル候補ID);
    this.作成者 = textInput({
      placeholder: 設定.作成者案内, value: 設定.作成者初期値, class: 設定.入力class,
    });
  }
}
