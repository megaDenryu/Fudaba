import { ButtonC } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細シート内容を取得する } from "./詳細シート内容";
import * as styles from "./style.css";

// 詳細シートの担当解除ボタン(LV1拡張)。担当者が未割当の札では操作の意味が無いため無効化する。
// タップ領域はモバイルの44px下限を確保するため、カンバンの担当解除ボタンとは別クラスにする
// (保存ボタン/シート保存ボタンの分離と同じ方針)
export class シート担当解除ボタン extends ButtonC {
  constructor() {
    const 文言 = 詳細シート内容を取得する(現在ロケールを取得する());
    super({ text: 文言.担当解除ボタン, class: styles.シート担当解除ボタン });
  }

  担当状態を反映する(担当者: string | null): this {
    this.setDisabled(担当者 === null);
    return this;
  }
}
