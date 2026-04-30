# 02. Firebase設定

依存関係: 01（プロジェクト初期化）

---

## 概要

Firebaseプロジェクトを作成し、Authentication（Google SSO）とFirestoreを初期化する。セキュリティルールを設定する。ホスティングはCloudflare Pagesを使用するため、Firebase Hostingは不使用。

---

## 実装タスク

### 2.1 Firebaseプロジェクト作成

- [x] Firebase Console でプロジェクト作成
- [x] ウェブアプリを追加し、Firebase設定値を取得
- [x] `.env.local` に設定値を記入

### 2.2 Firebase SDK導入

- [x] `npm install firebase` でSDKインストール
- [x] `src/lib/firebase.ts` 作成
  ```typescript
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";

  const firebaseConfig = { /* env vars */ };
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  ```
- [x] 動作確認

### 2.3 Firebase Authentication設定

- [x] Firebase Console > Authentication > Sign-in method で「Google」を有効化
- [x] 承認済みドメインにlocalhost と Cloudflare Pagesドメインを追加
- [x] 動作確認

### 2.4 Firestore 有効化

- [x] Firebase Console > Firestore Database > データベースを作成
- [x] リージョン: `asia-northeast1`（東京）を選択

### 2.5 Firestoreセキュリティルール

- [x] セキュリティルールを設定・デプロイ
  - users: 本人 or 管理者が読み書き
  - blocked_users: 管理者のみ書き込み
  - records: 本人が読み書き、管理者は読み取りのみ
  - apiUsage: 認証済みユーザーが読み書き
  - admin_logs: 管理者のみ

### 2.6 Cloudflare Pages デプロイ設定（Firebase Hostingの代わり）

- [x] Cloudflare Pages でプロジェクトを作成
- [x] ビルド設定: `npm run build`, 出力: `dist`
- [x] `functions/api/plantnet/[[path]].js` でPl@ntNet APIプロキシを設定
- [x] デプロイ確認

---

## 完了条件

- [x] Firebase Console でプロジェクトが作成されている
- [x] `src/lib/firebase.ts` からAuth, Firestoreインスタンスがエクスポートされる
- [x] アプリ起動時にFirebase初期化エラーが出ない
- [x] Firestoreセキュリティルールが適用されている
- [x] Cloudflare Pages にデプロイでき、URLでアクセスできる
