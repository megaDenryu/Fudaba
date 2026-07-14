import { 検証エラー } from "./検証エラー.js";

// カンバンの4列に対応する状態。DESIGN.mdの方針どおり、状態遷移に制約は設けない
// （どの状態からどの状態へも変更可。運用の柔軟性優先）
export const 札状態一覧 = ["未着手", "進行中", "完了", "ブロック"] as const;

export type 札状態値 = (typeof 札状態一覧)[number];

function 札状態値か(値: string): 値 is 札状態値 {
  return 札状態一覧.some((候補) => 候補 === 値);
}

export class 札状態 {
  private constructor(private readonly 内部値: 札状態値) {}

  static create(値: string): 札状態 {
    const 整形済み = 値.trim();
    if (!札状態値か(整形済み)) {
      throw new 検証エラー(
        `札状態は ${札状態一覧.join(" | ")} のいずれかである必要があります: "${値}"`,
      );
    }
    return new 札状態(整形済み);
  }

  static 既定 = (): 札状態 => new 札状態("未着手");

  get 値(): 札状態値 {
    return this.内部値;
  }

  equals(他: 札状態): boolean {
    return this.内部値 === 他.内部値;
  }
}
