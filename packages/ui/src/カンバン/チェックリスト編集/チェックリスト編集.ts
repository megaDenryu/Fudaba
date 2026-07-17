import {
  button, div, span, LV2HtmlComponentBase, 配線ポート, type DivC, type I配線可能,
} from "sengen-ui";
import type { チェック項目DTO } from "../../通信/札型";
import { チェック項目行 } from "./チェック項目行";
import * as styles from "./style.css";

export interface Iチェックリスト編集配線 { on変更(): void }

// チェック項目を編集するLV2素部品。動的な1行はLV1拡張へ分離する。
export class チェックリスト編集 extends LV2HtmlComponentBase
  implements I配線可能<Iチェックリスト編集配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<Iチェックリスト編集配線>("チェックリスト編集");
  private _項目一覧: チェック項目DTO[] = [];

  constructor() {
    super();
    this._componentRoot = div({ class: styles.ルート });
    this._描画する();
  }

  配線する(配線: Iチェックリスト編集配線): this {
    this._配線.配線する(配線);
    return this;
  }

  設定する(項目一覧: readonly チェック項目DTO[]): void {
    this._項目一覧 = 項目一覧.map((項目) => ({ ...項目 }));
    this._描画する();
  }

  取得する(): readonly チェック項目DTO[] {
    return this._項目一覧.map((項目) => ({ ...項目 }));
  }

  private _描画する(): void {
    const 完了数 = this._項目一覧.filter((項目) => 項目.完了).length;
    const 見出し = this._項目一覧.length === 0
      ? "チェック項目" : `チェック項目 ${完了数}/${this._項目一覧.length}`;
    const 行一覧 = this._項目一覧.map((項目) => new チェック項目行(項目).配線する({
      on更新: (id, 変更) => this._更新する(id, 変更),
      on削除: (id) => this._削除する(id),
    }));
    this._componentRoot.clearChildren().childs([
      div({ class: styles.ヘッダ }).childs([
        span({ text: 見出し, class: styles.見出し }),
        button({ text: "項目を追加", class: styles.追加ボタン }).onClick(() => this._追加する()),
      ]),
      ...(this._項目一覧.length < 5 ? [] : [
        span({ text: "項目が多いため、独立した子札への分解を推奨します", class: styles.分解案内 }),
      ]),
      div({ class: styles.一覧 }).childs(行一覧),
    ]);
  }

  private _追加する(): void {
    this._項目一覧.push({ id: globalThis.crypto.randomUUID(), 本文: "新しい項目", 完了: false });
    this._変更して描画する();
  }

  private _削除する(id: string): void {
    this._項目一覧 = this._項目一覧.filter((項目) => 項目.id !== id);
    this._変更して描画する();
  }

  private _更新する(id: string, 変更: Partial<Pick<チェック項目DTO, "本文" | "完了">>): void {
    this._項目一覧 = this._項目一覧.map((項目) => 項目.id === id ? { ...項目, ...変更 } : 項目);
    if (変更.完了 !== undefined) this._描画する();
    this._配線.先.on変更();
  }

  private _変更して描画する(): void {
    this._描画する();
    this._配線.先.on変更();
  }
}
