import type { ロケール } from "./ロケール";

// 各画面の文言辞書が共通で使うヘルパー。日本語辞書の型がキー集合の正であり、
// 英語辞書はtypeofで明示的に型付けされるため、キーの過不足はtscが検出する
// （Jimbo electron-app renderer文言辞書基盤を踏襲）
export function ロケール別文言を取得する<T>(ロケール: ロケール, 日本語辞書: T, 英語辞書: T): T {
  return ロケール === "en" ? 英語辞書 : 日本語辞書;
}
