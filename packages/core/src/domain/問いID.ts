import { 検証エラー } from "./検証エラー.js";

export class 問いID {
  private constructor(readonly 値: number) {}

  static create(値: number): 問いID {
    if (!Number.isInteger(値) || 値 <= 0) {
      throw new 検証エラー(`問いIDは正の整数である必要があります: ${値}`);
    }
    return new 問いID(値);
  }
}
