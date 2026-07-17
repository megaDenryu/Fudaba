import type { キャラDTO } from "../通信/キャラ型";
import type { キャラクライアント } from "../通信/キャラクライアント";
import type { 稼働表明DTO } from "../通信/稼働型";
import type { 稼働クライアント } from "../通信/稼働クライアント";
import type { 札DTO } from "../通信/札型";
import { 担当者候補を合成する } from "./担当者候補抽出";
import { ラベル候補一覧を抽出する } from "./ラベル候補抽出";
import { AI担当者名集合を作る, 稼働状態マップを作る } from "./淀み判定";

export interface 札一覧表示情報 {
  readonly 担当者候補: readonly string[];
  readonly ラベル候補: readonly string[];
  readonly AI担当者名集合: ReadonlySet<string>;
  readonly 稼働状態マップ: ReadonlyMap<string, string>;
}

export async function 札一覧表示情報を取得する(
  一覧: readonly 札DTO[], キャラclient: キャラクライアント, 稼働client: 稼働クライアント,
): Promise<札一覧表示情報> {
  const キャラ一覧 = await 安全に取得する(() => キャラclient.一覧を取得する());
  const 稼働一覧 = await 安全に取得する(() => 稼働client.一覧を取得する());
  return {
    担当者候補: 担当者候補を合成する(一覧, キャラ一覧),
    ラベル候補: ラベル候補一覧を抽出する(一覧),
    AI担当者名集合: AI担当者名集合を作る(キャラ一覧),
    稼働状態マップ: 稼働状態マップを作る(稼働一覧),
  };
}

async function 安全に取得する<T extends キャラDTO | 稼働表明DTO>(処理: () => Promise<readonly T[]>): Promise<readonly T[]> {
  try { return await 処理(); } catch { return []; }
}
