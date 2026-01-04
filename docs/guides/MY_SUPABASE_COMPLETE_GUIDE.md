# 我的Supabase自托管实例 - 完整指南

> 创建时间: 2025-11-19  
> VPS IP: 69.62.81.149  
> 域名: https://supabase.yohaku.cloud

---

## 📋 目录

1. [基本信息](#基本信息)
2. [访问凭据](#访问凭据)
3. [数据库连接信息](#数据库连接信息)
4. [在项目中使用](#在项目中使用)
5. [Windsurf IDE MCP配置](#windsurf-ide-mcp配置)
6. [服务器管理](#服务器管理)
7. [故障排查](#故障排查)

---

## 基本信息

### 🌐 访问地址

| 服务 | URL | 说明 |
|------|-----|------|
| **Studio管理界面** | https://supabase.yohaku.cloud | Web管理控制台 |
| **REST API** | https://supabase.yohaku.cloud/rest/v1/ | 数据库REST接口 |
| **Auth API** | https://supabase.yohaku.cloud/auth/v1/ | 认证接口 |
| **Storage API** | https://supabase.yohaku.cloud/storage/v1/ | 文件存储接口 |
| **Realtime** | wss://supabase.nexus-tech.cloud/realtime/v1/ | WebSocket实时通信 |

### 💻 VPS配置

- **IP地址**: 69.62.81.149
- **操作系统**: Ubuntu Linux
- **资源**: 16GB RAM, 4核CPU, 127GB磁盘
- **Docker版本**: 28.1.1
- **部署位置**: /root/supabase/docker

### 📦 部署的服务

✅ PostgreSQL 15.8 - 主数据库  
✅ PostgREST 12.2 - REST API  
✅ GoTrue 2.177 - 认证服务  
✅ Kong 2.8 - API网关  
✅ Supabase Studio - Web管理界面  
✅ Storage API 1.25 - 文件存储  
✅ Realtime 2.34 - 实时订阅  
✅ Analytics - 日志分析  
✅ Edge Functions - 无服务器函数  

---

## 访问凭据

### 🔐 Studio管理界面登录

```
URL: https://supabase.yohaku.cloud
用户名: admin
密码: SupabaseAdmina161e9d7
```

⚠️ **重要**: 首次访问时浏览器会弹出HTTP基本认证对话框，输入以上凭据。

### 🔑 API密钥

#### Anon Key (客户端使用，安全)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.PBPd1qltaaVEGd-86e7FY15SF5njjzjMZ9i7WoKrf8Q
```

#### Service Role Key (服务端使用，⚠️ 请勿暴露)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.d154rW2zWFTARtKnztZLuuV6Bv3qCsLAPVbGLTyYA98
```

---

## 数据库连接信息

### 📊 PostgreSQL直接连接

```
主机: 69.62.81.149
端口: 5432
数据库: postgres
用户名: postgres
密码: supabase_admin_2024
SSL: 可选
```

#### 连接字符串
```
postgresql://postgres:supabase_admin_2024@69.62.81.149:5432/postgres
```

#### 使用psql连接
```bash
psql -h 69.62.81.149 -p 5432 -U postgres -d postgres
```

### 🌐 通过API连接（推荐）

```bash
SUPABASE_URL="https://supabase.yohaku.cloud"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 在项目中使用

### 🔧 方式1: JavaScript/TypeScript (推荐)

#### 安装
```bash
npm install @supabase/supabase-js
```

#### 使用
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://supabase.yohaku.cloud',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
)

// 查询数据
const { data, error } = await supabase
  .from('your_table')
  .select('*')

// 插入数据
const { data, error } = await supabase
  .from('your_table')
  .insert({ name: 'John Doe', email: 'john@example.com' })

// 实时订阅
supabase
  .channel('your_table')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'your_table' }, 
    (payload) => console.log('Change:', payload)
  )
  .subscribe()
```

### 🐍 方式2: Python

#### 安装
```bash
pip install supabase
```

#### 使用
```python
from supabase import create_client, Client

url = "https://supabase.yohaku.cloud"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"

supabase: Client = create_client(url, key)

# 查询数据
response = supabase.table('your_table').select("*").execute()

# 插入数据
response = supabase.table('your_table').insert({
    "name": "John Doe", 
    "email": "john@example.com"
}).execute()
```

### 🌐 方式3: REST API (curl)

```bash
# 查询数据
curl -X GET 'https://supabase.yohaku.cloud/rest/v1/your_table' \
  -H "apikey: YOUR-ANON-KEY" \
  -H "Authorization: Bearer YOUR-ANON-KEY"

# 插入数据
curl -X POST 'https://supabase.yohaku.cloud/rest/v1/your_table' \
  -H "apikey: YOUR-ANON-KEY" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### ⚙️ 环境变量配置 (最佳实践)

创建 `.env` 文件：
```bash
SUPABASE_URL=https://supabase.yohaku.cloud
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
```

在代码中使用：
```javascript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
```

⚠️ **记得添加到 .gitignore**:
```
.env
.env.local
```

---

## Windsurf IDE MCP配置

### 📥 准备工作

#### 1. 下载Docker镜像到本地

在本地电脑终端运行：
```bash
# 下载镜像文件 (161MB)
scp root@69.62.81.149:/tmp/supabase-mcp.tar ~/Downloads/

# 导入到本地Docker
docker load -i ~/Downloads/supabase-mcp.tar

# 验证镜像已导入
docker images | grep mcp/supabase
```

### ⚙️ Windsurf配置

#### 方法1: 通过UI配置

1. 打开 Windsurf IDE
2. 按 `Cmd/Ctrl + Shift + P` 打开命令面板
3. 搜索 "Preferences: Open Settings (JSON)"
4. 在配置文件中添加以下内容：

```json
{
  "mcpServers": {
    "supabase": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "SUPABASE_URL",
        "-e",
        "SUPABASE_SERVICE_KEY",
        "mcp/supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://supabase.yohaku.cloud",
        "SUPABASE_SERVICE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q"
      }
    }
  }
}
```

5. 保存文件
6. 重启 Windsurf IDE

#### 方法2: 直接编辑配置文件

根据操作系统找到配置文件：

**macOS**:
```
~/Library/Application Support/Windsurf/User/settings.json
```

**Windows**:
```
%APPDATA%\Windsurf\User\settings.json
```

**Linux**:
```
~/.config/Windsurf/User/settings.json
```

### ✅ 验证配置

在 Windsurf 的 AI 聊天中输入：
```
列出数据库中的所有表
```

如果配置成功，AI会使用MCP工具查询并返回结果。

### 🛠️ MCP可用操作

配置成功后，你可以通过自然语言与数据库交互：

**查询数据**:
- "查询users表中所有active的用户"
- "显示products表的前10条记录"
- "找出orders表中amount大于100的订单"

**插入数据**:
- "在users表中添加一个新用户，email是test@example.com"
- "创建一条产品记录，name是iPhone，price是999"

**更新数据**:
- "更新users表中id为1的用户，设置status为premium"
- "将所有过期订单的status改为cancelled"

**删除数据**:
- "删除users表中所有未激活超过30天的用户"

### 🔄 本地构建镜像（可选）

如果不想从VPS下载，可以在本地直接构建：

```bash
# 克隆仓库
git clone https://github.com/coleam00/supabase-mcp.git
cd supabase-mcp

# 构建镜像
docker build -t mcp/supabase .

# 验证
docker images | grep mcp/supabase
```

然后按照上面的配置步骤操作。

---

## 服务器管理

### 🔄 常用Docker命令

```bash
# 进入docker目录
cd /root/supabase/docker

# 查看所有服务状态
docker compose ps

# 查看特定服务日志
docker compose logs studio
docker compose logs db
docker compose logs kong

# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart studio

# 停止所有服务
docker compose down

# 启动所有服务
docker compose up -d

# 查看服务资源使用
docker stats
```

### 🔐 修改Studio登录密码

```bash
# 1. 生成新密码哈希
htpasswd -nb admin 你的新密码

# 2. 编辑docker-compose.yml
nano /root/supabase/docker/docker-compose.yml

# 3. 找到studio服务的labels部分，更新basicauth.users
# 注意：$符号需要写成$$

# 4. 重启studio
docker compose up -d studio
```

### 🗄️ 数据库备份

```bash
# 备份整个数据库
docker exec supabase-db pg_dump -U postgres postgres > backup-$(date +%Y%m%d).sql

# 备份到压缩文件
docker exec supabase-db pg_dump -U postgres postgres | gzip > backup-$(date +%Y%m%d).sql.gz

# 恢复备份
cat backup.sql | docker exec -i supabase-db psql -U postgres postgres
```

### 📊 监控服务状态

```bash
# 查看容器健康状态
docker ps --format "table {{.Names}}\t{{.Status}}"

# 查看系统资源
free -h
df -h

# 查看端口占用
netstat -tuln | grep -E "3001|8000|5432"
```

---

## 故障排查

### ❓ 问题1: 无法访问Studio

**症状**: 浏览器显示"无法连接"或超时

**解决步骤**:
1. 检查服务是否运行：
   ```bash
   docker compose ps | grep studio
   ```

2. 查看studio日志：
   ```bash
   docker compose logs studio --tail=50
   ```

3. 检查端口是否监听：
   ```bash
   netstat -tuln | grep 3001
   ```

4. 重启studio服务：
   ```bash
   docker compose restart studio
   ```

### ❓ 问题2: API返回401错误

**症状**: API请求返回 "401 Unauthorized"

**原因**: API密钥错误或未提供

**解决**:
确保请求包含正确的headers：
```bash
curl -X GET 'https://supabase.yohaku.cloud/rest/v1/your_table' \
  -H "apikey: YOUR-ANON-KEY" \
  -H "Authorization: Bearer YOUR-ANON-KEY"
```

### ❓ 问题3: MCP连接失败

**症状**: Windsurf无法连接到数据库

**解决步骤**:
1. 确认Docker Desktop正在运行
2. 验证镜像存在：
   ```bash
   docker images | grep mcp/supabase
   ```
3. 手动测试MCP：
   ```bash
   docker run --rm -i \
     -e SUPABASE_URL="https://supabase.yohaku.cloud" \
     -e SUPABASE_SERVICE_KEY="your-service-key" \
     mcp/supabase
   ```
4. 检查Windsurf日志查看详细错误

### ❓ 问题4: 忘记Studio密码

**解决**:
1. 查看当前密码：
   ```bash
   cat /root/supabase/STUDIO_CREDENTIALS.txt
   ```

2. 或者生成新密码并更新配置（参考"修改Studio登录密码"章节）

### ❓ 问题5: 数据库连接失败

**症状**: PostgreSQL连接超时

**解决步骤**:
1. 检查数据库服务状态：
   ```bash
   docker compose ps | grep db
   ```

2. 查看数据库日志：
   ```bash
   docker compose logs db --tail=50
   ```

3. 测试连接：
   ```bash
   docker exec -it supabase-db psql -U postgres
   ```

---

## 📚 附加资源

### 📖 官方文档
- Supabase文档: https://supabase.com/docs
- PostgREST API: https://postgrest.org/en/stable/
- Supabase MCP: https://github.com/coleam00/supabase-mcp

### 📁 VPS上的重要文件
- Supabase配置: `/root/supabase/docker/.env`
- Studio凭据: `/root/supabase/STUDIO_CREDENTIALS.txt`
- 快速指南: `/root/SUPABASE_QUICK_START.md`
- MCP指南: `/root/WINDSURF_MCP_SETUP.md`
- Docker镜像: `/tmp/supabase-mcp.tar`

### 🔧 有用的命令

```bash
# SSH连接到VPS
ssh root@69.62.81.149

# 查看Supabase服务状态
cd /root/supabase/docker && docker compose ps

# 快速重启所有服务
cd /root/supabase/docker && docker compose restart

# 查看API响应
curl https://supabase.yohaku.cloud/rest/v1/ -H "apikey: YOUR-KEY"
```

---

## 🔐 安全最佳实践

1. ✅ **定期更换密码和密钥**
   - Studio登录密码
   - PostgreSQL密码
   - JWT密钥

2. ✅ **限制访问**
   - 配置防火墙规则
   - 使用VPN访问敏感端口
   - 启用RLS（行级安全）

3. ✅ **定期备份**
   - 每天自动备份数据库
   - 备份到异地存储
   - 定期测试恢复流程

4. ✅ **监控日志**
   - 定期检查异常访问
   - 设置告警通知
   - 审计重要操作

5. ✅ **保密密钥**
   - 永远不要提交密钥到Git
   - 使用环境变量
   - 限制Service Key的使用范围

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看VPS上的详细文档: `/root/SUPABASE_QUICK_START.md`
2. 检查服务日志: `docker compose logs [service-name]`
3. 查阅官方文档: https://supabase.com/docs
4. 访问GitHub Issues: https://github.com/supabase/supabase/issues

---

**文档版本**: 1.0  
**最后更新**: 2025-11-19  
**部署人**: Warp AI Agent  

✨ 享受使用Supabase吧！
