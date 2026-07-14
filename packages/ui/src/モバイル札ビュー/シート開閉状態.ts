// ボトムシート（詳細・新規作成）の開閉をdata-attributeで管理するための状態定数
// （SengenUIガイド第13条）。詳細シート・作成シートの両方がこの定数を共有する
export const シート開閉状態 = {
  attribute: "data-open",
  value: {
    開: "true",
    閉: "false",
  },
} as const;
