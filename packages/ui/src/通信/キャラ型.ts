// AgentRoomのキャラAPIレスポンスは外部境界なのでunknownで受けてここで絞る。
// DTOの正本は AgentRoom: packages/server/src/domain/キャラ.ts の キャラDTO

export interface キャラDTO {
  readonly 名前: string;
  readonly 種別: string;
  readonly プロンプト: string;
  readonly アイコンdataUrl: string;
  readonly 行動パターンメモ: string;
  readonly 作成者: string;
  readonly 作成時刻: string;
  readonly 更新時刻: string;
}

export function キャラDTOか(値: unknown): 値 is キャラDTO {
  return (
    typeof 値 === "object" &&
    値 !== null &&
    "名前" in 値 &&
    typeof 値.名前 === "string" &&
    "種別" in 値 &&
    typeof 値.種別 === "string" &&
    "プロンプト" in 値 &&
    typeof 値.プロンプト === "string" &&
    "アイコンdataUrl" in 値 &&
    typeof 値.アイコンdataUrl === "string" &&
    "行動パターンメモ" in 値 &&
    typeof 値.行動パターンメモ === "string" &&
    "作成者" in 値 &&
    typeof 値.作成者 === "string" &&
    "作成時刻" in 値 &&
    typeof 値.作成時刻 === "string" &&
    "更新時刻" in 値 &&
    typeof 値.更新時刻 === "string"
  );
}

export function キャラDTO一覧か(値: unknown): 値 is キャラDTO[] {
  return Array.isArray(値) && 値.every((項目) => キャラDTOか(項目));
}
