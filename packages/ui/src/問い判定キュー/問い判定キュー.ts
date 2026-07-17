import { div, span, LV2部品集約Base, 配線ポート, type DivC, type I配線可能 } from "sengen-ui";
import type { 問いクライアント } from "../通信/問いクライアント";
import { 問い判定キューサービス } from "./問い判定キューサービス";
import { 問い判定キュー部品 } from "./問い判定キュー部品";
import * as styles from "./style.css";

export interface I問い判定キュー配線 { on件数変更(件数: number): void }

export class 問い判定キュー extends LV2部品集約Base<問い判定キュー部品, 問い判定キューサービス>
  implements I配線可能<I問い判定キュー配線> {
  protected _componentRoot: DivC;
  private readonly _配線 = new 配線ポート<I問い判定キュー配線>("問い判定キュー");
  private readonly _部品 = new 問い判定キュー部品();
  private readonly _サービス: 問い判定キューサービス;

  constructor(client: 問いクライアント) {
    super();
    this._サービス = new 問い判定キューサービス(client, this._部品, this._配線);
    this._componentRoot = this._ルートを構築する(this._部品, this._サービス);
    void this._サービス.更新する();
    globalThis.setInterval(() => void this._サービス.更新する(false), 5000);
  }

  protected _ルートを構築する(部品: 問い判定キュー部品, サービス: 問い判定キューサービス): DivC {
    部品.メモ.addTextAreaEventListener("input", () => 部品.メモ.autoFitToContent());
    const root = div({ class: styles.ルート }).setAttribute("tabindex", "0").childs([
      div({ class: styles.ヘッダ }).childs([
        span({ text: "人間判定キュー", class: styles.見出し }), 部品.件数, 部品.更新ボタン,
      ]),
      div({ class: styles.カード }).childs([
        部品.タイトル, 部品.本文, 部品.メタ, 部品.添付領域,
        div({ class: styles.回答入力行 }).childs([部品.回答者, 部品.メモ]),
        部品.選択肢領域, 部品.状態,
      ]),
    ]);
    部品.更新ボタン.onClick(() => void サービス.更新する());
    root.onKeyDown((event) => サービス.キー入力を処理する(event));
    return root;
  }

  配線する(配線: I問い判定キュー配線): this { this._配線.配線する(配線); return this; }
  更新する(通信状態を表示する = true): Promise<void> { return this._サービス.更新する(通信状態を表示する); }
}
