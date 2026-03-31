# Botpress ADK — Actions

Source: https://botpress.com/docs/adk/concepts/actions (March 2026)

Actions are callable functions invoked by workflows, conversations, or other actions. They encapsulate reusable logic.

## Creating an action

```typescript
// src/actions/myAction.ts
import { Action, z } from "@botpress/runtime"

export default new Action({
  name: "myAction",
  input: z.object({}),
  output: z.object({}),
  handler: async ({ input }) => {
    return {}
  },
})
```

## Input/output schemas

```typescript
export default new Action({
  name: "calculateTotal",
  input: z.object({
    items: z.array(z.object({
      price: z.number(),
      quantity: z.number(),
    })),
  }),
  output: z.object({ total: z.number() }),
  handler: async ({ input }) => {
    const total = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { total }
  },
})
```

## Calling actions

From a workflow:
```typescript
import { Workflow, actions } from "@botpress/runtime"

export default new Workflow({
  name: "someWorkflow",
  handler: async ({}) => {
    const result = await actions.doSomething()
  },
})
```

## Actions as tools in conversations

```typescript
import { Conversation, actions } from "@botpress/runtime"

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: "You are a helpful assistant.",
      tools: [actions.calculateTotal.asTool()],
    })
  },
})
```

## Integration actions

When an integration is installed, its actions become available via `actions`:

```typescript
import { Trigger, actions } from "@botpress/runtime"

export default new Trigger({
  name: "webchatConversationStarted",
  events: ["webchat:conversationStarted"],
  handler: async ({ event }) => {
    if (event.conversationId) {
      await actions.webchat.showWebchat({ conversationId: event.conversationId })
    }
  },
})
```

## Action props reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| name | string | yes | Unique, alphanumeric, no spaces |
| title | string | no | Display title |
| description | string | no | What the action does |
| input | z.ZodTypeAny | yes | Input schema |
| output | z.ZodTypeAny | yes | Output schema |
| cached | boolean | no | Cache results (default: false) |
| handler | async fn | yes | Receives `{ input, client }` |

## Handler parameters

| Param | Type | Description |
|-------|------|-------------|
| input | any | Validated input matching schema |
| client | Client | Botpress API client |
