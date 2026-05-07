# 03. 認証フロー

依存関係: 02（Firebase設定）

---

## 概要

Googleアカウントによるログイン/ログアウト、ブロックチェック、新規ユーザー登録、認証ガードを実装する。

---

## 実装タスク

### 3.1 認証ロジック（src/lib/auth.ts）

- [x] `signInWithGoogle()` 関数を実装（signInWithPopup使用）
- [x] `signOutUser()` 関数を実装
- [x] `checkBlocked(email: string): Promise<boolean>` 関数を実装
- [x] `registerOrUpdateUser(user: FirebaseUser): Promise<void>` 関数を実装

### 3.2 AuthContext（src/hooks/useAuth.tsx）

- [x] `AuthContext` を作成（user, isLoading, isBlocked等を管理）
- [x] `AuthProvider` コンポーネントを実装（onAuthStateChangedで監視）
- [x] `useAuth()` フックを実装

### 3.3 ログイン画面（src/pages/LoginPage.tsx）

- [x] 画面レイアウト（アプリ名 + キャッチコピー + Googleログインボタン）
- [x] ログインフロー実装（signIn → ブロックチェック → ユーザー登録/更新 → ホームへ遷移）
- [x] ログイン中のローディング表示
- [x] エラー時のメッセージ表示

### 3.4 ブロック画面

- [x] ブロック検出時に表示する画面を実装
- [x] ログアウトボタン付き

### 3.5 認証ガードコンポーネント

- [x] `src/components/common/AuthGuard.tsx` 作成（未ログインは/loginへリダイレクト）
- [x] `src/components/common/AdminGuard.tsx` 作成（管理者以外は/へリダイレクト）
- [x] `App.tsx` のルート定義で各ガードを適用

### 3.6 ログアウト処理

- [x] 設定画面のログアウトボタンから `signOutUser()` を呼び出し
- [x] ログアウト後は `/login` にリダイレクト
- [x] 確認ダイアログ付き

---

## 完了条件

- [x] Googleログインでログインできる
- [x] 初回ログイン時に Firestore `users/{uid}` が作成される
- [x] 2回目以降は `lastLoginAt` のみ更新される
- [x] ブロックリストに登録されたメールアドレスでログインするとブロック画面が表示される
- [x] 未ログイン状態で `/` にアクセスすると `/login` にリダイレクトされる
- [x] 管理者以外が `/admin` にアクセスすると `/` にリダイレクトされる
- [x] ログアウト後に `/login` に遷移する
