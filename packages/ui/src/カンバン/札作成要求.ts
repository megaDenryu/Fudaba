import type { 札作成入力 } from "../通信/札型";

export interface 札作成要求 {
  readonly 内容: 札作成入力;
  readonly 添付ファイル一覧: readonly File[];
}
