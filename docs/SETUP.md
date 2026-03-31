# Kunden-Setup: Vom Repo zum fertigen Plugin

## Überblick

```
Entwickler                              Kunde
─────────────────────────              ─────────────────
1. git clone                           1. ZIP hochladen
2. developer-config.php                2. Plugin aktivieren
   anlegen (einmalig)                  3. Fertig ✓
3. /setup-kunde ausführen
4. ZIP an Kunden schicken
```

## Voraussetzungen (einmalig)

| Was | Woher |
|-----|-------|
| Botpress Cloud Account | https://app.botpress.cloud |
| Personal Access Token (PAT) | Botpress Cloud → Profile → Access Tokens |
| Workspace ID | Aus der Botpress Cloud URL: `workspaces/{WORKSPACE_ID}/...` |
| ADK CLI installiert | `curl -fsSL https://github.com/botpress/adk/releases/latest/download/install.sh \| bash` |
| Bun installiert | https://bun.sh |
| Node.js + npm | Für den Plugin-Build |

## Ersteinrichtung (einmalig)

### 1. Repo klonen und Dependencies installieren

```bash
git clone <repo-url>
cd botpress-adk
cd plugin && npm install && npm run build && cd ..
cd agent && bun install && cd ..
```

### 2. developer-config.php anlegen

```bash
cp plugin/developer-config.example.php plugin/developer-config.php
```

Werte eintragen:

```php
<?php
return [
    'botpress_pat'     => 'bp_pat_DEIN_TOKEN',
    'workspace_id'     => 'wkspace_DEINE_ID',
    'bot_id'           => '',          // wird pro Kunde vom Agenten gefüllt
    'webchat_id'       => '',          // wird pro Kunde vom Agenten gefüllt
    'default_language'  => 'de',
];
```

Diese Datei ist git-ignored und enthält dein Geheimnis (PAT). Nie committen.

### 3. ADK Login

```bash
cd agent
adk login
```

Einmalig mit deinem Botpress-Account anmelden.

## Neuer Kunde einrichten

### Per Slash-Command (empfohlen)

In Claude Code im Projektverzeichnis:

```
/setup-kunde
```

Der Agent fragt ab:
1. **Standard-Credentials verwenden?** (PAT + Workspace aus developer-config.php)
2. **Kundenname** (z.B. "Mustermann GmbH")
3. **Sprache** (de/en/fr)

Dann macht der Agent automatisch:
1. Bot in Botpress Cloud erstellen
2. Agent-Code deployen (adk deploy)
3. Webchat ID ermitteln
4. developer-config.php mit allen Werten generieren
5. ZIP mit Plugin + Config erstellen

**Ergebnis:** `output/{Kundenname}/{Kundenname}-botpress-webchat.zip`

### Manuell (falls nötig)

1. Bot in Botpress Cloud UI erstellen → Bot ID notieren
2. `agent/agent.json` → botId auf neue ID setzen
3. `cd agent && adk deploy` (mit "y" bestätigen)
4. `agent/agent.json` → botId zurücksetzen
5. Webchat ID aus Botpress Cloud → Integrations → Webchat
6. developer-config.php mit allen Werten erstellen
7. Plugin-Ordner + Config als ZIP packen

## Was der Kunde bekommt

Ein ZIP-Archiv das enthält:
```
botpress-webchat/
├── botpress-webchat.php        ← Plugin-Hauptdatei
├── developer-config.php        ← Kunden-spezifische Konfiguration
├── uninstall.php
├── composer.json
├── package.json
├── build/                      ← Kompilierte Admin-UI
├── includes/                   ← PHP-Klassen
└── src/                        ← React-Quellcode
```

## Was der Kunde macht

1. **WordPress Admin → Plugins → Installieren → ZIP hochladen**
2. **Aktivieren**
3. Fertig — der Bot erscheint auf der Website

### Optional (im WordPress Admin unter "Botpress Webchat"):
- **Connection Tab**: Zeigt Status (verbunden/nicht verbunden), "Reconnect" Button
- **Styling Tab**: Farben, Bot-Name, Greeting, Custom CSS anpassen
- **Data Sources Tab**: CPTs aktivieren (Contacts, Products, Downloads, Country Reps), Sprache
- **Conversations**: Chat-Gespräche einsehen, filtern, exportieren

## Was beim "Reconnect" passiert

Wenn der Kunde auf "Reconnect to Bot" klickt:
1. Plugin generiert einen neuen API-Token
2. Plugin schickt WordPress-URL + Token an Botpress Cloud API
3. Bot kann jetzt die WordPress REST-API des Kunden aufrufen
4. Bestätigung: "Bot successfully connected to this website"

Das ist nötig nach:
- Erstinstallation
- Änderung der Site-URL
- Token-Reset

## Architektur

```
Website-Besucher
       ↓
[Webchat Widget] ──→ [Botpress Cloud]
                          ↓
                    [Agent (ADK)]
                     ↓         ↓
              [WordPress    [SendGrid
               REST API]     E-Mail]
                 ↓
           [CPT-Daten]
           Kontakte, Produkte,
           Downloads, Vertreter
```

- **Pro Kunde ein Bot** in Botpress Cloud (Datenisolation)
- **Ein Agent-Code** für alle (identische Tools + Conversation)
- **Kunden-spezifisch**: WordPress-URL, API-Token, Firmenname, Sprache
- **Plugin registriert sich selbst** beim Bot (Auto-Register via Botpress API)
