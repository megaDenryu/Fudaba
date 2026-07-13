# Fudaba(札場) 設計

2026-07-14制定。人間とAIが共有する作業アイテム(札)の台帳+カンバンビュー。Jimboの住民(独立リポジトリ+submodule)であり、開発管理プラットフォーム構想(Jimbo/ARCHITECTURE.md が正典)のPhase Aを担う。

## 何であるか

- 人間はUIで、AIはMCPで、**同じ札を読み書きする**。札はサーバー側SQLiteに永続し、AIセッションの消失に巻き込まれない
- WBS・バグシート・タスクリストの最小共通形を単一のドメイン型「札」で表す(種別で判別)
- 名前の由来: 村の高札場。札が掛かり、皆が見に来る場所

## ドメイン型

```
札 {
  id: 札ID(採番),
  種別: 'タスク' | 'バグ' | '決定' | 'メモ',
  タイトル: string,
  本文: string,
  状態: '未着手' | '進行中' | '完了' | 'ブロック',
  担当者: string | 未割当,       // メンバー名。人間もAIも同格
  作成者: string,
  リンク: { ルーム名?: string } , // 弱参照(ID参照のみ。外部キーは張らない)
  作成時刻 / 更新時刻
}
```

- 状態遷移に制約は設けない(どの状態からどの状態へも変更可。運用の柔軟性優先)
- 「決定」「メモ」も状態を持つ(決定=完了で作るのが自然だが強制しない)

## 提供する3点セット(プラグイン型住民の標準形)

1. **サーバールート登録関数**: `Fudabaルートを登録する(app: FastifyInstance, ストア)` — 自前ポートなし。ワークスペースサーバー(AgentRoomサーバー :7100)に間借り
   - REST: GET/POST `/api/fudaba/items`、PATCH `/api/fudaba/items/:id`
   - ストレージ: 専用SQLiteファイル(fudaba.sqlite3、パスは注入)。AgentRoomのDBとは別ファイル
2. **UIビュー部品**: 状態4列のカンバン(SengenUI + Vanilla Extract、テーマはホストのCSS変数を継承、スマホ狭幅対応)。ホストはAgentRoom UIシェル(=ワークスペースシェル。LAN配信でスマホからも見える)
3. **MCPツール登録関数**: `fudaba_create` / `fudaba_update` / `fudaba_list`(+help文書)。Jimbo MCP(:7110)に相乗り

配線はホスト側(Jimbo main.ts / AgentRoom UIシェル)のコンポジションルートが行う。Fudabaは配線先を知らない。

## dogfooding

Phase B以降(エージェント稼働可視化・成果物共有・BoomYackビュー統合)のタスクは、完成したFudaba自身に札として登録して管理する。
