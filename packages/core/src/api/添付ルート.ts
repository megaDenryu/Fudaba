import type { FastifyInstance } from "fastify";
import { 添付, 添付リクエストボディ上限バイト数 } from "../domain/添付.js";
import { 添付拡張子 } from "../domain/添付拡張子.js";
import { 添付保存名 } from "../domain/添付保存名.js";
import { 添付未検出エラー } from "../domain/添付未検出エラー.js";
import { 札ID } from "../domain/札ID.js";
import { 札未検出エラー } from "../domain/札未検出エラー.js";
import type { 添付ストレージ } from "../infra/添付ストレージ.js";
import type { 札ストア } from "../infra/札ストア.js";
import { 検証エラーを応答に写像する } from "./エラー応答.js";
import { 添付追加内容に絞る, IDパラメータを読む } from "./リクエスト検証.js";
import type { 添付パス, 札添付パス, 札パス } from "./ルートパス型.js";

// 札ルート.tsから責務分離した添付ファイル専用のルート登録関数（画像の保存・配信・削除）。
// 札本体のCRUDとは読み書き対象（DB列 vs ファイルシステム）が異なるため独立させている
export function Fudaba添付ルートを登録する(
  app: FastifyInstance,
  依存: { ストア: 札ストア; 添付ストレージ: 添付ストレージ },
): void {
  const { ストア, 添付ストレージ } = 依存;

  // bodyLimitはこのルートだけに適用する（ホストのFastifyインスタンスは他の住民とも
  // 相乗りするため、既定値[Fastify既定1MB]をグローバルに広げない。参照: domain/添付.ts）
  app.post<{ Params: 札パス }>(
    "/api/fudaba/items/:id/attachments",
    { bodyLimit: 添付リクエストボディ上限バイト数 },
    async (request, reply) =>
      検証エラーを応答に写像する(reply, async () => {
        const id = 札ID.create(IDパラメータを読む(request.params.id));
        const 内容 = 添付追加内容に絞る(request.body);
        const 保存名 = await 添付ストレージ.保存する(内容.バイナリ, 内容.拡張子);
        try {
          const 添付情報 = 添付.create({
            保存名,
            ファイル名: 内容.ファイル名,
            バイト数: 内容.バイナリ.length,
            追加時刻ISO: new Date().toISOString(),
          });
          const 更新後 = ストア.添付を追加する(id, 添付情報);
          if (更新後 === null) {
            throw new 札未検出エラー(id.値);
          }
          return reply.code(201).send(更新後.toJSON());
        } catch (エラー) {
          // 保存名の採番後に発生した失敗はファイルだけが孤立して残るため、必ず削除して巻き戻す
          await 添付ストレージ.削除する(保存名);
          throw エラー;
        }
      }),
  );

  app.get<{ Params: 添付パス }>("/api/fudaba/attachments/:保存名", async (request, reply) =>
    検証エラーを応答に写像する(reply, async () => {
      const 保存名 = 添付保存名.create(request.params.保存名);
      const バイナリ = await 添付ストレージ.読み込む(保存名);
      if (バイナリ === null) {
        throw new 添付未検出エラー(保存名.値);
      }
      const 拡張子 = 添付拡張子.create(保存名.拡張子);
      reply.header("Content-Type", 拡張子.MIME型);
      return reply.send(バイナリ);
    }),
  );

  app.delete<{ Params: 札添付パス }>(
    "/api/fudaba/items/:id/attachments/:保存名",
    async (request, reply) =>
      検証エラーを応答に写像する(reply, async () => {
        const id = 札ID.create(IDパラメータを読む(request.params.id));
        const 保存名 = 添付保存名.create(request.params.保存名);
        const 更新後 = ストア.添付を除外する(id, 保存名.値);
        if (更新後 === null) {
          throw new 札未検出エラー(id.値);
        }
        await 添付ストレージ.削除する(保存名);
        return 更新後.toJSON();
      }),
  );
}
