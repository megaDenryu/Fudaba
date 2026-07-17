import type { 札更新入力 } from "../../通信/札型";

export interface I札編集配線 {
  on保存(id: number, 変更: 札更新入力): void;
  on閉じる(): void;
  on添付追加(id: number, ファイル: File): void;
  on添付削除(id: number, 保存名: string): void;
  on担当解除(id: number): void;
}

export interface I保存操作部品 {
  表示する(): unknown;
  隠す(): unknown;
  onClick(処理: () => void): unknown;
}

export interface I保存完了部品 {
  表示する(): unknown;
  隠す(): unknown;
}

export interface I担当解除部品 {
  担当状態を反映する(担当者: string | null): unknown;
  onClick(処理: () => void): unknown;
}
