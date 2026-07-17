import type { FastifyInstance } from "fastify";
import { 問いID } from "../domain/問いID.js";
import { 問い未検出エラー } from "../domain/問い未検出エラー.js";
import { 検証エラー } from "../domain/検証エラー.js";
import type { 札ストア } from "../infra/札ストア.js";
import type { 添付ストレージ } from "../infra/添付ストレージ.js";
import { 添付, 添付リクエストボディ上限バイト数 } from "../domain/添付.js";
import { 検証エラーを応答に写像する } from "./エラー応答.js";
import { IDパラメータを読む, 添付追加内容に絞る } from "./リクエスト検証.js";
import {
  回答内容に絞る,
  問いIDクエリを読む,
  問い作成内容に絞る,
  非負整数クエリを読む,
} from "./問いリクエスト検証.js";

interface 問いパス { readonly id: string }
const 待機タイムアウト既定ミリ秒 = 50_000;
const 待機タイムアウト上限ミリ秒 = 120_000;

async function 回答を待つ(
  ストア: 札ストア,
  基準連番: number,
  問いID一覧: readonly number[],
  タイムアウトミリ秒: number,
): Promise<unknown> {
  const 終了時刻 = Date.now() + タイムアウトミリ秒;
  while (true) {
    const 回答一覧 = ストア.回答イベントを取得する(基準連番, 問いID一覧);
    if (回答一覧.length > 0) return { 種別: "新着あり", 回答一覧 };
    const 残り = 終了時刻 - Date.now();
    if (残り <= 0) return { 種別: "タイムアウト", 基準連番 };
    await new Promise((resolve) => setTimeout(resolve, Math.min(100, 残り)));
  }
}

export function Fudaba問いルートを登録する(
  app: FastifyInstance,
  依存: { ストア: 札ストア; 添付ストレージ: 添付ストレージ },
): void {
  const { ストア, 添付ストレージ } = 依存;
  app.get<{
    Querystring: { after?: string; timeoutMs?: string; questionId?: string | string[] };
  }>("/api/fudaba/questions/answers/wait", async (request, reply) =>
    検証エラーを応答に写像する(reply, async () => {
      const 基準連番 = 非負整数クエリを読む(request.query.after, 0);
      const タイムアウトミリ秒 = Math.min(
        非負整数クエリを読む(request.query.timeoutMs, 待機タイムアウト既定ミリ秒),
        待機タイムアウト上限ミリ秒,
      );
      const 問いID一覧 = 問いIDクエリを読む(request.query.questionId);
      return 回答を待つ(ストア, 基準連番, 問いID一覧, タイムアウトミリ秒);
    }),
  );

  app.get<{ Querystring: { kind?: string } }>("/api/fudaba/questions", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const kind = request.query.kind;
      if (kind !== undefined && kind !== "未回答" && kind !== "回答済み") {
        throw new 検証エラー(`問いkindが不正です: ${kind}`);
      }
      return ストア.問い一覧を取得する(kind).map((問い) => 問い.toJSON());
    }),
  );

  app.post("/api/fudaba/questions", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const 内容 = 問い作成内容に絞る(request.body);
      return reply.code(201).send(ストア.問いを追加する(内容).toJSON());
    }),
  );

  app.get<{ Params: 問いパス }>("/api/fudaba/questions/:id", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const id = 問いID.create(IDパラメータを読む(request.params.id));
      const 問い = ストア.問いをIDで取得する(id);
      if (問い === null) throw new 問い未検出エラー(id.値);
      return 問い.toJSON();
    }),
  );

  app.post<{ Params: 問いパス }>("/api/fudaba/questions/:id/answers", async (request, reply) =>
    検証エラーを応答に写像する(reply, () => {
      const id = 問いID.create(IDパラメータを読む(request.params.id));
      const 内容 = 回答内容に絞る(request.body);
      return reply.code(201).send(
        ストア.問いに回答する(id, 内容.選択肢ID, 内容.回答者, 内容.メモ).toJSON(),
      );
    }),
  );

  app.post<{ Params: 問いパス }>(
    "/api/fudaba/questions/:id/attachments",
    { bodyLimit: 添付リクエストボディ上限バイト数 },
    async (request, reply) => 検証エラーを応答に写像する(reply, async () => {
      const id = 問いID.create(IDパラメータを読む(request.params.id));
      if (ストア.問いをIDで取得する(id) === null) throw new 問い未検出エラー(id.値);
      const 内容 = 添付追加内容に絞る(request.body);
      const 保存名 = await 添付ストレージ.保存する(内容.バイナリ, 内容.拡張子);
      try {
        const 添付情報 = 添付.create({
          保存名,
          ファイル名: 内容.ファイル名,
          バイト数: 内容.バイナリ.length,
          追加時刻ISO: new Date().toISOString(),
        });
        const 更新後 = ストア.問いに添付を追加する(id, 添付情報);
        if (更新後 === null) throw new 問い未検出エラー(id.値);
        return reply.code(201).send(更新後.toJSON());
      } catch (エラー) {
        await 添付ストレージ.削除する(保存名);
        throw エラー;
      }
    }),
  );
}
