import { ButtonC } from "sengen-ui";
import { 現在ロケールを取得する } from "../文言/現在ロケール";
import { 詳細パネル内容を取得する } from "./詳細パネル内容";
import * as styles from "./style.css";

// 詳細パネルの担当解除ボタン(LV1拡張)。担当者が未割当の札では操作の意味が無いため無効化する
export class 担当解除ボタン extends ButtonC {
  constructor() {
    const 文言 = 詳細パネル内容を取得する(現在ロケールを取得する());
    super({ text: 文言.担当解除ボタン, class: styles.詳細担当解除ボタン });
  }

  担当状態を反映する(担当者: string | null): this {
    this.setDisabled(担当者 === null);
    return this;
  }
}
