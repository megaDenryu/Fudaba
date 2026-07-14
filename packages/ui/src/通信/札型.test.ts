import { describe, expect, it } from "vitest";
import { 札DTOか, 札DTO一覧か } from "./札型";

const 正しい札: Record<string, unknown> = {
  id: 1,
  種別: "タスク",
  タイトル: "サンプル",
  本文: "本文",
  状態: "未着手",
  担当者: null,
  作成者: "claude",
  ルーム名: null,
  作成時刻: "2026-07-14T00:00:00.000Z",
  更新時刻: "2026-07-14T00:00:00.000Z",
};

describe("札DTOか", () => {
  it("正しい形のオブジェクトを受理する", () => {
    expect(札DTOか(正しい札)).toBe(true);
  });

  it("必須フィールドが欠けたオブジェクトを拒否する", () => {
    const { タイトル: _タイトル, ...欠損 } = 正しい札;
    expect(札DTOか(欠損)).toBe(false);
  });

  it("nullや配列は拒否する", () => {
    expect(札DTOか(null)).toBe(false);
    expect(札DTOか([])).toBe(false);
  });
});

describe("札DTO一覧か", () => {
  it("正しい札の配列を受理する", () => {
    expect(札DTO一覧か([正しい札, 正しい札])).toBe(true);
  });

  it("配列以外や不正な要素を含む配列を拒否する", () => {
    expect(札DTO一覧か(正しい札)).toBe(false);
    expect(札DTO一覧か([正しい札, { id: 1 }])).toBe(false);
  });
});
