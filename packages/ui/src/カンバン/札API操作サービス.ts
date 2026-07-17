import type { 札クライアント } from "../通信/札クライアント";
import type { 札DTO, 札更新入力 } from "../通信/札型";
import { ファイルをデータURLに変換する } from "./添付データURL変換";
import { 添付最大バイト数 } from "./定数";
import type { 札作成要求 } from "./札作成要求";
import type { 状態表示ラベル } from "./状態表示ラベル";

export interface 札API操作文言 {
  readonly 添付超過: (MB: number) => string;
  readonly 作成失敗: string; readonly 更新失敗: string;
  readonly 添付追加失敗: string; readonly 添付削除失敗: string;
}

export class 札API操作サービス {
  constructor(
    private readonly _クライアント: 札クライアント,
    private readonly _状態表示: 状態表示ラベル,
    private readonly _文言: 札API操作文言,
    private readonly _更新する: () => Promise<readonly 札DTO[] | undefined>,
  ) {}

  async 作成する(要求: 札作成要求, 成功時: () => void): Promise<void> {
    if (要求.添付ファイル一覧.some((file) => file.size > 添付最大バイト数)) {
      this._状態表示.エラーを表示する(this._文言.添付超過(添付最大バイト数 / 1024 / 1024));
      return;
    }
    try {
      const 作成済み = await this._クライアント.作成する(要求.内容);
      for (const file of 要求.添付ファイル一覧) await this._添付を送信する(作成済み.id, file);
      成功時();
      await this._更新する();
    } catch (error) { this._エラーを表示する(error, this._文言.作成失敗); }
  }

  async 保存する(id: number, 変更: 札更新入力, 成功時: (札: 札DTO) => void): Promise<void> {
    try {
      await this._クライアント.更新する(id, 変更);
      const 一覧 = await this._更新する();
      const 札 = 一覧?.find((item) => item.id === id);
      if (札 !== undefined) 成功時(札);
    } catch (error) { this._エラーを表示する(error, this._文言.更新失敗); }
  }

  async 添付を追加する(id: number, file: File, 成功時: (札: 札DTO) => void): Promise<void> {
    if (file.size > 添付最大バイト数) {
      this._状態表示.エラーを表示する(this._文言.添付超過(添付最大バイト数 / 1024 / 1024));
      return;
    }
    try {
      await this._添付を送信する(id, file);
      const 一覧 = await this._更新する();
      const 札 = 一覧?.find((item) => item.id === id);
      if (札 !== undefined) 成功時(札);
    } catch (error) { this._エラーを表示する(error, this._文言.添付追加失敗); }
  }

  async 添付を削除する(id: number, 保存名: string, 成功時: (札: 札DTO) => void): Promise<void> {
    try {
      await this._クライアント.添付を削除する(id, 保存名);
      const 一覧 = await this._更新する();
      const 札 = 一覧?.find((item) => item.id === id);
      if (札 !== undefined) 成功時(札);
    } catch (error) { this._エラーを表示する(error, this._文言.添付削除失敗); }
  }

  private async _添付を送信する(id: number, file: File): Promise<void> {
    if (file.size > 添付最大バイト数) throw new Error(this._文言.添付超過(添付最大バイト数 / 1024 / 1024));
    const データURL = await ファイルをデータURLに変換する(file);
    await this._クライアント.添付を追加する(id, { ファイル名: file.name, データURL });
  }

  private _エラーを表示する(error: unknown, 既定文言: string): void {
    this._状態表示.エラーを表示する(error instanceof Error ? error.message : 既定文言);
  }
}
