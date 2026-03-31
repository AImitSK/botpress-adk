# CLAUDE.md

## Projekt
Interner Intranet-Bot auf Botpress ADK (TypeScript).
Daten kommen von WordPress REST API (https://intern.firma.de/wp-json/wp/v2/).
ACF-Felder für Ansprechpartner unter Post-Type "ansprechpartner".

## Stack
- Botpress ADK (beta) — `adk dev` startet den Dev-Server
- TypeScript, bun als Package Manager
- WordPress REST API als Datenquelle (kein direkter DB-Zugriff)

## Wichtige Konventionen
- Tools in src/tools/ für alle externen API-Calls
- Actions in src/actions/ für Seiteneffekte (Email, etc.)
- Konfigurationswerte IMMER über `configuration.*` — nie hardcoden
- Sprache der Bot-Antworten: Deutsch
