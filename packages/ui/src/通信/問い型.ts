export interface 問い選択肢DTO {
  readonly id: string;
  readonly ラベル: string;
  readonly ショートカット: string | null;
}

interface 問い添付DTO {
  readonly 保存名: string;
  readonly ファイル名: string;
  readonly バイト数: number;
  readonly 追加時刻: string;
}

interface 問い共通DTO {
  readonly id: number;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 選択肢一覧: readonly 問い選択肢DTO[];
  readonly 関連札ID: number | null;
  readonly ルーム名: string | null;
  readonly 作成者: string;
  readonly 作成時刻: string;
  readonly 添付一覧: readonly 問い添付DTO[];
}

export interface 未回答問いDTO extends 問い共通DTO {
  readonly kind: "未回答";
}

export interface 回答済み問いDTO extends 問い共通DTO {
  readonly kind: "回答済み";
  readonly 回答: {
    readonly 連番: number;
    readonly 選択肢ID: string;
    readonly 回答者: string;
    readonly メモ: string;
    readonly 回答時刻: string;
  };
}

export type 問いDTO = 未回答問いDTO | 回答済み問いDTO;

function 選択肢DTOか(値: unknown): 値 is 問い選択肢DTO {
  return typeof 値 === "object" && 値 !== null &&
    "id" in 値 && typeof 値.id === "string" &&
    "ラベル" in 値 && typeof 値.ラベル === "string" &&
    "ショートカット" in 値 && (値.ショートカット === null || typeof 値.ショートカット === "string");
}

function 問い共通DTOか(値: object): 値 is object & 問い共通DTO {
  return "id" in 値 && typeof 値.id === "number" &&
    "タイトル" in 値 && typeof 値.タイトル === "string" &&
    "本文" in 値 && typeof 値.本文 === "string" &&
    "選択肢一覧" in 値 && Array.isArray(値.選択肢一覧) && 値.選択肢一覧.every(選択肢DTOか) &&
    "関連札ID" in 値 && (値.関連札ID === null || typeof 値.関連札ID === "number") &&
    "ルーム名" in 値 && (値.ルーム名 === null || typeof 値.ルーム名 === "string") &&
    "作成者" in 値 && typeof 値.作成者 === "string" &&
    "作成時刻" in 値 && typeof 値.作成時刻 === "string" &&
    "添付一覧" in 値 && Array.isArray(値.添付一覧) && 値.添付一覧.every((添付: unknown) =>
      typeof 添付 === "object" && 添付 !== null &&
      "保存名" in 添付 && typeof 添付.保存名 === "string" &&
      "ファイル名" in 添付 && typeof 添付.ファイル名 === "string" &&
      "バイト数" in 添付 && typeof 添付.バイト数 === "number" &&
      "追加時刻" in 添付 && typeof 添付.追加時刻 === "string",
    );
}

export function 未回答問いDTOか(値: unknown): 値 is 未回答問いDTO {
  return typeof 値 === "object" && 値 !== null && 問い共通DTOか(値) &&
    "kind" in 値 && 値.kind === "未回答";
}

export function 未回答問いDTO一覧か(値: unknown): 値 is 未回答問いDTO[] {
  return Array.isArray(値) && 値.every(未回答問いDTOか);
}
