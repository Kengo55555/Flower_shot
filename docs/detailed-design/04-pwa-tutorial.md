# 04. PWAチュートリアル

依存関係: 01（プロジェクト初期化）

---

## 概要

iOS SafariのITP制約によりIndexedDBデータが消える問題を防ぐため、ホーム画面追加（PWAインストール）を強く案内する。

---

## 実装タスク

### 4.1 PWAインストール状態検出（src/hooks/usePwaInstall.ts）

- [ ] `usePwaInstall()` フック作成
  ```typescript
  interface PwaInstallState {
    isInstalled: boolean;   // PWAとしてインストール済みか
    isIOS: boolean;         // iOS端末か
  }
  ```
- [ ] 検出ロジック実装
  ```typescript
  const isInstalled =
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  ```

### 4.2 チュートリアル画面（src/pages/TutorialPage.tsx）

- [ ] 画面レイアウト（縦スクロール、ステップ形式）
  - ステップ1: Safari の共有ボタンのイラスト + 説明
    - 「したの [共有] ボタンを タップしてね」
  - ステップ2: 「ホーム画面に追加」の選択イラスト + 説明
    - 「『ホームがめんに ついか』を えらんでね」
  - ステップ3: 追加完了のイラスト + 説明
    - 「できたら ホームがめんから ひらいてね！」
- [ ] 各ステップは大きなイラスト（CSS or SVG）で視覚的に説明
- [ ] 文字はすべてひらがな + ふりがな（RubyText使用）
- [ ] 「あとで やる」ボタン（ログイン画面へスキップ可能）
- [ ] すでにPWAインストール済みの場合はこの画面をスキップ

### 4.3 PWA未インストール警告バナー（src/components/common/PwaInstallBanner.tsx）

- [ ] バナーコンポーネント作成
  - 表示条件: `isInstalled === false && isIOS === true`
  - 表示位置: 画面上部に固定（sticky）
  - 背景色: 警告系（オレンジ or 黄色）
  - メッセージ: 「ホームがめんに ついかすると しゃしんが きえなくなるよ！」
  - 「くわしく」ボタン → TutorialPage へ遷移
  - 閉じるボタン（×）で一時的に非表示（セッション中のみ）
- [ ] レイアウトコンポーネントにバナーを組み込み（全画面共通で表示）

### 4.4 初回起動判定

- [ ] ログイン成功後のリダイレクト先を判定するロジック
  - PWA未インストール + 初回ログイン → `/tutorial` へ
  - PWA未インストール + 2回目以降 → `/` へ（バナーで警告）
  - PWAインストール済み → `/` へ
- [ ] 初回表示済みフラグは `localStorage` に保存（`flower_shot_tutorial_shown`）

### 4.5 ホーム画面追加後3日経過警告

- [ ] 要件定義書 §7.3 の「ホーム画面追加未実施で初回ログイン後3日経過」警告
  - Firestore `users/{uid}.firstLoginAt` と現在時刻を比較
  - 3日以上経過 + PWA未インストール → 保護者向け警告モーダル表示
  - 「ホームがめんに ついかしないと しゃしんが きえてしまうかも！」

---

## 完了条件

- iOS SafariでPWA未インストール状態を正しく検出できる
- 初回起動時にチュートリアル画面が表示される
- チュートリアルは「あとでやる」でスキップできる
- PWA未インストール時は全画面に警告バナーが表示される
- PWAインストール済みの場合はバナー・チュートリアルが表示されない
