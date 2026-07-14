import { describe, expect, it } from "vitest";
import { 札ラベル一覧 } from "./札ラベル一覧.js";

describe("札ラベル一覧", () => {
  it("空配列から空の一覧を作れる", () => {
    expect(札ラベル一覧.create([]).値一覧).toEqual([]);
  });

  it("空文字列や空白のみの要素は無視する", () => {
    expect(札ラベル一覧.create(["", "  ", "jimbo"]).値一覧).toEqual(["jimbo"]);
  });

  it("前後の空白を除去する", () => {
    expect(札ラベル一覧.create(["  fudaba  "]).値一覧).toEqual(["fudaba"]);
  });

  it("重複した値は1件にまとめる", () => {
    expect(札ラベル一覧.create(["fudaba", "fudaba", "jimbo"]).値一覧).toEqual([
      "fudaba",
      "jimbo",
    ]);
  });

  it("51文字以上のラベルは検証エラーになる", () => {
    expect(() => 札ラベル一覧.create(["あ".repeat(51)])).toThrow();
  });

  it("含むかは一覧に含まれる値だけtrueを返す", () => {
    const 一覧 = 札ラベル一覧.create(["fudaba", "jimbo"]);
    expect(一覧.含むか("fudaba")).toBe(true);
    expect(一覧.含むか("boomyack")).toBe(false);
  });

  it("空は値一覧が空配列", () => {
    expect(札ラベル一覧.空().値一覧).toEqual([]);
  });
});
