# Flower Shot 基本設計仕様書

最終更新日: 2026-04-30
要件定義書: `flower_shot_requirements.md` v1.4 に準拠

---

## 1. 技術スタック

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| フロントエンド | React 18 + TypeScript + Vite | PWA構成 |
| スタイリング | Tailwind CSS | 子供向けの明るいカラフルなUI |
| ホスティング | Firebase Hosting | Sparkプラン（無料） |
| 認証 | Firebase Authentication | Google SSO |
| データベース | Cloud Firestore | Sparkプラン（無料） |
| 画像保存 | 端末内 IndexedDB | サーバーには保存しない |
| 花の判定AI | Pl@ntNet API | 1日500リクエスト/組織、1ユーザー30回/日 |
| 詳細情報 | Wikipedia API | 完全無料 |
| 地図 | Leaflet + OpenStreetMap | APIキー不要 |

### 重要な制約
- **Cloud Functions は使わない**（Sparkプラン維持のため）
- Viteの環境変数は `VITE_` プレフィックス
- Pl@ntNet APIキーはクライアントから直接呼び出す（Cloud Functions不可のため）
  - 利用回数制限（1ユーザー30回/日、全体500回/日）で保護
  - 本番では Firebase Hosting のリライトルールでプロキシすることを検討

---

## 2. ディレクトリ構成

```
src/
├── main.tsx                    # エントリポイント
├── App.tsx                     # ルーティング定義
├── vite-env.d.ts
│
├── pages/                      # 画面コンポーネント（1画面1ファイル）
│   ├── HomePage.tsx            # ホーム画面（今月のサマリー + 撮影ボタン）
│   ├── CameraPage.tsx          # カメラ撮影 → 判定フロー
│   ├── ResultPage.tsx          # 判定結果表示
│   ├── DetailPage.tsx          # 花の詳細情報（Wikipedia）
│   ├── CollectionPage.tsx      # 図鑑一覧
│   ├── MapPage.tsx             # マップ画面
│   ├── SettingsPage.tsx        # 設定画面
│   ├── LoginPage.tsx           # ログイン画面
│   ├── TutorialPage.tsx        # PWAインストールチュートリアル
│   └── admin/
│       ├── AdminDashboard.tsx  # 管理者ダッシュボード
│       ├── AdminUsers.tsx      # ユーザー一覧・ブロック管理
│       └── AdminRecords.tsx    # 撮影記録一覧
│
├── components/                 # 再利用可能なUIコンポーネント
│   ├── common/
│   │   ├── Header.tsx          # 画面上部ヘッダー
│   │   ├── BottomNav.tsx       # 画面下部ナビゲーション
│   │   ├── Loading.tsx         # 判定中アニメーション
│   │   ├── RubyText.tsx        # ふりがな付きテキスト表示
│   │   └── PwaInstallBanner.tsx # PWA未インストール警告バナー
│   ├── camera/
│   │   └── CaptureButton.tsx   # 撮影ボタン（大きい丸ボタン）
│   ├── result/
│   │   ├── ResultCard.tsx      # 判定結果カード
│   │   └── CandidateList.tsx   # 候補リスト表示
│   ├── collection/
│   │   └── FlowerCard.tsx      # 図鑑カード
│   ├── map/
│   │   └── FlowerMap.tsx       # Leafletマップ
│   └── gamification/
│       ├── MonthlySummary.tsx  # 月間サマリー
│       └── BadgeDisplay.tsx    # バッジ表示
│
├── lib/                        # ビジネスロジック・外部API
│   ├── firebase.ts             # Firebase初期化（Auth + Firestore）
│   ├── auth.ts                 # 認証ロジック（ログイン/ログアウト/ブロックチェック）
│   ├── plantnet.ts             # Pl@ntNet API呼び出し
│   ├── wikipedia.ts            # Wikipedia API呼び出し
│   ├── firestore.ts            # Firestoreの読み書き（records, users, apiUsage）
│   ├── indexeddb.ts            # IndexedDB操作（画像の保存/取得/削除）
│   ├── geolocation.ts          # 位置情報取得
│   └── usage-limit.ts          # API利用回数チェック・更新
│
├── hooks/                      # カスタムフック
│   ├── useAuth.ts              # 認証状態管理
│   ├── useRecords.ts           # 撮影記録のCRUD
│   ├── useUsageLimit.ts        # 残り回数の取得・表示
│   └── usePwaInstall.ts        # PWAインストール状態検出
│
├── types/                      # 型定義
│   └── index.ts
│
├── constants/                  # 定数
│   └── index.ts                # バッジ定義、制限値、管理者メール等
│
└── styles/                     # グローバルスタイル
    └── index.css               # Tailwind directives + カスタムCSS

public/
├── manifest.json               # PWA マニフェスト
├── sw.js                       # Service Worker（PWA用）
├── icons/                      # アプリアイコン各サイズ
└── index.html
```

---

## 3. 画面設計

### 3.1 画面遷移フロー

```
[初回起動] → [TutorialPage] → [LoginPage] → [同意画面（初回のみ）] → [HomePage]

[HomePage]
  ├── 撮影ボタン → [CameraPage] → [ResultPage] → [DetailPage]
  ├── 図鑑タブ → [CollectionPage] → [DetailPage]
  ├── マップタブ → [MapPage]
  └── 設定タブ → [SettingsPage]

[/admin] → 管理者メール照合 → [AdminDashboard]
```

### 3.2 各画面の責務

| 画面 | 主な責務 | ルート |
|------|---------|--------|
| TutorialPage | PWAインストール手順を図解で案内。`navigator.standalone`で検出し未インストールなら常時誘導 | `/tutorial` |
| LoginPage | Googleログインボタン1つ。ブロックチェック後にリダイレクト | `/login` |
| HomePage | 今月の撮影数・バッジ・残り判定回数を表示。中央に大きな撮影ボタン | `/` |
| CameraPage | `<input type="file" accept="image/*" capture="environment">`でカメラ起動。位置情報ON/OFFトグル | `/camera` |
| ResultPage | Pl@ntNet判定結果を表示。信頼度高→1件、低→最大3候補。保存ボタン | `/result` |
| DetailPage | Wikipedia要約をアプリ内表示。元記事リンクも併記 | `/detail/:recordId` |
| CollectionPage | 撮影済み花の一覧（グリッド表示）。位置情報なしは「ばしょなし」表示 | `/collection` |
| MapPage | Leaflet地図にピン表示。月フィルタ付き | `/map` |
| SettingsPage | 位置情報デフォルト設定、容量確認、ログアウト | `/settings` |
| AdminDashboard | 未確認ユーザー数、API使用量、月次撮影数 | `/admin` |
| AdminUsers | ユーザー一覧、確認済みマーク、ブロック/解除 | `/admin/users` |
| AdminRecords | 全撮影記録のテキスト情報一覧 | `/admin/records` |

---

## 4. コンポーネント設計方針

### 4.1 子供ファーストUI原則
- **文字サイズ**: 本文18px以上、見出し24px以上
- **漢字には必ずふりがな**: `<RubyText>` コンポーネントで統一
- **ボタン**: 最小タップ領域 48x48px、撮影ボタンは80px以上
- **配色**: 明るいパステルカラー基調。ダークモード不要
- **1画面1タスク**: 複雑なナビゲーションは作らない
- **文字よりアイコン優先**: ナビゲーション等はアイコン + ひらがなラベル

### 4.2 BottomNav 構成
```
[ホーム] [ずかん] [ちず] [せってい]
```
- 撮影ボタンはホーム画面中央に大きく配置（BottomNavには含めない）

### 4.3 レスポンシブ対応
- iPhone SE（375px幅）を最小対応幅とする
- iPad（768px幅以上）ではコンテンツ幅を最大480pxに制限し中央寄せ
- 横画面は非対応（portrait固定をmanifestで指定）

---

## 5. データフロー

### 5.1 撮影→判定→保存フロー

```
1. [HomePage] ユーザーが撮影ボタンをタップ
2. [CameraPage] <input capture="environment"> でカメラ起動
3. [CameraPage] 撮影完了 → 位置情報ON/OFFを確認
   - ON: geolocation.ts で getCurrentPosition()
   - OFF: location = null
4. [CameraPage] 画像データ + 位置情報を CaptureContext にセット → ResultPage へ遷移
5. [ResultPage] usage-limit.ts で残回数チェック
   - 上限到達 → 「きょうのお花さがしは おしまい！」表示、API呼び出しなし
6. [ResultPage] plantnet.ts → Pl@ntNet API に画像送信（POST multipart/form-data）
   - Loading.tsx でアニメーション表示
7. [ResultPage] API応答を解析
   - 花が見つかった場合: ResultCard に花名・信頼度・候補を表示
   - 花以外: 「お花が見つからなかったよ」表示
8. [ResultPage] ユーザーが「ほぞんする」タップ
   a. firestore.ts → records コレクションにテキスト情報を保存
   b. indexeddb.ts → IndexedDB に画像Blob保存（キーはrecordId）
   c. usage-limit.ts → apiUsage/{uid}_{date} のカウントをインクリメント
9. [ResultPage] 保存完了 → 「もっとくわしく」ボタン or ホームに戻る
```

### 5.2 状態管理

React Context で以下をグローバル管理（外部ライブラリ不使用）:

| Context | 管理する状態 | 使用箇所 |
|---------|------------|---------|
| `AuthContext` | ログイン状態、ユーザー情報、ブロック状態、管理者フラグ | 全画面 |
| `CaptureContext` | 撮影中の画像データ（File/Blob）、位置情報 | CameraPage → ResultPage |

---

## 6. 認証・認可フロー

### 6.1 ログインフロー

```
1. [LoginPage] 「Googleでログイン」ボタンタップ
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
4. PWA未インストール → TutorialPage
   PWAインストール済み → HomePage
```

### 6.2 管理者判定

```typescript
// constants/index.ts
export const ADMIN_EMAIL = "nomurakengo@gmail.com";

// 判定ロジック
const isAdmin = (email: string | null) => email === ADMIN_EMAIL;
```

- `/admin/*` ルートは `isAdmin === false` なら `/` にリダイレクト
- Firestoreセキュリティルールでも `request.auth.token.email == ADMIN_EMAIL` で二重チェック

### 6.3 認証ガード

```
未ログイン → /login にリダイレクト
ブロック済み → ブロック画面を表示
PWA未インストール → /tutorial にリダイレクト（初回のみ強制）
```

---

## 7. 外部API仕様

### 7.1 Pl@ntNet API

| 項目 | 内容 |
|------|------|
| エンドポイント | `https://my-api.plantnet.org/v2/identify/all` |
| メソッド | POST |
| Content-Type | multipart/form-data |
| パラメータ | `images`: 画像ファイル, `organs`: `"flower"`, `api-key`: APIキー |
| レスポンス | `results[]`: `{ species: { scientificName, commonNames }, score }` |
| APIキーの扱い | `VITE_PLANTNET_API_KEY` としてビルド時埋め込み |

#### レスポンス処理ロジック
```
score >= 0.5 → 確定表示（1件）
score < 0.5  → 上位3件を候補として表示（信頼度%付き）
results が空 → 「お花が見つからなかったよ」
```

### 7.2 Wikipedia API

| 項目 | 内容 |
|------|------|
| エンドポイント | `https://ja.wikipedia.org/api/rest_v1/page/summary/{title}` |
| メソッド | GET |
| APIキー | 不要 |
| レスポンス | `{ title, extract, content_urls.desktop.page }` |

- `commonNames` の日本語名で検索
- 該当なしの場合は `scientificName` で再検索
- それでも該当なしなら「くわしい じょうほうが みつからなかったよ」表示

---

## 8. Firestore設計

### 8.1 コレクション構成

要件定義書 §10 に準拠。

| コレクション | ドキュメントID | 用途 |
|-------------|--------------|------|
| `users` | `{uid}` | ユーザー基本情報 |
| `blocked_users` | `{email}` | ブロックリスト |
| `records` | 自動生成 | 撮影記録 |
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
- 800MB（80%目安）超過時に保護者向け警告を表示
- 古い画像の手動削除機能を設定画面に配置

---

## 10. PWA設計

### 10.1 manifest.json

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

### 10.2 PWAインストール検出

```typescript
// iOS Safari: window.navigator.standalone
// それ以外: window.matchMedia('(display-mode: standalone)')
const isPwaInstalled = (): boolean => {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
};
```

- 未インストール時: `PwaInstallBanner.tsx` を全画面上部に常時表示
- 初回起動時: `TutorialPage` でインストール手順を図解

---

## 11. 環境変数

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

## 12. 開発フェーズ（実装順序）

### Phase 1 MVP

以下の順序で実装する:

| 順序 | 実装内容 | 依存関係 |
|------|---------|---------|
| 1 | プロジェクト初期化（Vite + React + TS + Tailwind + Firebase） | なし |
| 2 | Firebase設定（Auth + Firestore初期化、セキュリティルール） | 1 |
| 3 | 認証フロー（LoginPage + AuthContext + ブロックチェック） | 2 |
| 4 | PWAチュートリアル（TutorialPage + PwaInstallBanner） | 1 |
| 5 | カメラ撮影（CameraPage + CaptureButton + CaptureContext） | 3 |
| 6 | 花判定（ResultPage + plantnet.ts + Loading） | 5 |
| 7 | 保存機能（firestore.ts + indexeddb.ts） | 6 |
| 8 | 利用回数制限（usage-limit.ts + useUsageLimit） | 7 |
| 9 | 図鑑一覧（CollectionPage + FlowerCard） | 7 |
| 10 | マップ表示（MapPage + FlowerMap + Leaflet） | 7 |
| 11 | 詳細ページ（DetailPage + wikipedia.ts） | 9 |
| 12 | 設定画面（SettingsPage + 容量確認 + ログアウト） | 3 |

### Phase 2

- 月間サマリー・バッジ（MonthlySummary + BadgeDisplay）
- 管理者ダッシュボード（AdminDashboard + AdminUsers + AdminRecords）

---

## 13. コーディング規約

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
| テスト | Phase 1は手動テスト中心。usage-limit等の重要ロジックのみユニットテスト |
