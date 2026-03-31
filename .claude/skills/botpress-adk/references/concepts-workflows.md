# Botpress ADK — Workflows

Source: https://botpress.com/docs/adk/concepts/workflows (March 2026)

Workflows are long-running processes for complex multi-step operations or scheduled tasks. Unlike conversations, they run independently or on a schedule.

Note: ADK Workflows differ from Botpress Studio Workflows — don't treat them as equivalent.

## Basic workflow

```typescript
// src/workflows/myWorkflow.ts
import { Workflow } from "@botpress/runtime"

export default new Workflow({
  name: "my-workflow",
  description: "A workflow that processes data",
  handler: async ({}) => {
    // Workflow logic
  },
})
```

## Scheduled workflow (cron)

```typescript
import { WebsiteKB } from '../knowledge/docs'

export default new Workflow({
  name: "periodic-indexing",
  description: "Indexes knowledge base every 6 hours",
  schedule: "0 */6 * * *",
  handler: async ({}) => {
    await WebsiteKB.refresh()
  },
})
```

## Steps — for long-running workflows

Default timeout is 2 minutes. Use `step()` to break into checkpoints.
Steps are **persisted** — if interrupted, the workflow resumes from the last completed step.

```typescript
export default new Workflow({
  name: "data-processing",
  handler: async ({ step }) => {
    const data = await step("fetch-data", async () => {
      return await fetchDataFromAPI()
    })

    const processed = await step("process-data", async () => {
      return processData(data)
    })

    await step("store-results", async () => {
      await saveResults(processed)
    })
  },
})
```

## Workflow with input/output

```typescript
export default new Workflow({
  name: "calculate-totals",
  input: z.object({ orderId: z.string() }),
  output: z.object({ total: z.number() }),
  handler: async ({ input, step }) => {
    const order = await step("fetch-order", async () => {
      return await fetchOrder(input.orderId)
    })
    return { total: order.total }
  },
})
```

## Error handling in steps

```typescript
try {
  await step("risky-step", async ({ attempt }) => {
    console.log(`Attempt #${attempt}`)
    // logic here
  }, { maxAttempts: 10 })
} catch (err) {
  console.log("Step failed after max attempts:", err)
}
```

## Workflow methods

### workflow.start()
```typescript
import ProcessingWorkflow from "../workflows/processing"

const instance = await ProcessingWorkflow.start({ orderId: "12345" })
console.log("Started workflow:", instance.id)
```

### workflow.getOrCreate() — deduplication
```typescript
const instance = await ProcessingWorkflow.getOrCreate({
  key: "order-12345",
  input: { orderId: "12345" },
  statuses: ["pending", "in_progress"],
})
```

### workflow.asTool() — expose workflow as AI tool
```typescript
import { Conversation } from "@botpress/runtime"
import ProcessingWorkflow from "../workflows/processing"

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: "You are a helpful assistant.",
      tools: [ProcessingWorkflow.asTool()],
    })
  },
})
```

### workflow.provide() — respond to data requests
```typescript
import { Conversation } from "@botpress/runtime"
import OrderWorkflow from "../workflows/order"

export default new Conversation({
  channel: "*",
  handler: async ({ type, request }) => {
    if (type === "workflow_request") {
      await OrderWorkflow.provide(request, { orderId: "12345" })
    }
  },
})
```

## Helper functions

```typescript
import { isWorkflowDataRequest, isWorkflowCallback } from "@botpress/runtime"

if (isWorkflowDataRequest(event)) { /* handle data request */ }
if (isWorkflowCallback(event)) { /* handle callback */ }
```

## Workflow props reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| name | string | yes | Unique workflow identifier |
| description | string | no | What the workflow does |
| input | z.ZodTypeAny | no | Input schema |
| output | z.ZodTypeAny | no | Output schema |
| state | z.ZodTypeAny | no | Persistent state schema |
| requests | object | no | Named request schemas |
| handler | async fn | yes | Workflow logic |
| schedule | string | no | Cron expression |
| timeout | string | no | e.g. "5m", "1h" (default: "5m") |

## Handler parameters

| Param | Description |
|-------|-------------|
| input | Validated input |
| state | Persistent workflow state |
| step | Step function + methods (listen, fail, progress, abort, sleep, sleepUntil, waitForWorkflow, executeWorkflow, map, forEach, batch, request) |
| client | Botpress API client |
| signal | AbortSignal |
| execute | Run autonomous AI logic (same as conversation execute()) |
