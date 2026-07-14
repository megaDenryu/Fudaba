// Fudaba専用の配色。DESIGN.mdの方針どおり「ホストのCSS変数を参照しつつ、フォールバックは
// 富良野テーマ系」で構成する。ホスト（Jimboシェル）が --fudaba-* カスタムプロパティを
// :root等に定義していればそれを優先し、無指定ならAgentRoom系の富良野ライトテーマに準じた
// 既定値にフォールバックする。VscodeShellLayoutの型（テーマ配色）には依存しない
// （Fudabaは自前シェルを持たないため、外殻レイアウトのテーマ契約を知る必要が無い）

function カスタムプロパティ(名前: string, フォールバック: string): string {
  return `var(--fudaba-${名前}, ${フォールバック})`;
}

export const Fudabaテーマ配色 = {
  背景: カスタムプロパティ("background", "#f4f1fb"),
  パネル表面: カスタムプロパティ("surface", "#ffffff"),
  パネル境界線: カスタムプロパティ("border", "rgba(146, 126, 196, 0.30)"),
  テキスト主: カスタムプロパティ("text-primary", "#3a3355"),
  テキスト副: カスタムプロパティ("text-secondary", "#5b5286"),
  テキスト薄: カスタムプロパティ("text-muted", "#8078a4"),
  ホバー背景: カスタムプロパティ("hover", "rgba(138, 111, 208, 0.08)"),
  ネイビー: カスタムプロパティ("accent-strong", "#5b4a96"),
  アクセント: カスタムプロパティ("accent", "#8a6fd0"),
  基本フォントファミリ: '"Segoe UI", "Meiryo", "Yu Gothic UI", sans-serif',
} as const;

export const Fudaba警告色 = {
  文字: カスタムプロパティ("danger-text", "#c9403a"),
  境界: カスタムプロパティ("danger-border", "#c9403a"),
  背景弱: カスタムプロパティ("danger-bg", "rgba(201, 64, 58, 0.10)"),
} as const;

// 種別バッジの配色（種別ごとに固定色だが、他の色と同様ホストのカスタムプロパティで上書き可能にする）
export const 札種別配色: Record<string, string> = {
  タスク: カスタムプロパティ("kind-task", "#5b4a96"),
  バグ: カスタムプロパティ("kind-bug", "#c9403a"),
  決定: カスタムプロパティ("kind-decision", "#2f7d5a"),
  メモ: カスタムプロパティ("kind-note", "#8078a4"),
};
