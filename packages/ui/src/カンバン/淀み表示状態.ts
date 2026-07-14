// 札カード・札リストカードの淀み表示(進行中×担当者presence不明の強調)を
// data-attributeで管理するための状態定数(SengenUIガイド第13条)
export const 淀み表示状態 = {
  attribute: "data-yodomi",
  value: {
    淀み: "true",
    通常: "false",
  },
} as const;
