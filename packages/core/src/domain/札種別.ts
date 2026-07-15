import { 検証エラー } from "./検証エラー.js";

// WBS・バグシート・タスクリストの最小共通形を単一のドメイン型「札」で表すための判別軸。
// 新しい種別を迎えるときはこの一覧に追記する（UI側の配色は packages/ui/src/カンバン/種別バッジ.ts）
export const 札種別一覧 = [
  "実装", "バグ", "新仕様", "仕様検討", "タスク分解", "記録", "決定",
] as const;

export type 札種別値 = (typeof 札種別一覧)[number];

function 札種別値か(値: string): 値 is 札種別値 {
  return 札種別一覧.some((候補) => 候補 === 値);
}

export class 札種別 {
  private constructor(private readonly 内部値: 札種別値) {}

  static create(値: string): 札種別 {
    const 整形済み = 値.trim();
    if (!札種別値か(整形済み)) {
      throw new 検証エラー(
        `札種別は ${札種別一覧.join(" | ")} のいずれかである必要があります: "${値}"`,
      );
    }
    return new 札種別(整形済み);
  }

  get 値(): 札種別値 {
    return this.内部値;
  }

  equals(他: 札種別): boolean {
    return this.内部値 === 他.内部値;
  }
}
