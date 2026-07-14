import { describe, expect, it } from "vitest";
import { メンバー名 } from "./メンバー名.js";
import { 札 } from "./札.js";
import { 札種別 } from "./札種別.js";
import { 札状態 } from "./札状態.js";
import { 割当済み, 未割当 } from "./担当者.js";
import { 未リンク, ルームにリンクする } from "./札リンク.js";

function 札を作る(上書き: Partial<Parameters<typeof 札.create>[0]> = {}) {
  return 札.create({
    id: 1,
    種別: 札種別.create("タスク"),
    タイトル: "サンプル札",
    本文: "本文",
    状態: 札状態.既定(),
    担当者: 未割当,
    作成者: メンバー名.create("claude"),
    リンク: 未リンク,
    作成時刻ISO: "2026-07-14T00:00:00.000Z",
    更新時刻ISO: "2026-07-14T00:00:00.000Z",
    ...上書き,
  });
}

describe("札", () => {
  it("正しい引数からインスタンスを作れる", () => {
    const 札インスタンス = 札を作る();
    expect(札インスタンス.id.値).toBe(1);
    expect(札インスタンス.種別.値).toBe("タスク");
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

  describe("変更を適用する", () => {
    it("指定したフィールドだけを更新し、他は維持する", () => {
      const 元札 = 札を作る();
      const 更新後 = 元札.変更を適用する(
        { タイトル: undefined, 本文: undefined, 状態: 札状態.create("進行中"), 担当者: undefined },
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
        { タイトル: undefined, 本文: undefined, 状態: undefined, 担当者: 未割当 },
        "2026-07-15T00:00:00.000Z",
      );
      expect(更新後.担当者).toEqual(未割当);
    });
  });
});
