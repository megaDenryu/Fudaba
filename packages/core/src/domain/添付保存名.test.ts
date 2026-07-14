import { describe, expect, it } from "vitest";
import { 添付保存名 } from "./添付保存名.js";

describe("添付保存名", () => {
  it("32桁16進数+許可拡張子は受理する", () => {
    for (const 拡張子 of ["png", "jpg", "jpeg", "gif", "webp"]) {
      expect(() => 添付保存名.create(`${"a1".repeat(16)}.${拡張子}`)).not.toThrow();
    }
  });

  it("パストラバーサル文字列は拒否する", () => {
    expect(() => 添付保存名.create("../../etc/passwd")).toThrow();
    expect(() => 添付保存名.create("..\\..\\secret.png")).toThrow();
  });

  it("許可されない拡張子は拒否する", () => {
    expect(() => 添付保存名.create(`${"a1".repeat(16)}.svg`)).toThrow();
    expect(() => 添付保存名.create(`${"a1".repeat(16)}.exe`)).toThrow();
  });

  it("16進以外の文字を含む場合は拒否する", () => {
    expect(() => 添付保存名.create(`${"z1".repeat(16)}.png`)).toThrow();
  });

  it("拡張子を取り出せる", () => {
    const 対象 = 添付保存名.create(`${"a1".repeat(16)}.webp`);
    expect(対象.拡張子).toBe("webp");
  });
});
