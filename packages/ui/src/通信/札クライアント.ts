import { 札DTOか, 札DTO一覧か, type 札DTO, type 札作成入力, type 札更新入力 } from "./札型.js";

export interface 添付追加入力 {
  readonly ファイル名: string;
  readonly データURL: string;
}

// /api/fudaba/items への薄いfetchラッパー。Vite devサーバーが/apiを
// 開発用Fudabaサーバー（:7130）へプロキシする前提で、パスは相対で組み立てる
export class 札クライアント {
  async 一覧を取得する(): Promise<札DTO[]> {
    const 応答 = await fetch("/api/fudaba/items");
    if (!応答.ok) {
      throw new Error(`札一覧の取得に失敗しました: HTTP ${応答.status}`);
    }
    const データ: unknown = await 応答.json();
    if (!札DTO一覧か(データ)) {
      throw new Error("札一覧のレスポンス形式が想定と一致しません");
    }
    return データ;
  }

  async 作成する(内容: 札作成入力): Promise<札DTO> {
    const 応答 = await fetch("/api/fudaba/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(内容),
    });
    if (!応答.ok) {
      throw new Error(await この応答からエラーメッセージを読む(応答));
    }
    return この応答から札を読む(await 応答.json());
  }

  async 更新する(id: number, 変更: 札更新入力): Promise<札DTO> {
    const 応答 = await fetch(`/api/fudaba/items/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(変更),
    });
    if (!応答.ok) {
      throw new Error(await この応答からエラーメッセージを読む(応答));
    }
    return この応答から札を読む(await 応答.json());
  }

  async 添付を追加する(id: number, 内容: 添付追加入力): Promise<札DTO> {
    const 応答 = await fetch(`/api/fudaba/items/${encodeURIComponent(String(id))}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(内容),
    });
    if (!応答.ok) {
      throw new Error(await この応答からエラーメッセージを読む(応答));
    }
    return この応答から札を読む(await 応答.json());
  }

  async 添付を削除する(id: number, 保存名: string): Promise<札DTO> {
    const 応答 = await fetch(
      `/api/fudaba/items/${encodeURIComponent(String(id))}/attachments/${encodeURIComponent(保存名)}`,
      { method: "DELETE" },
    );
    if (!応答.ok) {
      throw new Error(await この応答からエラーメッセージを読む(応答));
    }
    return この応答から札を読む(await 応答.json());
  }
}

function この応答から札を読む(データ: unknown): 札DTO {
  if (!札DTOか(データ)) {
    throw new Error("札のレスポンス形式が想定と一致しません");
  }
  return データ;
}

async function この応答からエラーメッセージを読む(応答: Response): Promise<string> {
  try {
    const 本文: unknown = await 応答.json();
    if (
      typeof 本文 === "object" &&
      本文 !== null &&
      "エラー" in 本文 &&
      typeof 本文.エラー === "string"
    ) {
      return 本文.エラー;
    }
  } catch {
    // JSONとして読めない場合は下のフォールバックへ
  }
  return `HTTPステータス ${応答.status}`;
}
