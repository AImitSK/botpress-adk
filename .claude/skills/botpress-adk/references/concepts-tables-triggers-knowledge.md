# Botpress ADK — Tables, Triggers, Knowledge

Sources: botpress.com/docs/adk/concepts/{tables,triggers,knowledge} (March 2026)

---

## Tables

Tables provide structured persistent storage synced with Botpress Cloud.

### Creating a table

```typescript
// src/tables/orderTable.ts
import { Table, z } from "@botpress/runtime"

export default new Table({
  name: "OrderTable",   // Must end with "Table", ≤30 chars, no spaces
  columns: {
    userId: z.string(),
    items: z.array(z.string()),
    total: z.number(),
    status: z.string(),
    createdAt: z.string().datetime(),
  },
})
```

### Extended column definition (with options)

```typescript
export default new Table({
  name: "ProductTable",
  columns: {
    itemName: {
      schema: z.string(),
      searchable: true,   // enable text search on this column
    },
    price: {
      schema: z.string(),
      searchable: true,
    },
    total: {
      schema: z.number(),
      computed: true,     // computed from other columns
      dependencies: ["price", "quantity"],
      value: async (row) => parseFloat(row.price) * row.quantity,
    },
  },
})
```

### Using tables (CRUD)

```typescript
import { Workflow } from "@botpress/runtime"
import OrderTable from "../tables/orderTable"

export default new Workflow({
  name: "createOrder",
  handler: async ({}) => {
    // Create
    const { rows } = await OrderTable.createRows({
      rows: [{ userId: "user123", total: 99.99, status: "pending" }],
    })

    // Read / filter
    const { rows: orders } = await OrderTable.findRows({
      filter: { status: "pending" },
      orderBy: "createdAt",
      orderDirection: "desc",
      limit: 10,
    })

    // Update
    await OrderTable.updateRows({
      rows: [{ id: orders[0].id, status: "completed" }],
    })

    // Delete
    await OrderTable.deleteRows({ ids: [orders[0].id] })
  },
})
```

### Table naming rules
- Must end with `Table`
- ≤30 characters
- Letters, numbers, underscores only
- Cannot start with a number

---

## Triggers

Triggers subscribe to events and execute handlers when those events occur.

### Creating a trigger

```typescript
// src/triggers/conversationStarted.ts
import { Trigger } from "@botpress/runtime"

export default new Trigger({
  name: "conversationStarted",
  events: ["webchat:conversationStarted"],
  handler: async ({ event }) => {
    // event.type → event type string
    // event.payload → event data (varies by integration)
  },
})
```

### Event structure

```typescript
export default new Trigger({
  name: "reactionAdded",
  events: ["whatsapp:reactionAdded"],
  handler: async ({ event }) => {
    const reactionData = event.payload
    if (reactionData.reaction === "U+1F44D") {
      // thumbs up received
    }
  },
})
```

### Multiple events in one trigger

```typescript
export default new Trigger({
  name: "onLinearIssueUpdate",
  events: ["linear:issueCreated", "linear:issueDeleted", "linear:issueUpdated"],
  handler: async ({ event }) => {
    if (event.type === "linear:issueDeleted") {
      // handle deletion
    } else if (event.type === "linear:issueCreated") {
      // handle creation
    } else if (event.type === "linear:issueUpdated") {
      // handle update
    }
  },
})
```

### Trigger props reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| name | string | yes | Alphanumeric + underscores, 3–255 chars |
| description | string | no | <1024 chars |
| events | string[] | yes | Array of event names to subscribe to |
| handler | async fn | yes | Receives `{ event }` |

---

## Knowledge

Knowledge bases provide RAG context to the agent's AI model.

### Basic knowledge base

```typescript
// src/knowledge/docs.ts
import { Knowledge, DataSource } from "@botpress/runtime"

export default new Knowledge({
  name: "documentation",
  description: "Company documentation and intranet content",
  sources: [],
})
```

### Website sources

```typescript
// From sitemap (recommended)
const SitemapSource = DataSource.Website.fromSitemap(
  "https://example.com/sitemap.xml",
  {
    filter: ({ url }) => !url.includes("/admin"),
    maxPages: 1000,
    maxDepth: 10,
  }
)

// From base URL (requires Browser integration)
const CrawlSource = DataSource.Website.fromWebsite(
  "https://example.com",
  { maxPages: 500, maxDepth: 5 }
)

// From llms.txt
const LlmsSource = DataSource.Website.fromLlmsTxt("https://example.com/llms.txt")

// From specific URLs
const UrlsSource = DataSource.Website.fromUrls([
  "https://example.com/page1",
  "https://example.com/page2",
])
```

### File source (development only)

```typescript
const FileSource = DataSource.Directory.fromPath("./src/knowledge/docs", {
  filter: (path) => path.endsWith(".md") || path.endsWith(".txt"),
})
// ⚠️ Only works with `adk dev` — not in production. Use website sources for prod.
```

### Using knowledge in conversations

```typescript
import { Conversation } from "@botpress/runtime"
import { WebsiteKB } from "../knowledge/docs"

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: "You are a helpful assistant.",
      knowledge: [WebsiteKB],
    })
  },
})
```

### Refreshing knowledge

```typescript
import { Workflow } from "@botpress/runtime"
import WebsiteKB from "../knowledge/docs"

export default new Workflow({
  name: "refresh-knowledge",
  schedule: "0 0 * * *", // Daily at midnight
  handler: async () => {
    await WebsiteKB.refresh()              // normal refresh
    await WebsiteKB.refresh({ force: true }) // force re-index everything
    await WebsiteKB.refreshSource("my-source-id", { force: true }) // single source
  },
})
```

### Or via CLI

```bash
adk kb sync --dev    # sync with dev bot
adk kb sync --prod   # sync with production bot
adk kb sync --prod --force  # force full re-sync
```

### Website source options

| Option | Type | Description |
|--------|------|-------------|
| id | string | Optional unique identifier |
| filter | fn | `({ url }) => boolean` |
| fetch | string\|fn | `'node:fetch'` (default), `'integration:browser'`, or custom |
| maxPages | number | 1–50000 (default: 50000) |
| maxDepth | number | 1–20 (default: 20) |
