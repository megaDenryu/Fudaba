// サーバー（@fudaba/core）のAPIレスポンスは外部境界なのでunknownで受けてここで絞る。
// APIの正本は packages/core/src/api/札ルート.ts

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
  readonly 作成時刻: string;
  readonly 更新時刻: string;
}

function 文字列配列か(値: unknown): 値 is string[] {
  return Array.isArray(値) && 値.every((項目) => typeof 項目 === "string");
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
}

export interface 札更新入力 {
  readonly 種別: string | undefined;
  readonly タイトル: string | undefined;
  readonly 本文: string | undefined;
  readonly 状態: string | undefined;
  readonly 担当者: string | null | undefined;
  readonly ラベル一覧: readonly string[] | undefined;
}
