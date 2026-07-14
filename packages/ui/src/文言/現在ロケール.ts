import { ロケールか, type ロケール } from "./ロケール";

// FudabaはホストとUIが別配信されうる（AgentRoom/Jimboシェルへの埋め込み等）ため、
// ホスト側のキーと衝突しない専用の保存キーを使う。既定は日本語
const ロケール保存キー = "fudaba.ui.locale";
const 既定ロケール: ロケール = "ja";

export function 現在ロケールを取得する(): ロケール {
  try {
    const 保存値 = window.localStorage.getItem(ロケール保存キー);
    return ロケールか(保存値) ? 保存値 : 既定ロケール;
  } catch {
    // localStorage不可の環境（プライベートモード等）では既定ロケールへフォールバックする
    return 既定ロケール;
  }
}

export function ロケールを設定する(ロケール: ロケール): void {
  try {
    window.localStorage.setItem(ロケール保存キー, ロケール);
  } catch {
    // 保存できなくても今回の操作自体は継続させる（作成者名記憶と同じ方針）
  }
}
