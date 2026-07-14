import { select, SelectC } from "sengen-ui";
import { 現在ロケールを取得する, ロケールを設定する } from "./現在ロケール";
import { ロケールか, ロケール一覧 } from "./ロケール";
import * as styles from "./style.css";

const 表示名 = { ja: "日本語", en: "English" } as const;

// カンバンヘッダ・モバイル作成シートに置く控えめな言語切替（LV1拡張）。動的切替は
// 非対応（辞書ヘルパー参照）のため、選択直後にページ再読み込みで反映する
export class 言語切替セレクト extends SelectC {
  constructor() {
    const 現在値 = 現在ロケールを取得する();
    super({
      options: ロケール一覧.map((値) => ({
        value: 値,
        text: 表示名[値],
        selected: 値 === 現在値,
      })),
      class: styles.言語切替セレクト,
    });
    this.onSelectChange(() => this._切り替える());
  }

  private _切り替える(): void {
    const 選択値 = this.getValue();
    if (!ロケールか(選択値)) return;
    ロケールを設定する(選択値);
    window.location.reload();
  }
}
