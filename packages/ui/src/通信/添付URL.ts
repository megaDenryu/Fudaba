// 添付画像の配信URLを組み立てる。APIの正本は packages/core/src/api/札ルート.ts の
// GET /api/fudaba/attachments/:保存名
export function 添付URLを組み立てる(保存名: string): string {
  return `/api/fudaba/attachments/${encodeURIComponent(保存名)}`;
}
