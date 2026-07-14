// UI表示言語の値域。物語・企画データの生成言語（AIへの指示言語）とは別概念であり、
// 混同を避けるため「ロケール」という別名を用いる（Jimbo electron-app renderer文言辞書基盤を踏襲）
export const ロケール一覧 = ["ja", "en"] as const;

export type ロケール = (typeof ロケール一覧)[number];

export function ロケールか(値: unknown): 値 is ロケール {
  return typeof 値 === "string" && (ロケール一覧 as readonly string[]).includes(値);
}
