// AgentRoomの稼働表明APIレスポンスは外部境界なのでunknownで受けてここで絞る。
// DTOの正本は AgentRoom: packages/server/src/domain/稼働表明.ts の 稼働表明DTO。
// 状態は表示状態列挙(稼働中|待機中|不明 等)がサーバー側で増える可能性があるため、
// ここでは文字列であることだけを検証し、厳密なリテラル一致は淀み判定側に任せる

export interface 稼働表明DTO {
  readonly 名前: string;
  readonly 状態: string;
  readonly 現在の作業: string | null;
  readonly 札ID: number | null;
  readonly 更新時刻: string;
}

export function 稼働表明DTOか(値: unknown): 値 is 稼働表明DTO {
  return (
    typeof 値 === "object" &&
    値 !== null &&
    "名前" in 値 &&
    typeof 値.名前 === "string" &&
    "状態" in 値 &&
    typeof 値.状態 === "string" &&
    "現在の作業" in 値 &&
    (値.現在の作業 === null || typeof 値.現在の作業 === "string") &&
    "札ID" in 値 &&
    (値.札ID === null || typeof 値.札ID === "number") &&
    "更新時刻" in 値 &&
    typeof 値.更新時刻 === "string"
  );
}

export function 稼働表明DTO一覧か(値: unknown): 値 is 稼働表明DTO[] {
  return Array.isArray(値) && 値.every((項目) => 稼働表明DTOか(項目));
}
