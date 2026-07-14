import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Fastify from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { 添付ストレージ } from "../infra/添付ストレージ.js";
import { 札ストア } from "../infra/札ストア.js";
import { Fudabaルートを登録する } from "./札ルート.js";

const 一画素PNGのbase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function アプリを作る(ストア: 札ストア, 添付ディレクトリ: string) {
  const app = Fastify();
  Fudabaルートを登録する(app, {
    ストア,
    添付ストレージ: 添付ストレージ.ディレクトリを指定して作る(添付ディレクトリ),
  });
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
  let 添付ディレクトリ: string;

  beforeEach(() => {
    ストア = 札ストア.メモリ上に作る();
    添付ディレクトリ = mkdtempSync(path.join(tmpdir(), "fudaba-attachments-test-"));
  });

  afterEach(() => {
    rmSync(添付ディレクトリ, { recursive: true, force: true });
  });

  it("POSTで札を作成しGETの一覧に現れる", async () => {
    const app = アプリを作る(ストア, 添付ディレクトリ);

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
    const app = アプリを作る(ストア, 添付ディレクトリ);
    const 応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "不明種別", タイトル: "テスト札", 本文: "本文", 作成者: "claude" },
    });
    expect(応答.statusCode).toBe(400);
  });

  it("PATCHで状態と担当者を部分更新できる", async () => {
    const app = アプリを作る(ストア, 添付ディレクトリ);
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
    const app = アプリを作る(ストア, 添付ディレクトリ);
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

  it("PATCHで種別を変更できる", async () => {
    const app = アプリを作る(ストア, 添付ディレクトリ);
    const 作成応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "タスク", タイトル: "テスト札", 本文: "本文", 作成者: "claude" },
    });
    const id = idを読む(作成応答.json());

    const 更新応答 = await app.inject({
      method: "PATCH",
      url: `/api/fudaba/items/${id}`,
      payload: { 種別: "バグ" },
    });
    expect(更新応答.statusCode).toBe(200);
    expect(更新応答.json()).toMatchObject({ 種別: "バグ" });
  });

  it("種別が不正なPATCHは400を返す", async () => {
    const app = アプリを作る(ストア, 添付ディレクトリ);
    const 作成応答 = await app.inject({
      method: "POST",
      url: "/api/fudaba/items",
      payload: { 種別: "タスク", タイトル: "テスト札", 本文: "本文", 作成者: "claude" },
    });
    const id = idを読む(作成応答.json());

    const 更新応答 = await app.inject({
      method: "PATCH",
      url: `/api/fudaba/items/${id}`,
      payload: { 種別: "不明種別" },
    });
    expect(更新応答.statusCode).toBe(400);
  });

  it("存在しないIDのPATCHは404を返す", async () => {
    const app = アプリを作る(ストア, 添付ディレクトリ);
    const 応答 = await app.inject({
      method: "PATCH",
      url: "/api/fudaba/items/9999",
      payload: { 状態: "完了" },
    });
    expect(応答.statusCode).toBe(404);
  });

  describe("ラベル", () => {
    it("POSTでラベル一覧を指定して作成できる", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 作成応答 = await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: {
          種別: "タスク",
          タイトル: "テスト札",
          本文: "本文",
          作成者: "claude",
          ラベル一覧: ["fudaba", "jimbo"],
        },
      });
      expect(作成応答.statusCode).toBe(201);
      expect(作成応答.json()).toMatchObject({ ラベル一覧: ["fudaba", "jimbo"] });
    });

    it("ラベル一覧を省略すると空配列になる", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 作成応答 = await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: { 種別: "メモ", タイトル: "テスト札", 本文: "", 作成者: "claude" },
      });
      expect(作成応答.json()).toMatchObject({ ラベル一覧: [] });
    });

    it("ラベル一覧が文字列配列でないPOSTは400を返す", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 応答 = await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: {
          種別: "タスク",
          タイトル: "テスト札",
          本文: "",
          作成者: "claude",
          ラベル一覧: "fudaba",
        },
      });
      expect(応答.statusCode).toBe(400);
    });

    it("PATCHでラベル一覧を差し替えられる", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 作成応答 = await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: {
          種別: "タスク",
          タイトル: "テスト札",
          本文: "",
          作成者: "claude",
          ラベル一覧: ["旧"],
        },
      });
      const id = idを読む(作成応答.json());

      const 更新応答 = await app.inject({
        method: "PATCH",
        url: `/api/fudaba/items/${id}`,
        payload: { ラベル一覧: ["新"] },
      });
      expect(更新応答.statusCode).toBe(200);
      expect(更新応答.json()).toMatchObject({ ラベル一覧: ["新"] });
    });

    it("GETにラベルクエリを渡すと指定ラベルを全て持つ札だけ返る", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: {
          種別: "タスク",
          タイトル: "両方持つ",
          本文: "",
          作成者: "claude",
          ラベル一覧: ["fudaba", "urgent"],
        },
      });
      await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: {
          種別: "タスク",
          タイトル: "片方だけ",
          本文: "",
          作成者: "claude",
          ラベル一覧: ["fudaba"],
        },
      });

      const 一覧応答 = await app.inject({
        method: "GET",
        url: "/api/fudaba/items?ラベル=fudaba&ラベル=urgent",
      });
      expect(一覧応答.statusCode).toBe(200);
      const 一覧: unknown = 一覧応答.json();
      if (!Array.isArray(一覧)) {
        throw new Error("一覧応答が配列ではありません");
      }
      expect(一覧).toHaveLength(1);
      expect(一覧[0]).toMatchObject({ タイトル: "両方持つ" });
    });
  });

  describe("添付", () => {
    async function 札を作る(app: ReturnType<typeof アプリを作る>): Promise<number> {
      const 作成応答 = await app.inject({
        method: "POST",
        url: "/api/fudaba/items",
        payload: { 種別: "バグ", タイトル: "スクショ付きバグ", 本文: "本文", 作成者: "claude" },
      });
      return idを読む(作成応答.json());
    }

    it("POSTで画像を追加すると札のラベル一覧に反映され、GETで取得できる", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const id = await 札を作る(app);

      const 追加応答 = await app.inject({
        method: "POST",
        url: `/api/fudaba/items/${id}/attachments`,
        payload: { ファイル名: "screenshot.png", データURL: `data:image/png;base64,${一画素PNGのbase64}` },
      });
      expect(追加応答.statusCode).toBe(201);
      const 追加結果: unknown = 追加応答.json();
      if (
        typeof 追加結果 !== "object" ||
        追加結果 === null ||
        !("添付一覧" in 追加結果) ||
        !Array.isArray(追加結果.添付一覧)
      ) {
        throw new Error("添付一覧を含む応答ではありません");
      }
      expect(追加結果.添付一覧).toHaveLength(1);
      const [添付] = 追加結果.添付一覧;
      expect(添付).toMatchObject({ ファイル名: "screenshot.png" });
      if (typeof 添付 !== "object" || 添付 === null || !("保存名" in 添付) || typeof 添付.保存名 !== "string") {
        throw new Error("保存名を含む添付ではありません");
      }

      const 画像応答 = await app.inject({
        method: "GET",
        url: `/api/fudaba/attachments/${添付.保存名}`,
      });
      expect(画像応答.statusCode).toBe(200);
      expect(画像応答.headers["content-type"]).toBe("image/png");
    });

    it("拡張子非対応のMIME型は400を返す", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const id = await 札を作る(app);

      const 応答 = await app.inject({
        method: "POST",
        url: `/api/fudaba/items/${id}/attachments`,
        payload: { ファイル名: "a.svg", データURL: "data:image/svg+xml;base64,PHN2Zy8+" },
      });
      expect(応答.statusCode).toBe(400);
    });

    it("存在しない札IDへの追加は404を返す", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 応答 = await app.inject({
        method: "POST",
        url: "/api/fudaba/items/9999/attachments",
        payload: { ファイル名: "a.png", データURL: `data:image/png;base64,${一画素PNGのbase64}` },
      });
      expect(応答.statusCode).toBe(404);
    });

    it("存在しない保存名のGETは404を返す", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 応答 = await app.inject({
        method: "GET",
        url: "/api/fudaba/attachments/00000000000000000000000000000000.png",
      });
      expect(応答.statusCode).toBe(404);
    });

    it("不正な保存名（パストラバーサル）のGETは400を返す", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const 応答 = await app.inject({
        method: "GET",
        url: `/api/fudaba/attachments/${encodeURIComponent("../secret.png")}`,
      });
      expect(応答.statusCode).toBe(400);
    });

    it("DELETEで添付を削除すると札の添付一覧から消え、GETは404になる", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const id = await 札を作る(app);
      const 追加応答 = await app.inject({
        method: "POST",
        url: `/api/fudaba/items/${id}/attachments`,
        payload: { ファイル名: "screenshot.png", データURL: `data:image/png;base64,${一画素PNGのbase64}` },
      });
      const 追加結果: unknown = 追加応答.json();
      if (
        typeof 追加結果 !== "object" ||
        追加結果 === null ||
        !("添付一覧" in 追加結果) ||
        !Array.isArray(追加結果.添付一覧)
      ) {
        throw new Error("添付一覧を含む応答ではありません");
      }
      const [添付] = 追加結果.添付一覧;
      if (typeof 添付 !== "object" || 添付 === null || !("保存名" in 添付) || typeof 添付.保存名 !== "string") {
        throw new Error("保存名を含む添付ではありません");
      }

      const 削除応答 = await app.inject({
        method: "DELETE",
        url: `/api/fudaba/items/${id}/attachments/${添付.保存名}`,
      });
      expect(削除応答.statusCode).toBe(200);
      expect(削除応答.json()).toMatchObject({ 添付一覧: [] });

      const 画像応答 = await app.inject({
        method: "GET",
        url: `/api/fudaba/attachments/${添付.保存名}`,
      });
      expect(画像応答.statusCode).toBe(404);
    });

    it("存在しない保存名のDELETEは404を返す", async () => {
      const app = アプリを作る(ストア, 添付ディレクトリ);
      const id = await 札を作る(app);
      const 応答 = await app.inject({
        method: "DELETE",
        url: `/api/fudaba/items/${id}/attachments/${"a".repeat(32)}.png`,
      });
      expect(応答.statusCode).toBe(404);
    });
  });
});
