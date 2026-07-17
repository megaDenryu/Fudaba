import { ButtonC, 配線ポート, type I配線可能 } from "sengen-ui";
import type { 問い選択肢DTO } from "../通信/問い型";
import * as styles from "./style.css";

interface I問い選択肢配線 { on選択(id: string): void }

export class 問い選択肢ボタン extends ButtonC implements I配線可能<I問い選択肢配線> {
  private readonly _配線 = new 配線ポート<I問い選択肢配線>("問い選択肢ボタン");

  constructor(選択肢: 問い選択肢DTO) {
    super({
      text: `${選択肢.ラベル}${選択肢.ショートカット === null ? "" : ` [${選択肢.ショートカット}]`}`,
      class: styles.選択肢ボタン,
    });
    this.onClick(() => this._配線.先.on選択(選択肢.id));
  }

  配線する(配線: I問い選択肢配線): this { this._配線.配線する(配線); return this; }
}
