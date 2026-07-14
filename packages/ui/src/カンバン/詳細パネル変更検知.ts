import type { 札DTO } from "../通信/札型";

// 詳細パネルの編集フォームが現在保持している値（担当者未入力は空文字で表す）
export interface 詳細パネル編集値 {
  readonly タイトル: string;
  readonly 本文: string;
  readonly 状態: string;
  readonly 担当者: string;
}

// 編集フォームの値が表示時点の札から変わっているかどうかを判定する。
// 保存ボタンの表示制御に使う（未編集のあいだは保存ボタンを出さない）
export function 編集値に変更があるか(元札: 札DTO, 編集値: 詳細パネル編集値): boolean {
  return (
    編集値.タイトル !== 元札.タイトル ||
    編集値.本文 !== 元札.本文 ||
    編集値.状態 !== 元札.状態 ||
    編集値.担当者 !== (元札.担当者 ?? "")
  );
}
