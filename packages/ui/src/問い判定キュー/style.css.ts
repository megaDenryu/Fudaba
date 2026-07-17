import { style } from "@vanilla-extract/css";
import { Fudabaテーマ配色, Fudaba警告色 } from "../テーマ";

export const ルート = style({
  display: "flex", flexDirection: "column", gap: "6px", padding: "8px 14px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  backgroundColor: Fudabaテーマ配色.背景, flexShrink: 0,
});
export const ヘッダ = style({ display: "flex", alignItems: "center", gap: "10px" });
export const 見出し = style({ fontSize: "13px", fontWeight: 700 });
export const 件数 = style({ fontSize: "11px", color: Fudabaテーマ配色.テキスト副 });
export const 更新ボタン = style({
  marginLeft: "auto", border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px", padding: "3px 9px", cursor: "pointer",
  backgroundColor: Fudabaテーマ配色.パネル表面, color: Fudabaテーマ配色.テキスト主,
});
export const カード = style({
  display: "flex", flexDirection: "column", gap: "6px", padding: "9px 11px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
});
export const タイトル = style({ fontSize: "13px", fontWeight: 700 });
export const 本文 = style({ fontSize: "12px", whiteSpace: "pre-wrap", maxHeight: "100px", overflowY: "auto" });
export const メタ = style({ fontSize: "10px", color: Fudabaテーマ配色.テキスト薄 });
export const 添付領域 = style({ display: "flex", gap: "8px", flexWrap: "wrap", maxHeight: "180px", overflowY: "auto" });
export const 添付画像 = style({ maxWidth: "260px", maxHeight: "160px", objectFit: "contain", borderRadius: "4px" });
export const 添付テキスト = style({ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "11px", maxHeight: "150px", overflow: "auto", padding: "6px", border: `1px solid ${Fudabaテーマ配色.パネル境界線}` });
export const 回答入力行 = style({ display: "flex", gap: "6px", flexWrap: "wrap" });
export const 回答者 = style({
  width: "140px", border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px", padding: "5px 8px", backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
});
export const メモ = style({
  flex: 1, minWidth: "180px", minHeight: "34px", resize: "vertical",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "4px",
  padding: "5px 8px", backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
});
export const 選択肢領域 = style({ display: "flex", gap: "6px", flexWrap: "wrap" });
export const 選択肢ボタン = style({
  border: "none", borderRadius: "4px", padding: "6px 14px", cursor: "pointer",
  backgroundColor: Fudabaテーマ配色.ネイビー, color: "#ffffff", fontSize: "12px",
});
export const 状態 = style({ fontSize: "11px", color: Fudaba警告色.文字, minHeight: "14px" });
