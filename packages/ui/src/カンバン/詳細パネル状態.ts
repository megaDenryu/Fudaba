// 詳細パネルの開閉をdata-attributeで管理するための状態定数（SengenUIガイド第13条）
export const 詳細パネル開閉状態 = {
  attribute: "data-open",
  value: {
    開: "true",
    閉: "false",
  },
} as const;
