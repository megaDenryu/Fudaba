import type { 問いクライアント } from "../通信/問いクライアント";
import type { 未回答問いDTO } from "../通信/問い型";
import { 作成者名を保存する } from "../作成者名記憶";
import type { 配線ポート } from "sengen-ui";
import type { I問い判定キュー配線 } from "./問い判定キュー";
import type { 問い判定キュー部品 } from "./問い判定キュー部品";
import { 問い添付表示 } from "./問い添付表示";
import { 問い選択肢ボタン } from "./問い選択肢ボタン";

export class 問い判定キューサービス {
  private _一覧: readonly 未回答問いDTO[] = [];
  private _位置 = 0;
  private _回答中 = false;

  constructor(private readonly _client: 問いクライアント, private readonly _部品: 問い判定キュー部品,
    private readonly _配線: 配線ポート<I問い判定キュー配線>) {}

  async 更新する(通信状態を表示する = true): Promise<void> {
    try {
      const 以前のID = this._一覧[this._位置]?.id;
      this._一覧 = await this._client.未回答一覧を取得する();
      const index = 以前のID === undefined ? -1 : this._一覧.findIndex((問い) => 問い.id === 以前のID);
      this._位置 = index >= 0 ? index : Math.min(this._位置, Math.max(0, this._一覧.length - 1));
      if (通信状態を表示する) this._部品.状態.setTextContent("");
      this.描画する();
    } catch (error) {
      this._部品.状態.setTextContent(error instanceof Error ? error.message : "問い一覧の取得に失敗しました");
    }
  }

  キー入力を処理する(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const option = this._一覧[this._位置]?.選択肢一覧
      .find((候補) => 候補.ショートカット === event.key.toLowerCase());
    if (option === undefined) return;
    event.preventDefault(); void this.回答する(option.id);
  }

  描画する(): void {
    const 現在 = this._一覧[this._位置];
    this._配線.先.on件数変更(this._一覧.length);
    this._部品.件数.setTextContent(現在 === undefined ? "未回答 0件" : `${this._位置 + 1} / ${this._一覧.length}（未回答）`);
    if (現在 === undefined) {
      this._部品.タイトル.setTextContent("現在、判断待ちの問いはありません");
      this._部品.本文.setTextContent(""); this._部品.メタ.setTextContent("");
      this._部品.選択肢領域.clearChildren(); this._部品.添付領域.clearChildren(); return;
    }
    this._部品.タイトル.setTextContent(`#${現在.id} ${現在.タイトル}`);
    this._部品.本文.setTextContent(現在.本文);
    const 関連札 = 現在.関連札ID === null ? "" : ` / 関連札 #${現在.関連札ID}`;
    this._部品.メタ.setTextContent(`起票: ${現在.作成者}${関連札}`);
    this._部品.添付領域.clearChildren().childs(現在.添付一覧.map((item) => new 問い添付表示(item)));
    this._部品.選択肢領域.clearChildren().childs(現在.選択肢一覧.map((option) =>
      new 問い選択肢ボタン(option).配線する({ on選択: (id) => void this.回答する(id) }),
    ));
  }

  async 回答する(選択肢ID: string): Promise<void> {
    if (this._回答中) return;
    const 現在 = this._一覧[this._位置];
    if (現在 === undefined) return;
    const 回答者 = this._部品.回答者.getValue().trim();
    if (回答者.length === 0) { this._部品.状態.setTextContent("回答者名を入力してください"); return; }
    this._回答中 = true; this._部品.状態.setTextContent("回答を保存中…");
    try {
      作成者名を保存する(回答者);
      await this._client.回答する(現在.id, 選択肢ID, 回答者, this._部品.メモ.getValue());
      this._一覧 = this._一覧.filter((問い) => 問い.id !== 現在.id);
      this._位置 = Math.min(this._位置, Math.max(0, this._一覧.length - 1));
      this._部品.メモ.setValue(""); this._部品.状態.setTextContent("回答を保存しました"); this.描画する();
    } catch (error) {
      this._部品.状態.setTextContent(error instanceof Error ? error.message : "回答に失敗しました");
    } finally { this._回答中 = false; }
  }
}
