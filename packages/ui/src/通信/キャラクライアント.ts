import { キャラDTO一覧か, type キャラDTO } from "./キャラ型.js";

// AgentRoomの /api/charas への薄いfetchラッパー。FudabaはAgentRoomサーバーと同一オリジンで
// 配信されるため相対パスでそのまま叩ける。作成・編集・削除はAgentRoom UI側の担当のため
// このクライアントは一覧取得のみ持つ
export class キャラクライアント {
  async 一覧を取得する(): Promise<キャラDTO[]> {
    const 応答 = await fetch("/api/charas");
    if (!応答.ok) {
      throw new Error(`キャラ一覧の取得に失敗しました: HTTP ${応答.status}`);
    }
    const データ: unknown = await 応答.json();
    if (!キャラDTO一覧か(データ)) {
      throw new Error("キャラ一覧のレスポンス形式が想定と一致しません");
    }
    return データ;
  }
}

// カンバンビュー・モバイル札ビューのコンストラクタ既定引数から使う。パラメータ名と
// クラス名が同一だとTypeScriptがデフォルト引数内で自己参照と誤認するため、
// `new キャラクライアント()` を直接デフォルト値に書けない事情を回避する
export function 既定のキャラクライアントを作る(): キャラクライアント {
  return new キャラクライアント();
}
