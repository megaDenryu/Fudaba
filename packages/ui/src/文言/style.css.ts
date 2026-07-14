import { style } from "@vanilla-extract/css";
import { Fudabaテーマ配色 } from "../テーマ";

export const 言語切替セレクト = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  padding: "3px 6px",
  fontSize: "11px",
  cursor: "pointer",
});
