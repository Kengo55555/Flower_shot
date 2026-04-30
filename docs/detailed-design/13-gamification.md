# 13. 月間サマリー・バッジ（Phase 2）

依存関係: 07（保存機能）、09（図鑑一覧）

---

## 概要

子どものやる気を引き出すゲーミフィケーション機能。月間の撮影数・種類数の表示と、達成バッジを実装する。

---

## 実装タスク

### 13.1 バッジ定義（src/constants/index.ts）

- [x] バッジの定義（BADGES配列）
  ```typescript
  export const BADGES: Badge[] = [
    { id: "beginner",  name: "はじめての はっけん",     requiredCount: 1,  icon: "🌱" },
    { id: "explorer",  name: "はじめての ぼうけんしゃ", requiredCount: 5,  icon: "🌼" },
    { id: "collector", name: "おはな コレクター",       requiredCount: 10, icon: "💐" },
    { id: "master",    name: "はな マスター",           requiredCount: 20, icon: "🏆" },
    { id: "expert",    name: "はな はかせ",             requiredCount: 50, icon: "🎓" },
  ];
  ```

### 13.2 月間サマリーコンポーネント（src/components/gamification/MonthlySummary.tsx）

- [x] 今月の撮影回数・種類数を集計（クライアントサイド）
- [x] カード形式で表示
- [x] HomePageに配置（撮影ボタンの上部、記録がある場合のみ表示）

### 13.3 バッジ表示コンポーネント（src/components/gamification/BadgeDisplay.tsx）

- [x] 獲得済みバッジ: カラー表示
- [x] 未獲得バッジ: グレーアウト

### 13.4 HomePage への組み込み

- [x] HomePageに MonthlySummary を配置
- [x] テーマの花アイコン（emoji）をタイトルに表示

---

## 完了条件

- [x] 今月の撮影数・種類数が正しく表示される
- [x] 累計種類数に応じてバッジ定義が設定されている
- [x] HomePageにサマリーが組み込まれている
