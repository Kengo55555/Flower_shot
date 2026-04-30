# 03. 認証フロー

依存関係: 02（Firebase設定）

---

## 概要

Googleアカウントによるログイン/ログアウト、ブロックチェック、新規ユーザー登録、認証ガードを実装する。

---

## 実装タスク

### 3.1 認証ロジック（src/lib/auth.ts）

- [ ] `signInWithGoogle()` 関数を実装
  - `signInWithPopup(auth, new GoogleAuthProvider())` を使用
  - iOS Safari で popup がブロックされる場合に備え、`signInWithRedirect` へのフォールバックを検討
- [ ] `signOutUser()` 関数を実装
  - `signOut(auth)` を呼び出し
- [ ] `checkBlocked(email: string): Promise<boolean>` 関数を実装
  - Firestore `blocked_users/{email}` の存在チェック
  - 存在すれば `true`（ブロック済み）
- [ ] `registerOrUpdateUser(user: FirebaseUser): Promise<void>` 関数を実装
  - Firestore `users/{uid}` の存在チェック
  - 存在しない場合: ドキュメント作成
    ```typescript
    {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      firstLoginAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      reviewedByAdmin: false,
      settings: { locationDefaultOn: true }
    }
    ```
  - 存在する場合: `lastLoginAt` のみ更新

### 3.2 AuthContext（src/hooks/useAuth.ts）

- [ ] `AuthContext` を作成
  ```typescript
  interface AuthState {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isBlocked: boolean;
    isAdmin: boolean;
  }
  ```
- [ ] `AuthProvider` コンポーネントを実装
  - `onAuthStateChanged` でログイン状態を監視
  - ログイン検出時に `checkBlocked()` → `registerOrUpdateUser()` を実行
  - `isAdmin` は `user.email === ADMIN_EMAIL` で判定
- [ ] `useAuth()` フックを実装（Context の値を返す）

### 3.3 ログイン画面（src/pages/LoginPage.tsx）

- [ ] 画面レイアウト
  - アプリロゴ（プレースホルダー画像）
  - アプリ名「Flower Shot」（大きな文字）
  - キャッチコピー「おはなの なまえを しらべよう！」
  - 「Googleで ログイン」ボタン（大きめ、48px以上の高さ）
- [ ] ボタンタップ時の処理
  1. `signInWithGoogle()` 呼び出し
  2. 成功 → `checkBlocked()` → ブロック済みならブロック画面表示
  3. 未ブロック → `registerOrUpdateUser()` → ホームへ遷移
- [ ] ログイン中のローディング表示
- [ ] エラー時のメッセージ表示（「ログインできませんでした。もういちど ためしてね」）

### 3.4 ブロック画面

- [ ] ブロック検出時に表示する画面を `LoginPage.tsx` 内に実装
  - メッセージ: 「ごりようを ていししました。おといあわせは こちらまで」
  - 管理者メールアドレスを表示
  - ログアウトボタン

### 3.5 認証ガードコンポーネント

- [ ] `src/components/common/AuthGuard.tsx` 作成
  ```typescript
  // ログイン済みか確認し、未ログインなら /login にリダイレクト
  // ブロック済みならブロック画面を表示
  // ローディング中はスピナー表示
  ```
- [ ] `src/components/common/AdminGuard.tsx` 作成
  ```typescript
  // isAdmin === true なら children を表示
  // false なら / にリダイレクト
  ```
- [ ] `App.tsx` のルート定義で各ガードを適用
  - `/login`, `/tutorial` → ガードなし
  - `/`, `/camera`, `/result`, `/collection`, `/map`, `/settings`, `/detail/:id` → `AuthGuard`
  - `/admin/*` → `AuthGuard` + `AdminGuard`

### 3.6 ログアウト処理

- [ ] 設定画面のログアウトボタンから `signOutUser()` を呼び出し
- [ ] ログアウト後は `/login` にリダイレクト
- [ ] AuthContext の状態をクリア

---

## 完了条件

- Googleログインでログインできる
- 初回ログイン時に Firestore `users/{uid}` が作成される
- 2回目以降は `lastLoginAt` のみ更新される
- ブロックリストに登録されたメールアドレスでログインするとブロック画面が表示される
- 未ログイン状態で `/` にアクセスすると `/login` にリダイレクトされる
- 管理者以外が `/admin` にアクセスすると `/` にリダイレクトされる
- ログアウト後に `/login` に遷移する
