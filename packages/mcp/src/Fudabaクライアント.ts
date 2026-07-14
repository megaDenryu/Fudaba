// Fudaba REST API への薄いfetchラッパー群。Node18+のグローバルfetchを使う。
// API仕様の正本は packages/core/src/api/ 配下の実コード。
// AgentRoomクライアント（Jimbo/packages/mcp-tools/src/tools/AgentRoom/）と同型のパターンを踏襲する

export type Fudaba応答 =
  | { readonly 種別: "成功"; readonly データ: unknown }
  | { readonly 種別: "失敗"; readonly 理由: string };

async function リクエストする(url: string, init?: RequestInit): Promise<Fudaba応答> {
  try {
    const 応答 = await fetch(url, init);
    const 本文テキスト = await 応答.text();
    const データ: unknown = 本文テキスト.length > 0 ? JSON.parse(本文テキスト) : null;
    if (!応答.ok) {
      return { 種別: "失敗", 理由: `HTTPステータス ${応答.status}: ${本文テキスト}` };
    }
    return { 種別: "成功", データ };
  } catch (エラー) {
    return { 種別: "失敗", 理由: エラー instanceof Error ? エラー.message : String(エラー) };
  }
}

const JSONヘッダー = { "Content-Type": "application/json" };

export interface 札作成リクエスト {
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 作成者: string;
  readonly 担当者?: string;
  readonly ルーム名?: string;
}

export function 札を作成する(baseUrl: string, 内容: 札作成リクエスト): Promise<Fudaba応答> {
  const url = `${baseUrl}/api/fudaba/items`;
  return リクエストする(url, {
    method: "POST",
    headers: JSONヘッダー,
    body: JSON.stringify(内容),
  });
}

export interface 札更新リクエスト {
  readonly 種別?: string;
  readonly タイトル?: string;
  readonly 本文?: string;
  readonly 状態?: string;
  readonly 担当者?: string | null;
}

export function 札を更新する(
  baseUrl: string,
  id: number,
  変更: 札更新リクエスト,
): Promise<Fudaba応答> {
  const url = `${baseUrl}/api/fudaba/items/${encodeURIComponent(String(id))}`;
  return リクエストする(url, {
    method: "PATCH",
    headers: JSONヘッダー,
    body: JSON.stringify(変更),
  });
}

export function 札一覧を取得する(baseUrl: string): Promise<Fudaba応答> {
  const url = `${baseUrl}/api/fudaba/items`;
  return リクエストする(url);
}
