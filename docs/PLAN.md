# Implementierungsplan: Botpress Webchat WordPress Plugin

## Kontext
Ein WordPress-Plugin das einen Botpress KI-Support-Bot für **Webseitenbesucher** (potenzielle Kunden) bereitstellt. Der Bot hilft bei: Ansprechpartner finden, Nachrichten an Mitarbeiter, Produktberatung, Downloads, Ländervertretungen, Lead-Erfassung (→ Formularverweis), Unternehmensfragen. 

**Wichtig:** Das Plugin soll **firmenübergreifend wiederverwendbar** sein — keine Hardcoding von firmenspezifischen Dingen. Styling und Datenquellen komplett über Admin konfigurierbar.

**Datenquellen:** Strukturierte Daten (Kontakte, Produkte, Vertretungen) als WordPress CPTs + Website-Inhalte über Botpress Knowledge Base.

**E-Mail:** Über SendGrid API direkt im Agent (kein WordPress-Umweg).

---

## Phase 1: WordPress Plugin Foundation
**Ziel:** Admin-Settings (React), Webchat-Widget im Frontend, Plugin-Struktur

### Dateien

| Datei | Aktion | Beschreibung |
|-------|--------|-------------|
| `plugin/botpress-webchat.php` | Erweitern | Klassen laden, Hooks, Activation |
| `plugin/uninstall.php` | Neu | Sauberes Aufräumen |
| `plugin/composer.json` | Neu | PSR-4 Autoloading |
| `plugin/package.json` | Neu | @wordpress/scripts Build |
| `plugin/includes/class-plugin.php` | Neu | Hauptklasse, Hook-Registrierung |
| `plugin/includes/class-settings.php` | Neu | Option `bpwc_settings` mit Dot-Notation Getter |
| `plugin/includes/class-admin-page.php` | Neu | Admin-Menü, React-Mount |
| `plugin/includes/class-frontend.php` | Neu | Webchat-Embed in `wp_footer` |
| `plugin/includes/class-rest-auth.php` | Neu | Bearer-Token Auth für Bot-Endpoints |
| `plugin/includes/rest/class-rest-settings.php` | Neu | Admin REST für React-UI |
| `plugin/src/admin/index.js` | Neu | React Entry mit TabPanel |
| `plugin/src/admin/tabs/ConnectionTab.js` | Neu | Bot-ID, API-Token, Test-Button |
| `plugin/src/admin/tabs/StylingTab.js` | Neu | Farben, Font, Position, Greeting, CSS |
| `plugin/src/admin/tabs/DataSourcesTab.js` | Neu | CPT-Toggles, Sprache |

### Settings-Struktur
```php
bpwc_settings = [
  'connection' => ['bot_id', 'webchat_id', 'api_token', 'wp_api_url'],
  'styling'    => ['primary_color', 'background_color', 'font_family', 'position', 'z_index', 'custom_css', 'bot_name', 'bot_avatar_url', 'greeting_message'],
  'data_sources' => ['enable_contacts', 'enable_products', 'enable_downloads', 'enable_country_reps'],
  'general'    => ['language', 'enabled', 'show_on', 'page_rules'],
]
```

### Auth-Konzept (Bot → WP)
- Plugin generiert API-Token, speichert es gehasht
- Selber Token wird im Botpress Agent als `configuration.wpApiToken` eingetragen
- Bot-Endpoints unter `bpwc/v1/bot/*` prüfen Bearer-Token

### Test
- Admin → Botpress Webchat → Settings-Seite mit 3 Tabs
- Bot-ID eintragen → Frontend zeigt Webchat-Widget
- Styling ändern → Widget aktualisiert sich

---

## Phase 2: WordPress Data Layer
**Ziel:** Flexible CPTs + REST-Endpoints für den Bot

### CPT-Dateien

| Datei | CPT | Meta-Felder |
|-------|-----|-------------|
| `plugin/includes/cpt/class-cpt-manager.php` | — | Orchestriert CPT-Registrierung basierend auf Settings |
| `plugin/includes/cpt/class-cpt-base.php` | — | Abstrakte Basis: `register_post_meta()`, Admin-Columns |
| `plugin/includes/cpt/class-cpt-contact.php` | `bpwc_contact` | email, phone, department, role, location, photo_url |
| `plugin/includes/cpt/class-cpt-product.php` | `bpwc_product` | category, sku, inquiry_form_url, datasheet_url, features |
| `plugin/includes/cpt/class-cpt-download.php` | `bpwc_download` | file_url, file_type, file_size, related_product |
| `plugin/includes/cpt/class-cpt-country-rep.php` | `bpwc_country_rep` | country_code, country_name, region, rep_name, rep_email, rep_phone, rep_company, rep_website |

### REST-Endpoints (`bpwc/v1/bot/`)

| Datei | Endpoint | Zweck |
|-------|----------|-------|
| `plugin/includes/rest/class-rest-base-controller.php` | — | Basis: Token-Auth, Standard-Response-Format |
| `plugin/includes/rest/class-rest-contacts.php` | `GET /bot/contacts` | Suche nach Name, Abteilung, Rolle |
| `plugin/includes/rest/class-rest-products.php` | `GET /bot/products` | Suche nach Name, Kategorie |
| `plugin/includes/rest/class-rest-downloads.php` | `GET /bot/downloads` | Suche nach Name, Typ, Produkt |
| `plugin/includes/rest/class-rest-country-reps.php` | `GET /bot/country-reps` | Suche nach Land, Region |
| `plugin/includes/rest/class-rest-pages.php` | `GET /bot/pages` | WordPress-Seiten/Formulare finden |
| `plugin/includes/rest/class-rest-site-info.php` | `GET /bot/site-info` | Verfügbare Datenquellen, Site-Meta |

### Details
- Alle CPTs optional — an/aus über Data Sources Tab
- Meta-Felder via `register_post_meta()` mit `show_in_rest => true`
- Bot-Endpoints liefern flaches JSON (kein verschachteltes `meta`-Objekt)
- Response-Format: `{ success: true, data: [...], total: N }`

### Test
- CPTs im Admin aktivieren → Menüpunkte erscheinen
- Testdaten anlegen (3-5 Einträge pro CPT)
- `curl -H "Authorization: Bearer TOKEN" localhost:8080/wp-json/bpwc/v1/bot/contacts?search=test`
- Ohne Token → 401

---

## Phase 3: Agent Tools + Conversations
**Ziel:** Bot kann alle WP-Daten abfragen, deutsche Conversation, Knowledge Base

### Agent-Dateien

| Datei | Aktion | Beschreibung |
|-------|--------|-------------|
| `agent/agent.config.ts` | Erweitern | Configuration-Schema (wordpressBaseUrl, wpApiToken, language, companyName, sendgridApiKey, sendgridFromEmail) |
| `agent/src/tools/wp-api-client.ts` | Neu | Shared Fetch-Helper mit Auth + Error-Handling |
| `agent/src/tools/searchContacts.ts` | Neu | Ansprechpartner suchen |
| `agent/src/tools/searchProducts.ts` | Neu | Produkte suchen/beraten |
| `agent/src/tools/searchDownloads.ts` | Neu | Downloads finden |
| `agent/src/tools/searchCountryReps.ts` | Neu | Ländervertretungen finden |
| `agent/src/tools/findPage.ts` | Neu | Seiten/Formulare finden |
| `agent/src/tools/getSiteInfo.ts` | Neu | Verfügbare Daten abfragen |
| `agent/src/actions/sendEmail.ts` | Neu | E-Mail via SendGrid API senden |
| `agent/src/knowledge/websiteContent.ts` | Neu | Website-KB aus Sitemap |
| `agent/src/conversations/index.ts` | Umschreiben | Deutscher System-Prompt, alle Tools |

### Conversation System-Prompt (Kern)
```
Du bist ein freundlicher Kundenservice-Assistent für {companyName}.
Antworte auf {language}.

Aufgaben:
1. Ansprechpartner finden → searchContacts
2. Nachrichten übermitteln → Kontakt suchen, Nachricht + Absenderdaten sammeln, per sendEmail (SendGrid) weiterleiten
3. Produktberatung → searchProducts, Rückfragen stellen
4. Downloads → searchDownloads
5. Ländervertretungen → searchCountryReps
6. Produktanfragen → Basisdaten sammeln, auf Formular verweisen (findPage)
7. Allgemeine Fragen → Knowledge Base

Regeln:
- Professionell und höflich (Sie-Form)
- Vollständige Kontaktdaten angeben
- Ehrlich wenn keine Antwort gefunden
- Links als klickbare Markdown-Links
- Bei Nachrichten: immer Absender-Name und Rückrufnummer/E-Mail erfragen
```

### E-Mail via SendGrid
- Agent Action `sendEmail` ruft SendGrid API direkt auf (`POST https://api.sendgrid.com/v3/mail/send`)
- API-Key aus `configuration.sendgridApiKey`, Absender aus `configuration.sendgridFromEmail`
- Flow: Bot sucht Kontakt (→ E-Mail-Adresse) → sammelt Nachricht + Absenderdaten → sendet via SendGrid
- Kein Umweg über WordPress — Agent macht das direkt
- Beispiel: "Hinterlassen Sie Peter Müller eine Nachricht" → searchContacts → sendEmail

### Test
- `adk dev` starten, Webchat öffnen
- "Wer ist zuständig für Vertrieb?" → Kontaktdaten
- "Ich suche ein Datenblatt für Produkt X" → Download-Link
- "Wer vertritt euch in Frankreich?" → Ländervertretung
- "Ich möchte eine Produktanfrage stellen" → Bot sammelt Daten → Formular-Link
- "Was macht eure Firma?" → Antwort aus Knowledge Base
- "Hinterlassen Sie Herrn Müller eine Nachricht: Bitte anrufen unter 12345" → searchContacts → sendEmail via SendGrid

---

## Phase 4: Integration + Polish
**Ziel:** Kontext-Passing, Hooks, Shortcode, Production-Ready

### Dateien

| Datei | Aktion | Beschreibung |
|-------|--------|-------------|
| `plugin/includes/class-frontend.php` | Erweitern | Page-Context an Webchat übergeben |
| `plugin/includes/class-hooks.php` | Neu | Alle Actions/Filters dokumentiert |
| `plugin/includes/class-shortcode.php` | Neu | `[botpress_webchat]` Shortcode |
| `plugin/includes/class-activation.php` | Neu | Activation/Deactivation-Logic |
| `plugin/includes/rest/class-rest-forms.php` | Neu | Formular-Erkennung (CF7, Gravity, WPForms) |
| `agent/src/triggers/conversationStarted.ts` | Neu | Webchat-Context in user.state speichern |
| `agent/src/tools/wp-api-client.ts` | Erweitern | Timeout, Retry, Cache |

### Hooks (Extensibility)
- `bpwc_webchat_config` — Webchat-JS-Config filtern
- `bpwc_webchat_context` — Custom Context-Daten hinzufügen
- `bpwc_should_show_webchat` — Visibility steuern
- `bpwc_settings` — Settings überschreiben
- `bpwc_message_forwarded` — Nach E-Mail-Versand
- `bpwc_cpt_args_{post_type}` — CPT-Registrierung anpassen

### Test
- Produktseite besuchen → Bot weiß welche Seite
- Filter in functions.php → Custom-Context erreicht Bot
- Nachricht senden → E-Mail kommt an
- `[botpress_webchat]` auf Seite → Widget nur dort
- `adk deploy` → Deployed Bot funktioniert

---

## Phase 5: Conversation Viewer
**Ziel:** Admin-Dashboard zum Einsehen aller Chat-Gespräche — was fragen Besucher, welche Themen sind gefragt, wie performt der Bot

### Architektur
- **Datenquelle:** Botpress Cloud API (Conversations + Messages Endpoints)
- **Kein lokales Logging nötig:** Botpress speichert alle Gespräche, Plugin liest sie on-demand
- **Botpress API Client** im Plugin: authentifiziert mit Bot-ID + Personal Access Token (PAT)
- **Caching:** Transient-basierter Cache (5 Min) um API-Rate-Limits zu schonen

### Dateien

| Datei | Aktion | Beschreibung |
|-------|--------|-------------|
| `plugin/includes/class-botpress-api.php` | Neu | HTTP-Client für Botpress Cloud API (Conversations, Messages) |
| `plugin/includes/class-conversation-viewer.php` | Neu | Admin-Seite: Conversations-Liste + Einzelansicht |
| `plugin/includes/rest/class-rest-conversations.php` | Neu | Interner REST-Proxy für React-UI → Botpress API |
| `plugin/src/admin/pages/ConversationsPage.js` | Neu | React: Conversations-Tabelle mit Pagination |
| `plugin/src/admin/pages/ConversationDetail.js` | Neu | React: Chat-Verlauf als Bubble-UI |
| `plugin/src/admin/components/MessageBubble.js` | Neu | React: Einzelne Nachricht (Bot/User, Timestamp) |
| `plugin/src/admin/components/ConversationFilters.js` | Neu | React: Datums-Range, Suchbegriff, Status-Filter |
| `plugin/src/admin/components/ExportButton.js` | Neu | React: CSV-Export der gefilterten Gespräche |

### Settings (Erweiterung Connection-Tab)
```php
'connection' => [
    // ... bestehende Felder
    'botpress_pat'     => '',   // Personal Access Token für Botpress API
    'botpress_bot_url' => '',   // Botpress Cloud API Base URL
],
```

### Admin-Seite: Conversations-Liste
- Tabelle: Datum/Uhrzeit, Besucher-ID (anonym), Erste Nachricht (Vorschau), Nachrichten-Anzahl, Dauer
- Sortierung: neueste zuerst
- Pagination: 25 pro Seite
- Filter: Datumsbereich (letzte 7/30/90 Tage, custom), Volltextsuche in Nachrichten
- Klick auf Zeile → Einzelansicht

### Admin-Seite: Conversation Detail
- Chat-Bubble-UI: User-Nachrichten links, Bot-Antworten rechts
- Timestamps pro Nachricht
- Metadaten: Startzeit, Dauer, Seite (wenn Page-Context aus Phase 4), User-Agent
- Navigation: Zurück zur Liste, Vor/Zurück zwischen Gesprächen

### CSV-Export
- Export der aktuell gefilterten Liste
- Felder: Datum, Besucher-ID, Nachrichten (User + Bot), Dauer, Seite
- Dateiname: `conversations_YYYY-MM-DD.csv`

### REST-Endpoints (intern, Admin-only)

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `bpwc/v1/conversations` | GET | Liste mit Pagination + Filtern |
| `bpwc/v1/conversations/{id}` | GET | Einzelnes Gespräch mit allen Nachrichten |
| `bpwc/v1/conversations/export` | GET | CSV-Download |

### Test
- Admin → Botpress Webchat → Conversations
- Gespräche aus Botpress Cloud werden angezeigt
- Klick auf Gespräch → vollständiger Chat-Verlauf
- Datumsfilter → Liste aktualisiert sich
- Suche nach "Produkt" → nur relevante Gespräche
- CSV-Export → Datei mit korrekten Daten
- Ohne PAT → Hinweis "Bitte API-Token konfigurieren"

---

## Dateiübersicht

### Plugin (~38 Dateien)
```
plugin/
├── botpress-webchat.php
├── uninstall.php
├── composer.json
├── package.json
├── includes/
│   ├── class-plugin.php
│   ├── class-settings.php
│   ├── class-admin-page.php
│   ├── class-frontend.php
│   ├── class-rest-auth.php
│   ├── class-hooks.php
│   ├── class-shortcode.php
│   ├── class-activation.php
│   ├── class-botpress-api.php
│   ├── class-conversation-viewer.php
│   ├── cpt/
│   │   ├── class-cpt-manager.php
│   │   ├── class-cpt-base.php
│   │   ├── class-cpt-contact.php
│   │   ├── class-cpt-product.php
│   │   ├── class-cpt-download.php
│   │   └── class-cpt-country-rep.php
│   └── rest/
│       ├── class-rest-base-controller.php
│       ├── class-rest-settings.php
│       ├── class-rest-contacts.php
│       ├── class-rest-products.php
│       ├── class-rest-downloads.php
│       ├── class-rest-country-reps.php
│       ├── class-rest-pages.php
│       ├── class-rest-site-info.php
│       ├── class-rest-forms.php
│       └── class-rest-conversations.php
└── src/admin/
    ├── index.js
    ├── tabs/
    │   ├── ConnectionTab.js
    │   ├── StylingTab.js
    │   └── DataSourcesTab.js
    ├── pages/
    │   ├── ConversationsPage.js
    │   └── ConversationDetail.js
    └── components/
        ├── MessageBubble.js
        ├── ConversationFilters.js
        └── ExportButton.js
```

### Agent (~15 Dateien)
```
agent/
├── agent.config.ts (erweitern)
└── src/
    ├── tools/
    │   ├── wp-api-client.ts
    │   ├── searchContacts.ts
    │   ├── searchProducts.ts
    │   ├── searchDownloads.ts
    │   ├── searchCountryReps.ts
    │   ├── findPage.ts
    │   └── getSiteInfo.ts
    ├── actions/
    │   ├── index.ts (erweitern)
    │   └── sendEmail.ts
    ├── conversations/
    │   └── index.ts (umschreiben)
    ├── knowledge/
    │   ├── index.ts (erweitern)
    │   └── websiteContent.ts
    └── triggers/
        ├── index.ts (erweitern)
        └── conversationStarted.ts
```

## Hinweise
- **Modell:** Cerebras GPT-OSS-120B für Dev, ggf. Claude Sonnet für besseres Deutsch in Produktion
- **Kein ACF nötig:** Meta-Felder über `register_post_meta()` — kein Plugin-Dependency
- **Netzwerk:** Agent (Botpress Cloud) → WP muss öffentlich erreichbar sein (oder Tunnel für Dev)
- **Webchat-Version:** Auf spezifische Version pinnen
- **E-Mail:** SendGrid API direkt im Agent, kein WordPress-Umweg
