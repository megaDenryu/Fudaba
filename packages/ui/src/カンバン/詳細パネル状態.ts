// 詳細パネルの開閉をdata-attributeで管理するための状態定数（SengenUIガイド第13条）
export const 詳細パネル開閉状態 = {
  attribute: "data-open",
  value: {
    開: "true",
    閉: "false",
  },
} as const;

// 保存ボタンの表示可否をdata-attributeで管理するための状態定数。フォームが
// 元の札の値から変更されているあいだだけ表示する
export const 詳細保存ボタン表示状態 = {
  attribute: "data-visible",
  value: {
    表示: "true",
    非表示: "false",
  },
} as const;

// 保存完了ラベルの表示可否をdata-attributeで管理するための状態定数。保存成功直後だけ
// 表示し、次の編集開始や別札への切り替えで隠す
export const 詳細保存完了ラベル表示状態 = {
  attribute: "data-visible",
  value: {
    表示: "true",
    非表示: "false",
  },
} as const;
