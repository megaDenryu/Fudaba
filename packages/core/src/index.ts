// Fudabaがホスト（ワークスペースサーバー）へ公開する唯一の窓口。
// 3点セットのうち「サーバールート登録関数」と、その配線に必要な型・ストアを export する

export { Fudabaルートを登録する } from "./api/札ルート.js";
export { 札ストア, type 札一覧フィルタ } from "./infra/札ストア.js";
export { 添付ストレージ } from "./infra/添付ストレージ.js";
export { 札, type 札DTO, type 札変更内容 } from "./domain/札.js";
export { 札チェックリスト, type 札チェック項目DTO } from "./domain/札チェックリスト.js";
export { 札ID } from "./domain/札ID.js";
export { 札種別, 札種別一覧, type 札種別値 } from "./domain/札種別.js";
export { 札状態, 札状態一覧, type 札状態値 } from "./domain/札状態.js";
export { メンバー名 } from "./domain/メンバー名.js";
export { type 担当者, 未割当, 割当済み } from "./domain/担当者.js";
export { type 札リンク, 未リンク, ルームにリンクする } from "./domain/札リンク.js";
export { ラベル } from "./domain/ラベル.js";
export { 札ラベル一覧 } from "./domain/札ラベル一覧.js";
export { 添付, type 添付DTO, 添付最大バイト数 } from "./domain/添付.js";
export { 添付拡張子, 添付拡張子一覧, type 添付拡張子値 } from "./domain/添付拡張子.js";
export { 添付保存名 } from "./domain/添付保存名.js";
export { 札添付一覧 } from "./domain/札添付一覧.js";
export { 検証エラー } from "./domain/検証エラー.js";
export { 札未検出エラー } from "./domain/札未検出エラー.js";
export { 添付未検出エラー } from "./domain/添付未検出エラー.js";
export {
  問い選択肢,
  未回答問い,
  回答済み問い,
  type 問い,
  type 問いDTO,
  type 未回答問いDTO,
  type 回答済み問いDTO,
  type 回答DTO,
} from "./domain/問い.js";
export { 問いID } from "./domain/問いID.js";
export { 問い未検出エラー } from "./domain/問い未検出エラー.js";
export { 問い回答済みエラー } from "./domain/問い回答済みエラー.js";
export type { 札コメントDTO, 札関係リンクDTO, 札リンク種別 } from "./infra/札協働リポジトリ.js";
