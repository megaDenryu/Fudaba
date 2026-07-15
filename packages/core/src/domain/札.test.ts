import { describe, expect, it } from "vitest";
import { 添付 } from "./添付.js";
import { 添付保存名 } from "./添付保存名.js";
import { メンバー名 } from "./メンバー名.js";
import { 札 } from "./札.js";
import { 札種別 } from "./札種別.js";
import { 札状態 } from "./札状態.js";
import { 札添付一覧 } from "./札添付一覧.js";
import { 札ラベル一覧 } from "./札ラベル一覧.js";
import { 割当済み, 未割当 } from "./担当者.js";
import { 未リンク, ルームにリンクする } from "./札リンク.js";

function 添付を作る(保存名文字列: string): 添付 {
  return 添付.create({
    保存名: 添付保存名.create(保存名文字列),
    ファイル名: "screenshot.png",
    バイト数: 1024,
    追加時刻ISO: "2026-07-14T00:00:00.000Z",
  });
}

function 札を作る(上書き: Partial<Parameters<typeof 札.create>[0]> = {}) {
  return 札.create({
    id: 1,
    種別: 札種別.create("実装"),
    タイトル: "サンプル札",
    本文: "本文",
    状態: 札状態.既定(),
    担当者: 未割当,
    作成者: メンバー名.create("claude"),
    リンク: 未リンク,
    ラベル一覧: 札ラベル一覧.空(),
    添付一覧: 札添付一覧.空(),
    作成時刻ISO: "2026-07-14T00:00:00.000Z",
    更新時刻ISO: "2026-07-14T00:00:00.000Z",
    ...上書き,
  });
}

describe("札", () => {
  it("正しい引数からインスタンスを作れる", () => {
    const 札インスタンス = 札を作る();
    expect(札インスタンス.id.値).toBe(1);
    expect(札インスタンス.種別.値).toBe("実装");
    expect(札インスタンス.状態.値).toBe("未着手");
  });

  it("タイトルが空なら検証エラーになる", () => {
    expect(() => 札を作る({ タイトル: "  " })).toThrow();
  });

  it("タイトルが201文字以上なら検証エラーになる", () => {
    expect(() => 札を作る({ タイトル: "あ".repeat(201) })).toThrow();
  });

  it("toJSONは担当者未割当をnullに写像する", () => {
    const dto = 札を作る().toJSON();
    expect(dto.担当者).toBeNull();
    expect(dto.ルーム名).toBeNull();
  });

  it("toJSONは割当済み担当者とルームリンクをDTO値に写像する", () => {
    const dto = 札を作る({
      担当者: 割当済み(メンバー名.create("codex")),
      リンク: ルームにリンクする("dev"),
    }).toJSON();
    expect(dto.担当者).toBe("codex");
    expect(dto.ルーム名).toBe("dev");
  });

  describe("ラベル一覧", () => {
    it("toJSONは値一覧の配列に写像する", () => {
      const dto = 札を作る({ ラベル一覧: 札ラベル一覧.create(["fudaba", "jimbo"]) }).toJSON();
      expect(dto.ラベル一覧).toEqual(["fudaba", "jimbo"]);
    });

    it("未指定(空)の札はtoJSONで空配列になる", () => {
      const dto = 札を作る().toJSON();
      expect(dto.ラベル一覧).toEqual([]);
    });
  });

  describe("変更を適用する", () => {
    it("指定したフィールドだけを更新し、他は維持する", () => {
      const 元札 = 札を作る();
      const 更新後 = 元札.変更を適用する(
        {
          種別: undefined,
          タイトル: undefined,
          本文: undefined,
          状態: 札状態.create("進行中"),
          担当者: undefined,
          ラベル一覧: undefined,
        },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.状態.値).toBe("進行中");
      expect(更新後.タイトル).toBe(元札.タイトル);
      expect(更新後.担当者).toEqual(未割当);
      expect(更新後.更新時刻ISO).toBe("2026-07-15T00:00:00.000Z");
    });

    it("担当者へ未割当を明示指定すると解除される", () => {
      const 元札 = 札を作る({ 担当者: 割当済み(メンバー名.create("codex")) });
      const 更新後 = 元札.変更を適用する(
        {
          種別: undefined,
          タイトル: undefined,
          本文: undefined,
          状態: undefined,
          担当者: 未割当,
          ラベル一覧: undefined,
        },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.担当者).toEqual(未割当);
    });

    it("種別を指定すると更新される", () => {
      const 元札 = 札を作る({ 種別: 札種別.create("実装") });
      const 更新後 = 元札.変更を適用する(
        {
          種別: 札種別.create("バグ"),
          タイトル: undefined,
          本文: undefined,
          状態: undefined,
          担当者: undefined,
          ラベル一覧: undefined,
        },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.種別.値).toBe("バグ");
    });

    it("ラベル一覧を指定すると更新される", () => {
      const 元札 = 札を作る({ ラベル一覧: 札ラベル一覧.create(["旧ラベル"]) });
      const 更新後 = 元札.変更を適用する(
        {
          種別: undefined,
          タイトル: undefined,
          本文: undefined,
          状態: undefined,
          担当者: undefined,
          ラベル一覧: 札ラベル一覧.create(["新ラベル"]),
        },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.ラベル一覧.値一覧).toEqual(["新ラベル"]);
    });

    it("ラベル一覧を省略すると維持される", () => {
      const 元札 = 札を作る({ ラベル一覧: 札ラベル一覧.create(["維持されるラベル"]) });
      const 更新後 = 元札.変更を適用する(
        {
          種別: undefined,
          タイトル: undefined,
          本文: undefined,
          状態: undefined,
          担当者: undefined,
          ラベル一覧: undefined,
        },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.ラベル一覧.値一覧).toEqual(["維持されるラベル"]);
    });

    it("添付一覧は変更を適用するの対象外で維持される", () => {
      const 元札 = 札を作る({ 添付一覧: 札添付一覧.空().追加する(添付を作る("a".repeat(32) + ".png")) });
      const 更新後 = 元札.変更を適用する(
        {
          種別: undefined,
          タイトル: undefined,
          本文: undefined,
          状態: 札状態.create("完了"),
          担当者: undefined,
          ラベル一覧: undefined,
        },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.添付一覧.一覧).toHaveLength(1);
    });
  });

  describe("添付", () => {
    it("toJSONは添付一覧をDTO配列に写像する", () => {
      const dto = 札を作る({
        添付一覧: 札添付一覧.空().追加する(添付を作る("a".repeat(32) + ".png")),
      }).toJSON();
      expect(dto.添付一覧).toEqual([
        { 保存名: "a".repeat(32) + ".png", ファイル名: "screenshot.png", バイト数: 1024, 追加時刻: "2026-07-14T00:00:00.000Z" },
      ]);
    });

    it("未添付の札はtoJSONで空配列になる", () => {
      expect(札を作る().toJSON().添付一覧).toEqual([]);
    });

    it("添付を追加するは新しい添付一覧を持つ新インスタンスを返す", () => {
      const 元札 = 札を作る();
      const 更新後 = 元札.添付を追加する(添付を作る("a".repeat(32) + ".png"), "2026-07-15T00:00:00.000Z");
      expect(元札.添付一覧.一覧).toHaveLength(0);
      expect(更新後.添付一覧.一覧).toHaveLength(1);
      expect(更新後.更新時刻ISO).toBe("2026-07-15T00:00:00.000Z");
      expect(更新後.タイトル).toBe(元札.タイトル);
    });

    it("添付を除外するは指定保存名だけを取り除く", () => {
      const 保存名 = "a".repeat(32) + ".png";
      const 元札 = 札を作る({ 添付一覧: 札添付一覧.空().追加する(添付を作る(保存名)) });
      const 更新後 = 元札.添付を除外する(保存名, "2026-07-15T00:00:00.000Z");
      expect(更新後.添付一覧.一覧).toHaveLength(0);
    });
  });
});
