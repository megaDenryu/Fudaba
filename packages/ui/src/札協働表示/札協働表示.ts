import { button, div, span, textInput, LV2HtmlComponentBase, TextAreaC, type DivC, type SpanC, type TextInputC } from "sengen-ui";
import { 作成者名を読み込む, 作成者名を保存する } from "../作成者名記憶";
import { 札協働クライアント, type 札コメントDTO, type 札関係リンクDTO } from "../通信/札協働クライアント";
import * as styles from "./style.css";

export class 札協働表示 extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private _札ID: number | null = null;
  private readonly _関係一覧: DivC;
  private readonly _コメント一覧: DivC;
  private readonly _作成者: TextInputC;
  private readonly _本文: TextAreaC;
  private readonly _状態: SpanC;

  constructor(private readonly _クライアント = new 札協働クライアント()) {
    super();
    this._関係一覧 = div({ class: styles.一覧 });
    this._コメント一覧 = div({ class: styles.一覧 });
    this._作成者 = textInput({ class: styles.作成者, placeholder: "作成者", value: 作成者名を読み込む() });
    this._本文 = new TextAreaC({ class: styles.本文, placeholder: "経緯・調査結果を追記", rows: 2 });
    this._状態 = span({ class: styles.状態 });
    this._componentRoot = div({ class: styles.ルート }).childs([
      span({ text: "札の関係", class: styles.見出し }),
      this._関係一覧,
      span({ text: "コメント", class: styles.見出し }),
      this._コメント一覧,
      div({ class: styles.入力行 }).childs([
        this._作成者,
        this._本文,
        button({ text: "追記", class: styles.追記ボタン }).onClick(() => void this._追記する()),
      ]),
      this._状態,
    ]);
  }

  async 表示する(札ID: number): Promise<void> {
    this._札ID = 札ID;
    try {
      const [コメント一覧, リンク一覧] = await Promise.all([
        this._クライアント.コメント一覧を取得する(札ID),
        this._クライアント.リンク一覧を取得する(札ID),
      ]);
      if (this._札ID !== 札ID) return;
      this._コメントを描画する(コメント一覧);
      this._関係を描画する(札ID, リンク一覧);
      this._状態.setTextContent("");
    } catch (エラー) {
      this._状態.setTextContent(エラー instanceof Error ? エラー.message : "協働情報の取得に失敗しました");
    }
  }

  private _コメントを描画する(一覧: readonly 札コメントDTO[]): void {
    this._コメント一覧.clearChildren().childs(
      一覧.length === 0
        ? [span({ text: "コメントはありません", class: styles.空表示 })]
        : 一覧.map((コメント) => div({ class: styles.コメント }).childs([
            span({ text: `${コメント.作成者} / ${new Date(コメント.作成時刻).toLocaleString()}`, class: styles.メタ }),
            div({ text: コメント.本文, class: styles.コメント本文 }),
          ])),
    );
  }

  private _関係を描画する(札ID: number, 一覧: readonly 札関係リンクDTO[]): void {
    const 表示一覧 = 一覧.map((リンク) => {
      if (リンク.種別 === "親子") {
        return リンク.元札ID === 札ID ? `子札 #${リンク.先札ID}` : `親札 #${リンク.元札ID}`;
      }
      return リンク.元札ID === 札ID ? `依存先 #${リンク.先札ID}` : `この札へ依存 #${リンク.元札ID}`;
    });
    this._関係一覧.clearChildren().childs(
      表示一覧.length === 0
        ? [span({ text: "関係リンクはありません", class: styles.空表示 })]
        : 表示一覧.map((表示) => span({ text: 表示, class: styles.関係項目 })),
    );
  }

  private async _追記する(): Promise<void> {
    if (this._札ID === null) return;
    const 作成者 = this._作成者.getValue().trim();
    const 本文 = this._本文.getValue().trim();
    if (作成者.length === 0 || 本文.length === 0) {
      this._状態.setTextContent("作成者とコメント本文を入力してください");
      return;
    }
    try {
      作成者名を保存する(作成者);
      await this._クライアント.コメントを追加する(this._札ID, 作成者, 本文);
      this._本文.setValue("");
      await this.表示する(this._札ID);
    } catch (エラー) {
      this._状態.setTextContent(エラー instanceof Error ? エラー.message : "コメント追加に失敗しました");
    }
  }
}
