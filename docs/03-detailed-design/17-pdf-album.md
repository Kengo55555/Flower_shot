# 17. PDFアルバム出力（Phase 2.5）

依存関係: 07（保存機能）、09（図鑑一覧）

---

## 概要

撮影した花の記録をPDFアルバムとして出力する機能。図鑑画面から年別 or 全件で生成・ダウンロードできる。

---

## 実装タスク

### 17.1 PDFアルバム生成ロジック（src/lib/album.ts）

- [x] `generateAlbumPdf(records, year, onProgress): Promise<Blob>` 関数を実装
- [x] jsPDF ライブラリを使用（`npm install jspdf`）
- [x] 年フィルタ対応（year が null なら全件）
- [x] 日付昇順でソート

### 17.2 PDF構成

- [x] **表紙ページ**
  - 黄色背景（#FFF44F）
  - タイトル「Flower Shot」（36pt）
  - サブタイトル「{year} Album」or「All Album」（20pt）
  - 花の数「{N} flowers」（14pt）

- [x] **花のページ（1ページに2枚）**
  - A4縦（210mm x 297mm）
  - 上半分・下半分にそれぞれ1枚ずつ配置
  - 各スロット構成:
    - 画像（最大90mm x 65mm、アスペクト比維持）
    - 花の名前（16pt、中央揃え）
    - 学名（10pt、グレー、中央揃え）
    - 日付 + 信頼度%（10pt、グレー、中央揃え）
  - 上下の区切り線（薄いグレー）

### 17.3 画像の取得と埋め込み

- [x] IndexedDB から `photoLocalKey` or `record.id` で画像Blob取得
- [x] Blob → DataURL 変換（FileReader.readAsDataURL）
- [x] DataURL → Image でサイズ取得（width/height）
- [x] アスペクト比を維持してリサイズ（最大 90mm x 65mm）
- [x] `doc.addImage(dataUrl, "JPEG", x, y, w, h)` で埋め込み
- [x] 画像取得失敗時はスキップ（スペースのみ確保）

### 17.4 進捗コールバック

- [x] `onProgress(current, total)` で処理中の枚数を通知
- [x] CollectionPage側で「{current} / {total} まいめ...」と表示

### 17.5 CollectionPage への組み込み

- [x] 「アルバムを つくる（PDF）」ボタン（記録がある場合のみ表示）
- [x] `disabled` 状態で生成中は操作不可
- [x] 生成完了後に自動ダウンロード
  ```typescript
  const blob = await generateAlbumPdf(records, selectedYear, onProgress);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FlowerShot_${label}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  ```
- [x] エラー時: 「アルバムの さくせいに しっぱいしました」alert

### 17.6 ファイル名

- [x] 年指定時: `FlowerShot_{year}.pdf`
- [x] 全件時: `FlowerShot_All.pdf`

---

## 完了条件

- [x] 図鑑画面からPDFアルバムを生成できる
- [x] 表紙 + 花のページ（1ページ2枚）の構成でPDFが出力される
- [x] 年フィルタと連動する
- [x] 画像がPDFに正しく埋め込まれる
- [x] 生成中に進捗が表示される
- [x] 生成完了後に自動ダウンロードされる
