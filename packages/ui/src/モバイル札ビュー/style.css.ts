import { globalStyle, style } from "@vanilla-extract/css";
import {
  詳細保存ボタン表示状態,
  詳細保存完了ラベル表示状態,
} from "../カンバン/詳細パネル状態";
import { Fudabaテーマ配色, Fudaba警告色 } from "../テーマ";
import { シート開閉状態 } from "./シート開閉状態";

// AgentRoomモバイルシェルが単一フルスクリーンビューとしてホストする前提の部品
// （Jimbo/ARCHITECTURE.md「デスクトップとモバイルは別シェル・別ビュー」）。
// 390px幅を基準に、タップ領域は44px以上を確保する

export const ルート = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  position: "relative",
  backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
  fontFamily: Fudabaテーマ配色.基本フォントファミリ,
});

export const ヘッダ = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  flexShrink: 0,
});

export const タイトル = style({ fontSize: "16px", fontWeight: 700 });

export const 更新ボタン = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  minHeight: "40px",
  padding: "8px 14px",
  fontSize: "13px",
  cursor: "pointer",
});

export const 状態表示 = style({
  fontSize: "12px",
  color: Fudaba警告色.文字,
  padding: "4px 16px",
  flexShrink: 0,
  ":empty": { display: "none" },
});

export const タブ行 = style({
  display: "flex",
  gap: "6px",
  padding: "8px 12px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  flexShrink: 0,
});

export const タブ項目 = style({ flex: 1, textAlign: "center" });

export const リスト領域 = style({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: "8px 12px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

export const リスト空表示 = style({
  display: "block",
  fontSize: "13px",
  color: Fudabaテーマ配色.テキスト薄,
  textAlign: "center",
  padding: "32px 8px",
});

export const 一覧カード = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "12px",
  borderRadius: "8px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  backgroundColor: Fudabaテーマ配色.パネル表面,
  cursor: "pointer",
  minHeight: "44px",
});

export const 一覧カード上段 = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const 一覧カードID = style({ fontSize: "11px", color: Fudabaテーマ配色.テキスト薄 });

export const 一覧カードタイトル = style({
  fontSize: "14px",
  fontWeight: 600,
  overflowWrap: "anywhere",
});

export const 一覧カード下段 = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "12px",
  color: Fudabaテーマ配色.テキスト副,
});

export const 一覧カードラベル行 = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
});

export const 作成ボタン = style({
  position: "absolute",
  right: "16px",
  bottom: "16px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  border: "none",
  backgroundColor: Fudabaテーマ配色.ネイビー,
  color: "#ffffff",
  fontSize: "28px",
  lineHeight: "56px",
  padding: 0,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
  cursor: "pointer",
});

// --- ボトムシート共通 ---

export const シート背景 = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
});

globalStyle(`${シート背景}[${シート開閉状態.attribute}="${シート開閉状態.value.閉}"]`, {
  display: "none",
});

export const シート本体 = style({
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "16px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
  boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.2)",
  overflowY: "auto",
});

globalStyle(`${シート本体}[${シート開閉状態.attribute}="${シート開閉状態.value.閉}"]`, {
  display: "none",
});

export const シートヘッダ = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "8px",
});

export const シートヘッダ本体 = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  flex: 1,
  minWidth: 0,
});

export const シートメタ行 = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

export const シート閉じるボタン = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
  minHeight: "40px",
  padding: "6px 14px",
  fontSize: "13px",
  cursor: "pointer",
});

const フィールド共通 = {
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "6px",
  fontSize: "14px",
  fontFamily: Fudabaテーマ配色.基本フォントファミリ,
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  padding: "10px 12px",
  minHeight: "44px",
  width: "100%",
  boxSizing: "border-box" as const,
};

export const シートフィールドラベル = style({
  fontSize: "12px",
  color: Fudabaテーマ配色.テキスト薄,
  fontWeight: 600,
});

export const シート入力 = style({ ...フィールド共通 });
export const シート本文入力 = style({ ...フィールド共通, resize: "vertical" });
export const シートセレクト = style({ ...フィールド共通 });

export const シート保存ボタン行 = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

export const シート保存ボタン = style({
  border: "none",
  borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.ネイビー,
  color: "#ffffff",
  minHeight: "44px",
  padding: "10px 18px",
  fontSize: "14px",
  cursor: "pointer",
});

globalStyle(
  `${シート保存ボタン}[${詳細保存ボタン表示状態.attribute}="${詳細保存ボタン表示状態.value.非表示}"]`,
  { display: "none" },
);

export const シート保存完了ラベル = style({
  fontSize: "13px",
  color: Fudabaテーマ配色.テキスト副,
});

globalStyle(
  `${シート保存完了ラベル}[${詳細保存完了ラベル表示状態.attribute}="${詳細保存完了ラベル表示状態.value.非表示}"]`,
  { display: "none" },
);
