import { describe, expect, it } from "vitest";
import {
  ラベル文字列を配列にする,
  ラベル配列を文字列にする,
  ラベル配列を比較キーにする,
} from "./ラベル入力パース";

describe("ラベル文字列を配列にする", () => {
  it("カンマ区切りを配列に分解する", () => {
    expect(ラベル文字列を配列にする("fudaba,jimbo")).toEqual(["fudaba", "jimbo"]);
  });

  it("各要素の前後の空白を除去する", () => {
    expect(ラベル文字列を配列にする(" fudaba , jimbo ")).toEqual(["fudaba", "jimbo"]);
  });

  it("空文字列や空白のみの要素は除外する", () => {
    expect(ラベル文字列を配列にする("fudaba,, ,jimbo")).toEqual(["fudaba", "jimbo"]);
  });

  it("空文字列からは空配列を返す", () => {
    expect(ラベル文字列を配列にする("")).toEqual([]);
    expect(ラベル文字列を配列にする("   ")).toEqual([]);
  });
});

describe("ラベル配列を文字列にする", () => {
  it("カンマとスペースで結合する", () => {
    expect(ラベル配列を文字列にする(["fudaba", "jimbo"])).toBe("fudaba, jimbo");
  });

  it("空配列からは空文字列を返す", () => {
    expect(ラベル配列を文字列にする([])).toBe("");
  });
});

describe("ラベル配列を比較キーにする", () => {
  it("順序が違っても同じキーになる", () => {
    expect(ラベル配列を比較キーにする(["jimbo", "fudaba"])).toBe(
      ラベル配列を比較キーにする(["fudaba", "jimbo"]),
    );
  });

  it("要素が違えば異なるキーになる", () => {
    expect(ラベル配列を比較キーにする(["fudaba"])).not.toBe(
      ラベル配列を比較キーにする(["jimbo"]),
    );
  });
});
