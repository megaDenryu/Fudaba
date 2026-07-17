function 区切る(入力値: string): string[] {
  return 入力値.split(/[,、]/).map((値) => 値.trim()).filter((値) => 値.length > 0);
}

export function 複数ラベル入力向け候補を作る(
  入力値: string,
  全候補: readonly string[],
): string[] {
  const 入力ラベル一覧 = 区切る(入力値);
  const 末尾 = 入力ラベル一覧.at(-1) ?? "";
  const 末尾が確定済み = 全候補.includes(末尾);
  const 確定済み = 末尾が確定済み ? 入力ラベル一覧 : 入力ラベル一覧.slice(0, -1);
  const 入力途中 = 末尾が確定済み ? "" : 末尾.toLocaleLowerCase("ja");
  const 確定済み集合 = new Set(確定済み);
  const 接頭辞 = 確定済み.length === 0 ? "" : `${確定済み.join(", ")}, `;

  return 全候補
    .filter((候補) => !確定済み集合.has(候補))
    .filter((候補) => 入力途中.length === 0 || 候補.toLocaleLowerCase("ja").startsWith(入力途中))
    .map((候補) => `${接頭辞}${候補}`);
}
