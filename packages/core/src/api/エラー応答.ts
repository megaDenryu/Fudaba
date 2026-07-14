import type { FastifyReply } from "fastify";
import { 検証エラー } from "../domain/検証エラー.js";
import { 札未検出エラー } from "../domain/札未検出エラー.js";

// Fudabaはホストのapp.setErrorHandlerを間借りするだけで上書きしてはならない
// （複数住民が同じappに相乗りするため、グローバルハンドラの奪い合いを避ける）。
// そのため各ルートハンドラ内でこの関数を通し、Fudaba固有の型付き例外だけを
// ここでHTTPステータスに写像する。それ以外の例外は再送出しFastify既定の500に委ねる
export async function 検証エラーを応答に写像する(
  reply: FastifyReply,
  処理: () => Promise<unknown> | unknown,
): Promise<unknown> {
  try {
    return await 処理();
  } catch (エラー) {
    if (エラー instanceof 札未検出エラー) {
      return reply.code(404).send({ エラー: エラー.message });
    }
    if (エラー instanceof 検証エラー) {
      return reply.code(400).send({ エラー: エラー.message });
    }
    throw エラー;
  }
}
