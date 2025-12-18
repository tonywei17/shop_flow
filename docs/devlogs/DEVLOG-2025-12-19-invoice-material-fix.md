# 开发日志：支局请求书教材明细修复

> **日期**: 2025-12-19
> **开发者**: AI Assistant (Cascade)
> **状态**: ✅ 完成

---

## 概述

本次开发完成了支局请求书中教材明细（教材お取引）的计算逻辑修复和CC会员数据显示修复。

---

## 修改内容

### 1. 教材明细显示优化

**文件**: `apps/web/src/app/api/invoices/[id]/preview/route.ts`

- 添加纳入先（納入先）显示：支局购买显示"00"，教室购买显示店番后三位
- 日期格式改为 MM/DD（如：11/15）
- 伝票番号只显示数字部分（如：51183）
- 获取商品的一般価格（price_retail）用于マージン计算

### 2. 教材计算逻辑修复

**文件**: `apps/web/src/lib/pdf/generate-invoice-pdf.tsx`

#### ③ 教材お買い上げ（首页汇总）
- **修改前**: 计算所有教材订单的总额
- **修改后**: 只计算支局购买的订单请求额

```typescript
const materialDelivery = materials.reduce((sum, m) => {
  return sum + (m.is_branch_order === true ? m.amount : 0);
}, 0);
```

#### ⑤ 教材販売割戻し（首页汇总）
- **修改前**: 所有订单金额的10%
- **修改后**: 只计算教室购买的マージン（一般価格 - 教室価格）× 数量

```typescript
const materialReturn = materials.reduce((sum, m) => {
  if (m.is_branch_order === true) return sum; // 支局购买不返现
  const margin = (m.price_retail - m.unit_price) * m.quantity;
  return sum + (margin > 0 ? margin : 0);
}, 0);
```

### 3. CC会员数据修复

**文件**: `apps/web/src/app/api/invoices/[id]/preview/route.ts`

**问题**: 青森第一支局自己的CC会员数据（classroom_code: 2110000）被设置为`is_excluded = true`，导致被过滤掉。

**解决方案**: 支局自己的CC会员数据（classroom_code等于store_code）不受`is_excluded`过滤影响。

```typescript
// 获取支局自己的数据（即使is_excluded为true也要显示）
const { data: branchOwnCcMembers } = await supabase
  .from("cc_members")
  .select("...")
  .eq("billing_month", invoice.billing_month)
  .eq("classroom_code", storeCode)
  .eq("is_bank_transfer", false);
```

### 4. 纳入先显示修复

**文件**: `apps/web/src/lib/pdf/generate-invoice-pdf.tsx`

**问题**: 支局自己的纳入先显示为"000"而不是"00"

**解决方案**: 
```typescript
const lastThree = member.classroom_code.slice(-3);
const deliveryCode = lastThree === "000" ? "00" : lastThree;
```

---

## 验证结果

### 北海道第一支局（1110000）

| 项目 | 值 |
|------|-----|
| ③ 教材お買い上げ | ¥74,880（支局购买的4个商品） |
| ⑤ 教材販売割戻し | ¥620（教室购买的3个商品マージン） |

### 青森第一支局（2110000）

| 教室名 | 纳入先 | 人数 | 金額 |
|--------|--------|------|------|
| リトミック研究センター青森第一支局 | 00 | 14 | ¥6,720 |
| ミュージックルームメロディー | 012 | 1 | ¥480 |
| ほそやピアノ・リトミック教室 | 013 | 5 | ¥2,400 |
| ㈱アイグラン | 777 | 4 | ¥1,920 |

---

## 修改文件列表

| 文件 | 修改内容 |
|------|----------|
| `apps/web/src/app/api/invoices/[id]/preview/route.ts` | 教材数据查询、CC会员数据查询、纳入先计算 |
| `apps/web/src/lib/pdf/generate-invoice-pdf.tsx` | 教材计算逻辑、纳入先显示、接口定义 |
| `docs/invoice/INVOICE-LOGIC.md` | 文档更新 |

---

## 相关文档

- [INVOICE-LOGIC.md](../invoice/INVOICE-LOGIC.md) - 支局请求书计算逻辑说明
- [PRODUCTION-DEPLOYMENT.md](../deployment/PRODUCTION-DEPLOYMENT.md) - 生产环境部署指南
