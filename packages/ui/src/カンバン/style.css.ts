import { globalStyle, style } from "@vanilla-extract/css";
import { 狭幅メディアクエリ } from "../レスポンシブ";
import { Fudabaテーマ配色, Fudaba警告色 } from "../テーマ";
import {
  詳細パネル開閉状態,
  詳細保存ボタン表示状態,
  詳細保存完了ラベル表示状態,
} from "./詳細パネル状態";

export const ルート = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
  fontFamily: Fudabaテーマ配色.基本フォントファミリ,
});

export const ヘッダ = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  flexShrink: 0,
});

export const タイトル = style({ fontSize: "15px", fontWeight: 700 });

export const 更新ボタン = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  padding: "4px 12px",
  fontSize: "12px",
  cursor: "pointer",
  ":hover": { backgroundColor: Fudabaテーマ配色.ホバー背景 },
  "@media": { [狭幅メディアクエリ]: { minHeight: "44px", padding: "10px 14px" } },
});

export const 状態表示 = style({
  fontSize: "12px",
  color: Fudaba警告色.文字,
  padding: "4px 14px",
  flexShrink: 0,
  ":empty": { display: "none" },
});

// --- 新規作成フォーム ---

export const 新規フォーム = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "8px 14px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  flexShrink: 0,
});

export const 新規フォーム行 = style({
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
});

const フォームコントロール基本 = {
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px",
  fontSize: "12px",
  fontFamily: Fudabaテーマ配色.基本フォントファミリ,
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  padding: "5px 8px",
};

export const フォームセレクト = style({ ...フォームコントロール基本, maxWidth: "110px" });
export const フォーム入力 = style({ ...フォームコントロール基本, flex: 1, minWidth: "140px" });
export const フォーム担当者 = style({ ...フォームコントロール基本, maxWidth: "140px" });
export const フォーム本文 = style({
  ...フォームコントロール基本,
  width: "100%",
  resize: "vertical",
});

export const フォームボタン = style({
  border: "none",
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.ネイビー,
  color: "#ffffff",
  padding: "5px 14px",
  fontSize: "12px",
  cursor: "pointer",
  flexShrink: 0,
  "@media": { [狭幅メディアクエリ]: { minHeight: "44px", padding: "10px 16px" } },
});

// --- カンバン列一覧 ---

export const 列一覧領域 = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  gap: "10px",
  padding: "10px 14px",
  // 列4本に満たない幅（ホストパネル同居時の1280px等）でも4列目が見切れず
  // スクロールできることが分かるよう、常時スクロールバーを出す（overflow-x:autoだと
  // 環境によりスクロール手がかりが無いまま右端が切れて見える）
  overflowX: "scroll",
  scrollbarWidth: "thin",
  scrollbarColor: `${Fudabaテーマ配色.パネル境界線} transparent`,
  "::-webkit-scrollbar": { height: "8px" },
  "::-webkit-scrollbar-thumb": {
    backgroundColor: Fudabaテーマ配色.パネル境界線,
    borderRadius: "4px",
  },
});

export const 列 = style({
  display: "flex",
  flexDirection: "column",
  width: "220px",
  minWidth: "220px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "6px",
  overflow: "hidden",
});

export const 列見出し = style({
  fontSize: "13px",
  fontWeight: 700,
  padding: "8px 10px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  flexShrink: 0,
});

export const 列本体 = style({ flex: 1, minHeight: 0, overflowY: "auto", padding: "6px" });

export const 列空表示 = style({
  display: "block",
  fontSize: "11px",
  color: Fudabaテーマ配色.テキスト薄,
  textAlign: "center",
  padding: "16px 8px",
});

// --- 札カード ---

export const カード = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "8px",
  marginBottom: "6px",
  borderRadius: "4px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  cursor: "pointer",
  ":hover": { backgroundColor: Fudabaテーマ配色.ホバー背景 },
});

export const カード上段 = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const カードID = style({ fontSize: "10px", color: Fudabaテーマ配色.テキスト薄 });

export const カードタイトル = style({
  fontSize: "12px",
  fontWeight: 600,
  overflowWrap: "anywhere",
});

export const カード担当者 = style({ fontSize: "11px", color: Fudabaテーマ配色.テキスト副 });

export const 種別バッジ = style({
  color: "#ffffff",
  borderRadius: "3px",
  padding: "1px 6px",
  fontSize: "10px",
  fontWeight: 700,
});

// --- 詳細パネル ---

export const 詳細パネル = style({
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  width: "360px",
  maxWidth: "90vw",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "12px 14px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  borderLeft: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.12)",
  overflowY: "auto",
  "@media": { [狭幅メディアクエリ]: { width: "100vw", maxWidth: "100vw" } },
});

globalStyle(`${詳細パネル}[${詳細パネル開閉状態.attribute}="${詳細パネル開閉状態.value.閉}"]`, {
  display: "none",
});

export const 詳細ヘッダ = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "8px",
});

export const 詳細ヘッダ本体 = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  flex: 1,
  minWidth: 0,
});

export const 詳細メタ行 = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

export const 詳細閉じるボタン = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
  padding: "3px 10px",
  fontSize: "12px",
  cursor: "pointer",
});

export const 詳細ラベル = style({
  fontSize: "11px",
  color: Fudabaテーマ配色.テキスト薄,
  fontWeight: 600,
});

export const 詳細タイトル入力 = style({
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  border: "none",
  borderBottom: "1px solid transparent",
  borderRadius: 0,
  padding: "2px 0",
  fontSize: "17px",
  fontWeight: 700,
  fontFamily: Fudabaテーマ配色.基本フォントファミリ,
  backgroundColor: "transparent",
  color: Fudabaテーマ配色.テキスト主,
  // パネル幅を超える長文タイトルは非フォーカス時に末尾を省略記号で示す
  // （あふれの視覚手がかり）。フォーカス中は入力位置へブラウザが自動スクロールする
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  ":hover": { borderBottomColor: Fudabaテーマ配色.パネル境界線 },
  ":focus": { outline: "none", borderBottomColor: Fudabaテーマ配色.アクセント },
});
export const 詳細本文入力 = style({
  ...フォームコントロール基本,
  width: "100%",
  resize: "vertical",
});
export const 詳細状態セレクト = style({ ...フォームコントロール基本, width: "100%" });
export const 詳細担当者入力 = style({ ...フォームコントロール基本, width: "100%" });

export const 詳細行 = style({ display: "flex", gap: "10px" });
export const 詳細フィールド = style({ display: "flex", flexDirection: "column", gap: "4px", flex: 1 });
// 詳細行（横並び）の中でだけ幅分割にflex:1を使う。詳細パネル直下（縦積みのflexコンテナ）に
// そのまま置くとflex:1が縦方向の伸長として効き、種別欄の下に巨大な空白ができるため、
// 単独配置（種別欄）はflex:1を持たないこちらを使う
export const 詳細フィールド単独 = style({ display: "flex", flexDirection: "column", gap: "4px" });

export const 詳細保存ボタン行 = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "4px",
});

export const 詳細保存ボタン = style({
  border: "none",
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.ネイビー,
  color: "#ffffff",
  padding: "7px 14px",
  fontSize: "12px",
  cursor: "pointer",
});

export const 詳細保存完了ラベル = style({
  fontSize: "12px",
  color: Fudabaテーマ配色.テキスト副,
});

globalStyle(
  `${詳細保存完了ラベル}[${詳細保存完了ラベル表示状態.attribute}="${詳細保存完了ラベル表示状態.value.非表示}"]`,
  { display: "none" },
);

globalStyle(
  `${詳細保存ボタン}[${詳細保存ボタン表示状態.attribute}="${詳細保存ボタン表示状態.value.非表示}"]`,
  { display: "none" },
);
