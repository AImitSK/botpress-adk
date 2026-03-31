# Botpress ADK — CLI Reference

Source: https://botpress.com/docs/adk/cli-reference (January 2026)

## Installation & version

```bash
# macOS/Linux
curl -fsSL https://github.com/botpress/adk/releases/latest/download/install.sh | bash
adk --version
adk self-upgrade          # upgrade CLI
adk self-upgrade beta     # upgrade to beta channel
```

## Global flags

| Flag | Description |
|------|-------------|
| `--help`, `-h` | Show help |
| `--version`, `-V` | Show version |
| `--no-cache` | Disable caching for integration lookups |

## Core commands

### `adk init`
```bash
adk init my-agent
adk init my-agent --template hello-world   # or --template blank
```

### `adk dev`
```bash
adk dev                    # start dev server (hot reload)
adk dev --port 3000        # custom port (default 3000)
adk dev --port-console 3001  # console UI port (default 3001)
adk dev --logs             # stream logs to stderr (CI mode, no UI)
```

### `adk build`
```bash
adk build    # compile to .adk/bot/.botpress/dist
```

### `adk deploy`
```bash
adk deploy                 # deploy to Botpress Cloud (production)
adk deploy --env production
adk deploy -y              # skip confirmation prompts
```

### `adk chat`
```bash
adk chat    # terminal chat with dev agent (requires adk dev running)
```

### `adk run` — execute TypeScript scripts with full runtime
```bash
adk run scripts/migrate-data.ts
adk run scripts/seed-tables.ts --prod   # use production bot
adk run scripts/analyze.ts arg1 arg2
```

Script exports (called automatically):
```typescript
export default async function(arg1: string, arg2: string) { }  // or
export async function run(arg1: string, arg2: string) { }       // or
export async function main(arg1: string, arg2: string) { }      // or
console.log("top-level code runs on import")
```

## Integration management

```bash
adk add webchat                         # add integration
adk add slack@latest
adk add my-workspace/custom@1.0.0
adk add webchat --alias my-webchat     # with alias
adk upgrade webchat                     # upgrade (alias: up)
adk remove slack                        # remove (alias: rm)
adk search email                        # search hub (--format json, --limit N)
adk list                                # list installed
adk list --available                    # list all on hub
adk info slack                          # info about integration
adk info slack --actions                # show only actions
adk info webchat --full --format json  # all details as JSON
```

## Authentication & profiles

```bash
adk login                              # interactive login
adk login --token <token>             # with API token
adk login --profile staging           # named profile
adk profiles list                      # list all profiles
adk profiles set staging              # switch profile
```

## Configuration

```bash
adk config                            # interactive config (dev)
adk config --prod                     # interactive config (production)
adk config:get myKey                  # get value
adk config:set myKey myValue          # set value
adk config:set myKey myValue --prod   # set in production
```

## Knowledge bases

```bash
adk kb sync --dev           # sync KB with dev bot
adk kb sync --prod          # sync KB with production bot
adk kb sync --prod --force  # force full re-sync
adk kb sync --dry-run       # preview changes
```

## MCP (Model Context Protocol)

```bash
adk mcp                                          # start MCP server
adk mcp --cwd ./my-agent                         # specify working dir
adk mcp:init --tool claude-code                  # generate Claude Code config
adk mcp:init --tool cursor                       # generate Cursor config
adk mcp:init --tool claude-code --tool vscode   # multiple tools
adk mcp:init --all                               # all supported tools
adk mcp:init --all --force                       # overwrite existing config
adk mcp:init --tool claude-code --project-dir ./bot  # monorepo
```

## Assets

```bash
adk assets sync                    # sync assets to remote
adk assets sync --dry-run          # preview
adk assets sync --force            # force re-upload all
adk assets list                    # list all assets
adk assets list --local            # local only
adk assets list --remote           # remote only
adk assets status                  # sync status
adk assets pull                    # download remote assets
```

## Bot linking

```bash
adk link                                        # interactive
adk link --workspace <id> --bot <id>           # direct link
adk link --workspace <id> --bot <id> --dev <id> --force
```

## Telemetry

```bash
adk telemetry --status
adk telemetry --enable
adk telemetry --disable
```
