# 03. 認証フロー

依存関係: 02（Firebase設定）

---

## 概要

Googleアカウントによるログイン/ログアウト、ホワイトリストチェック、ブロックチェック、新規ユーザー登録、認証ガードを実装する。

**v3.0変更点**: メールアドレスホワイトリスト方式（招待制）に変更。認証フローに`allowed_emails`チェックを追加。AuthGuardに未許可ユーザー画面を追加。useAuthに`isNotAllowed`状態を追加。

---

## 実装タスク

### 3.1 認証ロジック（src/lib/auth.ts）

- [x] `signInWithGoogle()` 関数を実装（signInWithPopup使用）
- [x] `signOutUser()` 関数を実装
- [x] `checkBlocked(email: string): Promise<boolean>` 関数を実装
- [x] `checkAllowed(email: string): Promise<boolean>` 関数を実装（管理者メールは常にtrue）
- [x] `getAllowedEmails(): Promise<string[]>` 関数を実装
- [x] `addAllowedEmail(email: string): Promise<void>` 関数を実装（addedAt, addedBy付き）
- [x] `removeAllowedEmail(email: string): Promise<void>` 関数を実装
- [x] `registerOrUpdateUser(user: FirebaseUser): Promise<void>` 関数を実装

### 3.2 AuthContext（src/hooks/useAuth.tsx）

- [x] `AuthContext` を作成（user, isLoading, isBlocked, isNotAllowed, isAdmin等を管理）
- [x] `AuthProvider` コンポーネントを実装（onAuthStateChangedで監視）
- [x] 認証フローの3段階チェック:
  1. `checkAllowed()` でホワイトリストチェック → 未許可なら `isNotAllowed = true`
  2. `checkBlocked()` でブロックチェック → ブロック済みなら `isBlocked = true`
  3. `registerOrUpdateUser()` でユーザー登録/更新
- [x] `useAuth()` フックを実装

### 3.3 ログイン画面（src/pages/LoginPage.tsx）

- [x] 画面レイアウト（アプリ名 + キャッチコピー + Googleログインボタン）
- [x] ログインフロー実装（signIn → ホワイトリストチェック → ブロックチェック → ユーザー登録/更新 → ホームへ遷移）
- [x] ログイン中のローディング表示
- [x] エラー時のメッセージ表示

### 3.4 未許可ユーザー画面（AuthGuard内）

- [x] ホワイトリスト未登録時に表示する画面を実装
- [x] 「このアプリは しょうたいせいです」メッセージ
- [x] 「りようするには かんりしゃに メールアドレスの とうろくを おねがいしてね」案内
- [x] ログインに使用したメールアドレスを表示
- [x] ログアウトボタン付き

### 3.5 ブロック画面（AuthGuard内）

- [x] ブロック検出時に表示する画面を実装
- [x] 「ごりようを ていししました」メッセージ
- [x] 問い合わせ先メールアドレスを表示

### 3.6 認証ガードコンポーネント

- [x] `src/components/common/AuthGuard.tsx` 作成（3段階チェック: isNotAllowed → isBlocked → 未ログイン）
- [x] `src/components/common/AdminGuard.tsx` 作成（管理者以外は/へリダイレクト）
- [x] `App.tsx` のルート定義で各ガードを適用

### 3.7 ログアウト処理

- [x] 設定画面のログアウトボタンから `signOutUser()` を呼び出し
- [x] ログアウト後は `/login` にリダイレクト
- [x] 確認ダイアログ付き

### 3.8 Firestoreセキュリティルール

- [x] `allowed_emails/{email}` コレクションのルール定義
  - 読み取り: 自分のメールアドレス or 管理者
  - 書き込み: 管理者のみ

---

## 完了条件

- [x] Googleログインでログインできる
- [x] ホワイトリストに未登録のメールアドレスでログインすると「しょうたいせいです」画面が表示される
- [x] 管理者メールアドレスはホワイトリストチェックをバイパスする
- [x] 初回ログイン時に Firestore `users/{uid}` が作成される
- [x] 2回目以降は `lastLoginAt` のみ更新される
- [x] ブロックリストに登録されたメールアドレスでログインするとブロック画面が表示される
- [x] 未ログイン状態で `/` にアクセスすると `/login` にリダイレクトされる
- [x] 管理者以外が `/admin` にアクセスすると `/` にリダイレクトされる
- [x] ログアウト後に `/login` に遷移する
