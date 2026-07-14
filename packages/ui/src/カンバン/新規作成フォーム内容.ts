import type { ロケール } from "../文言/ロケール";
import { ロケール別文言を取得する } from "../文言/辞書ヘルパー";
import { 日本語辞書 } from "./新規作成フォーム内容.ja";
import { 英語辞書 } from "./新規作成フォーム内容.en";

export function 新規作成フォーム内容を取得する(ロケール: ロケール) {
  return ロケール別文言を取得する(ロケール, 日本語辞書, 英語辞書);
}
