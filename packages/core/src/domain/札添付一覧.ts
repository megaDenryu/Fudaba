import { 添付, type 添付DTO } from "./添付.js";
import { 添付保存名 } from "./添付保存名.js";

// 札が持つ0個以上の画像添付集合。ラベルと異なり作成時には持てず（POST /items は非対応）、
// 追加・削除は専用エンドポイント経由でのみ行う（DESIGN.md「札添付」節を参照）
export class 札添付一覧 {
  private constructor(private readonly 内部一覧: readonly 添付[]) {}

  static create(一覧: readonly 添付[]): 札添付一覧 {
    return new 札添付一覧([...一覧]);
  }

  static 空 = (): 札添付一覧 => new 札添付一覧([]);

  get 一覧(): readonly 添付[] {
    return this.内部一覧;
  }

  含むか(保存名: string): boolean {
    return this.内部一覧.some((対象) => 対象.保存名.値 === 保存名);
  }

  追加する(対象: 添付): 札添付一覧 {
    return new 札添付一覧([...this.内部一覧, 対象]);
  }

  除外する(保存名: string): 札添付一覧 {
    return new 札添付一覧(this.内部一覧.filter((対象) => 対象.保存名.値 !== 保存名));
  }
}

export function 札添付一覧をDTO値にする(対象: 札添付一覧): string {
  return JSON.stringify(対象.一覧.map((添付) => 添付.toJSON()));
}

export function 札添付一覧をDTO値から作る(値: string): 札添付一覧 {
  const 復元: unknown = JSON.parse(値);
  if (!Array.isArray(復元)) {
    throw new Error(`attachments列の値がJSON配列ではありません: ${値}`);
  }
  return 札添付一覧.create(復元.map((項目) => 添付DTOから作る(項目)));
}

function 添付DTOに絞る(項目: unknown): 添付DTO {
  if (
    typeof 項目 === "object" &&
    項目 !== null &&
    "保存名" in 項目 &&
    typeof 項目.保存名 === "string" &&
    "ファイル名" in 項目 &&
    typeof 項目.ファイル名 === "string" &&
    "バイト数" in 項目 &&
    typeof 項目.バイト数 === "number" &&
    "追加時刻" in 項目 &&
    typeof 項目.追加時刻 === "string"
  ) {
    return {
      保存名: 項目.保存名,
      ファイル名: 項目.ファイル名,
      バイト数: 項目.バイト数,
      追加時刻: 項目.追加時刻,
    };
  }
  throw new Error(`attachments列の要素が想定形式と一致しません: ${JSON.stringify(項目)}`);
}

function 添付DTOから作る(項目: unknown): 添付 {
  const dto = 添付DTOに絞る(項目);
  return 添付.create({
    保存名: 添付保存名.create(dto.保存名),
    ファイル名: dto.ファイル名,
    バイト数: dto.バイト数,
    追加時刻ISO: dto.追加時刻,
  });
}
