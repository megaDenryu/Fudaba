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
import { 候補リストC } from "./候補リストC";
import { ラベル文字列を配列にする, ラベル配列を文字列にする } from "./ラベル入力パース";
import { 種別バッジ } from "./種別バッジ";
import { 詳細ID表示 } from "./詳細ID表示";
import { 保存完了ラベル } from "./保存完了ラベル";
import { 保存ボタン } from "./保存ボタン";
import { 札種別選択肢, 札状態選択肢 } from "./定数";
import { 詳細パネル開閉状態 } from "./詳細パネル状態";
import { 編集値に変更があるか } from "./詳細パネル変更検知";
import * as styles from "./style.css";

const 担当者候補リストID = "fudaba-詳細パネル-担当者候補";
const ラベル候補リストID = "fudaba-詳細パネル-ラベル候補";

export interface I詳細パネル配線 {
  on保存(id: number, 変更: 札更新入力): void;
  on閉じる(): void;
}

// 選択中の札の詳細表示・編集パネル（LV2素部品）。カンバンビューが1インスタンスだけ持ち、
// カード選択のたびに表示する(札)で内容を差し替える。ヘッダはタイトルを主役にし、
// 種別バッジとIDは脇のメタ情報として控えめに添える
export class 詳細パネル extends LV2HtmlComponentBase implements I配線可能<I詳細パネル配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I詳細パネル配線>("詳細パネル");
  private readonly _種別バッジ: 種別バッジ;
  private readonly _id表示: 詳細ID表示;
  private readonly _タイトル: TextInputC;
  private readonly _本文: TextAreaC;
  private readonly _種別選択: SelectC;
  private readonly _状態: SelectC;
  private readonly _担当者: TextInputC;
  private readonly _担当者候補 = new 候補リストC(担当者候補リストID);
  private readonly _ラベル: TextInputC;
  private readonly _ラベル候補 = new 候補リストC(ラベル候補リストID);
  private readonly _保存ボタン: 保存ボタン;
  private readonly _保存完了ラベル = new 保存完了ラベル();
  private _表示中の札: 札DTO | null = null;

  constructor() {
    super();
    this._種別バッジ = new 種別バッジ("");
    this._id表示 = new 詳細ID表示();
    this._タイトル = textInput({ class: styles.詳細タイトル入力 }).onInput(() =>
      this._変更を検査する(),
    );
    this._本文 = textarea({ rows: 6, class: styles.詳細本文入力 }).addTextAreaEventListener(
      "input",
      () => this._変更を検査する(),
    );
    this._種別選択 = select({
      options: 札種別選択肢.map((種別) => ({ value: 種別, text: 種別 })),
      class: styles.詳細状態セレクト,
    }).onSelectChange(() => this._種別変更を反映する());
    this._状態 = select({
      options: 札状態選択肢.map((状態) => ({ value: 状態, text: 状態 })),
      class: styles.詳細状態セレクト,
    }).onSelectChange(() => this._変更を検査する());
    this._担当者 = textInput({ placeholder: "未割当", class: styles.詳細担当者入力 })
      .setAttribute("list", 担当者候補リストID)
      .onInput(() => this._変更を検査する());
    this._ラベル = textInput({
      placeholder: "ラベル(カンマ区切り、空欄可)",
      class: styles.詳細ラベル入力欄,
    })
      .setAttribute("list", ラベル候補リストID)
      .onInput(() => this._変更を検査する());
    this._保存ボタン = new 保存ボタン();
    this._componentRoot = this._ルートを構築する(
      this._種別バッジ,
      this._id表示,
      this._タイトル,
      this._本文,
      this._種別選択,
      this._状態,
      this._担当者,
      this._担当者候補,
      this._ラベル,
      this._ラベル候補,
      this._保存ボタン,
      this._保存完了ラベル,
    );
  }

  配線する(配線: I詳細パネル配線): this {
    this._配線.配線する(配線);
    return this;
  }

  表示する(札: 札DTO): void {
    this._表示中の札 = 札;
    this._編集値を反映する(札);
    this._保存ボタン.隠す();
    this._保存完了ラベル.隠す();
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.開);
  }

  // 保存成功後に呼ぶ。パネルは開いたまま保存後の値へ差し替え、保存ボタンを隠して
  // 保存完了ラベルを表示する。閉じる操作は閉じるボタン（on閉じる配線）だけの責務とする
  保存完了を反映する(札: 札DTO): void {
    this._表示中の札 = 札;
    this._編集値を反映する(札);
    this._保存ボタン.隠す();
    this._保存完了ラベル.表示する();
  }

  閉じる(): void {
    this._表示中の札 = null;
    this._保存ボタン.隠す();
    this._保存完了ラベル.隠す();
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.閉);
  }

  担当者候補を更新する(候補一覧: readonly string[]): void {
    this._担当者候補.候補を設定する(候補一覧);
  }

  ラベル候補を更新する(候補一覧: readonly string[]): void {
    this._ラベル候補.候補を設定する(候補一覧);
  }

  private _編集値を反映する(札: 札DTO): void {
    this._種別バッジ.種別を設定する(札.種別);
    this._id表示.設定する(札.id);
    this._タイトル.setValue(札.タイトル);
    this._タイトル.setAttribute("title", 札.タイトル);
    this._本文.setValue(札.本文);
    this._種別選択.setValue(札.種別);
    this._状態.setValue(札.状態);
    this._担当者.setValue(札.担当者 ?? "");
    this._ラベル.setValue(ラベル配列を文字列にする(札.ラベル一覧));
  }

  private _ルートを構築する(
    種別バッジ: 種別バッジ,
    id表示: 詳細ID表示,
    タイトル: TextInputC,
    本文: TextAreaC,
    種別選択: SelectC,
    状態: SelectC,
    担当者: TextInputC,
    担当者候補: 候補リストC,
    ラベル: TextInputC,
    ラベル候補: 候補リストC,
    保存ボタン: 保存ボタン,
    保存完了ラベル: 保存完了ラベル,
  ): DivC {
    return (
      div({ class: styles.詳細パネル }).setAttribute(
        詳細パネル開閉状態.attribute,
        詳細パネル開閉状態.value.閉,
      ).childs([
          div({ class: styles.詳細ヘッダ }).childs([
              div({ class: styles.詳細ヘッダ本体 }).childs([
                  div({ class: styles.詳細メタ行 }).childs([種別バッジ, id表示]),
                  タイトル]),
              button({ text: "閉じる", class: styles.詳細閉じるボタン }).onClick(() =>
                this._配線.先.on閉じる(),
              )]),
          div({ text: "本文", class: styles.詳細ラベル }),
          本文,
          div({ class: styles.詳細フィールド単独 }).childs([
              span({ text: "種別", class: styles.詳細ラベル }),
              種別選択]),
          div({ class: styles.詳細行 }).childs([
              div({ class: styles.詳細フィールド }).childs([
                  span({ text: "状態", class: styles.詳細ラベル }),
                  状態]),
              div({ class: styles.詳細フィールド }).childs([
                  span({ text: "担当者", class: styles.詳細ラベル }),
                  担当者,
                  担当者候補])]),
          div({ class: styles.詳細フィールド単独 }).childs([
              span({ text: "ラベル", class: styles.詳細ラベル }),
              ラベル,
              ラベル候補]),
          div({ class: styles.詳細保存ボタン行 }).childs([
              保存ボタン.onClick(() => this._保存を発火する()),
              保存完了ラベル])])
    );
  }

  private _種別変更を反映する(): void {
    this._種別バッジ.種別を設定する(this._種別選択.getValue());
    this._変更を検査する();
  }

  private _変更を検査する(): void {
    if (this._表示中の札 === null) return;
    const 変更あり = 編集値に変更があるか(this._表示中の札, {
      種別: this._種別選択.getValue(),
      タイトル: this._タイトル.getValue(),
      本文: this._本文.getValue(),
      状態: this._状態.getValue(),
      担当者: this._担当者.getValue(),
      ラベル一覧: this._ラベル.getValue(),
    });
    if (変更あり) {
      this._保存ボタン.表示する();
      this._保存完了ラベル.隠す();
    } else {
      this._保存ボタン.隠す();
    }
  }

  private _保存を発火する(): void {
    if (this._表示中の札 === null) return;
    const 担当者 = this._担当者.getValue().trim();
    this._配線.先.on保存(this._表示中の札.id, {
      種別: this._種別選択.getValue(),
      タイトル: this._タイトル.getValue().trim(),
      本文: this._本文.getValue(),
      状態: this._状態.getValue(),
      担当者: 担当者.length === 0 ? null : 担当者,
      ラベル一覧: ラベル文字列を配列にする(this._ラベル.getValue()),
    });
  }
}
