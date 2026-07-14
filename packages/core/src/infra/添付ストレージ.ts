import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { 添付拡張子 } from "../domain/添付拡張子.js";
import { 添付保存名 } from "../domain/添付保存名.js";

function ファイルが存在しないエラーか(エラー: unknown): boolean {
  return (
    typeof エラー === "object" && エラー !== null && "code" in エラー && エラー.code === "ENOENT"
  );
}

// 添付画像バイナリのファイルシステム永続化。DBには保存せずファイル保存する方針
// （札本体のattachments列にはメタ情報のJSONだけを持つ、DESIGN.md方針: DB肥大化回避）。
// 保存先ディレクトリはホスト側のコンポジションルートが注入する
// （JimboではuserData配下のfudaba-attachments/になる想定）
export class 添付ストレージ {
  private constructor(private readonly ディレクトリ: string) {}

  static ディレクトリを指定して作る(ディレクトリ: string): 添付ストレージ {
    return new 添付ストレージ(ディレクトリ);
  }

  // 保存名はここで乱数から新規採番する（推測不可能にすることでパストラバーサル・
  // 総当たりの両方を防ぐ。参照: 添付保存名.tsのホワイトリスト形式）
  async 保存する(バイナリ: Buffer, 拡張子: 添付拡張子): Promise<添付保存名> {
    await fs.mkdir(this.ディレクトリ, { recursive: true });
    const ランダム値 = randomBytes(16).toString("hex");
    const 保存名 = 添付保存名.create(`${ランダム値}.${拡張子.値}`);
    await fs.writeFile(this._パス(保存名), バイナリ);
    return 保存名;
  }

  async 読み込む(保存名: 添付保存名): Promise<Buffer | null> {
    try {
      return await fs.readFile(this._パス(保存名));
    } catch (エラー) {
      if (ファイルが存在しないエラーか(エラー)) return null;
      throw エラー;
    }
  }

  async 削除する(保存名: 添付保存名): Promise<void> {
    try {
      await fs.unlink(this._パス(保存名));
    } catch (エラー) {
      if (!ファイルが存在しないエラーか(エラー)) throw エラー;
    }
  }

  private _パス(保存名: 添付保存名): string {
    return path.join(this.ディレクトリ, 保存名.値);
  }
}
