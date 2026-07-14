import { 日本語辞書 } from "./詳細パネル内容.ja";

type 画面文言 = typeof 日本語辞書;

export const 英語辞書: 画面文言 = {
  本文ラベル: "Description",
  種別ラベル: "Kind",
  状態ラベル: "Status",
  担当者ラベル: "Assignee",
  担当者プレースホルダー: "Unassigned",
  ラベルラベル: "Labels",
  ラベルプレースホルダー: "Labels, comma separated (optional)",
  閉じるボタン: "Close",
  保存ボタン: "Save",
  保存完了メッセージ: "Saved",
  担当解除ボタン: "Unassign",
  担当解除確認メッセージ: "Unassign this item?",
};
