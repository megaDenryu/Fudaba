// クライアント入力の不正を表す型付き例外。APIのエラーハンドラはこの型だけを
// 400に写像し、それ以外の例外はサーバー側のバグとして500のまま通す
export class 検証エラー extends Error {
  constructor(メッセージ: string) {
    super(メッセージ);
    this.name = "検証エラー";
  }
}
