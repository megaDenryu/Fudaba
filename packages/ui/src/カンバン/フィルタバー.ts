import { div, span, LV2HtmlComponentBase, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { フィルタチップ行 } from "./フィルタチップ行";
import { フィルタバー内容を取得する } from "./フィルタバー内容";
import type { カンバンフィルタ状態 } from "./フィルタ状態";
import { 札種別選択肢 } from "./定数";
import * as styles from "./style.css";

export interface Iフィルタバー配線 {
  on種別選択(種別: string): void;
  on担当者選択(担当者: string): void;
  onラベル選択(ラベル: string): void;
}

// カンバン上部のフィルタバー(LV2素部品)。種別・担当者・ラベルの3行をクリックで
// 絞り込む(DESIGN.md「ラベル」節: 種別・担当者と合成)。状態は列そのものが表現するため持たない
export class フィルタバー extends LV2HtmlComponentBase implements I配線可能<Iフィルタバー配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<Iフィルタバー配線>("フィルタバー");
  private readonly _種別行: フィルタチップ行;
  private readonly _担当者行: フィルタチップ行;
  private readonly _ラベル行: フィルタチップ行;

  constructor() {
    super();
    this._種別行 = new フィルタチップ行().配線する({
      on選択: (値) => this._配線.先.on種別選択(値),
    });
    this._担当者行 = new フィルタチップ行().配線する({
      on選択: (値) => this._配線.先.on担当者選択(値),
    });
    this._ラベル行 = new フィルタチップ行().配線する({
      on選択: (値) => this._配線.先.onラベル選択(値),
    });
    this._種別行.候補一覧を更新する(札種別選択肢);
    this._componentRoot = this._ルートを構築する(this._種別行, this._担当者行, this._ラベル行);
  }

  配線する(配線: Iフィルタバー配線): this {
    this._配線.配線する(配線);
    return this;
  }

  担当者候補一覧を更新する(候補一覧: readonly string[]): void {
    this._担当者行.候補一覧を更新する(候補一覧);
  }

  ラベル候補一覧を更新する(候補一覧: readonly string[]): void {
    this._ラベル行.候補一覧を更新する(候補一覧);
  }

  選択状態を反映する(フィルタ: カンバンフィルタ状態): void {
    this._種別行.選択状態を反映する((値) => 値 === フィルタ.種別);
    this._担当者行.選択状態を反映する((値) => 値 === フィルタ.担当者);
    this._ラベル行.選択状態を反映する((値) => フィルタ.ラベル一覧.includes(値));
  }

  private _ルートを構築する(
    種別行: フィルタチップ行,
    担当者行: フィルタチップ行,
    ラベル行: フィルタチップ行,
  ): DivC {
    const 文言 = フィルタバー内容を取得する(現在ロケールを取得する());
    return (
      div({ class: styles.フィルタバー }).childs([
          div({ class: styles.フィルタセクション }).childs([
              span({ text: 文言.種別ラベル, class: styles.フィルタラベル }),
              種別行]),
          div({ class: styles.フィルタセクション }).childs([
              span({ text: 文言.担当者ラベル, class: styles.フィルタラベル }),
              担当者行]),
          div({ class: styles.フィルタセクション }).childs([
              span({ text: 文言.ラベルラベル, class: styles.フィルタラベル }),
              ラベル行])])
    );
  }
}
