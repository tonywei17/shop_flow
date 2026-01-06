# 开发日志 (2026-01-06) - 生产环境部署、IPv6 改造兼容与侧边栏跳转修复

## 1. 任务背景
- 执行 2026 年首次代码同步与生产环境部署。
- 兼容服务器最近进行的 Docker 全局 IPv6 改造。
- 修复 Dashboard 侧边栏按钮在生产环境下跳转 404 的严重问题。

## 2. 完成内容

### 2.1 生产环境部署与 IPv6 兼容
- **操作对象**：`web` (Dashboard), `storefront`, `learning` 三大应用。
- **环境验证**：确认服务器 Docker 守护进程已启用 IPv6，且 `web` 网络已配置 IPv6 子网。
- **兼容性确认**：容器已成功获得 IPv6 地址（如 web 容器为 `fd00:1::11`），服务通过 Traefik 反向代理访问正常。

### 2.2 代码修复 (Hotfix)
- **API 修复**：修正了 `apps/web/src/app/api/invoices/preview-detail-html/route.ts` 中的 TypeScript 类型错误（布尔值误传为数字），解决了构建失败问题。
- **侧边栏 404 修复**：
    - **原因分析**：Next.js 的 `NEXT_PUBLIC_` 环境变量在构建时未通过 Docker 注入，导致客户端链接回退到 `localhost`。
    - **修复方案**：
        1. 修改 `Dockerfile.web`、`Dockerfile.storefront` 和 `Dockerfile`，在 `builder` 阶段使用 `ARG` 接收构建参数。
        2. 更新 `docker-compose.prod.yml`，在 `build` 阶段显式传递环境变量。
    - **结果**：侧边栏“学习平台”与“线上商城”按钮现已正确跳转至生产环境域名。

### 2.3 部署流程优化
- 优化了 Docker Compose 构建指令，确保使用 `--no-cache` 以应用最新的环境变量更改。
- 验证了所有服务重启后的健康检查状态。

## 3. 验证结果
- [x] 管理后台 (web): https://eurhythmics.yohaku.cloud (200 OK)
- [x] 在线商城 (storefront): https://eurhythmics-shop.yohaku.cloud (200 OK)
- [x] 学习平台 (learning): https://e-learning.yohaku.cloud (200 OK)
- [x] 侧边栏跨应用跳转功能恢复正常。

## 4. 后续建议
- 建议将构建时的环境变量管理迁移到更稳健的 CI/CD 流程中，避免手动修改 Dockerfile。
- 持续监控 IPv6 环境下的网络延迟与稳定性。
