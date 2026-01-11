# MCP Server Configuration Guide

> **Date**: 2026-01-11
> **Purpose**: Configure Model Context Protocol (MCP) servers for Claude Code

---

## ✅ Configured MCP Servers

The following MCP servers have been configured in Claude Code:

### 📚 **Context7** - Documentation & Code Examples
- **Purpose**: Access up-to-date documentation and code examples for any library
- **Command**: `npx -y @upstash/context7-mcp`
- **API Key**: Configured ✅

**Usage Example**:
```
Ask Claude: "How do I use Supabase RLS with Next.js?"
Context7 will fetch the latest documentation automatically.
```

---

### 🧠 **Memory** - Persistent Context
- **Purpose**: Remember information across conversations
- **Command**: `npx -y @modelcontextprotocol/server-memory`
- **Storage**: `~/.config/claude-code/memory.json`

**Usage Example**:
```
Tell Claude: "Remember that ADMIN_CLEAR_DATA_PASSWORD must be set in production"
Claude will remember this in future conversations.
```

---

### 🤔 **Sequential Thinking** - Enhanced Reasoning
- **Purpose**: Enable step-by-step reasoning for complex problems
- **Command**: `npx -y @modelcontextprotocol/server-sequential-thinking`

**Usage Example**:
```
Ask Claude: "Think through the best approach to implement rate limiting"
Claude will break down the problem into logical steps.
```

---

### 🎨 **Shadcn** - UI Component Library
- **Purpose**: Access shadcn/ui component library for Next.js
- **Command**: `npx shadcn@latest mcp`

**Usage Example**:
```
Ask Claude: "Add a shadcn button component to this page"
Claude will use the latest shadcn component syntax.
```

---

### 🌐 **Fetch** - Web Content Access
- **Purpose**: Fetch and analyze web content
- **Command**: `uvx mcp-server-fetch`

**Prerequisites**:
```bash
# Install uvx (Python package runner)
pip install uvx
```

**Usage Example**:
```
Ask Claude: "Fetch the latest Next.js 15 release notes"
Claude can retrieve and analyze web content.
```

---

### 🔍 **Chrome DevTools** - Browser Automation
- **Purpose**: Interact with Chrome browser for testing and debugging
- **Command**: `npx chrome-devtools-mcp@latest`

**Usage Example**:
```
Ask Claude: "Test the login flow in Chrome"
Claude can automate browser interactions.
```

---

### 🗄️ **Supabase** - Database Access
- **Purpose**: Direct access to your Supabase database
- **Command**: Python script via virtual environment
- **URL**: `https://supabase-api.nexus-tech.cloud`

**Usage Example**:
```
Ask Claude: "Show me all admin accounts in the database"
Claude can query Supabase directly.
```

---

### 🎨 **Figma** - Design Integration
- **Purpose**: Access Figma designs and components
- **Type**: HTTP server
- **URL**: `http://127.0.0.1:3845/mcp`

**Prerequisites**:
- Figma Desktop app must be running
- MCP plugin enabled in Figma

**Usage Example**:
```
Ask Claude: "Export this Figma design to React components"
Claude can access your Figma files.
```

---

## 📁 Configuration File Location

Claude Code MCP configuration:
```
~/.config/claude-code/mcp_servers.json
```

Windsurf IDE MCP configuration (separate):
```
~/.codeium/windsurf/mcp_config.json
```

**Note**: These are **different configurations** for different tools!

---

## 🔧 Managing MCP Servers

### View All Servers
```bash
claude mcp list
```

### Add a New Server
```bash
claude mcp add <server-name> \
  --command "npx" \
  --args "-y <package-name>"
```

### Remove a Server
```bash
claude mcp remove <server-name>
```

### Test a Server
```bash
claude mcp test <server-name>
```

### Enable/Disable a Server
```bash
claude mcp disable <server-name>
claude mcp enable <server-name>
```

---

## 🧪 Testing MCP Servers

### Test Context7
```bash
# In Claude Code session
Ask: "Using Context7, find documentation for Supabase Row Level Security"
```

### Test Memory
```bash
# In Claude Code session
Say: "Remember: Our project uses Next.js 15 with Turborepo"
# Then in a new session:
Ask: "What framework does our project use?"
```

### Test Sequential Thinking
```bash
# In Claude Code session
Ask: "Think step-by-step: How should we implement JWT authentication?"
```

### Test Supabase
```bash
# In Claude Code session
Ask: "Query the admin_accounts table and show the first 5 records"
```

---

## 🔒 Security Considerations

### Sensitive Data in MCP Config

The following servers have **sensitive credentials**:

1. **Context7**:
   - API Key: `ctx7sk-1e1df7c6-c79d-4063-845d-649804ec7f25`
   - ⚠️ Do not share this key publicly

2. **Supabase**:
   - Service Role Key in config
   - ⚠️ Has full database access
   - Only use in trusted environments

### Best Practices

1. **Never commit** `mcp_servers.json` to version control
2. **Use environment variables** for sensitive values when possible
3. **Rotate API keys** regularly
4. **Review MCP server permissions** before adding new servers

---

## 📊 MCP Server Comparison

| Server | Use Case | Internet Required | Credentials |
|--------|----------|-------------------|-------------|
| Context7 | Documentation lookup | ✅ Yes | API Key |
| Memory | Persistent context | ❌ No | None |
| Sequential Thinking | Complex reasoning | ❌ No | None |
| Shadcn | UI components | ✅ Yes (npm) | None |
| Fetch | Web scraping | ✅ Yes | None |
| Chrome DevTools | Browser automation | ❌ No | None |
| Supabase | Database queries | ✅ Yes | Service Key |
| Figma | Design access | ❌ No (local) | None |

---

## 🐛 Troubleshooting

### MCP Server Not Found

**Error**: `MCP server 'xyz' not found`

**Solution**:
```bash
# Verify server is configured
cat ~/.config/claude-code/mcp_servers.json | grep "xyz"

# Or list all servers
claude mcp list
```

### NPX Package Not Installing

**Error**: `Failed to install package`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Manually install the package
npx -y @upstash/context7-mcp --version
```

### Python MCP Server Fails

**Error**: `Python command not found`

**Solution**:
```bash
# Verify Python path
which python3

# Update the config with correct path
# Edit ~/.config/claude-code/mcp_servers.json
```

### Figma Server Not Responding

**Error**: `Connection refused to http://127.0.0.1:3845/mcp`

**Solution**:
1. Open Figma Desktop app
2. Go to Plugins → MCP Server
3. Ensure the server is running
4. Check the port number (default: 3845)

---

## 🔄 Updating MCP Servers

### Update All NPX-based Servers

Since we use `-y` flag and `@latest`, packages auto-update:
```bash
# Context7 will update automatically on next use
# Shadcn will use latest version
# Chrome DevTools will update automatically
```

### Update Python-based Servers (Supabase)

```bash
cd /Users/wenxinwei/supabase-mcp-local
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

---

## 📝 Custom MCP Server Example

Want to create your own MCP server? Here's a template:

```json
{
  "my-custom-server": {
    "command": "npx",
    "args": [
      "-y",
      "my-mcp-package@latest"
    ],
    "env": {
      "API_KEY": "your-api-key-here"
    }
  }
}
```

Add it to `~/.config/claude-code/mcp_servers.json` under the `mcpServers` object.

---

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude-code/mcp)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)

---

## ✅ Verification Checklist

After configuration, verify:

- [ ] `claude mcp list` shows all configured servers
- [ ] Context7 can fetch documentation
- [ ] Memory can store and retrieve information
- [ ] Supabase can query database
- [ ] Figma server responds (if Figma Desktop is running)
- [ ] No credential errors in logs

---

**Last Updated**: 2026-01-11
**Configuration File**: `~/.config/claude-code/mcp_servers.json`
