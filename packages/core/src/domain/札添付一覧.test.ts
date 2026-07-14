import { describe, expect, it } from "vitest";
import { 添付 } from "./添付.js";
import { 添付保存名 } from "./添付保存名.js";
import { 札添付一覧, 札添付一覧をDTO値から作る, 札添付一覧をDTO値にする } from "./札添付一覧.js";

function 添付を作る(保存名文字列: string): 添付 {
  return 添付.create({
    保存名: 添付保存名.create(保存名文字列),
    ファイル名: "screenshot.png",
    バイト数: 1024,
    追加時刻ISO: "2026-07-14T00:00:00.000Z",
  });
}

describe("札添付一覧", () => {
  it("空は一覧が空配列", () => {
    expect(札添付一覧.空().一覧).toEqual([]);
  });

  it("追加すると一覧に含まれる", () => {
    const 対象 = 添付を作る("a".repeat(32) + ".png");
    const 一覧 = 札添付一覧.空().追加する(対象);
    expect(一覧.一覧).toHaveLength(1);
    expect(一覧.含むか("a".repeat(32) + ".png")).toBe(true);
  });

  it("除外すると一覧から消える", () => {
    const 保存名 = "a".repeat(32) + ".png";
    const 一覧 = 札添付一覧.空().追加する(添付を作る(保存名)).除外する(保存名);
    expect(一覧.一覧).toHaveLength(0);
    expect(一覧.含むか(保存名)).toBe(false);
  });

  it("追加・除外は新しいインスタンスを返す（不変性）", () => {
    const 元 = 札添付一覧.空();
    const 対象 = 添付を作る("a".repeat(32) + ".png");
    const 追加後 = 元.追加する(対象);
    expect(元.一覧).toHaveLength(0);
    expect(追加後.一覧).toHaveLength(1);
  });

  it("DTO値との相互変換ができる", () => {
    const 一覧 = 札添付一覧.空().追加する(添付を作る("b".repeat(32) + ".jpg"));
    const DTO値 = 札添付一覧をDTO値にする(一覧);
    const 復元 = 札添付一覧をDTO値から作る(DTO値);
    expect(復元.一覧).toHaveLength(1);
    expect(復元.一覧[0]?.保存名.値).toBe("b".repeat(32) + ".jpg");
  });

  it("空配列のDTO値から空の一覧を復元できる", () => {
    expect(札添付一覧をDTO値から作る("[]").一覧).toEqual([]);
  });

  it("形式不正なDTO値は例外を投げる", () => {
    expect(() => 札添付一覧をDTO値から作る('[{"保存名":123}]')).toThrow();
    expect(() => 札添付一覧をDTO値から作る("not json")).toThrow();
  });
});
