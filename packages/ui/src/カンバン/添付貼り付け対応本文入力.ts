import { TextAreaC } from "sengen-ui";

// 本文入力欄への画像クリップボード貼り付け対応（LV1拡張）。SengenUIのTextAreaEventTypeに
// 'paste'が未定義のため、候補リストC（packages/ui/src/カンバン/候補リストC.ts）と同じ方針で
// このクラス内部（自身のdom）に限定してネイティブaddEventListenerを使う。本来はSengenUI本体の
// EventTypesへ追加すべき拡張だが、今回の変更対象はFudabaリポジトリに限定される
export class 添付貼り付け対応本文入力 extends TextAreaC {
  public override setValue(value: string): this {
    super.setValue(value);
    queueMicrotask(() => this.autoFitToContent());
    return this;
  }

  入力に合わせて高さを調整する(): this {
    this.addTextAreaEventListener("input", () => this.autoFitToContent());
    return this;
  }

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

  on画像ドロップ(コールバック: (ファイル: File) => void): this {
    this.dom.element.addEventListener("dragover", (event) => event.preventDefault());
    this.dom.element.addEventListener("drop", (event) => {
      if (!(event instanceof DragEvent)) return;
      const 画像一覧 = [...(event.dataTransfer?.files ?? [])].filter((file) => file.type.startsWith("image/"));
      if (画像一覧.length === 0) return;
      event.preventDefault();
      画像一覧.forEach(コールバック);
    });
    return this;
  }

  on保存ショートカット(コールバック: () => void): this {
    this.dom.element.addEventListener("keydown", (event) => {
      if (!(event instanceof KeyboardEvent) || event.key !== "Enter" || (!event.ctrlKey && !event.metaKey)) return;
      event.preventDefault();
      コールバック();
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
