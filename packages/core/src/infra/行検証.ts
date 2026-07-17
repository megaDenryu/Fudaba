// better-sqlite3の戻り値はunknownなので、外部境界としてここで型ガードして絞る。
// スキーマは自分で定義しているため不一致はバグであり、例外で即座に露見させる

export interface 札行 {
  readonly id: number;
  readonly kind: string;
  readonly title: string;
  readonly body: string;
  readonly status: string;
  readonly assignee: string | null;
  readonly creator: string;
  readonly room_link: string | null;
  readonly labels: string;
  readonly attachments: string;
  readonly checklist: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export function 札行に絞る(行: unknown): 札行 {
  if (
    typeof 行 === "object" &&
    行 !== null &&
    "id" in 行 &&
    typeof 行.id === "number" &&
    "kind" in 行 &&
    typeof 行.kind === "string" &&
    "title" in 行 &&
    typeof 行.title === "string" &&
    "body" in 行 &&
    typeof 行.body === "string" &&
    "status" in 行 &&
    typeof 行.status === "string" &&
    "assignee" in 行 &&
    (行.assignee === null || typeof 行.assignee === "string") &&
    "creator" in 行 &&
    typeof 行.creator === "string" &&
    "room_link" in 行 &&
    (行.room_link === null || typeof 行.room_link === "string") &&
    "labels" in 行 &&
    typeof 行.labels === "string" &&
    "attachments" in 行 &&
    typeof 行.attachments === "string" &&
    "checklist" in 行 &&
    typeof 行.checklist === "string" &&
    "created_at" in 行 &&
    typeof 行.created_at === "string" &&
    "updated_at" in 行 &&
    typeof 行.updated_at === "string"
  ) {
    return {
      id: 行.id,
      kind: 行.kind,
      title: 行.title,
      body: 行.body,
      status: 行.status,
      assignee: 行.assignee,
      creator: 行.creator,
      room_link: 行.room_link,
      labels: 行.labels,
      attachments: 行.attachments,
      checklist: 行.checklist,
      created_at: 行.created_at,
      updated_at: 行.updated_at,
    };
  }
  throw new Error(`fudaba_itemsテーブルの行がスキーマと一致しません: ${JSON.stringify(行)}`);
}
