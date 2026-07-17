import { div, img, LV2HtmlComponentBase, type DivC } from "sengen-ui";
import type { 添付DTO } from "../通信/札型";
import { 添付URLを組み立てる } from "../通信/添付URL";
import * as styles from "./style.css";

export class 問い添付表示 extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;

  constructor(添付: 添付DTO) {
    super();
    const URL = 添付URLを組み立てる(添付.保存名);
    if (/\.(png|jpe?g|gif|webp)$/i.test(添付.保存名)) {
      this._componentRoot = div().child(img({ src: URL, alt: 添付.ファイル名, class: styles.添付画像 }));
      return;
    }
    this._componentRoot = div({ text: `${添付.ファイル名} を読み込み中…`, class: styles.添付テキスト });
    void fetch(URL).then(async (response) => this._componentRoot.setTextContent(
      response.ok ? await response.text() : `${添付.ファイル名} の取得に失敗しました`,
    )).catch(() => this._componentRoot.setTextContent(`${添付.ファイル名} の取得に失敗しました`));
  }
}
