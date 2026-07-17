import {
  button,
  div,
  img,
  span,
  textInput,
  LV2HtmlComponentBase,
  TextAreaC,
  type DivC,
  type SpanC,
  type TextInputC,
} from "sengen-ui";
import { 作成者名を読み込む, 作成者名を保存する } from "../作成者名記憶";
import type { 問いクライアント } from "../通信/問いクライアント";
import type { 未回答問いDTO } from "../通信/問い型";
import * as styles from "./style.css";
import { 添付URLを組み立てる } from "../通信/添付URL";

export class 問い判定キュー extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private _一覧: readonly 未回答問いDTO[] = [];
  private _位置 = 0;
  private _回答中 = false;
  private readonly _件数: SpanC;
  private readonly _タイトル: SpanC;
  private readonly _本文: DivC;
  private readonly _メタ: SpanC;
  private readonly _添付領域: DivC;
  private readonly _選択肢領域: DivC;
  private readonly _状態: SpanC;
  private readonly _回答者: TextInputC;
  private readonly _メモ: TextAreaC;

  constructor(
    private readonly _クライアント: 問いクライアント,
    private readonly _件数変更時: (件数: number) => void = () => {},
  ) {
    super();
    this._件数 = span({ class: styles.件数 });
    this._タイトル = span({ class: styles.タイトル });
    this._本文 = div({ class: styles.本文 });
    this._メタ = span({ class: styles.メタ });
    this._添付領域 = div({ class: styles.添付領域 });
    this._選択肢領域 = div({ class: styles.選択肢領域 });
    this._状態 = span({ class: styles.状態 });
    this._回答者 = textInput({
      class: styles.回答者,
      placeholder: "回答者名",
      value: 作成者名を読み込む(),
    });
    this._メモ = new TextAreaC({ class: styles.メモ, placeholder: "回答メモ（任意）", rows: 2 });
    this._メモ.addTextAreaEventListener("input", () => this._メモ.autoFitToContent());
    this._componentRoot = div({ class: styles.ルート }).setAttribute("tabindex", "0").childs([
      div({ class: styles.ヘッダ }).childs([
        span({ text: "人間判定キュー", class: styles.見出し }),
        this._件数,
        button({ text: "更新", class: styles.更新ボタン }).onClick(() => void this.更新する()),
      ]),
      div({ class: styles.カード }).childs([
        this._タイトル,
        this._本文,
        this._メタ,
        this._添付領域,
        div({ class: styles.回答入力行 }).childs([this._回答者, this._メモ]),
        this._選択肢領域,
        this._状態,
      ]),
    ]);
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (!this._componentRoot.dom.element.isConnected) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const 現在 = this._一覧[this._位置];
      const 選択肢 = 現在?.選択肢一覧.find((候補) => 候補.ショートカット === event.key.toLowerCase());
      if (選択肢 === undefined) return;
      event.preventDefault();
      void this._回答する(選択肢.id);
    });
    void this.更新する();
    window.setInterval(() => void this.更新する(false), 5000);
  }

  async 更新する(通信状態を表示する = true): Promise<void> {
    try {
      const 以前のID = this._一覧[this._位置]?.id;
      this._一覧 = await this._クライアント.未回答一覧を取得する();
      const 同じ位置 = 以前のID === undefined ? -1 : this._一覧.findIndex((問い) => 問い.id === 以前のID);
      this._位置 = 同じ位置 >= 0 ? 同じ位置 : Math.min(this._位置, Math.max(0, this._一覧.length - 1));
      if (通信状態を表示する) this._状態.setTextContent("");
      this._現在を描画する();
    } catch (エラー) {
      this._状態.setTextContent(エラー instanceof Error ? エラー.message : "問い一覧の取得に失敗しました");
    }
  }

  private _現在を描画する(): void {
    const 現在 = this._一覧[this._位置];
    this._件数変更時(this._一覧.length);
    this._件数.setTextContent(現在 === undefined ? "未回答 0件" : `${this._位置 + 1} / ${this._一覧.length}（未回答）`);
    if (現在 === undefined) {
      this._タイトル.setTextContent("現在、判断待ちの問いはありません");
      this._本文.setTextContent("");
      this._メタ.setTextContent("");
      this._選択肢領域.clearChildren();
      this._添付領域.clearChildren();
      return;
    }
    this._タイトル.setTextContent(`#${現在.id} ${現在.タイトル}`);
    this._本文.setTextContent(現在.本文);
    const 関連札 = 現在.関連札ID === null ? "" : ` / 関連札 #${現在.関連札ID}`;
    this._メタ.setTextContent(`起票: ${現在.作成者}${関連札}`);
    this._添付領域.clearChildren().childs(現在.添付一覧.map((添付) => {
      const URL = 添付URLを組み立てる(添付.保存名);
      const 画像か = /\.(png|jpe?g|gif|webp)$/i.test(添付.保存名);
      if (画像か) return img({ src: URL, alt: 添付.ファイル名, class: styles.添付画像 });
      const 内容 = div({ text: `${添付.ファイル名} を読み込み中…`, class: styles.添付テキスト });
      void fetch(URL).then(async (応答) => {
        内容.setTextContent(応答.ok ? await 応答.text() : `${添付.ファイル名} の取得に失敗しました`);
      }).catch(() => 内容.setTextContent(`${添付.ファイル名} の取得に失敗しました`));
      return 内容;
    }));
    this._選択肢領域.clearChildren().childs(
      現在.選択肢一覧.map((選択肢) =>
        button({
          text: `${選択肢.ラベル}${選択肢.ショートカット === null ? "" : ` [${選択肢.ショートカット}]`}`,
          class: styles.選択肢ボタン,
        }).onClick(() => void this._回答する(選択肢.id)),
      ),
    );
  }

  private async _回答する(選択肢ID: string): Promise<void> {
    if (this._回答中) return;
    const 現在 = this._一覧[this._位置];
    if (現在 === undefined) return;
    const 回答者 = this._回答者.getValue().trim();
    if (回答者.length === 0) {
      this._状態.setTextContent("回答者名を入力してください");
      return;
    }
    this._回答中 = true;
    this._状態.setTextContent("回答を保存中…");
    try {
      作成者名を保存する(回答者);
      await this._クライアント.回答する(現在.id, 選択肢ID, 回答者, this._メモ.getValue());
      this._一覧 = this._一覧.filter((問い) => 問い.id !== 現在.id);
      this._位置 = Math.min(this._位置, Math.max(0, this._一覧.length - 1));
      this._メモ.setValue("");
      this._状態.setTextContent("回答を保存しました");
      this._現在を描画する();
    } catch (エラー) {
      this._状態.setTextContent(エラー instanceof Error ? エラー.message : "回答に失敗しました");
    } finally {
      this._回答中 = false;
    }
  }
}
