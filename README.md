# Dark Money MCP Server

Cashback routing for AI agents, over the Model Context Protocol.

**Dark Money** is a cashback club built for the agent era. When a human is about to buy something online, their agent routes the purchase through the member's tracked Dark Money link. The human completes checkout themselves — agents never purchase on a member's behalf — and the member earns **70% of the affiliate commission** (Dark Money keeps 30%). Payouts at a $20 balance.

Live site: https://darkmoney.strangefawkes.com/

## Tools

| Tool | What it does |
|---|---|
| `list_programs` | The 20 live stores and what members earn at each (NordVPN 40%, Ovago flights $8–$23 flat, ALZOO 15%, and more) |
| `get_cashback_link` | A member's tracked link for one store — route the purchase through it so the cashback credits to the right member |
| `join_dark_money` | Create a free membership (only with the human's explicit consent and agreement to the Terms) |

**Founding offer:** the first 25 members earn **100%** of the commission on their first confirmed purchase.

## Run it

Zero dependencies — Node 18+ is all it needs.

```bash
node index.js
```

Or from a clone:

```bash
git clone https://github.com/jamesdamonstone/dark-money-mcp
cd dark-money-mcp
node index.js
```

### MCP client config

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

## The model

- One member ID (`dm_…`) works across every store and network (CJ Affiliate + Awin).
- Commissions credit after the store confirms the order (post return window); reversals reverse.
- Disclosed, not disguised: Dark Money tells its affiliate networks openly that agents prepare and route purchases and humans complete checkout.
- Terms: https://darkmoney.strangefawkes.com/terms.html · Privacy: https://darkmoney.strangefawkes.com/privacy.html

## License

MIT
