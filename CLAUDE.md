# Flower Shot - プロジェクトガイドライン

## アプリ概要
道端の花をスマホで撮影し、花の名前を特定・候補表示する子供向けアプリ。

## 技術スタック
- **フロントエンド**: React 18 + TypeScript + Vite（PWA構成）
- **スタイリング**: Tailwind CSS
- **バックエンド**: Firebase（Sparkプラン / 認証・Firestore・Hosting）
- **花の識別**: Pl@ntNet API
- **地図**: Leaflet + OpenStreetMap

## 子供が喜ぶ体験（最優先）
- カメラ撮影 → 結果表示は5秒以内。待ち時間にはアニメーションを表示
- 結果画面は花の名前 + かわいい装飾 + 短い豆知識（ひらがな対応）
- 色使いは明るくカラフルに。ダークモード不要
- 操作はワンタップで完結。複雑なナビゲーションは作らない
- 文字サイズは大きく、漢字にはふりがな（`<ruby>`）を振る
- 撮影ボタンは画面中央に大きく配置

## セキュリティ要件（子供向け必須事項）
- **撮影画像はサーバーに保存しない**: 端末内IndexedDBのみ
- **外部リンク・広告を一切入れない**: 子供が意図せず外部サイトに遷移しない
- **APIキー**: Cloud Functions不可のためクライアント埋め込み。利用回数制限（30回/日）で保護
- **HTTPS必須**: Firebase Hostingデフォルトで対応
- **Firestoreセキュリティルール**: 自分のデータしか読み書きできない制御
- **CSPヘッダー設定**: XSS対策

## コーディング規約
- TypeScript strict mode
- 関数コンポーネント + Hooks
- コンポーネントは `src/components/`、ページは `src/pages/`、ロジックは `src/lib/`
- 環境変数は `.env.local` に格納（`VITE_` プレフィックス）
- コミットメッセージは日本語OK

## ドキュメント
- 要件定義書: `docs/01-requirements.md`
- 基本設計仕様書: `docs/02-basic-design.md`
- 詳細設計書: `docs/03-detailed-design/`

## 開発コマンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run preview  # ビルド後のプレビュー
npm run lint     # ESLint実行
npx firebase deploy  # Firebase Hostingにデプロイ
```
