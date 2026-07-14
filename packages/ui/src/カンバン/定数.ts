// サーバー（@fudaba/core）が持つ列挙値のUI側複製。AgentRoomのUIパッケージが
// サーバーパッケージへ依存しない方針（種別配色.ts等）を踏襲し、UIパッケージは
// REST契約のみに依存させる。値を変更する場合は packages/core の対応する
// 定義（札種別一覧・札状態一覧）と揃えて直す
export const 札種別選択肢 = ["タスク", "バグ", "決定", "メモ"] as const;
export const 札状態選択肢 = ["未着手", "進行中", "完了", "ブロック"] as const;
