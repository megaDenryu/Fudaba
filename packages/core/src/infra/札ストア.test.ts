import { describe, expect, it, vi } from "vitest";
import { 添付 } from "../domain/添付.js";
import { 添付保存名 } from "../domain/添付保存名.js";
import { メンバー名 } from "../domain/メンバー名.js";
import { 札ID } from "../domain/札ID.js";
import { 札種別 } from "../domain/札種別.js";
import { 札状態 } from "../domain/札状態.js";
import { 札ラベル一覧 } from "../domain/札ラベル一覧.js";
import { 割当済み, 未割当 } from "../domain/担当者.js";
import { 未リンク, ルームにリンクする } from "../domain/札リンク.js";
import { 札ストア } from "./札ストア.js";

function 添付を作る(保存名文字列: string): 添付 {
  return 添付.create({
    保存名: 添付保存名.create(保存名文字列),
    ファイル名: "screenshot.png",
    バイト数: 1024,
    追加時刻ISO: "2026-07-14T00:00:00.000Z",
  });
}

function 追加する(
  ストア: 札ストア,
  上書き: { タイトル?: string; ラベル一覧?: readonly string[] } = {},
) {
  return ストア.追加する({
    種別: 札種別.create("バグ"),
    タイトル: 上書き.タイトル ?? "サンプル札",
    本文: "本文",
    担当者: 未割当,
    作成者: メンバー名.create("claude"),
    リンク: 未リンク,
    ラベル一覧: 札ラベル一覧.create(上書き.ラベル一覧 ?? []),
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
        種別: undefined,
        タイトル: "先(更新)",
        本文: undefined,
        状態: undefined,
        担当者: undefined,
        ラベル一覧: undefined,
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
      種別: undefined,
      タイトル: undefined,
      本文: undefined,
      状態: 札状態.create("進行中"),
      担当者: 割当済み(メンバー名.create("codex")),
      ラベル一覧: undefined,
    });
    expect(更新後?.状態.値).toBe("進行中");
    expect(更新後?.担当者).toEqual(割当済み(メンバー名.create("codex")));
    expect(更新後?.タイトル).toBe("サンプル札");
  });

  it("更新するは種別も変更でき、再取得後も反映が保持される", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 追加済み = 追加する(ストア);
    expect(追加済み.種別.値).toBe("バグ");
    ストア.更新する(追加済み.id, {
      種別: 札種別.create("決定"),
      タイトル: undefined,
      本文: undefined,
      状態: undefined,
      担当者: undefined,
      ラベル一覧: undefined,
    });
    const 再取得 = ストア.IDで取得する(追加済み.id);
    expect(再取得?.種別.値).toBe("決定");
  });

  it("担当者へ未割当を明示指定すると解除される", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 追加済み = ストア.追加する({
      種別: 札種別.create("実装"),
      タイトル: "サンプル",
      本文: "",
      担当者: 割当済み(メンバー名.create("codex")),
      作成者: メンバー名.create("claude"),
      リンク: ルームにリンクする("dev"),
      ラベル一覧: 札ラベル一覧.空(),
    });
    const 更新後 = ストア.更新する(追加済み.id, {
      種別: undefined,
      タイトル: undefined,
      本文: undefined,
      状態: undefined,
      担当者: 未割当,
      ラベル一覧: undefined,
    });
    expect(更新後?.担当者).toEqual(未割当);
  });

  it("存在しないIDの更新はnullを返す", () => {
    const ストア = 札ストア.メモリ上に作る();
    const 結果 = ストア.更新する(札ID.create(9999), {
      種別: undefined,
      タイトル: undefined,
      本文: undefined,
      状態: undefined,
      担当者: undefined,
      ラベル一覧: undefined,
    });
    expect(結果).toBeNull();
  });

  describe("ラベル", () => {
    it("追加時のラベル一覧が保持され、再取得後も反映される", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア, { ラベル一覧: ["fudaba", "jimbo"] });
      expect(追加済み.ラベル一覧.値一覧).toEqual(["fudaba", "jimbo"]);
      const 再取得 = ストア.IDで取得する(追加済み.id);
      expect(再取得?.ラベル一覧.値一覧).toEqual(["fudaba", "jimbo"]);
    });

    it("更新するでラベル一覧を差し替えられる", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア, { ラベル一覧: ["旧"] });
      const 更新後 = ストア.更新する(追加済み.id, {
        種別: undefined,
        タイトル: undefined,
        本文: undefined,
        状態: undefined,
        担当者: undefined,
        ラベル一覧: 札ラベル一覧.create(["新"]),
      });
      expect(更新後?.ラベル一覧.値一覧).toEqual(["新"]);
    });

    it("一覧を取得するにラベルフィルタを渡すと指定ラベルを全て持つ札だけ返る", () => {
      const ストア = 札ストア.メモリ上に作る();
      追加する(ストア, { タイトル: "両方持つ", ラベル一覧: ["fudaba", "urgent"] });
      追加する(ストア, { タイトル: "片方だけ", ラベル一覧: ["fudaba"] });
      追加する(ストア, { タイトル: "無関係", ラベル一覧: ["boomyack"] });

      const 絞り込み結果 = ストア.一覧を取得する({ ラベル一覧: ["fudaba", "urgent"] });
      expect(絞り込み結果.map((札) => 札.タイトル)).toEqual(["両方持つ"]);
    });

    it("フィルタ未指定なら全件返る", () => {
      const ストア = 札ストア.メモリ上に作る();
      追加する(ストア, { ラベル一覧: ["a"] });
      追加する(ストア, { ラベル一覧: [] });
      expect(ストア.一覧を取得する()).toHaveLength(2);
    });
  });

  describe("添付", () => {
    it("追加した札は添付一覧が空", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア);
      expect(追加済み.添付一覧.一覧).toEqual([]);
    });

    it("添付を追加すると再取得後も反映される", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア);
      const 対象 = 添付を作る("a".repeat(32) + ".png");
      const 更新後 = ストア.添付を追加する(追加済み.id, 対象);
      expect(更新後?.添付一覧.一覧).toHaveLength(1);
      const 再取得 = ストア.IDで取得する(追加済み.id);
      expect(再取得?.添付一覧.一覧).toHaveLength(1);
      expect(再取得?.添付一覧.含むか("a".repeat(32) + ".png")).toBe(true);
    });

    it("添付を除外すると一覧から消える", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア);
      const 保存名 = "a".repeat(32) + ".png";
      ストア.添付を追加する(追加済み.id, 添付を作る(保存名));
      const 更新後 = ストア.添付を除外する(追加済み.id, 保存名);
      expect(更新後?.添付一覧.一覧).toEqual([]);
    });

    it("存在しない札への添付追加はnullを返す", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 結果 = ストア.添付を追加する(札ID.create(9999), 添付を作る("a".repeat(32) + ".png"));
      expect(結果).toBeNull();
    });

    it("存在しない保存名の除外は例外を投げる", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア);
      expect(() => ストア.添付を除外する(追加済み.id, "b".repeat(32) + ".png")).toThrow();
    });

    it("添付追加はラベル等の他フィールドを変更しない", () => {
      const ストア = 札ストア.メモリ上に作る();
      const 追加済み = 追加する(ストア, { タイトル: "元タイトル", ラベル一覧: ["fudaba"] });
      const 更新後 = ストア.添付を追加する(追加済み.id, 添付を作る("a".repeat(32) + ".png"));
      expect(更新後?.タイトル).toBe("元タイトル");
      expect(更新後?.ラベル一覧.値一覧).toEqual(["fudaba"]);
    });
  });
});
