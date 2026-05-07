# 08. 利用回数制限

依存関係: 07（保存機能）

---

## 概要

Pl@ntNet API の無料枠を保護するため、1ユーザー100回/日、全体500回/日の利用回数制限を実装する。

**v2.0変更点**: ユーザー上限を30回/日から100回/日に変更（想定ユーザー5名のため）。

---

## 実装タスク

### 8.1 利用回数管理ロジック（src/lib/usage-limit.ts）

- [x] 日付キー生成関数（JST基準）
- [x] `getUserUsage(userId: string): Promise<number>` 関数
- [x] `getGlobalUsage(): Promise<number>` 関数
- [x] `incrementUsage(userId: string): Promise<void>` 関数（ユーザー + グローバル両方インクリメント）
- [x] `checkCanUse(userId: string): Promise<UsageCheckResult>` 関数

### 8.2 useUsageLimit フック（src/hooks/useUsageLimit.ts）

- [x] `useUsageLimit()` フック実装（userCount, userRemaining, canUse 等を返す）
- [x] コンポーネントマウント時に現在の使用量を取得

### 8.3 ResultPage への組み込み

- [x] API呼び出し前に `checkCanUse()` を実行
- [x] `canUse === false` の場合、APIを呼ばずにメッセージを表示
  - `reason === "user_limit"` → 個人上限メッセージ
  - `reason === "global_limit"` → 全体上限メッセージ
- [x] API呼び出し成功後に `incrementUsage()` を実行

### 8.4 残り回数の表示

- [x] HomePage に残り回数を表示
  - 残り11回以上: 表示なし
  - 残り10回以下: 「きょうは あと {N}かい あそべるよ」（黄色背景）
  - 残り0回: 「きょうの おはなさがしは おしまい！」（グレーアウト）

### 8.5 撮影ボタンの制御

- [x] 残り0回 → CaptureButton を無効化（disabled prop）

---

## 完了条件

- [x] 判定を行うたびに Firestore の apiUsage カウントが正しくインクリメントされる
- [x] 100回目の判定後、次の判定がブロックされる
- [x] 全体500回の上限でもブロックされる
- [x] 翌日0:00（JST）に新しいドキュメントIDになり、カウントがリセットされる
- [x] 残り10回以下で警告メッセージが表示される
- [x] 残り0回で撮影ボタンが無効化される
