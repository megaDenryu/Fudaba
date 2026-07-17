// サーバー（@fudaba/core）のAPIレスポンスは外部境界なのでunknownで受けてここで絞る。
// APIの正本は packages/core/src/api/札ルート.ts

export interface 添付DTO {
  readonly 保存名: string;
  readonly ファイル名: string;
  readonly バイト数: number;
  readonly 追加時刻: string;
}

export interface 札DTO {
  readonly id: number;
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 状態: string;
  readonly 担当者: string | null;
  readonly 作成者: string;
  readonly ルーム名: string | null;
  readonly ラベル一覧: readonly string[];
  readonly 添付一覧: readonly 添付DTO[];
  readonly チェック項目一覧: readonly チェック項目DTO[];
  readonly 分解推奨: boolean;
  readonly 作成時刻: string;
  readonly 更新時刻: string;
}

export interface チェック項目DTO {
  readonly id: string;
  readonly 本文: string;
  readonly 完了: boolean;
}

function 文字列配列か(値: unknown): 値 is string[] {
  return Array.isArray(値) && 値.every((項目) => typeof 項目 === "string");
}

function 添付DTOか(値: unknown): 値 is 添付DTO {
  return (
    typeof 値 === "object" &&
    値 !== null &&
    "保存名" in 値 &&
    typeof 値.保存名 === "string" &&
    "ファイル名" in 値 &&
    typeof 値.ファイル名 === "string" &&
    "バイト数" in 値 &&
    typeof 値.バイト数 === "number" &&
    "追加時刻" in 値 &&
    typeof 値.追加時刻 === "string"
  );
}

function 添付DTO配列か(値: unknown): 値 is 添付DTO[] {
  return Array.isArray(値) && 値.every((項目) => 添付DTOか(項目));
}

function チェック項目DTO配列か(値: unknown): 値 is チェック項目DTO[] {
  return Array.isArray(値) && 値.every((項目) =>
    typeof 項目 === "object" && 項目 !== null &&
    "id" in 項目 && typeof 項目.id === "string" &&
    "本文" in 項目 && typeof 項目.本文 === "string" &&
    "完了" in 項目 && typeof 項目.完了 === "boolean",
  );
}

export function 札DTOか(値: unknown): 値 is 札DTO {
  return (
    typeof 値 === "object" &&
    値 !== null &&
    "id" in 値 &&
    typeof 値.id === "number" &&
    "種別" in 値 &&
    typeof 値.種別 === "string" &&
    "タイトル" in 値 &&
    typeof 値.タイトル === "string" &&
    "本文" in 値 &&
    typeof 値.本文 === "string" &&
    "状態" in 値 &&
    typeof 値.状態 === "string" &&
    "担当者" in 値 &&
    (値.担当者 === null || typeof 値.担当者 === "string") &&
    "作成者" in 値 &&
    typeof 値.作成者 === "string" &&
    "ルーム名" in 値 &&
    (値.ルーム名 === null || typeof 値.ルーム名 === "string") &&
    "ラベル一覧" in 値 &&
    文字列配列か(値.ラベル一覧) &&
    "添付一覧" in 値 &&
    添付DTO配列か(値.添付一覧) &&
    "チェック項目一覧" in 値 &&
    チェック項目DTO配列か(値.チェック項目一覧) &&
    "分解推奨" in 値 &&
    typeof 値.分解推奨 === "boolean" &&
    "更新時刻" in 値 &&
    typeof 値.更新時刻 === "string"
  );
}

export function 札DTO一覧か(値: unknown): 値 is 札DTO[] {
  return Array.isArray(値) && 値.every((項目) => 札DTOか(項目));
}

export interface 札作成入力 {
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 担当者: string | undefined;
  readonly 作成者: string;
  readonly ラベル一覧: readonly string[] | undefined;
  readonly チェック項目一覧?: readonly チェック項目DTO[];
}

export interface 札更新入力 {
  readonly 種別: string | undefined;
  readonly タイトル: string | undefined;
  readonly 本文: string | undefined;
  readonly 状態: string | undefined;
  readonly 担当者: string | null | undefined;
  readonly ラベル一覧: readonly string[] | undefined;
  readonly チェック項目一覧?: readonly チェック項目DTO[];
}
