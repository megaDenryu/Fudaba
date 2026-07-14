import { 日本語辞書 } from "./モバイル札ビュー内容.ja";

type 画面文言 = typeof 日本語辞書;

export const 英語辞書: 画面文言 = {
  ヘッダタイトル: "Fudaba",
  更新ボタン: "Refresh",
  リスト空表示: "No items",
  カード未割当表示: "Unassigned",
  カード淀みバッジ: "presence unknown",
  カード状態接頭辞を作る: (状態: string): string => `Status: ${状態}`,
  エラー札一覧取得失敗: "Failed to fetch the item list",
  エラー札作成失敗: "Failed to create the item",
  エラー札更新失敗: "Failed to update the item",
  エラー添付追加失敗: "Failed to add the attachment",
  エラー添付削除失敗: "Failed to delete the attachment",
  添付サイズ超過メッセージを作る: (上限メガバイト: number): string =>
    `Attachments must be ${上限メガバイト}MB or smaller`,
};
