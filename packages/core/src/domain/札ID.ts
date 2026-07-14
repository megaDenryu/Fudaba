import { 検証エラー } from "./検証エラー.js";

// SQLiteのAUTOINCREMENTに由来する採番済みIDのみを表す（未採番の状態は型として持たない。
// 未採番の札はストアへの追加が完了するまでインスタンス化されない）
export class 札ID {
  private constructor(private readonly 内部値: number) {}

  static create(値: number): 札ID {
    if (!Number.isInteger(値) || 値 <= 0) {
      throw new 検証エラー(`札IDは正の整数である必要があります: ${値}`);
    }
    return new 札ID(値);
  }

  get 値(): number {
    return this.内部値;
  }

  equals(他: 札ID): boolean {
    return this.内部値 === 他.内部値;
  }
}
