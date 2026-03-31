# Botpress Webchat for WordPress

WordPress-Plugin + Botpress ADK Agent — ein KI-Support-Bot für Webseitenbesucher.

## Was macht das Projekt?

**Botpress Webchat for WordPress** ist ein wiederverwendbares Plugin, das einen KI-gestützten Support-Bot auf jeder WordPress-Website bereitstellt. Der Bot hilft Besuchern bei:

- **Ansprechpartner finden** — nach Name, Abteilung oder Aufgabe suchen
- **Nachrichten übermitteln** — Nachrichten an Mitarbeiter weiterleiten (via SendGrid)
- **Produktberatung** — Produkte empfehlen und beraten
- **Downloads** — Datenblätter, Broschüren und Dokumente finden
- **Ländervertretungen** — internationale Kontakte und Vertretungen suchen
- **Produktanfragen** — Leads erfassen und auf passende Formulare verweisen
- **Unternehmensfragen** — allgemeine Fragen zur Firma beantworten

## Architektur

```
Besucher ──► Webchat Widget ──► Botpress Cloud (Agent)
                                       │
                                       ├──► WordPress REST API (Kontakte, Produkte, Downloads, ...)
                                       ├──► Botpress Knowledge Base (Website-Inhalte, FAQ)
                                       └──► SendGrid API (E-Mail-Versand)
```

### 1. WordPress Plugin (`/plugin`)
- Settings-Seite im WP-Admin (React): Connection, Styling, Data Sources
- Webchat-Widget Einbettung mit Customizer (Farben, Schriften, Position)
- Custom Post Types: Kontakte, Produkte, Downloads, Ländervertretungen (optional)
- REST-Endpoints unter `bpwc/v1/bot/*` mit Bearer-Token Auth
- WP-Actions/Filter für Extensibility
- Kompatibel mit klassischen Themes und Full Site Editing (FSE)

### 2. Botpress ADK Agent (`/agent`)
- TypeScript-Agent auf Botpress ADK
- Tools für: Kontaktsuche, Produktsuche, Downloads, Ländervertretungen, Seitensuche
- E-Mail-Versand via SendGrid API
- Knowledge Base für Website-Inhalte
- Konfigurierbar: Sprache, Firmenname, Datenquellen

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| WordPress Plugin | PHP 8.x, WordPress 6.x+ |
| Admin UI | React (@wordpress/scripts) |
| Chatbot Agent | TypeScript, Botpress ADK, Bun |
| Datenquellen | WordPress REST API + Botpress Knowledge Base |
| E-Mail | SendGrid API |
| Chat Widget | Botpress Webchat v2 |

## Voraussetzungen

- WordPress 6.x+ / PHP 8.0+
- Node.js 22+ / Bun 1.3.9+
- Botpress Cloud Account
- SendGrid Account (für E-Mail-Versand)
- Docker (für lokale Entwicklung)

## Entwicklung

```bash
# Docker-WordPress starten
docker compose up -d        # WordPress auf http://localhost:8080 (admin/admin)

# Agent entwickeln
cd agent
bun install
adk dev                     # Dev-Server mit Hot Reload

# Plugin entwickeln
cd plugin
composer install
npm install
npm run build               # oder: npm run start (Watch-Mode)
```

## Projektstruktur

```
botpress-adk/
├── README.md
├── CLAUDE.md               ← Konventionen und Dev-Setup
├── PLAN.md                 ← Implementierungsplan (4 Phasen)
├── docker-compose.yml      ← WordPress + MySQL Dev-Environment
├── agent/                  ← Botpress ADK Agent
│   ├── agent.config.ts
│   ├── agent.json
│   └── src/
│       ├── conversations/
│       ├── tools/
│       ├── actions/
│       └── knowledge/
└── plugin/                 ← WordPress Plugin
    ├── botpress-webchat.php
    ├── includes/
    │   ├── cpt/            ← Custom Post Types
    │   └── rest/           ← REST API Endpoints
    └── src/admin/          ← React Admin UI
```

## Wiederverwendbarkeit

Das Plugin ist **firmenübergreifend einsetzbar**:
- Alle Texte und Datenquellen über Admin konfigurierbar
- CPTs optional aktivierbar (nicht jede Firma braucht alles)
- Styling komplett anpassbar
- Sprache konfigurierbar (Standard: Deutsch)
- Keine firmenspezifischen Hardcodes

## Lizenz

MIT
