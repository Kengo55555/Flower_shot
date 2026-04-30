# 09. 図鑑一覧

依存関係: 07（保存機能）

---

## 概要

これまでに撮影・保存した花をグリッド形式で一覧表示する。子どもがコレクション感覚で楽しめるデザインにする。

---

## 実装タスク

### 9.1 図鑑一覧画面（src/pages/CollectionPage.tsx）

- [ ] 画面レイアウト
  - ヘッダー: 「ずかん」タイトル + 累計種類数（「{N}しゅるい みつけたよ！」）
  - グリッド: 2列のカード表示（FlowerCard）
  - 空の場合: 「まだ おはなを みつけていないよ。さつえいしに いこう！」+ 撮影ボタンリンク
- [ ] データ取得
  - `useRecords()` フックで Firestore からレコード一覧を取得
  - 各レコードの `photoLocalKey` で IndexedDB から画像を取得
- [ ] ソート: `capturedAt` 降順（新しいものが上）
- [ ] ローディング中: スケルトンカード表示

### 9.2 図鑑カード（src/components/collection/FlowerCard.tsx）

- [ ] Props
  ```typescript
  interface FlowerCardProps {
    record: FlowerRecord;
    imageUrl: string | null;  // IndexedDB から取得した画像の Object URL
    onClick: () => void;
  }
  ```
- [ ] カードレイアウト
  - 画像サムネイル（正方形、角丸、`object-fit: cover`）
  - 画像なしの場合: 花のアイコンプレースホルダー（「しゃしんなし」）
  - 花の名前（太字、16px以上）
  - 撮影日（「4がつ 30にち」形式、ひらがな）
  - 位置情報なしの場合: 「ばしょなし」の小さなラベル
- [ ] タップで `/detail/{recordId}` へ遷移
- [ ] カード全体にタップ領域を設定（48px以上の高さ）

### 9.3 画像の非同期読み込み

- [ ] 各カードの画像を非同期で IndexedDB から読み込み
  ```typescript
  // カスタムフック or useEffect内で
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    getImage(record.photoLocalKey).then((blob) => {
      if (blob) setImageUrl(URL.createObjectURL(blob));
    });
    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); };
  }, [record.photoLocalKey]);
  ```
- [ ] Object URL のメモリリーク防止（`revokeObjectURL` をクリーンアップで実行）

### 9.4 重複排除（種類数カウント）

- [ ] 累計種類数は `flowerNameOriginal` の一意数でカウント
  ```typescript
  const uniqueCount = new Set(records.map(r => r.flowerNameOriginal)).size;
  ```
- [ ] 表示: 「ぜんぶで {uniqueCount}しゅるい みつけたよ！」

### 9.5 レコード削除機能

- [ ] カードを長押し or 詳細画面に「さくじょ」ボタンを配置
- [ ] 削除確認ダイアログ: 「このきろくを けしてもいい？」
- [ ] 削除処理:
  1. `deleteRecord(recordId)` で Firestore から削除
  2. `deleteImage(recordId)` で IndexedDB から画像削除
  3. 一覧を再取得

---

## 完了条件

- 保存済みの花がグリッド形式で一覧表示される
- 各カードに画像サムネイル・花名・日付が表示される
- 画像がない場合はプレースホルダーが表示される
- 累計種類数が正しくカウントされる
- カードタップで詳細ページに遷移する
- レコードの削除ができる
