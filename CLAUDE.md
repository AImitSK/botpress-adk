# CLAUDE.md

## Projekt
WordPress-Plugin + Botpress ADK Agent als **KI-Support-Bot für Webseitenbesucher**.
Wiederverwendbar für verschiedene Firmen — keine firmenspezifischen Hardcodes.
Zwei Hauptkomponenten: `/plugin` (WP-Plugin) und `/agent` (ADK-Bot).
Dokumentation: siehe `docs/`.

## Kunden-Onboarding
- `/setup-kunde` — Claude Code Slash-Command für neuen Kunden (Bot erstellen, deployen, ZIP generieren)
- Kunde installiert ZIP in WordPress → aktiviert → fertig
- `developer-config.php` enthält Kunden-spezifische Werte (git-ignored)

## Plugin (WordPress)
- PHP 8.x, WordPress 6.x+
- **Admin-Panel** mit Sidebar-Navigation (Botpress-style UI):
  - Bot Identity (Name, Avatar, Beschreibung, Kontaktdaten)
  - Bot Appearance (Color-Picker, Theme Mode, Header/Message Style, Corner Radius)
  - Features (Feedback, File Upload, Notification Sound, History)
  - Data Sources (CPTs an/aus, Sprache)
  - Connection (Status, Reconnect)
- **Knowledge Base** (in Planung): Flexible Datenquellen (Text, Dateien, Tabellen, WP-Daten Mapping, Seiten, Scraping)
- Webchat v3.6 Embed mit Live-Preview im Admin
- REST-Endpoints unter `bpwc/v1/bot/*` mit Bearer-Token Auth
- Auto-Registration bei Botpress Cloud (Plugin → API → Bot-Config)
- Conversation Viewer: Chat-Gespräche aus Botpress Cloud API
- WP-Actions/Filter für Extensibility

## Agent (Botpress ADK)
- TypeScript, Bun als Package Manager
- Botpress ADK — `adk dev` / `adk deploy`
- Datenquellen: WordPress REST API (strukturierte Daten)
- E-Mail-Versand via SendGrid API (direkt im Agent)
- Wird pro Kunde einmal deployed (identischer Code, kunden-spezifische Config)

## Wichtige Konventionen
- Tools in agent/src/tools/ für alle externen API-Calls
- Actions in agent/src/actions/ für Seiteneffekte (Email via SendGrid, etc.)
- Konfigurationswerte IMMER über `configuration.*` — nie hardcoden
- Sprache der Bot-Antworten: konfigurierbar (Standard: Deutsch)
- Plugin-Code folgt WordPress Coding Standards (PHP)
- Admin-UI mit React via @wordpress/scripts
- Secrets nie committen (`developer-config.php`, `output/` sind git-ignored)

## Dev-Setup
- Docker: `docker compose up` → WordPress auf localhost:8080 (admin/admin)
- Plugin-Build: `cd plugin && npm install && npm run build`
- Agent: `adk dev` im `agent/` Verzeichnis
- ADK CLI: `C:\Users\skuehne\AppData\Local\Programs\adk\adk.exe`
- Bun: `C:\Users\skuehne\.bun\bin\bun.exe`
