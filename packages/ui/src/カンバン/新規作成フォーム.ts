import {
  button,
  div,
  select,
  textInput,
  LV2HtmlComponentBase,
  配線ポート,
  type DivC,
  type I配線可能,
  type SelectC,
  type TextInputC,
} from "sengen-ui";
import { 作成者名を読み込む, 作成者名を保存する } from "../作成者名記憶";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 候補リストC } from "./候補リストC";
import { 札種別選択肢 } from "./定数";
import { 新規作成フォーム内容を取得する } from "./新規作成フォーム内容";
import { ラベル文字列を配列にする } from "./ラベル入力パース";
import { 作成時添付欄 } from "./作成時添付欄";
import type { 札作成要求 } from "./札作成要求";
import { 添付貼り付け対応本文入力 } from "./添付貼り付け対応本文入力";
import * as styles from "./style.css";

const 担当者候補リストID = "fudaba-新規作成フォーム-担当者候補";
const ラベル候補リストID = "fudaba-新規作成フォーム-ラベル候補";

export interface I新規作成フォーム配線 {
  on作成(要求: 札作成要求): void;
}

// 新規札の作成フォーム（LV2素部品）。作成そのもの（API呼び出し）は配線先（カンバンビュー
// サービス）が担う。フォームは入力の収集とクリアだけに責務を絞る
export class 新規作成フォーム
  extends LV2HtmlComponentBase
  implements I配線可能<I新規作成フォーム配線>
{
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I新規作成フォーム配線>("新規作成フォーム");
  private readonly _種別: SelectC;
  private readonly _タイトル: TextInputC;
  private readonly _本文: 添付貼り付け対応本文入力;
  private readonly _添付 = new 作成時添付欄();
  private readonly _担当者: TextInputC;
  private readonly _担当者候補 = new 候補リストC(担当者候補リストID);
  private readonly _ラベル: TextInputC;
  private readonly _ラベル候補 = new 候補リストC(ラベル候補リストID);
  private _ラベル候補一覧: readonly string[] = [];
  private readonly _作成者: TextInputC;

  constructor() {
    super();
    const 文言 = 新規作成フォーム内容を取得する(現在ロケールを取得する());
    this._種別 = select({
      options: 札種別選択肢.map((種別, index) => ({
        value: 種別,
        text: 種別,
        selected: index === 0,
      })),
      class: styles.フォームセレクト,
    });
    this._タイトル = textInput({
      placeholder: 文言.タイトルプレースホルダー,
      class: styles.フォーム入力,
    }).onEnterKey(() => this._作成を発火する());
    this._本文 = new 添付貼り付け対応本文入力({
      placeholder: 文言.本文プレースホルダー,
      rows: 2,
      class: styles.フォーム本文,
    }).入力に合わせて高さを調整する()
      .on画像貼り付け((file) => this._添付.追加する(file))
      .on画像ドロップ((file) => this._添付.追加する(file))
      .on保存ショートカット(() => this._作成を発火する());
    this._担当者 = textInput({
      placeholder: 文言.担当者プレースホルダー,
      class: styles.フォーム担当者,
    }).setAttribute("list", 担当者候補リストID);
    this._ラベル = textInput({
      placeholder: 文言.ラベルプレースホルダー,
      class: styles.フォーム担当者,
    }).setAttribute("list", ラベル候補リストID)
      .onInput(() => this._ラベル候補.複数ラベル候補を設定する(
        this._ラベル.getValue(), this._ラベル候補一覧,
      ));
    this._作成者 = textInput({
      placeholder: 文言.作成者プレースホルダー,
      value: 作成者名を読み込む(),
      class: styles.フォーム担当者,
    });
    this._componentRoot = this._ルートを構築する(
      this._種別,
      this._タイトル,
      this._本文,
      this._添付,
      this._担当者,
      this._担当者候補,
      this._ラベル,
      this._ラベル候補,
      this._作成者,
    );
  }

  配線する(配線: I新規作成フォーム配線): this {
    this._配線.配線する(配線);
    return this;
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

  private _ルートを構築する(
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
    const 文言 = 新規作成フォーム内容を取得する(現在ロケールを取得する());
    return (
      div({ class: styles.新規フォーム }).childs([
          div({ class: styles.新規フォーム行 }).childs([
              種別,
              タイトル,
              担当者,
              担当者候補,
              ラベル,
              ラベル候補,
              作成者]),
          div({ class: styles.作成エディタ }).childs([
            div({ class: styles.フォーム本文領域 }).childs([本文, 添付]),
            button({ text: 文言.作成ボタン, class: styles.フォームボタン }).onClick(() =>
              this._作成を発火する(),
            ),
          ])])
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
