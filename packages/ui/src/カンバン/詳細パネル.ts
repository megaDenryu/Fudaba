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
import type { 札DTO, 札更新入力 } from "../通信/札型";
import { 添付URLを組み立てる } from "../通信/添付URL";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 候補リストC } from "./候補リストC";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import { ラベル文字列を配列にする, ラベル配列を文字列にする } from "./ラベル入力パース";
import { 添付一覧 } from "./添付一覧";
import { 添付貼り付け対応本文入力 } from "./添付貼り付け対応本文入力";
import { 添付プレビュー } from "./添付プレビュー";
import { 担当解除ボタン } from "./担当解除ボタン";
import { 種別バッジ } from "./種別バッジ";
import { 詳細ID表示 } from "./詳細ID表示";
import { 保存完了ラベル } from "./保存完了ラベル";
import { 保存ボタン } from "./保存ボタン";
import { 札種別選択肢, 札状態選択肢 } from "./定数";
import { 詳細パネル開閉状態 } from "./詳細パネル状態";
import { 編集値に変更があるか } from "./詳細パネル変更検知";
import * as styles from "./style.css";
import { 札協働表示 } from "../札協働表示/札協働表示";

const 担当者候補リストID = "fudaba-詳細パネル-担当者候補";
const ラベル候補リストID = "fudaba-詳細パネル-ラベル候補";

export interface I詳細パネル配線 {
  on保存(id: number, 変更: 札更新入力): void;
  on閉じる(): void;
  on添付追加(id: number, ファイル: File): void;
  on添付削除(id: number, 保存名: string): void;
  on担当解除(id: number): void;
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
  private readonly _本文: 添付貼り付け対応本文入力;
  private readonly _種別選択: SelectC;
  private readonly _状態: SelectC;
  private readonly _担当者: TextInputC;
  private readonly _担当者候補 = new 候補リストC(担当者候補リストID);
  private readonly _担当解除ボタン: 担当解除ボタン;
  private readonly _ラベル: TextInputC;
  private readonly _ラベル候補 = new 候補リストC(ラベル候補リストID);
  private readonly _添付一覧 = new 添付一覧();
  private readonly _添付プレビュー = new 添付プレビュー();
  private readonly _保存ボタン: 保存ボタン;
  private readonly _保存完了ラベル = new 保存完了ラベル();
  private readonly _協働表示 = new 札協働表示();
  private _表示中の札: 札DTO | null = null;

  constructor() {
    super();
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    this._種別バッジ = new 種別バッジ("");
    this._id表示 = new 詳細ID表示();
    this._タイトル = textInput({ class: styles.詳細タイトル入力 }).onInput(() =>
      this._変更を検査する(),
    );
    this._本文 = new 添付貼り付け対応本文入力({ rows: 6, class: styles.詳細本文入力 })
      .addTextAreaEventListener("input", () => this._変更を検査する())
      .入力に合わせて高さを調整する()
      .on画像貼り付け((ファイル) => this._添付を追加する(ファイル))
      .on画像ドロップ((ファイル) => this._添付を追加する(ファイル))
      .on保存ショートカット(() => this._保存を発火する());
    this._種別選択 = select({
      options: 札種別選択肢.map((種別) => ({ value: 種別, text: 種別 })),
      class: styles.詳細状態セレクト,
    }).onSelectChange(() => this._種別変更を反映する());
    this._状態 = select({
      options: 札状態選択肢.map((状態) => ({ value: 状態, text: 状態 })),
      class: styles.詳細状態セレクト,
    }).onSelectChange(() => this._変更を検査する());
    this._担当者 = textInput({ placeholder: 文言.担当者プレースホルダー, class: styles.詳細担当者入力 })
      .setAttribute("list", 担当者候補リストID)
      .onInput(() => this._変更を検査する());
    this._担当解除ボタン = new 担当解除ボタン().onClick(() => this._担当を解除する());
    this._ラベル = textInput({
      placeholder: 文言.ラベルプレースホルダー,
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
      this._担当解除ボタン,
      this._ラベル,
      this._ラベル候補,
      this._添付一覧,
      this._添付プレビュー,
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
    void this._協働表示.表示する(札.id);
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
    this._添付プレビュー.閉じる();
    this._componentRoot.setAttribute(詳細パネル開閉状態.attribute, 詳細パネル開閉状態.value.閉);
  }

  担当者候補を更新する(候補一覧: readonly string[]): void {
    this._担当者候補.候補を設定する(候補一覧);
  }

  ラベル候補を更新する(候補一覧: readonly string[]): void {
    this._ラベル候補.候補を設定する(候補一覧);
  }

  // 添付の追加・削除後に呼ぶ。テキストフィールドの入力中の値には触れず、添付表示だけを
  // サーバー最新状態へ反映する（詳細パネル変更検知の比較対象はテキスト系フィールドのみで
  // 添付一覧を見ないため、_表示中の札の丸ごと差し替えは保存ボタンの表示制御に影響しない）
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
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    if (!window.confirm(文言.担当解除確認メッセージ)) return;
    this._配線.先.on担当解除(this._表示中の札.id);
  }

  private _編集値を反映する(札: 札DTO): void {
    this._種別バッジ.種別を設定する(札.種別);
    this._id表示.設定する(札.id);
    this._タイトル.setValue(札.タイトル);
    this._タイトル.setAttribute("title", 札.タイトル);
    this._本文.setValue(札.本文);
    this._添付一覧.更新する(札.添付一覧);
    this._種別選択.setValue(札.種別);
    this._状態.setValue(札.状態);
    this._担当者.setValue(札.担当者 ?? "");
    this._担当解除ボタン.担当状態を反映する(札.担当者);
    this._ラベル.setValue(ラベル配列を文字列にする(札.ラベル一覧));
  }

  private _ルートを構築する(
    種別バッジ: 種別バッジ,
    id表示: 詳細ID表示,
    タイトル: TextInputC,
    本文: 添付貼り付け対応本文入力,
    種別選択: SelectC,
    状態: SelectC,
    担当者: TextInputC,
    担当者候補: 候補リストC,
    担当解除ボタン: 担当解除ボタン,
    ラベル: TextInputC,
    ラベル候補: 候補リストC,
    添付一覧: 添付一覧,
    添付プレビュー: 添付プレビュー,
    保存ボタン: 保存ボタン,
    保存完了ラベル: 保存完了ラベル,
  ): DivC {
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    return (
      div({ class: styles.詳細パネル }).setAttribute(
        詳細パネル開閉状態.attribute,
        詳細パネル開閉状態.value.閉,
      ).childs([
          div({ class: styles.詳細ヘッダ }).childs([
              div({ class: styles.詳細ヘッダ本体 }).childs([
                  div({ class: styles.詳細メタ行 }).childs([種別バッジ, id表示]),
                  タイトル]),
              button({ text: 文言.閉じるボタン, class: styles.詳細閉じるボタン }).onClick(() =>
                this._配線.先.on閉じる(),
              )]),
          div({ text: 文言.本文ラベル, class: styles.詳細ラベル }),
          本文,
          div({ class: styles.詳細フィールド単独 }).childs([
              span({ text: 文言.種別ラベル, class: styles.詳細ラベル }),
              種別選択]),
          div({ class: styles.詳細行 }).childs([
              div({ class: styles.詳細フィールド }).childs([
                  span({ text: 文言.状態ラベル, class: styles.詳細ラベル }),
                  状態]),
              div({ class: styles.詳細フィールド }).childs([
                  span({ text: 文言.担当者ラベル, class: styles.詳細ラベル }),
                  担当者,
                  担当者候補,
                  担当解除ボタン])]),
          div({ class: styles.詳細フィールド単独 }).childs([
              span({ text: 文言.ラベルラベル, class: styles.詳細ラベル }),
              ラベル,
              ラベル候補]),
          添付一覧.配線する({
              on追加: (ファイル) => this._添付を追加する(ファイル),
              on原寸表示: (保存名) => this._添付プレビューを開く(保存名),
              on削除: (保存名) => this._添付を削除する(保存名),
          }),
          div({ class: styles.詳細保存ボタン行 }).childs([
              保存ボタン.onClick(() => this._保存を発火する()),
              保存完了ラベル]),
          this._協働表示,
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
