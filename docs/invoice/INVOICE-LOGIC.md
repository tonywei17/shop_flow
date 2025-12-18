# 支局請求書（Branch Invoice）生成逻辑文档

> 最后更新：2025年12月19日

本文档详细说明**支局请求书**的生成逻辑、计算公式、数据来源和显示规则。

> **注意**：本文档仅适用于支局请求书。系统中还有其他类型的请求书，请参考相应文档。

---

## 目录

1. [概述](#概述)
2. [请求书结构](#请求书结构)
3. [第一页：汇总信息](#第一页汇总信息)
4. [第二页：明细信息](#第二页明细信息)
5. [计算公式](#计算公式)
6. [数据来源](#数据来源)
7. [特殊处理规则](#特殊处理规则)
8. [相关文件](#相关文件)

---

## 概述

**支局请求书**是向各支局发送的月度账单，用于结算该支局下属教室的会员费、教材费用等。

支局请求书包含以下主要内容：
- チャイルドクラブ会費（CC会员费）
- 教材お買い上げ（教材购买）
- その他お取引（其他交易）
- 各种调整和返金

请求书分为多页：
- **第一页**：汇总信息，显示各项金额和最终请求金额
- **第二页及后续**：明细信息，显示各教室的会员数、教材订单、其他费用等

---

## 请求书结构

### 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│                      ご 請 求 書                              │
│                   2025年11月1日〜2025年11月30日               │
├─────────────────────────────────────────────────────────────┤
│  お振込み依頼額  ¥XXX,XXX                                     │
├─────────────────────────────────────────────────────────────┤
│  前月ご請求額 a    │ チャイルドクラブ会費 ②  │ 教材販売割戻し ⑤ │
│  ¥0               │ ¥44,280                │ ¥8,046          │
├───────────────────┼────────────────────────┼─────────────────┤
│  ご入金額 b       │ 教材お買い上げ ③       │ 調整・ご返金 ⑥   │
│  ¥0               │ ¥88,506                │ ¥0              │
├───────────────────┼────────────────────────┼─────────────────┤
│  ご入金後残額 ①   │ その他 ④               │ 非課税分 ⑦       │
│  ¥0               │ (¥37,600)              │ ¥0              │
├─────────────────────────────────────────────────────────────┤
│  差し引き合計額 ⑧ = ① + ② + ③ + ④ + ⑦ - ⑤ - ⑥  │ ¥87,140   │
│  消費税額 ⑨ = (② + ③ + ④ - ⑤) × 10%            │ ¥8,714    │
│  ご請求額  ⑧ + ⑨                                 │ ¥95,854   │
└─────────────────────────────────────────────────────────────┘
```

---

## 第一页：汇总信息

### 金额项目说明

| 编号 | 项目名称 | 日文名称 | 说明 |
|------|----------|----------|------|
| a | 前月请求额 | 前月ご請求額 | 上月请求书的总金额 |
| b | 入金额 | ご入金額 | 本月收到的付款金额 |
| ① | 入金后余额 | ご入金後残額 | = a - b |
| ② | CC会员费 | チャイルドクラブ会費 | CC会员费总额 - 割戻し总额 |
| ③ | 教材购买 | 教材お買い上げ | **只计算支局购买的订单**请求额（不含税） |
| ④ | 其他 | その他 | 其他费用（課税分）+ 口座振替负数 |
| ⑤ | 教材销售返还 | 教材販売割戻し | **只计算教室购买的订单**マージン（一般価格-教室価格）×数量 |
| ⑥ | 调整・返金 | 調整・ご返金 | 调整和返金金额 |
| ⑦ | 非课税分 | 非課税分 | 非课税费用 |
| ⑧ | 差引合计额 | 差し引き合計額 | = ① + ② + ③ + ④ + ⑦ - ⑤ - ⑥ |
| ⑨ | 消费税额 | 消費税額 | = (② + ③ + ④ - ⑤) × 10% |

### 最终请求金额

```
お振込み依頼額 = ご請求額 = ⑧ + ⑨
```

---

## 第二页：明细信息

### 明细部分结构

请求书明细分为三个主要部分：

1. **＊チャイルドクラブ会費＊** - CC会员费明细
2. **＊教材お取引＊** - 教材交易明细
3. **＊その他お取引＊** - 其他交易明细

### 1. チャイルドクラブ会費（CC会员费）

显示各教室的会员数和费用。

#### 表格列

| 列名 | 说明 |
|------|------|
| 教室名 | 教室名称（口座振替教室后加"(口座振替)"标记） |
| 人数 | 会员人数 |
| 単価 | 单价（480円） |
| 金額 | = 人数 × 単価 |
| 納入先 | 店番后三位（如：002） |
| ご請求額 | 请求金额（= 金額） |
| 割戻し額 | 仅アイグラン教室显示（= 人数 × 600円） |

#### 教室类型

| 类型 | 单价 | 割戻し | 说明 |
|------|------|--------|------|
| 普通教室 | 480円 | 无 | 正常计算 |
| アイグラン教室 | 480円 | 600円/人 | 有割戻し |
| 口座振替教室 | 480円 | 无 | 教室名后加"(口座振替)"标记 |

#### 排序规则

教室按**納入先（店番后三位）从小到大排序**：001, 002, 003...

#### 小计行

```
計 | 人数合计 | 納入額合计 | ご請求額合计 | 割戻し額合计
```

**重要**：
- **納入額合计 = ご請求額合计**（两者相等）
- 割戻し額是独立计算的，不影响ご請求額

### 2. 教材お取引（教材交易）

显示教材订单明细。

#### 表格列

| 列名 | 说明 |
|------|------|
| 日付 | 订单日期（MM/DD格式，如：11/15） |
| 伝票番号 | 订单号（只显示数字部分，如：51183） |
| 商品名 | 商品名称 |
| 単価 | 单价（教室购买显示一般価格，支局购买显示实际单价） |
| 数量 | 数量 |
| 納入額 | 纳入金额 = 単価 × 数量 |
| 納入先 | 支局购买显示"00"，教室购买显示店番后三位 |
| ご請求額 | 请求金额（只有支局购买才计算，教室购买为空） |
| 割戻し額 | マージン（只有教室购买才计算，支局购买为空） |

#### 购买类型区分

| 购买类型 | 納入先 | 単価 | ご請求額 | 割戻し額 |
|----------|--------|------|----------|----------|
| 支局购买 | 00 | 实际购买单价 | ✓ 计算（= 納入額） | ✗ 不计算 |
| 教室购买 | 店番后三位 | 一般価格 | ✗ 不计算 | ✓ マージン |

#### マージン计算

教室购买的マージン（割戻し額）计算公式：
```
マージン = (一般価格 - 教室価格) × 数量
```

**说明**：
- 支局购买的订单：计入③教材お買い上げ，不计算返现
- 教室购买的订单：不计入③，但マージン计入⑤教材販売割戻し

### 3. その他お取引（其他交易）

显示其他费用明细，包括：
- 口座振替教室的负数金额（已通过口座振替收款）
- 代行請求処理費用
- 其他課税分费用

#### 口座振替教室格式

```
X月度チャイルドクラブ会費(口座振替分)(店番后三位)Y名分@600
```

例如：
```
11月度チャイルドクラブ会費(口座振替分)(016)18名分@600  (¥10,800)
```

**注意**：口座振替教室的金额显示为**负数**（红色带括号），因为这部分已通过口座振替收款。

---

## 计算公式

### 顶部汇总计算

```javascript
// ① 入金后余额
remainingBalance = previousBalance - payment  // ① = a - b

// ② CC会员费（顶部显示）
ccMembershipFee = ccMemberTotal - aigranRebateTotal  // ② = CC会員ご請求总額 - 割戻し总額

// ③ 教材购买（只计算支局购买的订单）
materialDelivery = materials.reduce((sum, m) => {
  return sum + (m.is_branch_order ? m.amount : 0);
}, 0);

// ④ 其他（包含口座振替负数）
other = taxableTotal + bankTransferTotal  // 課税分费用 + 口座振替负数

// ⑤ 教材销售返还（只计算教室购买的订单マージン）
materialReturn = materials.reduce((sum, m) => {
  if (m.is_branch_order) return sum;  // 支局购买不返现
  const margin = (m.price_retail - m.unit_price) * m.quantity;
  return sum + (margin > 0 ? margin : 0);
}, 0);

// ⑥ 调整・返金
adjustment = adjustmentTotal

// ⑦ 非课税分
nonTaxable = nonTaxableTotal

// ⑧ 差引合计额
subtotal = remainingBalance + ccMembershipFee + materialDelivery + other + nonTaxable - materialReturn - adjustment

// ⑨ 消费税额（向下取整）
taxAmount = Math.floor((ccMembershipFee + materialDelivery + other - materialReturn) * 0.1)

// 最终请求金额
totalAmount = subtotal + taxAmount
```

### CC会员费计算

```javascript
// CC会员总额（明细中的納入額/ご請求額）
ccMemberTotal = ccMembers.reduce((sum, m) => sum + m.total_amount, 0)

// アイグラン割戻し总额
aigranRebateTotal = ccMembers
  .filter(m => m.is_aigran)
  .reduce((sum, m) => sum + m.total_count * 600, 0)

// 顶部②チャイルドクラブ会費
ccMembershipFee = ccMemberTotal - aigranRebateTotal
```

### 口座振替教室计算

```javascript
// 口座振替教室在CC会費部分使用480円单价
unitPrice = 480  // 与普通教室相同
amount = total_count * 480

// 口座振替教室在その他お取引部分使用600円计算负数
bankTransferAmount = -(total_count * 600)  // 负数
```

---

## 数据来源

### 数据库表

| 表名 | 用途 |
|------|------|
| `invoices` | 请求书主表 |
| `departments` | 支局信息 |
| `cc_members` | CC会员数据 |
| `order_items` | 教材订单明细 |
| `orders` | 订单主表 |
| `products` | 商品信息 |
| `expenses` | 其他费用 |

### CC会员数据查询

```typescript
// 非口座振替教室（排除is_excluded）
const { data: normalCcMembers } = await supabase
  .from("cc_members")
  .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
  .eq("billing_month", invoice.billing_month)
  .eq("branch_code", branchCode)
  .eq("is_excluded", false)
  .eq("is_bank_transfer", false);

// 支局自己的数据（即使is_excluded为true也要显示）
const { data: branchOwnCcMembers } = await supabase
  .from("cc_members")
  .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
  .eq("billing_month", invoice.billing_month)
  .eq("classroom_code", storeCode)  // 支局自己的store_code
  .eq("is_bank_transfer", false);

// 合并数据，去重
const normalCcMembersMap = new Map();
normalCcMembers.forEach(m => normalCcMembersMap.set(m.classroom_code, m));
branchOwnCcMembers.forEach(m => {
  if (!normalCcMembersMap.has(m.classroom_code)) {
    normalCcMembersMap.set(m.classroom_code, m);
  }
});
const mergedNormalCcMembers = Array.from(normalCcMembersMap.values());

// 口座振替教室（不受is_excluded影响）
const { data: bankTransferCcMembers } = await supabase
  .from("cc_members")
  .select("classroom_name, classroom_code, total_count, unit_price, amount, is_aigran, is_bank_transfer")
  .eq("billing_month", invoice.billing_month)
  .eq("branch_code", branchCode)
  .eq("is_bank_transfer", true)
  .gt("total_count", 0);

// 合并并按classroom_code排序
const ccMembers = [...mergedNormalCcMembers, ...bankTransferCcMembers].sort(
  (a, b) => a.classroom_code.localeCompare(b.classroom_code)
);
```

**重要**：支局自己的CC会员数据（classroom_code等于store_code）不受`is_excluded`过滤影响，始终显示。

### 其他费用查询

```typescript
const { data: allExpenses } = await supabase
  .from("expenses")
  .select("description, amount, expense_type")
  .eq("store_code", department.store_code)
  .eq("invoice_month", invoice.billing_month)
  .eq("review_status", "approved");

// 按费用类型分类
const taxableExpenses = allExpenses.filter(e => e.expense_type === "課税分");
const nonTaxableExpenses = allExpenses.filter(e => e.expense_type === "非課税分");
const adjustmentExpenses = allExpenses.filter(e => e.expense_type === "調整・返金");
```

---

## 特殊处理规则

### 1. 口座振替教室

口座振替教室需要特殊处理：

| 位置 | 处理方式 |
|------|----------|
| CC会費部分 | 显示在列表中，教室名后加"(口座振替)"标记，使用480円单价 |
| その他お取引部分 | 显示为负数（红色带括号），使用600円计算 |
| 顶部④その他 | 包含口座振替负数金额 |

**原因**：口座振替教室的会员费已通过银行转账收取，需要在请求书中扣除。

### 2. アイグラン教室

アイグラン教室有割戻し（返还）：

| 项目 | 金额 |
|------|------|
| 单价 | 480円/人 |
| 割戻し | 600円/人 |

割戻し金额在CC会費明细的最后一列显示，并从顶部②チャイルドクラブ会費中扣除。

### 3. 负数金额显示

所有负数金额显示为**红色带括号**格式：

```
正数：¥10,800
负数：(¥10,800)  ← 红色
```

### 4. 0人教室

人数为0的教室默认隐藏，可通过CSS类`.cc-zero-member`控制显示。

### 5. 教室排序

教室按**納入先（店番后三位）从小到大排序**：

```
001 → 002 → 003 → ... → 048 → 049 → 050
```

---

## 相关文件

### 核心文件

| 文件路径 | 说明 |
|----------|------|
| `apps/web/src/app/api/invoices/[id]/preview/route.ts` | 请求书预览API |
| `apps/web/src/app/api/invoices/[id]/pdf/route.ts` | 请求书PDF生成API |
| `apps/web/src/lib/pdf/generate-invoice-pdf.tsx` | 数据转换逻辑 |
| `apps/web/src/lib/pdf/invoice-html-template.ts` | HTML模板生成 |
| `apps/web/src/lib/pdf/invoice-types.ts` | TypeScript类型定义 |

### 类型定义

```typescript
// CCMemberData - CC会员数据（从API获取）
interface CCMemberData {
  class_name: string;
  classroom_code: string;
  total_count: number;
  unit_price: number;
  total_amount: number;
  is_aigran?: boolean;
  is_bank_transfer?: boolean;
}

// CCMemberDetail - CC会员明细（用于模板渲染）
interface CCMemberDetail {
  className: string;
  classroomCode: string;
  count: number;
  unitPrice: number;
  amount: number;
  deliveryDate: string;  // 納入先（店番后三位）
  invoiceAmount: number;
  deductionAmount: number;
  isAigran: boolean;
  rebateAmount: number;  // 割戻し額
  isBankTransfer: boolean;
}
```

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2025-12-19 | 初始版本，包含完整的请求书逻辑说明 |
| 2025-12-19 | 添加口座振替教室处理逻辑 |
| 2025-12-19 | 修复②チャイルドクラブ会費计算公式 |
| 2025-12-19 | 修复④その他包含口座振替负数 |
| 2025-12-19 | **教材明细优化**：添加纳入先显示（支局购买"00"，教室购买店番后三位） |
| 2025-12-19 | **教材明细优化**：日期格式改为MM/DD，伝票番号只显示数字部分 |
| 2025-12-19 | **教材计算逻辑修复**：③只计算支局购买的订单，⑤只计算教室购买的マージン |
| 2025-12-19 | **マージン计算**：教室购买的マージン = (一般価格 - 教室価格) × 数量 |
| 2025-12-19 | **CC会员数据修复**：支局自己的数据不受is_excluded过滤影响 |
| 2025-12-19 | **纳入先显示修复**：支局自己（以000结尾）显示为"00"而不是"000" |
