// フィルタチップの選択有無をdata-attributeで管理するための状態定数（SengenUIガイド第13条）
export const フィルタチップ選択状態 = {
  attribute: "data-selected",
  value: {
    選択中: "true",
    未選択: "false",
  },
} as const;
