import { 稼働表明DTO一覧か, type 稼働表明DTO } from "./稼働型.js";

// AgentRoomの /api/presence への薄いfetchラッパー。FudabaはAgentRoomサーバーと同一オリジンで
// 配信されるため相対パスでそのまま叩ける。稼働表明の送信(PUT)はAgentRoom側の担当のため
// このクライアントは一覧取得のみ持つ
export class 稼働クライアント {
  async 一覧を取得する(): Promise<稼働表明DTO[]> {
    const 応答 = await fetch("/api/presence");
    if (!応答.ok) {
      throw new Error(`稼働一覧の取得に失敗しました: HTTP ${応答.status}`);
    }
    const データ: unknown = await 応答.json();
    if (!稼働表明DTO一覧か(データ)) {
      throw new Error("稼働一覧のレスポンス形式が想定と一致しません");
    }
    return データ;
  }
}

// カンバンビュー・モバイル札ビューのコンストラクタ既定引数から使う。パラメータ名と
// クラス名が同一だとTypeScriptがデフォルト引数内で自己参照と誤認するため、
// `new 稼働クライアント()` を直接デフォルト値に書けない事情を回避する
export function 既定の稼働クライアントを作る(): 稼働クライアント {
  return new 稼働クライアント();
}
