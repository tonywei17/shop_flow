# Shop Flow UI デザインガイド

## 概要

このドキュメントは、Shop Flow プロジェクト全体（Web Dashboard、Storefront、Learning Platform）における統一されたUI/UXデザイン標準を定義します。

---

## 1. デザインシステム基盤

### 1.1 コンポーネントライブラリ

**shadcn/ui** を採用
- スタイル: `new-york`
- ベースカラー: `neutral`
- CSS変数: 有効
- アイコン: Lucide React

### 1.2 フレームワーク構成

```
apps/
├── web/          # 管理ダッシュボード (Next.js 16)
├── storefront/   # オンラインストア (Next.js 15)
└── learning/     # 学習プラットフォーム (Next.js 15)
```

---

## 2. カラーシステム

### 2.1 Web Dashboard (管理画面)

**テーマ: Green (緑)**

#### Light Mode
```css
--background: hsl(144, 18%, 94.5%)  /* #EEF4F1 淡い緑背景 */
--primary: hsl(142.1, 76.2%, 36.3%)  /* 鮮やかな緑 */
--muted: hsl(142, 24%, 93%)
```

#### Dark Mode
```css
--background: hsl(20, 14.3%, 4.1%)
--primary: hsl(142.1, 70.6%, 45.3%)
--muted: hsl(142, 15%, 18%)
```

### 2.2 Storefront (オンラインストア)

**テーマ: Soft Mint (ソフトミント)**

OKLCH カラースペース使用

#### Light Mode
```css
--background: oklch(0.985 0.02 148)  /* ソフトミント背景 */
--primary: oklch(0.65 0.18 155)      /* 緑 */
--card: oklch(0.995 0.015 148)
```

#### Dark Mode
```css
--background: oklch(0.16 0.02 148)
--primary: oklch(0.7 0.18 155)
```

### 2.3 Learning Platform (学習プラットフォーム)

**テーマ: Brand Green (#00AC4D)**

#### Light Mode
```css
--background: hsl(0, 0%, 100%)       /* 純白背景 */
--primary: hsl(147, 100%, 34%)       /* #00AC4D */
--foreground: hsl(147, 60%, 10%)     /* 濃い緑テキスト */
```

#### Dark Mode
```css
--background: hsl(147, 50%, 6%)      /* 深緑背景 */
--primary: hsl(147, 80%, 45%)
--foreground: hsl(147, 10%, 98%)
```

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

```typescript
// 全アプリ共通
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### 3.2 フォントサイズ階層

| 用途 | サイズ | クラス |
|------|--------|--------|
| 見出し1 | 3xl-7xl | `text-4xl md:text-5xl lg:text-7xl` |
| 見出し2 | 2xl-4xl | `text-2xl md:text-3xl` |
| 見出し3 | xl-2xl | `text-xl font-bold` |
| 本文 | base-lg | `text-base md:text-lg` |
| 小文字 | sm | `text-sm` |
| キャプション | xs | `text-xs` |

---

## 4. コンポーネント標準

### 4.1 Button (ボタン)

#### バリアント

```tsx
// Default - プライマリアクション
<Button variant="default">保存</Button>

// Destructive - 削除など危険な操作
<Button variant="destructive">削除</Button>

// Outline - セカンダリアクション
<Button variant="outline">キャンセル</Button>

// Ghost - 控えめなアクション
<Button variant="ghost">詳細</Button>

// Link - テキストリンク風
<Button variant="link">もっと見る</Button>
```

#### サイズ

```tsx
<Button size="sm">小</Button>
<Button size="default">標準</Button>
<Button size="lg">大</Button>
<Button size="icon">🔍</Button>
```

#### 使用例

```tsx
// アイコン付き
<Button size="lg" className="gap-2">
  無料で始める
  <ArrowRight className="h-4 w-4" />
</Button>

// ローディング状態
<Button disabled>
  処理中...
</Button>
```

### 4.2 Card (カード)

```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
  <CardFooter>
    <Button>アクション</Button>
  </CardFooter>
</Card>
```

**スタイリング特徴:**
- `rounded-xl` - 大きめの角丸
- `border` - 境界線
- `shadow` - 影効果
- `p-6` - 標準パディング

### 4.3 Badge (バッジ)

```tsx
<Badge variant="default">新着</Badge>
<Badge variant="secondary">進行中</Badge>
<Badge variant="outline">完了</Badge>
<Badge variant="destructive">エラー</Badge>
```

### 4.4 Input (入力フィールド)

```tsx
<div className="space-y-2">
  <Label htmlFor="email">メールアドレス</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="example@email.com"
  />
</div>
```

---

## 5. レイアウトパターン

### 5.1 Dashboard Layout (管理画面)

```tsx
<div className="flex h-screen w-full overflow-hidden bg-background">
  <Sidebar />
  <main className="flex flex-1 flex-col min-w-0 overflow-y-auto md:ml-[268px]">
    <div className="flex-1 px-0 pb-12 pt-4 md:px-8">
      {children}
    </div>
  </main>
</div>
```

**特徴:**
- サイドバー固定幅: `256px`
- レスポンシブ: モバイルでサイドバー非表示
- コンテンツ余白: `px-0 md:px-8`

### 5.2 Landing Page Layout (ランディングページ)

```tsx
<div className="min-h-screen bg-background">
  <Header />
  
  {/* Hero Section */}
  <section className="py-16 md:py-24">
    <div className="container mx-auto px-4">
      {/* Content */}
    </div>
  </section>
  
  {/* Features Section */}
  <section className="py-12 md:py-16">
    {/* ... */}
  </section>
</div>
```

### 5.3 Container (コンテナ)

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 1280px;
}

@media (min-width: 1536px) {
  .container {
    max-width: 1400px;
  }
}
```

---

## 6. スペーシング規則

### 6.1 セクション間隔

```tsx
// 小: モバイル 12, デスクトップ 16
className="py-12 md:py-16"

// 中: モバイル 16, デスクトップ 24
className="py-16 md:py-24"

// 大: モバイル 24, デスクトップ 32
className="py-24 md:py-32"
```

### 6.2 要素間隔

```tsx
// 密: 1-2
className="space-y-1.5"

// 標準: 4-6
className="space-y-4"

// 広: 8-12
className="space-y-8"
```

---

## 7. アニメーション

### 7.1 トランジション

```tsx
// ホバー効果
className="transition-colors hover:bg-accent"

// 全プロパティ
className="transition-all hover:shadow-lg"

// カスタムイージング
className="transition-all duration-300 ease-in-out"
```

### 7.2 Sidebar アニメーション

```css
@keyframes slide-in-from-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.sidebar-drawer {
  --sidebar-drawer-duration: 300ms;
  --sidebar-drawer-easing: cubic-bezier(0.32, 0.72, 0, 1);
}
```

---

## 8. レスポンシブデザイン

### 8.1 ブレークポイント

| サイズ | 幅 | 用途 |
|--------|-----|------|
| sm | 640px | スマートフォン横 |
| md | 768px | タブレット |
| lg | 1024px | ラップトップ |
| xl | 1280px | デスクトップ |
| 2xl | 1536px | 大画面 |

### 8.2 レスポンシブパターン

```tsx
// モバイルファースト
<div className="flex flex-col md:flex-row gap-4">

// グリッドレイアウト
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

// 条件表示
<div className="hidden md:block">
```

---

## 9. アイコン使用規則

### 9.1 Lucide React

```tsx
import { ArrowRight, Check, X, Search } from "lucide-react";

// 標準サイズ
<ArrowRight className="h-4 w-4" />

// 大きめ
<Check className="h-6 w-6" />

// カラー
<Search className="h-4 w-4 text-primary" />
```

### 9.2 アイコン配置

```tsx
// ボタン内 - 右
<Button>
  次へ
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

// ボタン内 - 左
<Button>
  <Check className="mr-2 h-4 w-4" />
  完了
</Button>

// アイコンのみ
<Button size="icon">
  <Search className="h-4 w-4" />
</Button>
```

---

## 10. フォーム設計

### 10.1 基本構造

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="name">名前</Label>
    <Input id="name" required />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="email">メールアドレス</Label>
    <Input id="email" type="email" required />
  </div>
  
  <div className="flex gap-4">
    <Button type="submit">送信</Button>
    <Button type="button" variant="outline">キャンセル</Button>
  </div>
</form>
```

### 10.2 バリデーション表示

```tsx
// エラー状態
<Input 
  aria-invalid="true"
  className="border-destructive"
/>
<p className="text-sm text-destructive">
  このフィールドは必須です
</p>
```

---

## 11. テーマ切り替え

### 11.1 ThemeProvider 設定

```tsx
import { ThemeProvider } from "@/components/theme-provider";

<ThemeProvider>
  {children}
</ThemeProvider>
```

### 11.2 ダークモード対応

```tsx
// 条件付きスタイル
className="bg-white dark:bg-card"
className="text-gray-900 dark:text-gray-100"

// CSS変数使用（推奨）
className="bg-background text-foreground"
```

---

## 12. アクセシビリティ

### 12.1 必須属性

```tsx
// ラベル関連付け
<Label htmlFor="email">メール</Label>
<Input id="email" />

// ARIA属性
<Button aria-label="メニューを開く">
  <Menu className="h-4 w-4" />
</Button>

// 状態表示
<div role="status" aria-live="polite">
  読み込み中...
</div>
```

### 12.2 キーボードナビゲーション

- すべてのインタラクティブ要素は `Tab` でアクセス可能
- フォーカス状態を明確に表示: `focus-visible:ring-2`
- `Enter` / `Space` でボタン操作可能

---

## 13. パフォーマンス最適化

### 13.1 画像最適化

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="ロゴ"
  width={400}
  height={120}
  priority  // Above the fold
/>
```

### 13.2 動的インポート

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/heavy-component'),
  { loading: () => <Skeleton /> }
);
```

---

## 14. コンポーネント一覧

### 14.1 Web Dashboard

**37個のコンポーネント:**
- alert, alert-dialog, avatar, badge, breadcrumb
- button, calendar, card, checkbox, command
- dialog, dropdown-menu, form, input, label
- pagination, popover, progress, radio-group
- scroll-area, select, separator, sheet, skeleton
- sonner, switch, table, tabs, textarea, tooltip
- address-input, file-input, search-input
- sortable-table-head, highlight-text

### 14.2 Learning Platform

**19個のコンポーネント:**
- accordion, avatar, badge, button, card
- checkbox, dialog, dropdown-menu, input, label
- navigation-menu, progress, scroll-area, select
- separator, sheet, skeleton, sonner, tabs

### 14.3 Storefront

**11個のコンポーネント:**
- address-input, avatar, badge, button, card
- checkbox, dropdown-menu, input, label
- separator, textarea

---

## 15. カスタムコンポーネント

### 15.1 Sidebar (サイドバー)

```tsx
<Sidebar 
  allowedFeatureIds={permissions}
  isMobile={false}
  onNavigate={() => {}}
/>
```

**特徴:**
- 権限ベースのフィルタリング
- セクション折りたたみ機能
- アクティブ状態の自動検出

### 15.2 FeatureGuard (機能ガード)

```tsx
<FeatureGuard allowedFeatureIds={permissions}>
  {children}
</FeatureGuard>
```

権限のないユーザーに403エラー表示

---

## 16. 通知システム

### 16.1 Toast (Sonner)

```tsx
import { toast } from "sonner";

// 成功
toast.success("保存しました");

// エラー
toast.error("エラーが発生しました");

// 情報
toast.info("処理中です");

// カスタム
toast("カスタムメッセージ", {
  description: "詳細情報",
  action: {
    label: "元に戻す",
    onClick: () => {}
  }
});
```

### 16.2 配置

```tsx
<Toaster 
  richColors 
  position="top-right" 
/>
```

---

## 17. グリッドシステム

### 17.1 レスポンシブグリッド

```tsx
// 2カラム → 3カラム
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

// 自動フィット
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">

// 不均等グリッド
<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
```

---

## 18. Shadow (影) システム

```tsx
// 小
className="shadow-sm"

// 標準
className="shadow"

// 中
className="shadow-md"

// 大
className="shadow-lg"

// 特大
className="shadow-xl"

// カスタム
className="shadow-lg shadow-primary/25"
```

---

## 19. Border Radius (角丸)

### 19.1 標準値

```css
--radius: 0.5rem;      /* Web Dashboard */
--radius: 0.75rem;     /* Learning Platform */
--radius: 0.625rem;    /* Storefront */
```

### 19.2 使用例

```tsx
className="rounded-md"    // 標準
className="rounded-lg"    // 大
className="rounded-xl"    // 特大
className="rounded-full"  // 完全な円
```

---

## 20. ベストプラクティス

### 20.1 命名規則

- コンポーネント: PascalCase (`Button`, `UserCard`)
- ファイル名: kebab-case (`user-card.tsx`)
- CSS変数: kebab-case (`--primary-foreground`)

### 20.2 コード構成

```tsx
// 1. Imports
import React from "react";
import { cn } from "@/lib/utils";

// 2. Types
type Props = {
  // ...
};

// 3. Component
export function Component({ }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {};
  
  // 6. Render
  return <div />;
}
```

### 20.3 スタイリング

```tsx
// ✅ 推奨: cn() でクラス結合
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />

// ❌ 非推奨: 文字列連結
<div className={`base ${condition ? 'active' : ''}`} />
```

---

## 21. 今後の拡張

### 21.1 計画中の機能

- [ ] ダークモード自動切り替え
- [ ] カスタムテーマエディタ
- [ ] コンポーネントストーリーブック
- [ ] デザイントークンのJSON出力

### 21.2 改善項目

- Tailwind CSS v4 への完全移行
- アニメーションライブラリの統一
- パフォーマンスモニタリング

---

## 付録

### A. 便利なユーティリティ

```typescript
// cn() - クラス名結合
import { cn } from "@/lib/utils";

cn("base", condition && "conditional", className)

// cva() - バリアント管理
import { cva } from "class-variance-authority";

const buttonVariants = cva("base", {
  variants: {
    variant: {
      default: "...",
      outline: "..."
    }
  }
});
```

### B. 参考リンク

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/)

---

**最終更新:** 2026年1月
**バージョン:** 1.0.0
