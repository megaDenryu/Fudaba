import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 札種別一覧, 札状態一覧 } from "@fudaba/core";
import { z } from "zod";
import {
  札一覧を取得する,
  札を作成する,
  札を更新する,
  添付を取得する,
  添付を追加する,
  問い一覧を取得する,
  問いの回答を待つ,
  問いを作成する,
  問いを取得する,
  問い添付を追加する,
  コメント一覧を取得する,
  コメントを追加する,
  札関係リンク一覧を取得する,
  札関係リンクを追加する,
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

function 添付が札に属するか(一覧: unknown, id: number, 保存名: string): boolean {
  if (!Array.isArray(一覧)) return false;
  const 対象 = 一覧.find(
    (項目: unknown) =>
      typeof 項目 === "object" && 項目 !== null && "id" in 項目 && 項目.id === id,
  );
  if (
    typeof 対象 !== "object" ||
    対象 === null ||
    !("添付一覧" in 対象) ||
    !Array.isArray(対象.添付一覧)
  ) {
    return false;
  }
  return 対象.添付一覧.some(
    (添付: unknown) =>
      typeof 添付 === "object" &&
      添付 !== null &&
      "保存名" in 添付 &&
      添付.保存名 === 保存名,
  );
}

function 添付を持つ問いか(値: unknown, id: number, 保存名: string): boolean {
  return typeof 値 === "object" && 値 !== null &&
    "id" in 値 && 値.id === id &&
    "添付一覧" in 値 && Array.isArray(値.添付一覧) &&
    値.添付一覧.some((添付: unknown) =>
      typeof 添付 === "object" && 添付 !== null && "保存名" in 添付 && 添付.保存名 === 保存名,
    );
}

const MIME型一覧 = [
  "image/png", "image/jpeg", "image/gif", "image/webp", "text/plain", "application/json",
] as const;

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
      "調査前に確認し、画像本体はfudaba_get_attachmentで取得する。",
    {
      kind: z.enum(札種別一覧).optional(),
      status: z.enum(札状態一覧).optional(),
      assignee: z.string().optional(),
      labels: z.array(z.string()).optional().describe("指定した全ラベルを持つ札に絞り込む"),
      keyword: z.string().min(1).optional().describe("タイトル・本文を部分一致検索するキーワード"),
    },
    async ({ kind, status, assignee, labels, keyword }) => {
      const 応答 = await 札一覧を取得する(fudabaBaseUrl, keyword);
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

  server.tool(
    "fudaba_add_attachment",
    "画像・テキストログをbase64データとしてFudabaの札へ追加する。根拠をAIから人間へ渡すために使う。",
    {
      id: z.number().int().positive().describe("添付先の札ID"),
      fileName: z.string().min(1).describe("人間向けの元ファイル名"),
      mimeType: z.enum(MIME型一覧).describe("画像のMIME型"),
      dataBase64: z.string().min(1).describe("data URL接頭辞を含まないbase64データ"),
    },
    async ({ id, fileName, mimeType, dataBase64 }) => {
      const 応答 = await 添付を追加する(
        fudabaBaseUrl,
        id,
        fileName,
        mimeType,
        dataBase64,
      );
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_get_attachment",
    "Fudabaの札に付いた画像・テキストログを取得する。画像は画像コンテンツ、ログはUTF-8テキストとして返す。保存名はfudaba_listの添付一覧から取得する。",
    {
      id: z.number().int().positive().describe("添付を所有する札ID"),
      savedName: z.string().min(1).describe("添付一覧にある保存名"),
    },
    async ({ id, savedName }) => {
      const 一覧応答 = await 札一覧を取得する(fudabaBaseUrl);
      if (一覧応答.種別 === "失敗") {
        return { content: [{ type: "text" as const, text: 応答を整形する(一覧応答) }] };
      }
      if (!添付が札に属するか(一覧応答.データ, id, savedName)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `[FUDABA_ERROR] 札${id}に添付「${savedName}」は存在しません`,
            },
          ],
        };
      }
      const 応答 = await 添付を取得する(fudabaBaseUrl, savedName);
      if (応答.種別 === "失敗") {
        return {
          content: [{ type: "text" as const, text: `[FUDABA_ERROR] ${応答.理由}` }],
        };
      }
      if (応答.MIME型.startsWith("text/") || 応答.MIME型.startsWith("application/json")) {
        return {
          content: [
            { type: "text" as const, text: `札${id}の添付「${savedName}」\n\n${Buffer.from(応答.データ).toString("utf8")}` },
          ],
        };
      }
      return {
        content: [
          { type: "text" as const, text: `札${id}の添付「${savedName}」` },
          {
            type: "image" as const,
            data: Buffer.from(応答.データ).toString("base64"),
            mimeType: 応答.MIME型,
          },
        ],
      };
    },
  );

  server.tool(
    "fudaba_question_add_attachment",
    "画像・テキストログを問い自身へ追加する。人間判定キューに根拠がインライン表示される。",
    {
      questionId: z.number().int().positive(),
      fileName: z.string().min(1),
      mimeType: z.enum(MIME型一覧),
      dataBase64: z.string().min(1).describe("data URL接頭辞を含まないbase64データ"),
    },
    async ({ questionId, fileName, mimeType, dataBase64 }) => {
      const 応答 = await 問い添付を追加する(
        fudabaBaseUrl, questionId, fileName, mimeType, dataBase64,
      );
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_question_get_attachment",
    "問いに付いた画像・テキストログを取得する。画像は画像コンテンツ、ログはUTF-8テキストとして返す。",
    {
      questionId: z.number().int().positive(),
      savedName: z.string().min(1),
    },
    async ({ questionId, savedName }) => {
      const 問い応答 = await 問いを取得する(fudabaBaseUrl, questionId);
      if (問い応答.種別 === "失敗") {
        return { content: [{ type: "text" as const, text: 応答を整形する(問い応答) }] };
      }
      if (!添付を持つ問いか(問い応答.データ, questionId, savedName)) {
        return { content: [{ type: "text" as const, text: `[FUDABA_ERROR] 問い${questionId}に添付「${savedName}」は存在しません` }] };
      }
      const 応答 = await 添付を取得する(fudabaBaseUrl, savedName);
      if (応答.種別 === "失敗") {
        return { content: [{ type: "text" as const, text: `[FUDABA_ERROR] ${応答.理由}` }] };
      }
      if (応答.MIME型.startsWith("text/") || 応答.MIME型.startsWith("application/json")) {
        return { content: [{ type: "text" as const, text: `問い${questionId}の添付「${savedName}」\n\n${Buffer.from(応答.データ).toString("utf8")}` }] };
      }
      return { content: [
        { type: "text" as const, text: `問い${questionId}の添付「${savedName}」` },
        { type: "image" as const, data: Buffer.from(応答.データ).toString("base64"), mimeType: 応答.MIME型 },
      ] };
    },
  );

  server.tool(
    "fudaba_question_create",
    "人間の判断が必要な問いをFudabaへ起票する。選択肢を省略すると「はい・いいえ・保留」になる。回答は後から上書きできない。",
    {
      title: z.string().min(1).describe("問いの見出し"),
      body: z.string().describe("判断根拠や確認してほしい内容"),
      creator: z.string().min(1).describe("起票するAI・人間の名前"),
      choices: z.array(z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        shortcut: z.string().length(1).optional(),
      })).min(2).max(20).optional().describe("任意選択肢。省略時はyes/no/hold"),
      relatedItemId: z.number().int().positive().optional().describe("関連するFudaba札ID（弱参照）"),
      roomLink: z.string().optional().describe("関連するAgentRoomルーム名（弱参照）"),
    },
    async ({ title, body, creator, choices, relatedItemId, roomLink }) => {
      const 応答 = await 問いを作成する(fudabaBaseUrl, {
        タイトル: title,
        本文: body,
        作成者: creator,
        ...(choices !== undefined ? {
          選択肢一覧: choices.map((選択肢) => ({
            id: 選択肢.id,
            ラベル: 選択肢.label,
            ...(選択肢.shortcut !== undefined ? { ショートカット: 選択肢.shortcut } : {}),
          })),
        } : {}),
        ...(relatedItemId !== undefined ? { 関連札ID: relatedItemId } : {}),
        ...(roomLink !== undefined ? { ルーム名: roomLink } : {}),
      });
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_question_list",
    "Fudabaの問い一覧を取得する。未回答だけを人間判定キューとして確認できる。",
    {
      kind: z.enum(["未回答", "回答済み"]).optional(),
    },
    async ({ kind }) => {
      const 応答 = await 問い一覧を取得する(fudabaBaseUrl, kind);
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_question_get",
    "Fudabaの問いをID指定で1件取得する。回答済みの場合は不変の回答レコードも返る。",
    { id: z.number().int().positive() },
    async ({ id }) => {
      const 応答 = await 問いを取得する(fudabaBaseUrl, id);
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_question_wait_answers",
    "指定した複数の問いのいずれかに回答が来るか、タイムアウトまで待つ。タイムアウトは正常応答。受信した最大連番を次のafterSeqに使う。",
    {
      questionIds: z.array(z.number().int().positive()).optional().default([]).describe("待つ問いID一覧。空なら全て"),
      afterSeq: z.number().int().nonnegative().optional().default(0).describe("この回答連番より後を待つ"),
      timeoutSeconds: z.number().int().min(1).max(120).optional().default(50),
    },
    async ({ questionIds, afterSeq, timeoutSeconds }) => {
      const 応答 = await 問いの回答を待つ(
        fudabaBaseUrl,
        afterSeq,
        timeoutSeconds,
        questionIds,
      );
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_comment_add",
    "札の本文を上書きせず、作成者と時刻が残るコメントを追記する。経緯や調査結果の往復記録に使う。",
    {
      id: z.number().int().positive().describe("コメント先の札ID"),
      author: z.string().min(1),
      body: z.string().min(1),
    },
    async ({ id, author, body }) => {
      const 応答 = await コメントを追加する(fudabaBaseUrl, id, author, body);
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_comment_list",
    "札に追記されたコメントを作成順で取得する。",
    { id: z.number().int().positive() },
    async ({ id }) => {
      const 応答 = await コメント一覧を取得する(fudabaBaseUrl, id);
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_link_add",
    "2枚の札へ親子（分解）または依存（元札が先札に依存）の関係を追加する。",
    {
      sourceItemId: z.number().int().positive(),
      targetItemId: z.number().int().positive(),
      kind: z.enum(["親子", "依存"]),
      creator: z.string().min(1),
    },
    async ({ sourceItemId, targetItemId, kind, creator }) => {
      const 応答 = await 札関係リンクを追加する(
        fudabaBaseUrl, sourceItemId, targetItemId, kind, creator,
      );
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );

  server.tool(
    "fudaba_link_list",
    "札の親子・依存リンクを取得する。札IDを省略すると全リンクを返す。",
    { itemId: z.number().int().positive().optional() },
    async ({ itemId }) => {
      const 応答 = await 札関係リンク一覧を取得する(fudabaBaseUrl, itemId);
      return { content: [{ type: "text", text: 応答を整形する(応答) }] };
    },
  );
}
