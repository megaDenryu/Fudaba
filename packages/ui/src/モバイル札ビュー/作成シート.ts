import {
  button,
  div,
  select,
  span,
  textInput,
  LV2HtmlComponentBase,
  配線ポート,
  type DivC,
  type I配線可能,
  type SelectC,
  type TextInputC,
} from "sengen-ui";
import { 候補リストC } from "../カンバン/候補リストC";
import { 札種別選択肢 } from "../カンバン/定数";
import { ラベル文字列を配列にする } from "../カンバン/ラベル入力パース";
import { 作成時添付欄 } from "../カンバン/作成時添付欄";
import type { 札作成要求 } from "../カンバン/札作成要求";
import { 添付貼り付け対応本文入力 } from "../カンバン/添付貼り付け対応本文入力";
import { 作成者名を読み込む, 作成者名を保存する } from "../作成者名記憶";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 作成シート内容を取得する } from "./作成シート内容";
import { シート開閉状態 } from "./シート開閉状態";
import * as styles from "./style.css";

const 担当者候補リストID = "fudaba-モバイル作成シート-担当者候補";
const ラベル候補リストID = "fudaba-モバイル作成シート-ラベル候補";

export interface I作成シート配線 {
  on作成(要求: 札作成要求): void;
  on閉じる(): void;
}

// モバイル札ビューの「+」ボタンで開く新規作成ボトムシート（LV2素部品）。
// フィールド構成はカンバンの新規作成フォームと同じ（ラベルは詳細シート編集で後付けする方針、
// DESIGN.md「ラベル」節）だが、Sealed原則のため独立クラスとして実装する
export class 作成シート extends LV2HtmlComponentBase implements I配線可能<I作成シート配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I作成シート配線>("作成シート");
  private readonly _種別: SelectC;
  private readonly _タイトル: TextInputC;
  private readonly _本文: 添付貼り付け対応本文入力;
  private readonly _添付 = new 作成時添付欄(true);
  private readonly _担当者: TextInputC;
  private readonly _担当者候補 = new 候補リストC(担当者候補リストID);
  private readonly _ラベル: TextInputC;
  private readonly _ラベル候補 = new 候補リストC(ラベル候補リストID);
  private _ラベル候補一覧: readonly string[] = [];
  private readonly _作成者: TextInputC;
  private readonly _背景: DivC;
  private readonly _本体: DivC;

  constructor() {
    super();
    const 文言 = 作成シート内容を取得する(現在ロケールを取得する());
    this._種別 = select({
      options: 札種別選択肢.map((種別, index) => ({
        value: 種別,
        text: 種別,
        selected: index === 0,
      })),
      class: styles.シートセレクト,
    });
    this._タイトル = textInput({ placeholder: 文言.タイトルプレースホルダー, class: styles.シート入力 });
    this._本文 = new 添付貼り付け対応本文入力({
      placeholder: 文言.本文プレースホルダー,
      rows: 3,
      class: styles.シート本文入力,
    }).入力に合わせて高さを調整する()
      .on画像貼り付け((file) => this._添付.追加する(file))
      .on画像ドロップ((file) => this._添付.追加する(file))
      .on保存ショートカット(() => this._作成を発火する());
    this._担当者 = textInput({ placeholder: 文言.担当者プレースホルダー, class: styles.シート入力 })
      .setAttribute("list", 担当者候補リストID);
    this._ラベル = textInput({
      placeholder: 文言.ラベルプレースホルダー,
      class: styles.シート入力,
    }).setAttribute("list", ラベル候補リストID)
      .onInput(() => this._ラベル候補.複数ラベル候補を設定する(
        this._ラベル.getValue(), this._ラベル候補一覧,
      ));
    this._作成者 = textInput({
      placeholder: 文言.作成者プレースホルダー,
      value: 作成者名を読み込む(),
      class: styles.シート入力,
    });
    this._背景 = div({ class: styles.シート背景 })
      .setAttribute(シート開閉状態.attribute, シート開閉状態.value.閉)
      .onClick(() => this._配線.先.on閉じる());
    this._本体 = this._本体を構築する(
      this._種別,
      this._タイトル,
      this._本文,
      this._添付,
      this._担当者,
      this._担当者候補,
      this._ラベル,
      this._ラベル候補,
      this._作成者,
    ).setAttribute(シート開閉状態.attribute, シート開閉状態.value.閉);
    this._componentRoot = div().childs([this._背景, this._本体]);
  }

  配線する(配線: I作成シート配線): this {
    this._配線.配線する(配線);
    return this;
  }

  開く(): void {
    this._開閉状態を設定する(シート開閉状態.value.開);
  }

  閉じる(): void {
    this._開閉状態を設定する(シート開閉状態.value.閉);
  }

  クリアする(): void {
    this._タイトル.setValue("");
    this._本文.setValue("");
    this._担当者.setValue("");
    this._ラベル.setValue("");
    this._添付.クリアする();
  }

  担当者候補を更新する(候補一覧: readonly string[]): void {
    this._担当者候補.候補を設定する(候補一覧);
  }

  ラベル候補を更新する(候補一覧: readonly string[]): void {
    this._ラベル候補一覧 = [...候補一覧];
    this._ラベル候補.複数ラベル候補を設定する(this._ラベル.getValue(), 候補一覧);
  }

  private _開閉状態を設定する(値: string): void {
    this._背景.setAttribute(シート開閉状態.attribute, 値);
    this._本体.setAttribute(シート開閉状態.attribute, 値);
  }

  private _本体を構築する(
    種別: SelectC,
    タイトル: TextInputC,
    本文: 添付貼り付け対応本文入力,
    添付: 作成時添付欄,
    担当者: TextInputC,
    担当者候補: 候補リストC,
    ラベル: TextInputC,
    ラベル候補: 候補リストC,
    作成者: TextInputC,
  ): DivC {
    const 文言 = 作成シート内容を取得する(現在ロケールを取得する());
    return (
      div({ class: styles.シート本体 }).childs([
          div({ class: styles.シートヘッダ }).childs([
              span({ text: 文言.シートタイトル, class: styles.タイトル }),
              button({ text: 文言.閉じるボタン, class: styles.シート閉じるボタン }).onClick(() =>
                this._配線.先.on閉じる(),
              )]),
          span({ text: 文言.種別ラベル, class: styles.シートフィールドラベル }),
          種別,
          span({ text: 文言.タイトルラベル, class: styles.シートフィールドラベル }),
          タイトル,
          span({ text: 文言.本文ラベル, class: styles.シートフィールドラベル }),
          本文,
          添付,
          span({ text: 文言.担当者ラベル, class: styles.シートフィールドラベル }),
          担当者,
          担当者候補,
          span({ text: 文言.ラベルラベル, class: styles.シートフィールドラベル }),
          ラベル,
          ラベル候補,
          span({ text: 文言.作成者ラベル, class: styles.シートフィールドラベル }),
          作成者,
          button({ text: 文言.作成ボタン, class: styles.シート保存ボタン }).onClick(() =>
            this._作成を発火する(),
          )])
    );
  }

  private _作成を発火する(): void {
    const タイトル = this._タイトル.getValue().trim();
    if (タイトル.length === 0) return;
    const 作成者 = this._作成者.getValue().trim();
    if (作成者.length === 0) return;
    作成者名を保存する(作成者);
    const 担当者 = this._担当者.getValue().trim();
    this._配線.先.on作成({
      内容: {
        種別: this._種別.getValue(), タイトル, 本文: this._本文.getValue(),
        担当者: 担当者.length === 0 ? undefined : 担当者, 作成者,
        ラベル一覧: ラベル文字列を配列にする(this._ラベル.getValue()),
      },
      添付ファイル一覧: this._添付.ファイル一覧(),
    });
  }
}
