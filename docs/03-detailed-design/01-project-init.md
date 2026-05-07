# 01. プロジェクト初期化

依存関係: なし

---

## 概要

Vite + React + TypeScript + Tailwind CSS のプロジェクトを作成し、PWA対応の基盤を構築する。

---

## 実装タスク

### 1.1 Vite プロジェクト作成

- [x] `npm create vite@latest . -- --template react-ts` でプロジェクト生成
- [x] `npm install` で依存パッケージインストール
- [x] `npm run dev` で起動確認

### 1.2 Tailwind CSS 導入

- [x] `npm install -D tailwindcss @tailwindcss/vite` でインストール
- [x] `src/styles/index.css` に Tailwind directives を記述
  ```css
  @import "tailwindcss";
  ```
- [x] `vite.config.ts` にTailwind Viteプラグインを追加
- [x] `src/main.tsx` で `styles/index.css` をインポート
- [x] 動作確認: Tailwindクラスが適用されること

### 1.3 React Router 導入

- [x] `npm install react-router-dom` でインストール
- [x] `src/App.tsx` に `BrowserRouter` + `Routes` の基本構成を記述
- [x] ルート定義（`/`, `/login`, `/camera`, `/result`, `/collection`, `/map`, `/settings`, `/tutorial`, `/detail/:recordId`, `/admin`, `/admin/users`, `/admin/records`）

### 1.4 ディレクトリ構成作成

- [x] `src/pages/` ディレクトリ作成、各ページコンポーネントを配置
  - `HomePage.tsx`, `LoginPage.tsx`, `CameraPage.tsx`, `ResultPage.tsx`, `DetailPage.tsx`, `CollectionPage.tsx`, `MapPage.tsx`, `SettingsPage.tsx`, `TutorialPage.tsx`
- [x] `src/pages/admin/` ディレクトリ作成
  - `AdminDashboard.tsx`, `AdminUsers.tsx`, `AdminRecords.tsx`
- [x] `src/components/common/` ディレクトリ作成
- [x] `src/lib/` ディレクトリ作成
- [x] `src/hooks/` ディレクトリ作成
- [x] `src/types/index.ts` 作成
- [x] `src/constants/index.ts` 作成

### 1.5 定数ファイル初期設定

- [x] `src/constants/index.ts` に以下を定義
  ```typescript
  export const ADMIN_EMAIL = "nomurakengo@gmail.com";
  export const DAILY_USER_LIMIT = 100;       // v2.0: 30→100に変更
  export const DAILY_GLOBAL_LIMIT = 500;
  export const PLANTNET_CONFIDENCE_THRESHOLD = 0.5;
  export const MAX_CANDIDATES = 3;
  export const INDEXEDDB_NAME = "flower_shot_db";
  export const INDEXEDDB_VERSION = 1;
  export const INDEXEDDB_STORE_NAME = "images";
  export const STORAGE_WARNING_THRESHOLD_MB = 800;
  ```
- [x] バッジ定義（BADGES配列）も同ファイルに定義

### 1.6 型定義ファイル初期設定

- [x] `src/types/index.ts` に主要な型を定義
  - User, FlowerRecord, Candidate（nameOriginalフィールド含む）, GeoLocation, ApiUsage, Badge, WikipediaResult

### 1.7 PWA 基盤設定

- [x] `public/manifest.json` 作成
- [x] `index.html` の `<head>` に manifest リンクと meta タグを追加
- [x] `public/icons/` にアイコン配置

### 1.8 共通レイアウト

- [x] `src/components/common/Header.tsx` 作成（戻るボタン付きヘッダー）
- [x] `src/components/common/BottomNav.tsx` 作成（4タブ: ホーム/ずかん/ちず/せってい）
- [x] AppLayout コンポーネント作成（children + BottomNav の共通枠、App.tsx内で定義）

### 1.9 環境変数テンプレート

- [x] `.env.local` を `.gitignore` に追加
- [x] `.env.example` を作成

### 1.10 グローバルCSS

- [x] `src/styles/index.css` にアプリ全体の基本スタイルを定義
  - 背景色はテーマ機能で動的に変更（デフォルト: `#FFF44F`レモン）
  - セーフエリア対応

---

## 完了条件

- [x] `npm run dev` でエラーなく起動する
- [x] 全ルートにアクセスでき、各ページが表示される
- [x] Tailwind CSS のクラスが適用される
- [x] BottomNav でタブ切り替えができる
- [x] PWAマニフェストが正しく読み込まれる
