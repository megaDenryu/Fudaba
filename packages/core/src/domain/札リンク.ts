import { 検証エラー } from "./検証エラー.js";

// ルームへの弱参照。DB跨ぎの外部キーは張らず、ルーム名の文字列参照のみ持つ
// （参照: Jimbo/ARCHITECTURE.md「機能間の参照はIDリンクのみ」）
export type 札リンク =
  | { readonly 種別: "リンクなし" }
  | { readonly 種別: "ルームリンク"; readonly ルーム名: string };

export const 未リンク: 札リンク = { 種別: "リンクなし" };

export function ルームにリンクする(ルーム名: string): 札リンク {
  const 整形済み = ルーム名.trim();
  if (整形済み.length === 0 || 整形済み.length > 64) {
    throw new 検証エラー(`ルーム名は1〜64文字である必要があります: "${ルーム名}"`);
  }
  return { 種別: "ルームリンク", ルーム名: 整形済み };
}

export function 札リンクをDTO値にする(対象: 札リンク): string | null {
  return 対象.種別 === "リンクなし" ? null : 対象.ルーム名;
}

export function 札リンクをDTO値から作る(値: string | null): 札リンク {
  return 値 === null ? 未リンク : ルームにリンクする(値);
}
