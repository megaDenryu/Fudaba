import { 検証エラー } from "./検証エラー.js";

// 改行やタブが名前に混ざるとログ・UI表示が壊れるため、制御文字（コードポイント0x1F以下、0x7F）を弾く。
// 正規表現のUnicodeエスケープ表記は編集時の文字化けを誘発しやすいため、文字コード比較で判定する
function 制御文字を含むか(値: string): boolean {
  for (let 位置 = 0; 位置 < 値.length; 位置 += 1) {
    const コード = 値.charCodeAt(位置);
    if (コード <= 0x1f || コード === 0x7f) {
      return true;
    }
  }
  return false;
}

// 作成者・担当者を表す名前。人間もAIも同格に同じ型で扱う（DESIGN.md参照）
export class メンバー名 {
  private constructor(private readonly 内部値: string) {}

  static create(値: string): メンバー名 {
    const 整形済み = 値.trim();
    if (整形済み.length === 0 || 整形済み.length > 64) {
      throw new 検証エラー(`メンバー名は1〜64文字である必要があります: "${値}"`);
    }
    if (制御文字を含むか(整形済み)) {
      throw new 検証エラー(`メンバー名に制御文字は使えません: "${値}"`);
    }
    return new メンバー名(整形済み);
  }

  get 値(): string {
    return this.内部値;
  }

  equals(他: メンバー名): boolean {
    return this.内部値 === 他.内部値;
  }
}
