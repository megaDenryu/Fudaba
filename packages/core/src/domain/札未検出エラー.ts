// 指定IDの札がストアに存在しないことを表す型付き例外。APIのエラーハンドラは
// この型を404に写像する（クライアント入力の形式は正しいが対象が無いため400ではない）
export class 札未検出エラー extends Error {
  constructor(id: number) {
    super(`札が見つかりません: id=${id}`);
    this.name = "札未検出エラー";
  }
}
