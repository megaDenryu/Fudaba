export interface 添付DTO {
  readonly 保存名: string;
  readonly ファイル名: string;
  readonly バイト数: number;
  readonly 追加時刻: string;
}

export interface チェック項目DTO {
  readonly id: string;
  readonly 本文: string;
  readonly 完了: boolean;
}

export interface 札DTO {
  readonly id: number;
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 状態: string;
  readonly 担当者: string | null;
  readonly 作成者: string;
  readonly ルーム名: string | null;
  readonly ラベル一覧: readonly string[];
  readonly 添付一覧: readonly 添付DTO[];
  readonly チェック項目一覧: readonly チェック項目DTO[];
  readonly 分解推奨: boolean;
  readonly 作成時刻: string;
  readonly 更新時刻: string;
}

export interface 札作成入力 {
  readonly 種別: string;
  readonly タイトル: string;
  readonly 本文: string;
  readonly 担当者: string | undefined;
  readonly 作成者: string;
  readonly ラベル一覧: readonly string[] | undefined;
  readonly チェック項目一覧?: readonly チェック項目DTO[];
}

export interface 札更新入力 {
  readonly 種別?: string;
  readonly タイトル?: string;
  readonly 本文?: string;
  readonly 状態?: string;
  readonly 担当者?: string | null;
  readonly ラベル一覧?: readonly string[];
  readonly チェック項目一覧?: readonly チェック項目DTO[];
}

export { 札DTOか, 札DTO一覧か } from "./札型検証";
