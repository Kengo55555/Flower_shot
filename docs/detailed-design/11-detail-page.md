# 11. 詳細ページ

依存関係: 09（図鑑一覧）

---

## 概要

花の詳細情報をWikipedia APIから取得し、アプリ内で子供にわかりやすく表示する。

---

## 実装タスク

### 11.1 Wikipedia API呼び出し（src/lib/wikipedia.ts）

- [ ] `getFlowerInfo(flowerName: string): Promise<WikipediaResult | null>` 関数を実装
  ```typescript
  interface WikipediaResult {
    title: string;
    extract: string;         // 要約テキスト
    pageUrl: string;         // 元記事URL
    thumbnailUrl?: string;   // サムネイル画像URL（あれば）
  }
  ```
- [ ] API呼び出し実装
  ```typescript
  export async function getFlowerInfo(flowerName: string): Promise<WikipediaResult | null> {
    const encodedName = encodeURIComponent(flowerName);
    const res = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodedName}`
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract,
      pageUrl: data.content_urls?.desktop?.page || "",
      thumbnailUrl: data.thumbnail?.source,
    };
  }
  ```
- [ ] フォールバック検索
  1. まず `commonNames` の日本語名で検索
  2. 見つからなければ `scientificNameWithoutAuthor` で検索
  3. それでも見つからなければ `null` を返す

### 11.2 詳細画面（src/pages/DetailPage.tsx）

- [ ] ルートパラメータから `recordId` を取得
- [ ] Firestore から該当レコードを取得（`getRecordById`）
- [ ] IndexedDB から画像を取得
- [ ] Wikipedia API から詳細情報を取得

- [ ] 画面レイアウト
  - 戻るボタン（画面左上）
  - 撮影画像（大きく表示、角丸）
  - 花の名前（24px以上、太字）
  - 撮影日時（「2026ねん 4がつ 30にち」形式）
  - 撮影場所（位置情報ありの場合: ミニマップ表示 or テキスト）
  - 判定信頼度（「{N}% のかくりつ」）
  - 区切り線
  - Wikipedia 要約セクション
  - 元記事リンク

### 11.3 Wikipedia 要約の表示

- [ ] 要約テキストを表示
  - 長文の場合は最初の200文字 + 「つづきを よむ」で展開
  - 文字サイズ: 本文18px
  - ひらがなのふりがなは Wikipedia テキストには付与しない（難しいため Phase 1 では割愛）
- [ ] Wikipedia サムネイル画像があれば表示
- [ ] 元記事へのリンク
  - 「Wikipedia で もっと しらべる」ボタン
  - `target="_blank"` + `rel="noopener noreferrer"`
  - ⚠️ 要件定義では外部リンクを避けるが、Wikipedia は教育目的のため例外として許可（保護者向けの注記を添える）

### 11.4 情報が見つからない場合

- [ ] Wikipedia で情報が見つからない場合の表示
  - 「くわしい じょうほうが みつからなかったよ」
  - 撮影画像と花名・日付は表示する（これらは Firestore データ）
  - Wikipedia セクションのみ非表示

### 11.5 レコード削除ボタン

- [ ] 画面下部に「このきろくを けす」ボタン（赤系の控えめなデザイン）
- [ ] タップ → 確認ダイアログ「このきろくを けしてもいい？」
- [ ] 削除実行 → Firestore + IndexedDB から削除 → 図鑑一覧に戻る

---

## 完了条件

- recordId に基づいて花の詳細情報が表示される
- 撮影画像・花名・日付・信頼度が正しく表示される
- Wikipedia の要約テキストが表示される
- Wikipedia に情報がない場合、適切なメッセージが表示される
- 元記事へのリンクが機能する
- レコードの削除ができる
