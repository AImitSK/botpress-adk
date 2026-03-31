# Botpress ADK — Managing Integrations

Source: https://botpress.com/docs/adk/managing-integrations (March 2026)

## Adding integrations

```bash
adk add webchat
adk add slack@latest
adk add my-workspace/custom-integration@1.0.0
adk add webchat --alias custom-webchat   # with custom alias
```

The CLI automatically updates `agent.config.ts` and regenerates TypeScript types.

## Manual configuration in agent.config.ts

```typescript
export default defineConfig({
  dependencies: {
    integrations: {
      webchat: {
        version: "webchat@latest",
        enabled: true,
      },
      slack: {
        version: "slack@0.5.0",
        enabled: true,
      },
      email: {
        version: "email@latest",
        enabled: false,  // installed but not active
      },
    },
  },
})
```

After manual edits: run `adk dev` or `adk build` to regenerate types.

## Version formats

| Format | Example | Use case |
|--------|---------|----------|
| `name@latest` | `webchat@latest` | Auto-receive updates |
| `name@x.y.z` | `slack@0.5.0` | Pin for production stability |
| `workspace/name@x.y.z` | `my-workspace/custom@1.0.0` | Custom workspace integration |
| `interface:name@x.y.z` | `interface:hitl@1.0.0` | Interface integrations |

## Updating integrations

```bash
adk upgrade webchat         # upgrade specific integration
adk upgrade                 # interactive selection
```

Or manually update version in `agent.config.ts`, then `adk dev` to regenerate types.

## Removing integrations

```bash
adk remove slack            # remove specific
adk remove                  # interactive selection
```

## Searching and listing

```bash
adk search email            # search hub
adk list                    # list installed integrations
adk list --available        # list all available on hub
adk info slack              # detailed info about an integration
adk info slack --actions    # show only actions
adk info webchat --full     # show all details
```

## Integration configuration

Some integrations (e.g. Instagram) require configuration after adding:

```bash
adk add instagram
# → "Please configure it in the UI using the adk dev command"
```

Configure via ADK console at `http://localhost:3001` → Integration Settings.

Or via CLI:
```bash
adk config:set myKey myValue
adk config:get myKey
adk config:set myKey myValue --prod   # production config
```

## Using integration actions in code

After adding an integration, its actions are available via the `actions` import:

```typescript
import { actions } from "@botpress/runtime"

// Webchat
await actions.webchat.showWebchat({ conversationId })

// Slack (if added)
await actions.slack.sendMessage({ channel: "#general", text: "Hello" })
```

## MCP setup for Claude Code / Cursor

```bash
adk mcp:init --tool claude-code    # configure for Claude Code
adk mcp:init --tool cursor         # configure for Cursor
adk mcp:init --all                 # all supported tools
adk mcp                            # start MCP server
```
