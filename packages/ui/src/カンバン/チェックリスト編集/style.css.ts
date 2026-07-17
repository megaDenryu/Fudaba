import { style } from "@vanilla-extract/css";

export const ルート = style({ display: "grid", gap: "8px" });
export const ヘッダ = style({ display: "flex", alignItems: "center", justifyContent: "space-between" });
export const 見出し = style({ fontSize: "13px", fontWeight: 700, color: "#475569" });
export const 追加ボタン = style({ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 8px" });
export const 分解案内 = style({ fontSize: "12px", color: "#b45309", lineHeight: 1.5 });
export const 一覧 = style({ display: "grid", gap: "6px" });
export const 項目行 = style({ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", gap: "8px", alignItems: "center" });
export const 完了入力 = style({ width: "18px", height: "18px" });
export const 本文入力 = style({ minWidth: 0, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "7px 8px" });
export const 削除ボタン = style({ border: 0, background: "transparent", color: "#b91c1c", padding: "4px" });
