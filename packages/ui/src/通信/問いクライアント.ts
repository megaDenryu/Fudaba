import { 未回答問いDTO一覧か, type 未回答問いDTO } from "./問い型.js";

export class 問いクライアント {
  async 未回答一覧を取得する(): Promise<未回答問いDTO[]> {
    const 応答 = await fetch("/api/fudaba/questions?kind=未回答");
    if (!応答.ok) throw new Error(`未回答の問い一覧取得に失敗しました: HTTP ${応答.status}`);
    const データ: unknown = await 応答.json();
    if (!未回答問いDTO一覧か(データ)) throw new Error("問い一覧のレスポンス形式が不正です");
    return データ;
  }

  async 回答する(id: number, 選択肢ID: string, 回答者: string, メモ: string): Promise<void> {
    const 応答 = await fetch(`/api/fudaba/questions/${encodeURIComponent(String(id))}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 選択肢ID, 回答者, メモ }),
    });
    if (!応答.ok) {
      const 本文: unknown = await 応答.json();
      if (typeof 本文 === "object" && 本文 !== null && "エラー" in 本文 && typeof 本文.エラー === "string") {
        throw new Error(本文.エラー);
      }
      throw new Error(`問いへの回答に失敗しました: HTTP ${応答.status}`);
    }
  }
}
