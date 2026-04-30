# 05. カメラ撮影

依存関係: 03（認証フロー）

---

## 概要

iOS Safariのカメラを起動して花を撮影する。撮影データを圧縮し、ResultPageに渡す。

**v2.0変更点**: 位置情報の取得はCameraPageではなくResultPage（場所選択ステップ）で行うフローに変更。CameraPageは撮影・プレビュー・圧縮に専念する。

---

## 実装タスク

### 5.1 CaptureContext（src/hooks/useCapture.tsx）

- [x] `CaptureContext` 作成
  ```typescript
  interface CaptureState {
    imageFile: File | null;
    compressedBlob: Blob | null;
    imagePreviewUrl: string | null;
    location: GeoLocation | null;
    isLocationRecorded: boolean;
  }
  ```
- [x] `setCaptureData()` / `clearCaptureData()` 関数を提供
- [x] `App.tsx` に `CaptureProvider` を追加

### 5.2 カメラ撮影画面（src/pages/CameraPage.tsx）

- [x] 画面レイアウト
  - 上部: Header「おはなを さつえいしよう！」（戻るボタン付き）
  - 中央: 撮影プレビューエリア（撮影前は花イラスト + メッセージ）
  - 中央下: 撮影ボタン（CaptureButton）
- [x] 撮影後のプレビュー表示
  - 「とりなおす」ボタン → CaptureContext クリア
  - 「この しゃしんで しらべる」ボタン → ResultPage へ遷移

### 5.3 撮影ボタン（src/components/camera/CaptureButton.tsx）

- [x] `<input type="file" accept="image/*" capture="environment">` を内包
- [x] ボタンデザイン（丸型、大きなタップ領域）
- [x] `onChange` で `File` オブジェクトを取得

### 5.4 画像圧縮（src/lib/image-utils.ts）

- [x] `compressImage(file: File): Promise<Blob>` 関数を実装
  - iOS の写真は大きいため、判定前にリサイズ
  - `canvas` を使った圧縮処理

### 5.5 撮影フロー（2段階）

- [x] HomePageの撮影ボタン: ファイル選択 → 圧縮 → CaptureContext セット → CameraPage へ遷移
- [x] CameraPage: プレビュー確認 → 「この しゃしんで しらべる」→ ResultPage へ遷移
- [x] CameraPageでも再撮影（CaptureButton）可能

### 5.6 圏外時の処理

- [x] `navigator.onLine` でネットワーク状態を確認
- [x] オフラインの場合: 「でんぱの あるところで もういちど ためしてね」alert表示

---

## 完了条件

- [x] 撮影ボタンタップでiOS Safariのカメラが起動する
- [x] 撮影後にプレビューが表示される
- [x] 画像が圧縮されてCaptureContextにセットされる
- [x] 圏外時に適切なメッセージが表示される
- [x] ResultPageへ正しく遷移する
