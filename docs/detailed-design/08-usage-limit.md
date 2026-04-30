# 08. 利用回数制限

依存関係: 07（保存機能）

---

## 概要

Pl@ntNet API の無料枠を保護するため、1ユーザー30回/日、全体500回/日の利用回数制限を実装する。

---

## 実装タスク

### 8.1 利用回数管理ロジック（src/lib/usage-limit.ts）

- [ ] 日付キー生成関数
  ```typescript
  // 日本時間（JST）基準の日付文字列を返す
  function getJstDateString(): string {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(0, 10); // "2026-04-30"
  }
  ```

- [ ] `getUserUsage(userId: string): Promise<number>` 関数
  - Firestore `apiUsage/user_{uid}_{YYYYMMDD}` を取得
  - 存在しなければ 0 を返す

- [ ] `getGlobalUsage(): Promise<number>` 関数
  - Firestore `apiUsage/global_{YYYYMMDD}` を取得
  - 存在しなければ 0 を返す

- [ ] `incrementUsage(userId: string): Promise<void>` 関数
  - ユーザー別ドキュメントの `count` をインクリメント（`increment(1)` 使用）
  - 存在しなければ `{ userId, date, count: 1 }` で作成（`setDoc` with `merge: true`）
  - グローバルドキュメントも同様にインクリメント

- [ ] `checkCanUse(userId: string): Promise<UsageCheckResult>` 関数
  ```typescript
  interface UsageCheckResult {
    canUse: boolean;
    userCount: number;
    globalCount: number;
    userRemaining: number;
    reason: "ok" | "user_limit" | "global_limit";
  }
  ```

### 8.2 useUsageLimit フック（src/hooks/useUsageLimit.ts）

- [ ] `useUsageLimit()` フック実装
  ```typescript
  interface UseUsageLimitReturn {
    userCount: number;
    userRemaining: number;
    globalCount: number;
    canUse: boolean;
    isLoading: boolean;
    refresh: () => Promise<void>;
  }
  ```
- [ ] コンポーネントマウント時に現在の使用量を取得
- [ ] `refresh()` で最新値を再取得

### 8.3 ResultPage への組み込み

- [ ] API呼び出し前に `checkCanUse()` を実行
- [ ] `canUse === false` の場合、APIを呼ばずにメッセージを表示
  - `reason === "user_limit"` → 「きょうのお花さがしは おしまい！あしたまた あそぼうね」
  - `reason === "global_limit"` → 「きょうはみんなが たくさん あそんでくれたよ！あしたまた あそぼうね」
- [ ] API呼び出し成功後に `incrementUsage()` を実行（保存の前）

### 8.4 残り回数の表示

- [ ] HomePage に残り回数を表示
  - 残り11回以上: 表示なし（煩わしくならないよう）
  - 残り10回以下: 「きょうは あと {N}かい あそべるよ」（黄色の吹き出し）
  - 残り0回: 「きょうの おはなさがしは おしまい！」（グレーアウト）
- [ ] CameraPage にも残り回数をヘッダーに小さく表示

### 8.5 撮影ボタンの制御

- [ ] HomePage の撮影ボタン
  - 残り0回 → ボタンを無効化（グレーアウト + タップ不可）
  - メッセージ: 「あしたまた あそぼうね」

---

## 完了条件

- 判定を行うたびに Firestore の apiUsage カウントが正しくインクリメントされる
- 30回目の判定後、次の判定がブロックされる
- 全体500回の上限でもブロックされる
- 翌日0:00（JST）に新しいドキュメントIDになり、カウントがリセットされる
- 残り10回以下で警告メッセージが表示される
- 残り0回で撮影ボタンが無効化される
