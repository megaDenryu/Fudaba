import Fastify from "fastify";
import { beforeEach, describe, expect, it } from "vitest";
import { 札ストア } from "../infra/札ストア.js";
import { Fudabaルートを登録する } from "./札ルート.js";

function アプリを作る(ストア: 札ストア) {
  const app = Fastify();
  Fudabaルートを登録する(app, { ストア });
  return app;
}

function idを読む(値: unknown): number {
  if (typeof 値 === "object" && 値 !== null && "id" in 値 && typeof 値.id === "number") {
    return 値.id;
  }
  throw new Error(`idを含むオブジェクトではありません: ${JSON.stringify(値)}`);
}

describe("Fudabaルート", () => {
  let ストア: 札ストア;

  beforeEach(() => {
    ストア = 札ストア.メモリ上に作る();
  });

  it("POSTで札を作成しGETの一覧に現れる", async () => {
    const app = アプリを作る(ストア);

    const 作成応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "タスク", タイトル: "テスト札", 本文: "本文", 作成者: "claude" },
    });
    expect(作成応答.statusCode).toBe(201);
    const 作成結果: unknown = 作成応答.json();
    expect(作成結果).toMatchObject({ 種別: "タスク", タイトル: "テスト札", 状態: "未着手" });

    const 一覧応答 = await app.inject({ method: "GET", url: "/api/fudaba/items" });
    expect(一覧応答.statusCode).toBe(200);
    const 一覧: unknown = 一覧応答.json();
    if (!Array.isArray(一覧)) {
      throw new Error("一覧応答が配列ではありません");
    }
    expect(一覧.length).toBe(1);
  });

  it("種別が不正なPOSTは400を返す", async () => {
    const app = アプリを作る(ストア);
    const 応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "不明種別", タイトル: "テスト札", 本文: "本文", 作成者: "claude" },
    });
    expect(応答.statusCode).toBe(400);
  });

  it("PATCHで状態と担当者を部分更新できる", async () => {
    const app = アプリを作る(ストア);
    const 作成応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "バグ", タイトル: "テスト札", 本文: "本文", 作成者: "claude" },
    });
    const id = idを読む(作成応答.json());

    const 更新応答 = await app.inject({
      method: "PATCH",
      url: `/api/fudaba/items/${id}`,
      payload: { 状態: "進行中", 担当者: "codex" },
    });
    expect(更新応答.statusCode).toBe(200);
    expect(更新応答.json()).toMatchObject({ 状態: "進行中", 担当者: "codex" });
  });

  it("担当者にnullを送ると未割当に戻る", async () => {
    const app = アプリを作る(ストア);
    const 作成応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "メモ", タイトル: "テスト札", 本文: "", 作成者: "claude", 担当者: "codex" },
    });
    const id = idを読む(作成応答.json());

    const 更新応答 = await app.inject({
      method: "PATCH",
      url: `/api/fudaba/items/${id}`,
      payload: { 担当者: null },
    });
    expect(更新応答.json()).toMatchObject({ 担当者: null });
  });

  it("存在しないIDのPATCHは404を返す", async () => {
    const app = アプリを作る(ストア);
    const 応答 = await app.inject({
      method: "PATCH",
      url: "/api/fudaba/items/9999",
      payload: { 状態: "完了" },
    });
    expect(応答.statusCode).toBe(404);
  });
});
