import { describe, expect, it } from "vitest";
import { キャラDTOか, キャラDTO一覧か } from "./キャラ型";

const 正しいキャラ: Record<string, unknown> = {
  名前: "claude",
  種別: "AI",
  プロンプト: "あなたはAIエージェントです",
  アイコンdataUrl: "data:image/png;base64,abc",
  行動パターンメモ: "常駐してタスクを処理する",
  作成者: "yamanaka",
  作成時刻: "2026-07-14T00:00:00.000Z",
  更新時刻: "2026-07-14T00:00:00.000Z",
};

describe("キャラDTOか", () => {
  it("正しい形のオブジェクトを受理する", () => {
    expect(キャラDTOか(正しいキャラ)).toBe(true);
  });

  it("必須フィールドが欠けたオブジェクトを拒否する", () => {
    const { 名前: _名前, ...欠損 } = 正しいキャラ;
    expect(キャラDTOか(欠損)).toBe(false);
  });

  it("フィールドの型が異なるオブジェクトを拒否する", () => {
    expect(キャラDTOか({ ...正しいキャラ, 種別: 1 })).toBe(false);
  });

  it("nullや配列は拒否する", () => {
    expect(キャラDTOか(null)).toBe(false);
    expect(キャラDTOか([])).toBe(false);
  });
});

describe("キャラDTO一覧か", () => {
  it("正しいキャラの配列を受理する", () => {
    expect(キャラDTO一覧か([正しいキャラ, 正しいキャラ])).toBe(true);
  });

  it("配列以外や不正な要素を含む配列を拒否する", () => {
    expect(キャラDTO一覧か(正しいキャラ)).toBe(false);
    expect(キャラDTO一覧か([正しいキャラ, { 名前: "x" }])).toBe(false);
  });

  it("空配列を受理する", () => {
    expect(キャラDTO一覧か([])).toBe(true);
  });
});
