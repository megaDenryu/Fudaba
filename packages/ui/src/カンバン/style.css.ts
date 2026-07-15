import { globalStyle, style } from "@vanilla-extract/css";
import { 狭幅メディアクエリ } from "../レスポンシブ";
import { Fudabaテーマ配色, Fudaba警告色 } from "../テーマ";
import { フィルタチップ選択状態 } from "./フィルタチップ選択状態";
import {
  添付プレビュー開閉状態,
  詳細パネル開閉状態,
  詳細保存ボタン表示状態,
  詳細保存完了ラベル表示状態,
} from "./詳細パネル状態";
import { 淀み表示状態 } from "./淀み表示状態";

export const ルート = style({
  display: "flex",
  flexDirection: "row",
  height: "100%",
  minWidth: 0,
  backgroundColor: Fudabaテーマ配色.背景,
  color: Fudabaテーマ配色.テキスト主,
  fontFamily: Fudabaテーマ配色.基本フォントファミリ,
});

export const 状態表示 = style({
  fontSize: "12px",
  color: Fudaba警告色.文字,
  padding: "4px 14px",
  flexShrink: 0,
  ":empty": { display: "none" },
});

// --- フィルタバー ---

export const フィルタバー = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  padding: "6px 14px",
  borderBottom: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  flexShrink: 0,
});

export const フィルタセクション = style({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
});

export const フィルタラベル = style({
  fontSize: "11px",
  color: Fudabaテーマ配色.テキスト薄,
  fontWeight: 600,
});

export const フィルタ行 = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
});

export const フィルタチップ = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "10px",
  padding: "2px 8px",
  fontSize: "11px",
  cursor: "pointer",
  color: Fudabaテーマ配色.テキスト副,
  backgroundColor: Fudabaテーマ配色.パネル表面,
  "@media": { [狭幅メディアクエリ]: { padding: "6px 12px", fontSize: "12px" } },
});

globalStyle(
  `${フィルタチップ}[${フィルタチップ選択状態.attribute}="${フィルタチップ選択状態.value.選択中}"]`,
  {
    backgroundColor: Fudabaテーマ配色.ネイビー,
    borderColor: Fudabaテーマ配色.ネイビー,
    color: "#ffffff",
  },
);

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
  boxSizing: "border-box",
  resize: "none",
  minHeight: "52px",
  maxHeight: "240px",
  overflowY: "auto",
  border: "none",
  borderRadius: 0,
  backgroundColor: "transparent",
  padding: "5px 8px 30px",
});

export const カンバン本体 = style({
  display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0,
});
export const 作成エディタ = style({
  display: "flex", flexDirection: "column", gap: "6px", padding: "8px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "10px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  selectors: { "&:focus-within": { borderColor: Fudabaテーマ配色.アクセント } },
});

export const フォーム本文領域 = style({
  position: "relative",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  selectors: { "&:focus-within": { borderColor: Fudabaテーマ配色.アクセント } },
});

export const 作成時添付欄 = style({
  display: "flex", flexDirection: "column", gap: "5px", padding: "8px",
  position: "absolute", right: "4px", bottom: "3px", alignItems: "flex-end",
});
export const 作成時添付選択 = style({ fontSize: "11px", maxWidth: "220px" });
export const 作成時添付選択ボタン = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  padding: 0,
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "5px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト副,
  cursor: "pointer",
  ":hover": { color: Fudabaテーマ配色.アクセント, borderColor: Fudabaテーマ配色.アクセント },
});
export const 作成時添付一覧 = style({ display: "flex", flexWrap: "wrap", gap: "5px" });
export const 作成時添付項目 = style({
  display: "flex", alignItems: "center", gap: "5px", maxWidth: "260px", padding: "3px 7px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`, borderRadius: "999px", fontSize: "11px",
});
export const 作成時添付削除 = style({
  border: "none", background: "transparent", color: Fudaba警告色.文字, cursor: "pointer", padding: 0,
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

// 進行中×担当者presence不明の淀んだ札を控えめに強調する枠色(絵文字は使わずバッジ文言のみ)
globalStyle(`${カード}[${淀み表示状態.attribute}="${淀み表示状態.value.淀み}"]`, {
  borderColor: Fudaba警告色.境界,
  backgroundColor: Fudaba警告色.背景弱,
});

export const 淀みバッジ = style({
  alignSelf: "flex-start",
  border: `1px solid ${Fudaba警告色.境界}`,
  borderRadius: "10px",
  padding: "1px 7px",
  fontSize: "10px",
  fontWeight: 600,
  color: Fudaba警告色.文字,
  backgroundColor: Fudaba警告色.背景弱,
});

export const カードラベル行 = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  marginTop: "2px",
});

export const ラベルチップ = style({
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "10px",
  padding: "1px 7px",
  fontSize: "10px",
  color: Fudabaテーマ配色.テキスト副,
  backgroundColor: Fudabaテーマ配色.背景,
});

export const 種別バッジ = style({
  color: "#ffffff",
  borderRadius: "3px",
  padding: "1px 6px",
  fontSize: "10px",
  fontWeight: 700,
});

// --- 詳細パネル ---

export const 詳細パネル = style({
  position: "relative",
  width: "360px",
  maxWidth: "45%",
  height: "100%",
  boxSizing: "border-box",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "12px 14px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  borderLeft: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.08)",
  overflowY: "auto",
  "@media": { [狭幅メディアクエリ]: {
    position: "fixed", inset: 0, width: "100vw", maxWidth: "100vw", zIndex: 10,
  } },
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
  resize: "none",
  minHeight: "96px",
  maxHeight: "50vh",
  overflowY: "auto",
});
export const 詳細状態セレクト = style({ ...フォームコントロール基本, width: "100%" });
export const 詳細担当者入力 = style({ ...フォームコントロール基本, width: "100%" });
export const 詳細ラベル入力欄 = style({ ...フォームコントロール基本, width: "100%" });

export const 詳細担当解除ボタン = style({
  alignSelf: "flex-start",
  border: `1px solid ${Fudaba警告色.境界}`,
  borderRadius: "4px",
  backgroundColor: "transparent",
  color: Fudaba警告色.文字,
  padding: "4px 10px",
  fontSize: "11px",
  cursor: "pointer",
  ":disabled": { opacity: 0.4, cursor: "default" },
});

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

// --- 添付 ---

export const 添付エリア = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const 添付見出し行 = style({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
});

export const 添付ヒント = style({
  fontSize: "10px",
  color: Fudabaテーマ配色.テキスト薄,
});

export const 添付ファイル選択 = style({ fontSize: "11px", maxWidth: "180px" });

globalStyle(`${作成時添付選択}::file-selector-button, ${添付ファイル選択}::file-selector-button`, {
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  borderRadius: "6px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  padding: "5px 9px",
  cursor: "pointer",
});

export const 添付サムネイル領域 = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
});

export const 添付なし表示 = style({
  fontSize: "11px",
  color: Fudabaテーマ配色.テキスト薄,
});

export const 添付サムネイル = style({
  position: "relative",
  width: "64px",
  height: "64px",
  flexShrink: 0,
});

export const 添付サムネイル画像 = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "4px",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  cursor: "pointer",
});

export const 添付削除ボタン = style({
  position: "absolute",
  top: "-6px",
  right: "-6px",
  width: "18px",
  height: "18px",
  lineHeight: "16px",
  padding: 0,
  borderRadius: "50%",
  border: `1px solid ${Fudabaテーマ配色.パネル境界線}`,
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudaba警告色.文字,
  fontSize: "11px",
  cursor: "pointer",
});

export const 添付プレビュー背景 = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
});

globalStyle(
  `${添付プレビュー背景}[${添付プレビュー開閉状態.attribute}="${添付プレビュー開閉状態.value.閉}"]`,
  { display: "none" },
);

export const 添付プレビュー本体 = style({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxWidth: "90vw",
  maxHeight: "90vh",
});

export const 添付プレビュー画像領域 = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 0,
  minHeight: 0,
});

export const 添付プレビュー画像 = style({
  maxWidth: "90vw",
  maxHeight: "80vh",
  objectFit: "contain",
  borderRadius: "4px",
});

export const 添付プレビュー閉じるボタン = style({
  alignSelf: "flex-end",
  border: "none",
  borderRadius: "4px",
  backgroundColor: Fudabaテーマ配色.パネル表面,
  color: Fudabaテーマ配色.テキスト主,
  padding: "6px 14px",
  fontSize: "12px",
  cursor: "pointer",
});
