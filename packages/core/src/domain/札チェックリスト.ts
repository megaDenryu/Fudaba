import { 検証エラー } from "./検証エラー.js";

const 最大項目数 = 30;
const 本文最大文字数 = 500;
const 分解推奨項目数 = 5;

export interface 札チェック項目DTO {
  readonly id: string;
  readonly 本文: string;
  readonly 完了: boolean;
}

export class 札チェックリスト {
  private constructor(readonly 項目一覧: readonly 札チェック項目DTO[]) {}

  static 空(): 札チェックリスト {
    return new 札チェックリスト([]);
  }

  static create(値一覧: readonly 札チェック項目DTO[]): 札チェックリスト {
    if (値一覧.length > 最大項目数) {
      throw new 検証エラー(`チェック項目は${最大項目数}件以内である必要があります`);
    }
    const id集合 = new Set<string>();
    const 項目一覧 = 値一覧.map((値) => {
      const id = 値.id.trim();
      const 本文 = 値.本文.trim();
      if (id.length === 0 || id.length > 100) {
        throw new 検証エラー("チェック項目IDは1〜100文字である必要があります");
      }
      if (id集合.has(id)) throw new 検証エラー(`チェック項目IDが重複しています: ${id}`);
      if (本文.length === 0 || 本文.length > 本文最大文字数) {
        throw new 検証エラー(`チェック項目本文は1〜${本文最大文字数}文字である必要があります`);
      }
      id集合.add(id);
      return { id, 本文, 完了: 値.完了 };
    });
    return new 札チェックリスト(項目一覧);
  }

  get 未完了件数(): number {
    return this.項目一覧.filter((項目) => !項目.完了).length;
  }

  get 分解推奨か(): boolean {
    return this.項目一覧.length >= 分解推奨項目数;
  }
}

export function 札チェックリストをDTO値にする(対象: 札チェックリスト): string {
  return JSON.stringify(対象.項目一覧);
}

export function 札チェックリストをDTO値から作る(値: string): 札チェックリスト {
  let 解析値: unknown;
  try {
    解析値 = JSON.parse(値);
  } catch {
    throw new 検証エラー("保存済みチェックリストがJSON配列ではありません");
  }
  if (!Array.isArray(解析値)) throw new 検証エラー("保存済みチェックリストが配列ではありません");
  const 項目一覧 = 解析値.map((項目): 札チェック項目DTO => {
    if (
      typeof 項目 !== "object" || 項目 === null ||
      !("id" in 項目) || typeof 項目.id !== "string" ||
      !("本文" in 項目) || typeof 項目.本文 !== "string" ||
      !("完了" in 項目) || typeof 項目.完了 !== "boolean"
    ) {
      throw new 検証エラー("保存済みチェック項目の形式が不正です");
    }
    return { id: 項目.id, 本文: 項目.本文, 完了: 項目.完了 };
  });
  return 札チェックリスト.create(項目一覧);
}
