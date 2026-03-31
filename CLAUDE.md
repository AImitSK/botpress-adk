# CLAUDE.md

## Projekt
WordPress-Plugin + Botpress ADK Agent für internes Intranet.
Zwei Hauptkomponenten: `/plugin` (WP-Plugin) und `/agent` (ADK-Bot).

## Plugin (WordPress)
- PHP 8.x, WordPress 6.x+
- Settings-Seite im WP-Admin: Workspace-Verbindung, Bot-Konfiguration
- Webchat-Widget Einbettung mit Customizer (Farben, Schriften, Position)
- WP-Actions/Filter für Kontextübergabe (Benutzer, Seite, Custom Vars)
- Kompatibel mit klassischen Themes und Full Site Editing (FSE)

## Agent (Botpress ADK)
- TypeScript, Bun als Package Manager
- Botpress ADK (beta) — `adk dev` startet den Dev-Server
- Datenquelle: WordPress REST API (kein direkter DB-Zugriff)
- ACF-Felder für Ansprechpartner unter Post-Type "ansprechpartner"

## Wichtige Konventionen
- Tools in agent/src/tools/ für alle externen API-Calls
- Actions in agent/src/actions/ für Seiteneffekte (Email, etc.)
- Konfigurationswerte IMMER über `configuration.*` — nie hardcoden
- Sprache der Bot-Antworten: Deutsch
- Plugin-Code folgt WordPress Coding Standards (PHP)
- Admin-UI mit React via @wordpress/scripts
