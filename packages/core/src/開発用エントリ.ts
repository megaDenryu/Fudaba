import path from "node:path";
import { Fudaba開発用サーバーを起動する } from "./開発用起動.js";

// CLI実行時のみのコンポジションルート（動作確認ハーネス用）。UIパッケージのVite devサーバーが
// /api を http://localhost:7130 へプロキシする前提でポートを合わせている
const ポート = Number(process.env["FUDABA_DEV_PORT"] ?? "7130");
const DBパス =
  process.env["FUDABA_DEV_DB_PATH"] ?? path.join(import.meta.dirname, "..", "data", "fudaba-dev.sqlite3");
const 添付ディレクトリ =
  process.env["FUDABA_DEV_ATTACHMENTS_DIR"] ??
  path.join(import.meta.dirname, "..", "data", "fudaba-attachments-dev");

const 結果 = await Fudaba開発用サーバーを起動する({ ポート, DBパス, 添付ディレクトリ });
if (結果.種別 === "失敗") {
  console.error(`Fudaba開発用サーバーの起動に失敗しました: ${結果.原因}`);
  process.exit(1);
}
