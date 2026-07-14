import type { 札DTO } from "../通信/札型";

// 既存札に登場した全ラベルから、ラベル入力欄の候補一覧(datalist用)・フィルタ用チップの
// 元データを作る。事前登録不要というDESIGN.mdの方針に沿い、登場済みの値を集約するだけ
export function ラベル候補一覧を抽出する(一覧: readonly 札DTO[]): string[] {
  const 候補集合 = new Set<string>();
  for (const 札 of 一覧) {
    for (const ラベル of 札.ラベル一覧) {
      候補集合.add(ラベル);
    }
  }
  return [...候補集合].sort((a, b) => a.localeCompare(b, "ja"));
}
