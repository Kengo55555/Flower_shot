# 05. カメラ撮影

依存関係: 03（認証フロー）

---

## 概要

iOS Safariのカメラを起動して花を撮影し、位置情報の取得有無を選択する。撮影データをResultPageに渡す。

---

## 実装タスク

### 5.1 CaptureContext（src/hooks/useCapture.ts または Context）

- [ ] `CaptureContext` 作成
  ```typescript
  interface CaptureState {
    imageFile: File | null;          // 撮影画像
    imagePreviewUrl: string | null;  // プレビュー用Object URL
    location: GeoLocation | null;    // 位置情報（nullなら記録なし）
    isLocationRecorded: boolean;     // 位置情報を記録したか
  }
  ```
- [ ] `setCaptureData()` / `clearCaptureData()` 関数を提供
- [ ] `App.tsx` に `CaptureProvider` を追加

### 5.2 カメラ撮影画面（src/pages/CameraPage.tsx）

- [ ] 画面レイアウト
  - 上部: 「おはなを さつえいしよう！」のタイトル（RubyText）
  - 中央: 撮影プレビューエリア（撮影前は花のイラストプレースホルダー）
  - 中央下: 撮影ボタン（CaptureButton コンポーネント）
  - 下部: 位置情報トグル
- [ ] 撮影後のプレビュー表示
  - 撮影した画像を大きくプレビュー
  - 「この しゃしんで しらべる」ボタン → ResultPage へ遷移
  - 「とりなおす」ボタン → プレビューをクリアして再撮影

### 5.3 撮影ボタン（src/components/camera/CaptureButton.tsx）

- [ ] `<input type="file" accept="image/*" capture="environment">` を内包
  - `input` は `display: none` にし、ボタンのクリックで `input.click()` を呼び出す
- [ ] ボタンデザイン
  - 丸型、直径80px以上
  - カメラアイコン + 「さつえい」ラベル
  - パステルピンク or グリーンの背景色
  - タップ時に軽いスケールアニメーション
- [ ] `onChange` で `File` オブジェクトを取得し、CaptureContext にセット
- [ ] 画像の圧縮処理
  - iOS の写真は大きいため、判定前に最大幅1024pxにリサイズ
  - `canvas` を使った圧縮処理を `src/lib/image-utils.ts` に実装
    ```typescript
    export async function compressImage(file: File, maxWidth: number): Promise<Blob>
    ```

### 5.4 位置情報取得（src/lib/geolocation.ts）

- [ ] `getCurrentLocation(): Promise<GeoLocation | null>` 関数を実装
  ```typescript
  export function getCurrentLocation(): Promise<GeoLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
        () => resolve(null),  // 拒否・エラー時はnull
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }
  ```

### 5.5 位置情報ON/OFFトグル

- [ ] CameraPage に位置情報トグルを配置
  - デフォルト値: `user.settings.locationDefaultOn` から取得
  - ラベル: 「ばしょを きろくする」（RubyText）
  - トグルスイッチUI（ON: 緑, OFF: グレー）
- [ ] ONの場合: 撮影確定時に `getCurrentLocation()` を呼び出し
- [ ] 位置情報の権限が拒否された場合: トグルをOFFに戻し、「ばしょの きろくが できなかったよ」と表示

### 5.6 CameraPage → ResultPage 遷移

- [ ] 「このしゃしんで しらべる」ボタンタップ時:
  1. CaptureContext に `imageFile`, `location`, `isLocationRecorded` をセット
  2. `navigate("/result")` で遷移
- [ ] ResultPage で CaptureContext が空（直接アクセス等）の場合は `/` にリダイレクト

### 5.7 圏外時の処理

- [ ] `navigator.onLine` でネットワーク状態を確認
- [ ] オフラインの場合: 「でんぱの あるところで もういちど ためしてね」メッセージを表示し、判定へ進まない

---

## 完了条件

- 撮影ボタンタップでiOS Safariのカメラが起動する
- 撮影後にプレビューが表示される
- 位置情報トグルのON/OFFが機能する
- 位置情報の権限拒否時にエラーにならない
- 撮影データがCaptureContext経由でResultPageに渡る
- 圏外時に適切なメッセージが表示される
