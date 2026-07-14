import {
  button,
  div,
  img,
  LV2HtmlComponentBase,
  配線ポート,
  type DivC,
  type I配線可能,
} from "sengen-ui";
import { 添付URLを組み立てる } from "../通信/添付URL";
import type { 添付DTO } from "../通信/札型";
import * as styles from "./style.css";

export interface I添付サムネイル配線 {
  on原寸表示(): void;
  on削除(): void;
}

// 添付一覧に並ぶ1件分のサムネイル（LV2素部品）。画像クリックで原寸表示、
// 右上の×ボタンで削除を要求する（どちらもネットワーク処理は親に委ねる）
export class 添付サムネイル
  extends LV2HtmlComponentBase
  implements I配線可能<I添付サムネイル配線>
{
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I添付サムネイル配線>("添付サムネイル");

  constructor(private readonly _添付: 添付DTO) {
    super();
    this._componentRoot = this._ルートを構築する();
  }

  配線する(配線: I添付サムネイル配線): this {
    this._配線.配線する(配線);
    return this;
  }

  private _ルートを構築する(): DivC {
    return (
      div({ class: styles.添付サムネイル }).childs([
          img({
            src: 添付URLを組み立てる(this._添付.保存名),
            alt: this._添付.ファイル名,
            class: styles.添付サムネイル画像,
          }).onClick(() => this._配線.先.on原寸表示()),
          button({ text: "×", class: styles.添付削除ボタン }).onClick((event) => {
            event.stopPropagation();
            this._配線.先.on削除();
          })])
    );
  }
}
