import { 検証エラー } from "./検証エラー.js";

const ラベル最大文字数 = 50;

// 改行やタブが混ざるとログ・UI表示が壊れるため、制御文字（コードポイント0x1F以下、0x7F）を弾く。
// メンバー名.tsと同じ判定方針（正規表現のUnicodeエスケープは文字化けを誘発しやすいため文字コード比較）
function 制御文字を含むか(値: string): boolean {
  for (let 位置 = 0; 位置 < 値.length; 位置 += 1) {
    const コード = 値.charCodeAt(位置);
    if (コード <= 0x1f || コード === 0x7f) {
      return true;
    }
  }
  return false;
}

// 札に付ける自由文字列タグ1件。事前登録不要（DESIGN.md「ラベル」節）。
// リポジトリ名（jimbo/fudaba/boomyack/agentroom等）も特別な概念ではなくラベルの慣用として扱う
export class ラベル {
  private constructor(private readonly 内部値: string) {}

  static create(値: string): ラベル {
    const 整形済み = 値.trim();
    if (整形済み.length === 0 || 整形済み.length > ラベル最大文字数) {
      throw new 検証エラー(
        `ラベルは1〜${ラベル最大文字数}文字である必要があります: "${値}"`,
      );
    }
    if (制御文字を含むか(整形済み)) {
      throw new 検証エラー(`ラベルに制御文字は使えません: "${値}"`);
    }
    return new ラベル(整形済み);
  }

  get 値(): string {
    return this.内部値;
  }

  equals(他: ラベル): boolean {
    return this.内部値 === 他.内部値;
  }
}
