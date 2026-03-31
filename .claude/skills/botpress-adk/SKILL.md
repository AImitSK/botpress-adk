---
name: botpress-adk
description: >
  Use this skill whenever the user is working with the Botpress ADK (Agent Development Kit) — a TypeScript framework for building Botpress AI agents in code. Trigger for: setting up a new ADK project, writing conversations, actions, tools, workflows, triggers, tables, or knowledge bases, configuring agent.config.ts, integrating external APIs (e.g. WordPress REST API, email), deploying with the adk CLI, using @botpress/runtime, or debugging in VS Code or Claude Code. Also trigger when user mentions "botpress adk", "adk init", "adk dev", "adk deploy", "@botpress/runtime", "Zai", or wants to build a Botpress bot via code instead of the visual Studio. Use this skill proactively any time Botpress ADK code is being written or discussed.
---

# Botpress ADK Skill

The Botpress ADK is a **TypeScript CLI + framework** (currently **beta**) for building Botpress AI agents entirely in code — no visual Studio needed.

## Reference files — load as needed

| File | Contents |
|------|----------|
| `references/quickstart.md` | Installation, CLI commands, first agent |
| `references/project-structure.md` | Directory layout, agent.config.ts, all src/ primitives |
| `references/concepts-conversations.md` | Conversation handlers, execute(), channels |
| `references/concepts-workflows.md` | Workflows, steps, scheduling, asTool() |
| `references/concepts-actions.md` | Actions, asTool(), integration actions |
| `references/concepts-tools.md` | Tools (AI-callable), ThinkSignal, best practices |
| `references/concepts-tables.md` | Table definitions, CRUD operations |
| `references/concepts-triggers.md` | Event subscriptions, multi-event handlers |
| `references/concepts-knowledge.md` | Knowledge bases, DataSource types, RAG |
| `references/managing-integrations.md` | adk add/remove/upgrade, configuration |
| `references/cli-reference.md` | Full CLI command reference |
| `references/runtime.md` | @botpress/runtime: client, context, adk, Zai |

---

## Quick orientation

### Install & create project
```bash
# Install ADK CLI (macOS/Linux)
curl -fsSL https://github.com/botpress/adk/releases/latest/download/install.sh | bash

adk init my-agent        # scaffold (choose "Hello World" template)
cd my-agent && bun install
adk dev                  # hot-reload dev server → http://localhost:3001
adk chat                 # terminal chat (separate window)
adk build                # compile for production
adk deploy               # deploy to Botpress Cloud
```

### Key imports
```typescript
import {
  Conversation, Workflow, Action, Autonomous, Trigger, Table,
  Knowledge, DataSource,
  client, context, adk, bot, user, configuration, actions,
  z, defineConfig
} from "@botpress/runtime"
```

### Project structure (summary)
```
my-agent/
├── agent.config.ts       ← defineConfig(): name, models, state, integrations
├── agent.json            ← { botId, workspaceId, devId }
└── src/
    ├── conversations/    ← Respond to user messages
    ├── workflows/        ← Scheduled / long-running processes
    ├── actions/          ← Reusable callable functions
    ├── tools/            ← AI-callable tools (given to execute())
    ├── tables/           ← Persistent data storage
    ├── triggers/         ← Event subscriptions
    └── knowledge/        ← RAG knowledge bases
```

---

## Essential patterns (copy-ready)

### Conversation + Tool (most common pattern)
```typescript
// src/conversations/main.ts
import { Conversation } from "@botpress/runtime"
import wpContacts from "../tools/wp-contacts"
import sendEmail from "../tools/send-email"

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: `You are an internal assistant. Help users find contacts,
        substitutions and documents from our company intranet.
        Always answer in the user's language.`,
      tools: [wpContacts, sendEmail],
    })
  },
})
```

### Tool — WordPress REST API
```typescript
// src/tools/wp-contacts.ts
import { Autonomous, z, configuration } from "@botpress/runtime"

export default new Autonomous.Tool({
  name: "getContacts",
  description: "Fetch contacts or substitutions from the WordPress intranet. Use when user asks about a person, department, or who is responsible for something.",
  input: z.object({
    search: z.string().optional().describe("Name or department to search for"),
  }),
  output: z.object({
    contacts: z.array(z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      department: z.string().optional(),
    })),
  }),
  handler: async ({ search }) => {
    const base = configuration.wordpressBaseUrl
    const url = `${base}/wp-json/wp/v2/ansprechpartner?per_page=50${search ? `&search=${encodeURIComponent(search)}` : ""}`
    const res = await fetch(url)
    const data = await res.json()
    return {
      contacts: data.map((p: any) => ({
        name: p.title?.rendered ?? "",
        email: p.acf?.email ?? "",
        phone: p.acf?.phone ?? "",
        department: p.acf?.department ?? "",
      })),
    }
  },
})
```

### Tool — File Download (WordPress Media)
```typescript
// src/tools/get-files.ts
import { Autonomous, z, configuration } from "@botpress/runtime"

export default new Autonomous.Tool({
  name: "getFiles",
  description: "Find downloadable files and documents from the intranet. Returns download links.",
  input: z.object({ search: z.string().describe("Filename or topic to search for") }),
  output: z.object({
    files: z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })),
  }),
  handler: async ({ search }) => {
    const base = configuration.wordpressBaseUrl
    const res = await fetch(`${base}/wp-json/wp/v2/media?search=${encodeURIComponent(search)}&per_page=20`)
    const data = await res.json()
    return {
      files: data.map((f: any) => ({
        name: f.title?.rendered ?? f.slug,
        url: f.source_url,
        type: f.mime_type,
      })),
    }
  },
})
```

### Action — Send Email
```typescript
// src/actions/sendEmail.ts
import { Action, z, configuration } from "@botpress/runtime"

export default new Action({
  name: "sendEmail",
  description: "Send an email to a recipient",
  input: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  output: z.object({ success: z.boolean(), error: z.string().optional() }),
  async handler({ input }) {
    try {
      // Example with SendGrid — swap for nodemailer/SMTP as needed
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${configuration.sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.to }] }],
          from: { email: configuration.fromEmail },
          subject: input.subject,
          content: [{ type: "text/plain", value: input.body }],
        }),
      })
      return { success: res.ok }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  },
})
```

### agent.config.ts — with secrets
```typescript
import { z, defineConfig } from "@botpress/runtime"

export default defineConfig({
  name: "intranet-bot",
  description: "Internal assistant: contacts, substitutions, documents, email",

  defaultModels: {
    autonomous: "claude-sonnet-4-20250514",
    zai: "claude-sonnet-4-20250514",
  },

  configuration: {
    schema: z.object({
      wordpressBaseUrl: z.string(),
      sendgridApiKey: z.string(),
      fromEmail: z.string(),
    }),
  },

  dependencies: {
    integrations: {
      webchat: { version: "webchat@latest", enabled: true },
    },
  },
})
```
Set values via ADK console (`http://localhost:3001`) or `adk config:set`.

---

## WordPress integration tips

- REST API base: `/wp-json/wp/v2/`
- Standard endpoints: `posts`, `pages`, `media`, `users`
- Custom Post Types (CPT): `/wp-json/wp/v2/{cpt-slug}`
- ACF fields: install **ACF to REST API** plugin → fields appear in `post.acf`
- Media download: use `item.source_url` directly as the download link
- Authentication: for protected content use Application Passwords (`Authorization: Basic base64(user:app-password)`)

---

## Integration management (CLI)
```bash
adk add webchat             # add integration
adk add slack@latest
adk upgrade webchat         # update to latest
adk remove slack            # remove
adk search email            # search hub for integrations
adk list                    # list installed
adk mcp:init --tool claude-code  # set up MCP for Claude Code
```

---

## State & configuration
```typescript
import { bot, user, configuration } from "@botpress/runtime"

// Bot-wide state (persists across all conversations)
bot.state.lastSyncedAt = new Date().toISOString()

// Per-user state
user.state.preferredLanguage = "de"

// Config values from agent.config.ts schema
const apiKey = configuration.sendgridApiKey
```

---

## Zai — structured LLM calls
```typescript
import { adk, z } from "@botpress/runtime"

const result = await adk.zai.generate({
  instructions: "Extract name and email from this text",
  input: rawText,
  output: z.object({ name: z.string(), email: z.string() }),
})
// result.name, result.email — fully typed
```

---

## VS Code + Claude Code workflow
1. Open project root in VS Code
2. Run `adk dev` in integrated terminal → hot reload + console at localhost:3001
3. Use Claude Code for pair-programming in the same workspace
4. `adk chat` in second terminal to test interactively
5. `adk deploy` when ready

### MCP integration with Claude Code
```bash
adk mcp:init --tool claude-code   # generates .mcp.json
adk mcp                            # start MCP server
```

---

## Beta caveats
- Always check https://botpress.com/docs/adk for latest changes
- Pin `@botpress/runtime` version for stability in production
- Workflows timeout after 2 min by default — use `step()` for longer tasks
- Directory knowledge sources only work in `adk dev`, not production
- If ADK lacks a feature, it may still be in Botpress Studio
