# 10. マップ表示

依存関係: 07（保存機能）

---

## 概要

撮影した花の位置を地図上にピンで表示する。ピンタップで花の情報をポップアップ表示する。

---

## 実装タスク

### 10.1 Leaflet導入

- [ ] `npm install leaflet react-leaflet` でインストール
- [ ] `npm install -D @types/leaflet` で型定義インストール
- [ ] `src/styles/index.css` に Leaflet の CSS をインポート
  ```css
  @import "leaflet/dist/leaflet.css";
  ```
- [ ] Leaflet のデフォルトアイコン画像のパス問題を修正（Vite環境での既知問題）
  ```typescript
  import L from "leaflet";
  import markerIcon from "leaflet/dist/images/marker-icon.png";
  import markerShadow from "leaflet/dist/images/marker-shadow.png";
  L.Marker.prototype.options.icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
  ```

### 10.2 マップ画面（src/pages/MapPage.tsx）

- [ ] 画面レイアウト
  - ヘッダー: 「おはな ちず」タイトル
  - 月フィルタ: 横スクロールの月選択ボタン（1月〜12月 + 「ぜんぶ」）
  - 地図: 画面の残り全体を使用
  - 位置情報ありの記録がゼロ件の場合: 地図の上にオーバーレイ「ばしょつきの きろくが まだないよ」
- [ ] データ取得
  - `useRecords()` から `isLocationRecorded === true` のレコードのみフィルタ
  - 月フィルタ選択時は `capturedAt` の月でさらにフィルタ

### 10.3 FlowerMap コンポーネント（src/components/map/FlowerMap.tsx）

- [ ] Props
  ```typescript
  interface FlowerMapProps {
    records: FlowerRecord[];  // 位置情報ありのレコードのみ
  }
  ```
- [ ] MapContainer の設定
  ```typescript
  <MapContainer
    center={[35.6762, 139.6503]}  // デフォルト: 東京
    zoom={13}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; OpenStreetMap contributors'
    />
    {/* ピンを描画 */}
  </MapContainer>
  ```
- [ ] 初期表示位置の決定
  - レコードがある場合: 全ピンが収まるboundsに自動フィット
  - レコードがない場合: デフォルト（東京）

### 10.4 ピンの表示

- [ ] 各レコードに対して `<Marker>` を配置
  ```typescript
  records.map((record) => (
    <Marker
      key={record.id}
      position={[record.location!.latitude, record.location!.longitude]}
    >
      <Popup>
        <FlowerPopup record={record} />
      </Popup>
    </Marker>
  ))
  ```
- [ ] カスタムアイコン（花のアイコン）の検討
  - シンプルな丸いピン（ピンク色）をCSS/SVGで作成
  - Leaflet の `L.divIcon` を使用

### 10.5 ポップアップ表示

- [ ] ピンタップ時のポップアップ内容
  - 花の名前（太字）
  - 撮影日
  - 「くわしく みる」リンク → `/detail/{recordId}`
- [ ] ポップアップのスタイルをアプリのテーマに合わせる（文字サイズ大きめ）

### 10.6 月フィルタ

- [ ] フィルタUIコンポーネント
  - 横スクロール可能なボタンリスト
  - 各ボタン: 「1がつ」〜「12がつ」+「ぜんぶ」
  - 選択中のボタンはハイライト（ピンク背景）
  - デフォルト: 「ぜんぶ」
- [ ] フィルタ変更時にピンを再描画（地図のboundsも再フィット）

### 10.7 OpenStreetMap利用ポリシー遵守

- [ ] attribution を必ず表示（Leaflet デフォルトで表示される）
- [ ] タイルサーバーへの過剰なリクエストを避ける（通常利用なら問題なし）

---

## 完了条件

- 位置情報付きのレコードが地図上にピンで表示される
- ピンタップでポップアップに花名・日付が表示される
- 月フィルタでピンを絞り込める
- 位置情報なしのレコードはマップに表示されない
- レコードが0件の場合に適切なメッセージが表示される
- OpenStreetMap の attribution が表示されている
