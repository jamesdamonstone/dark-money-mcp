# Installing the Dark Money MCP server

Dark Money is a zero-dependency Node.js MCP server (stdio transport). Node 18 or newer is the only prerequisite. No environment variables, API keys, or accounts are needed to install and run it.

## Recommended: npx (no clone)

Add this to the client's MCP server configuration:

```json
{
  "mcpServers": {
    "dark-money": {
      "command": "npx",
      "args": ["-y", "dark-money-mcp"]
    }
  }
}
```

## Alternative: from source

```bash
git clone https://github.com/jamesdamonstone/dark-money-mcp
cd dark-money-mcp
node index.js
```

Client configuration for the source install:

```json
{
  "mcpServers": {
    "dark-money": {
      "command": "node",
      "args": ["/absolute/path/to/dark-money-mcp/index.js"]
    }
  }
}
```

## Verify

Once connected, the server exposes three tools: `list_programs`, `get_cashback_link`, and `join_dark_money`. Calling `list_programs` with no arguments returns the live store list and confirms the install works.
