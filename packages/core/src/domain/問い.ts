import { 検証エラー } from "./検証エラー.js";
import { 問いID } from "./問いID.js";
import type { 添付, 添付DTO } from "./添付.js";

export interface 問い選択肢DTO {
  readonly id: string;
  readonly ラベル: string;
  readonly ショートカット: string | null;
}

export interface 回答DTO {
  readonly 連番: number;
  readonly 選択肢ID: string;
  readonly 回答者: string;
  readonly メモ: string;
  readonly 回答時刻: string;
}

interface 問い共通DTO {
  readonly id: number;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 選択肢一覧: readonly 問い選択肢DTO[];
  readonly 関連札ID: number | null;
  readonly ルーム名: string | null;
  readonly 作成者: string;
  readonly 作成時刻: string;
  readonly 添付一覧: readonly 添付DTO[];
}

export interface 未回答問いDTO extends 問い共通DTO {
  readonly kind: "未回答";
}

export interface 回答済み問いDTO extends 問い共通DTO {
  readonly kind: "回答済み";
  readonly 回答: 回答DTO;
}

export type 問いDTO = 未回答問いDTO | 回答済み問いDTO;

export class 問い選択肢 {
  private constructor(
    readonly id: string,
    readonly ラベル: string,
    readonly ショートカット: string | null,
  ) {}

  static create(引数: { id: string; ラベル: string; ショートカット?: string | null }): 問い選択肢 {
    const id = 引数.id.trim();
    const ラベル = 引数.ラベル.trim();
    const ショートカット = 引数.ショートカット?.trim().toLowerCase() || null;
    if (id.length === 0 || id.length > 64) {
      throw new 検証エラー("問いの選択肢IDは1〜64文字である必要があります");
    }
    if (ラベル.length === 0 || ラベル.length > 200) {
      throw new 検証エラー("問いの選択肢ラベルは1〜200文字である必要があります");
    }
    if (ショートカット !== null && ショートカット.length !== 1) {
      throw new 検証エラー("問いの選択肢ショートカットは1文字である必要があります");
    }
    return new 問い選択肢(id, ラベル, ショートカット);
  }

  toJSON(): 問い選択肢DTO {
    return { id: this.id, ラベル: this.ラベル, ショートカット: this.ショートカット };
  }
}

export class 回答 {
  private constructor(
    readonly 連番: number,
    readonly 選択肢ID: string,
    readonly 回答者: string,
    readonly メモ: string,
    readonly 回答時刻ISO: string,
  ) {}

  static create(引数: {
    連番: number;
    選択肢ID: string;
    回答者: string;
    メモ: string;
    回答時刻ISO: string;
  }): 回答 {
    if (!Number.isInteger(引数.連番) || 引数.連番 <= 0) {
      throw new Error(`回答連番が不正です: ${引数.連番}`);
    }
    const 回答者 = 引数.回答者.trim();
    if (回答者.length === 0) throw new 検証エラー("回答者は空にできません");
    return new 回答(引数.連番, 引数.選択肢ID, 回答者, 引数.メモ, 引数.回答時刻ISO);
  }

  toJSON(): 回答DTO {
    return {
      連番: this.連番,
      選択肢ID: this.選択肢ID,
      回答者: this.回答者,
      メモ: this.メモ,
      回答時刻: this.回答時刻ISO,
    };
  }
}

interface 問い共通引数 {
  readonly id: 問いID;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 選択肢一覧: readonly 問い選択肢[];
  readonly 関連札ID: number | null;
  readonly ルーム名: string | null;
  readonly 作成者: string;
  readonly 作成時刻ISO: string;
  readonly 添付一覧: readonly 添付[];
}

function 共通引数を検証する(引数: 問い共通引数): void {
  if (引数.タイトル.trim().length === 0 || 引数.タイトル.length > 300) {
    throw new 検証エラー("問いのタイトルは1〜300文字である必要があります");
  }
  if (引数.選択肢一覧.length < 2 || 引数.選択肢一覧.length > 20) {
    throw new 検証エラー("問いの選択肢は2〜20件である必要があります");
  }
  const id一覧 = 引数.選択肢一覧.map((選択肢) => 選択肢.id);
  if (new Set(id一覧).size !== id一覧.length) {
    throw new 検証エラー("問いの選択肢IDは問いの中で一意である必要があります");
  }
  const キー一覧 = 引数.選択肢一覧
    .map((選択肢) => 選択肢.ショートカット)
    .filter((値): 値 is string => 値 !== null);
  if (new Set(キー一覧).size !== キー一覧.length) {
    throw new 検証エラー("問いの選択肢ショートカットは問いの中で一意である必要があります");
  }
}

function 共通DTOを作る(引数: 問い共通引数): 問い共通DTO {
  return {
    id: 引数.id.値,
    タイトル: 引数.タイトル,
    本文: 引数.本文,
    選択肢一覧: 引数.選択肢一覧.map((選択肢) => 選択肢.toJSON()),
    関連札ID: 引数.関連札ID,
    ルーム名: 引数.ルーム名,
    作成者: 引数.作成者,
    作成時刻: 引数.作成時刻ISO,
    添付一覧: 引数.添付一覧.map((添付) => 添付.toJSON()),
  };
}

export class 未回答問い {
  readonly kind = "未回答" as const;
  private constructor(readonly 共通: 問い共通引数) {}

  static create(引数: 問い共通引数): 未回答問い {
    共通引数を検証する(引数);
    return new 未回答問い(引数);
  }

  toJSON(): 未回答問いDTO {
    return { kind: this.kind, ...共通DTOを作る(this.共通) };
  }
}

export class 回答済み問い {
  readonly kind = "回答済み" as const;
  private constructor(readonly 共通: 問い共通引数, readonly 回答: 回答) {}

  static create(引数: 問い共通引数 & { 回答: 回答 }): 回答済み問い {
    共通引数を検証する(引数);
    if (!引数.選択肢一覧.some((選択肢) => 選択肢.id === 引数.回答.選択肢ID)) {
      throw new Error(`回答の選択肢IDが問いに存在しません: ${引数.回答.選択肢ID}`);
    }
    return new 回答済み問い(引数, 引数.回答);
  }

  toJSON(): 回答済み問いDTO {
    return { kind: this.kind, ...共通DTOを作る(this.共通), 回答: this.回答.toJSON() };
  }
}

export type 問い = 未回答問い | 回答済み問い;
