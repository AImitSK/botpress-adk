# Knowledge Base System

## Vision

Der Bot soll auf **alle relevanten Daten des Kunden** zugreifen können — ohne dass der Kunde Daten doppelt pflegen muss. Statt starrer CPTs (Contacts, Products, etc.) ein flexibles System das verschiedene Quellen zusammenführt.

Jede Quelle bekommt ein **Prompt-Feld** das dem Bot erklärt wofür die Daten sind und wann er sie nutzen soll.

---

## Quellen-Typen

### 1. Text / FAQ
**Was:** Freitext, Markdown, strukturierte FAQ
**Eingabe:** Rich-Text-Editor im Admin
**Beispiel:** "Unsere Öffnungszeiten sind Mo-Fr 8-17 Uhr", FAQ-Paare
**Technisch:** Direkt als String in der DB, wird dem Bot als Knowledge übergeben
**Prompt-Beispiel:** "Allgemeine Unternehmensinformationen. Nutze diese Daten für Fragen zu Öffnungszeiten, Standorten, Geschichte etc."

### 2. Datei-Upload
**Was:** PDF, DOCX, TXT, CSV
**Eingabe:** WordPress Media Library Upload
**Beispiel:** Produktkatalog.pdf, Preisliste.xlsx, AGB.pdf
**Technisch:** Text-Extraktion serverseitig (PDF → Text via PHP-Library oder externer Service), Inhalt in DB cachen
**Prompt-Beispiel:** "Produktkatalog mit allen aktuellen Produkten und Preisen. Nutze diese Daten für Produktfragen und Preisanfragen."

### 3. Tabelle
**Was:** Strukturierte Daten in Tabellenform
**Eingabe:** CSV-Upload ODER manueller Tabellen-Editor im Admin
**Beispiel:** Preisliste, Mitarbeiterliste, Kompatibilitätsmatrix
**Technisch:** Daten als JSON in der DB, durchsuchbar über REST-Endpoint
**Prompt-Beispiel:** "Preisliste aller Produkte. Spalten: Artikelnummer, Bezeichnung, Preis, Verfügbarkeit. Nutze diese Daten wenn nach Preisen oder Verfügbarkeit gefragt wird."

### 4. WordPress-Daten (DB-Mapping)
**Was:** Bestehende Post Types + Custom Fields (ACF, Pods, Meta)
**Eingabe:** Post Type auswählen → Felder mappen
**Beispiel:** Team-Members (ACF), WooCommerce Products, Custom Portfolio CPT
**Technisch:** 
- Plugin scannt: `get_post_types()` + ACF Field Groups + registered meta
- Kunde wählt Post Type → sieht verfügbare Felder → mappt sie (Name, E-Mail, etc.)
- REST-Endpoint liefert gemappte Daten live aus der DB
**Prompt-Beispiel:** "Mitarbeiterverzeichnis der Firma. Enthält Name, E-Mail, Telefon, Abteilung und Rolle. Nutze diese Daten wenn jemand einen Ansprechpartner sucht."

### 5. Interne Seiten
**Was:** Inhalte von WordPress-Seiten/Posts
**Eingabe:** Seiten/Posts auswählen (Dropdown/Multi-Select) oder Regex/Pattern
**Beispiel:** Alle Seiten unter /leistungen/*, die Seite "Über uns", Blog-Beiträge
**Technisch:** Kein Scraping nötig — `get_post()->post_content` direkt aus DB, HTML-Tags strippen
**Prompt-Beispiel:** "Inhalte der Leistungsseiten der Firma. Nutze diese Daten für Fragen zu Dienstleistungen und Angeboten."

### 6. Externe Seiten (Scraping)
**Was:** Inhalte von fremden Websites
**Eingabe:** URL-Liste
**Beispiel:** Partnerseiten, Branchenverzeichnisse, Regulierungsseiten
**Technisch:** `wp_remote_get()` → HTML → Text (strip_tags + Readability), Cache in DB, regelmäßiger Refresh (WP-Cron)
**Prompt-Beispiel:** "Informationen von unserer Partnerseite. Nutze diese Daten wenn nach Partnerangeboten gefragt wird."

### 7. Sitemap
**Was:** Automatisch alle Seiten einer Website indexieren
**Eingabe:** Sitemap-URL (z.B. https://example.com/sitemap.xml)
**Technisch:** Sitemap parsen → URLs extrahieren → Inhalte fetchen → cachen, WP-Cron für Updates
**Prompt-Beispiel:** "Gesamter Webseiteninhalt. Nutze diese Daten als Fallback für allgemeine Fragen über das Unternehmen."

### 8. RSS Feed
**Was:** Aktuelle News, Blog-Beiträge
**Eingabe:** Feed-URL
**Beispiel:** Firmenblog, Pressemitteilungen, Branchennews
**Technisch:** `fetch_feed()` (WordPress SimplePie), periodischer Refresh
**Prompt-Beispiel:** "Aktuelle Neuigkeiten und Blog-Beiträge. Nutze diese Daten wenn nach aktuellen News oder Veranstaltungen gefragt wird."

---

## Admin-UI Konzept

### Übersicht (Knowledge Base Hauptseite)

```
┌─────────────────────────────────────────────────┐
│ Knowledge Base                    [+ Add Source] │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ 📝 Allgemeine Infos           Text    Active │ │
│ │    "Öffnungszeiten, Standorte..."            │ │
│ ├──────────────────────────────────────────────┤ │
│ │ 👥 Mitarbeiter          WP-Daten (ACF) Active│ │
│ │    "team_member → 12 Einträge"               │ │
│ ├──────────────────────────────────────────────┤ │
│ │ 📄 Produktkatalog       Datei (PDF)   Active │ │
│ │    "produktkatalog-2026.pdf — 2.3 MB"        │ │
│ ├──────────────────────────────────────────────┤ │
│ │ 🌐 Website-Inhalte     Interne Seiten Active │ │
│ │    "23 Seiten indexiert"                      │ │
│ ├──────────────────────────────────────────────┤ │
│ │ 📊 Preisliste           Tabelle       Active │ │
│ │    "145 Zeilen, 5 Spalten"                   │ │
│ └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Source erstellen/bearbeiten

```
┌─────────────────────────────────────────────────┐
│ ← Back                          [Save] [Delete] │
│                                                  │
│ Source Name: [Mitarbeiter                      ] │
│ Type: [WP-Daten (DB-Mapping) ▼]                 │
│ Status: ● Active                                 │
│                                                  │
│ ─── Quelle konfigurieren ───────────────────── │
│                                                  │
│ Post Type: [team_member ▼]                       │
│                                                  │
│ Feld-Mapping:                                    │
│   Bot-Feld        →  WordPress-Feld              │
│   [Name         ] →  [post_title           ▼]   │
│   [E-Mail       ] →  [acf.email            ▼]   │
│   [Telefon      ] →  [acf.phone            ▼]   │
│   [Abteilung    ] →  [acf.department       ▼]   │
│   [+ Feld hinzufügen]                            │
│                                                  │
│ ─── Bot-Anweisung ─────────────────────────── │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Mitarbeiterverzeichnis der Firma. Enthält    │ │
│ │ Name, E-Mail, Telefon und Abteilung. Nutze  │ │
│ │ diese Daten wenn jemand einen Ansprechpart-  │ │
│ │ ner sucht oder nach einer Abteilung fragt.   │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ─── Vorschau ───────────────────────────────── │
│                                                  │
│ │ Name          │ E-Mail         │ Abteilung   │ │
│ │ Max Mustermann│ max@firma.de   │ Vertrieb    │ │
│ │ Lisa Schmidt  │ lisa@firma.de  │ Technik     │ │
│ │ ... (12 Einträge)                             │ │
└─────────────────────────────────────────────────┘
```

---

## Architektur

### Datenmodell

```
wp_bpwc_sources (Custom Table)
├── id
├── name                    — "Mitarbeiter"
├── type                    — text|file|table|wp_data|internal_pages|external_pages|sitemap|rss
├── status                  — active|inactive
├── config (JSON)           — Typ-spezifische Konfiguration
│   ├── [text]              — { content: "..." }
│   ├── [file]              — { attachment_id: 123, mime_type: "application/pdf" }
│   ├── [table]             — { columns: [...], rows: [...] } oder { attachment_id: 456 }
│   ├── [wp_data]           — { post_type: "team_member", field_map: { name: "post_title", email: "acf.email" } }
│   ├── [internal_pages]    — { post_ids: [1,2,3] } oder { pattern: "/leistungen/*" }
│   ├── [external_pages]    — { urls: ["https://..."] }
│   ├── [sitemap]           — { sitemap_url: "https://example.com/sitemap.xml" }
│   └── [rss]               — { feed_url: "https://example.com/feed/" }
├── prompt                  — Bot-Anweisung für diese Quelle
├── cached_content (TEXT)   — Extrahierter/gecachter Content für den Bot
├── last_synced             — Letzter Sync-Zeitpunkt
├── created_at
└── updated_at
```

### REST-Endpoints

| Endpoint | Methode | Auth | Beschreibung |
|----------|---------|------|-------------|
| `bpwc/v1/sources` | GET | Admin | Alle Quellen auflisten |
| `bpwc/v1/sources` | POST | Admin | Neue Quelle erstellen |
| `bpwc/v1/sources/{id}` | GET/PUT/DELETE | Admin | CRUD für einzelne Quelle |
| `bpwc/v1/sources/{id}/sync` | POST | Admin | Manuellen Sync triggern |
| `bpwc/v1/sources/{id}/preview` | GET | Admin | Vorschau der Daten |
| `bpwc/v1/bot/query` | GET | Bot-Token | Bot fragt Daten ab (alle aktiven Quellen) |
| `bpwc/v1/bot/sources` | GET | Bot-Token | Bot bekommt Liste der Quellen + Prompts |

### Agent-Integration

Statt 6 fester Tools bekommt der Agent **2 dynamische Tools**:

```typescript
// Tool 1: Quellen-Übersicht abrufen
getSources → [{ id, name, type, prompt, fields }]

// Tool 2: Quelle abfragen
querySource(sourceId, search?, filters?) → { data, total }
```

Der System-Prompt wird dynamisch gebaut:
```
Du hast Zugang zu folgenden Datenquellen:
1. "Mitarbeiter" (WP-Daten) — Mitarbeiterverzeichnis der Firma...
2. "Produktkatalog" (PDF) — Produktkatalog mit allen aktuellen Produkten...
3. "Website-Inhalte" (Interne Seiten) — Inhalte der Leistungsseiten...

Nutze querySource mit der passenden Source-ID um Daten abzufragen.
```

### Sync-Strategie

| Typ | Sync | Frequenz |
|-----|------|----------|
| Text | Kein Sync nötig | — |
| Datei | Bei Upload + manuell | — |
| Tabelle | Kein Sync nötig | — |
| WP-Daten | Live-Abfrage | Echtzeit |
| Interne Seiten | WP-Cron | Täglich |
| Externe Seiten | WP-Cron | Täglich/Wöchentlich |
| Sitemap | WP-Cron | Wöchentlich |
| RSS | WP-Cron | Stündlich |

---

## Implementierungsplan

### Phase KB-1: Foundation
- Custom DB Table `wp_bpwc_sources`
- Source-Model Klasse (CRUD)
- Admin REST-Endpoints (Sources CRUD)
- Admin-UI: Knowledge Base Hauptseite (Liste + Add Source)
- Source-Typen: **Text** und **Tabelle** (einfachste Typen zum Start)

### Phase KB-2: WordPress-Daten
- Post Type Scanner (alle registrierten CPTs + Felder entdecken)
- ACF-Integration (Field Groups auslesen)
- Feld-Mapping UI
- Live-Query Endpoint für gemappte Daten
- Vorschau-Ansicht

### Phase KB-3: Seiten-Inhalte
- Interne Seiten: Post/Page Selector + Content-Extraktion
- Externe Seiten: URL-Fetcher + HTML-to-Text
- Sitemap-Parser
- RSS-Feed Integration
- WP-Cron für periodischen Sync
- Cache-Management

### Phase KB-4: Datei-Upload
- PDF-Text-Extraktion (PHP-Library: smalot/pdfparser oder externer Service)
- DOCX-Text-Extraktion (phpoffice/phpword)
- CSV-Import in Tabellen-Format
- Media Library Integration

### Phase KB-5: Agent-Umbau
- Alte feste Tools entfernen (searchContacts, searchProducts, etc.)
- Neue dynamische Tools: `getSources`, `querySource`
- Dynamischer System-Prompt aus Quellen + ihren Prompts
- Bot-Endpoint `/bot/query` der alle aktiven Quellen durchsucht
- Alte CPTs als Legacy optional behalten (Migration)

### Phase KB-6: Polish
- Sync-Status Anzeige pro Quelle
- Fehlerbehandlung (fehlgeschlagene Syncs, unerreichbare URLs)
- Bulk-Import (mehrere URLs/Dateien auf einmal)
- Source-Reihenfolge / Priorität
- Token/Zeichen-Zähler pro Quelle (damit der Bot-Context nicht explodiert)

---

## Offene Fragen

1. **Context-Limit**: Wie viel Knowledge kann der Bot verarbeiten? Große PDFs oder viele Seiten könnten das Token-Limit sprengen → Lösung: Relevante Chunks senden statt alles
2. **Text-Extraktion**: Welche PHP-Library für PDFs? `smalot/pdfparser` (rein PHP, kein externer Service) vs. externer Dienst (besser aber Dependency)
3. **Migration**: Bestehende CPTs (Contacts, Products etc.) in das neue System überführen oder parallel behalten?
4. **Caching**: Wie groß kann `cached_content` werden? Separate Tabelle für große Inhalte?
