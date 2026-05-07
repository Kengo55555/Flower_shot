# 🌻 Flower Shot

道端の花をスマホで撮影して、花の名前を調べるアプリ。子どもが身近な自然に興味を持ち、撮影記録を通じて達成感を味わえることを目的としています。

**アプリURL**: https://flower-shot.pages.dev

---

## スマホでの使い方

### 初回セットアップ

1. スマホのSafari（またはChrome）で https://flower-shot.pages.dev を開く
2. **Googleアカウントでログイン**（管理者に許可されたメールアドレスが必要）
3. **ホーム画面に追加**（推奨）:
   - Safari → 共有ボタン（□↑）→「ホーム画面に追加」
   - アプリのようにアイコンから起動でき、写真も消えなくなります

### 花を撮影する

| 手順 | 操作 |
|------|------|
| ① | ホーム画面の **📷 さつえいボタン** をタップ |
| ② | カメラが起動 → 花を撮影 |
| ③ | プレビュー確認 → **「このしゃしんでしらべる」** |
| ④ | AI（Pl@ntNet）が花を判定 → 日本語名と学名を表示 |
| ⑤ | **場所を記録**（GPS自動取得 or 地図から手動選択） |
| ⑥ | **「ばしょつきでほぞんする」** or **「ばしょなしでほぞんする」** |

### 記録を見る

| 画面 | 操作 |
|------|------|
| **📖 ずかん** | 撮影した花の一覧。年フィルタ、PDFアルバム出力が可能 |
| **🗺️ ちず** | 撮影場所を地図上にピン表示。タップで花の写真と名前を確認 |
| **⚙️ せってい** | テーマ変更、位置情報設定、ストレージ確認、ログアウト |

---

## ユーザーができること

| 機能 | 説明 |
|------|------|
| 花を撮影・判定 | カメラで花を撮り、AIが名前を推定（1日100回まで） |
| 記録の保存 | 花の名前・写真・場所・日付をセットで保存 |
| 図鑑の閲覧 | これまでに見つけた花を一覧で確認 |
| 地図で振り返り | 撮影場所を地図上で確認 |
| 詳細情報 | Wikipedia連携で花の詳しい情報を閲覧 |
| PDFアルバム | 年別のアルバムをPDFで出力・共有 |
| テーマ変更 | 背景色・ボタン色・タイトルの花アイコンをカスタマイズ |
| 記録の削除 | 花の詳細画面から個別に削除 |

---

## 管理者ができること

管理者（`nomurakengo@gmail.com`）は、設定画面 → **「管理者画面」** からアクセスできます。

| 機能 | 説明 |
|------|------|
| **許可メールアドレス管理** | アプリを使えるユーザーのメールアドレスを追加・削除（招待制） |
| **ダッシュボード確認** | 総ユーザー数・総撮影数・本日のAPI使用量を確認 |
| **ユーザー確認** | 新規登録ユーザーを「確認済み」にマーク |
| **ブロック管理** | 問題のあるユーザーをブロック・ブロック解除 |

### 新しいユーザーを追加する手順

1. 設定 → **管理者画面** を開く
2. 「許可メールアドレス」セクションでメールアドレスを入力
3. **「追加」** をタップ
4. 追加された人がGoogleログインするとアプリが使えるようになります

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React + TypeScript + Vite + Tailwind CSS |
| 認証 | Firebase Authentication（Google SSO） |
| データベース | Cloud Firestore |
| 画像保存 | 端末内 IndexedDB |
| 花の判定AI | Pl@ntNet API |
| 詳細情報 | Wikipedia API |
| 地図 | Leaflet + OpenStreetMap |
| ホスティング | Cloudflare Pages |
| APIプロキシ | Cloudflare Pages Functions |
| PDF生成 | jsPDF |

---

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [01 要件定義書](docs/01-requirements.md) | アプリの目的・機能要件・非機能要件 |
| [02 基本設計書](docs/02-basic-design.md) | 技術スタック・画面設計・データフロー |
| [03 詳細設計書](docs/03-detailed-design/00-index.md) | 機能別の実装タスク（17機能） |
| [04 システム構成図](docs/04-system-architecture.md) | 構成図・ER図・ユースケース図（Mermaid） |
| [05 技術スタックガイド](docs/05-tech-stack-guide.md) | 各技術の役割を非エンジニア向けに解説 |
| [06 技術選定理由](docs/06-tech-selection-rationale.md) | なぜこの技術を選んだか比較付きで解説 |
| [07 セキュリティガイド](docs/07-security-guide.md) | セキュリティ対策と一般的なリスク解説 |

---

## 開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Cloudflare Pagesにデプロイ
npx wrangler pages deploy dist --project-name flower-shot

# Firestoreルールのデプロイ
npx firebase-tools deploy --only firestore --project flower-shot-931fd
```

### 環境変数

`.env.local` に以下を設定（`.env.example` を参照）:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_PLANTNET_API_KEY=
```

Cloudflare Pages の環境変数:
```
PLANTNET_API_KEY=（サーバー側でのみ使用）
```

---

## ライセンス

このプロジェクトはプライベートプロジェクトです。
