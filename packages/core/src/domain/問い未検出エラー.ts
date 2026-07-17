export class 問い未検出エラー extends Error {
  constructor(id: number) {
    super(`問い${id}は存在しません`);
    this.name = "問い未検出エラー";
  }
}
