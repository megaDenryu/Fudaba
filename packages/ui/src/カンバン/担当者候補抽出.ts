import type { キャラDTO } from "../通信/キャラ型";
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

// 札由来の候補に、ワークスペースのキャラ一覧(名前)を合成する。キャラはルームに属さず
// 第一級エンティティとして存在するため、まだ一度も担当していないキャラも候補に含めたい
export function 担当者候補を合成する(
  札一覧: readonly 札DTO[],
  キャラ一覧: readonly キャラDTO[],
): string[] {
  const 候補集合 = new Set<string>(担当者候補一覧を抽出する(札一覧));
  for (const キャラ of キャラ一覧) {
    候補集合.add(キャラ.名前);
  }
  return [...候補集合].sort((a, b) => a.localeCompare(b, "ja"));
}
