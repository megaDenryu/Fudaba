import { describe, expect, it } from "vitest";
import { 添付, 添付最大バイト数 } from "./添付.js";
import { 添付保存名 } from "./添付保存名.js";

function 保存名を作る(): 添付保存名 {
  return 添付保存名.create("a".repeat(32) + ".png");
}

describe("添付", () => {
  it("有効な引数から作成できる", () => {
    const 対象 = 添付.create({
      保存名: 保存名を作る(),
      ファイル名: "screenshot.png",
      バイト数: 1024,
      追加時刻ISO: "2026-07-14T00:00:00.000Z",
    });
    expect(対象.ファイル名).toBe("screenshot.png");
    expect(対象.バイト数).toBe(1024);
  });

  it("空文字のファイル名は検証エラーになる", () => {
    expect(() =>
      添付.create({
        保存名: 保存名を作る(),
        ファイル名: "  ",
        バイト数: 1024,
        追加時刻ISO: "2026-07-14T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("バイト数が0以下は検証エラーになる", () => {
    expect(() =>
      添付.create({
        保存名: 保存名を作る(),
        ファイル名: "a.png",
        バイト数: 0,
        追加時刻ISO: "2026-07-14T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("上限バイト数を超えると検証エラーになる", () => {
    expect(() =>
      添付.create({
        保存名: 保存名を作る(),
        ファイル名: "a.png",
        バイト数: 添付最大バイト数 + 1,
        追加時刻ISO: "2026-07-14T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("toJSONは保存名の値を文字列として含む", () => {
    const 対象 = 添付.create({
      保存名: 保存名を作る(),
      ファイル名: "screenshot.png",
      バイト数: 1024,
      追加時刻ISO: "2026-07-14T00:00:00.000Z",
    });
    expect(対象.toJSON()).toEqual({
      保存名: "a".repeat(32) + ".png",
      ファイル名: "screenshot.png",
      バイト数: 1024,
      追加時刻: "2026-07-14T00:00:00.000Z",
    });
  });
});
