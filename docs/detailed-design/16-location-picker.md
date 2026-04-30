# 16. 地図ピッカー（場所選択）（Phase 2.5）

依存関係: 06（花判定）、10（マップ表示）

---

## 概要

花の判定後に撮影場所を記録するための場所選択機能。GPS自動取得または地図タップで座標を選択できる。

**フロー変更**: v1.x のカメラ撮影時に位置情報を取得する方式から、判定結果表示後に場所選択ステップを挟む方式に変更。

---

## 実装タスク

### 16.1 場所選択フロー（ResultPage Step3）

- [x] ResultPage の Step3（location）で場所選択UIを表示
- [x] 「いまの ばしょ」ボタン: GPS自動取得
  - `geolocation.ts` の `getCurrentLocation()` を呼び出し
  - 取得中はボタンテキストが「とっているよ...」に変化
  - 取得失敗時: 「いちじょうほうが とれなかったよ。ちずから えらんでね」alert + 地図ピッカーを自動表示
- [x] 「ちずで えらぶ」ボタン: LocationPicker を表示
- [x] 場所設定済みの場合: 「ばしょを せっていしたよ」メッセージ表示
- [x] 保存ボタン2種:
  - 「ばしょつきで ほぞんする」（場所選択済みの場合のみ有効）
  - 「ばしょなしで ほぞんする」（常に有効）

### 16.2 LocationPicker コンポーネント（src/components/map/LocationPicker.tsx）

- [x] フルスクリーンモーダル（`fixed inset-0 z-50`）
- [x] ヘッダー:
  - 「✕」ボタン（閉じる）
  - タイトル「ばしょを えらんでね」
  - 「けってい」ボタン（座標が選択済みの場合のみ有効）
- [x] 案内テキスト: 「ちずを タップして ばしょを えらんでね」
- [x] Leaflet MapContainer
  - OpenStreetMap タイル
  - 初期中心: initialLocation or デフォルト（東京 35.6762, 139.6503）
  - 初期ズーム: 選択済み → 15、未選択 → 13
- [x] 地図タップで座標選択（MapClickHandler: useMapEvents click）
- [x] 選択した位置にMarker表示
- [x] 選択位置にマップ中心を移動（MoveToLocation: useMap setView）
- [x] Leaflet のデフォルトアイコン設定（marker-icon, marker-shadow の import）

### 16.3 Props インターフェース

```typescript
interface LocationPickerProps {
  initialLocation: GeoLocation | null;  // 既に選択済みの位置（再編集用）
  onSelect: (location: GeoLocation) => void;  // 決定時のコールバック
  onClose: () => void;  // 閉じる時のコールバック
}
```

### 16.4 位置情報取得（src/lib/geolocation.ts）

- [x] `getCurrentLocation(): Promise<GeoLocation | null>` 関数を実装
  - `navigator.geolocation.getCurrentPosition()` を使用
  - 権限拒否・エラー時は `null` を返す
  - オプション: `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 60000`

---

## 完了条件

- [x] 判定結果表示後に場所選択ステップが表示される
- [x] GPS自動取得で現在地の座標が取得できる
- [x] GPS取得失敗時に地図ピッカーが自動表示される
- [x] 地図タップで任意の場所を選択できる
- [x] 選択した場所にMarkerが表示される
- [x] 「けってい」ボタンで座標が確定される
- [x] 場所なしで保存することも可能
