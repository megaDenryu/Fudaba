export class 問い回答済みエラー extends Error {
  constructor(id: number) {
    super(`問い${id}には既に回答があります。再判定には新しい問いを起票してください`);
    this.name = "問い回答済みエラー";
  }
}
