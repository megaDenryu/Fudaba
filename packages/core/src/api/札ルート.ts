import type { FastifyInstance } from "fastify";
import { メンバー名 } from "../domain/メンバー名.js";
import { 札ID } from "../domain/札ID.js";
import { 札種別 } from "../domain/札種別.js";
import { 割当済み, 未割当 } from "../domain/担当者.js";
import { 未リンク, ルームにリンクする } from "../domain/札リンク.js";
import { 札未検出エラー } from "../domain/札未検出エラー.js";
import type { 添付ストレージ } from "../infra/添付ストレージ.js";
import type { 札ストア } from "../infra/札ストア.js";
import { Fudaba添付ルートを登録する } from "./添付ルート.js";
import { 検証エラーを応答に写像する } from "./エラー応答.js";
import {
  作成内容に絞る,
  IDパラメータを読む,
  一覧クエリからラベルフィルタを読む,
  変更内容に絞る,
} from "./リクエスト検証.js";
import type { 札パス } from "./ルートパス型.js";

// Fudabaの3点セットのうち「サーバールート登録関数」。ホスト（ワークスペースサーバー）の
// Fastifyインスタンスへルートを間借りするだけで、自前のポート・エラーハンドラは持たない
// （参照: DESIGN.md「提供する3点セット」、Jimbo/ARCHITECTURE.md「住民の実装形態」）
export function Fudabaルートを登録する(
  app: FastifyInstance,
  依存: { ストア: 札ストア; 添付ストレージ: 添付ストレージ },
): void {
  const { ストア } = 依存;

  app.get("/api/fudaba/items", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const ラベル一覧 = 一覧クエリからラベルフィルタを読む(request.query);
      return ストア.一覧を取得する({ ラベル一覧 }).map((札) => 札.toJSON());
    }),
  );

  app.post("/api/fudaba/items", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const 内容 = 作成内容に絞る(request.body);
      const 札 = ストア.追加する({
        種別: 札種別.create(内容.種別),
        タイトル: 内容.タイトル,
        本文: 内容.本文,
        担当者: 内容.担当者 === undefined ? 未割当 : 割当済み(メンバー名.create(内容.担当者)),
        作成者: メンバー名.create(内容.作成者),
        リンク: 内容.ルーム名 === undefined ? 未リンク : ルームにリンクする(内容.ルーム名),
        ラベル一覧: 内容.ラベル一覧,
      });
      return reply.code(201).send(札.toJSON());
    }),
  );

  app.patch<{ Params: 札パス }>("/api/fudaba/items/:id", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const id = 札ID.create(IDパラメータを読む(request.params.id));
      const 変更 = 変更内容に絞る(request.body);
      const 更新後 = ストア.更新する(id, 変更);
      if (更新後 === null) {
        throw new 札未検出エラー(id.値);
      }
      return 更新後.toJSON();
    }),
  );

  Fudaba添付ルートを登録する(app, 依存);
}
