# 包管理器与锁文件规范（shop_flow）

> 目标：在 monorepo 中**统一包管理器选择与使用方式**，避免不同开发者使用 npm / yarn / pnpm 导致的依赖不一致问题。

---

## 1. 当前仓库现状

- **根目录**：
  - `package.json` 中已声明：
    - `"packageManager": "pnpm@10.21.0"`
    - `workspaces: ["apps/*", "packages/*"]`
  - 同时存在：
    - `pnpm-lock.yaml`（pnpm 的锁文件）
    - `package-lock.json`（npm 的锁文件）
- **子项目**：
  - `apps/*`、`packages/*` 统一通过 root workspace 管理依赖。
  - `medusa/` 目录是外部引入的 Medusa 项目，自带：
    - `package-lock.json`
    - `yarn.lock`

结论：**根 monorepo 已经以 pnpm 为主**，npm 锁文件是历史遗留，容易造成混用。

---

## 2. 统一选择：pnpm（根 monorepo 的唯一包管理器）

### 2.1 决策

- **根仓库（`/`）及其 workspaces：
  - `apps/*`
  - `packages/*`

> 一律使用 **pnpm** 管理依赖。

- **Medusa 子项目（`/medusa`）**：
  - 视为**独立项目**，允许继续使用其自带的 npm/yarn 流程。
  - 不影响根 monorepo 的包管理规范。

### 2.2 选择 pnpm 的原因

- `package.json` 已声明 pnpm，且存在 `pnpm-workspace.yaml`，天然适合 monorepo。  
- pnpm 在多 package 场景下磁盘占用小、安装速度快。  
- 更好地避免 "幽灵依赖"（防止某个包依赖间接暴露给其他 workspace）。

---

## 3. 开发者使用规范

### 3.1 根目录

在仓库根目录执行以下命令：

- 安装依赖：

```bash
pnpm install
```

- 启动开发（按 Turborepo 脚本并行启动 app）

```bash
pnpm dev
```

- 构建：

```bash
pnpm build
```

- Lint：

```bash
pnpm lint
```

> 约定：**不要在根目录运行 `npm install` 或 `yarn`**。

### 3.2 在单个 app / package 中新增依赖

推荐仍然在**根目录**执行 pnpm 命令，通过 workspace 精确指定安装目标：

```bash
# 示例：给 apps/web 安装依赖
pnpm add some-package --filter web

# 示例：给 packages/db 安装依赖
pnpm add some-package --filter @enterprise/db
```

> 不建议在 `apps/web` 等子目录中直接执行 `pnpm add`，以保持依赖管理集中、可追踪。

### 3.3 Medusa 子项目（/medusa）

- Medusa 为第三方脚手架项目，**视作独立 Node 项目**：
  - 可以在 `medusa/` 目录内根据官方文档使用 `npm` 或 `yarn`。 
- 约定：
  - 不在根目录用 pnpm 去管理 `medusa/` 的依赖。
  - CI/CD 里如需运行 Medusa，请在对应 job 里单独 `cd medusa && npm install && npm run ...`（与 monorepo 解耦）。

---

## 4. 锁文件策略

### 4.1 建议的目标状态

- **保留**：
  - 根目录：`pnpm-lock.yaml`（唯一可信的锁文件）。
- **清理（人工执行时机合适再做）**：
  - 根目录：`package-lock.json`（npm 锁文件，建议删除）。
  - 各 app / package 内如果存在历史 `package-lock.json` / `yarn.lock`，也应清理，只保留 pnpm 的锁文件。
- **Medusa 子项目**：
  - `medusa/package-lock.json` / `medusa/yarn.lock` 可以保留，由该子项目自己管理。

> 本文档只给出推荐策略，不会自动删除任何文件。实际清理应在确认所有人已切换到 pnpm 后，由你手动执行并提交。

### 4.2 从 npm/yarn 历史环境切换到 pnpm 的步骤

如果之前有人在根目录或 app 里跑过 `npm install` / `yarn`，推荐执行一次“干净安装”：

1. **删除历史 node_modules 与非 pnpm 锁文件**（示例）：

```bash
# 在仓库根目录执行
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# 可选：确认后再删除根 package-lock.json
test -f package-lock.json && rm package-lock.json
```

> 注意：`medusa/` 下的 `node_modules` 和锁文件是否删除，取决于你是否准备重新初始化 Medusa 项目。

2. **使用 pnpm 重新安装**：

```bash
pnpm install
```

3. **验证项目**：

```bash
pnpm lint
pnpm build
pnpm dev
```

---

## 5. CI / CD 与工具链约定

### 5.1 CI 示例（Github Actions 伪代码）

后续在 CI 中应该统一使用 pnpm：

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 10.21.0

- name: Install dependencies
  run: pnpm install

- name: Lint
  run: pnpm lint

- name: Build
  run: pnpm build
```

### 5.2 常见陷阱

- **陷阱 1：`npm install` 和 `pnpm install` 混用**
  - 可能生成多个锁文件，或在 `node_modules` 中留下不一致的树形结构，导致“在我机器上正常”的问题。
  - 解决：统一执行 `pnpm install`，必要时清空 `node_modules` 重装。

- **陷阱 2：在子目录用 npm 单独装包**
  - 会绕过 workspace 拦截，造成依赖重复、版本难以统一。
  - 解决：始终在根目录使用 `pnpm add --filter ...`。

---

## 6. 总结

- **根仓库唯一包管理器：pnpm**。
- **唯一可信锁文件：根目录的 `pnpm-lock.yaml`。**
- **Medusa 子项目视作外部独立工程，单独维护自己的依赖与锁文件。**

后续如要实际清理 `package-lock.json` 等历史文件，可以按本指南执行并在 PR 中注明“统一包管理器到 pnpm”。
