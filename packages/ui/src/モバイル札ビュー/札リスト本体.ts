import { span, DivC } from "sengen-ui";
import type { 札リストカード } from "./札リストカード";
import * as styles from "./style.css";

// モバイル札ビューの縦1列スクロール領域（LV1拡張）。ポーリング更新のたびに全件差し替える
// （カンバンの状態列本体と同じ構成方針）
export class 札リスト本体 extends DivC {
  constructor() {
    super({ class: styles.リスト領域 });
  }

  全件を差し替える(カード一覧: readonly 札リストカード[]): this {
    this.clearChildren().childIfs([
      {
        If: カード一覧.length === 0,
        True: () => span({ text: "札はありません", class: styles.リスト空表示 }),
      },
      カード一覧]);
    return this;
  }
}
