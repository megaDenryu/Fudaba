import type { 札DTO } from "../通信/札型";

// 既存札に登場した担当者・作成者名から、担当者入力欄の候補一覧(datalist用)を作る。
// 担当者(未割当を除く)と作成者の両方を候補プールとする。人間もAIも同格に担当し得るため
export function 担当者候補一覧を抽出する(一覧: readonly 札DTO[]): string[] {
  const 候補集合 = new Set<string>();
  for (const 札 of 一覧) {
    if (札.担当者 !== null) {
      候補集合.add(札.担当者);
    }
    候補集合.add(札.作成者);
  }
  return [...候補集合].sort((a, b) => a.localeCompare(b, "ja"));
}
