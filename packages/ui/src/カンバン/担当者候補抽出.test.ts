import { describe, expect, it } from "vitest";
import type { 札DTO } from "../通信/札型";
import { 担当者候補一覧を抽出する } from "./担当者候補抽出";

function 札を作る(上書き: Partial<札DTO>): 札DTO {
  return {
    id: 1,
    種別: "タスク",
    タイトル: "サンプル",
    本文: "本文",
    状態: "未着手",
    担当者: null,
    作成者: "claude",
    ルーム名: null,
    ラベル一覧: [],
    添付一覧: [],
    作成時刻: "2026-07-14T00:00:00.000Z",
    更新時刻: "2026-07-14T00:00:00.000Z",
    ...上書き,
  };
}

describe("担当者候補一覧を抽出する", () => {
  it("担当者と作成者の両方を候補にする", () => {
    const 候補 = 担当者候補一覧を抽出する([
      札を作る({ 担当者: "codex", 作成者: "claude" }),
    ]);
    expect(候補).toEqual(["claude", "codex"]);
  });

  it("重複した名前は1件にまとめる", () => {
    const 候補 = 担当者候補一覧を抽出する([
      札を作る({ id: 1, 担当者: "codex", 作成者: "claude" }),
      札を作る({ id: 2, 担当者: "codex", 作成者: "claude" }),
    ]);
    expect(候補).toEqual(["claude", "codex"]);
  });

  it("未割当(担当者null)の札は担当者として候補に含めない", () => {
    const 候補 = 担当者候補一覧を抽出する([札を作る({ 担当者: null, 作成者: "claude" })]);
    expect(候補).toEqual(["claude"]);
  });

  it("空の一覧からは空配列を返す", () => {
    expect(担当者候補一覧を抽出する([])).toEqual([]);
  });
});
