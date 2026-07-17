import { button, checkbox, div, span, textInput, LV2HtmlComponentBase, type DivC } from "sengen-ui";
import type { チェック項目DTO } from "../通信/札型";
import * as styles from "./チェックリスト編集.css";

export class チェックリスト編集 extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private _項目一覧: チェック項目DTO[] = [];
  private _変更時: () => void = () => {};

  constructor() {
    super();
    this._componentRoot = div({ class: styles.ルート });
    this._描画する();
  }

  変更時(処理: () => void): this {
    this._変更時 = 処理;
    return this;
  }

  設定する(項目一覧: readonly チェック項目DTO[]): void {
    this._項目一覧 = 項目一覧.map((項目) => ({ ...項目 }));
    this._描画する();
  }

  取得する(): readonly チェック項目DTO[] {
    return this._項目一覧.map((項目) => ({ ...項目 }));
  }

  private _描画する(): void {
    const 完了数 = this._項目一覧.filter((項目) => 項目.完了).length;
    const 見出し = this._項目一覧.length === 0
      ? "チェック項目"
      : `チェック項目 ${完了数}/${this._項目一覧.length}`;
    const 分解案内 = this._項目一覧.length >= 5
      ? span({ text: "項目が多いため、独立した子札への分解を推奨します", class: styles.分解案内 })
      : null;
    this._componentRoot.clearChildren().childs([
      div({ class: styles.ヘッダ }).childs([
        span({ text: 見出し, class: styles.見出し }),
        button({ text: "項目を追加", class: styles.追加ボタン }).onClick(() => this._追加する()),
      ]),
      ...(分解案内 === null ? [] : [分解案内]),
      div({ class: styles.一覧 }).childs(this._項目一覧.map((項目) => this._項目行を作る(項目))),
    ]);
  }

  private _項目行を作る(項目: チェック項目DTO): DivC {
    const 完了入力 = checkbox({ checked: 項目.完了, class: styles.完了入力 })
      .onCheckChange((完了) => this._更新する(項目.id, { 完了 }));
    const 本文入力 = textInput({ value: 項目.本文, class: styles.本文入力 })
      .onInput(() => this._更新する(項目.id, { 本文: 本文入力.getValue() }, false));
    return div({ class: styles.項目行 }).childs([
      完了入力,
      本文入力,
      button({ text: "削除", class: styles.削除ボタン }).onClick(() => this._削除する(項目.id)),
    ]);
  }

  private _追加する(): void {
    this._項目一覧.push({ id: globalThis.crypto.randomUUID(), 本文: "新しい項目", 完了: false });
    this._描画する();
    this._変更時();
  }

  private _削除する(id: string): void {
    this._項目一覧 = this._項目一覧.filter((項目) => 項目.id !== id);
    this._描画する();
    this._変更時();
  }

  private _更新する(
    id: string,
    変更: Partial<Pick<チェック項目DTO, "本文" | "完了">>,
    再描画する = true,
  ): void {
    this._項目一覧 = this._項目一覧.map((項目) => 項目.id === id ? { ...項目, ...変更 } : 項目);
    if (再描画する) this._描画する();
    this._変更時();
  }
}
