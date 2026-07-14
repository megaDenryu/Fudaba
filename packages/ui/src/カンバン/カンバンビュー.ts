import { button, div, span, LV2部品集約Base, type DivC } from "sengen-ui";
import type { 札クライアント } from "../通信/札クライアント";
import { カンバンビュー部品 } from "./カンバンビュー部品";
import { カンバンビューサービス } from "./カンバンビューサービス";
import { 状態表示ラベル } from "./状態表示ラベル";
import * as styles from "./style.css";

// カンバンビューのOrchestrator（LV2部品集約）。状態4列に札カードを配置し、上部に
// 新規作成フォームを置く。データはREST（/api/fudaba/items）のポーリング取得で、
// リアルタイム同期は行わない（手動更新ボタン+作成/更新後の再取得で足りる。DESIGN.md参照）
export class カンバンビュー extends LV2部品集約Base<カンバンビュー部品, カンバンビューサービス> {
  protected _componentRoot: DivC;
  private readonly _部品: カンバンビュー部品;
  private readonly _状態表示 = new 状態表示ラベル();
  private readonly _サービス: カンバンビューサービス;

  constructor(クライアント: 札クライアント) {
    super();
    this._部品 = カンバンビュー部品.作る();
    this._サービス = new カンバンビューサービス(クライアント, this._部品, this._状態表示);
    this._componentRoot = this._ルートを構築する(this._部品, this._サービス);
    void this._サービス.更新する();
  }

  protected _ルートを構築する(
    部品: カンバンビュー部品,
    サービス: カンバンビューサービス,
  ): DivC {
    return (
      div({ class: styles.ルート }).childs([
          div({ class: styles.ヘッダ }).childs([
              span({ text: "Fudaba（札場）", class: styles.タイトル }),
              button({ text: "更新", class: styles.更新ボタン }).onClick(
                () => void サービス.更新する(),
              )]),
          部品.新規作成フォーム.配線する({
              on作成: (内容) => void サービス.作成する(内容),
          }),
          部品.フィルタバー.配線する({
              on種別選択: (種別) => サービス.種別フィルタを切り替える(種別),
              on担当者選択: (担当者) => サービス.担当者フィルタを切り替える(担当者),
              onラベル選択: (ラベル) => サービス.ラベルフィルタを切り替える(ラベル),
          }),
          this._状態表示,
          div({ class: styles.列一覧領域 }).childs(部品.列一覧),
          部品.詳細パネル.配線する({
              on保存: (id, 変更) => void サービス.保存する(id, 変更),
              on閉じる: () => 部品.詳細パネル.閉じる(),
              on添付追加: (id, ファイル) => void サービス.添付を追加する(id, ファイル),
              on添付削除: (id, 保存名) => void サービス.添付を削除する(id, 保存名),
          })])
    );
  }
}
