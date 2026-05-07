# 06. 花判定

依存関係: 05（カメラ撮影）

---

## 概要

撮影画像をPl@ntNet APIに送信し、花の名前を判定する。結果画面にて確定表示または候補リストを表示する。

**v2.0変更点**: APIは `/api/plantnet` 経由でアクセス（開発: Vite proxy、本番: Cloudflare Pages Functions）。ResultPageは判定→結果表示→場所選択→保存→完了の5ステップを1画面で管理。

**v3.0変更点**:
- 日本語名検索を3段階フォールバック（PlantNet commonNames → Wikipedia学名検索 → Wikipedia属名検索）に改善
- APIキーをサーバー側環境変数で管理（クライアントから`api-key`パラメータを送らない）
- 位置情報フローをシンプル化（設定の`locationDefaultOn`で制御。ONならGPS取得→2択、OFFなら即保存）
- CameraPageのボタン名を「しらべる」に変更

---

## 実装タスク

### 6.1 Pl@ntNet API呼び出し（src/lib/plantnet.ts）

- [x] `identifyFlower(imageFile: File | Blob): Promise<PlantNetResponse>` 関数を実装
- [x] API呼び出し実装（APIキーはサーバー側で付与）
  ```typescript
  const url = `/api/plantnet/v2/identify/all?include-related-images=false&no-reject=false&nb-results=5&lang=ja&type=kt`;
  const res = await fetch(url, { method: "POST", body: formData });
  ```
- [x] エラーハンドリング（404 → 空results、その他 → エラーthrow）

### 6.2 日本語名3段階フォールバック検索

- [x] `extractJapaneseName(result)` 関数: PlantNet `commonNames` から日本語名を抽出
- [x] `lookupJapaneseName(scientificName)` 関数: Wikipedia MediaWiki APIで日本語名を検索
  - ステップ1: 学名で `action=query&list=search` を実行し、結果から適切な日本語名を抽出
  - ステップ2: 属名（学名の最初の単語）で同様に検索
- [x] `getJapaneseName(result)` 関数: 3段階を順に試行
  1. PlantNet commonNames から日本語名を抽出 → 見つかれば返す
  2. Wikipedia で学名検索 → 見つかれば返す
  3. Wikipedia で属名検索 → 見つかれば返す
  4. フォールバック: 学名をそのまま返す
- [x] `isGoodFlowerName(title)` 関数: 名前品質フィルタ
  - 日本語文字を含まないタイトルを除外
  - 「○○の一覧」「栽培植物」「野菜」等を除外
  - 「○○科」「○○目」等の分類階級を除外
- [x] 「○○属」は「属」を除去して使用（例: ヒマワリ属 → ヒマワリ）

### 6.3 判定結果の解析ロジック

- [x] `parseIdentifyResult(response: PlantNetResponse): Promise<IdentifyResult>` 関数を実装（async化）
  - `results` が空 → `status: "not_found"`
  - `results[0].score >= 0.5` → `status: "found"`（日本語名を非同期取得）
  - `results[0].score < 0.5` → `status: "candidates"`（上位3件、各候補の日本語名を非同期取得）

### 6.4 判定結果画面（src/pages/ResultPage.tsx）

- [x] 5ステップのステート管理（`type Step = "identifying" | "result" | "location" | "saving" | "done"`）
- [x] CaptureContext から画像データを取得（なければ `/` にリダイレクト）
- [x] Step1: `usage-limit` チェック + API呼び出し + Loading表示
- [x] Step2: 結果表示の分岐（found / candidates / not_found）
- [x] 「ほぞんする」ボタン:
  - `locationDefaultOn = ON`: Step3（場所選択）へ遷移
  - `locationDefaultOn = OFF`: 場所なしで即保存（Step4へ）
- [x] Step3: シンプル化された場所選択
  - GPS自動取得を試行
  - 取得成功: 「この ばしょで OK」/「ちずで えらぶ」
  - 取得失敗: 「ちずで えらぶ」/「ばしょなしで ほぞん」
- [x] Step4: 保存中ローディング
- [x] Step5: 完了（「もっと くわしく」or「ホームに もどる」）

### 6.5 結果カード（src/components/result/ResultCard.tsx）

- [x] 撮影画像を大きく表示
- [x] 花の名前・学名・信頼度パーセントを表示

### 6.6 候補リスト（src/components/result/CandidateList.tsx）

- [x] 撮影画像 + 候補カード（最大3件）
- [x] タップで選択状態をハイライト
- [x] 候補選択後に「ほぞんする」ボタンが有効化

### 6.7 ローディングアニメーション（src/components/common/Loading.tsx）

- [x] ローディングアニメーション実装
- [x] カスタムメッセージ対応（`message` prop）

### 6.8 エラー表示

- [x] API エラー時: 「うまく しらべられなかったよ。もういちど ためしてね」
- [x] 利用制限到達時の表示（ユーザー上限 / 全体上限）

### 6.9 CameraPage（src/pages/CameraPage.tsx）

- [x] 撮影プレビュー表示
- [x] 「とりなおす」ボタン: CaptureContext をクリアして再撮影
- [x] 「しらべる」ボタン: オンラインチェック → ResultPageへ遷移

---

## 完了条件

- [x] 撮影画像をPl@ntNet APIに送信して判定結果が返る
- [x] 信頼度 >= 0.5 の場合、確定結果として1件表示される
- [x] 信頼度 < 0.5 の場合、候補リストが最大3件表示される
- [x] 花が見つからない場合、適切なメッセージが表示される
- [x] 日本語名が3段階フォールバックで正しく取得される
- [x] PlantNet commonNames に日本語名がない場合、Wikipedia検索で日本語名が取得される
- [x] 判定中にローディングアニメーションが表示される
- [x] APIエラー時に適切なエラーメッセージが表示される
- [x] locationDefaultOn = ON の場合、場所選択ステップが表示される
- [x] locationDefaultOn = OFF の場合、場所選択ステップがスキップされ即保存される
- [x] APIキーがクライアントに露出しない
