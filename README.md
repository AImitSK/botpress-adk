# Botpress für WordPress

WordPress-Plugin + Botpress ADK Agent — der komplette Chatbot-Lebenszyklus für dein WordPress-Intranet.

## Was macht das Projekt?

**Botpress für WordPress** verbindet deine WordPress-Website mit Botpress Cloud und deckt den gesamten Chatbot-Lebenszyklus an einem Ort ab:

- **Verbinden & verwalten:** Verknüpfe deinen Botpress-Workspace, konfiguriere Bots, Kanäle und Integrationen direkt im WP-Adminbereich
- **Erstellen & deployen:** Gerüste und deploye Agenten über das Botpress ADK direkt aus deinem Entwicklungs-Workflow
- **Gestalten & einbetten:** Passe Farben, Schriften, Position und Verhalten des Webchat-Widgets an — ganz ohne Code
- **Erweitern:** Nutze WP-Actions und -Filter, um Benutzerdaten, Seitenkontext oder eigene Variablen an deinen Bot zu übergeben

## Architektur

Das Projekt besteht aus zwei Teilen:

### 1. WordPress Plugin (`/plugin`)
- Settings-Seite im WP-Admin (Workspace-Verbindung, Bot-Konfiguration)
- Webchat-Widget Einbettung mit Customizer (Farben, Schriften, Position)
- WP-Actions und -Filter für Kontext-Übergabe (Benutzer, Seite, Custom Vars)
- Kompatibel mit WordPress 6.x+, klassische Themes und Full Site Editing (FSE)

### 2. Botpress ADK Agent (`/agent`)
- TypeScript-Agent auf Botpress ADK (beta)
- Datenquelle: WordPress REST API (`/wp-json/wp/v2/`)
- Tools für Kontaktsuche, Dokumentensuche, E-Mail-Versand
- ACF-Felder für Ansprechpartner (Custom Post Type)

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| WordPress Plugin | PHP 8.x, WordPress 6.x+, Gutenberg/FSE |
| Admin UI | React (WP Scripts) |
| Chatbot Agent | TypeScript, Botpress ADK, Bun |
| Datenquelle | WordPress REST API + ACF |
| Chat Widget | Botpress Webchat |

## Voraussetzungen

- WordPress 6.x+
- PHP 8.0+
- Node.js 22+ / Bun 1.3.9+
- Botpress Cloud Account

## Entwicklung

```bash
# Agent entwickeln
cd agent
bun install
adk dev          # Dev-Server auf http://localhost:3001
adk chat         # Terminal-Chat zum Testen

# Plugin entwickeln
cd plugin
composer install
npm install
npm run build    # oder npm run start für Watch-Mode
```

## Projektstruktur

```
botpress-adk/
├── README.md
├── CLAUDE.md
├── agent/                  ← Botpress ADK Agent
│   ├── agent.config.ts
│   ├── agent.json
│   └── src/
│       ├── conversations/
│       ├── tools/
│       ├── actions/
│       └── ...
├── plugin/                 ← WordPress Plugin
│   ├── botpress-wp.php     ← Plugin-Hauptdatei
│   ├── includes/
│   ├── admin/
│   ├── public/
│   └── assets/
└── .claude/
    └── skills/
```

## Lizenz

MIT
