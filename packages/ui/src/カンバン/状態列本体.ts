import { span, DivC } from "sengen-ui";
import type { 札カード } from "./札カード";
import * as styles from "./style.css";

// 状態列のスクロール領域（LV1拡張）。ポーリング更新のたびに全件差し替える
// （AgentRoomのルーム一覧領域と同じ構成方針）
export class 状態列本体 extends DivC {
  constructor() {
    super({ class: styles.列本体 });
  }

  全件を差し替える(カード一覧: readonly 札カード[]): this {
    this.clearChildren().childIfs([
      {
        If: カード一覧.length === 0,
        True: () => span({ text: "札はありません", class: styles.列空表示 }),
      },
      カード一覧]);
    return this;
  }
}
