# 01. プロジェクト初期化

依存関係: なし

---

## 概要

Vite + React + TypeScript + Tailwind CSS のプロジェクトを作成し、PWA対応の基盤を構築する。

---

## 実装タスク

### 1.1 Vite プロジェクト作成

- [ ] `npm create vite@latest . -- --template react-ts` でプロジェクト生成
- [ ] `npm install` で依存パッケージインストール
- [ ] `npm run dev` で起動確認

### 1.2 Tailwind CSS 導入

- [ ] `npm install -D tailwindcss @tailwindcss/vite` でインストール
- [ ] `src/styles/index.css` に Tailwind directives を記述
  ```css
  @import "tailwindcss";
  ```
- [ ] `vite.config.ts` にTailwind Viteプラグインを追加
- [ ] `src/main.tsx` で `styles/index.css` をインポート
- [ ] 動作確認: Tailwindクラスが適用されること

### 1.3 React Router 導入

- [ ] `npm install react-router-dom` でインストール
- [ ] `src/App.tsx` に `BrowserRouter` + `Routes` の基本構成を記述
- [ ] 仮のルート定義（`/`, `/login`, `/camera`, `/result`, `/collection`, `/map`, `/settings`, `/tutorial`, `/detail/:recordId`, `/admin`, `/admin/users`, `/admin/records`）

### 1.4 ディレクトリ構成作成

- [ ] `src/pages/` ディレクトリ作成、各ページの空コンポーネントを配置
  - `HomePage.tsx`, `LoginPage.tsx`, `CameraPage.tsx`, `ResultPage.tsx`, `DetailPage.tsx`, `CollectionPage.tsx`, `MapPage.tsx`, `SettingsPage.tsx`, `TutorialPage.tsx`
- [ ] `src/pages/admin/` ディレクトリ作成
  - `AdminDashboard.tsx`, `AdminUsers.tsx`, `AdminRecords.tsx`
- [ ] `src/components/common/` ディレクトリ作成
- [ ] `src/lib/` ディレクトリ作成
- [ ] `src/hooks/` ディレクトリ作成
- [ ] `src/types/index.ts` 作成（空ファイル）
- [ ] `src/constants/index.ts` 作成（定数の初期定義）

### 1.5 定数ファイル初期設定

- [ ] `src/constants/index.ts` に以下を定義
  ```typescript
  export const ADMIN_EMAIL = "nomurakengo@gmail.com";
  export const DAILY_USER_LIMIT = 30;
  export const DAILY_GLOBAL_LIMIT = 500;
  export const PLANTNET_CONFIDENCE_THRESHOLD = 0.5;
  export const MAX_CANDIDATES = 3;
  export const INDEXEDDB_NAME = "flower_shot_db";
  export const INDEXEDDB_VERSION = 1;
  export const INDEXEDDB_STORE_NAME = "images";
  export const STORAGE_WARNING_THRESHOLD_MB = 800;
  ```

### 1.6 型定義ファイル初期設定

- [ ] `src/types/index.ts` に主要な型を定義
  ```typescript
  export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    firstLoginAt: Date;
    lastLoginAt: Date;
    reviewedByAdmin: boolean;
    settings: {
      locationDefaultOn: boolean;
    };
  }

  export interface FlowerRecord {
    id: string;
    userId: string;
    photoLocalKey: string;
    flowerName: string;
    flowerNameOriginal: string;
    candidates: Candidate[];
    confidence: number;
    capturedAt: Date;
    location: GeoLocation | null;
    isLocationRecorded: boolean;
  }

  export interface Candidate {
    name: string;
    confidence: number;
  }

  export interface GeoLocation {
    latitude: number;
    longitude: number;
  }

  export interface ApiUsage {
    userId: string;
    date: string;
    count: number;
  }
  ```

### 1.7 PWA 基盤設定

- [ ] `public/manifest.json` 作成
  ```json
  {
    "name": "Flower Shot",
    "short_name": "FlowerShot",
    "start_url": "/",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#FFF8E7",
    "theme_color": "#FF9CAD",
    "icons": [
      { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
  }
  ```
- [ ] `index.html` の `<head>` に manifest リンクと meta タグを追加
  ```html
  <link rel="manifest" href="/manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Flower Shot" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
  <meta name="theme-color" content="#FF9CAD" />
  ```
- [ ] `public/icons/` にプレースホルダーアイコン配置（192x192, 512x512）
- [ ] `vite-plugin-pwa` の導入を検討し、Service Worker を設定

### 1.8 共通レイアウト

- [ ] `src/components/common/Header.tsx` 作成（アプリ名表示）
- [ ] `src/components/common/BottomNav.tsx` 作成（4タブ: ホーム/ずかん/ちず/せってい）
- [ ] `src/components/common/RubyText.tsx` 作成（ふりがな付きテキスト）
  ```typescript
  // 使用例: <RubyText text="花" ruby="はな" />
  // 出力: <ruby>花<rp>(</rp><rt>はな</rt><rp>)</rp></ruby>
  ```
- [ ] レイアウトコンポーネント作成（Header + children + BottomNav の共通枠）

### 1.9 環境変数テンプレート

- [ ] `.env.local` を `.gitignore` に追加（既存の`.gitignore`に追記）
- [ ] `.env.example` を作成（値なしのテンプレート）
  ```
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=
  VITE_PLANTNET_API_KEY=
  ```

### 1.10 グローバルCSS

- [ ] `src/styles/index.css` にアプリ全体の基本スタイルを定義
  - 背景色: `#FFF8E7`（クリーム系）
  - フォントサイズ: `18px` ベース
  - フォントファミリー: system-ui（iOS標準フォント）
  - セーフエリア対応（`env(safe-area-inset-bottom)` 等）

---

## 完了条件

- `npm run dev` でエラーなく起動する
- 全ルートにアクセスでき、各ページ名が表示される
- Tailwind CSS のクラスが適用される
- BottomNav でタブ切り替えができる
- PWAマニフェストが正しく読み込まれる（DevTools > Application で確認）
