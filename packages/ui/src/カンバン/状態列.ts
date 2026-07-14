import { div, DivC } from "sengen-ui";
import type { 札カード } from "./札カード";
import { 状態列本体 } from "./状態列本体";
import * as styles from "./style.css";

// カンバンの1列（LV1拡張）。見出し（状態名）+ スクロール可能なカード一覧で構成する
export class 状態列 extends DivC {
  private readonly _本体 = new 状態列本体();

  constructor(readonly 状態値: string) {
    super({ class: styles.列 });
    this.childs([div({ text: 状態値, class: styles.列見出し }), this._本体]);
  }

  カード一覧を差し替える(カード一覧: readonly 札カード[]): void {
    this._本体.全件を差し替える(カード一覧);
  }
}
