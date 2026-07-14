import { div, span, DivC, 配線ポート, type I配線可能 } from "sengen-ui";
import type { 札DTO } from "../通信/札型";
import { ラベルチップ } from "./ラベルチップ";
import { 種別バッジ } from "./種別バッジ";
import * as styles from "./style.css";

export interface I札カード配線 {
  on選択(): void;
}

function 担当者表示(担当者: string | null): string {
  return 担当者 === null ? "未割当" : 担当者;
}

// カンバン列に並ぶ1枚の札（LV1拡張）。一覧更新のたびに作り直されるため、
// 構築時のデータで完結する（AgentRoomのルーム項目Viewと同じ構成方針）
export class 札カード extends DivC implements I配線可能<I札カード配線> {
  private readonly _配線 = new 配線ポート<I札カード配線>("札カード");

  constructor(札: 札DTO) {
    super({ class: styles.カード });
    this.onClick(() => this._配線.先.on選択()).childIfs([
      div({ class: styles.カード上段 }).childs([
          new 種別バッジ(札.種別),
          span({ text: `#${札.id}`, class: styles.カードID })]),
      div({ text: 札.タイトル, class: styles.カードタイトル }),
      div({ text: 担当者表示(札.担当者), class: styles.カード担当者 }),
      {
        If: 札.ラベル一覧.length > 0,
        True: () =>
          div({ class: styles.カードラベル行 }).childs(
            札.ラベル一覧.map((ラベル) => new ラベルチップ(ラベル)),
          ),
      }]);
  }

  配線する(配線: I札カード配線): this {
    this._配線.配線する(配線);
    return this;
  }
}
