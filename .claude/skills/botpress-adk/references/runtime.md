# Botpress ADK — Runtime Utilities (@botpress/runtime)

Source: https://botpress.com/docs/adk/runtime (January 2026)

## client — Botpress API client (works anywhere)

```typescript
import { client } from "@botpress/runtime"

const { conversations } = await client.listConversations({})
const { user } = await client.getUser({ id: "user-id" })
await client.createMessage({ conversationId: "...", userId: "...", payload: { type: "text", text: "Hello" } })
```

Auth: uses bot-specific client in handlers; uses `ADK_TOKEN` + `ADK_BOT_ID` env vars in scripts.

## context — AsyncLocalStorage execution context

```typescript
import { context } from "@botpress/runtime"

const botId = context.get("botId")
const conversation = context.get("conversation")          // conversation/message handlers only
const user = context.get("user", { optional: true })      // won't throw if missing
const message = context.get("message")
const remaining = context.get("runtime").getRemainingExecutionTimeInMs()
```

### Available context keys

| Key | When available |
|-----|----------------|
| executionId | always |
| botId | always |
| bot | always |
| client | always |
| cognitive | always |
| logger | always |
| configuration | always |
| conversation | conversation/message handlers |
| user | when user associated |
| event | event/trigger handlers |
| message | message handlers |
| workflow | workflow handlers |
| runtime | always |

### Checking execution time (avoid timeouts)

```typescript
async function processItems(items: Item[]) {
  const SAFETY_MARGIN = 5000 // ms
  for (const item of items) {
    const remaining = context.get("runtime").getRemainingExecutionTimeInMs()
    if (remaining < SAFETY_MARGIN) {
      await saveProgress()
      return { completed: false }
    }
    await processItem(item)
  }
  return { completed: true }
}
```

### Default context for scripts

```typescript
context.setDefaultContext({ botId: "my-bot-id" })
// ... use context.get() ...
context.clearDefaultContext()
```

## adk — Project utilities

```typescript
import { adk } from "@botpress/runtime"

const config = adk.project.config        // agent.config.ts values
adk.environment.isDevelopment()          // true in adk dev
adk.environment.isProduction()           // true after adk deploy
```

## adk.execute() — autonomous agent outside conversations

```typescript
import { adk, Autonomous, z } from "@botpress/runtime"

const myTool = new Autonomous.Tool({
  name: "analyzeData",
  description: "Analyze dataset and return insights",
  input: z.object({ datasetId: z.string() }),
  output: z.object({ insights: z.array(z.string()) }),
  handler: async ({ datasetId }) => ({ insights: ["Finding 1"] }),
})

const result = await adk.execute({
  instructions: "Analyze the sales data",
  tools: [myTool],
  iterations: 5,
  temperature: 0.7,
})
```

### execute() parameters

| Param | Type | Description |
|-------|------|-------------|
| instructions | string | Agent instructions |
| tools | Tool[] | Available tools |
| objects | object[] | Objects agent can interact with |
| exits | Record<string,object> | Exit handlers |
| signal | AbortSignal | Cancel execution |
| temperature | number | AI temperature (default 0.7) |
| model | string\|string[] | Model name(s) |
| iterations | number | Max iterations (default 10) |
| hooks | object | onTrace, onIterationEnd, onBeforeTool, onAfterTool, onBeforeExecution, onExit |

## Zai — structured LLM operations

```typescript
import { adk, z } from "@botpress/runtime"

const result = await adk.zai.generate({
  instructions: "Summarize this text in 2 sentences",
  input: longText,
  output: z.object({
    summary: z.string(),
    wordCount: z.number(),
  }),
})
// result.summary, result.wordCount — fully typed
```

## Global state exports

```typescript
import { bot, user, configuration } from "@botpress/runtime"

// Bot-wide state (all conversations share this)
bot.state.lastSyncedAt = new Date().toISOString()
const val = bot.state.someField

// Per-user state
user.state.preferredLanguage = "de"
user.state.visitCount = (user.state.visitCount || 0) + 1

// Config values (defined in agent.config.ts schema)
const apiKey = configuration.sendgridApiKey
const baseUrl = configuration.wordpressBaseUrl
```

State schemas must be defined in `agent.config.ts` under `bot.state`, `user.state`.
