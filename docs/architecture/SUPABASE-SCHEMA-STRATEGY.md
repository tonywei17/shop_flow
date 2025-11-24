# Supabase Schema 管理与迁移策略

> 目标：**让当前正在使用的 Supabase 数据库结构（schema）回归到代码仓库中管理**，实现可追踪、可回滚、可复制的数据库结构。
>
> 前提：本仓库使用的是自托管 Supabase 实例（参考 `docs/Supabase/MY_SUPABASE_COMPLETE_GUIDE.md`），当前 schema 主要通过 Studio/MCP 交互直接修改，`supabase/` 目录中的 `migrations/`、`policies/`、`seeds/` 为空壳。

---

## 1. 设计目标

1. **Schema as Code**：数据库结构以 SQL 迁移文件形式保存在仓库（`supabase/migrations`），而不是只存在于远程实例。
2. **环境可复现**：新环境（本地 / 测试 / 生产）均可通过迁移脚本一键建立核心表结构。
3. **变更可审计**：任何对表/索引/RLS 的修改，都通过 Git 记录，便于 Code Review 和回滚。

---

## 2. 目录与命名规范

现有目录：

```text
supabase/
  migrations/   # 将用于存放 schema 迁移 SQL
  policies/     # 行级安全（RLS）等策略 SQL（暂为空）
  seeds/        # 开发/演示环境的种子数据 SQL（暂为空）
  functions/    # Edge Functions / SQL functions（目前未使用）
```

建议的命名规范：

- 迁移文件：

  ```text
  supabase/migrations/
    0001_initial_schema.sql
    0002_add_roles_and_departments_indexes.sql
    0003_add_orders_tables.sql
    ...
  ```

- 策略文件：

  ```text
  supabase/policies/
    roles_policies.sql
    admin_accounts_policies.sql
  ```

- 种子数据：

  ```text
  supabase/seeds/
    0001_core_masters.sql       # 角色/部门/初始账户等
  ```

> 说明：编号可以采用简单的递增 `0001/0002/...`，也可以采用 `YYYYMMDDHHMM_description.sql`。本项目暂推荐使用递增编号，便于手工维护。

---

## 3. 当前 schema 来源与限制说明

- 实际正在使用的表（从代码与 DEVLOG 推断）：
  - `admin_accounts`
  - `departments`
  - `roles`
  - （以及早期创建的）`tenants`、`products`、`customers`、`orders`、`order_items` 等
- 这些表的**真实结构目前以远程 PostgreSQL 中的 schema 为准**，本地仓库并没有对应 SQL。
- 由于当前开发环境无法直接访问你的 VPS/Postgres 实例，我无法在这里自动导出真实 schema，只能给出**标准化的导出步骤与规范**，并指定这些 SQL 应该放置在仓库的哪个位置。

> 换句话说：本文件定义了“schema 应该如何回到仓库”的流程和约定；实际导出操作需要你在 VPS 或本地 Postgres 客户端中执行一次。

---

## 4. 第一步：从自托管 Supabase 导出当前 schema

### 4.1 在 VPS 上导出 schema-only SQL

登录你的 Supabase VPS（参考 `MY_SUPABASE_COMPLETE_GUIDE.md` 中的连接方式），在服务器上执行：

```bash
# 进入 Supabase docker 目录（根据你的部署路径调整）
cd /root/supabase/docker

# 导出当前数据库的 schema（仅结构，不含数据）
# 假设数据库名为 postgres，如有专用 DB 请替换

docker exec supabase-db \
  pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  -U postgres postgres \
  > /root/shop_flow_schema_$(date +%Y%m%d).sql
```

说明：

- `--schema-only`：只导出表结构和索引等，不包含数据。
- `--no-owner` / `--no-privileges`：避免导出与本地环境不兼容的 OWNED BY / GRANT 语句。

### 4.2 将导出的 schema 文件拉回本地仓库

在本地开发机执行（示例）：

```bash
# 将 VPS 上导出的 schema 文件复制到本地
scp root@<your-vps-ip>:/root/shop_flow_schema_20251122.sql supabase/migrations/0001_initial_schema.sql
```

> 注意：`0001_initial_schema.sql` 将作为**当前线上真实 schema 的基线快照**，后续所有变更都在此基础上通过增量迁移实现。

### 4.3 可选：只导出与本系统相关的表

如果你在同一数据库里还有其他无关 schema，可以通过 `--table` 选项只导出本系统使用的表，例如：

```bash
docker exec supabase-db \
  pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  -U postgres postgres \
  \
  --table public.admin_accounts \
  --table public.departments \
  --table public.roles \
  --table public.products \
  --table public.orders \
  --table public.order_items \
  > /root/shop_flow_core_schema_$(date +%Y%m%d).sql
```

然后同样 `scp` 到本地 `supabase/migrations/0001_initial_schema.sql`。

---

## 5. 第二步：在本地/测试环境中应用 schema

一旦 `supabase/migrations/0001_initial_schema.sql` 回到仓库，就可以在本地或其他环境中用它初始化数据库：

```bash
# 假设你在本地有一个 PostgreSQL DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/shop_flow"

psql "$DATABASE_URL" -f supabase/migrations/0001_initial_schema.sql
```

如果你使用 Supabase CLI，并希望在本地 Supabase dev 环境中应用，可以在 `supabase/config.toml` 中指向同一个数据库，然后：

```bash
# 示例：按顺序执行所有迁移
for file in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$file"
done
```

> 目前仓库中的 `supabase/` 目录没有 Supabase CLI 的配置文件，本策略不强制引入 CLI，只使用标准 PostgreSQL 工具即可。

---

## 6. 第三步：后续 schema 变更的工作流

从 `0001_initial_schema.sql` 开始，之后所有改动都应以**增量迁移**的形式存在于仓库中，而不是直接在 Studio 里“点点点”。

### 6.1 新增/修改表结构时的步骤

例如你要给 `admin_accounts` 增加一个索引或新字段：

1. 在本地创建新的迁移文件：

   ```text
   supabase/migrations/0002_add_index_to_admin_accounts_on_account_id.sql
   ```

2. 在文件中写入对应的 SQL：

   ```sql
   -- 例：为 admin_accounts 增加索引
   CREATE INDEX IF NOT EXISTS admin_accounts_account_id_idx
     ON public.admin_accounts (account_id);
   ```

3. 在本地数据库上执行该迁移，并确认与应用代码配合正常：

   ```bash
   psql "$DATABASE_URL" -f supabase/migrations/0002_add_index_to_admin_accounts_on_account_id.sql
   ```

4. 如果需要在线上应用：
   - 在部署/运维流程中，加入同样的 `psql -f` 步骤。
   - 或在 VPS 上手动执行一次该 SQL（长期看建议自动化）。

### 6.2 与代码的同步原则

- 任何会影响 `packages/db/src/*.ts` 类型定义的 schema 变更（新增列、类型改变等），应同时：
  - 更新迁移 SQL；
  - 更新对应的 TypeScript 类型；
  - 更新使用这些字段的 API handler / UI。
- 建议在 PR 描述里包含：
  - `DB Changes:` 小节，列出对应的迁移文件名和主要 SQL 操作。

---

## 7. 行级安全（RLS）与策略文件

目前实际环境中部分表可能已经启用或计划启用 RLS。为了让策略也“回到仓库”，推荐：

1. 在 Studio 或 `pg_dump` 输出中，收集当前 RLS 相关 SQL（`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`、`CREATE POLICY ...` 等）。
2. 将这些 SQL 汇总到 `supabase/policies/*.sql` 中，例如：

   ```sql
   -- supabase/policies/admin_accounts_policies.sql

   ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

   CREATE POLICY admin_accounts_tenant_isolation
     ON public.admin_accounts
     USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
   ```

3. 在初始化新环境时，除了执行 `migrations/*.sql`，还应执行 `policies/*.sql`：

   ```bash
   for file in supabase/policies/*.sql; do
     psql "$DATABASE_URL" -f "$file"
   done
   ```

> 目前仓库中尚未存储任何 RLS 策略文件，这一步可以在 schema 基线导出完成后再逐步进行。

---

## 8. 种子数据（seeds）

对于演示账号、基础 master 数据（如“ロール管理/部署管理/アカウント管理”的初始记录），建议：

1. 从现有生产/预生产数据中挑选一小部分，导出为 SQL 或 CSV。  
2. 存放在 `supabase/seeds/0001_core_masters.sql` 中，例如：

   ```sql
   INSERT INTO public.roles (id, role_id, name, code, data_scope, status, description)
   VALUES
     ('...', 1, '本社管理', 'hq', 'all', '有効', '本社管理ロール');
   ```

3. 开发环境初始化时，在应用完 migrations + policies 后，执行 seeds：

   ```bash
   psql "$DATABASE_URL" -f supabase/seeds/0001_core_masters.sql
   ```

> 目前 `docs/data/` 下已有导出的 Excel 文件（账户/角色/部门），这些文件可以作为整理 seeds SQL 的数据来源。

---

## 9. 与现有自托管 Supabase 实例的关系

- 短期内：
  - 线上自托管实例仍然是“真实运行环境”，本策略通过 `pg_dump --schema-only` 把这份真实结构带回仓库。
- 中期目标：
  - 把 `supabase/migrations` 视为**唯一可信的 schema 来源**；
  - 对 schema 的所有修改都通过新增迁移文件实现，而不是在 Studio 中直接修改。
- 风险提示：
  - 如果在没有更新迁移文件的情况下直接在 Studio 中修改结构，会造成“线上结构与仓库迁移不一致”的情况。  
  - 建议为自己设定一条规则：**改表一定写 SQL，一定进仓库。**

---

## 10. 下一步建议

1. 按本文件第 4 节的步骤，在 VPS 上执行一次 `pg_dump --schema-only`，并将结果保存为：
   - `supabase/migrations/0001_initial_schema.sql`
2. 在本地新建一个空数据库，按第 5 节的方式应用该 SQL，验证：
   - `@enterprise/db` 中的查询/插入是否能正常运行；
   - Dashboard 列表页是否能正常显示数据。
3. 从下一个涉及数据库的需求开始，按第 6 节的规范创建增量迁移文件。

完成以上步骤后，就可以认为：“Supabase schema 已经真正回到仓库中管理”。
