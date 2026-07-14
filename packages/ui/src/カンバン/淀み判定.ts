import type { キャラDTO } from "../通信/キャラ型";
import type { 稼働表明DTO } from "../通信/稼働型";
import type { 札DTO } from "../通信/札型";

const 稼働状態不明 = "不明";
const 進行中状態値 = "進行中";
const AI種別値 = "AI";

// キャラ一覧から、presence表明の対象とすべきAI担当者名の集合を作る。人間はpresenceを
// 表明しない運用が普通なため、人間が担当する札まで淀み警告だらけにしないよう対象から除く
export function AI担当者名集合を作る(キャラ一覧: readonly キャラDTO[]): ReadonlySet<string> {
  return new Set(
    キャラ一覧.filter((キャラ) => キャラ.種別 === AI種別値).map((キャラ) => キャラ.名前),
  );
}

// 稼働表明一覧から、名前をキーにした表示状態のマップを作る
export function 稼働状態マップを作る(
  稼働一覧: readonly 稼働表明DTO[],
): ReadonlyMap<string, string> {
  return new Map(稼働一覧.map((表明) => [表明.名前, 表明.状態]));
}

// 「状態=進行中 かつ 担当者のpresenceが不明または未表明」の札を淀んでいると判定する。
// 担当者が未割当、またはAI担当者名集合に含まれない(人間 or 未登録名)札は対象外とする
export function 淀んでいるか(
  札: 札DTO,
  AI担当者名集合: ReadonlySet<string>,
  稼働状態マップ: ReadonlyMap<string, string>,
): boolean {
  if (札.状態 !== 進行中状態値) {
    return false;
  }
  if (札.担当者 === null) {
    return false;
  }
  if (!AI担当者名集合.has(札.担当者)) {
    return false;
  }
  const 稼働状態 = 稼働状態マップ.get(札.担当者);
  return 稼働状態 === undefined || 稼働状態 === 稼働状態不明;
}
