# 11. 詳細ページ

依存関係: 09（図鑑一覧）

---

## 概要

花の詳細情報をWikipedia APIから取得し、アプリ内で表示する。撮影記録の削除機能も提供。

---

## 実装タスク

### 11.1 Wikipedia API呼び出し（src/lib/wikipedia.ts）

- [x] `getFlowerInfo(flowerName: string): Promise<WikipediaResult | null>` 関数を実装
- [x] フォールバック検索（日本語名 → 学名）

### 11.2 詳細画面（src/pages/DetailPage.tsx）

- [x] ルートパラメータから `recordId` を取得
- [x] Firestore から該当レコードを取得
- [x] IndexedDB から画像を取得
- [x] Wikipedia API から詳細情報を取得
- [x] 画面レイアウト
  - 戻るボタン（Header）
  - 撮影画像（大きく表示）
  - 花の名前・学名
  - 撮影日時（「{Y}ねん {M}がつ {D}にち」形式）
  - 判定信頼度
  - Wikipedia 要約セクション
  - 元記事リンク

### 11.3 Wikipedia 要約の表示

- [x] 要約テキストを表示
- [x] 元記事へのリンク（外部遷移）

### 11.4 情報が見つからない場合

- [x] 「くわしい じょうほうが みつからなかったよ」メッセージ

### 11.5 レコード削除ボタン

- [x] 削除確認ダイアログ
- [x] Firestore + IndexedDB から削除
- [x] 削除後に図鑑一覧に戻る

---

## 完了条件

- [x] recordId に基づいて花の詳細情報が表示される
- [x] 撮影画像・花名・日付・信頼度が正しく表示される
- [x] Wikipedia の要約テキストが表示される
- [x] Wikipedia に情報がない場合、適切なメッセージが表示される
- [x] 元記事へのリンクが機能する
- [x] レコードの削除ができる
