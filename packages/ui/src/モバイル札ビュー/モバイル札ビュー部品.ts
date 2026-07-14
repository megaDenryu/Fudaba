import { 作成シート } from "./作成シート";
import { 状態セグメントタブ } from "./状態セグメントタブ";
import { 詳細シート } from "./詳細シート";
import { 札リスト本体 } from "./札リスト本体";

// モバイル札ビューが集約する部品の型契約（部品DTO）。構築はstaticファクトリに閉じる
export class モバイル札ビュー部品 {
  private constructor(
    readonly 状態タブ: 状態セグメントタブ,
    readonly リスト: 札リスト本体,
    readonly 詳細シート: 詳細シート,
    readonly 作成シート: 作成シート,
  ) {}

  static 作る(): モバイル札ビュー部品 {
    return new モバイル札ビュー部品(
      new 状態セグメントタブ(),
      new 札リスト本体(),
      new 詳細シート(),
      new 作成シート(),
    );
  }
}
