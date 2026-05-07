# Flower Shot 要件定義書

最終更新日: 2026年5月1日
バージョン: **2.0**

---

## 改訂履歴

| 日付 | バージョン | 主な変更内容 |
|------|----------|------|
| 2026-04-30 | 1.0 | 初版ドラフト作成 |
| 2026-04-30 | 1.1 | 対象端末・公開範囲・認証方式・位置情報の方針を確定。iOS Safariのストレージ仕様に基づくPWAインストール必須化を明記 |
| 2026-04-30 | 1.2 | 記録の共有方針・管理者アカウントを確定。データモデルへの反映を実施 |
| 2026-04-30 | 1.3 | アプリ名を「Flower Shot」に決定。認証方式を「事前許可リスト方式」から「オープン登録＋事後ブロック方式」に変更。1ユーザー1日30回のAPI制限を導入 |
| 2026-04-30 | 1.4 | バックエンド選定の根拠を正式に記録（Firebase継続を決定）。Supabase等の代替案との比較を明文化 |
| 2026-05-01 | **2.0** | **技術スタックをReact+Vite+Cloudflare Pagesに確定。利用制限を100回/日に変更（想定ユーザー5名）。テーマカスタマイズ機能追加。花判定後に場所選択するフローに変更。PDFアルバム出力機能追加。管理者画面を設定画面からアクセスに変更。設定画面は漢字表記（大人向け）。PWAバナー不要に** |

---

## 1. プロジェクト概要

### 1.1 アプリ名
**Flower Shot**

### 1.2 目的
道端に咲いている花や植物をスマートフォンで撮影し、AIが花の名前を判定するアプリ。子どもが「身近な自然への興味」を持ち、撮影記録を通じて達成感を味わえることを目的とする。

### 1.3 ターゲットユーザー
- **メインユーザー**: 小学校低学年（小学1年生〜）の子ども
- **副ユーザー**: 子どもをサポートする保護者
- **管理者**: アプリ管理者（`nomurakengo@gmail.com`）

### 1.4 利用範囲
- **オープン登録 + 事後ブロック方式**
  - URLを知っている人がGoogleアカウントでログインすれば誰でも利用開始可能
  - アプリストアや検索エンジンへの積極的な公開は行わない
  - 不適切な利用が検出された場合、管理者がブロック可能
- **規模想定**: 5名程度を想定（家族・近親者での利用）

### 1.5 利用想定シーン
- 通学路や公園、お散歩中に見つけた花を撮影する
- 撮影記録をマップ上で振り返る
- 月ごとの撮影数を見て「今月は10種類見つけた！」と達成感を得る
- 年間のアルバムをPDF出力して印刷・共有する

---

## 2. 確定した方針

### 2.1 v1.1で確定した事項

| 項目 | 決定内容 |
|------|---------|
| 対象端末 | iOSのみ（iPhone / iPad） |
| ログイン方式 | 保護者のGoogleアカウントを共用 |
| 位置情報 | 花の判定後に場所を選択（GPS自動取得 or 地図タップ） |
| オフライン対応 | 不要 |

### 2.2 v1.2で確定した事項

| 項目 | 決定内容 |
|------|---------|
| 撮影記録の共有 | 同一Googleアカウント内で全記録を共有（兄弟姉妹で分けない） |
| 管理者アカウント | nomurakengo@gmail.com |

### 2.3 v1.3で確定した事項

| 項目 | 決定内容 |
|------|---------|
| **アプリ名** | **Flower Shot** |
| **公開範囲** | **オープン登録 + 事後ブロック方式**（許可リスト方式から変更） |
| **API利用制限** | **1ユーザーあたり1日100リクエストまで**（Pl@ntNet APIの無料枠保護） |
| **新規ユーザー通知** | **管理者ダッシュボードで未確認新規登録者をハイライト表示** |

### 2.4 v2.0で確定した事項

| 項目 | 決定内容 |
|------|---------|
| **技術スタック** | **React + Vite + Cloudflare Pages**（Firebase Hostingから移行） |
| **APIプロキシ** | **Cloudflare Pages Functions**でPl@ntNet APIをプロキシ |
| **利用制限** | **1ユーザー100回/日**（想定ユーザー5名のため緩和） |
| **テーマ機能** | **背景色・ボタン色・花アイコンをユーザーがカスタマイズ可能** |
| **場所選択フロー** | **花判定後にGPS or 地図タップで場所を選択** |
| **PDFアルバム** | **図鑑画面から年別/全件のPDFアルバムを出力** |
| **管理者アクセス** | **設定画面から管理者画面へ遷移** |
| **設定画面の表記** | **漢字表記（大人向け）** |
| **PWAバナー** | **不要（常時警告バナーは実装しない）** |

### 2.5 未確定事項

| 項目 | 状態 | 必要なタイミング |
|------|------|----------------|
| 公開URL（独自ドメイン or Cloudflareサブドメイン） | TBD | リリース直前 |
| プライバシーポリシーの最終文面 | TBD | リリース前 |

---

## 3. 機能要件

### 3.1 撮影・判定機能

| 項目 | 内容 |
|------|------|
| 撮影方法 | iOS Safariのカメラを起動（`<input type="file" accept="image/*" capture="environment">`） |
| 対象 | 花を中心とした植物（葉・木は将来対応検討） |
| 判定方式 | 撮影画像をPl@ntNet APIへ送信し、花の名前を取得 |
| APIプロキシ | 同一ドメインの `/api/plantnet` 経由でアクセス（Cloudflare Pages Functions） |
| 候補表示 | 信頼度が低い場合は最大3件の候補を提示（信頼度%付き） |
| 判定対象外 | 花以外と判定された場合は「お花が見つからなかったよ」と表示 |
| ネットワーク要件 | 判定処理はオンライン必須。圏外時は「でんぱの あるところで もういちど ためしてね」と表示 |
| 利用回数制限 | **1ユーザーあたり1日100回まで**（100回到達後は翌日0:00までロック） |

### 3.2 結果表示機能

子どもが読みやすい表示にすることを最優先とする。

- **文字サイズ**: 18pt以上（見出しは24pt以上）
- **使用文字**: ひらがな中心（操作画面）、設定画面は漢字表記（大人向け）
- **表示内容**:
  - 花の名前（日本語名 or 学名）
  - 大きな写真と判定結果
  - 信頼度パーセント表示
- **「もっとくわしく」ボタン**: タップで詳細ページに遷移

### 3.3 詳細情報ページ

- Wikipedia API から要約を取得し、アプリ内で表示
- 元記事へのリンクも併記
- 自前で詳細データを持たないため、運用コストゼロ

### 3.4 保存・記録機能

| 保存項目 | 保存先 | 備考 |
|---------|-------|------|
| 撮影画像 | 端末内（IndexedDB） | クラウドへはアップロードしない |
| 花の名前 | クラウド（Firestore） | テキスト |
| 撮影日時 | クラウド（Firestore） | 自動記録 |
| 位置情報（緯度・経度） | クラウド（Firestore） | 判定後にユーザーが場所を選択した場合のみ |
| 判定信頼度 | クラウド（Firestore） | 候補の場合は複数件 |
| ユーザーID | クラウド（Firestore） | Googleログインから取得 |

### 3.5 位置情報の取り扱い

#### 場所選択フロー（v2.0で変更）
- **花の判定後**に場所を記録するかどうかを選択するステップを表示
- **GPS自動取得**: 「いまの ばしょ」ボタンで `navigator.geolocation.getCurrentPosition()` を実行
- **地図タップ**: 「ちずで えらぶ」ボタンでLeaflet地図をフルスクリーン表示し、タップで座標を選択（LocationPickerコンポーネント）
- **場所なしで保存**: 場所を記録せずに保存することも可能

#### 設定画面
- 「場所を記録する（既定）」のデフォルトON/OFFを設定可能

#### マップ表示時の挙動
- 位置情報なしで保存された撮影は、マップには表示されないが図鑑一覧には表示される

### 3.6 マップ機能

- 撮影した場所を地図上にピンで表示（位置情報ありの撮影のみ）
- ピンをタップすると、撮影写真・花の名前・日付をポップアップ表示
- **年フィルタ**で絞り込み可能（「ぜんぶ」「2026ねん」等）
- 全ピンが収まる範囲に自動フィット
- **使用ライブラリ**: Leaflet + react-leaflet + OpenStreetMap（完全無料、APIキー不要）

### 3.7 月間サマリー・バッジ機能（ゲーミフィケーション）

子どものやる気を引き出すための機能。

- 月ごとに「今月見つけた花の種類数」を大きく表示
- 累計図鑑コレクション数を表示（例: 「ずかんに 25しゅるい あつまったよ！」）
- バッジ機能:
  - 1種類: 「はじめての はっけん」
  - 5種類: 「はじめての ぼうけんしゃ」
  - 10種類: 「おはな コレクター」
  - 20種類: 「はな マスター」
  - 50種類: 「はな はかせ」

### 3.8 テーマカスタマイズ機能（v2.0で追加）

ユーザーがアプリの見た目をカスタマイズできる。

| 項目 | 選択肢 |
|------|--------|
| 背景色 | レモン / クリーム / 桜 / 空 / 緑 / ラベンダー / 白 |
| ボタンの色 | ピンク / 赤 / オレンジ / 緑 / 青 / 紫 |
| タイトルの花アイコン | 🌻 / 🌸 / 🌷 / 🌹 / 🌺 / 💐 / 🌼 / 🏵 |

- テーマ設定はlocalStorageに保存（端末ごとに独立）
- ThemeProvider（React Context）で全画面に反映
- 背景色は `document.body.style.backgroundColor` にリアルタイム適用

### 3.9 PDFアルバム出力機能（v2.0で追加）

- 図鑑画面から「アルバムを つくる（PDF）」ボタンで出力
- 年別フィルタと連動（選択中の年のみ or 全件）
- PDF構成:
  - 表紙: アプリ名 + 年 + 花の数
  - 本文: 1ページに2枚ずつ（写真 + 花名 + 学名 + 日付 + 信頼度）
- 画像はIndexedDBから取得してPDFに埋め込み
- **使用ライブラリ**: jsPDF

### 3.10 認証機能

#### ログイン方式
- **Google アカウントでのSSO**（Firebase Authentication）
- どのGoogleアカウントでもログイン可能（許可リストなし）
- 初回ログイン時に自動的にユーザーレコードを作成

#### アクセス制御（事後ブロック方式）
- 通常時: 全ユーザーがログイン・利用可能
- ブロック時: 管理者が `blocked_users` コレクションにメールアドレスを追加すると、次回ログイン以降アクセス拒否
- ブロックされたユーザーには「ご利用を停止しました。お問い合わせはこちらまで」と表示

#### 新規ユーザー検知
- ログイン時に Firestore の `users` コレクションへ自動登録
- `firstLoginAt` フィールドにタイムスタンプを記録
- `reviewedByAdmin: false` フラグを付与
- 管理者ダッシュボードで未確認ユーザーをハイライト

### 3.11 利用回数制限機能

Pl@ntNet API の無料枠（全ユーザー合計で1日500リクエスト）を保護するため、ユーザー単位での制限を設ける。

#### 仕組み
- Firestore の `apiUsage` コレクションに、ユーザーIDと日付をキーとしてリクエスト数を記録
- 撮影判定実行時、当日のリクエスト数が100以上ならエラー表示
- 翌日0:00（日本時間）でリセット

#### ユーザーへの表示
| 状況 | 表示内容 |
|------|---------|
| 残り10回以下 | 「きょうはあと {N}かい あそべるよ」 |
| 残り0回（上限到達） | 「きょうのお花さがしは おしまい！あしたまた あそぼうね」 |
| 全体上限到達（500/日） | 「きょうはみんなが たくさん あそんでくれたよ！あしたまた あそぼうね」 |

### 3.12 管理者機能（v2.0で改訂）

| 項目 | 内容 |
|------|------|
| アクセス方法 | **設定画面の「管理者」セクションから遷移**（管理者メールのみ表示） |
| 認証 | `nomurakengo@gmail.com` のみアクセス可（AdminGuardコンポーネント + Firestore Rulesで制御） |
| **ダッシュボード** | ユーザー数、撮影記録数、当日のAPI使用量/500を表示。未確認新規ユーザーをハイライト。ユーザー一覧で確認・ブロック・ブロック解除が可能 |
| **ユーザー一覧** | `/admin/users` で全ユーザーの一覧 |
| **撮影記録一覧** | `/admin/records` で全撮影記録のテキスト情報を閲覧可能 |
| 表示しないもの | 撮影画像（端末にしか存在しないため） |

---

## 4. 非機能要件

### 4.1 性能要件

- 花判定のレスポンス: 5秒以内（API処理時間含む）
- アプリ起動: 3秒以内
- マップ表示: 2秒以内（ピン100件まで）

### 4.2 ユーザビリティ

- 小1でも操作できるよう、ボタンは大きく・少なく
- 1画面1タスクの原則
- 文字より絵やアイコンを優先
- **設定画面は保護者向けに漢字表記**

### 4.3 セキュリティ

- 通信は全てHTTPS
- Firestoreのセキュリティルールで「自分のデータしか読み書きできない」制御
- ブロックされたユーザーは認証直後にチェックされアクセス拒否
- 子どもの位置情報は他ユーザーに公開しない（管理者のみ閲覧）
- Pl@ntNet APIキーはCloudflare Pages Functionsでプロキシし、クライアントから直接外部APIを呼ばない
- 個人情報保護法（APPI）に配慮

### 4.4 対応端末

- **iOS 16.4 以降の Safari** を推奨（PWAの安定性のため）
- **最低動作要件: iOS 15以降**
- iPhone / iPad 両対応

---

## 5. iOS Safari の重要な制約と対応

### 5.1 ホーム画面追加（PWAインストール）の推奨

iOS Safari には **ITP（Intelligent Tracking Prevention）** という機能があり、以下の挙動があります。

- **通常のSafariブラウザでアクセスした場合**: 7日間サイトを訪問しないと、IndexedDB等のローカルストレージが自動削除される
- 本アプリは **撮影画像をすべてIndexedDBに保存する設計** のため、これに該当すると **撮影写真がすべて消える**

#### 対応策
- 初回ログイン後にチュートリアル画面で「ホーム画面に追加」を案内
- **PWA未インストール警告バナーは実装しない**（v2.0で不要と決定）
- 設定画面に保存に関する制約事項を明記し、保護者に注意を促す

### 5.2 IndexedDB の容量制限

- iOS Safari の IndexedDB の上限: **概ね1GB程度**（端末空き容量にも依存）
- 1枚2MBの画像で約500枚まで保存可能

### 5.3 カメラアクセスの仕様

- iOS Safari ではカメラ起動に **ユーザーの操作（タップ）が必須**
- `<input type="file" accept="image/*" capture="environment">` を使うことで、自然なカメラ起動が可能
- 初回利用時、カメラ・位置情報の許可ダイアログが表示される

---

## 6. 技術スタック（v2.0で確定）

### 6.1 構成図

```
[iPhone / iPad（PWAとしてホーム画面追加推奨）]
   |-- Safari ベースのPWA (Flower Shot)
   |    |-- <input capture> → カメラ撮影
   |    |-- Geolocation API → 位置情報（選択時のみ）
   |    |-- IndexedDB → 画像ローカル保存
   |    +-- localStorage → テーマ設定
   |
   +-- ネットワーク（HTTPS）
        |-- Cloudflare Pages（アプリ配信）
        |-- Cloudflare Pages Functions（Pl@ntNet APIプロキシ: /api/plantnet/*）
        |-- Firebase Auth（Googleログイン）
        |-- Firestore（テキストデータ保存・利用回数管理・ブロックリスト）
        |-- Wikipedia API（詳細情報取得）
        +-- OpenStreetMap（地図タイル）
```

### 6.2 各サービスの選定理由と無料枠

| カテゴリ | 採用技術 | 無料枠 | 選定理由 |
|---------|---------|--------|---------|
| フロントエンド | React 18 + TypeScript + Vite | 無制限 | 高速なビルド、TypeScript対応 |
| スタイリング | Tailwind CSS（@tailwindcss/vite） | 無制限 | ユーティリティファーストCSS |
| ホスティング | **Cloudflare Pages** | 無制限帯域幅、500デプロイ/月 | 高速CDN、Pages Functionsが無料 |
| APIプロキシ | **Cloudflare Pages Functions** | 10万リクエスト/日 | Pl@ntNet APIキーの保護 |
| 認証 | Firebase Authentication | 月50,000認証まで無料 | Googleログイン標準対応 |
| データベース | Cloud Firestore | 1GBストレージ、読取5万/日、書込2万/日 | テキストのみなら長期間無料運用可能 |
| 画像保存 | 端末内IndexedDB | 端末容量に依存（iOS約1GB） | クラウドストレージ無料枠の枯渇を回避 |
| 花の判定AI | Pl@ntNet API | 1日500リクエスト/組織 | 植物特化、精度が高い、非商用無料 |
| 詳細情報 | Wikipedia API | 完全無料 | 制限ほぼなし |
| 地図 | Leaflet + react-leaflet + OpenStreetMap | 完全無料 | APIキー不要 |
| PDF生成 | **jsPDF** | 無制限（クライアントサイド） | ブラウザ内でPDF生成 |

### 6.3 Cloudflare Pages Functions によるAPIプロキシ

- `/api/plantnet/*` へのリクエストを `https://my-api.plantnet.org` に転送
- `functions/api/plantnet/[[path]].js` に実装
- POSTリクエスト（multipart/form-data）をそのまま転送
- 開発時は Vite の `server.proxy` で同等の挙動を再現

### 6.4 バックエンド選定の根拠

本プロジェクトでは Firebase（認証・DB）+ Cloudflare Pages（ホスティング・APIプロキシ）の構成を採用した。

#### Firebase を継続した理由
- Googleエコシステムとの統合性（Googleログインが最小手順で実装可能）
- Supabase無料プランの「7日無操作で一時停止」問題を回避
- iOS PWA運用での実績と日本語の資料量

#### Cloudflare Pages に移行した理由
- Firebase Hosting + Cloud Functions は Blazeプラン（従量課金）が必要
- Cloudflare Pages Functions は無料プランでAPIプロキシが可能
- Pl@ntNet APIキーをサーバーサイドで保護できる
- 帯域幅が無制限

---

## 7. データ保存方針と制約事項

### 7.1 画像はテキストのみクラウド保存

写真画像は端末内（IndexedDB）にのみ保存。サーバーにはテキスト情報＋位置情報のみ保存。

| 保存先 | 内容 | 容量 |
|------|------|------|
| 端末（IndexedDB） | 撮影画像（JPEG） | iOS約1GB（500枚程度） |
| Firestore | 花名、日付、位置、判定信頼度等 | 1GB（事実上無制限） |
| localStorage | テーマ設定、安全注意表示済みフラグ等 | 微小 |

### 7.2 ストレージ容量の表示

設定画面（漢字表記・保護者向け）に以下を表示:

```
📸 保存済み: 47枚（95.2MB）
📦 残り: 約453枚（905MB）
🌸 本日の判定: 5回 / 100回

保存に関する制約事項:
・写真はこの端末内にのみ保存されます
・最大 約500枚まで保存可能（約1GB）
・別の端末では写真を閲覧できません
・アプリを削除すると写真も消去されます
```

### 7.3 無料枠超過時の警告

| 警告タイミング | 表示内容 | 対象 |
|--------------|---------|------|
| 1ユーザーあたり残り判定回数が10回以下 | 「きょうはあと {N}かい あそべるよ」 | 子ども |
| 1ユーザーあたり判定上限到達（100回） | 「きょうのお花さがしは おしまい！あしたまた あそぼうね」 | 子ども |
| Pl@ntNet API全体が1日500リクエスト到達 | 「きょうはみんなが たくさん あそんでくれたよ！あしたまた あそぼうね」 | 全員 |

### 7.4 想定運用規模

- ユーザー数: **5名程度**（家族・近親者での利用）
- 1人あたり判定回数: 100回/日上限
- 全体上限: 500回/日（Pl@ntNet API無料枠）

---

## 8. 画面遷移概要

```
[初回起動]
     |
[チュートリアル画面（PWAインストール案内）]
     |
[ログイン画面] --- ブロックリスト照合 --- ブロック済みなら拒否
     |
[ホーム画面（今月のサマリー + 撮影ボタン）]
     |-- [撮影ボタン] → [CameraPage: 撮影・プレビュー]
     |       → [ResultPage: 判定 → 結果表示 → 場所選択 → 保存 → 完了]
     |           → [DetailPage: 詳細情報]
     |-- [ずかん] → [CollectionPage: 図鑑一覧 + PDFアルバム出力]
     |       → [DetailPage: 詳細情報]
     |-- [ちず] → [MapPage: 花マップ（年フィルタ付き）]
     +-- [せってい] → [SettingsPage: テーマ・位置情報・ストレージ・ログアウト]
             +-- [管理者画面（管理者のみ表示）] → [AdminDashboard]
                     |-- [AdminUsers]
                     +-- [AdminRecords]
```

---

## 9. 開発フェーズ

全機能が実装済み。

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 | MVP: 撮影・判定・名前表示・保存・マップ・認証・利用回数制限 | 完了 |
| Phase 2 | 月間サマリー・バッジ・管理者ダッシュボード | 完了 |
| Phase 2.5 | テーマカスタマイズ・場所選択フロー・PDFアルバム・地図ピッカー | 完了 |
| Phase 3 | 葉や木への対応拡張、子どもプロファイル分け | 未着手 |

---

## 10. データモデル設計

### 10.1 Firestore コレクション構成

```
firestore/
|-- users/                      # ログインしたユーザーの基本情報
|   +-- {uid}                   # FirebaseのUID
|       |-- email: string
|       |-- displayName: string
|       |-- photoURL: string
|       |-- firstLoginAt: timestamp     # 初回ログイン日時
|       |-- lastLoginAt: timestamp
|       |-- reviewedByAdmin: boolean    # 管理者が確認済みか（新規検知用）
|       +-- settings: object
|           +-- locationDefaultOn: boolean   # 位置記録のデフォルト
|
|-- blocked_users/              # ブロックリスト（事後ブロック用）
|   +-- {email}                 # ドキュメントID = メールアドレス
|       |-- email: string
|       |-- blockedAt: timestamp
|       |-- blockedBy: string   # 管理者メール
|       +-- reason: string      # ブロック理由（任意）
|
|-- records/                    # 撮影記録（メイン）
|   +-- {recordId}              # 自動生成ID
|       |-- userId: string      # FirebaseのUID
|       |-- photoLocalKey: string  # 端末IndexedDBの画像キー
|       |-- flowerName: string  # 確定した花の名前
|       |-- flowerNameOriginal: string  # APIから返ってきた元の名前（学名）
|       |-- candidates: array   # 候補リスト
|       |   +-- { name, nameOriginal, confidence }
|       |-- confidence: number  # 確定花の信頼度（0-1）
|       |-- capturedAt: timestamp
|       |-- location: object | null   # 場所未選択ならnull
|       |   |-- latitude: number
|       |   +-- longitude: number
|       +-- isLocationRecorded: boolean
|
|-- apiUsage/                   # API利用回数管理
|   |-- user_{uid}_{YYYYMMDD}   # ユーザー別の日次使用量
|   |   |-- userId: string
|   |   |-- date: string        # "2026-04-30"
|   |   +-- count: number       # 当日のリクエスト数（最大100）
|   |
|   +-- global_{YYYYMMDD}       # 全体の日次使用量
|       |-- date: string
|       +-- count: number       # 当日の全体リクエスト数（最大500）
|
+-- admin_logs/                 # 管理者の操作ログ
    +-- {logId}
        |-- action: string      # "BLOCK_USER" | "UNBLOCK_USER" | "REVIEW_USER" 等
        |-- targetEmail: string
        |-- performedBy: string
        +-- performedAt: timestamp
```

### 10.2 セキュリティルール概要

```javascript
// 自分のレコードのみ読み書き可、管理者は全閲覧可
match /records/{recordId} {
  allow read: if request.auth.uid == resource.data.userId
              || request.auth.token.email == "nomurakengo@gmail.com";
  allow write: if request.auth.uid == resource.data.userId;
}

// ユーザー情報: 本人と管理者のみアクセス可
match /users/{uid} {
  allow read: if request.auth.uid == uid
              || request.auth.token.email == "nomurakengo@gmail.com";
  allow write: if request.auth.uid == uid
               || request.auth.token.email == "nomurakengo@gmail.com";
}

// ブロックリスト: 管理者のみ書き込み可、本人は自分のエントリだけ確認可
match /blocked_users/{email} {
  allow read: if request.auth.token.email == email
              || request.auth.token.email == "nomurakengo@gmail.com";
  allow write: if request.auth.token.email == "nomurakengo@gmail.com";
}

// API利用回数: 認証済みユーザーは読み書き可
match /apiUsage/{docId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

### 10.3 端末側（IndexedDB）のデータ構造

```
IndexedDB: "flower_shot_db" (version: 1)
+-- images（オブジェクトストア）
    +-- { key: photoLocalKey, blob: Blob, savedAt: timestamp }
```

- `photoLocalKey` は Firestore の `records/{recordId}` のドキュメントIDと一致
- アプリ起動時にFirestoreから記録一覧を取得し、`photoLocalKey` で端末内画像を引き当てる
- 端末内に画像がない場合（別端末からのアクセス等）はプレースホルダー表示

### 10.4 localStorage に保存するデータ

| キー | 内容 |
|------|------|
| `flower_shot_theme` | テーマ設定（bgColor, buttonColor, emoji）のJSON |
| `flower_shot_safety_shown` | 安全注意喚起の表示済みフラグ |
| `flower_shot_tutorial_shown` | チュートリアルの表示済みフラグ |

---

## 11. リスクと対応

| リスク | 影響 | 対応策 |
|-------|------|--------|
| ホーム画面追加忘れによるデータ消失 | 撮影写真がすべて消える | チュートリアルで案内 + 設定画面に制約事項を明記 |
| 不正利用者の混入 | API枠の浪費、不適切利用 | 1ユーザー100回/日制限 + 管理者によるブロック機能 |
| Pl@ntNet API全体枠の枯渇 | 全ユーザー判定停止 | 想定ユーザー5名のため枯渇リスクは低い |
| Pl@ntNet APIの仕様変更・廃止 | 判定機能停止 | 代替APIを定期的に評価 |
| 端末故障で写真が消失 | ユーザーの記録が失われる | PDFアルバム出力機能で写真をバックアップ |
| Firestore無料枠超過 | サービス停止 | 想定ユーザー5名のため超過リスクは低い |
| 判定精度の低さ | 子どもが落胆 | 候補複数表示 + 信頼度パーセント表示 |
| 子どもが屋外で歩きスマホ | 安全リスク | 起動時に「あんぜんなところで つかおうね」の注意喚起表示 |

---

## 12. 参考情報

- Pl@ntNet API: https://my.plantnet.org/
- Firebase 料金: https://firebase.google.com/pricing
- Cloudflare Pages: https://pages.cloudflare.com/
- iOS Safari の ITP について: https://webkit.org/tracking-prevention/
- PWA on iOS: https://web.dev/learn/pwa/
- OpenStreetMap 利用ポリシー: https://operations.osmfoundation.org/policies/tiles/
- jsPDF: https://github.com/parallax/jsPDF
