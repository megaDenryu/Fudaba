// スマホ・タブレットでの狭幅レイアウト判定に使う共通しきい値（AgentRoom packages/ui踏襲）。
// 初期表示の分岐とCSSメディアクエリの双方がこの1箇所だけを参照することで、
// しきい値の食い違いを防ぐ
export const 狭幅ブレークポイントpx = 768;

// Vanilla Extractの style() 内 "@media" キーで使う狭幅判定クエリ文字列
export const 狭幅メディアクエリ = `screen and (max-width: ${狭幅ブレークポイントpx - 1}px)`;
