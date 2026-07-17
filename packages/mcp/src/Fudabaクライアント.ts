// Fudaba REST API への薄いfetchラッパー群。Node18+のグローバルfetchを使う。
// API仕様の正本は packages/core/src/api/ 配下の実コード。
// AgentRoomクライアント（Jimbo/packages/mcp-tools/src/tools/AgentRoom/）と同型のパターンを踏襲する

export type Fudaba応答 =
  | { readonly 種別: "成功"; readonly データ: unknown }
  | { readonly 種別: "失敗"; readonly 理由: string };

export type Fudabaバイナリ応答 =
  | { readonly 種別: "成功"; readonly データ: Uint8Array; readonly MIME型: string }
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

async function バイナリを取得する(url: string): Promise<Fudabaバイナリ応答> {
  try {
    const 応答 = await fetch(url);
    if (!応答.ok) {
      return { 種別: "失敗", 理由: `HTTPステータス ${応答.status}: ${await 応答.text()}` };
    }
    const MIME型 = 応答.headers.get("content-type");
    if (MIME型 === null) {
      return { 種別: "失敗", 理由: "添付応答にContent-Typeがありません" };
    }
    return { 種別: "成功", データ: new Uint8Array(await 応答.arrayBuffer()), MIME型 };
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
  readonly ラベル一覧?: readonly string[];
  readonly チェック項目一覧?: readonly チェック項目リクエスト[];
}

export interface チェック項目リクエスト {
  readonly id: string;
  readonly 本文: string;
  readonly 完了: boolean;
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
  readonly ラベル一覧?: readonly string[];
  readonly チェック項目一覧?: readonly チェック項目リクエスト[];
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

export function 札一覧を取得する(baseUrl: string, キーワード?: string): Promise<Fudaba応答> {
  const query = キーワード === undefined ? "" : `?キーワード=${encodeURIComponent(キーワード)}`;
  const url = `${baseUrl}/api/fudaba/items${query}`;
  return リクエストする(url);
}

export function 添付を追加する(
  baseUrl: string,
  id: number,
  ファイル名: string,
  MIME型: string,
  base64データ: string,
): Promise<Fudaba応答> {
  const url = `${baseUrl}/api/fudaba/items/${encodeURIComponent(String(id))}/attachments`;
  return リクエストする(url, {
    method: "POST",
    headers: JSONヘッダー,
    body: JSON.stringify({ ファイル名, データURL: `data:${MIME型};base64,${base64データ}` }),
  });
}

export function 問い添付を追加する(
  baseUrl: string,
  id: number,
  ファイル名: string,
  MIME型: string,
  base64データ: string,
): Promise<Fudaba応答> {
  const url = `${baseUrl}/api/fudaba/questions/${encodeURIComponent(String(id))}/attachments`;
  return リクエストする(url, {
    method: "POST",
    headers: JSONヘッダー,
    body: JSON.stringify({ ファイル名, データURL: `data:${MIME型};base64,${base64データ}` }),
  });
}

export function 添付を取得する(baseUrl: string, 保存名: string): Promise<Fudabaバイナリ応答> {
  const url = `${baseUrl}/api/fudaba/attachments/${encodeURIComponent(保存名)}`;
  return バイナリを取得する(url);
}

export interface 問い選択肢リクエスト {
  readonly id: string;
  readonly ラベル: string;
  readonly ショートカット?: string;
}

export interface 問い作成リクエスト {
  readonly タイトル: string;
  readonly 本文: string;
  readonly 作成者: string;
  readonly 選択肢一覧?: readonly 問い選択肢リクエスト[];
  readonly 関連札ID?: number;
  readonly ルーム名?: string;
}

export function 問いを作成する(baseUrl: string, 内容: 問い作成リクエスト): Promise<Fudaba応答> {
  return リクエストする(`${baseUrl}/api/fudaba/questions`, {
    method: "POST",
    headers: JSONヘッダー,
    body: JSON.stringify(内容),
  });
}

export function 問い一覧を取得する(baseUrl: string, kind?: "未回答" | "回答済み"): Promise<Fudaba応答> {
  const query = kind === undefined ? "" : `?kind=${encodeURIComponent(kind)}`;
  return リクエストする(`${baseUrl}/api/fudaba/questions${query}`);
}

export function 問いを取得する(baseUrl: string, id: number): Promise<Fudaba応答> {
  return リクエストする(`${baseUrl}/api/fudaba/questions/${encodeURIComponent(String(id))}`);
}

export function 問いの回答を待つ(
  baseUrl: string,
  基準連番: number,
  timeoutSeconds: number,
  問いID一覧: readonly number[],
): Promise<Fudaba応答> {
  const params = new URLSearchParams({
    after: String(基準連番),
    timeoutMs: String(timeoutSeconds * 1000),
  });
  for (const id of 問いID一覧) params.append("questionId", String(id));
  return リクエストする(`${baseUrl}/api/fudaba/questions/answers/wait?${params.toString()}`);
}

export function コメントを追加する(baseUrl: string, id: number, 作成者: string, 本文: string): Promise<Fudaba応答> {
  return リクエストする(`${baseUrl}/api/fudaba/items/${encodeURIComponent(String(id))}/comments`, {
    method: "POST", headers: JSONヘッダー, body: JSON.stringify({ 作成者, 本文 }),
  });
}

export function コメント一覧を取得する(baseUrl: string, id: number): Promise<Fudaba応答> {
  return リクエストする(`${baseUrl}/api/fudaba/items/${encodeURIComponent(String(id))}/comments`);
}

export function 札関係リンクを追加する(
  baseUrl: string,
  元札ID: number,
  先札ID: number,
  種別: "親子" | "依存",
  作成者: string,
): Promise<Fudaba応答> {
  return リクエストする(`${baseUrl}/api/fudaba/item-links`, {
    method: "POST", headers: JSONヘッダー, body: JSON.stringify({ 元札ID, 先札ID, 種別, 作成者 }),
  });
}

export function 札関係リンク一覧を取得する(baseUrl: string, 札ID?: number): Promise<Fudaba応答> {
  const query = 札ID === undefined ? "" : `?itemId=${encodeURIComponent(String(札ID))}`;
  return リクエストする(`${baseUrl}/api/fudaba/item-links${query}`);
}
