import {
  button,
  div,
  select,
  span,
  textInput,
  textarea,
  LV2HtmlComponentBase,
  配線ポート,
  type DivC,
  type I配線可能,
  type SelectC,
  type TextAreaC,
  type TextInputC,
} from "sengen-ui";
import type { 札DTO, 札更新入力 } from "../通信/札型";
import { 札状態選択肢 } from "./定数";
import { 詳細パネル開閉状態 } from "./詳細パネル状態";
import * as styles from "./style.css";

export interface I詳細パネル配線 {
  on保存(id: number, 変更: 札更新入力): void;
  on閉じる(): void;
}

// 選択中の札の詳細表示・編集パネル（LV2素部品）。カンバンビューが1インスタンスだけ持ち、
// カード選択のたびに表示する(札)で内容を差し替える
export class 詳細パネル extends LV2HtmlComponentBase implements I配線可能<I詳細パネル配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I詳細パネル配線>("詳細パネル");
  private readonly _見出し: DivC;
  private readonly _タイトル: TextInputC;
  private readonly _本文: TextAreaC;
  private readonly _状態: SelectC;
  private readonly _担当者: TextInputC;
  private _表示中の札id: number | null = null;

  constructor() {
    super();
    this._見出し = div({ class: styles.詳細見出し });
    this._タイトル = textInput({ class: styles.詳細タイトル入力 });
    this._本文 = textarea({ rows: 6, class: styles.詳細本文入力 });
    this._状態 = select({
      options: 札状態選択肢.map((状態) => ({ value: 状態, text: 状態 })),
      class: styles.詳細状態セレクト,
    });
    this._担当者 = textInput({ placeholder: "未割当", class: styles.詳細担当者入力 });
    this._componentRoot = this._ルートを構築する(
      this._見出し,
      this._タイトル,
      this._本文,
      this._状態,
      this._担当者,
    );
  }

  配線する(配線: I詳細パネル配線): this {
    this._配線.配線する(配線);
    return this;
  }

  表示する(札: 札DTO): void {
    this._表示中の札id = 札.id;
    this._見出し.setTextContent(`#${札.id} ${札.種別}`);
    this._タイトル.setValue(札.タイトル);
    this._本文.setValue(札.本文);
    this._状態.setValue(札.状態);
    this._担当者.setValue(札.担当者 ?? "");
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.開);
  }

  閉じる(): void {
    this._表示中の札id = null;
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.閉);
  }

  private _ルートを構築する(
    見出し: DivC,
    タイトル: TextInputC,
    本文: TextAreaC,
    状態: SelectC,
    担当者: TextInputC,
  ): DivC {
    return (
      div({ class: styles.詳細パネル }).setAttribute(
        詳細パネル開閉状態.attribute,
        詳細パネル開閉状態.value.閉,
      ).childs([
          div({ class: styles.詳細ヘッダ }).childs([
              見出し,
              button({ text: "閉じる", class: styles.詳細閉じるボタン }).onClick(() =>
                this._配線.先.on閉じる(),
              )]),
          div({ text: "タイトル", class: styles.詳細ラベル }),
          タイトル,
          div({ text: "本文", class: styles.詳細ラベル }),
          本文,
          div({ class: styles.詳細行 }).childs([
              div({ class: styles.詳細フィールド }).childs([
                  span({ text: "状態", class: styles.詳細ラベル }),
                  状態]),
              div({ class: styles.詳細フィールド }).childs([
                  span({ text: "担当者", class: styles.詳細ラベル }),
                  担当者])]),
          button({ text: "保存", class: styles.詳細保存ボタン }).onClick(() =>
            this._保存を発火する(),
          )])
    );
  }

  private _保存を発火する(): void {
    if (this._表示中の札id === null) return;
    const 担当者 = this._担当者.getValue().trim();
    this._配線.先.on保存(this._表示中の札id, {
      タイトル: this._タイトル.getValue().trim(),
      本文: this._本文.getValue(),
      状態: this._状態.getValue(),
      担当者: 担当者.length === 0 ? null : 担当者,
    });
  }
}
