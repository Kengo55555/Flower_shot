# 14. 管理者ダッシュボード（Phase 2）

依存関係: 03（認証フロー）、07（保存機能）、08（利用回数制限）

---

## 概要

管理者（nomurakengo@gmail.com）専用の管理画面。ユーザー管理、API使用量の監視、撮影記録の閲覧、ブロック機能を提供する。

---

## 実装タスク

### 14.1 管理者ダッシュボード（src/pages/admin/AdminDashboard.tsx）

- [ ] 画面レイアウト（カード形式のダッシュボード）
  - カード1: 未確認新規ユーザー数（ハイライト表示）
  - カード2: 本日のAPI使用量（{globalCount}/500）
  - カード3: 今月の総撮影数
  - カード4: 総ユーザー数
  - カード5: ブロック中のユーザー数
- [ ] ナビゲーション
  - 「ユーザー一覧」ボタン → `/admin/users`
  - 「撮影記録一覧」ボタン → `/admin/records`

### 14.2 ダッシュボードのデータ取得

- [ ] 未確認新規ユーザー数
  ```typescript
  // Firestore query: users where reviewedByAdmin == false
  const q = query(collection(db, "users"), where("reviewedByAdmin", "==", false));
  ```
- [ ] 本日のAPI使用量
  ```typescript
  // Firestore: apiUsage/global_{YYYYMMDD}
  const globalDoc = await getDoc(doc(db, "apiUsage", `global_${getJstDateString()}`));
  ```
- [ ] 今月の総撮影数
  ```typescript
  // Firestore query: records where capturedAt >= 月初
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(collection(db, "records"), where("capturedAt", ">=", startOfMonth));
  ```
- [ ] Firestore無料枠の使用状況
  - 読取/書込の厳密なカウントはFirestore側ではできないため、目安として記録件数で推定
  - 80%超過の目安ラインを計算して警告表示

### 14.3 ユーザー一覧画面（src/pages/admin/AdminUsers.tsx）

- [ ] 画面レイアウト
  - フィルタ: 「すべて」/「未確認のみ」/「ブロック中」タブ
  - ユーザーリスト（テーブル形式）
    - 表示名
    - メールアドレス
    - 初回ログイン日
    - 最終ログイン日
    - 撮影記録数
    - 確認状態（未確認はハイライト）
    - アクションボタン
- [ ] データ取得
  ```typescript
  // 全ユーザーを取得（管理者権限）
  const q = query(collection(db, "users"), orderBy("firstLoginAt", "desc"));
  ```

### 14.4 ユーザー確認機能

- [ ] 未確認ユーザーに「確認済みにする」ボタンを表示
- [ ] タップ → Firestore `users/{uid}.reviewedByAdmin` を `true` に更新
- [ ] 管理者ログ記録
  ```typescript
  await addDoc(collection(db, "admin_logs"), {
    action: "REVIEW_USER",
    targetEmail: user.email,
    performedBy: ADMIN_EMAIL,
    performedAt: serverTimestamp(),
  });
  ```

### 14.5 ブロック機能

- [ ] ユーザー一覧の各行に「ブロック」ボタン
- [ ] ブロック確認ダイアログ
  - 「{displayName}（{email}）をブロックしますか？」
  - ブロック理由の入力欄（任意）
- [ ] ブロック処理
  ```typescript
  // blocked_users コレクションにドキュメント追加
  await setDoc(doc(db, "blocked_users", user.email), {
    email: user.email,
    blockedAt: serverTimestamp(),
    blockedBy: ADMIN_EMAIL,
    reason: reason || "",
  });
  ```
- [ ] 管理者ログ記録（`action: "BLOCK_USER"`）

### 14.6 ブロック解除機能

- [ ] ブロック中ユーザーに「ブロック解除」ボタン
- [ ] 解除確認ダイアログ
- [ ] 解除処理
  ```typescript
  await deleteDoc(doc(db, "blocked_users", user.email));
  ```
- [ ] 管理者ログ記録（`action: "UNBLOCK_USER"`）

### 14.7 撮影記録一覧画面（src/pages/admin/AdminRecords.tsx）

- [ ] 画面レイアウト
  - フィルタ: ユーザー選択ドロップダウン、日付範囲
  - 記録リスト（テーブル形式）
    - ユーザー名
    - 花の名前
    - 判定信頼度
    - 撮影日時
    - 位置情報有無
  - ※ 画像は端末保存のため表示不可（テキスト情報のみ）
- [ ] データ取得
  ```typescript
  // 全レコードを取得（管理者権限）
  const q = query(collection(db, "records"), orderBy("capturedAt", "desc"), limit(100));
  ```
- [ ] ページネーション: 100件ずつ表示、「もっとみる」ボタン

### 14.8 管理者画面のスタイリング

- [ ] 管理者画面は通常画面と異なるシンプルなデザイン
  - 背景色: 白
  - フォントサイズ: 通常サイズ（14px〜16px）
  - BottomNav は非表示
  - 代わりにサイドバー or 上部タブナビゲーション
- [ ] レスポンシブ: PC/タブレットでの閲覧を想定（テーブル表示）

### 14.9 管理者画面のルーティング

- [ ] `/admin` → AdminDashboard
- [ ] `/admin/users` → AdminUsers
- [ ] `/admin/records` → AdminRecords
- [ ] すべて `AdminGuard` で保護（管理者メール以外はアクセス不可）
- [ ] 「アプリに戻る」リンク → `/`

---

## 完了条件

- 管理者メールでのみ `/admin` にアクセスできる
- ダッシュボードに未確認ユーザー数・API使用量・撮影数が表示される
- ユーザー一覧で新規ユーザーの確認ができる
- ユーザーのブロック・ブロック解除ができる
- 撮影記録一覧がテキスト情報で閲覧できる
- 全操作が admin_logs に記録される
- 管理者以外がアクセスすると `/` にリダイレクトされる
