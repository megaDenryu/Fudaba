import { describe, expect, it } from "vitest";
import { 複数ラベル入力向け候補を作る } from "./複数ラベル候補";

describe("複数ラベル入力向け候補", () => {
  const 候補 = ["jimbo", "fudaba", "mobile"];

  it("1個目を確定した後も未選択候補を複数値として提示する", () => {
    expect(複数ラベル入力向け候補を作る("jimbo", 候補)).toEqual([
      "jimbo, fudaba",
      "jimbo, mobile",
    ]);
  });

  it("2個目の入力途中文字列で候補を絞る", () => {
    expect(複数ラベル入力向け候補を作る("jimbo, fu", 候補)).toEqual(["jimbo, fudaba"]);
  });

  it("読点区切りもカンマ区切りの候補へ正規化する", () => {
    expect(複数ラベル入力向け候補を作る("jimbo、fudaba", 候補)).toEqual([
      "jimbo, fudaba, mobile",
    ]);
  });
});
