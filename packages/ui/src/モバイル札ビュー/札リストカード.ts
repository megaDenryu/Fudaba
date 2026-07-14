import { div, span, DivC, 配線ポート, type I配線可能 } from "sengen-ui";
import { ラベルチップ } from "../カンバン/ラベルチップ";
import { 種別バッジ } from "../カンバン/種別バッジ";
import type { 札DTO } from "../通信/札型";
import * as styles from "./style.css";

export interface I札リストカード配線 {
  on選択(): void;
}

function 担当者表示(担当者: string | null): string {
  return 担当者 === null ? "未割当" : 担当者;
}

// モバイル札ビューの縦1列リストに並ぶ1行（LV1拡張）。タップで詳細ボトムシートを開く
export class 札リストカード extends DivC implements I配線可能<I札リストカード配線> {
  private readonly _配線 = new 配線ポート<I札リストカード配線>("札リストカード");

  constructor(札: 札DTO) {
    super({ class: styles.一覧カード });
    this.onClick(() => this._配線.先.on選択()).childIfs([
      div({ class: styles.一覧カード上段 }).childs([
          new 種別バッジ(札.種別),
          span({ text: `#${札.id}`, class: styles.一覧カードID })]),
      div({ text: 札.タイトル, class: styles.一覧カードタイトル }),
      div({ class: styles.一覧カード下段 }).childs([
          span({ text: `状態: ${札.状態}` }),
          span({ text: 担当者表示(札.担当者) })]),
      {
        If: 札.ラベル一覧.length > 0,
        True: () =>
          div({ class: styles.一覧カードラベル行 }).childs(
            札.ラベル一覧.map((ラベル) => new ラベルチップ(ラベル)),
          ),
      }]);
  }

  配線する(配線: I札リストカード配線): this {
    this._配線.配線する(配線);
    return this;
  }
}
