# Shop Flow UI 设计指南

## 概述

本文档定义 Shop Flow 项目整体（Web Dashboard、Storefront、Learning Platform）的统一 UI/UX 设计标准。

---

## 1. 设计系统基础

### 1.1 组件库

采用 **shadcn/ui**
- 样式: `new-york`
- 基础颜色: `neutral`
- CSS 变量: 启用
- 图标: Lucide React

### 1.2 框架结构

```
apps/
├── web/          # 管理后台 (Next.js 16)
├── storefront/   # 在线商店 (Next.js 15)
└── learning/     # 学习平台 (Next.js 15)
```

---

## 2. 颜色系统

### 2.1 Web Dashboard (管理后台)

**主题: Green (绿色)**

#### 浅色模式
```css
--background: hsl(144, 18%, 94.5%)  /* #EEF4F1 淡绿背景 */
--primary: hsl(142.1, 76.2%, 36.3%)  /* 鲜绿色 */
--muted: hsl(142, 24%, 93%)
```

#### 深色模式
```css
--background: hsl(20, 14.3%, 4.1%)
--primary: hsl(142.1, 70.6%, 45.3%)
--muted: hsl(142, 15%, 18%)
```

### 2.2 Storefront (在线商店)

**主题: Soft Mint (软薄荷)**

OKLCH 色彩空间

#### 浅色模式
```css
--background: oklch(0.985 0.02 148)  /* 软薄荷背景 */
--primary: oklch(0.65 0.18 155)      /* 绿色 */
```

#### 深色模式
```css
--background: oklch(0.16 0.02 148)
--primary: oklch(0.7 0.18 155)
```

### 2.3 Learning Platform (学习平台)

**主题: Brand Green (#00AC4D)**

#### 浅色模式
```css
--background: hsl(0, 0%, 100%)       /* 纯白背景 */
--primary: hsl(147, 100%, 34%)       /* #00AC4D */
--foreground: hsl(147, 60%, 10%)     /* 深绿文字 */
```

#### 深色模式
```css
--background: hsl(147, 50%, 6%)      /* 深绿背景 */
--primary: hsl(147, 80%, 45%)
--foreground: hsl(147, 10%, 98%)
```

---

## 3. 字体系统

### 3.1 字体族

```typescript
// 全应用通用
import { Geist, Geist_Mono } from "next/font/google";
```

### 3.2 字体大小层级

| 用途 | 大小 | 类名 |
|------|------|------|
| 标题1 | 3xl-7xl | `text-4xl md:text-5xl lg:text-7xl` |
| 标题2 | 2xl-4xl | `text-2xl md:text-3xl` |
| 标题3 | xl-2xl | `text-xl font-bold` |
| 正文 | base-lg | `text-base md:text-lg` |
| 小字 | sm | `text-sm` |
| 说明 | xs | `text-xs` |

---

## 4. 组件标准

### 4.1 Button (按钮)

#### 变体
```tsx
<Button variant="default">保存</Button>
<Button variant="destructive">删除</Button>
<Button variant="outline">取消</Button>
<Button variant="ghost">详情</Button>
<Button variant="link">查看更多</Button>
```

#### 尺寸
```tsx
<Button size="sm">小</Button>
<Button size="default">标准</Button>
<Button size="lg">大</Button>
<Button size="icon">🔍</Button>
```

### 4.2 Card (卡片)

```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>
    <Button>操作</Button>
  </CardFooter>
</Card>
```

### 4.3 Badge (徽章)

```tsx
<Badge variant="default">新</Badge>
<Badge variant="secondary">进行中</Badge>
<Badge variant="outline">完成</Badge>
<Badge variant="destructive">错误</Badge>
```

---

## 5. 布局模式

### 5.1 Dashboard Layout (管理后台布局)

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

**特点:**
- 侧边栏固定宽度: `256px`
- 响应式: 移动端隐藏侧边栏
- 内容边距: `px-0 md:px-8`

### 5.2 Container (容器)

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 1280px;
}
```

---

## 6. 间距规范

### 6.1 区块间距

```tsx
// 小: 移动端 12, 桌面端 16
className="py-12 md:py-16"

// 中: 移动端 16, 桌面端 24
className="py-16 md:py-24"

// 大: 移动端 24, 桌面端 32
className="py-24 md:py-32"
```

### 6.2 元素间距

```tsx
// 密: 1-2
className="space-y-1.5"

// 标准: 4-6
className="space-y-4"

// 宽: 8-12
className="space-y-8"
```

---

## 7. 动画

### 7.1 过渡

```tsx
// 悬停效果
className="transition-colors hover:bg-accent"

// 全属性
className="transition-all hover:shadow-lg"
```

### 7.2 侧边栏动画

```css
@keyframes slide-in-from-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

---

## 8. 响应式设计

### 8.1 断点

| 尺寸 | 宽度 | 用途 |
|------|------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板 |
| lg | 1024px | 笔记本 |
| xl | 1280px | 桌面 |
| 2xl | 1536px | 大屏 |

### 8.2 响应式模式

```tsx
// 移动优先
<div className="flex flex-col md:flex-row gap-4">

// 网格布局
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
```

---

## 9. 图标使用

### 9.1 Lucide React

```tsx
import { ArrowRight, Check, X, Search } from "lucide-react";

// 标准尺寸
<ArrowRight className="h-4 w-4" />

// 大尺寸
<Check className="h-6 w-6" />
```

### 9.2 图标位置

```tsx
// 按钮右侧
<Button>
  下一步
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

// 按钮左侧
<Button>
  <Check className="mr-2 h-4 w-4" />
  完成
</Button>
```

---

## 10. 表单设计

### 10.1 基本结构

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="email">邮箱</Label>
    <Input id="email" required />
  </div>
  
  <div className="flex gap-4">
    <Button type="submit">提交</Button>
    <Button type="button" variant="outline">取消</Button>
  </div>
</form>
```

---

## 11. 主题切换

### 11.1 主题提供者

```tsx
<ThemeProvider>
  {children}
</ThemeProvider>
```

### 11.2 深色模式支持

```tsx
// 条件样式
className="bg-white dark:bg-card"
className="text-gray-900 dark:text-gray-100"

// CSS变量（推荐）
className="bg-background text-foreground"
```

---

## 12. 可访问性

### 12.1 必需属性

```tsx
// 标签关联
<Label htmlFor="email">邮箱</Label>
<Input id="email" />

// ARIA属性
<Button aria-label="打开菜单">
  <Menu className="h-4 w-4" />
</Button>
```

### 12.2 键盘导航

- 所有交互元素可通过 `Tab` 访问
- 焦点状态清晰显示: `focus-visible:ring-2`
- `Enter`/`Space` 可操作按钮

---

## 13. 性能优化

### 13.1 图片优化

```tsx
<Image
  src="/logo.png"
  alt="标志"
  width={400}
  height={120}
  priority
/>
```

### 13.2 动态导入

```tsx
const HeavyComponent = dynamic(
  () => import('@/components/heavy-component'),
  { loading: () => <Skeleton /> }
);
```

---

## 14. 组件清单

### 14.1 Web Dashboard

**37个组件:**
- alert, alert-dialog, avatar, badge, breadcrumb
- button, calendar, card, checkbox, command
- dialog, dropdown-menu, form, input, label
- pagination, popover, progress, radio-group
- scroll-area, select, separator, sheet, skeleton
- sonner, switch, table, tabs, textarea, tooltip
- address-input, file-input, search-input
- sortable-table-head, highlight-text

### 14.2 Learning Platform

**19个组件:**
- accordion, avatar, badge, button, card
- checkbox, dialog, dropdown-menu, input, label
- navigation-menu, progress, scroll-area, select
- separator, sheet, skeleton, sonner, tabs

### 14.3 Storefront

**11个组件:**
- address-input, avatar, badge, button, card
- checkbox, dropdown-menu, input, label
- separator, textarea

---

## 15. 自定义组件

### 15.1 Sidebar (侧边栏)

```tsx
<Sidebar 
  allowedFeatureIds={permissions}
  isMobile={false}
  onNavigate={() => {}}
/>
```

**特点:**
- 基于权限的过滤
- 区段折叠功能
- 活跃状态自动检测

### 15.2 FeatureGuard (功能守卫)

```tsx
<FeatureGuard allowedFeatureIds={permissions}>
  {children}
</FeatureGuard>
```

无权限用户显示403错误

---

## 16. 通知系统

### 16.1 Toast (提示)

```tsx
import { toast } from "sonner";

toast.success("保存成功");
toast.error("发生错误");
toast.info("处理中...");
```

### 16.2 配置

```tsx
<Toaster 
  richColors 
  position="top-right" 
/>
```

---

## 17. 网格系统

### 17.1 响应式网格

```tsx
// 2列 → 3列
<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

// 自动适配
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
```

---

## 18. 阴影系统

```tsx
className="shadow-sm"    // 小
className="shadow"      // 标准
className="shadow-md"    // 中
className="shadow-lg"    // 大
className="shadow-xl"    // 特大
```

---

## 19. 圆角

### 19.1 标准值

```css
--radius: 0.5rem;      // Web Dashboard
--radius: 0.75rem;     // Learning Platform
--radius: 0.625rem;    // Storefront
```

### 19.2 使用

```tsx
className="rounded-md"    // 标准
className="rounded-lg"    // 大
className="rounded-xl"    // 特大
className="rounded-full"  // 完全圆角
```

---

## 20. 最佳实践

### 20.1 命名规范

- 组件: PascalCase (`Button`, `UserCard`)
- 文件: kebab-case (`user-card.tsx`)
- CSS变量: kebab-case (`--primary-foreground`)

### 20.2 代码结构

```tsx
// 1. 导入
import React from "react";
import { cn } from "@/lib/utils";

// 2. 类型
type Props = { /* ... */ };

// 3. 组件
export function Component({ }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. 处理函数
  const handleClick = () => {};
  
  // 6. 渲染
  return <div />;
}
```

### 20.3 样式

```tsx
// ✅ 推荐: cn() 结合类名
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />
```

---

## 21. 未来扩展

### 21.1 计划功能

- [ ] 深色模式自动切换
- [ ] 自定义主题编辑器
- [ ] 组件故事书
- [ ] 设计令牌JSON导出

### 21.2 改进项目

- Tailwind CSS v4 完全迁移
- 动画库统一
- 性能监控

---

## 附录

### A. 实用工具

```typescript
// cn() - 类名结合
import { cn } from "@/lib/utils";

// cva() - 变体管理
import { cva } from "class-variance-authority";
```

### B. 参考链接

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/)

---

**最后更新:** 2026年1月  
**版本:** 1.0.0
