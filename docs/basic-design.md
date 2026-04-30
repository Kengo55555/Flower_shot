# Flower Shot 基本設計仕様書

最終更新日: 2026-05-01
要件定義書: `flower_shot_requirements.md` v2.0 に準拠

---

## 1. 技術スタック

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| フロントエンド | React 18 + TypeScript + Vite | PWA構成 |
| スタイリング | Tailwind CSS（@tailwindcss/vite プラグイン） | 子供向けの明るいカラフルなUI |
| ホスティング | Cloudflare Pages | 無制限帯域幅 |
| APIプロキシ | Cloudflare Pages Functions | Pl@ntNet API への転送 |
| 認証 | Firebase Authentication | Google SSO |
| データベース | Cloud Firestore | テキストデータのみ |
| 画像保存 | 端末内 IndexedDB | サーバーには保存しない |
| 花の判定AI | Pl@ntNet API（/api/plantnet 経由） | 1日500リクエスト/組織、1ユーザー100回/日 |
| 詳細情報 | Wikipedia API | 完全無料 |
| 地図 | Leaflet + react-leaflet + OpenStreetMap | APIキー不要 |
| PDF生成 | jsPDF | クライアントサイドでPDF生成 |
| テーマ管理 | React Context + localStorage | bgColor, buttonColor, emoji |

### 重要な設計方針
- Pl@ntNet APIはクライアントから直接呼ばず、同一ドメインの `/api/plantnet` 経由でアクセス
  - 開発時: Vite の `server.proxy` で `https://my-api.plantnet.org` へ転送
  - 本番時: Cloudflare Pages Functions（`functions/api/plantnet/[[path]].js`）で転送
- APIキーはクライアント側の環境変数 `VITE_PLANTNET_API_KEY` に保持し、URLクエリパラメータとして付与
- テーマ設定は localStorage に保存し、ThemeProvider で全画面に反映
- 花の判定後に場所選択ステップを挟むフロー（GPS or 地図タップ）

---

## 2. ディレクトリ構成

```
src/
|-- main.tsx                    # エントリポイント
|-- App.tsx                     # ルーティング定義（BrowserRouter + ThemeProvider + AuthProvider + CaptureProvider）
|-- vite-env.d.ts
|
|-- pages/                      # 画面コンポーネント（1画面1ファイル）
|   |-- HomePage.tsx            # ホーム画面（今月のサマリー + 撮影ボタン + 安全注意喚起モーダル）
|   |-- CameraPage.tsx          # カメラ撮影 → プレビュー → 判定へ
|   |-- ResultPage.tsx          # 判定結果 → 場所選択 → 保存 → 完了（5ステップ一体型）
|   |-- DetailPage.tsx          # 花の詳細情報（Wikipedia）
|   |-- CollectionPage.tsx      # 図鑑一覧 + PDFアルバム出力
|   |-- MapPage.tsx             # マップ画面（年フィルタ付き）
|   |-- SettingsPage.tsx        # 設定画面（漢字表記・大人向け）
|   |-- LoginPage.tsx           # ログイン画面
|   |-- TutorialPage.tsx        # PWAインストールチュートリアル
|   +-- admin/
|       |-- AdminDashboard.tsx  # 管理者ダッシュボード（ユーザー一覧統合）
|       |-- AdminUsers.tsx      # ユーザー一覧
|       +-- AdminRecords.tsx    # 撮影記録一覧
|
|-- components/                 # 再利用可能なUIコンポーネント
|   |-- common/
|   |   |-- Header.tsx          # 画面上部ヘッダー（戻るボタン付き）
|   |   |-- BottomNav.tsx       # 画面下部ナビゲーション（4タブ）
|   |   |-- Loading.tsx         # ローディングアニメーション
|   |   |-- AuthGuard.tsx       # 認証ガード
|   |   +-- AdminGuard.tsx      # 管理者ガード
|   |-- camera/
|   |   +-- CaptureButton.tsx   # 撮影ボタン（<input capture> ラップ）
|   |-- result/
|   |   |-- ResultCard.tsx      # 判定結果カード
|   |   +-- CandidateList.tsx   # 候補リスト表示
|   |-- collection/
|   |   +-- FlowerCard.tsx      # 図鑑カード
|   |-- map/
|   |   |-- FlowerMap.tsx       # Leafletマップ（ピン表示・ポップアップ）
|   |   +-- LocationPicker.tsx  # 場所選択地図（フルスクリーン）
|   +-- gamification/
|       |-- MonthlySummary.tsx  # 月間サマリー
|       +-- BadgeDisplay.tsx    # バッジ表示
|
|-- lib/                        # ビジネスロジック・外部API
|   |-- firebase.ts             # Firebase初期化（Auth + Firestore）
|   |-- auth.ts                 # 認証ロジック（ログイン/ログアウト/ブロックチェック）
|   |-- plantnet.ts             # Pl@ntNet API呼び出し（/api/plantnet 経由）
|   |-- wikipedia.ts            # Wikipedia API呼び出し
|   |-- firestore.ts            # Firestoreの読み書き（records, users, apiUsage）
|   |-- indexeddb.ts            # IndexedDB操作（画像の保存/取得/削除）
|   |-- geolocation.ts          # 位置情報取得（getCurrentPosition）
|   |-- usage-limit.ts          # API利用回数チェック・更新
|   |-- image-utils.ts          # 画像圧縮（canvas リサイズ）
|   +-- album.ts                # PDFアルバム生成（jsPDF）
|
|-- hooks/                      # カスタムフック
|   |-- useAuth.tsx             # 認証状態管理（AuthProvider + useAuth）
|   |-- useCapture.tsx          # 撮影データ管理（CaptureProvider + useCapture）
|   |-- useRecords.ts           # 撮影記録のCRUD
|   |-- useUsageLimit.ts        # 残り回数の取得・表示
|   |-- usePwaInstall.ts        # PWAインストール状態検出
|   +-- useTheme.tsx            # テーマ管理（ThemeProvider + useTheme）
|
|-- types/                      # 型定義
|   +-- index.ts                # User, FlowerRecord, Candidate, GeoLocation, ApiUsage, Badge, WikipediaResult
|
|-- constants/                  # 定数
|   +-- index.ts                # ADMIN_EMAIL, DAILY_USER_LIMIT(100), DAILY_GLOBAL_LIMIT(500), バッジ定義等
|
+-- styles/                     # グローバルスタイル
    +-- index.css               # Tailwind directives + カスタムCSS

functions/
+-- api/
    +-- plantnet/
        +-- [[path]].js         # Cloudflare Pages Functions: Pl@ntNet APIプロキシ

public/
|-- manifest.json               # PWA マニフェスト
|-- icons/                      # アプリアイコン各サイズ
+-- index.html
```

---

## 3. 画面設計

### 3.1 画面遷移フロー

```
[初回起動] → [TutorialPage] → [LoginPage] → [HomePage]

[HomePage]
  |-- 撮影ボタン（CaptureButton） → [CameraPage] → [ResultPage]
  |                                                     |-- Step1: 判定中
  |                                                     |-- Step2: 結果表示
  |                                                     |-- Step3: 場所選択（GPS or LocationPicker）
  |                                                     |-- Step4: 保存中
  |                                                     +-- Step5: 完了 → [DetailPage]
  |-- 図鑑タブ → [CollectionPage] → [DetailPage]
  |-- マップタブ → [MapPage]
  +-- 設定タブ → [SettingsPage]
                    +-- 管理者セクション → [AdminDashboard] → [AdminUsers] / [AdminRecords]
```

### 3.2 各画面の責務

| 画面 | 主な責務 | ルート |
|------|---------|--------|
| TutorialPage | PWAインストール手順を案内 | `/tutorial` |
| LoginPage | Googleログインボタン。ブロックチェック後にリダイレクト | `/login` |
| HomePage | 今月のサマリー・バッジ・残り判定回数を表示。中央に大きな撮影ボタン。初回のみ安全注意喚起モーダル | `/` |
| CameraPage | `<input capture>` でカメラ起動。撮影プレビュー。「この しゃしんで しらべる」ボタンでResultPageへ | `/camera` |
| ResultPage | 判定→結果表示→場所選択→保存→完了の5ステップを1画面内で管理 | `/result` |
| DetailPage | Wikipedia要約をアプリ内表示。撮影画像・花名・日付・信頼度。削除機能 | `/detail/:recordId` |
| CollectionPage | 撮影済み花のグリッド表示。年フィルタ。PDFアルバム出力ボタン | `/collection` |
| MapPage | Leaflet地図にピン表示。年フィルタ。ポップアップに写真・花名・日付 | `/map` |
| SettingsPage | アカウント情報、テーマ（背景色・ボタン色・花アイコン）、位置情報設定、ストレージ情報、管理者リンク、ログアウト。**漢字表記** | `/settings` |
| AdminDashboard | ユーザー数・撮影数・API使用量。未確認ユーザーハイライト。ブロック/解除。設定画面に戻るボタン | `/admin` |
| AdminUsers | ユーザー一覧 | `/admin/users` |
| AdminRecords | 撮影記録一覧（テキスト情報のみ） | `/admin/records` |

---

## 4. コンポーネント設計方針

### 4.1 子供ファーストUI原則（操作画面）
- **文字サイズ**: 本文18px以上、見出し24px以上
- **ボタン**: 最小タップ領域 48x48px、撮影ボタンは80px以上
- **配色**: テーマカスタマイズ可能（デフォルト: レモン背景、ピンクボタン）
- **1画面1タスク**: 複雑なナビゲーションは作らない
- **文字よりアイコン優先**: ナビゲーション等はアイコン + ひらがなラベル

### 4.2 設定画面（大人向け）
- 漢字表記（「背景色」「ボタンの色」「位置情報」「ストレージ」「アカウント」等）
- セクション区切りのカード形式

### 4.3 BottomNav 構成
```
[ホーム] [ずかん] [ちず] [せってい]
```
- 撮影ボタンはホーム画面中央に大きく配置（BottomNavには含めない）
- CameraPage / ResultPage / DetailPage / Admin画面では BottomNav を非表示

### 4.4 レスポンシブ対応
- iPhone SE（375px幅）を最小対応幅とする
- iPad（768px幅以上）ではコンテンツ幅を最大480pxに制限し中央寄せ
- 横画面は非対応（portrait固定をmanifestで指定）

---

## 5. データフロー

### 5.1 撮影→判定→場所選択→保存フロー

```
1. [HomePage] ユーザーが撮影ボタン（CaptureButton）をタップ
   - image-utils.ts で画像を圧縮（最大幅1024px）
   - CaptureContext に imageFile, compressedBlob, imagePreviewUrl をセット
   → CameraPage へ遷移

2. [CameraPage] 撮影プレビューを表示
   - 「とりなおす」→ CaptureContext をクリアして再撮影
   - 「この しゃしんで しらべる」→ navigator.onLine チェック → ResultPage へ遷移

3. [ResultPage - Step1: identifying]
   - usage-limit.ts で残回数チェック（checkCanUse）
   - 上限到達 → メッセージ表示、API呼び出しなし
   - plantnet.ts → /api/plantnet/v2/identify/all に画像送信（POST multipart/form-data）
   - Loading コンポーネントでアニメーション表示
   - incrementUsage() でカウントインクリメント

4. [ResultPage - Step2: result]
   - found（score >= 0.5）: ResultCard で確定表示
   - candidates（score < 0.5）: CandidateList で候補表示（最大3件、タップ選択）
   - not_found: 「おはなが みつからなかったよ」
   - 「つぎへ → ばしょを きろくする」ボタン

5. [ResultPage - Step3: location]
   - 「いまの ばしょ」ボタン → geolocation.ts で GPS 取得
   - 「ちずで えらぶ」ボタン → LocationPicker を表示（フルスクリーン地図）
   - 「ばしょつきで ほぞんする」or「ばしょなしで ほぞんする」

6. [ResultPage - Step4: saving]
   - Firestore records コレクションに保存（recordId は事前にドキュメント参照で生成）
   - IndexedDB に画像Blob を保存（キーは recordId）
   - CaptureContext をクリア

7. [ResultPage - Step5: done]
   - 「もっと くわしく」→ /detail/{recordId}
   - 「ホームに もどる」→ /
```

### 5.2 状態管理

React Context で以下をグローバル管理（外部ライブラリ不使用）:

| Context | 管理する状態 | Provider位置 |
|---------|------------|-------------|
| `ThemeContext` | bgColor, buttonColor, emoji | App.tsx 最外層 |
| `AuthContext` | ログイン状態、ユーザー情報、ブロック状態 | App.tsx（ThemeProvider内） |
| `CaptureContext` | 撮影中の画像データ（File/Blob）、プレビューURL | App.tsx（AuthProvider内） |

---

## 6. 認証・認可フロー

### 6.1 ログインフロー

```
1. [LoginPage] 「Googleで ログイン」ボタンタップ
2. signInWithPopup(auth, googleProvider)
3. ログイン成功後:
   a. Firestore blocked_users/{email} を照合
      → 存在する場合: 「ご利用を停止しました」表示、ログアウト
   b. Firestore users/{uid} の存在チェック
      → 存在しない場合（新規ユーザー）:
         - ドキュメント作成: email, displayName, photoURL, firstLoginAt, reviewedByAdmin: false
      → 存在する場合:
         - lastLoginAt を更新
   c. AuthContext にユーザー情報をセット
4. HomePage へ遷移
```

### 6.2 管理者判定

```typescript
// constants/index.ts
export const ADMIN_EMAIL = "nomurakengo@gmail.com";

// 判定: user.email === ADMIN_EMAIL
```

- `/admin/*` ルートは `AuthGuard` + `AdminGuard` で二重保護
- AdminGuard は ADMIN_EMAIL 以外なら `/` にリダイレクト
- 設定画面では `user.email === ADMIN_EMAIL` の場合のみ「管理者」セクションを表示

### 6.3 認証ガード

```
未ログイン → /login にリダイレクト
ブロック済み → ブロック画面を表示
```

---

## 7. 外部API仕様

### 7.1 Pl@ntNet API

| 項目 | 内容 |
|------|------|
| 本来のエンドポイント | `https://my-api.plantnet.org/v2/identify/all` |
| アプリからのアクセス先 | `/api/plantnet/v2/identify/all` |
| メソッド | POST |
| Content-Type | multipart/form-data |
| パラメータ | `images`: 画像ファイル（"photo.jpg"）, `organs`: `"flower"` |
| クエリパラメータ | `api-key`, `lang=ja`, `type=kt`, `nb-results=5`, `include-related-images=false`, `no-reject=false` |
| レスポンス | `results[]`: `{ species: { scientificNameWithoutAuthor, commonNames }, score }` |
| プロキシ（開発） | Vite server.proxy で `https://my-api.plantnet.org` に転送 |
| プロキシ（本番） | Cloudflare Pages Functions `functions/api/plantnet/[[path]].js` |

#### レスポンス処理ロジック
```
score >= 0.5 → 確定表示（1件: found）
score < 0.5  → 上位3件を候補として表示（candidates）
results が空 → 「お花が見つからなかったよ」（not_found）
HTTP 404    → 空のresultsとして処理
```

#### 日本語名の抽出
- `commonNames` から日本語文字を含む名前を優先取得
- 該当なしの場合は `scientificNameWithoutAuthor` を使用

### 7.2 Wikipedia API

| 項目 | 内容 |
|------|------|
| エンドポイント | `https://ja.wikipedia.org/api/rest_v1/page/summary/{title}` |
| メソッド | GET |
| APIキー | 不要 |
| レスポンス | `{ title, extract, content_urls.desktop.page, thumbnail.source }` |

- 花の日本語名で検索、見つからなければ学名で再検索

---

## 8. Firestore設計

### 8.1 コレクション構成

要件定義書 Section 10 に準拠。

| コレクション | ドキュメントID | 用途 |
|-------------|--------------|------|
| `users` | `{uid}` | ユーザー基本情報 |
| `blocked_users` | `{email}` | ブロックリスト |
| `records` | 自動生成（事前参照） | 撮影記録 |
| `apiUsage` | `user_{uid}_{YYYYMMDD}` / `global_{YYYYMMDD}` | API利用回数 |
| `admin_logs` | 自動生成 | 管理者操作ログ |

### 8.2 セキュリティルール要約

| コレクション | read | write |
|-------------|------|-------|
| `users/{uid}` | 本人 or 管理者 | 本人 or 管理者 |
| `blocked_users/{email}` | 本人 or 管理者 | 管理者のみ |
| `records/{recordId}` | 本人（`userId == uid`） or 管理者 | 本人のみ |
| `apiUsage/{docId}` | 認証済み全員 | 認証済み全員 |
| `admin_logs/{logId}` | 管理者のみ | 管理者のみ |

---

## 9. IndexedDB設計

```
データベース名: "flower_shot_db"
バージョン: 1

オブジェクトストア: "images"
  キー: photoLocalKey（= Firestore records のドキュメントID）
  値: { key: string, blob: Blob, savedAt: number }
```

### 容量管理
- `navigator.storage.estimate()` で使用量を取得
- 設定画面に保存済み枚数・使用量・残り容量を表示
- 最大約500枚（約1GB）まで保存可能

---

## 10. テーマ設計（v2.0追加）

### 10.1 ThemeContext

```typescript
interface ThemeState {
  bgColor: string;      // 背景色（デフォルト: "#FFF44F"）
  buttonColor: string;  // ボタン色（デフォルト: "#FF9CAD"）
  emoji: string;        // 花アイコン（デフォルト: "🌻"）
}
```

### 10.2 保存先
- localStorage キー: `flower_shot_theme`
- JSON 形式で保存

### 10.3 適用方法
- `ThemeProvider` が App.tsx の最外層でラップ
- `document.body.style.backgroundColor` に bgColor をリアルタイム適用
- ホーム画面のタイトルに emoji を表示

### 10.4 設定UI（SettingsPage）
- 背景色: 7色のカラーパレット（タップで即時反映）
- ボタン色: 6色のカラーパレット
- 花アイコン: 8種の絵文字から選択

---

## 11. PDFアルバム設計（v2.0追加）

### 11.1 概要
- CollectionPage の「アルバムを つくる（PDF）」ボタンで生成
- jsPDF を使用してクライアントサイドでPDF生成
- IndexedDB から画像を取得して埋め込み

### 11.2 PDF構成
- **表紙**: 黄色背景、「Flower Shot」タイトル、年/All表記、花の数
- **本文**: A4縦、1ページに2枚ずつ
  - 画像（最大90mm x 65mm、アスペクト比維持）
  - 花の名前（16pt）
  - 学名（10pt、グレー）
  - 日付 + 信頼度%（10pt、グレー）
  - ページ中央に区切り線

### 11.3 進捗表示
- 生成中はボタンに「{current} / {total} まいめ...」と表示
- 完了後にブラウザのダウンロードが自動開始

---

## 12. 地図ピッカー設計（v2.0追加）

### 12.1 LocationPicker コンポーネント
- フルスクリーンのモーダル表示
- Leaflet MapContainer + OpenStreetMap タイル
- 地図タップで座標を選択（Marker 表示）
- ヘッダーに「けってい」「閉じる」ボタン
- デフォルト中心: 東京（35.6762, 139.6503）

### 12.2 使用箇所
- ResultPage の Step3（場所選択）で「ちずで えらぶ」ボタンから呼び出し

---

## 13. Cloudflare Pages Functions 設計（v2.0追加）

### 13.1 Pl@ntNet APIプロキシ

ファイル: `functions/api/plantnet/[[path]].js`

```javascript
export async function onRequestPost(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/plantnet", "");
  const targetUrl = "https://my-api.plantnet.org" + path + url.search;

  const body = await request.arrayBuffer();
  const res = await fetch(targetUrl, {
    method: "POST",
    body: body,
    headers: {
      "Content-Type": request.headers.get("Content-Type") || "",
    },
  });

  const responseBody = await res.arrayBuffer();
  return new Response(responseBody, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}
```

- `[[path]]` キャッチオールルートで `/api/plantnet/` 以下の全パスを処理
- POSTメソッドのみ対応（`onRequestPost`）
- Content-Type をそのまま転送（multipart/form-data）

---

## 14. 環境変数

`.env.local` に設定（`.gitignore` に含める）:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_PLANTNET_API_KEY=
```

---

## 15. ビルド・デプロイ設定

### 15.1 vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/plantnet": {
        target: "https://my-api.plantnet.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/plantnet/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");
          });
        },
      },
    },
  },
});
```

### 15.2 Cloudflare Pages デプロイ
- ビルドコマンド: `npm run build`
- ビルド出力ディレクトリ: `dist`
- Functions ディレクトリ: `functions/`（自動検出）

---

## 16. コーディング規約

| 項目 | ルール |
|------|--------|
| 言語 | TypeScript（strict mode） |
| コンポーネント | 関数コンポーネント + Hooks |
| スタイリング | Tailwind CSS ユーティリティクラス |
| 命名規則（コンポーネント） | PascalCase |
| 命名規則（関数・変数） | camelCase |
| 命名規則（定数） | UPPER_SNAKE_CASE |
| 命名規則（ファイル） | コンポーネント: PascalCase.tsx、それ以外: kebab-case.ts |
| インポート順 | React → 外部ライブラリ → 内部モジュール → 型 |
| コミットメッセージ | 日本語OK |
| テスト | 手動テスト中心 |
