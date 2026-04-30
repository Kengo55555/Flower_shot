# 13. 月間サマリー・バッジ（Phase 2）

依存関係: 07（保存機能）、09（図鑑一覧）

---

## 概要

子どものやる気を引き出すゲーミフィケーション機能。月間の撮影数・種類数の表示と、達成バッジを実装する。

---

## 実装タスク

### 13.1 バッジ定義（src/constants/index.ts に追加）

- [ ] バッジの定義
  ```typescript
  export interface Badge {
    id: string;
    name: string;          // ひらがな表記
    description: string;   // ひらがな表記
    requiredCount: number; // 必要な種類数
    icon: string;          // 絵文字 or アイコンパス
  }

  export const BADGES: Badge[] = [
    { id: "beginner",    name: "はじめての はっけん",     description: "はじめて おはなを みつけたよ！",     requiredCount: 1,  icon: "🌱" },
    { id: "explorer",    name: "はじめての ぼうけんしゃ", description: "5しゅるいの おはなを みつけたよ！",   requiredCount: 5,  icon: "🌼" },
    { id: "collector",   name: "おはな コレクター",       description: "10しゅるいの おはなを みつけたよ！",  requiredCount: 10, icon: "💐" },
    { id: "master",      name: "はな マスター",           description: "20しゅるいの おはなを みつけたよ！",  requiredCount: 20, icon: "🏆" },
    { id: "expert",      name: "はな はかせ",             description: "50しゅるいの おはなを みつけたよ！",  requiredCount: 50, icon: "🎓" },
  ];
  ```

### 13.2 月間サマリーコンポーネント（src/components/gamification/MonthlySummary.tsx）

- [ ] Props
  ```typescript
  interface MonthlySummaryProps {
    records: FlowerRecord[];
  }
  ```
- [ ] 集計ロジック（クライアントサイドで計算）
  - 今月の撮影回数
  - 今月発見した花の種類数（`flowerNameOriginal` のユニーク数）
  - 累計の花の種類数
- [ ] 表示レイアウト
  - カード形式、パステルカラー背景
  - 「こんげつの きろく」タイトル
  - 大きな数字で種類数を表示（「{N}しゅるい みつけたよ！」）
  - 撮影回数（「{N}かい さつえいしたよ」）
  - 先月との比較（「せんげつより {N}しゅるい おおいよ！」）
    - 先月より多い → 緑のテキスト + 上矢印
    - 先月以下 → 表示なし（ネガティブなフィードバックは出さない）

### 13.3 バッジ表示コンポーネント（src/components/gamification/BadgeDisplay.tsx）

- [ ] Props
  ```typescript
  interface BadgeDisplayProps {
    totalUniqueCount: number;  // 累計の花の種類数
  }
  ```
- [ ] 表示ロジック
  - 獲得済みバッジ: カラー表示 + 名前
  - 未獲得バッジ: グレーアウト + シルエット + 「あと{N}しゅるいで ゲット！」
- [ ] レイアウト: 横スクロール or グリッド（2列）

### 13.4 バッジ獲得アニメーション

- [ ] 新しいバッジを獲得した瞬間の演出
  - フルスクリーンのオーバーレイ
  - バッジアイコンが大きくバウンスしながら表示
  - 紙吹雪 or キラキラエフェクト（CSSアニメーション）
  - 「やったね！ '{バッジ名}' を ゲットしたよ！」テキスト
  - 「やったー！」ボタンで閉じる
- [ ] 獲得判定タイミング: レコード保存後に種類数を再計算し、新しいバッジ条件を満たしたら表示
- [ ] 既に表示済みのバッジは再表示しない（`localStorage` にフラグ保存）

### 13.5 効果音（オプション）

- [ ] バッジ獲得時にSE（効果音）を再生
  - `new Audio("/sounds/badge.mp3").play()`
  - フリー素材を使用（効果音ラボ等）
  - 音量は控えめ（0.3程度）
  - 端末がマナーモードの場合は自動的にミュート
- [ ] 設定画面に「おとを ならす」ON/OFFトグルを追加

### 13.6 HomePage への組み込み

- [ ] HomePage に MonthlySummary を配置（撮影ボタンの上部）
- [ ] HomePage に最近獲得したバッジを1件表示
- [ ] 「すべての バッジを みる」リンク → バッジ一覧表示（モーダル or 別画面）

---

## 完了条件

- 今月の撮影数・種類数が正しく表示される
- 累計種類数に応じてバッジが獲得される
- 新バッジ獲得時にアニメーション演出が表示される
- 未獲得バッジはグレーアウトで表示される
- HomePageにサマリーとバッジが組み込まれている
