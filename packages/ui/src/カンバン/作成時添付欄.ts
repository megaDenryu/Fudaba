import { button, div, fileInput, span, LV2HtmlComponentBase, type DivC } from "sengen-ui";
import * as styles from "./style.css";

export class 作成時添付欄 extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private readonly _一覧 = div({ class: styles.作成時添付一覧 });
  private _ファイル一覧: File[] = [];

  public constructor() {
    super();
    const 選択 = fileInput({ accept: "image/*", class: styles.作成時添付選択 })
      .onFileSelected((file) => this.追加する(file));
    this._componentRoot = div({ class: styles.作成時添付欄 }).childs([
      div({ class: styles.作成時添付見出し }).childs([
        span({ text: "画像を添付", class: styles.詳細ラベル }), 選択,
      ]),
      span({ text: "ここへ画像をドロップ、または本文欄へ貼り付け", class: styles.添付ヒント }),
      this._一覧,
    ]);
    this._componentRoot.dom.element.addEventListener("dragover", (event) => event.preventDefault());
    this._componentRoot.dom.element.addEventListener("drop", (event) => this._ドロップを受け取る(event));
  }

  public 追加する(file: File): void {
    if (!file.type.startsWith("image/")) return;
    this._ファイル一覧 = [...this._ファイル一覧, file];
    this._再描画する();
  }
  public ファイル一覧(): readonly File[] { return [...this._ファイル一覧]; }
  public クリアする(): void { this._ファイル一覧 = []; this._再描画する(); }

  private _ドロップを受け取る(event: Event): void {
    if (!(event instanceof DragEvent)) return;
    const images = [...(event.dataTransfer?.files ?? [])].filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    event.preventDefault();
    images.forEach((file) => this.追加する(file));
  }
  private _再描画する(): void {
    this._一覧.clearChildren().childs(this._ファイル一覧.map((file, index) =>
      div({ class: styles.作成時添付項目 }).childs([
        span({ text: file.name }),
        button({ text: "×", class: styles.作成時添付削除 }).onClick(() => this._削除する(index)),
      ]),
    ));
  }
  private _削除する(index: number): void {
    this._ファイル一覧 = this._ファイル一覧.filter((_, i) => i !== index);
    this._再描画する();
  }
}
