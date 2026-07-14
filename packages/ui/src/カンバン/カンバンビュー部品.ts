import { フィルタバー } from "./フィルタバー";
import { 新規作成フォーム } from "./新規作成フォーム";
import { 状態列 } from "./状態列";
import { 詳細パネル } from "./詳細パネル";
import { 札状態選択肢 } from "./定数";

// カンバンビューが集約する部品の型契約（部品DTO）。構築はstaticファクトリに閉じる
export class カンバンビュー部品 {
  private constructor(
    readonly 新規作成フォーム: 新規作成フォーム,
    readonly フィルタバー: フィルタバー,
    readonly 詳細パネル: 詳細パネル,
    readonly 列一覧: readonly 状態列[],
  ) {}

  static 作る(): カンバンビュー部品 {
    return new カンバンビュー部品(
      new 新規作成フォーム(),
      new フィルタバー(),
      new 詳細パネル(),
      札状態選択肢.map((状態) => new 状態列(状態)),
    );
  }
}
