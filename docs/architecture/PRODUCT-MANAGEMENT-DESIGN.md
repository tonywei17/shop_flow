# 商品管理模块设计

## 概述

商品管理模块用于管理リトミック研究センター的教材、证书、教具等商品。商品需要支持4种不同权限级别的价格显示。

## 数据模型

### 1. 商品表 (products)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  code TEXT NOT NULL UNIQUE,           -- 商品代码 (如 CCL-01)
  name TEXT NOT NULL,                  -- 商品名称
  description TEXT,                    -- 商品描述
  
  -- 分类关联
  category_id UUID REFERENCES product_categories(id), -- 商品区分
  
  -- 4种价格 (单位: 日元)
  price_hq INTEGER NOT NULL DEFAULT 0,        -- 本部価格 (最低价)
  price_branch INTEGER NOT NULL DEFAULT 0,    -- 支局価格
  price_classroom INTEGER NOT NULL DEFAULT 0, -- 教室価格
  price_retail INTEGER NOT NULL DEFAULT 0,    -- 一般価格 (定价)
  
  -- 库存管理
  stock INTEGER NOT NULL DEFAULT 0,           -- 库存数量
  stock_alert_threshold INTEGER DEFAULT 10,   -- 库存预警阈值
  
  -- 销售设置
  is_active BOOLEAN NOT NULL DEFAULT true,    -- 是否上架
  is_taxable BOOLEAN NOT NULL DEFAULT true,   -- 是否含税
  tax_rate DECIMAL(5,2) DEFAULT 10.00,        -- 税率 (%)
  
  -- 订购限制
  min_order_quantity INTEGER DEFAULT 1,       -- 最小订购数量
  max_order_quantity INTEGER,                 -- 最大订购数量
  order_unit TEXT DEFAULT '個',               -- 订购单位
  
  -- 外部系统关联
  external_id TEXT,                           -- 外部系统ID
  
  -- 显示控制
  display_order INTEGER DEFAULT 0,            -- 显示顺序
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_active ON products(is_active);
```

### 2. 商品图片表 (product_images)

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
```

### 3. 价格权限映射

| 角色类型 | 可见价格 |
|---------|---------|
| 本部 (HQ) | price_hq |
| 支局 (Branch) | price_branch |
| 教室 (Classroom) | price_classroom |
| 一般用户 | price_retail |

价格显示逻辑：
- 根据用户的 `role_code` 或 `department.type` 决定显示哪个价格
- 本部用户可以看到所有4种价格
- 支局用户可以看到支局价格和教室价格
- 教室用户只能看到教室价格
- 未登录/一般用户看到一般价格

## 商品区分 (已存在)

使用现有的 `product_categories` 表：

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 主键 |
| code | TEXT | 区分代码 |
| name | TEXT | 区分名称 |
| status | TEXT | 状态 |

### 建议的商品区分

根据CSV数据分析，建议的商品区分：

| 代码 | 名称 | 说明 |
|-----|------|------|
| CERT | 証書類 | 修了証、認定証等 |
| CARD | カード類 | 出席カード、リズムカード等 |
| BOOK | 書籍・教材 | 指導書、ソルフェージュ等 |
| CD | CD・DVD | 譜例演奏CD、認定試験課題CD等 |
| TOOL | 教具 | フラフープ、積み木、ボード等 |
| GOODS | グッズ | バッグ、ファイル、シール等 |
| PRINT | 印刷物 | パンフレット、チラシ、封筒等 |
| SET | セット商品 | リトミックセット等 |

## API 设计

### 商品一覧 API

```
GET /api/internal/products
```

Query Parameters:
- `page`: 页码
- `limit`: 每页数量
- `q`: 搜索关键词 (商品代码/名称)
- `category`: 商品区分ID
- `status`: 状态筛选 (active/inactive)
- `sort`: 排序字段
- `order`: 排序方向

Response:
```json
{
  "products": [...],
  "count": 100,
  "page": 1,
  "limit": 20
}
```

### 商品详情 API

```
GET /api/internal/products/:id
```

### 商品创建/更新 API

```
POST /api/internal/products
```

Body:
```json
{
  "mode": "create" | "edit",
  "id": "uuid (edit mode)",
  "code": "CCL-01",
  "name": "修了証ステップ1",
  "category_id": "uuid",
  "price_hq": 100,
  "price_branch": 120,
  "price_classroom": 150,
  "price_retail": 200,
  "stock": 100,
  "is_active": true
}
```

### 商品删除 API

```
DELETE /api/internal/products?id=uuid
```

## 前端页面设计

### 1. 商品一覧页面 (/commerce)

功能：
- 商品列表 (表格形式)
- 搜索 (商品代码/名称)
- 筛选 (商品区分、状态)
- 排序
- 分页
- 新規追加按钮
- 编辑/删除操作

表格列：
| 列名 | 说明 |
|-----|------|
| 商品コード | 商品代码 |
| 商品名 | 商品名称 |
| 商品区分 | 分类名称 |
| 本部価格 | 本部价格 (根据权限显示) |
| 支局価格 | 支局价格 (根据权限显示) |
| 教室価格 | 教室价格 (根据权限显示) |
| 一般価格 | 一般价格 |
| 在庫 | 库存数量 |
| ステータス | 状态 |
| 操作 | 编辑/删除 |

### 2. 商品编辑抽屉

字段：
- 商品コード (必須)
- 商品名 (必須)
- 商品区分 (下拉选择)
- 説明 (多行文本)
- 本部価格
- 支局価格
- 教室価格
- 一般価格
- 在庫数
- 在庫警告閾値
- 最小注文数
- 最大注文数
- 注文単位
- 税込み (开关)
- 税率
- 有効 (开关)

## 权限控制

### 数据权限

商品管理页面的访问权限通过 `feature_permissions` 控制：
- `commerce`: 商品管理基本访问权限
- `commerce.edit`: 商品编辑权限
- `commerce.delete`: 商品删除权限
- `commerce.price.all`: 查看所有价格权限

### 价格显示权限

根据用户角色自动决定可见价格：

```typescript
function getVisiblePrices(user: CurrentUser): PriceType[] {
  const roleCode = user.roleCode;
  
  if (roleCode === 'admin' || roleCode === 'hq') {
    return ['hq', 'branch', 'classroom', 'retail'];
  }
  if (roleCode === 'branch') {
    return ['branch', 'classroom', 'retail'];
  }
  if (roleCode === 'classroom') {
    return ['classroom', 'retail'];
  }
  return ['retail'];
}
```

## 实现计划

### Phase 1: 数据库和后端
1. 创建/更新 products 表结构
2. 创建 product_images 表
3. 更新 packages/db/src/products.ts
4. 创建 API 路由

### Phase 2: 前端页面
1. 创建商品列表页面
2. 创建商品编辑抽屉
3. 实现价格权限显示逻辑
4. 实现搜索/筛选/分页

### Phase 3: 数据导入
1. 解析CSV数据
2. 创建导入脚本
3. 导入现有商品数据

## 文件结构

```
apps/web/src/app/(dashboard)/commerce/
├── page.tsx                    # 商品列表页面
├── commerce-client.tsx         # 客户端组件
└── [id]/
    └── page.tsx               # 商品详情页面 (可选)

packages/db/src/
├── products.ts                # 商品数据库操作 (更新)
└── index.ts                   # 导出

apps/web/src/app/api/internal/products/
└── route.ts                   # API 路由
```
