import { DivC, 配線ポート, type I配線可能 } from "sengen-ui";
import { フィルタチップ } from "./フィルタチップ";
import * as styles from "./style.css";

export interface Iフィルタチップ行配線 {
  on選択(値: string): void;
}

interface フィルタ項目 {
  readonly 値: string;
  readonly チップ: フィルタチップ;
}

// フィルタバーの1行(種別/担当者/ラベルのいずれか、LV1拡張)。候補一覧を丸ごと
// 差し替えて使う。選択状態そのものは持たず、外部（フィルタバー）から反映させる
export class フィルタチップ行 extends DivC implements I配線可能<Iフィルタチップ行配線> {
  private readonly _配線 = new 配線ポート<Iフィルタチップ行配線>("フィルタチップ行");
  private _項目一覧: readonly フィルタ項目[] = [];

  constructor() {
    super({ class: styles.フィルタ行 });
  }

  配線する(配線: Iフィルタチップ行配線): this {
    this._配線.配線する(配線);
    return this;
  }

  候補一覧を更新する(候補一覧: readonly string[]): void {
    this._項目一覧 = 候補一覧.map((値) => ({
      値,
      チップ: new フィルタチップ(値).配線する({ on選択: () => this._配線.先.on選択(値) }),
    }));
    this.clearChildren().childs(this._項目一覧.map((項目) => 項目.チップ));
  }

  選択状態を反映する(選択済みか: (値: string) => boolean): void {
    for (const 項目 of this._項目一覧) {
      項目.チップ.選択状態を設定する(選択済みか(項目.値));
    }
  }
}
