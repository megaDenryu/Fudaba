import { style } from "@vanilla-extract/css";
import { Fudabaテーマ配色, Fudaba警告色 } from "../テーマ";

export const ルート = style({ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" });
export const 見出し = style({ fontSize: "11px", fontWeight: 700, color: Fudabaテーマ配色.テキスト薄 });
export const 一覧 = style({ display: "flex", flexDirection: "column", gap: "4px" });
export const 空表示 = style({ fontSize: "11px", color: Fudabaテーマ配色.テキスト薄 });
export const 関係項目 = style({
  fontSize: "11px", padding: "3px 7px", borderLeft: `2px solid ${Fudabaテーマ配色.アクセント}`,
  backgroundColor: Fudabaテーマ配色.背景,
});
export const コメント = style({
  display: "flex", flexDirection: "column", gap: "2px", padding: "6px 8px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "4px",
});
export const メタ = style({ fontSize: "9px", color: Fudabaテーマ配色.テキスト薄 });
export const コメント本文 = style({ fontSize: "11px", whiteSpace: "pre-wrap" });
export const 入力行 = style({ display: "flex", flexDirection: "column", gap: "4px" });
export const 作成者 = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "4px", padding: "4px 7px",
  backgroundColor: Fudabaテーマ配色.背景, color: Fudabaテーマ配色.テキスト主,
});
export const 本文 = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "4px", padding: "5px 7px",
  resize: "vertical", backgroundColor: Fudabaテーマ配色.背景, color: Fudabaテーマ配色.テキスト主,
});
export const 追記ボタン = style({
  alignSelf: "flex-start", border: "none", borderRadius: "4px", padding: "5px 12px", cursor: "pointer",
  backgroundColor: Fudabaテーマ配色.ネイビー, color: "#ffffff",
});
export const 状態 = style({ fontSize: "10px", color: Fudaba警告色.文字 });
