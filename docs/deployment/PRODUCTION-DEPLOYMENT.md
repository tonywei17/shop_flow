# 生产环境部署指南

> **最后更新**: 2025-12-19

## 概述

shop_flow 项目使用 Docker Compose 部署到生产环境。使用 Traefik 作为反向代理，通过 Let's Encrypt 自动获取 SSL 证书。

---

## 服务器信息

| 项目 | 值 |
|------|-----|
| **服务器** | VPS (通过 Tailscale 连接) |
| **IP 地址** | `100.112.168.22` |
| **操作系统** | Ubuntu/Debian |
| **项目路径** | `/root/shop_flow` |
| **Docker Compose** | v2.35.1 |

---

## 服务配置

### shop_flow 应用

| 服务 | 容器名 | 端口 | URL |
|------|--------|------|-----|
| **管理后台 (web)** | shop_flow-web | 3009 | https://eurhythmics.yohaku.cloud |
| **在线商店 (storefront)** | shop_flow-storefront | 3001 | https://eurhythmics-shop.yohaku.cloud |
| **学习平台 (learning)** | shop_flow-learning | 3002 | https://e-learning.yohaku.cloud |
| **PostgreSQL** | shop_flow-postgres | 5432 | 仅内部访问 |
| **Redis** | shop_flow-redis | 6379 | 仅内部访问 |

### 同一服务器上的其他项目

⚠️ **注意**: 此服务器上还运行着其他项目。部署时请只操作 shop_flow 相关的容器。

| 项目 | 主要容器 |
|------|----------|
| Supabase | supabase-* |
| Navi Supabase | navi-supabase-* |
| Langflow | langflow, langflow_postgres |
| Hotel Translation | hotel-translation, guigang-dashboard-* |
| Mem0 | mem0_*, openmemory-api |
| Traefik | traefik |

---

## 部署步骤

### 1. 连接服务器

```bash
ssh root@100.112.168.22
```

### 2. 进入项目目录

```bash
cd /root/shop_flow
```

### 3. 获取最新代码并构建

> 本次更新（2025-12-19）：发票打印样式与分页调整（明细表最大高度 730px，行高随内容估算），请务必重新构建 web。

```bash
# 获取最新代码
git pull origin main

# 安装依赖
pnpm install --frozen-lockfile

# 构建 web
pnpm build --filter web
```

### 4. 构建 Docker 镜像

```bash
# 仅构建 web 和 storefront（不影响其他服务）
docker compose -f docker-compose.prod.yml build --no-cache web storefront

# 如果也需要更新 learning
docker compose -f docker-compose.prod.yml build --no-cache learning
```

### 5. 重启容器

```bash
# 仅重启 web 和 storefront
docker compose -f docker-compose.prod.yml up -d web storefront

# 如果也需要重启 learning
docker compose -f docker-compose.prod.yml up -d learning
```

### 6. 状态确认

```bash
# 确认容器状态
docker ps --filter 'name=shop_flow'

# 查看日志
docker logs shop_flow-web --tail 50
docker logs shop_flow-storefront --tail 50
```

---

## 一键部署

从本地直接部署：

```bash
# 仅更新 web + storefront
ssh root@100.112.168.22 "cd /root/shop_flow && \
  git fetch origin && \
  git reset --hard origin/main && \
  docker compose -f docker-compose.prod.yml build --no-cache web storefront && \
  docker compose -f docker-compose.prod.yml up -d web storefront"
```

---

## 文件结构

```
/root/shop_flow/
├── docker-compose.prod.yml    # 生产环境 Docker Compose
├── Dockerfile                 # learning 用
├── Dockerfile.web             # web 用
├── Dockerfile.storefront      # storefront 用
├── .env.production            # 环境变量（不在 Git 管理中）
├── ecosystem.config.js        # PM2 配置（未使用）
└── nginx-web.conf             # Nginx 配置（未使用）
```

---

## 环境变量

`.env.production` 中设置了以下环境变量：

```env
# Supabase
SUPABASE_URL=https://supabase-api.nexus-tech.cloud
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 数据库
POSTGRES_PASSWORD=...
DATABASE_URL=postgresql://...

# 认证
ADMIN_LOGIN_ID=admin
ADMIN_LOGIN_PASSWORD=yohaku@2026
ADMIN_SESSION_TOKEN=...
ADMIN_SESSION_SECRET=...

# Next.js
NEXT_PUBLIC_LEARNING_URL=https://e-learning.yohaku.cloud
NEXT_PUBLIC_STOREFRONT_URL=https://eurhythmics-shop.yohaku.cloud
```

---

## Traefik 配置

Traefik 使用标签方式配置路由。

### web 服务

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.shop_flow_web.rule=Host(`eurhythmics.yohaku.cloud`)"
  - "traefik.http.routers.shop_flow_web.tls=true"
  - "traefik.http.routers.shop_flow_web.entrypoints=websecure"
  - "traefik.http.routers.shop_flow_web.tls.certresolver=myresolver"
  - "traefik.http.services.shop_flow_web.loadbalancer.server.port=3009"
  - "traefik.docker.network=web"
```

### storefront 服务

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.shop_flow_storefront.rule=Host(`eurhythmics-shop.yohaku.cloud`)"
  - "traefik.http.routers.shop_flow_storefront.tls=true"
  - "traefik.http.routers.shop_flow_storefront.entrypoints=websecure"
  - "traefik.http.routers.shop_flow_storefront.tls.certresolver=myresolver"
  - "traefik.http.services.shop_flow_storefront.loadbalancer.server.port=3001"
  - "traefik.docker.network=web"
```

---

## 故障排除

### 容器无法启动

```bash
# 查看日志
docker logs shop_flow-web

# 检查健康检查状态
docker inspect shop_flow-web --format '{{.State.Health.Status}}'
```

### 构建错误

```bash
# 清除缓存重新构建
docker compose -f docker-compose.prod.yml build --no-cache web
```

### 证书错误

Traefik 无法从 Let's Encrypt 获取证书时：

```bash
# 查看 Traefik 日志
docker logs traefik --tail 50

# 检查 DNS 设置
dig eurhythmics.yohaku.cloud
```

### 数据库连接错误

```bash
# 检查 PostgreSQL 容器状态
docker logs shop_flow-postgres

# 连接测试
docker exec shop_flow-postgres pg_isready -U shop_flow
```

---

## 回滚

出现问题时，回滚到之前的版本：

```bash
# 回滚到特定提交
git reset --hard <commit-hash>

# 重新构建并重启
docker compose -f docker-compose.prod.yml build --no-cache web storefront
docker compose -f docker-compose.prod.yml up -d web storefront
```

---

## 部署建议

### 批量操作相关

部署包含批量操作功能的更新时，请注意以下事项：

#### 1. 批量审批 API (`/api/expenses/review`)

**已知限制与解决方案：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| URI too long | Supabase `.in()` 查询参数过多 | 已实现分批处理 (BATCH_SIZE=50) |
| SuperAdmin 审批失败 | 环境变量 admin 的 ID 不是 UUID | 已添加特殊处理逻辑 |
| reviewer_account_id 类型错误 | UUID 字段不接受字符串 | env admin 时设为 null |

**部署检查清单：**
- [ ] 确认 `ADMIN_LOGIN_ID` 环境变量已正确设置
- [ ] 确认 `expenses` 表的 `reviewer_account_id` 字段允许 NULL
- [ ] 测试批量审批功能（建议先用少量数据测试）

#### 2. 大批量数据操作建议

对于可能涉及大量数据的 API 操作：

```typescript
// 推荐的批量处理模式
const BATCH_SIZE = 50;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}
```

**性能参考：**
- 50 条/批：URL 长度安全，响应时间 < 1s
- 100 条/批：可能接近 URL 限制
- 300+ 条/批：会触发 "URI too long" 错误

#### 3. 环境变量 Admin 注意事项

使用 `ADMIN_LOGIN_ID` 登录的管理员账号是"虚拟账号"，不存在于数据库中。涉及用户 ID 的 API 需要特殊处理：

```typescript
// 检查是否为环境变量 admin
const envAdminId = process.env.ADMIN_LOGIN_ID;
const isEnvAdmin = envAdminId && userId === envAdminId;

if (isEnvAdmin) {
  // 特殊处理：跳过数据库查询，直接授权
}
```

**相关文件：**
- `/apps/web/src/app/api/auth/me/route.ts` - 返回 env admin 的用户信息
- `/apps/web/src/app/api/expenses/review/route.ts` - 批量审批 API

---

## 监控

### 容器状态

```bash
# 所有 shop_flow 容器的状态
docker ps --filter 'name=shop_flow' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### 资源使用情况

```bash
docker stats --filter 'name=shop_flow' --no-stream
```

### 健康检查

```bash
# 检查各服务的 HTTP 响应
curl -s -o /dev/null -w '%{http_code}' https://eurhythmics.yohaku.cloud/
curl -s -o /dev/null -w '%{http_code}' https://eurhythmics-shop.yohaku.cloud/
curl -s -o /dev/null -w '%{http_code}' https://e-learning.yohaku.cloud/
```

---

## 相关文档

- [STORE-SETTINGS-DESIGN.md](../architecture/STORE-SETTINGS-DESIGN.md) - 商店设置模块设计
- [PRODUCT-MANAGEMENT-DESIGN.md](../architecture/PRODUCT-MANAGEMENT-DESIGN.md) - 商品管理设计
- [DEVLOG-2025-12-18.md](../devlogs/DEVLOG-2025-12-18.md) - 请求书PDF生成开发日志
- [DEVLOG-2025-12-18-bulk-approval-fix.md](../devlogs/DEVLOG-2025-12-18-bulk-approval-fix.md) - 批量审批修复开发日志
- [DEVLOG-2025-12-19-invoice-material-fix.md](../devlogs/DEVLOG-2025-12-19-invoice-material-fix.md) - 支局请求书教材明细修复
