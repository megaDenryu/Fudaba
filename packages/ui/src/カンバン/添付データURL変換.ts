// クリップボード貼り付け・ファイル選択で得たFileを、POST /attachmentsのボディが要求する
// data URL（"data:<MIME型>;base64,<データ>"）へ変換する。FileReaderはDOM要素を持たない
// Web Platform APIのため、fetch()と同様SengenUIの対象外として直接使う
export function ファイルをデータURLに変換する(ファイル: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const リーダー = new FileReader();
    リーダー.onload = () => {
      const 結果 = リーダー.result;
      if (typeof 結果 === "string") {
        resolve(結果);
      } else {
        reject(new Error("ファイルの読み込み結果が文字列ではありません"));
      }
    };
    リーダー.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    リーダー.readAsDataURL(ファイル);
  });
}
