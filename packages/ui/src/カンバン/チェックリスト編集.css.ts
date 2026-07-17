import { style } from "@vanilla-extract/css";
import { Fudabaテーマ配色, Fudaba警告色 } from "../テーマ";

export const ルート = style({ display: "flex", flexDirection: "column", gap: "8px" });
export const ヘッダ = style({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" });
export const 見出し = style({ fontSize: "12px", fontWeight: 700, color: Fudabaテーマ配色.テキスト副 });
export const 一覧 = style({ display: "flex", flexDirection: "column", gap: "6px" });
export const 項目行 = style({ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr) auto", alignItems: "center", gap: "6px" });
export const 完了入力 = style({ width: "18px", height: "18px" });
export const 本文入力 = style({
  minWidth: 0, width: "100%", boxSizing: "border-box", padding: "8px 10px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.パネル表面, color: Fudabaテーマ配色.テキスト主,
});
const 小ボタン = {
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.背景, color: Fudabaテーマ配色.テキスト副,
  padding: "6px 9px", cursor: "pointer",
};
export const 追加ボタン = style({ ...小ボタン });
export const 削除ボタン = style({ ...小ボタン, color: Fudaba警告色.文字 });
export const 分解案内 = style({
  fontSize: "11px", color: Fudaba警告色.文字, backgroundColor: Fudaba警告色.背景弱,
  border: `1px solid ${Fudaba警告色.境界}`, borderRadius: "6px", padding: "6px 8px",
});
