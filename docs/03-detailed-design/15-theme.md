# 15. テーマカスタマイズ（Phase 2.5）

依存関係: 01（プロジェクト初期化）、12（設定画面）

---

## 概要

ユーザーがアプリの見た目（背景色・ボタン色・タイトルの花アイコン）をカスタマイズできる機能。設定はlocalStorageに保存し、ThemeProvider（React Context）で全画面にリアルタイム反映する。

---

## 実装タスク

### 15.1 テーマ状態管理（src/hooks/useTheme.tsx）

- [x] ThemeContext 作成
  ```typescript
  interface ThemeState {
    bgColor: string;      // デフォルト: "#FFF44F"（レモン）
    buttonColor: string;  // デフォルト: "#FF9CAD"（ピンク）
    emoji: string;        // デフォルト: "🌻"
  }
  ```
- [x] ThemeProvider 実装
  - localStorage から初期値をロード（キー: `flower_shot_theme`）
  - `setBgColor`, `setButtonColor`, `setEmoji` 関数を提供
  - 各変更時に localStorage へ自動保存
- [x] 背景色の適用: `document.body.style.backgroundColor` にリアルタイム反映（useEffect）
- [x] `useTheme()` フックを実装

### 15.2 ThemeProvider の配置

- [x] App.tsx の最外層（BrowserRouter の直下）に配置
  ```tsx
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <CaptureProvider>
          <Routes>...</Routes>
        </CaptureProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  ```

### 15.3 テーマ設定UI（SettingsPage内）

- [x] 背景色セクション
  - 7色のカラーパレット（各12x12のタップ領域）
  - 選択肢: レモン(#FFF44F), クリーム(#FFF8E7), 桜(#FFE4E8), 空(#E0F0FF), 緑(#E8F5E9), ラベンダー(#F3E5F5), 白(#FFFFFF)
  - 選択中: border強調 + scale-110
- [x] ボタン色セクション
  - 6色のカラーパレット
  - 選択肢: ピンク(#FF9CAD), 赤(#EF5350), オレンジ(#FFA726), 緑(#66BB6A), 青(#42A5F5), 紫(#AB47BC)
- [x] 花アイコンセクション
  - 8種の絵文字ボタン: 🌻, 🌸, 🌷, 🌹, 🌺, 💐, 🌼, 🏵
  - 選択中: border強調 + scale-110 + bg-gray-100

### 15.4 テーマの利用箇所

- [x] HomePage: タイトルに emoji を表示（`{emoji} Flower Shot {emoji}`）
- [x] 全画面: body背景色が bgColor で変更される

---

## 完了条件

- [x] 設定画面で背景色・ボタン色・花アイコンを変更できる
- [x] 変更が即時反映される（ページリロード不要）
- [x] 設定がlocalStorageに保存され、アプリ再起動後も維持される
- [x] ホーム画面のタイトルに選択した花アイコンが表示される
- [x] ThemeProvider が App.tsx で正しくラップされている
