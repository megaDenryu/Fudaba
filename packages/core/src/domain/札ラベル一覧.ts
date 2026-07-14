import { ラベル } from "./ラベル.js";

// 札が持つ0個以上のラベル集合。未分類（0個）を許すのが本質（DESIGN.md「ラベル」節）。
// 入力文字列の空白除去・空文字除外・重複排除をここに閉じ込め、消費側（API・UI）は
// 生の文字列配列を渡すだけでよい
export class 札ラベル一覧 {
  private constructor(private readonly 内部一覧: readonly ラベル[]) {}

  static create(生一覧: readonly string[]): 札ラベル一覧 {
    const 確定済み: ラベル[] = [];
    for (const 値 of 生一覧) {
      if (値.trim().length === 0) continue;
      const 対象 = ラベル.create(値);
      if (確定済み.some((既存) => 既存.equals(対象))) continue;
      確定済み.push(対象);
    }
    return new 札ラベル一覧(確定済み);
  }

  static 空 = (): 札ラベル一覧 => new 札ラベル一覧([]);

  get 値一覧(): readonly string[] {
    return this.内部一覧.map((ラベル) => ラベル.値);
  }

  含むか(値: string): boolean {
    return this.内部一覧.some((対象) => 対象.値 === 値);
  }
}

export function 札ラベル一覧をDTO値にする(対象: 札ラベル一覧): string {
  return JSON.stringify(対象.値一覧);
}

export function 札ラベル一覧をDTO値から作る(値: string): 札ラベル一覧 {
  const 復元: unknown = JSON.parse(値);
  if (!Array.isArray(復元) || !復元.every((項目): 項目 is string => typeof 項目 === "string")) {
    throw new Error(`labels列の値がJSON文字列配列ではありません: ${値}`);
  }
  return 札ラベル一覧.create(復元);
}
