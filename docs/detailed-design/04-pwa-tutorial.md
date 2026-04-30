# 04. PWAチュートリアル

依存関係: 01（プロジェクト初期化）

---

## 概要

iOS SafariのITP制約によりIndexedDBデータが消える問題を防ぐため、ホーム画面追加（PWAインストール）を案内する。

**v2.0変更点**: PWA未インストール警告バナー（PwaInstallBanner）は不要とし、実装しない。チュートリアル画面のみ実装。

---

## 実装タスク

### 4.1 PWAインストール状態検出（src/hooks/usePwaInstall.ts）

- [x] `usePwaInstall()` フック作成
- [x] 検出ロジック実装（`navigator.standalone` / `display-mode: standalone`）

### 4.2 チュートリアル画面（src/pages/TutorialPage.tsx）

- [x] 画面レイアウト（ステップ形式でPWAインストール手順を案内）
- [x] 文字はすべてひらがな
- [x] スキップ可能（ログイン画面へ遷移）
- [x] PWAインストール済みの場合はスキップ

### 4.3 PWA未インストール警告バナー

- ~~PwaInstallBanner は v2.0 で不要と決定。実装しない。~~

### 4.4 初回起動判定

- [x] チュートリアル表示済みフラグを `localStorage` に保存

---

## 完了条件

- [x] iOS SafariでPWA未インストール状態を正しく検出できる
- [x] チュートリアル画面が表示される
- [x] チュートリアルはスキップできる
- [x] PWAインストール済みの場合はチュートリアルが表示されない
