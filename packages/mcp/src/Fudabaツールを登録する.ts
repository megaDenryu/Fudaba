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
function 項目が一致するか(
  項目: unknown,
  フィルタ: { 種別?: string; 状態?: string; 担当者?: string },
): boolean {
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
  return true;
}

function 一覧を絞り込む(
  一覧: unknown,
  フィルタ: { 種別?: string; 状態?: string; 担当者?: string },
): unknown {
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
      種別: z.enum(札種別一覧).describe(`札の種別（${札種別一覧.join(" | ")}）`),
      タイトル: z.string().min(1).describe("札の見出し"),
      本文: z.string().describe("札の詳細本文"),
      作成者: z.string().min(1).describe("自分のエージェント名・人間名"),
      担当者: z.string().optional().describe("担当者名（省略すると未割当）"),
      ルームリンク: z.string().optional().describe("関連するAgentRoomのルーム名（弱参照、省略可）"),
    },
    async ({ 種別, タイトル, 本文, 作成者, 担当者, ルームリンク }) => {
      const 応答 = await 札を作成する(fudabaBaseUrl, {
        種別,
        タイトル,
        本文,
        作成者,
        ...(担当者 !== undefined ? { 担当者 } : {}),
        ...(ルームリンク !== undefined ? { ルーム名: ルームリンク } : {}),
      });
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_update",
    "Fudabaの既存の札を部分更新する。タイトル・本文・状態・担当者のうち渡したフィールドだけが" +
      "変更される。状態遷移に制約は無い（どの状態からどの状態へも変更可）。" +
      "担当者を解除するには担当者解除=true を渡す（担当者と同時指定はできない）。",
    {
      id: z.number().int().positive().describe("更新する札のID"),
      タイトル: z.string().min(1).optional(),
      本文: z.string().optional(),
      状態: z.enum(札状態一覧).optional().describe(`札の状態（${札状態一覧.join(" | ")}）`),
      担当者: z.string().optional().describe("新しい担当者名"),
      担当者解除: z.boolean().optional().default(false).describe("trueで担当者を未割当に戻す"),
    },
    async ({ id, タイトル, 本文, 状態, 担当者, 担当者解除 }) => {
      const 応答 = await 札を更新する(fudabaBaseUrl, id, {
        ...(タイトル !== undefined ? { タイトル } : {}),
        ...(本文 !== undefined ? { 本文 } : {}),
        ...(状態 !== undefined ? { 状態 } : {}),
        ...(担当者解除 === true ? { 担当者: null } : 担当者 !== undefined ? { 担当者 } : {}),
      });
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_list",
    "Fudabaの札一覧を取得する。種別・状態・担当者を指定するとその条件で絞り込む（省略時は全件）。" +
      "自分が今何をすべきか分からなくなったら担当者=自分名義で呼ぶとよい。",
    {
      種別: z.enum(札種別一覧).optional(),
      状態: z.enum(札状態一覧).optional(),
      担当者: z.string().optional(),
    },
    async ({ 種別, 状態, 担当者 }) => {
      const 応答 = await 札一覧を取得する(fudabaBaseUrl);
      if (応答.種別 === "失敗") {
        return { content: [{ type: "text", text: 応答を整形する(応答) }] };
      }
      const 絞り込み済み: Fudaba応答 = {
        種別: "成功",
        データ: 一覧を絞り込む(応答.データ, {
          ...(種別 !== undefined ? { 種別 } : {}),
          ...(状態 !== undefined ? { 状態 } : {}),
          ...(担当者 !== undefined ? { 担当者 } : {}),
        }),
      };
      return { content: [{ type: "text", text: 応答を整形する(絞り込み済み) }] };
    },
  );
}
