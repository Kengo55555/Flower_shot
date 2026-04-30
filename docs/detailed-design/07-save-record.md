# 07. 保存機能

依存関係: 06（花判定）

---

## 概要

判定結果をFirestore（テキスト情報）とIndexedDB（画像）に保存する。

---

## 実装タスク

### 7.1 Firestore書き込み（src/lib/firestore.ts）

- [ ] `saveRecord(record: Omit<FlowerRecord, "id">): Promise<string>` 関数を実装
  ```typescript
  import { collection, addDoc, serverTimestamp } from "firebase/firestore";

  export async function saveRecord(record: Omit<FlowerRecord, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "records"), {
      ...record,
      capturedAt: serverTimestamp(),
    });
    return docRef.id;  // 自動生成されたドキュメントID
  }
  ```
- [ ] `getRecordsByUser(userId: string): Promise<FlowerRecord[]>` 関数を実装
  - `userId` でフィルタ、`capturedAt` 降順ソート
- [ ] `getRecordById(recordId: string): Promise<FlowerRecord | null>` 関数を実装
- [ ] `deleteRecord(recordId: string): Promise<void>` 関数を実装

### 7.2 IndexedDB操作（src/lib/indexeddb.ts）

- [ ] DB初期化関数
  ```typescript
  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(INDEXEDDB_STORE_NAME)) {
          db.createObjectStore(INDEXEDDB_STORE_NAME, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  ```
- [ ] `saveImage(key: string, blob: Blob): Promise<void>` 関数を実装
  ```typescript
  export async function saveImage(key: string, blob: Blob): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(INDEXEDDB_STORE_NAME, "readwrite");
    tx.objectStore(INDEXEDDB_STORE_NAME).put({
      key,
      blob,
      savedAt: Date.now(),
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  ```
- [ ] `getImage(key: string): Promise<Blob | null>` 関数を実装
- [ ] `deleteImage(key: string): Promise<void>` 関数を実装
- [ ] `getAllImageKeys(): Promise<string[]>` 関数を実装（容量管理用）
- [ ] `getStorageEstimate(): Promise<{ usage: number; quota: number }>` 関数を実装
  ```typescript
  export async function getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      return { usage: est.usage || 0, quota: est.quota || 0 };
    }
    return { usage: 0, quota: 0 };
  }
  ```

### 7.3 保存フロー統合（ResultPage内）

- [ ] 「ほぞんする」ボタンタップ時の処理
  1. 保存中のローディング表示（「ほぞんしているよ...」）
  2. `saveRecord()` で Firestore にテキスト情報を保存 → `recordId` を取得
  3. `saveImage(recordId, imageBlob)` で IndexedDB に画像を保存
  4. 保存完了 → 完了メッセージ表示
     - 「ほぞんできたよ！」+ チェックマークアニメーション
  5. CaptureContext をクリア
- [ ] 保存成功後のアクション
  - 「もっと くわしく」ボタン → `/detail/{recordId}`
  - 「ホームに もどる」ボタン → `/`
  - 「つぎの おはなを さがす」ボタン → `/camera`

### 7.4 useRecords フック（src/hooks/useRecords.ts）

- [ ] `useRecords()` フックを実装
  ```typescript
  interface UseRecordsReturn {
    records: FlowerRecord[];
    isLoading: boolean;
    refresh: () => void;
  }
  ```
- [ ] ログインユーザーの全記録を取得
- [ ] 画像は IndexedDB から取得し、`photoLocalKey` で紐づけ
- [ ] 画像が見つからない場合（別端末等）はプレースホルダー表示

### 7.5 画像とテキストの整合性チェック

- [ ] アプリ起動時に Firestore の records と IndexedDB の images を突き合わせ
  - Firestore にあるが IndexedDB にない → `photoLocalKey` に「画像なし」フラグ（表示時にプレースホルダー）
  - IndexedDB にあるが Firestore にない → 孤立画像として削除対象（設定画面で整理）

---

## 完了条件

- 判定結果を「ほぞんする」で Firestore + IndexedDB に保存できる
- 保存後に recordId でデータを取得できる
- IndexedDB の画像と Firestore のテキストが正しく紐づく
- 別端末からアクセスした場合、テキスト情報は表示され、画像はプレースホルダーになる
- 保存完了のアニメーションが表示される
