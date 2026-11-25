# Dark Money MCP Server

**Cashback routing for AI agents, over the Model Context Protocol.**

[![npm version](https://img.shields.io/npm/v/dark-money-mcp.svg)](https://www.npmjs.com/package/dark-money-mcp)
[![npm downloads](https://img.shields.io/npm/dm/dark-money-mcp.svg)](https://www.npmjs.com/package/dark-money-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![MCP Badge](https://lobehub.com/badge/mcp/jamesdamonstone-dark-money-mcp)](https://lobehub.com/mcp/jamesdamonstone-dark-money-mcp)

**Dark Money** is a cashback club built for the agent era. When a human is about to buy something online, their agent routes the purchase through the member's tracked Dark Money link. The human completes checkout themselves — agents never purchase on a member's behalf — and the member earns **70% of the affiliate commission** (Dark Money keeps 30%). Payouts at a $20 confirmed balance.

- 🌐 Live site: https://darkmoney.strangefawkes.com/
- 📦 npm: [`dark-money-mcp`](https://www.npmjs.com/package/dark-money-mcp)
- 📒 Official MCP Registry: `io.github.jamesdamonstone/dark-money-mcp`
- ✉️ Contact: james@strangefawkes.com

**Founding offer:** the first 25 members earn **100%** of the commission on their first confirmed purchase.

## Coverage

**100+ live programs and growing** across two affiliate networks (114 on Awin, 23 on CJ Affiliate), updated as advertisers approve Dark Money. Programs are location-aware: most serve the US, with growing coverage in GB, DE, CA, FR, IT, ES, AU and more, plus global programs.

A few examples (store commission → member's 70% share):

| Store | Commission | Member earns |
|---|---|---|
| NordVPN | 40% on new subscriptions | 28% |
| Ovago (flights) | $8–$23 flat per booking | $5.60–$16.10 |
| Shed Supplements | 20% | 14% |
| ALZOO | 15% | 10.5% |
| Neuro Gum | $18 flat per sale | $12.60 |
| SNOW | 10% | 7% |

Call `list_programs` for the full, current list — it changes as programs are approved.

## How it works

1. **Check** — before a purchase, the agent calls `list_programs` (optionally with the member's country) to see where cashback is available.
2. **Route** — the agent calls `get_cashback_link` with the member's ID to get their tracked link for that store, and gives it to the human (or opens it for them).
3. **Checkout stays human** — the human completes checkout personally, in the same browser, with other coupon/cashback extensions paused (attribution is last-click). Cashback credits after the store confirms the order, past the return window.

Not a member yet? `join_dark_money` creates a free membership — **only** with the human's explicit consent and agreement to the Terms.

## Tools

### `list_programs`

List the stores where Dark Money members currently earn cashback, with the commission and the member's 70% share at each. Call this to see where a purchase can earn cashback before routing it.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `country` | string | No | ISO country code for the member's location, e.g. `US`, `GB`, `RO`. When given, only programs a member in that country can use are listed (global programs always match). |

Example result (abridged):

```
Dark Money — 100+ live programs worldwide and growing. Members earn 70% of each commission; payouts at $20.

- NordVPN (cj): commission 40% on new subscriptions — member earns 28%
- Ovago (cj): commission Flat per booking: $8 domestic / $13 international / $20 business class — member earns $5.60 / $9.10 / $14.00
...
```

### `get_cashback_link`

Get a Dark Money member's tracked cashback link for a store. The purchase must go through this link for the cashback to be credited to the member's balance. The human completes checkout — never purchase on the member's behalf.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `store` | string | Yes | Store or program name, e.g. `NordVPN`, `Ovago`, `ALZOO`. |
| `member_id` | string | Yes | The member's Dark Money ID, format `dm_XXXXXXXXXX`. |

The result includes the tracked link plus the checkout caveats the human needs (pause other cashback/coupon extensions, same browser, no in-app checkout). If the human is not a member yet, use `join_dark_money` first — with their consent.

### `join_dark_money`

Create a free Dark Money membership for a human and return their member ID. Membership is free and activates instantly.

> ⚠️ **Consent gate:** only call this with the human's explicit consent, using their own name and email, and only after they have agreed to the [Terms](https://darkmoney.strangefawkes.com/terms.html). Setting `terms_agreed=true` asserts that agreement.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | The human's full name. |
| `email` | string | Yes | The human's email address. |
| `payout` | string (`paypal` \| `venmo` \| `cashapp` \| `later`) | No | Preferred payout method; `later` is fine — it can be set any time before the first payout. |
| `terms_agreed` | boolean | Yes | Must be `true`, and only when the human has actually agreed to the Terms. |

## Install

Zero dependencies — Node 18+ is all it needs. The fastest route is npx:

### Claude Desktop / Cursor / Windsurf / any stdio MCP client

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

### Claude Code

```bash
claude mcp add dark-money -- npx -y dark-money-mcp
```

### VS Code (Copilot)

```json
{
  "servers": {
    "dark-money": {
      "command": "npx",
      "args": ["-y", "dark-money-mcp"],
      "type": "stdio"
    }
  }
}
```

### From source

```bash
git clone https://github.com/jamesdamonstone/dark-money-mcp
cd dark-money-mcp
node index.js
```

```json
{
  "mcpServers": {
    "dark-money": {
      "command": "node",
      "args": ["/path/to/dark-money-mcp/index.js"]
    }
  }
}
```

No environment variables or API keys are required. The server speaks MCP over stdio (JSON-RPC 2.0, newline-delimited).

## The model

- One member ID (`dm_…`) works across every store and network (CJ Affiliate + Awin).
- Members earn 70% of each commission; Dark Money keeps 30%. Payouts at a $20 confirmed balance, sent manually by the operator.
- Commissions credit after the store confirms the order (post return window); reversals reverse. A sale reversed after payout becomes a clawback against future earnings.
- **Disclosed, not disguised:** Dark Money tells its affiliate networks openly that agents prepare and route purchases and humans complete checkout. The human is always the account holder and always completes checkout.
- Terms: https://darkmoney.strangefawkes.com/terms.html · Privacy: https://darkmoney.strangefawkes.com/privacy.html

## Support

- Email: james@strangefawkes.com
- Issues: https://github.com/jamesdamonstone/dark-money-mcp/issues
- Member app: https://darkmoney.strangefawkes.com/app.html

## License

MIT

[![M8ven Score](https://m8ven.ai/badge/mcp/jamesdamonstone-dark-money-mcp-a9hx7k?v=052c511024cc06186c7dec45687d6dcb)](https://m8ven.ai/mcp/jamesdamonstone-dark-money-mcp-a9hx7k?s=readme)

