import { 検証エラー } from "./検証エラー.js";

// サーバーが受理する画像・テキストログ形式。
// クライアント申告の拡張子は信用せず、data URLのMIME型から判定して採用する
export const 添付拡張子一覧 = ["png", "jpg", "jpeg", "gif", "webp", "txt", "json"] as const;

export type 添付拡張子値 = (typeof 添付拡張子一覧)[number];

const 拡張子からMIME型: Record<添付拡張子値, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain; charset=utf-8",
  json: "application/json; charset=utf-8",
};

const MIME型から拡張子: Record<string, 添付拡張子値> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "text/plain": "txt",
  "application/json": "json",
};

function 添付拡張子値か(値: string): 値 is 添付拡張子値 {
  return 添付拡張子一覧.some((候補) => 候補 === 値);
}

export class 添付拡張子 {
  private constructor(private readonly 内部値: 添付拡張子値) {}

  static create(値: string): 添付拡張子 {
    const 整形済み = 値.trim().toLowerCase();
    if (!添付拡張子値か(整形済み)) {
      throw new 検証エラー(
        `添付ファイルの拡張子は ${添付拡張子一覧.join(" | ")} のいずれかである必要があります: "${値}"`,
      );
    }
    return new 添付拡張子(整形済み);
  }

  // POSTボディのdata URL（例: "data:image/png;base64,..."）に含まれるMIME型から判定する。
  // クライアントが自己申告する拡張子は使わず、常にこの経路で拡張子を決定する
  static MIME型から作る(mime: string): 添付拡張子 {
    const 基本MIME型 = mime.split(";", 1)[0]?.trim().toLowerCase() ?? "";
    const 拡張子 = MIME型から拡張子[基本MIME型];
    if (拡張子 === undefined) {
      throw new 検証エラー(`対応していない画像形式です: "${mime}"`);
    }
    return new 添付拡張子(拡張子);
  }

  get 値(): 添付拡張子値 {
    return this.内部値;
  }

  get MIME型(): string {
    return 拡張子からMIME型[this.内部値];
  }
}
