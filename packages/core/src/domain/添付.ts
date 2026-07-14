import { 検証エラー } from "./検証エラー.js";
import { 添付保存名 } from "./添付保存名.js";

const ファイル名最大文字数 = 255;

// バグ調査中のスクリーンショット添付を主用途とする(DESIGN.md「何であるか」参照)。
// サイズ上限はDB肥大化を避けるためファイル保存方式にした上でも設ける（ユーザー要求「10MB上限」）
export const 添付最大バイト数 = 10 * 1024 * 1024;

// data URLのbase64エンコードは元データの約1.37倍に膨らむ。JSONラップのオーバーヘッドも
// 加味し、Fastifyのルート単位bodyLimitに使う上限をここで一元管理する（参照: 札ルート.ts）
export const 添付リクエストボディ上限バイト数 = Math.ceil(添付最大バイト数 * 1.4) + 4096;

// 札に付く画像添付1件のメタ情報。バイナリ本体はDBに置かず添付ストレージ（ファイル）に
// 保存し、ここでは保存名・元ファイル名・バイト数だけを持つ（DESIGN.md方針: DB肥大化回避）
export class 添付 {
  private constructor(
    readonly 保存名: 添付保存名,
    readonly ファイル名: string,
    readonly バイト数: number,
    readonly 追加時刻ISO: string,
  ) {}

  static create(引数: {
    保存名: 添付保存名;
    ファイル名: string;
    バイト数: number;
    追加時刻ISO: string;
  }): 添付 {
    const ファイル名 = 引数.ファイル名.trim();
    if (ファイル名.length === 0 || ファイル名.length > ファイル名最大文字数) {
      throw new 検証エラー(
        `添付ファイル名は1〜${ファイル名最大文字数}文字である必要があります: "${引数.ファイル名}"`,
      );
    }
    if (!Number.isInteger(引数.バイト数) || 引数.バイト数 <= 0) {
      throw new 検証エラー(`添付ファイルのバイト数は正の整数である必要があります: ${引数.バイト数}`);
    }
    if (引数.バイト数 > 添付最大バイト数) {
      throw new 検証エラー(
        `添付ファイルは${添付最大バイト数 / (1024 * 1024)}MB以下である必要があります: ${引数.バイト数}バイト`,
      );
    }
    return new 添付(引数.保存名, ファイル名, 引数.バイト数, 引数.追加時刻ISO);
  }

  toJSON(): 添付DTO {
    return {
      保存名: this.保存名.値,
      ファイル名: this.ファイル名,
      バイト数: this.バイト数,
      追加時刻: this.追加時刻ISO,
    };
  }
}

export interface 添付DTO {
  readonly 保存名: string;
  readonly ファイル名: string;
  readonly バイト数: number;
  readonly 追加時刻: string;
}
