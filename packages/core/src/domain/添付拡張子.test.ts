import { describe, expect, it } from "vitest";
import { 添付拡張子 } from "./添付拡張子.js";

describe("添付拡張子", () => {
  it("許可拡張子から作成できる", () => {
    expect(添付拡張子.create("png").値).toBe("png");
  });

  it("許可されない拡張子は検証エラーになる", () => {
    expect(() => 添付拡張子.create("svg")).toThrow();
  });

  it("MIME型から拡張子を判定できる", () => {
    expect(添付拡張子.MIME型から作る("image/png").値).toBe("png");
    expect(添付拡張子.MIME型から作る("image/jpeg").値).toBe("jpg");
    expect(添付拡張子.MIME型から作る("image/gif").値).toBe("gif");
    expect(添付拡張子.MIME型から作る("image/webp").値).toBe("webp");
  });

  it("対応していないMIME型は検証エラーになる", () => {
    expect(() => 添付拡張子.MIME型から作る("image/svg+xml")).toThrow();
    expect(() => 添付拡張子.MIME型から作る("application/pdf")).toThrow();
  });

  it("MIME型を逆引きできる", () => {
    expect(添付拡張子.create("jpg").MIME型).toBe("image/jpeg");
  });
});
