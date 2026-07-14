import type { 札DTO } from "../通信/札型";
import type { カンバンフィルタ状態 } from "./フィルタ状態";

// 札が現在のフィルタ状態に一致するかを判定する（種別・担当者はAND、ラベルは
// 選択した全ラベルを持つことを要求するAND条件）
export function 札がフィルタに一致するか(札: 札DTO, フィルタ: カンバンフィルタ状態): boolean {
  if (フィルタ.種別 !== null && 札.種別 !== フィルタ.種別) {
    return false;
  }
  if (フィルタ.担当者 !== null && (札.担当者 ?? "") !== フィルタ.担当者) {
    return false;
  }
  if (フィルタ.ラベル一覧.length > 0) {
    const 札のラベル集合 = new Set(札.ラベル一覧);
    if (!フィルタ.ラベル一覧.every((ラベル) => 札のラベル集合.has(ラベル))) {
      return false;
    }
  }
  return true;
}
