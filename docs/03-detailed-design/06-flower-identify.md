# 06. 花判定

依存関係: 05（カメラ撮影）

---

## 概要

撮影画像をPl@ntNet APIに送信し、花の名前を判定する。結果画面にて確定表示または候補リストを表示する。

**v2.0変更点**: APIは `/api/plantnet` 経由でアクセス（開発: Vite proxy、本番: Cloudflare Pages Functions）。ResultPageは判定→結果表示→場所選択→保存→完了の5ステップを1画面で管理。

---

## 実装タスク

### 6.1 Pl@ntNet API呼び出し（src/lib/plantnet.ts）

- [x] `identifyFlower(imageFile: File | Blob): Promise<PlantNetResponse>` 関数を実装
- [x] API呼び出し実装
  ```typescript
  const url = `/api/plantnet/v2/identify/all?include-related-images=false&no-reject=false&nb-results=5&lang=ja&type=kt&api-key=${apiKey}`;
  const res = await fetch(url, { method: "POST", body: formData });
  ```
- [x] エラーハンドリング（404 → 空results、その他 → エラーthrow）

### 6.2 判定結果の解析ロジック

- [x] `parseIdentifyResult(response: PlantNetResponse): IdentifyResult` 関数を実装
  - `results` が空 → `status: "not_found"`
  - `results[0].score >= 0.5` → `status: "found"`
  - `results[0].score < 0.5` → `status: "candidates"`（上位3件）
- [x] 日本語名抽出ロジック（`extractJapaneseName`）
  - `commonNames` に日本語文字を含む名前があればそれを使用
  - なければ `scientificNameWithoutAuthor` を使用

### 6.3 判定結果画面（src/pages/ResultPage.tsx）

- [x] 5ステップのステート管理（`type Step = "identifying" | "result" | "location" | "saving" | "done"`）
- [x] CaptureContext から画像データを取得（なければ `/` にリダイレクト）
- [x] Step1: `usage-limit` チェック + API呼び出し + Loading表示
- [x] Step2: 結果表示の分岐（found / candidates / not_found）
- [x] 「つぎへ → ばしょを きろくする」ボタンでStep3へ
- [x] Step3: 場所選択（GPS or 地図ピッカー）→ 詳細は16-location-picker.md
- [x] Step4: 保存中ローディング
- [x] Step5: 完了（「もっと くわしく」or「ホームに もどる」）

### 6.4 結果カード（src/components/result/ResultCard.tsx）

- [x] 撮影画像を大きく表示
- [x] 花の名前・学名・信頼度パーセントを表示

### 6.5 候補リスト（src/components/result/CandidateList.tsx）

- [x] 撮影画像 + 候補カード（最大3件）
- [x] タップで選択状態をハイライト
- [x] 候補選択後に「つぎへ」ボタンが有効化

### 6.6 ローディングアニメーション（src/components/common/Loading.tsx）

- [x] ローディングアニメーション実装
- [x] カスタムメッセージ対応（`message` prop）

### 6.7 エラー表示

- [x] API エラー時: 「うまく しらべられなかったよ。もういちど ためしてね」
- [x] 利用制限到達時の表示（ユーザー上限 / 全体上限）

---

## 完了条件

- [x] 撮影画像をPl@ntNet APIに送信して判定結果が返る
- [x] 信頼度 >= 0.5 の場合、確定結果として1件表示される
- [x] 信頼度 < 0.5 の場合、候補リストが最大3件表示される
- [x] 花が見つからない場合、適切なメッセージが表示される
- [x] 判定中にローディングアニメーションが表示される
- [x] APIエラー時に適切なエラーメッセージが表示される
- [x] 場所選択ステップへ正しく遷移する
