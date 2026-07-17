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
import { 添付一覧 } from "../カンバン/添付一覧";
import { 添付貼り付け対応本文入力 } from "../カンバン/添付貼り付け対応本文入力";
import { 添付プレビュー } from "../カンバン/添付プレビュー";
import { 札種別選択肢, 札状態選択肢 } from "../カンバン/定数";
import { 詳細ID表示 } from "../カンバン/詳細ID表示";
import { 編集値に変更があるか } from "../カンバン/詳細パネル変更検知";
import { ラベル文字列を配列にする, ラベル配列を文字列にする } from "../カンバン/ラベル入力パース";
import { 種別バッジ } from "../カンバン/種別バッジ";
import type { 札DTO, 札更新入力 } from "../通信/札型";
import { 添付URLを組み立てる } from "../通信/添付URL";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { シート開閉状態 } from "./シート開閉状態";
import { 詳細シート内容を取得する } from "./詳細シート内容";
import { シート担当解除ボタン } from "./シート担当解除ボタン";
import { シート保存完了ラベル } from "./シート保存完了ラベル";
import { シート保存ボタン } from "./シート保存ボタン";
import * as styles from "./style.css";

const 担当者候補リストID = "fudaba-モバイル詳細シート-担当者候補";
const ラベル候補リストID = "fudaba-モバイル詳細シート-ラベル候補";

export interface I詳細シート配線 {
  on保存(id: number, 変更: 札更新入力): void;
  on閉じる(): void;
  on添付追加(id: number, ファイル: File): void;
  on添付削除(id: number, 保存名: string): void;
  on担当解除(id: number): void;
}

// モバイル札ビューのタップで開く詳細・編集ボトムシート（LV2素部品）。カンバンの
// 詳細パネルとフィールド構成は同じだが、Sealed原則（LV2継承禁止）のため独立クラスとして
// 実装し、レイアウトのみモバイル向け（下部固定シート）にする
export class 詳細シート extends LV2HtmlComponentBase implements I配線可能<I詳細シート配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I詳細シート配線>("詳細シート");
  private readonly _種別バッジ: 種別バッジ;
  private readonly _id表示: 詳細ID表示;
  private readonly _タイトル: TextInputC;
  private readonly _本文: 添付貼り付け対応本文入力;
  private readonly _種別選択: SelectC;
  private readonly _状態: SelectC;
  private readonly _担当者: TextInputC;
  private readonly _担当者候補 = new 候補リストC(担当者候補リストID);
  private readonly _担当解除ボタン: シート担当解除ボタン;
  private readonly _ラベル: TextInputC;
  private readonly _ラベル候補 = new 候補リストC(ラベル候補リストID);
  private _ラベル候補一覧: readonly string[] = [];
  private readonly _添付一覧 = new 添付一覧();
  private readonly _添付プレビュー = new 添付プレビュー();
  private readonly _保存ボタン: シート保存ボタン;
  private readonly _保存完了ラベル = new シート保存完了ラベル();
  private readonly _背景: DivC;
  private readonly _本体: DivC;
  private _表示中の札: 札DTO | null = null;

  constructor() {
    super();
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    this._種別バッジ = new 種別バッジ("");
    this._id表示 = new 詳細ID表示();
    this._タイトル = textInput({ class: styles.シート入力 }).onInput(() =>
      this._変更を検査する(),
    );
    this._本文 = new 添付貼り付け対応本文入力({ rows: 5, class: styles.シート本文入力 })
      .addTextAreaEventListener("input", () => this._変更を検査する())
      .入力に合わせて高さを調整する()
      .on画像貼り付け((ファイル) => this._添付を追加する(ファイル))
      .on画像ドロップ((ファイル) => this._添付を追加する(ファイル))
      .on保存ショートカット(() => this._保存を発火する());
    this._種別選択 = select({
      options: 札種別選択肢.map((種別) => ({ value: 種別, text: 種別 })),
      class: styles.シートセレクト,
    }).onSelectChange(() => this._種別変更を反映する());
    this._状態 = select({
      options: 札状態選択肢.map((状態) => ({ value: 状態, text: 状態 })),
      class: styles.シートセレクト,
    }).onSelectChange(() => this._変更を検査する());
    this._担当者 = textInput({ placeholder: 文言.担当者プレースホルダー, class: styles.シート入力 })
      .setAttribute("list", 担当者候補リストID)
      .onInput(() => this._変更を検査する());
    this._担当解除ボタン = new シート担当解除ボタン().onClick(() => this._担当を解除する());
    this._ラベル = textInput({
      placeholder: 文言.ラベルプレースホルダー,
      class: styles.シート入力,
    })
      .setAttribute("list", ラベル候補リストID)
      .onInput(() => {
        this._ラベル候補.複数ラベル候補を設定する(
          this._ラベル.getValue(), this._ラベル候補一覧,
        );
        this._変更を検査する();
      });
    this._保存ボタン = new シート保存ボタン();
    this._背景 = div({ class: styles.シート背景 })
      .setAttribute(シート開閉状態.attribute, シート開閉状態.value.閉)
      .onClick(() => this._配線.先.on閉じる());
    this._本体 = this._本体を構築する(
      this._種別バッジ,
      this._id表示,
      this._タイトル,
      this._本文,
      this._種別選択,
      this._状態,
      this._担当者,
      this._担当者候補,
      this._担当解除ボタン,
      this._ラベル,
      this._ラベル候補,
      this._添付一覧,
      this._添付プレビュー,
      this._保存ボタン,
      this._保存完了ラベル,
    ).setAttribute(シート開閉状態.attribute, シート開閉状態.value.閉);
    this._componentRoot = div().childs([this._背景, this._本体]);
  }

  配線する(配線: I詳細シート配線): this {
    this._配線.配線する(配線);
    return this;
  }

  表示する(札: 札DTO): void {
    this._表示中の札 = 札;
    this._編集値を反映する(札);
    this._保存ボタン.隠す();
    this._保存完了ラベル.隠す();
    this._開閉状態を設定する(シート開閉状態.value.開);
  }

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
    this._添付プレビュー.閉じる();
    this._開閉状態を設定する(シート開閉状態.value.閉);
  }

  担当者候補を更新する(候補一覧: readonly string[]): void {
    this._担当者候補.候補を設定する(候補一覧);
  }

  ラベル候補を更新する(候補一覧: readonly string[]): void {
    this._ラベル候補一覧 = [...候補一覧];
    this._ラベル候補.複数ラベル候補を設定する(this._ラベル.getValue(), 候補一覧);
  }

  添付一覧を反映する(札: 札DTO): void {
    this._表示中の札 = 札;
    this._添付一覧.更新する(札.添付一覧);
  }

  private _添付を追加する(ファイル: File): void {
    if (this._表示中の札 === null) return;
    this._配線.先.on添付追加(this._表示中の札.id, ファイル);
  }

  private _添付を削除する(保存名: string): void {
    if (this._表示中の札 === null) return;
    this._配線.先.on添付削除(this._表示中の札.id, 保存名);
  }

  private _添付プレビューを開く(保存名: string): void {
    if (this._表示中の札 === null) return;
    const 対象 = this._表示中の札.添付一覧.find((添付) => 添付.保存名 === 保存名);
    if (対象 === undefined) return;
    this._添付プレビュー.表示する(添付URLを組み立てる(保存名), 対象.ファイル名);
  }

  private _担当を解除する(): void {
    if (this._表示中の札 === null) return;
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    if (!window.confirm(文言.担当解除確認メッセージ)) return;
    this._配線.先.on担当解除(this._表示中の札.id);
  }

  private _開閉状態を設定する(値: string): void {
    this._背景.setAttribute(シート開閉状態.attribute, 値);
    this._本体.setAttribute(シート開閉状態.attribute, 値);
  }

  private _編集値を反映する(札: 札DTO): void {
    this._種別バッジ.種別を設定する(札.種別);
    this._id表示.設定する(札.id);
    this._タイトル.setValue(札.タイトル);
    this._本文.setValue(札.本文);
    this._添付一覧.更新する(札.添付一覧);
    this._種別選択.setValue(札.種別);
    this._状態.setValue(札.状態);
    this._担当者.setValue(札.担当者 ?? "");
    this._担当解除ボタン.担当状態を反映する(札.担当者);
    this._ラベル.setValue(ラベル配列を文字列にする(札.ラベル一覧));
    this._ラベル候補.複数ラベル候補を設定する(
      this._ラベル.getValue(), this._ラベル候補一覧,
    );
  }

  private _本体を構築する(
    種別バッジ: 種別バッジ,
    id表示: 詳細ID表示,
    タイトル: TextInputC,
    本文: 添付貼り付け対応本文入力,
    種別選択: SelectC,
    状態: SelectC,
    担当者: TextInputC,
    担当者候補: 候補リストC,
    担当解除ボタン: シート担当解除ボタン,
    ラベル: TextInputC,
    ラベル候補: 候補リストC,
    添付一覧: 添付一覧,
    添付プレビュー: 添付プレビュー,
    保存ボタン: シート保存ボタン,
    保存完了ラベル: シート保存完了ラベル,
  ): DivC {
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    return (
      div({ class: styles.シート本体 }).childs([
          div({ class: styles.シートヘッダ }).childs([
              div({ class: styles.シートヘッダ本体 }).childs([
                  div({ class: styles.シートメタ行 }).childs([種別バッジ, id表示]),
                  タイトル]),
              button({ text: 文言.閉じるボタン, class: styles.シート閉じるボタン }).onClick(() =>
                this._配線.先.on閉じる(),
              )]),
          span({ text: 文言.本文ラベル, class: styles.シートフィールドラベル }),
          本文,
          span({ text: 文言.種別ラベル, class: styles.シートフィールドラベル }),
          種別選択,
          span({ text: 文言.状態ラベル, class: styles.シートフィールドラベル }),
          状態,
          span({ text: 文言.担当者ラベル, class: styles.シートフィールドラベル }),
          担当者,
          担当者候補,
          担当解除ボタン,
          span({ text: 文言.ラベルラベル, class: styles.シートフィールドラベル }),
          ラベル,
          ラベル候補,
          添付一覧.配線する({
              on追加: (ファイル) => this._添付を追加する(ファイル),
              on原寸表示: (保存名) => this._添付プレビューを開く(保存名),
              on削除: (保存名) => this._添付を削除する(保存名),
          }),
          div({ class: styles.シート保存ボタン行 }).childs([
              保存ボタン.onClick(() => this._保存を発火する()),
              保存完了ラベル]),
          添付プレビュー.配線する({ on閉じる: () => 添付プレビュー.閉じる() })])
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
