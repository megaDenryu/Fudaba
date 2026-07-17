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
  ラベル一覧: ["fudaba"],
  添付一覧: [
    { 保存名: `${"a".repeat(32)}.png`, ファイル名: "screenshot.png", バイト数: 1024, 追加時刻: "2026-07-14T00:00:00.000Z" },
  ],
  チェック項目一覧: [{ id: "task-1", 本文: "確認する", 完了: false }],
  分解推奨: false,
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

  it("ラベル一覧が文字列配列でないオブジェクトを拒否する", () => {
    expect(札DTOか({ ...正しい札, ラベル一覧: "fudaba" })).toBe(false);
    expect(札DTOか({ ...正しい札, ラベル一覧: [1, 2] })).toBe(false);
  });

  it("ラベル一覧が空配列のオブジェクトを受理する", () => {
    expect(札DTOか({ ...正しい札, ラベル一覧: [] })).toBe(true);
  });

  it("添付一覧が配列でないオブジェクトを拒否する", () => {
    expect(札DTOか({ ...正しい札, 添付一覧: "x" })).toBe(false);
  });

  it("添付一覧の要素が想定形式でないオブジェクトを拒否する", () => {
    expect(札DTOか({ ...正しい札, 添付一覧: [{ 保存名: "a" }] })).toBe(false);
  });

  it("添付一覧が空配列のオブジェクトを受理する", () => {
    expect(札DTOか({ ...正しい札, 添付一覧: [] })).toBe(true);
  });

  it("チェック項目一覧と分解推奨の形式を検証する", () => {
    expect(札DTOか({ ...正しい札, チェック項目一覧: "x" })).toBe(false);
    expect(札DTOか({ ...正しい札, チェック項目一覧: [{ id: "x", 本文: "y", 完了: "no" }] })).toBe(false);
    expect(札DTOか({ ...正しい札, 分解推奨: "yes" })).toBe(false);
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
