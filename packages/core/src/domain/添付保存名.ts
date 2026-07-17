import { 検証エラー } from "./検証エラー.js";

// 16バイトの乱数を16進文字列化した32桁+許可拡張子のみを受理する厳格な形式（ホワイトリスト方式）。
// GET/DELETEのURLパラメータから受け取った文字列をこの形式に一致させることで、
// "../" 等のパストラバーサル文字列を構造的に排除する（infra/添付ストレージ.tsのパス組み立てで使用）
const 保存名パターン = /^[0-9a-f]{32}\.(png|jpg|jpeg|gif|webp|txt|json)$/;

export class 添付保存名 {
  private constructor(private readonly 内部値: string) {}

  static create(値: string): 添付保存名 {
    if (!保存名パターン.test(値)) {
      throw new 検証エラー(`添付ファイルの保存名として不正です: "${値}"`);
    }
    return new 添付保存名(値);
  }

  get 値(): string {
    return this.内部値;
  }

  get 拡張子(): string {
    const 区切り位置 = this.内部値.lastIndexOf(".");
    return this.内部値.slice(区切り位置 + 1);
  }

  equals(他: 添付保存名): boolean {
    return this.内部値 === 他.内部値;
  }
}
