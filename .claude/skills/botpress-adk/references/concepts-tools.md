# Botpress ADK — Tools

Source: https://botpress.com/docs/adk/concepts/tools (March 2026)

Tools are functions the AI model can call during conversations. They enable the agent to fetch data, trigger actions, or interact with external systems dynamically.

## Creating a tool

```typescript
// src/tools/myTool.ts
import { Autonomous, z } from "@botpress/runtime"

export default new Autonomous.Tool({
  name: "myTool",
  description: "A tool that does something useful",
  input: z.object({}),
  output: z.object({}),
  handler: async ({}) => {
    return {}
  },
})
```

## Tool with full input/output

```typescript
export default new Autonomous.Tool({
  name: "getWeather",
  description: "Get the current weather for a location",
  input: z.object({
    location: z.string().describe("The city or location name"),
    unit: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature unit"),
  }),
  output: z.object({
    temperature: z.number(),
    condition: z.string(),
  }),
  handler: async ({ location, unit }) => {
    const weather = await fetchWeatherData(location, unit)
    return { temperature: weather.temp, condition: weather.condition }
  },
})
```

## Using tools in conversations

```typescript
import { Conversation } from "@botpress/runtime"
import getWeather from "../tools/weather"

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: "You are a helpful weather assistant.",
      tools: [getWeather],
    })
  },
})
```

## Multiple tools

```typescript
await execute({
  instructions: "You are a helpful assistant with access to various tools.",
  tools: [getWeather, searchDatabase, processOrder],
})
```

## Converting actions to tools

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

## Converting workflows to tools

```typescript
import { Conversation } from "@botpress/runtime"
import myWorkflow from "../workflows/index"

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: "You are a helpful assistant.",
      tools: [myWorkflow.asTool()],
    })
  },
})
```

## Tool descriptions — crucial for AI

The `description` field determines when the AI calls your tool. Be explicit:

```typescript
export default new Autonomous.Tool({
  name: "calculateTotal",
  description: "Calculate the total price of items including tax and shipping. Use this when the user asks about prices, costs, or totals.",
  // ...
})
```

## ThinkSignal — steer the AI without returning data

```typescript
import { Autonomous } from "@botpress/runtime"

export default new Autonomous.Tool({
  name: "searchDatabase",
  handler: async ({ query }) => {
    const results = await search(query)
    if (results.length === 0) {
      throw new Autonomous.ThinkSignal(
        "No results found",
        "No results were found. Try a different search query."
      )
    }
    return results
  },
})
```

## Tool props reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| name | string | yes | Valid TypeScript identifier |
| description | string | no | Crucial — helps AI know when to call the tool |
| input | z.ZodTypeAny | no | Input schema (use `.describe()` on fields) |
| output | z.ZodTypeAny | no | Output schema |
| handler | async fn | yes | Receives validated args + `ctx.callId` |
| aliases | string[] | no | Alternative names |
| staticInputValues | object | no | Values always applied automatically |
| retry | fn | no | Custom retry logic |

## Best practices

- Write clear, specific descriptions — the AI uses them to decide when to call the tool
- Use `.describe()` on Zod fields to guide the AI on what to pass
- Keep handlers focused on a single responsibility
- Use `ThinkSignal` to redirect the AI when results are empty or invalid
- Test tools independently before wiring into conversations
