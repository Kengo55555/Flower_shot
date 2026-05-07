# 07. 保存機能

依存関係: 06（花判定）

---

## 概要

判定結果をFirestore（テキスト情報）とIndexedDB（画像）に保存する。

**v2.0変更点**: recordIdは事前にドキュメント参照で生成し、photoLocalKeyとして使用する。場所選択後に保存を実行。

---

## 実装タスク

### 7.1 Firestore書き込み（src/lib/firestore.ts）

- [x] `saveRecord(record, recordId)` 関数を実装（指定IDでドキュメント作成）
- [x] `getRecordsByUser(userId: string): Promise<FlowerRecord[]>` 関数を実装
- [x] `getRecordById(recordId: string): Promise<FlowerRecord | null>` 関数を実装
- [x] `deleteRecord(recordId: string): Promise<void>` 関数を実装
- [x] `getAllUsers(): Promise<User[]>` 関数を実装（管理者用）
- [x] `updateUserSettings()` 関数を実装
- [x] `markUserReviewed()`, `blockUser()`, `unblockUser()` 関数を実装

### 7.2 IndexedDB操作（src/lib/indexeddb.ts）

- [x] DB初期化関数（`openDB`）
- [x] `saveImage(key: string, blob: Blob): Promise<void>` 関数を実装
- [x] `getImage(key: string): Promise<Blob | null>` 関数を実装
- [x] `deleteImage(key: string): Promise<void>` 関数を実装
- [x] `getStorageEstimate(): Promise<{ usage: number; quota: number }>` 関数を実装

### 7.3 保存フロー統合（ResultPage内 Step4-5）

- [x] recordId を事前にドキュメント参照で生成
  ```typescript
  const newDocRef = createDoc(getCollection(db, "records"));
  const recordId = newDocRef.id;
  ```
- [x] `saveRecord()` で Firestore にテキスト情報を保存
- [x] `saveImage(recordId, compressedBlob)` で IndexedDB に画像を保存
- [x] 保存完了後、CaptureContext をクリア
- [x] 完了後のアクション: 「もっと くわしく」→ `/detail/{recordId}`、「ホームに もどる」→ `/`

### 7.4 useRecords フック（src/hooks/useRecords.ts）

- [x] `useRecords()` フックを実装（records, isLoading を返す）
- [x] ログインユーザーの全記録を取得
- [x] 画像は IndexedDB から各コンポーネント内で個別に取得

---

## 完了条件

- [x] 判定結果を Firestore + IndexedDB に保存できる
- [x] 保存後に recordId でデータを取得できる
- [x] IndexedDB の画像と Firestore のテキストが正しく紐づく
- [x] 保存完了のアニメーション（チェックマーク）が表示される
