import { div, LV2HtmlComponentBase, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import { フィルタチップ } from "../カンバン/フィルタチップ";
import { 札状態選択肢 } from "../カンバン/定数";
import * as styles from "./style.css";

export interface I状態セグメントタブ配線 {
  on状態選択(状態: string): void;
}

interface タブ項目 {
  readonly 状態値: string;
  readonly チップ: フィルタチップ;
}

// モバイル札ビュー上部の状態フィルタ（LV2素部品）。カンバンの状態列に相当する絞り込みを、
// 縦1列リストでは4つのタブとして表現する。常に1つだけ選択された状態を保つ
export class 状態セグメントタブ extends LV2HtmlComponentBase implements I配線可能<I状態セグメントタブ配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I状態セグメントタブ配線>("状態セグメントタブ");
  private readonly _項目一覧: readonly タブ項目[];

  constructor() {
    super();
    this._項目一覧 = 札状態選択肢.map((状態値) => ({
      状態値,
      チップ: new フィルタチップ(状態値).配線する({
        on選択: () => this._配線.先.on状態選択(状態値),
      }),
    }));
    this._componentRoot = this._ルートを構築する(this._項目一覧);
  }

  配線する(配線: I状態セグメントタブ配線): this {
    this._配線.配線する(配線);
    return this;
  }

  選択状態を設定する(選択中の状態: string): void {
    for (const 項目 of this._項目一覧) {
      項目.チップ.選択状態を設定する(項目.状態値 === 選択中の状態);
    }
  }

  private _ルートを構築する(項目一覧: readonly タブ項目[]): DivC {
    return (
      div({ class: styles.タブ行 }).childs(
          項目一覧.map((項目) => div({ class: styles.タブ項目 }).child(項目.チップ)),
      )
    );
  }
}
