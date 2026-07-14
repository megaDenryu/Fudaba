import {
  div,
  fileInput,
  span,
  LV2HtmlComponentBase,
  配線ポート,
  type DivC,
  type FileInputC,
  type I配線可能,
} from "sengen-ui";
import type { 添付DTO } from "../通信/札型";
import { 添付サムネイル } from "./添付サムネイル";
import * as styles from "./style.css";

export interface I添付一覧配線 {
  on追加(ファイル: File): void;
  on原寸表示(保存名: string): void;
  on削除(保存名: string): void;
}

// 詳細パネル・詳細シート共通の添付表示エリア（LV2素部品）。サムネイル並び+
// ファイル選択（モバイルではカメラ/ライブラリが開く）を提供する。PC向けの
// クリップボード貼り付けは本文入力欄（添付貼り付け対応本文入力）が別途担う
export class 添付一覧 extends LV2HtmlComponentBase implements I配線可能<I添付一覧配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I添付一覧配線>("添付一覧");
  private readonly _サムネイル領域: DivC;
  private readonly _ファイル選択: FileInputC;

  constructor() {
    super();
    this._サムネイル領域 = div({ class: styles.添付サムネイル領域 });
    this._ファイル選択 = fileInput({ accept: "image/*", class: styles.添付ファイル選択 }).onFileSelected(
      (file) => this._配線.先.on追加(file),
    );
    this._componentRoot = this._ルートを構築する(this._サムネイル領域, this._ファイル選択);
  }

  配線する(配線: I添付一覧配線): this {
    this._配線.配線する(配線);
    return this;
  }

  更新する(添付一覧: readonly 添付DTO[]): void {
    const サムネイル一覧 = 添付一覧.map((添付) =>
      new 添付サムネイル(添付).配線する({
        on原寸表示: () => this._配線.先.on原寸表示(添付.保存名),
        on削除: () => this._配線.先.on削除(添付.保存名),
      }),
    );
    this._サムネイル領域.clearChildren().childIfs([
      {
        If: サムネイル一覧.length === 0,
        True: () => span({ text: "添付なし", class: styles.添付なし表示 }),
      },
      サムネイル一覧]);
  }

  private _ルートを構築する(サムネイル領域: DivC, ファイル選択: FileInputC): DivC {
    return (
      div({ class: styles.添付エリア }).childs([
          div({ class: styles.添付見出し行 }).childs([
              span({ text: "添付", class: styles.詳細ラベル }),
              ファイル選択]),
          span({ text: "本文欄にフォーカスしてCtrl+Vでも追加できます", class: styles.添付ヒント }),
          サムネイル領域])
    );
  }
}
