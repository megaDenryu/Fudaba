// 詳細パネルのラベル入力欄（カンマ区切りの自由入力）を配列へ変換する。
// 空文字・空白のみの要素は除外し、前後の空白は除去する
export function ラベル文字列を配列にする(値: string): string[] {
  return 値
    .split(",")
    .map((項目) => 項目.trim())
    .filter((項目) => 項目.length > 0);
}

// ラベル配列を入力欄に表示するカンマ区切り文字列へ変換する
export function ラベル配列を文字列にする(値一覧: readonly string[]): string {
  return 値一覧.join(", ");
}

// 順序差だけの見かけ上の変更を無視して比較するための正規化キー
export function ラベル配列を比較キーにする(値一覧: readonly string[]): string {
  return [...値一覧].sort((a, b) => a.localeCompare(b, "ja")).join(",");
}
