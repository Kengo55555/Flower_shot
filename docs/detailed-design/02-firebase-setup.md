# 02. Firebase設定

依存関係: 01（プロジェクト初期化）

---

## 概要

Firebaseプロジェクトを作成し、Authentication（Google SSO）とFirestoreを初期化する。セキュリティルールを設定する。

---

## 実装タスク

### 2.1 Firebaseプロジェクト作成

- [ ] Firebase Console でプロジェクト「flower-shot」を作成（Sparkプラン）
- [ ] ウェブアプリを追加し、Firebase設定値を取得
- [ ] `.env.local` に設定値を記入

### 2.2 Firebase SDK導入

- [ ] `npm install firebase` でSDKインストール
- [ ] `src/lib/firebase.ts` 作成
  ```typescript
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFirestore } from "firebase/firestore";

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  ```
- [ ] `src/lib/firebase.ts` の動作確認（コンソールにエラーが出ないこと）

### 2.3 Firebase Authentication設定

- [ ] Firebase Console > Authentication > Sign-in method で「Google」を有効化
- [ ] 承認済みドメインにlocalhost と Firebase Hostingドメインを追加
- [ ] 動作確認: Googleログインのポップアップが表示されること（この時点では仮確認）

### 2.4 Firestore 有効化

- [ ] Firebase Console > Firestore Database > データベースを作成
- [ ] リージョン: `asia-northeast1`（東京）を選択
- [ ] テストモードで開始（後でルールを適用）

### 2.5 Firestoreセキュリティルール

- [ ] Firebase Console > Firestore > ルール に以下を設定
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {

      // ユーザー情報
      match /users/{uid} {
        allow read: if request.auth.uid == uid
                    || request.auth.token.email == "nomurakengo@gmail.com";
        allow create: if request.auth.uid == uid;
        allow update: if request.auth.uid == uid
                      || request.auth.token.email == "nomurakengo@gmail.com";
      }

      // ブロックリスト
      match /blocked_users/{email} {
        allow read: if request.auth.token.email == email
                    || request.auth.token.email == "nomurakengo@gmail.com";
        allow write: if request.auth.token.email == "nomurakengo@gmail.com";
      }

      // 撮影記録
      match /records/{recordId} {
        allow read: if request.auth.uid == resource.data.userId
                    || request.auth.token.email == "nomurakengo@gmail.com";
        allow create: if request.auth.uid == request.resource.data.userId;
        allow update, delete: if request.auth.uid == resource.data.userId;
      }

      // API利用回数
      match /apiUsage/{docId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow update: if request.auth != null;
      }

      // 管理者操作ログ
      match /admin_logs/{logId} {
        allow read, write: if request.auth.token.email == "nomurakengo@gmail.com";
      }
    }
  }
  ```
- [ ] ルールのデプロイ・公開

### 2.6 Firebase Hosting 初期設定

- [ ] `npm install -g firebase-tools` でCLIインストール（未インストールの場合）
- [ ] `firebase login` でログイン
- [ ] `firebase init hosting` でHosting初期化（public: `dist`, SPA: Yes）
- [ ] `firebase.json` の設定確認
- [ ] テストデプロイ: `npm run build && firebase deploy --only hosting`
- [ ] デプロイ先URLにアクセスして表示確認

### 2.7 Firebase Hosting リライトルール（Pl@ntNet APIプロキシ）

- [ ] `firebase.json` に以下のリライトルールを追加検討（APIキー保護用）
  ```json
  {
    "hosting": {
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    }
  }
  ```
  ※ Cloud Functions不可のため、リライトによるプロキシは将来課題として記録のみ

---

## 完了条件

- Firebase Console でプロジェクトが作成されている
- `src/lib/firebase.ts` からAuth, Firestoreインスタンスがエクスポートされる
- アプリ起動時にFirebase初期化エラーが出ない
- Firestoreセキュリティルールが適用されている
- Firebase Hosting にデプロイでき、URLでアクセスできる
