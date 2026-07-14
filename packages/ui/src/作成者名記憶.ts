// UIから札を作成するときの作成者名をブラウザに記憶する（AgentRoomの送信者名記憶を踏襲）。
// localStorageが使えない環境（プライベートモード等）でも入力自体は成立させる

const 保存キー = "fudaba.作成者名";
const デフォルト作成者名 = "人間";

export function 作成者名を読み込む(): string {
  try {
    const 保存値 = window.localStorage.getItem(保存キー);
    if (保存値 !== null && 保存値.trim().length > 0) {
      return 保存値;
    }
  } catch {
    // localStorage不可の環境ではデフォルトへフォールバックする
  }
  return デフォルト作成者名;
}

export function 作成者名を保存する(作成者名: string): void {
  try {
    window.localStorage.setItem(保存キー, 作成者名);
  } catch {
    // 保存できなくても入力欄の値はそのまま使えるため無視する
  }
}
