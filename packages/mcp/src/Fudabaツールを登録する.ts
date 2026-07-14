import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 札種別一覧, 札状態一覧 } from "@fudaba/core";
import { z } from "zod";
import {
  札一覧を取得する,
  札を作成する,
  札を更新する,
  type Fudaba応答,
} from "./Fudabaクライアント.js";

function 応答を整形する(応答: Fudaba応答): string {
  if (応答.種別 === "失敗") {
    return `[FUDABA_ERROR] ${応答.理由}`;
  }
  return JSON.stringify(応答.データ, null, 2);
}

// レスポンスは外部境界（HTTP経由のJSON）のためunknownで受け、フィールドの型を
// 確認しながら絞り込む。フィルタに一致しない・形が想定と違う項目は除外する
interface 一覧絞り込みフィルタ {
  readonly 種別?: string;
  readonly 状態?: string;
  readonly 担当者?: string;
  readonly ラベル一覧?: readonly string[];
}

function 項目のラベル一覧を持つか(項目: object, 必須ラベル一覧: readonly string[]): boolean {
  if (!("ラベル一覧" in 項目) || !Array.isArray(項目.ラベル一覧)) return false;
  const 項目のラベル一覧: unknown[] = 項目.ラベル一覧;
  return 必須ラベル一覧.every((ラベル) => 項目のラベル一覧.includes(ラベル));
}

function 項目が一致するか(項目: unknown, フィルタ: 一覧絞り込みフィルタ): boolean {
  if (typeof 項目 !== "object" || 項目 === null) return false;
  if (
    フィルタ.種別 !== undefined &&
    !("種別" in 項目 && 項目.種別 === フィルタ.種別)
  ) {
    return false;
  }
  if (
    フィルタ.状態 !== undefined &&
    !("状態" in 項目 && 項目.状態 === フィルタ.状態)
  ) {
    return false;
  }
  if (
    フィルタ.担当者 !== undefined &&
    !("担当者" in 項目 && 項目.担当者 === フィルタ.担当者)
  ) {
    return false;
  }
  if (
    フィルタ.ラベル一覧 !== undefined &&
    フィルタ.ラベル一覧.length > 0 &&
    !項目のラベル一覧を持つか(項目, フィルタ.ラベル一覧)
  ) {
    return false;
  }
  return true;
}

function 一覧を絞り込む(一覧: unknown, フィルタ: 一覧絞り込みフィルタ): unknown {
  if (!Array.isArray(一覧)) return 一覧;
  return 一覧.filter((項目: unknown) => 項目が一致するか(項目, フィルタ));
}

// Fudabaの3点セットのうち「MCPツール登録関数」。Jimbo MCP(:7110)への注入型登録
// （参照: DESIGN.md「提供する3点セット」）。fudabaBaseUrlは呼び出し元（ホスト側の内蔵MCPサーバー）が
// 実際にFudabaルートを間借りさせたワークスペースサーバーのポートから渡す
export function Fudabaツールを登録する(server: McpServer, fudabaBaseUrl: string): void {
  server.tool(
    "fudaba_create",
    "Fudaba（人間とAIが共有する作業アイテム台帳）に新しい札を作成する。" +
      "発見したバグは種別=バグ、依頼・自発タスクは種別=タスク、意思決定は種別=決定、" +
      "自由記録は種別=メモとして記録する。人間は同じ札をカンバンUIで見ている。",
    {
      kind: z.enum(札種別一覧).describe(`札の種別（${札種別一覧.join(" | ")}）`),
      title: z.string().min(1).describe("札の見出し"),
      body: z.string().describe("札の詳細本文"),
      creator: z.string().min(1).describe("自分のエージェント名・人間名"),
      assignee: z.string().optional().describe("担当者名（省略すると未割当）"),
      roomLink: z.string().optional().describe("関連するAgentRoomのルーム名（弱参照、省略可）"),
      labels: z
        .array(z.string())
        .optional()
        .describe(
          "自由文字列タグ（省略可）。所属が決まらないアイデアはラベルなしで投げてよい。" +
            "リポジトリ名等（jimbo/fudaba/boomyack/agentroom）はラベルの慣用として使う",
        ),
    },
    async ({ kind, title, body, creator, assignee, roomLink, labels }) => {
      const 応答 = await 札を作成する(fudabaBaseUrl, {
        種別: kind,
        タイトル: title,
        本文: body,
        作成者: creator,
        ...(assignee !== undefined ? { 担当者: assignee } : {}),
        ...(roomLink !== undefined ? { ルーム名: roomLink } : {}),
        ...(labels !== undefined ? { ラベル一覧: labels } : {}),
      });
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_update",
    "Fudabaの既存の札を部分更新する。種別・タイトル・本文・状態・担当者・ラベル一覧のうち渡した" +
      "フィールドだけが変更される。状態遷移に制約は無い（どの状態からどの状態へも変更可）。種別も" +
      "後から変更できる（例: メモとして書いたら実はバグだった、等）。" +
      "担当者を解除するには担当者解除=true を渡す（担当者と同時指定はできない）。" +
      "ラベル一覧を渡すと既存のラベルは全て置き換わる（部分追加ではない）。",
    {
      id: z.number().int().positive().describe("更新する札のID"),
      kind: z.enum(札種別一覧).optional().describe(`札の種別（${札種別一覧.join(" | ")}）`),
      title: z.string().min(1).optional(),
      body: z.string().optional(),
      status: z.enum(札状態一覧).optional().describe(`札の状態（${札状態一覧.join(" | ")}）`),
      assignee: z.string().optional().describe("新しい担当者名"),
      unassign: z.boolean().optional().default(false).describe("trueで担当者を未割当に戻す"),
      labels: z
        .array(z.string())
        .optional()
        .describe("新しいラベル一覧（既存のラベルを全て置き換える）"),
    },
    async ({ id, kind, title, body, status, assignee, unassign, labels }) => {
      const 応答 = await 札を更新する(fudabaBaseUrl, id, {
        ...(kind !== undefined ? { 種別: kind } : {}),
        ...(title !== undefined ? { タイトル: title } : {}),
        ...(body !== undefined ? { 本文: body } : {}),
        ...(status !== undefined ? { 状態: status } : {}),
        ...(unassign === true ? { 担当者: null } : assignee !== undefined ? { 担当者: assignee } : {}),
        ...(labels !== undefined ? { ラベル一覧: labels } : {}),
      });
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_list",
    "Fudabaの札一覧を取得する。種別・状態・担当者・ラベル一覧を指定するとその条件で絞り込む" +
      "（省略時は全件）。ラベル一覧は指定した全ラベルを持つ札だけに絞り込む（AND条件）。" +
      "自分が今何をすべきか分からなくなったら担当者=自分名義で呼ぶとよい。" +
      "各項目には添付一覧（保存名・ファイル名・バイト数・追加時刻の配列）が含まれる。" +
      "バグ調査でスクリーンショットが貼られている札は添付一覧が空でないので、" +
      "調査前に確認するとよい（画像自体はfudaba_listでは取得できず、AI向けの取得手段は未実装）。",
    {
      kind: z.enum(札種別一覧).optional(),
      status: z.enum(札状態一覧).optional(),
      assignee: z.string().optional(),
      labels: z.array(z.string()).optional().describe("指定した全ラベルを持つ札に絞り込む"),
    },
    async ({ kind, status, assignee, labels }) => {
      const 応答 = await 札一覧を取得する(fudabaBaseUrl);
      if (応答.種別 === "失敗") {
        return { content: [{ type: "text", text: 応答を整形する(応答) }] };
      }
      const 絞り込み済み: Fudaba応答 = {
        種別: "成功",
        データ: 一覧を絞り込む(応答.データ, {
          ...(kind !== undefined ? { 種別: kind } : {}),
          ...(status !== undefined ? { 状態: status } : {}),
          ...(assignee !== undefined ? { 担当者: assignee } : {}),
          ...(labels !== undefined ? { ラベル一覧: labels } : {}),
        }),
      };
      return { content: [{ type: "text", text: 応答を整形する(絞り込み済み) }] };
    },
  );
}
