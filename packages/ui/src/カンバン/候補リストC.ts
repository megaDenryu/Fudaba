import { LV1HtmlComponentBase } from "sengen-ui/SengenBase/LV1HtmlComponentBase";
import { HtmlElementProxy } from "sengen-ui/SengenBase/DomProxy";

// 前提: SengenUI(submodules/SengenUI)にはdatalist相当のLV1プリミティブが無い。
// 本来はSengenUI本体に追加すべき拡張だが、今回の変更対象はFudabaリポジトリに限定されるため、
// 既存プリミティブ(TextInputComponent等)と同じ構築パターンをこのファイル内だけに閉じ込めて用意する。
// document.createElementの直接呼び出しはこのクラスの内部実装に限定し、利用側(新規作成フォーム・
// 詳細パネル)からは宣言的メソッドのみで使う
export class 候補リストC extends LV1HtmlComponentBase {
  constructor(id: string) {
    super();
    this.dom.element.id = id;
  }

  protected createDomProxy(): HtmlElementProxy {
    return new HtmlElementProxy(document.createElement("datalist"));
  }

  候補を設定する(候補一覧: readonly string[]): this {
    const 要素 = this.dom.element;
    if (!(要素 instanceof HTMLDataListElement)) {
      throw new Error("候補リストCの内部要素がdatalistではありません");
    }
    要素.replaceChildren(
      ...候補一覧.map((候補) => {
        const option = document.createElement("option");
        option.value = 候補;
        return option;
      }),
    );
    return this;
  }
}
