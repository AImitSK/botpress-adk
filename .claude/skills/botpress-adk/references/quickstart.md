# Botpress ADK Quickstart Reference

Source: https://botpress.com/docs/adk/quickstart (March 2026)

## Requirements
- Botpress account: https://sso.botpress.cloud
- Node.js v22.0.0+
- Package manager: bun (recommended), pnpm, yarn, or npm

## Installation

macOS/Linux:
```bash
curl -fsSL https://github.com/botpress/adk/releases/latest/download/install.sh | bash
adk --version
```
Windows: See official docs for PowerShell installer.

## Initialize

```bash
adk init my-agent           # choose template: Blank or Hello World
cd my-agent
bun install                 # or npm/pnpm/yarn
```

Generated files:
- `agent.config.ts` — agent config + integration deps
- `agent.json` — { botId, workspaceId, devId }
- `package.json` — scripts: dev, build, deploy
- `tsconfig.json`
- `src/` — source directories

## Development loop

```bash
adk dev        # hot-reload server + console at http://localhost:3001
adk chat       # terminal chat (separate window, requires adk dev)
```

## Build & Deploy

```bash
adk build      # compiles to .adk/bot/.botpress/dist
adk deploy     # uploads to Botpress Cloud workspace
```
