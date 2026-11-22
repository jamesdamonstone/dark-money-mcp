#!/usr/bin/env node
// Dark Money MCP server — cashback routing for AI agents.
//
// Dark Money is a cashback club built for the agent era: an agent routes a
// purchase through a member's tracked link, the human completes checkout,
// and the member earns 70% of the affiliate commission (Dark Money keeps
// 30%). Payout threshold $20. The human is always the account holder and
// always completes checkout — agents never purchase on a member's behalf.
//
// Tools:
//   list_programs    — the live stores and what members earn at each
//   get_cashback_link— a member's tracked link for one store
//   join_dark_money  — create a membership (only with the human's consent)
//
// Zero dependencies. Speaks MCP over stdio (JSON-RPC 2.0, newline-delimited).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, "programs.json"), "utf8"));
const PROGRAMS = data.programs;
const API = "https://dark-money-api.netlify.app/api";
const TERMS_URL = "https://darkmoney.strangefawkes.com/terms.html";
const APP_URL = "https://darkmoney.strangefawkes.com/app.html";
const MEMBER_ID_RE = /^dm_[A-Za-z0-9]{10}$/;

function findProgram(query) {
  const q = (query || "").toString().trim().toLowerCase();
  if (!q) return null;
  return (
    PROGRAMS.find((p) => p.id.toLowerCase() === q) ||
    PROGRAMS.find((p) => p.name.toLowerCase() === q) ||
    PROGRAMS.find((p) => p.name.toLowerCase().includes(q)) ||
    PROGRAMS.find((p) => p.id.toLowerCase().includes(q.replace(/\s+/g, "-"))) ||
    null
  );
}

const TOOLS = [
  {
    name: "list_programs",
    description:
      "List the stores where Dark Money members currently earn cashback, with the commission and the member's 70% share at each. Call this to see where a purchase can earn cashback before routing it. Dark Money is location-specific: pass the member's country to list only the stores usable there.",
    inputSchema: {
      type: "object",
      properties: {
        country: {
          type: "string",
          description:
            "Optional ISO country code for the member's location, e.g. 'US', 'GB', 'RO'. When given, only programs a member in that country can use are listed (global programs always match).",
        },
      },
    },
  },
  {
    name: "get_cashback_link",
    description:
      "Get a Dark Money member's tracked cashback link for a store. Give the member this link (or open it for them): the purchase must go through it for the cashback to be credited to their balance. The human completes checkout — never purchase on the member's behalf. Requires the member's Dark Money member ID (format dm_XXXXXXXXXX). If the human is not a member yet, use join_dark_money first (with their consent).",
    inputSchema: {
      type: "object",
      properties: {
        store: {
          type: "string",
          description: "Store or program name, e.g. 'NordVPN', 'Ovago', 'ALZOO'.",
        },
        member_id: {
          type: "string",
          description: "The member's Dark Money ID, e.g. dm_Am5HeABD5C.",
        },
      },
      required: ["store", "member_id"],
    },
  },
  {
    name: "join_dark_money",
    description:
      "Create a free Dark Money membership for a human and return their member ID. ONLY call this with the human's explicit consent, using their own name and email, and only after they have agreed to the Terms (" +
      TERMS_URL +
      ") — setting terms_agreed=true asserts that agreement. Membership is free and activates instantly. The member earns 70% of commissions on purchases routed through their tracked links; payouts at $20.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The human's full name." },
        email: { type: "string", description: "The human's email address." },
        payout: {
          type: "string",
          enum: ["paypal", "venmo", "cashapp", "later"],
          description: "Preferred payout method; 'later' is fine — it can be set any time before the first payout.",
        },
        terms_agreed: {
          type: "boolean",
          description: "Must be true, and only when the human has actually agreed to the Dark Money Terms.",
        },
      },
      required: ["name", "email", "terms_agreed"],
    },
  },
];

function textResult(text, isError = false) {
  return { content: [{ type: "text", text }], ...(isError ? { isError: true } : {}) };
}

async function callTool(name, args = {}) {
  if (name === "list_programs") {
    const country = (args.country || "").toString().trim().toUpperCase();
    const serves = (p) =>
      !country ||
      (p.regions || []).includes(country) ||
      (p.regions || []).includes("GLOBAL");
    const list = PROGRAMS.filter(serves);
    const lines = list.map((p) => {
      const tag =
        p.regions && !(p.regions.length === 1 && p.regions[0] === "US")
          ? ` · serves ${p.regions.join(", ")}`
          : "";
      return `- ${p.name} (${p.network}): commission ${p.commission} ${p.note} — member earns ${p.member_earns}${tag}`;
    });
    const scope = country
      ? `${list.length} live programs usable in ${country} (${PROGRAMS.length} worldwide)`
      : `${PROGRAMS.length} live programs worldwide`;
    return textResult(
      `Dark Money — ${scope}. Members earn 70% of each commission; payouts at $20.\n\n${lines.join("\n")}\n\nUse get_cashback_link with the member's ID to route a purchase. The human always completes checkout.`
    );
  }

  if (name === "get_cashback_link") {
    const memberId = (args.member_id || "").toString().trim();
    if (!MEMBER_ID_RE.test(memberId)) {
      return textResult(
        `That member ID doesn't look right (expected format dm_XXXXXXXXXX). If the human isn't a member yet, join_dark_money can create a free membership with their consent.`,
        true
      );
    }
    const program = findProgram(args.store);
    if (!program) {
      const names = PROGRAMS.map((p) => p.name).join(", ");
      return textResult(`No live Dark Money program matches "${args.store}". Live programs: ${names}.`, true);
    }
    const url = program.link_template.replace("{SID}", memberId);
    return textResult(
      `${program.name} — commission ${program.commission} ${program.note}; the member earns ${program.member_earns}.\n\nTracked link for member ${memberId}:\n${url}\n\nRoute the purchase through this link and let the human complete checkout. Cashback credits after the store confirms the order (post return window).\n\nTell the human before they buy: pause other cashback/coupon browser extensions (Honey, Rakuten, Capital One Shopping) for this purchase — attribution is last-click and another extension can take the credit — and check out in the same browser where they opened the link; buying inside the store's app may not track.`
    );
  }

  if (name === "join_dark_money") {
    if (args.terms_agreed !== true) {
      return textResult(
        `Membership requires the human's agreement to the Terms (${TERMS_URL}). Show them the Terms and only call again with terms_agreed=true once they've agreed.`,
        true
      );
    }
    const res = await fetch(`${API}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: args.name,
        email: args.email,
        style: "agent",
        payout: args.payout || "later",
        terms: true,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) {
      return textResult(`Join failed: ${body.error || res.status}. Check the name and email and try again.`, true);
    }
    return textResult(
      body.existing
        ? `That email is already a Dark Money member. Member ID: ${body.member_id}\nMember app: ${body.app_url}`
        : `Membership created — welcome to Dark Money.\n\nMember ID: ${body.member_id}\nMember app (links + balance): ${body.app_url}\n\nSave the member ID: it's how purchases get credited. Use get_cashback_link with it for any store in list_programs. Founding offer: the first 25 members earn 100% of the commission on their first confirmed purchase.`
    );
  }

  return textResult(`Unknown tool: ${name}`, true);
}

// --- Minimal MCP stdio transport (newline-delimited JSON-RPC 2.0) ---
let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let idx;
  while ((idx = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (line) handle(line);
  }
});

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

async function handle(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }
  const { id, method, params } = msg;
  if (id === undefined || id === null) return; // notification — no reply

  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: params?.protocolVersion || "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "dark-money", version: "1.1.0" },
        },
      });
    } else if (method === "ping") {
      send({ jsonrpc: "2.0", id, result: {} });
    } else if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    } else if (method === "tools/call") {
      const result = await callTool(params?.name, params?.arguments || {});
      send({ jsonrpc: "2.0", id, result });
    } else {
      send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
    }
  } catch (err) {
    send({ jsonrpc: "2.0", id, error: { code: -32603, message: String(err && err.message || err) } });
  }
}
