import { 問い選択肢 } from "../domain/問い.js";
import { 検証エラー } from "../domain/検証エラー.js";

function 正の整数か(値: unknown): 値 is number {
  return typeof 値 === "number" && Number.isInteger(値) && 値 > 0;
}

export interface 問い作成内容 {
  readonly タイトル: string;
  readonly 本文: string;
  readonly 選択肢一覧: readonly 問い選択肢[];
  readonly 関連札ID: number | null;
  readonly ルーム名: string | null;
  readonly 作成者: string;
}

const 既定選択肢一覧 = [
  問い選択肢.create({ id: "yes", ラベル: "はい", ショートカット: "y" }),
  問い選択肢.create({ id: "no", ラベル: "いいえ", ショートカット: "n" }),
  問い選択肢.create({ id: "hold", ラベル: "保留", ショートカット: "s" }),
];

function 選択肢一覧を読む(値: unknown): readonly 問い選択肢[] {
  if (値 === undefined) return 既定選択肢一覧;
  if (!Array.isArray(値)) throw new 検証エラー("選択肢一覧は配列である必要があります");
  return 値.map((項目: unknown) => {
    if (
      typeof 項目 !== "object" || 項目 === null ||
      !("id" in 項目) || typeof 項目.id !== "string" ||
      !("ラベル" in 項目) || typeof 項目.ラベル !== "string"
    ) throw new 検証エラー("選択肢は{id, ラベル, ショートカット?}形式である必要があります");
    const ショートカット: unknown = "ショートカット" in 項目 ? 項目.ショートカット : undefined;
    if (ショートカット !== undefined && typeof ショートカット !== "string") {
      throw new 検証エラー("選択肢のショートカットはstringである必要があります");
    }
    return 問い選択肢.create({
      id: 項目.id,
      ラベル: 項目.ラベル,
      ...(typeof ショートカット === "string" ? { ショートカット } : {}),
    });
  });
}

export function 問い作成内容に絞る(ボディ: unknown): 問い作成内容 {
  if (
    typeof ボディ !== "object" || ボディ === null ||
    !("タイトル" in ボディ) || typeof ボディ.タイトル !== "string" ||
    !("本文" in ボディ) || typeof ボディ.本文 !== "string" ||
    !("作成者" in ボディ) || typeof ボディ.作成者 !== "string"
  ) throw new 検証エラー("問いは{タイトル, 本文, 作成者, 選択肢一覧?, 関連札ID?, ルーム名?}形式である必要があります");
  if ("関連札ID" in ボディ && ボディ.関連札ID !== null && !正の整数か(ボディ.関連札ID)) {
    throw new 検証エラー("関連札IDは正の整数またはnullである必要があります");
  }
  if ("ルーム名" in ボディ && ボディ.ルーム名 !== null && typeof ボディ.ルーム名 !== "string") {
    throw new 検証エラー("ルーム名はstringまたはnullである必要があります");
  }
  return {
    タイトル: ボディ.タイトル,
    本文: ボディ.本文,
    選択肢一覧: 選択肢一覧を読む("選択肢一覧" in ボディ ? ボディ.選択肢一覧 : undefined),
    関連札ID: "関連札ID" in ボディ && 正の整数か(ボディ.関連札ID) ? ボディ.関連札ID : null,
    ルーム名: "ルーム名" in ボディ && typeof ボディ.ルーム名 === "string" ? ボディ.ルーム名 : null,
    作成者: ボディ.作成者,
  };
}

export interface 回答内容 {
  readonly 選択肢ID: string;
  readonly 回答者: string;
  readonly メモ: string;
}

export function 回答内容に絞る(ボディ: unknown): 回答内容 {
  if (
    typeof ボディ !== "object" || ボディ === null ||
    !("選択肢ID" in ボディ) || typeof ボディ.選択肢ID !== "string" ||
    !("回答者" in ボディ) || typeof ボディ.回答者 !== "string"
  ) throw new 検証エラー("回答は{選択肢ID, 回答者, メモ?}形式である必要があります");
  if ("メモ" in ボディ && typeof ボディ.メモ !== "string") {
    throw new 検証エラー("回答メモはstringである必要があります");
  }
  return {
    選択肢ID: ボディ.選択肢ID,
    回答者: ボディ.回答者,
    メモ: "メモ" in ボディ && typeof ボディ.メモ === "string" ? ボディ.メモ : "",
  };
}

export function 非負整数クエリを読む(値: string | undefined, 既定値: number): number {
  if (値 === undefined) return 既定値;
  const 数値 = Number(値);
  if (!Number.isInteger(数値) || 数値 < 0) throw new 検証エラー(`非負整数が必要です: ${値}`);
  return 数値;
}

export function 問いIDクエリを読む(値: string | string[] | undefined): readonly number[] {
  if (値 === undefined) return [];
  const 一覧 = Array.isArray(値) ? 値 : [値];
  return 一覧.map((項目) => {
    const 数値 = Number(項目);
    if (!Number.isInteger(数値) || 数値 <= 0) throw new 検証エラー(`問いIDは正の整数である必要があります: ${項目}`);
    return 数値;
  });
}
