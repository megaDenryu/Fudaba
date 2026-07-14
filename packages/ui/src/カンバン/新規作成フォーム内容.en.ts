import { 日本語辞書 } from "./新規作成フォーム内容.ja";

type 画面文言 = typeof 日本語辞書;

export const 英語辞書: 画面文言 = {
  タイトルプレースホルダー: "Title",
  本文プレースホルダー: "Description (optional)",
  担当者プレースホルダー: "Assignee (optional)",
  ラベルプレースホルダー: "Labels, comma separated (optional)",
  作成者プレースホルダー: "Author",
  作成ボタン: "Create item",
};
