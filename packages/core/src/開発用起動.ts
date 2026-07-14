import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import { Fudabaルートを登録する } from "./api/札ルート.js";
import { 検証エラー } from "./domain/検証エラー.js";
import { 札未検出エラー } from "./domain/札未検出エラー.js";
import { 札ストア } from "./infra/札ストア.js";

export interface Fudaba開発用サーバー設定 {
  readonly ポート: number;
  readonly DBパス: string;
}

export type Fudaba開発用サーバー起動結果 =
  | { readonly 種別: "成功"; readonly app: FastifyInstance }
  | { readonly 種別: "失敗"; readonly 原因: string };

// 動作確認ハーネス専用のコンポジションルート。本番では自前ポートを持たない
// Fudaba（DESIGN.md参照）だが、UIをブラウザで実表示して検証するために
// このファイルだけは例外的にFastifyの起動・エラーハンドラを自前で持つ
export async function Fudaba開発用サーバーを起動する(
  設定: Fudaba開発用サーバー設定,
): Promise<Fudaba開発用サーバー起動結果> {
  try {
    if (設定.DBパス !== ":memory:" && !existsSync(path.dirname(設定.DBパス))) {
      mkdirSync(path.dirname(設定.DBパス), { recursive: true });
    }
    const ストア =
      設定.DBパス === ":memory:" ? 札ストア.メモリ上に作る() : 札ストア.ファイルから開く(設定.DBパス);

    const app = Fastify({ logger: true });
    app.get("/api/health", async () => ({ ok: true, service: "fudaba" }));
    Fudabaルートを登録する(app, { ストア });

    app.setErrorHandler((error, _request, reply) => {
      if (error instanceof 札未検出エラー) {
        return reply.code(404).send({ エラー: error.message });
      }
      if (error instanceof 検証エラー) {
        return reply.code(400).send({ エラー: error.message });
      }
      return reply.send(error);
    });

    await app.listen({ port: 設定.ポート, host: "0.0.0.0" });
    return { 種別: "成功", app };
  } catch (error) {
    return { 種別: "失敗", 原因: error instanceof Error ? error.message : String(error) };
  }
}
