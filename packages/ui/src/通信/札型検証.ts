import type { チェック項目DTO, 添付DTO, 札DTO } from "./札型";

function 文字列配列か(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function 添付DTOか(value: unknown): value is 添付DTO {
  return typeof value === "object" && value !== null &&
    "保存名" in value && typeof value.保存名 === "string" &&
    "ファイル名" in value && typeof value.ファイル名 === "string" &&
    "バイト数" in value && typeof value.バイト数 === "number" &&
    "追加時刻" in value && typeof value.追加時刻 === "string";
}

function チェック項目DTOか(value: unknown): value is チェック項目DTO {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "string" &&
    "本文" in value && typeof value.本文 === "string" &&
    "完了" in value && typeof value.完了 === "boolean";
}

export function 札DTOか(value: unknown): value is 札DTO {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" &&
    "種別" in value && typeof value.種別 === "string" &&
    "タイトル" in value && typeof value.タイトル === "string" &&
    "本文" in value && typeof value.本文 === "string" &&
    "状態" in value && typeof value.状態 === "string" &&
    "担当者" in value && (value.担当者 === null || typeof value.担当者 === "string") &&
    "作成者" in value && typeof value.作成者 === "string" &&
    "ルーム名" in value && (value.ルーム名 === null || typeof value.ルーム名 === "string") &&
    "ラベル一覧" in value && 文字列配列か(value.ラベル一覧) &&
    "添付一覧" in value && Array.isArray(value.添付一覧) && value.添付一覧.every(添付DTOか) &&
    "チェック項目一覧" in value && Array.isArray(value.チェック項目一覧) &&
    value.チェック項目一覧.every(チェック項目DTOか) &&
    "分解推奨" in value && typeof value.分解推奨 === "boolean" &&
    "更新時刻" in value && typeof value.更新時刻 === "string";
}

export function 札DTO一覧か(value: unknown): value is 札DTO[] {
  return Array.isArray(value) && value.every(札DTOか);
}
