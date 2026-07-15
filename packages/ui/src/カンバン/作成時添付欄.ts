import { button, div, fileInput, icon, span, LV2HtmlComponentBase, type DivC } from "sengen-ui";
import * as styles from "./style.css";

export class 作成時添付欄 extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private readonly _一覧 = div({ class: styles.作成時添付一覧 });
  private _ファイル一覧: File[] = [];

  public constructor() {
    super();
    const 選択 = fileInput({ accept: "image/*", class: styles.作成時添付選択 })
      .setStyleCSS({ display: "none" })
      .onFileSelected((file) => this.追加する(file));
    const 選択ボタン = button({ class: styles.作成時添付選択ボタン })
      .setAttribute("title", "画像ファイルを添付")
      .child(icon({
        size: 18,
        color: "currentColor",
        paths: ["M4 4h16v16H4z", "M4 16l4-4 3 3 3-4 6 5", "M8.5 8.5h.01"],
      }))
      .onClick(() => 選択.dom.element.click());
    this._componentRoot = div({ class: styles.作成時添付欄 }).childs([選択ボタン, 選択, this._一覧]);
  }

  public 追加する(file: File): void {
    if (!file.type.startsWith("image/")) return;
    this._ファイル一覧 = [...this._ファイル一覧, file];
    this._再描画する();
  }
  public ファイル一覧(): readonly File[] { return [...this._ファイル一覧]; }
  public クリアする(): void { this._ファイル一覧 = []; this._再描画する(); }

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
