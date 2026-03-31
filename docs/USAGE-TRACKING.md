# Usage Tracking & Budget Control

## Ziel

Der Kunde soll im WordPress-Admin sehen:
- Wie viel AI-Budget diesen Monat verbraucht wurde
- Wie viele Conversations / Messages stattgefunden haben
- Ob er sich dem Limit nähert
- Automatische Sperre wenn das Limit erreicht ist

---

## Architektur

```
Besucher → Webchat → Botpress Cloud
                          ↓
                    [After Turn Hook]
                    Schreibt AI Spend in
                    Botpress Table "usage_logs"
                          ↓
                    [Before Turn Hook]
                    Prüft Monats-Limit
                    → Stoppt Bot wenn überschritten
                          ↓
WordPress Plugin ←── Tables API ──→ Liest usage_logs
       ↓
[Admin Dashboard]
Charts, Metriken, Limit-Einstellung
```

---

## Phase UT-1: Agent Hooks + Tracking Table

### Botpress Table: `usage_logs`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `bot_id` | string | Bot-ID |
| `date` | string | Datum (YYYY-MM-DD) |
| `conversations` | number | Anzahl Conversations an diesem Tag |
| `messages` | number | Anzahl Messages an diesem Tag |
| `ai_spend_nano` | number | AI Spend in Nano-Dollar (1$ = 1.000.000.000) |
| `ai_spend_usd` | number | AI Spend in USD (berechnet) |

### After Turn Hook

```typescript
// agent/src/hooks/afterTurn.ts (oder in Botpress Studio)

// Wird nach jeder Bot-Antwort ausgeführt
const aiSpendNano = event.state.temp.aiSpend || 0;
const today = new Date().toISOString().split('T')[0];
const botId = event.botId;

// Existierenden Tageseintrag suchen
const { rows } = await client.findTableRows({
  table: 'usage_logs',
  filter: { bot_id: botId, date: today },
  limit: 1,
});

if (rows.length > 0) {
  // Update: Werte addieren
  await client.updateTableRows({
    table: 'usage_logs',
    rows: [{
      id: rows[0].id,
      messages: rows[0].messages + 1,
      ai_spend_nano: rows[0].ai_spend_nano + aiSpendNano,
      ai_spend_usd: (rows[0].ai_spend_nano + aiSpendNano) / 1_000_000_000,
    }],
  });
} else {
  // Neuer Tageseintrag
  await client.createTableRows({
    table: 'usage_logs',
    rows: [{
      bot_id: botId,
      date: today,
      conversations: 1,
      messages: 1,
      ai_spend_nano: aiSpendNano,
      ai_spend_usd: aiSpendNano / 1_000_000_000,
    }],
  });
}
```

### Before Turn Hook (Budget-Limit)

```typescript
// Prüfe ob Monats-Budget überschritten
const now = new Date();
const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;

const { rows } = await client.findTableRows({
  table: 'usage_logs',
  filter: { bot_id: event.botId },
  // Alle Einträge ab Monatsanfang
});

const totalSpendUsd = rows
  .filter(r => r.date >= monthStart)
  .reduce((sum, r) => sum + (r.ai_spend_usd || 0), 0);

// Limit aus Bot-Configuration
const monthlyLimit = configuration.monthlyBudgetUsd || 0;

if (monthlyLimit > 0 && totalSpendUsd >= monthlyLimit) {
  // Bot antwort mit Limit-Nachricht statt AI-Aufruf
  workflow.limitReached = true;
  // → Im Conversation-Handler abfangen und freundliche Meldung senden
}
```

### Agent Config erweitern

```typescript
// agent.config.ts — neues Feld
configuration: {
  schema: z.object({
    // ... bestehende Felder
    monthlyBudgetUsd: z
      .number()
      .default(0)
      .describe("Monthly AI spend limit in USD. 0 = unlimited."),
  }),
},
```

---

## Phase UT-2: WordPress REST-Proxy + Admin Dashboard

### REST-Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `bpwc/v1/usage` | GET | Monatliche Zusammenfassung (Spend, Messages, Conversations) |
| `bpwc/v1/usage/daily` | GET | Tägliche Aufschlüsselung (für Charts) |
| `bpwc/v1/usage/limit` | GET/POST | Budget-Limit lesen/setzen |

### PHP: Usage-Proxy

```php
// Das Plugin liest die Botpress Table "usage_logs" über die Tables API
// GET /v1/tables/{tableId}/rows?filter=...
// Aggregiert die Daten und liefert sie an die React-UI
```

### Admin UI: Usage Dashboard

Neue Seite im Admin-Panel (oder neuer Tab in Settings):

```
┌─────────────────────────────────────────────────┐
│ 💬 Webchat › Usage                              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  $2.47   │  │   847    │  │    34    │      │
│  │ AI Spend │  │ Messages │  │ Convos   │      │
│  │ this mo. │  │ this mo. │  │ this mo. │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  Budget: ████████████░░░░░░ 62% ($2.47 / $4.00) │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Daily AI Spend                     ▼ Mar │   │
│  │                                          │   │
│  │      ╭─╮                                 │   │
│  │    ╭─╯ ╰─╮     ╭─╮                      │   │
│  │  ╭─╯     ╰─╮ ╭─╯ ╰─╮ ╭─╮              │   │
│  │──╯         ╰─╯     ╰─╯ ╰──             │   │
│  │  1  5  10  15  20  25  30               │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Daily Messages                           │   │
│  │  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│  │  1  5  10  15  20  25  30               │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Budget Limit                                    │
│  ┌──────────────────┐                           │
│  │ $ [4.00        ] │  [Save]                   │
│  └──────────────────┘                           │
│  ◻ Notify me at 80%                             │
│  ◻ Notify me at 100%                            │
│  ◻ Stop bot at limit                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Charts

Für die Charts nutzen wir **Recharts** (React-basiert, leichtgewichtig) oder ein einfaches SVG/Canvas-basiertes Bar-Chart ohne externe Dependency.

---

## Phase UT-3: Benachrichtigungen + Auto-Stop

### E-Mail Benachrichtigungen

Wenn AI-Spend einen Schwellenwert erreicht:
- **80%**: Info-Mail an Admin ("Ihr Bot hat 80% des Monatsbudgets verbraucht")
- **100%**: Warnung + Bot wird gestoppt

Implementierung:
- WP-Cron prüft 2x täglich den aktuellen Spend
- `wp_mail()` an Admin-E-Mail
- Admin-Notice im WordPress Dashboard

### Bot Auto-Stop

Wenn Limit erreicht:
1. Before Turn Hook erkennt Überschreitung
2. Bot antwortet mit freundlicher Meldung:
   > "Unser Chat-Assistent ist derzeit nicht verfügbar. Bitte kontaktieren Sie uns direkt unter [Telefon/E-Mail]."
3. Plugin zeigt Warning im Admin-Panel
4. Admin kann Limit erhöhen oder manuell freischalten

---

## Phase UT-4: Erweiterte Metriken

### Zusätzliche Daten die wir tracken könnten

| Metrik | Quelle | Nutzen |
|--------|--------|--------|
| **Top-Themen** | Message-Analyse via Botpress | Was fragen Besucher am häufigsten? |
| **Resolution Rate** | Conversation-Tags | Wie oft konnte der Bot helfen? |
| **Avg. Messages/Convo** | Messages / Conversations | Wie komplex sind die Anfragen? |
| **Peak Hours** | Timestamps | Wann ist der Bot am meisten gefragt? |
| **Source-Usage** | Query-Logs pro Knowledge Source | Welche Datenquellen werden genutzt? |
| **Response Time** | Hook-Timestamps | Wie schnell antwortet der Bot? |

### Optionaler Export

- CSV-Export der Usage-Daten
- Monatlicher Report per E-Mail

---

## Implementierungsreihenfolge

| Phase | Was | Aufwand |
|-------|-----|---------|
| **UT-1** | Table + Hooks (After Turn + Before Turn) | Agent-Code |
| **UT-2** | REST-Proxy + Dashboard UI (Stats + Charts + Limit) | Plugin |
| **UT-3** | Benachrichtigungen + Auto-Stop | Plugin + Agent |
| **UT-4** | Erweiterte Metriken + Export | Optional |

---

## Offene Fragen

1. **ADK Hooks**: Unterstützt das ADK `After Turn` / `Before Turn` Hooks direkt, oder nur Botpress Studio? → Prüfen ob das ADK-Framework diese Events hat
2. **Tables API**: Kann das Plugin die Botpress Tables API von außen abfragen? → Ja, mit PAT + Bot-ID Header (getestet)
3. **Table erstellen**: Muss die Table manuell in Botpress Cloud angelegt werden, oder kann sie per API erstellt werden?
4. **Nano-Dollar Genauigkeit**: Ist `event.state.temp.aiSpend` in allen ADK-Versionen verfügbar?
5. **Chart-Library**: Recharts (8KB gzip) vs. eigene SVG-Lösung (0KB dependency)?

---

## Hinweis: Model Caching

Botpress bietet Model-Caching das identische Anfragen nicht doppelt berechnet. Das sollte in den Bot-Settings aktiviert werden — reduziert AI-Spend oft um 20-30%.
