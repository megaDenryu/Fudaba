export interface 札コメントDTO {
  readonly id: number;
  readonly 札ID: number;
  readonly 作成者: string;
  readonly 本文: string;
  readonly 作成時刻: string;
}

export interface 札関係リンクDTO {
  readonly id: number;
  readonly 元札ID: number;
  readonly 先札ID: number;
  readonly 種別: "親子" | "依存";
  readonly 作成者: string;
  readonly 作成時刻: string;
}

function コメントDTOか(値: unknown): 値 is 札コメントDTO {
  return typeof 値 === "object" && 値 !== null &&
    "id" in 値 && typeof 値.id === "number" && "札ID" in 値 && typeof 値.札ID === "number" &&
    "作成者" in 値 && typeof 値.作成者 === "string" && "本文" in 値 && typeof 値.本文 === "string" &&
    "作成時刻" in 値 && typeof 値.作成時刻 === "string";
}

function リンクDTOか(値: unknown): 値 is 札関係リンクDTO {
  return typeof 値 === "object" && 値 !== null &&
    "id" in 値 && typeof 値.id === "number" && "元札ID" in 値 && typeof 値.元札ID === "number" &&
    "先札ID" in 値 && typeof 値.先札ID === "number" && "種別" in 値 && (値.種別 === "親子" || 値.種別 === "依存") &&
    "作成者" in 値 && typeof 値.作成者 === "string" && "作成時刻" in 値 && typeof 値.作成時刻 === "string";
}

export class 札協働クライアント {
  async コメント一覧を取得する(id: number): Promise<札コメントDTO[]> {
    const 応答 = await fetch(`/api/fudaba/items/${encodeURIComponent(String(id))}/comments`);
    if (!応答.ok) throw new Error(`コメント一覧取得に失敗しました: HTTP ${応答.status}`);
    const データ: unknown = await 応答.json();
    if (!Array.isArray(データ) || !データ.every(コメントDTOか)) throw new Error("コメント一覧の形式が不正です");
    return データ;
  }

  async コメントを追加する(id: number, 作成者: string, 本文: string): Promise<void> {
    const 応答 = await fetch(`/api/fudaba/items/${encodeURIComponent(String(id))}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ 作成者, 本文 }),
    });
    if (!応答.ok) throw new Error(`コメント追加に失敗しました: HTTP ${応答.status}`);
  }

  async リンク一覧を取得する(id: number): Promise<札関係リンクDTO[]> {
    const 応答 = await fetch(`/api/fudaba/item-links?itemId=${encodeURIComponent(String(id))}`);
    if (!応答.ok) throw new Error(`札関係リンク取得に失敗しました: HTTP ${応答.status}`);
    const データ: unknown = await 応答.json();
    if (!Array.isArray(データ) || !データ.every(リンクDTOか)) throw new Error("札関係リンク一覧の形式が不正です");
    return データ;
  }
}
