import { TextAreaC } from "sengen-ui";

// 本文入力欄への画像クリップボード貼り付け対応（LV1拡張）。SengenUIのTextAreaEventTypeに
// 'paste'が未定義のため、候補リストC（packages/ui/src/カンバン/候補リストC.ts）と同じ方針で
// このクラス内部（自身のdom）に限定してネイティブaddEventListenerを使う。本来はSengenUI本体の
// EventTypesへ追加すべき拡張だが、今回の変更対象はFudabaリポジトリに限定される
export class 添付貼り付け対応本文入力 extends TextAreaC {
  on画像貼り付け(コールバック: (ファイル: File) => void): this {
    this.dom.element.addEventListener("paste", (event: Event) => {
      if (!(event instanceof ClipboardEvent)) return;
      const 画像ファイル = 貼り付けデータから画像ファイルを取り出す(event);
      if (画像ファイル === null) return;
      event.preventDefault();
      コールバック(画像ファイル);
    });
    return this;
  }
}

function 貼り付けデータから画像ファイルを取り出す(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (items === undefined) return null;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return null;
}
