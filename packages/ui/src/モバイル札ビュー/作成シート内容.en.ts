import { 日本語辞書 } from "./作成シート内容.ja";

type 画面文言 = typeof 日本語辞書;

export const 英語辞書: 画面文言 = {
  シートタイトル: "New item",
  閉じるボタン: "Close",
  種別ラベル: "Kind",
  タイトルラベル: "Title",
  タイトルプレースホルダー: "Title",
  本文ラベル: "Description",
  本文プレースホルダー: "Description (optional)",
  担当者ラベル: "Assignee",
  担当者プレースホルダー: "Assignee (optional)",
  ラベルラベル: "Labels",
  ラベルプレースホルダー: "Labels, comma separated (optional)",
  作成者ラベル: "Author",
  作成者プレースホルダー: "Author",
  作成ボタン: "Create item",
};
