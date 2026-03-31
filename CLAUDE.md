# CLAUDE.md

## Projekt
WordPress-Plugin + Botpress ADK Agent als **KI-Support-Bot für Webseitenbesucher**.
Wiederverwendbar für verschiedene Firmen — keine firmenspezifischen Hardcodes.
Zwei Hauptkomponenten: `/plugin` (WP-Plugin) und `/agent` (ADK-Bot).
Detaillierter Plan: siehe `PLAN.md`.

## Bot-Features
- Ansprechpartner für verschiedene Aufgaben finden
- Nachrichten an Mitarbeiter übermitteln (via SendGrid)
- Produktberatung
- Download-Links raussuchen (Datenblätter, Broschüren)
- Ländervertretungen / Kontakte finden
- Produktanfragen → auf passende Formulare verweisen
- Allgemeine Unternehmensfragen beantworten

## Plugin (WordPress)
- PHP 8.x, WordPress 6.x+
- Settings-Seite im WP-Admin (React): Connection, Styling, Data Sources
- Webchat-Widget Einbettung mit Customizer (Farben, Schriften, Position)
- Custom Post Types: Kontakte, Produkte, Downloads, Ländervertretungen (optional an/aus)
- REST-Endpoints unter `bpwc/v1/bot/*` mit Bearer-Token Auth
- WP-Actions/Filter für Extensibility
- Kompatibel mit klassischen Themes und Full Site Editing (FSE)

## Agent (Botpress ADK)
- TypeScript, Bun als Package Manager
- Botpress ADK — `adk dev` startet den Dev-Server
- Datenquellen: WordPress REST API (strukturierte Daten) + Botpress Knowledge Base (Website-Inhalte)
- E-Mail-Versand via SendGrid API (direkt im Agent)

## Wichtige Konventionen
- Tools in agent/src/tools/ für alle externen API-Calls
- Actions in agent/src/actions/ für Seiteneffekte (Email via SendGrid, etc.)
- Konfigurationswerte IMMER über `configuration.*` — nie hardcoden
- Sprache der Bot-Antworten: konfigurierbar (Standard: Deutsch)
- Plugin-Code folgt WordPress Coding Standards (PHP)
- Admin-UI mit React via @wordpress/scripts
- Meta-Felder via `register_post_meta()` — kein ACF-Dependency

## Dev-Setup
- Docker: `docker compose up` → WordPress auf localhost:8080 (admin/admin)
- Agent: `adk dev` im `agent/` Verzeichnis
- ADK CLI: `C:\Users\skuehne\AppData\Local\Programs\adk\adk.exe`
- Bun: `C:\Users\skuehne\.bun\bin\bun.exe`
