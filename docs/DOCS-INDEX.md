# 文档索引与状态说明

> 目标：为 `docs/` 目录提供一个简洁的索引，并标注各文档与当前项目状态的关系（主线文档 / 历史方案 / 子系统专用）。

## 1. 主线架构与实现文档

- **TECHNICAL_ARCHITECTURE.md**  
  - 角色：整体技术架构蓝图（Next.js + Supabase + Stripe + Langflow + Turborepo）。
  - 状态：**主线设计文档**，部分内容是中长期规划（如 Stripe/Langflow 尚未完全落地）。

- **SUPABASE-SCHEMA-STRATEGY.md**  
  - 角色：Supabase schema 回归仓库的策略说明（如何从自托管实例导出迁移、如何组织 `supabase/migrations`）。
  - 状态：**强烈推荐后续按此执行**，目前尚未导入真实 schema，仅有策略与目录约定。

- **PACKAGE-MANAGER-GUIDE.md**  
  - 角色：包管理与锁文件规范（统一使用 pnpm，`pnpm-lock.yaml` 为唯一可信锁文件）。
  - 状态：**已与当前代码状态一致**，`pnpm build`/`pnpm dev` 已在本地使用。

- **IMPLEMENTATION-GUIDE.md（implementation-guide.md）**  
  - 角色：功能落地与 API 接入的实施路线图。
  - 状态：**仍然适用**，可与本次 Supabase/构建改动配合使用。

## 2. 电商架构文档（Supabase & Medusa）

- **SYSTEM_ARCHITECTURE_MEDUSA.md**  
  - 角色："模式 A"——以 Medusa 作为商城引擎的架构方案。
  - 状态：**历史/备选方案**。当前代码已切回 Supabase 直连的电商实现，Medusa 仅保留部分占位与文档；请以 `TECHNICAL_ARCHITECTURE.md` + `SUPABASE-SCHEMA-STRATEGY.md` 作为当前默认参考。

## 3. Learning 平台相关文档

- **QUICK-START.md**  
  - 角色：Learning 平台前端优化 & Mock 数据/错误处理/Loading 的快速上手指南。
  - 状态：**与当前 Learning app 状态基本一致**，适用于继续完善 Learning 模块。

- **READINESS-CHECKLIST.md**  
  - 角色：Learning 平台功能接入准备清单与里程碑。
  - 状态：**有效**，可作为该子系统的 TODO 与进度跟踪工具。

- **COMPLETED-OPTIMIZATIONS.md**、**code-health-analysis.md**  
  - 角色：Learning 平台代码健康度分析与已完成优化记录。
  - 状态：**历史优化记录**，与当前代码结构基本匹配，作为参考保留。

## 4. 通知与后台业务相关文档

- **notification-system-summary.md**  
  - 角色：通知系统的业务设计与 UI/交互说明。
  - 状态：**与当前 Dashboard 通知页面设计一致**，后续在接入真实 API 时继续参考。

- **DEMO-ACCOUNT-GUIDE.md**  
  - 角色：演示账号/角色/权限相关说明。
  - 状态：**仍可使用**，需在 Supabase schema 与真实账号数据完善后视情况更新。

## 5. 产品与需求文档

- **PRD.md**  
  - 角色：产品需求文档，描述系统目标与业务场景。
  - 状态：**主线业务来源**，与当前实现方向保持一致。

- **new-features-summary.md**  
  - 角色：新增功能的汇总与变更说明。
  - 状态：**用于沟通变更**，建议与 DEVLOG 一起维护。

## 6. 开发日志与变更记录

- **DEVLOG.md**（根）  
  - 角色：早期整合式开发日志，涵盖 UI 重构、Medusa 接入/回退、Supabase 集成等历史过程。
  - 状态：**历史日志**。自 2025-11-23 起，新的开发日志建议写入 `docs/devlogs/` 目录下的独立文件（如 `DEVLOG-YYYY-MM-DD.md`）。

- **DAILY-LOG-2025-11-10.md**  
  - 角色：Learning 平台优化当日工作记录。
  - 状态：**历史日志**，可与 `docs/devlogs/*` 共同视为时间线记录。

- **docs/devlogs/**  
  - 角色：**新的开发日志目录**。每次较大的迭代建议在此新增一份独立的 `DEVLOG-YYYY-MM-DD.md`，并在其中记录：
    - 本次改动概览
    - 构建/运行状态
    - 风险与 TODO

## 7. Supabase 自托管相关文档

- **MY_SUPABASE_COMPLETE_GUIDE.md**  
  - 角色：当前自托管 Supabase 实例的完整说明（访问方式、API Key、MCP 配置等）。
  - 状态：**基础设施文档**，与本项目使用的远程数据库强相关，需注意其中敏感信息只应在私有环境使用。

- **docs/Supabase/**  
  - 角色：Supabase MCP 镜像与相关资源。
  - 状态：**工具与资产**，可按需使用，不直接影响应用代码。

## 8. 其他目录

- **ADRs/**  
  - 角色：架构决策记录（当前为空，可在未来重大决策时补充）。

- **data/**  
  - 角色：从 Supabase 导出的参考数据（如账户/角色/部门的 Excel），可作为手工导入或编写 seeds 的依据。

---

> 整体约定：
> - **技术/架构现状优先参考**：`TECHNICAL_ARCHITECTURE.md`、`SUPABASE-SCHEMA-STRATEGY.md`、`PACKAGE-MANAGER-GUIDE.md`。
> - **业务/产品现状优先参考**：`PRD.md`、`notification-system-summary.md`、Learning 相关文档。
> - **历史/备选方案**：`SYSTEM_ARCHITECTURE_MEDUSA.md`、早期 DEVLOG/DAILY-LOG。
> 
> 如果新增了重要模块或架构变更，建议同步更新本索引，以便快速定位“哪篇文档还代表当前真相”。
