import { メンバー名 } from "./メンバー名.js";

// 「未割当」を空文字列等のプリミティブに密輸せず、判別共用体で表す。
// JSON（DTO）上は null=未割当 / string=割当済み に写像する
export type 担当者 =
  | { readonly 種別: "未割当" }
  | { readonly 種別: "割当済み"; readonly 名前: メンバー名 };

export const 未割当: 担当者 = { 種別: "未割当" };

export function 割当済み(名前: メンバー名): 担当者 {
  return { 種別: "割当済み", 名前 };
}

export function 担当者をDTO値にする(対象: 担当者): string | null {
  return 対象.種別 === "未割当" ? null : 対象.名前.値;
}

export function 担当者をDTO値から作る(値: string | null): 担当者 {
  return 値 === null ? 未割当 : 割当済み(メンバー名.create(値));
}
