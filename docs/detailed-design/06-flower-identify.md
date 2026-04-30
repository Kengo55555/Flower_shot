# 06. 花判定

依存関係: 05（カメラ撮影）

---

## 概要

撮影画像をPl@ntNet APIに送信し、花の名前を判定する。結果画面にて確定表示または候補リストを表示する。

---

## 実装タスク

### 6.1 Pl@ntNet API呼び出し（src/lib/plantnet.ts）

- [ ] `identifyFlower(imageFile: File): Promise<PlantNetResponse>` 関数を実装
  ```typescript
  interface PlantNetResult {
    score: number;
    species: {
      scientificNameWithoutAuthor: string;
      commonNames: string[];
    };
  }

  interface PlantNetResponse {
    results: PlantNetResult[];
  }
  ```
- [ ] API呼び出し実装
  ```typescript
  export async function identifyFlower(imageFile: File): Promise<PlantNetResponse> {
    const formData = new FormData();
    formData.append("images", imageFile);
    formData.append("organs", "flower");

    const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;
    const res = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=ja`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error(`PlantNet API error: ${res.status}`);
    return res.json();
  }
  ```
- [ ] エラーハンドリング
  - 404: 花が見つからない → 空のresultsとして処理
  - 429: レート制限超過 → 全体上限メッセージ
  - 500等: API障害 → リトライ案内メッセージ

### 6.2 判定結果の解析ロジック

- [ ] `parseIdentifyResult(response: PlantNetResponse)` 関数を実装
  ```typescript
  interface IdentifyResult {
    status: "found" | "candidates" | "not_found";
    topResult: { name: string; nameOriginal: string; confidence: number } | null;
    candidates: Candidate[];
  }
  ```
- [ ] 判定ロジック
  - `results` が空 → `status: "not_found"`
  - `results[0].score >= 0.5` → `status: "found"`、topResult に1件セット
  - `results[0].score < 0.5` → `status: "candidates"`、上位3件を candidates にセット
- [ ] 花の名前の取得優先順位
  1. `commonNames` に日本語名がある → それを使用
  2. 日本語名がない → `scientificNameWithoutAuthor` を使用
- [ ] ひらがな変換は Phase 1 ではスキップ（APIから取得した日本語名をそのまま表示）

### 6.3 判定結果画面（src/pages/ResultPage.tsx）

- [ ] CaptureContext から画像データを取得（なければ `/` にリダイレクト）
- [ ] 画面表示前に `usage-limit` チェック（08で詳細実装、ここではスタブ）
- [ ] API呼び出し中: `Loading` コンポーネントを表示
- [ ] 結果表示の分岐
  - `found`: ResultCard に確定結果を表示
  - `candidates`: CandidateList に候補リストを表示
  - `not_found`: 「おはなが みつからなかったよ」メッセージ
- [ ] アクションボタン
  - 「ほぞんする」ボタン（found / candidates で選択済みの場合）
  - 「もういちど さつえいする」ボタン → `/camera` へ
  - 「ホームに もどる」ボタン → `/` へ

### 6.4 結果カード（src/components/result/ResultCard.tsx）

- [ ] Props
  ```typescript
  interface ResultCardProps {
    flowerName: string;
    confidence: number;
    imageUrl: string;       // プレビュー用 Object URL
  }
  ```
- [ ] レイアウト
  - 撮影画像を大きく表示（角丸）
  - 花の名前を大きく表示（24px以上）
  - 信頼度をパーセントで表示（「{N}% のかくりつだよ」）
  - 特徴文は Phase 1 では省略（Wikipedia連携の DetailPage で代替）
- [ ] 背景色: 信頼度に応じてグラデーション（高→緑系、中→黄系）

### 6.5 候補リスト（src/components/result/CandidateList.tsx）

- [ ] Props
  ```typescript
  interface CandidateListProps {
    candidates: Candidate[];
    imageUrl: string;
    onSelect: (candidate: Candidate) => void;
  }
  ```
- [ ] レイアウト
  - 「このおはなかも？」のタイトル
  - 撮影画像（小さめ）
  - 候補カード（最大3件）を縦に並べる
    - 花の名前
    - 信頼度（%表示）
    - タップで選択 → 選択状態をハイライト
- [ ] 候補を選択すると「ほぞんする」ボタンが有効になる

### 6.6 ローディングアニメーション（src/components/common/Loading.tsx）

- [ ] 子供が楽しめるアニメーション
  - 花がくるくる回転するCSS アニメーション
  - メッセージ: 「おはなを しらべているよ...」
  - 文字がふわふわ揺れるアニメーション
- [ ] CSSアニメーションのみで実装（外部ライブラリ不使用）
- [ ] 5秒以上経過した場合: 「もうすこし まってね...」にメッセージ変更

### 6.7 エラー表示

- [ ] API エラー時の表示
  - 「うまく しらべられなかったよ。もういちど ためしてね」
  - 「もういちど さつえいする」ボタン
- [ ] ネットワークエラー時
  - 「インターネットに つながっていないみたい。でんぱの あるところで ためしてね」

---

## 完了条件

- 撮影画像をPl@ntNet APIに送信して判定結果が返る
- 信頼度 >= 0.5 の場合、確定結果として1件表示される
- 信頼度 < 0.5 の場合、候補リストが最大3件表示される
- 花が見つからない場合、適切なメッセージが表示される
- 判定中にローディングアニメーションが表示される
- APIエラー時に適切なエラーメッセージが表示される
