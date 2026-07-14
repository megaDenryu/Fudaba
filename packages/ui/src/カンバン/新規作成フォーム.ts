import {
  button,
  div,
  select,
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
import type { 札作成入力 } from "../通信/札型";
import { 作成者名を読み込む, 作成者名を保存する } from "../作成者名記憶";
import { 候補リストC } from "./候補リストC";
import { 札種別選択肢 } from "./定数";
import { ラベル文字列を配列にする } from "./ラベル入力パース";
import * as styles from "./style.css";

const 担当者候補リストID = "fudaba-新規作成フォーム-担当者候補";
const ラベル候補リストID = "fudaba-新規作成フォーム-ラベル候補";

export interface I新規作成フォーム配線 {
  on作成(内容: 札作成入力): void;
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
  private readonly _本文: TextAreaC;
  private readonly _担当者: TextInputC;
  private readonly _担当者候補 = new 候補リストC(担当者候補リストID);
  private readonly _ラベル: TextInputC;
  private readonly _ラベル候補 = new 候補リストC(ラベル候補リストID);
  private readonly _作成者: TextInputC;

  constructor() {
    super();
    this._種別 = select({
      options: 札種別選択肢.map((種別, index) => ({
        value: 種別,
        text: 種別,
        selected: index === 0,
      })),
      class: styles.フォームセレクト,
    });
    this._タイトル = textInput({
      placeholder: "タイトル",
      class: styles.フォーム入力,
    }).onEnterKey(() => this._作成を発火する());
    this._本文 = textarea({
      placeholder: "本文（省略可）",
      rows: 2,
      class: styles.フォーム本文,
    });
    this._担当者 = textInput({
      placeholder: "担当者（省略可）",
      class: styles.フォーム担当者,
    }).setAttribute("list", 担当者候補リストID);
    this._ラベル = textInput({
      placeholder: "ラベル（カンマ区切り、省略可）",
      class: styles.フォーム担当者,
    }).setAttribute("list", ラベル候補リストID);
    this._作成者 = textInput({
      placeholder: "作成者",
      value: 作成者名を読み込む(),
      class: styles.フォーム担当者,
    });
    this._componentRoot = this._ルートを構築する(
      this._種別,
      this._タイトル,
      this._本文,
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
  }

  担当者候補を更新する(候補一覧: readonly string[]): void {
    this._担当者候補.候補を設定する(候補一覧);
  }

  ラベル候補を更新する(候補一覧: readonly string[]): void {
    this._ラベル候補.候補を設定する(候補一覧);
  }

  private _ルートを構築する(
    種別: SelectC,
    タイトル: TextInputC,
    本文: TextAreaC,
    担当者: TextInputC,
    担当者候補: 候補リストC,
    ラベル: TextInputC,
    ラベル候補: 候補リストC,
    作成者: TextInputC,
  ): DivC {
    return (
      div({ class: styles.新規フォーム }).childs([
          div({ class: styles.新規フォーム行 }).childs([
              種別,
              タイトル,
              担当者,
              担当者候補,
              ラベル,
              ラベル候補,
              作成者,
              button({ text: "札を作成", class: styles.フォームボタン }).onClick(() =>
                this._作成を発火する(),
              )]),
          本文])
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
      種別: this._種別.getValue(),
      タイトル,
      本文: this._本文.getValue(),
      担当者: 担当者.length === 0 ? undefined : 担当者,
      作成者,
      ラベル一覧: ラベル文字列を配列にする(this._ラベル.getValue()),
    });
  }
}
