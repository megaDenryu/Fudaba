import type Database from "better-sqlite3";
import {
  回答,
  回答済み問い,
  問い選択肢,
  未回答問い,
  type 問い,
  type 問い選択肢DTO,
} from "../domain/問い.js";
import { 問いID } from "../domain/問いID.js";
import { 問い回答済みエラー } from "../domain/問い回答済みエラー.js";
import { 問い未検出エラー } from "../domain/問い未検出エラー.js";
import { 検証エラー } from "../domain/検証エラー.js";
import { 添付, type 添付DTO } from "../domain/添付.js";
import { 添付保存名 } from "../domain/添付保存名.js";

interface 問い行 {
  readonly id: number;
  readonly title: string;
  readonly body: string;
  readonly choices: string;
  readonly related_item_id: number | null;
  readonly room_link: string | null;
  readonly creator: string;
  readonly created_at: string;
  readonly attachments: string;
  readonly answer_seq: number | null;
  readonly choice_id: string | null;
  readonly respondent: string | null;
  readonly note: string | null;
  readonly answered_at: string | null;
}

export interface 回答イベントDTO {
  readonly 連番: number;
  readonly 問いID: number;
  readonly 選択肢ID: string;
  readonly 回答者: string;
  readonly メモ: string;
  readonly 回答時刻: string;
}

function 問い行に絞る(行: unknown): 問い行 {
  if (
    typeof 行 === "object" &&
    行 !== null &&
    "id" in 行 && typeof 行.id === "number" &&
    "title" in 行 && typeof 行.title === "string" &&
    "body" in 行 && typeof 行.body === "string" &&
    "choices" in 行 && typeof 行.choices === "string" &&
    "related_item_id" in 行 && (行.related_item_id === null || typeof 行.related_item_id === "number") &&
    "room_link" in 行 && (行.room_link === null || typeof 行.room_link === "string") &&
    "creator" in 行 && typeof 行.creator === "string" &&
    "created_at" in 行 && typeof 行.created_at === "string" &&
    "attachments" in 行 && typeof 行.attachments === "string" &&
    "answer_seq" in 行 && (行.answer_seq === null || typeof 行.answer_seq === "number") &&
    "choice_id" in 行 && (行.choice_id === null || typeof 行.choice_id === "string") &&
    "respondent" in 行 && (行.respondent === null || typeof 行.respondent === "string") &&
    "note" in 行 && (行.note === null || typeof 行.note === "string") &&
    "answered_at" in 行 && (行.answered_at === null || typeof 行.answered_at === "string")
  ) return {
    id: 行.id,
    title: 行.title,
    body: 行.body,
    choices: 行.choices,
    related_item_id: 行.related_item_id,
    room_link: 行.room_link,
    creator: 行.creator,
    created_at: 行.created_at,
    attachments: 行.attachments,
    answer_seq: 行.answer_seq,
    choice_id: 行.choice_id,
    respondent: 行.respondent,
    note: 行.note,
    answered_at: 行.answered_at,
  };
  throw new Error(`問いのDB行がスキーマと一致しません: ${JSON.stringify(行)}`);
}

function 添付一覧を復元する(JSON文字列: string): readonly 添付[] {
  const 値: unknown = JSON.parse(JSON文字列);
  if (!Array.isArray(値)) throw new Error("問いの添付JSONが配列ではありません");
  return 値.map((項目: unknown) => {
    if (
      typeof 項目 !== "object" || 項目 === null ||
      !("保存名" in 項目) || typeof 項目.保存名 !== "string" ||
      !("ファイル名" in 項目) || typeof 項目.ファイル名 !== "string" ||
      !("バイト数" in 項目) || typeof 項目.バイト数 !== "number" ||
      !("追加時刻" in 項目) || typeof 項目.追加時刻 !== "string"
    ) throw new Error(`問いの添付JSONが不正です: ${JSON.stringify(項目)}`);
    return 添付.create({
      保存名: 添付保存名.create(項目.保存名),
      ファイル名: 項目.ファイル名,
      バイト数: 項目.バイト数,
      追加時刻ISO: 項目.追加時刻,
    });
  });
}

function 選択肢一覧を復元する(JSON文字列: string): readonly 問い選択肢[] {
  const 値: unknown = JSON.parse(JSON文字列);
  if (!Array.isArray(値)) throw new Error("問いの選択肢JSONが配列ではありません");
  return 値.map((項目: unknown) => {
    if (
      typeof 項目 !== "object" || 項目 === null ||
      !("id" in 項目) || typeof 項目.id !== "string" ||
      !("ラベル" in 項目) || typeof 項目.ラベル !== "string" ||
      !("ショートカット" in 項目) ||
      !(項目.ショートカット === null || typeof 項目.ショートカット === "string")
    ) throw new Error(`問いの選択肢JSONが不正です: ${JSON.stringify(項目)}`);
    return 問い選択肢.create({ id: 項目.id, ラベル: 項目.ラベル, ショートカット: 項目.ショートカット });
  });
}

function 行から問いを復元する(行: 問い行): 問い {
  const 共通 = {
    id: 問いID.create(行.id),
    タイトル: 行.title,
    本文: 行.body,
    選択肢一覧: 選択肢一覧を復元する(行.choices),
    関連札ID: 行.related_item_id,
    ルーム名: 行.room_link,
    作成者: 行.creator,
    作成時刻ISO: 行.created_at,
    添付一覧: 添付一覧を復元する(行.attachments),
  };
  if (
    行.answer_seq === null && 行.choice_id === null && 行.respondent === null &&
    行.note === null && 行.answered_at === null
  ) return 未回答問い.create(共通);
  if (
    行.answer_seq !== null && 行.choice_id !== null && 行.respondent !== null &&
    行.note !== null && 行.answered_at !== null
  ) {
    return 回答済み問い.create({
      ...共通,
      回答: 回答.create({
        連番: 行.answer_seq,
        選択肢ID: 行.choice_id,
        回答者: 行.respondent,
        メモ: 行.note,
        回答時刻ISO: 行.answered_at,
      }),
    });
  }
  throw new Error(`問い${行.id}の回答列が部分的にnullです`);
}

const 問いSELECT = `
  SELECT q.*, a.seq AS answer_seq, a.choice_id, a.respondent, a.note, a.answered_at
  FROM fudaba_questions q
  LEFT JOIN fudaba_answers a ON a.question_id = q.id
`;

export class 問いリポジトリ {
  constructor(private readonly db: Database.Database) {}

  追加する(引数: {
    タイトル: string;
    本文: string;
    選択肢一覧: readonly 問い選択肢[];
    関連札ID: number | null;
    ルーム名: string | null;
    作成者: string;
  }): 未回答問い {
    const 時刻ISO = new Date().toISOString();
    const 選択肢DTO一覧: readonly 問い選択肢DTO[] = 引数.選択肢一覧.map((値) => 値.toJSON());
    const 結果 = this.db.prepare(
      `INSERT INTO fudaba_questions (title, body, choices, related_item_id, room_link, creator, created_at, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, '[]')`,
    ).run(
      引数.タイトル,
      引数.本文,
      JSON.stringify(選択肢DTO一覧),
      引数.関連札ID,
      引数.ルーム名,
      引数.作成者,
      時刻ISO,
    );
    return 未回答問い.create({
      id: 問いID.create(Number(結果.lastInsertRowid)),
      ...引数,
      作成時刻ISO: 時刻ISO,
      添付一覧: [],
    });
  }

  添付を追加する(id: 問いID, 対象: 添付): 問い | null {
    const 現在 = this.IDで取得する(id);
    if (現在 === null) return null;
    const 一覧 = [...現在.共通.添付一覧, 対象];
    const DTO一覧: readonly 添付DTO[] = 一覧.map((添付) => 添付.toJSON());
    this.db.prepare("UPDATE fudaba_questions SET attachments = ? WHERE id = ?")
      .run(JSON.stringify(DTO一覧), id.値);
    return this.IDで取得する(id);
  }

  一覧を取得する(kind?: "未回答" | "回答済み"): 問い[] {
    const 条件 = kind === "未回答" ? " WHERE a.seq IS NULL" : kind === "回答済み" ? " WHERE a.seq IS NOT NULL" : "";
    const 行一覧 = this.db.prepare(`${問いSELECT}${条件} ORDER BY q.id DESC`).all();
    return 行一覧.map((行) => 行から問いを復元する(問い行に絞る(行)));
  }

  IDで取得する(id: 問いID): 問い | null {
    const 行 = this.db.prepare(`${問いSELECT} WHERE q.id = ?`).get(id.値);
    return 行 === undefined ? null : 行から問いを復元する(問い行に絞る(行));
  }

  回答する(id: 問いID, 選択肢ID: string, 回答者: string, メモ: string): 回答済み問い {
    const 処理 = this.db.transaction(() => {
      const 問い = this.IDで取得する(id);
      if (問い === null) throw new 問い未検出エラー(id.値);
      if (問い.kind === "回答済み") throw new 問い回答済みエラー(id.値);
      if (!問い.共通.選択肢一覧.some((選択肢) => 選択肢.id === 選択肢ID)) {
        throw new 検証エラー(`問い${id.値}に選択肢「${選択肢ID}」は存在しません`);
      }
      this.db.prepare(
        `INSERT INTO fudaba_answers (question_id, choice_id, respondent, note, answered_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(id.値, 選択肢ID, 回答者.trim(), メモ, new Date().toISOString());
      const 回答後 = this.IDで取得する(id);
      if (回答後 === null || 回答後.kind !== "回答済み") {
        throw new Error(`問い${id.値}の回答保存後の再取得に失敗しました`);
      }
      return 回答後;
    });
    return 処理();
  }

  回答イベントを取得する(基準連番: number, 問いID一覧: readonly number[]): 回答イベントDTO[] {
    const 条件 = 問いID一覧.length === 0 ? "" : ` AND question_id IN (${問いID一覧.map(() => "?").join(",")})`;
    const 行一覧: unknown[] = this.db.prepare(
      `SELECT seq, question_id, choice_id, respondent, note, answered_at
       FROM fudaba_answers WHERE seq > ?${条件} ORDER BY seq ASC`,
    ).all(基準連番, ...問いID一覧);
    return 行一覧.map((行) => {
      if (
        typeof 行 !== "object" || 行 === null ||
        !("seq" in 行) || typeof 行.seq !== "number" ||
        !("question_id" in 行) || typeof 行.question_id !== "number" ||
        !("choice_id" in 行) || typeof 行.choice_id !== "string" ||
        !("respondent" in 行) || typeof 行.respondent !== "string" ||
        !("note" in 行) || typeof 行.note !== "string" ||
        !("answered_at" in 行) || typeof 行.answered_at !== "string"
      ) throw new Error(`回答イベントのDB行が不正です: ${JSON.stringify(行)}`);
      return {
        連番: 行.seq,
        問いID: 行.question_id,
        選択肢ID: 行.choice_id,
        回答者: 行.respondent,
        メモ: 行.note,
        回答時刻: 行.answered_at,
      };
    });
  }
}
