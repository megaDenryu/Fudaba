import { 検証エラー } from "../domain/検証エラー.js";
import { 札状態 } from "../domain/札状態.js";
import { type 担当者, 割当済み, 未割当 } from "../domain/担当者.js";
import { メンバー名 } from "../domain/メンバー名.js";
import { type 札変更内容 } from "../domain/札.js";

// 各エンドポイントのリクエストボディ・パラメータは外部境界なのでunknownで受けてここで絞る

export interface 札作成内容 {
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 担当者: string | undefined;
  readonly 作成者: string;
  readonly ルーム名: string | undefined;
}

export function 作成内容に絞る(ボディ: unknown): 札作成内容 {
  if (
    typeof ボディ === "object" &&
    ボディ !== null &&
    "種別" in ボディ &&
    typeof ボディ.種別 === "string" &&
    "タイトル" in ボディ &&
    typeof ボディ.タイトル === "string" &&
    "本文" in ボディ &&
    typeof ボディ.本文 === "string" &&
    "作成者" in ボディ &&
    typeof ボディ.作成者 === "string"
  ) {
    const 担当者 =
      "担当者" in ボディ && typeof ボディ.担当者 === "string" ? ボディ.担当者 : undefined;
    const ルーム名 =
      "ルーム名" in ボディ && typeof ボディ.ルーム名 === "string" ? ボディ.ルーム名 : undefined;
    return {
      種別: ボディ.種別,
      タイトル: ボディ.タイトル,
      本文: ボディ.本文,
      担当者,
      作成者: ボディ.作成者,
      ルーム名,
    };
  }
  throw new 検証エラー(
    'ボディは { "種別": string, "タイトル": string, "本文": string, "作成者": string, "担当者"?: string, "ルーム名"?: string } である必要があります',
  );
}

// 担当者フィールドは「省略=変更なし」「null=明示的な未割当への変更」「string=割当済みへの変更」の
// 3値を区別する必要があるため、専用の型ガードで判定する
function 担当者変更を読む(ボディ: object): 担当者 | undefined {
  if (!("担当者" in ボディ)) return undefined;
  const 値 = ボディ.担当者;
  if (値 === null) return 未割当;
  if (typeof 値 === "string") return 割当済み(メンバー名.create(値));
  throw new 検証エラー('"担当者" はstringまたはnullである必要があります');
}

export function 変更内容に絞る(ボディ: unknown): 札変更内容 {
  if (typeof ボディ !== "object" || ボディ === null) {
    throw new 検証エラー("ボディはオブジェクトである必要があります");
  }
  const タイトル =
    "タイトル" in ボディ && typeof ボディ.タイトル === "string" ? ボディ.タイトル : undefined;
  if ("タイトル" in ボディ && typeof ボディ.タイトル !== "string") {
    throw new 検証エラー('"タイトル" はstringである必要があります');
  }
  const 本文 = "本文" in ボディ && typeof ボディ.本文 === "string" ? ボディ.本文 : undefined;
  if ("本文" in ボディ && typeof ボディ.本文 !== "string") {
    throw new 検証エラー('"本文" はstringである必要があります');
  }
  let 状態: 札状態 | undefined;
  if ("状態" in ボディ) {
    if (typeof ボディ.状態 !== "string") {
      throw new 検証エラー('"状態" はstringである必要があります');
    }
    状態 = 札状態.create(ボディ.状態);
  }
  const 担当者 = 担当者変更を読む(ボディ);
  return { タイトル, 本文, 状態, 担当者 };
}

export function IDパラメータを読む(値: string): number {
  const 数値 = Number(値);
  if (!Number.isInteger(数値) || 数値 <= 0) {
    throw new 検証エラー(`札IDは正の整数である必要があります: "${値}"`);
  }
  return 数値;
}
