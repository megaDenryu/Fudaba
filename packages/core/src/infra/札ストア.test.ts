import { describe, expect, it, vi } from "vitest";
import { メンバー名 } from "../domain/メンバー名.js";
import { 札ID } from "../domain/札ID.js";
import { 札種別 } from "../domain/札種別.js";
import { 札状態 } from "../domain/札状態.js";
import { 割当済み, 未割当 } from "../domain/担当者.js";
import { 未リンク, ルームにリンクする } from "../domain/札リンク.js";
import { 札ストア } from "./札ストア.js";

function 追加する(ストア: 札ストア, 上書き: { タイトル?: string } = {}) {
  return ストア.追加する({
    種別: 札種別.create("バグ"),
    タイトル: 上書き.タイトル ?? "サンプル札",
    本文: "本文",
    担当者: 未割当,
    作成者: メンバー名.create("claude"),
    リンク: 未リンク,
  });
}

describe("札ストア", () => {
  it("追加した札は未着手状態でIDが採番される", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 追加済み = 追加する(ストア);
    expect(追加済み.id.値).toBeGreaterThan(0);
    expect(追加済み.状態.値).toBe("未着手");
  });

  it("一覧は更新時刻降順で返る", () => {
    // 更新時刻はミリ秒精度のISO文字列なので、同一ミリ秒内の連続操作だと順序が
    // 不定になる。フェイクタイマーで各操作の時刻を明示的にずらして決定的にする
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-07-14T00:00:00.000Z"));
      const ストア = 札ストア.メモリ上に作る();
      const 一件目 = 追加する(ストア, { タイトル: "先" });
      vi.setSystemTime(new Date("2026-07-14T00:00:01.000Z"));
      const 二件目 = 追加する(ストア, { タイトル: "後" });
      vi.setSystemTime(new Date("2026-07-14T00:00:02.000Z"));
      ストア.更新する(一件目.id, {
        タイトル: "先(更新)",
        本文: undefined,
        状態: undefined,
        担当者: undefined,
      });

      const 一覧 = ストア.一覧を取得する();
      expect(一覧).toHaveLength(2);
      expect(一覧[0]?.id.値).toBe(一件目.id.値);
      expect(一覧[1]?.id.値).toBe(二件目.id.値);
    } finally {
      vi.useRealTimers();
    }
  });

  it("更新するは指定フィールドだけを変更する", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 追加済み = 追加する(ストア);
    const 更新後 = ストア.更新する(追加済み.id, {
      タイトル: undefined,
      本文: undefined,
      状態: 札状態.create("進行中"),
      担当者: 割当済み(メンバー名.create("codex")),
    });
    expect(更新後?.状態.値).toBe("進行中");
    expect(更新後?.担当者).toEqual(割当済み(メンバー名.create("codex")));
    expect(更新後?.タイトル).toBe("サンプル札");
  });

  it("担当者へ未割当を明示指定すると解除される", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 追加済み = ストア.追加する({
      種別: 札種別.create("タスク"),
      タイトル: "サンプル",
      本文: "",
      担当者: 割当済み(メンバー名.create("codex")),
      作成者: メンバー名.create("claude"),
      リンク: ルームにリンクする("dev"),
    });
    const 更新後 = ストア.更新する(追加済み.id, {
      タイトル: undefined,
      本文: undefined,
      状態: undefined,
      担当者: 未割当,
    });
    expect(更新後?.担当者).toEqual(未割当);
  });

  it("存在しないIDの更新はnullを返す", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 結果 = ストア.更新する(札ID.create(9999), {
      タイトル: undefined,
      本文: undefined,
      状態: undefined,
      担当者: undefined,
    });
    expect(結果).toBeNull();
  });
});
