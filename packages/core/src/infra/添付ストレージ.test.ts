import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { 添付拡張子 } from "../domain/添付拡張子.js";
import { 添付保存名 } from "../domain/添付保存名.js";
import { 添付ストレージ } from "./添付ストレージ.js";

describe("添付ストレージ", () => {
  let ディレクトリ: string;

  beforeEach(() => {
    ディレクトリ = path.join(mkdtempSync(path.join(tmpdir(), "fudaba-storage-test-")), "attachments");
  });

  afterEach(() => {
    rmSync(path.dirname(ディレクトリ), { recursive: true, force: true });
  });

  it("保存すると未存在のディレクトリも作成してファイルを書き込む", async () => {
    expect(existsSync(ディレクトリ)).toBe(false);
    const ストレージ = 添付ストレージ.ディレクトリを指定して作る(ディレクトリ);
    const 保存名 = await ストレージ.保存する(Buffer.from("test-binary"), 添付拡張子.create("png"));
    expect(existsSync(path.join(ディレクトリ, 保存名.値))).toBe(true);
  });

  it("保存したファイルを読み込める", async () => {
    const ストレージ = 添付ストレージ.ディレクトリを指定して作る(ディレクトリ);
    const 保存名 = await ストレージ.保存する(Buffer.from("hello"), 添付拡張子.create("png"));
    const 読み込み結果 = await ストレージ.読み込む(保存名);
    expect(読み込み結果?.toString()).toBe("hello");
  });

  it("存在しない保存名の読み込みはnullを返す", async () => {
    const ストレージ = 添付ストレージ.ディレクトリを指定して作る(ディレクトリ);
    const 未存在 = 添付保存名.create(`${"a".repeat(32)}.png`);
    expect(await ストレージ.読み込む(未存在)).toBeNull();
  });

  it("削除すると読み込めなくなる", async () => {
    const ストレージ = 添付ストレージ.ディレクトリを指定して作る(ディレクトリ);
    const 保存名 = await ストレージ.保存する(Buffer.from("hello"), 添付拡張子.create("png"));
    await ストレージ.削除する(保存名);
    expect(await ストレージ.読み込む(保存名)).toBeNull();
  });

  it("存在しないファイルの削除は例外にならない", async () => {
    const ストレージ = 添付ストレージ.ディレクトリを指定して作る(ディレクトリ);
    const 未存在 = 添付保存名.create(`${"a".repeat(32)}.png`);
    await expect(ストレージ.削除する(未存在)).resolves.not.toThrow();
  });

  it("2回保存すると異なる保存名が採番される", async () => {
    const ストレージ = 添付ストレージ.ディレクトリを指定して作る(ディレクトリ);
    const 一件目 = await ストレージ.保存する(Buffer.from("a"), 添付拡張子.create("png"));
    const 二件目 = await ストレージ.保存する(Buffer.from("b"), 添付拡張子.create("png"));
    expect(一件目.equals(二件目)).toBe(false);
  });
});
