import { button, checkbox, textInput, DivC, 配線ポート, type I配線可能 } from "sengen-ui";
import type { チェック項目DTO } from "../../通信/札型";
import * as styles from "./style.css";

export interface Iチェック項目行配線 {
  on更新(id: string, 変更: Partial<Pick<チェック項目DTO, "本文" | "完了">>): void;
  on削除(id: string): void;
}

// チェック項目1件を表すLV1拡張。親への通知は配線ポートへ限定する。
export class チェック項目行 extends DivC implements I配線可能<Iチェック項目行配線> {
  private readonly _配線 = new 配線ポート<Iチェック項目行配線>("チェック項目行");

  constructor(項目: チェック項目DTO) {
    const 本文入力 = textInput({ value: 項目.本文, class: styles.本文入力 });
    super({ class: styles.項目行 });
    this.childs([
      checkbox({ checked: 項目.完了, class: styles.完了入力 }).onCheckChange((完了) =>
        this._配線.先.on更新(項目.id, { 完了 }),
      ),
      本文入力.onInput(() => this._配線.先.on更新(項目.id, { 本文: 本文入力.getValue() })),
      button({ text: "削除", class: styles.削除ボタン }).onClick(() =>
        this._配線.先.on削除(項目.id),
      ),
    ]);
  }

  配線する(配線: Iチェック項目行配線): this {
    this._配線.配線する(配線);
    return this;
  }
}
