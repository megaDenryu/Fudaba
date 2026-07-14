import { button, div, span, LV2部品集約Base, type DivC } from "sengen-ui";
import { 状態表示ラベル } from "../カンバン/状態表示ラベル";
import { 札状態選択肢 } from "../カンバン/定数";
import { 既定のキャラクライアントを作る, type キャラクライアント } from "../通信/キャラクライアント";
import type { 札クライアント } from "../通信/札クライアント";
import { モバイル札ビュー部品 } from "./モバイル札ビュー部品";
import { モバイル札ビューサービス } from "./モバイル札ビューサービス";
import * as styles from "./style.css";

// モバイル札ビューのOrchestrator（LV2部品集約）。カンバンではなく縦1列のリスト型で、
// 状態フィルタのセグメントタブ+札カードリスト+タップで開く詳細ボトムシート+新規作成の
// FABボタンで構成する（Jimbo/ARCHITECTURE.md「デスクトップとモバイルは別シェル・別ビュー」）。
// 390px幅を基準に設計し、配線先（AgentRoomモバイルシェル）は知らずexportするだけの部品
export class モバイル札ビュー extends LV2部品集約Base<モバイル札ビュー部品, モバイル札ビューサービス> {
  protected _componentRoot: DivC;
  private readonly _部品: モバイル札ビュー部品;
  private readonly _状態表示 = new 状態表示ラベル();
  private readonly _サービス: モバイル札ビューサービス;

  // キャラクライアントは省略時、自前でAgentRoomの/api/charasを叩く実装を構築する。
  // 既存の呼び出し元（Jimboシェル側コンポジションルート）が単一引数のままでも動く後方互換のため
  constructor(
    クライアント: 札クライアント,
    キャラクライアント: キャラクライアント = 既定のキャラクライアントを作る(),
  ) {
    super();
    this._部品 = モバイル札ビュー部品.作る();
    this._サービス = new モバイル札ビューサービス(
      クライアント,
      キャラクライアント,
      this._部品,
      this._状態表示,
    );
    this._部品.状態タブ.選択状態を設定する(札状態選択肢[0]);
    this._componentRoot = this._ルートを構築する(this._部品, this._サービス);
    void this._サービス.更新する();
  }

  protected _ルートを構築する(
    部品: モバイル札ビュー部品,
    サービス: モバイル札ビューサービス,
  ): DivC {
    return (
      div({ class: styles.ルート }).childs([
          div({ class: styles.ヘッダ }).childs([
              span({ text: "Fudaba（札場）", class: styles.タイトル }),
              button({ text: "更新", class: styles.更新ボタン }).onClick(
                () => void サービス.更新する(),
              )]),
          部品.状態タブ.配線する({
              on状態選択: (状態) => サービス.状態タブを選択する(状態),
          }),
          this._状態表示,
          部品.リスト,
          button({ text: "+", class: styles.作成ボタン }).onClick(() =>
            部品.作成シート.開く(),
          ),
          部品.詳細シート.配線する({
              on保存: (id, 変更) => void サービス.保存する(id, 変更),
              on閉じる: () => 部品.詳細シート.閉じる(),
              on添付追加: (id, ファイル) => void サービス.添付を追加する(id, ファイル),
              on添付削除: (id, 保存名) => void サービス.添付を削除する(id, 保存名),
          }),
          部品.作成シート.配線する({
              on作成: (内容) => void サービス.作成する(内容),
              on閉じる: () => 部品.作成シート.閉じる(),
          })])
    );
  }
}
