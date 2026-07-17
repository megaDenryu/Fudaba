import type { FastifyInstance } from "fastify";
import { 検証エラー } from "../domain/検証エラー.js";
import { 札ID } from "../domain/札ID.js";
import { 札未検出エラー } from "../domain/札未検出エラー.js";
import type { 札ストア } from "../infra/札ストア.js";
import { 検証エラーを応答に写像する } from "./エラー応答.js";
import { IDパラメータを読む } from "./リクエスト検証.js";

interface 札パス { readonly id: string }

function 札の存在を保証する(ストア: 札ストア, id: number): void {
  if (ストア.IDで取得する(札ID.create(id)) === null) throw new 札未検出エラー(id);
}

export function Fudaba札協働ルートを登録する(app: FastifyInstance, ストア: 札ストア): void {
  app.get<{ Params: 札パス }>("/api/fudaba/items/:id/comments", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const id = IDパラメータを読む(request.params.id);
      札の存在を保証する(ストア, id);
      return ストア.コメント一覧を取得する(id);
    }),
  );

  app.post<{ Params: 札パス }>("/api/fudaba/items/:id/comments", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const id = IDパラメータを読む(request.params.id);
      札の存在を保証する(ストア, id);
      const ボディ: unknown = request.body;
      if (
        typeof ボディ !== "object" || ボディ === null ||
        !("作成者" in ボディ) || typeof ボディ.作成者 !== "string" ||
        !("本文" in ボディ) || typeof ボディ.本文 !== "string"
      ) throw new 検証エラー("コメントは{作成者, 本文}形式である必要があります");
      return reply.code(201).send(ストア.コメントを追加する(id, ボディ.作成者, ボディ.本文));
    }),
  );

  app.get<{ Querystring: { itemId?: string } }>("/api/fudaba/item-links", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const itemId = request.query.itemId === undefined ? undefined : IDパラメータを読む(request.query.itemId);
      return ストア.札関係リンク一覧を取得する(itemId);
    }),
  );

  app.post("/api/fudaba/item-links", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const ボディ: unknown = request.body;
      if (
        typeof ボディ !== "object" || ボディ === null ||
        !("元札ID" in ボディ) || typeof ボディ.元札ID !== "number" ||
        !("先札ID" in ボディ) || typeof ボディ.先札ID !== "number" ||
        !("種別" in ボディ) || !(ボディ.種別 === "親子" || ボディ.種別 === "依存") ||
        !("作成者" in ボディ) || typeof ボディ.作成者 !== "string"
      ) throw new 検証エラー("札リンクは{元札ID, 先札ID, 種別: 親子|依存, 作成者}形式である必要があります");
      const 元札ID = 札ID.create(ボディ.元札ID).値;
      const 先札ID = 札ID.create(ボディ.先札ID).値;
      札の存在を保証する(ストア, 元札ID);
      札の存在を保証する(ストア, 先札ID);
      return reply.code(201).send(
        ストア.札関係リンクを追加する(元札ID, 先札ID, ボディ.種別, ボディ.作成者),
      );
    }),
  );
}
