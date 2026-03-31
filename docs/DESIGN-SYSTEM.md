# Design System — Botpress Webchat Plugin

## Designprinzipien

1. **Klar** — Jedes Element hat einen klaren Zweck
2. **Ruhig** — Wenig Farbe, viel Weissraum, keine visuellen Ablenkungen
3. **Konsistent** — Gleiche Patterns überall, der Kunde erkennt sofort wie es funktioniert
4. **WordPress-nativ** — Fühlt sich an wie Teil von WordPress, nicht wie ein Fremdkörper

---

## Farben

### Primär
| Name | Hex | Verwendung |
|------|-----|-----------|
| `--bpwc-primary` | `#3276EA` | Links, aktive Navigation, ausgewählte Elemente |
| `--bpwc-primary-hover` | `#2058B8` | Hover auf primären Elementen |
| `--bpwc-primary-light` | `#EEF3FF` | Aktive Nav-Hintergrund, ausgewählte Cards |
| `--bpwc-primary-border` | `#C5D7F7` | Borders auf primären Hintergründen |

### Akzent (CTA)
| Name | Hex | Verwendung |
|------|-----|-----------|
| `--bpwc-accent` | `#F97316` | Save/Publish Buttons, wichtige CTAs |
| `--bpwc-accent-hover` | `#EA580C` | Hover auf CTAs |

### Status
| Name | Hex | Verwendung |
|------|-----|-----------|
| `--bpwc-success` | `#34C759` | Aktiv-Toggle, Erfolgs-Badges |
| `--bpwc-success-bg` | `#D4EDDA` | Erfolgs-Notices Hintergrund |
| `--bpwc-success-text` | `#155724` | Erfolgs-Text |
| `--bpwc-error` | `#E74C3C` | Fehler, Löschen |
| `--bpwc-error-bg` | `#F8D7DA` | Fehler-Notices Hintergrund |
| `--bpwc-error-text` | `#721C24` | Fehler-Text |
| `--bpwc-warning` | `#FF9800` | Warnungen, Not-Synced |
| `--bpwc-warning-bg` | `#FFF8E1` | Warnungs-Hintergrund |
| `--bpwc-warning-text` | `#F57F17` | Warnungs-Text |
| `--bpwc-info-bg` | `#E8F5E9` | Info-Boxen (grün, subtil) |
| `--bpwc-info-text` | `#2E7D32` | Info-Text |

### Neutral
| Name | Hex | Verwendung |
|------|-----|-----------|
| `--bpwc-text` | `#1A1A1A` | Haupttext, Überschriften |
| `--bpwc-text-secondary` | `#555555` | Sekundärer Text, Labels |
| `--bpwc-text-muted` | `#888888` | Hilfstext, Beschreibungen |
| `--bpwc-text-disabled` | `#CCCCCC` | Deaktivierte Elemente |
| `--bpwc-bg` | `#F8F9FA` | Seiten-Hintergrund |
| `--bpwc-bg-card` | `#FFFFFF` | Karten, Panels, Sidebar |
| `--bpwc-bg-input` | `#FAFAFA` | Input-Hintergrund (leer) |
| `--bpwc-border` | `#E4E4E4` | Standard-Border |
| `--bpwc-border-light` | `#F0F0F0` | Subtile Trennlinien |
| `--bpwc-border-hover` | `#BBBBBB` | Hover-Border |
| `--bpwc-divider` | `#EEEEEE` | Horizontale Trennlinien (hr) |

---

## Typografie

**Font-Familie:** System-Stack (WordPress-Standard)
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
```

### Stufen

| Stufe | Größe | Gewicht | Farbe | Verwendung |
|-------|-------|---------|-------|-----------|
| **Page Title** | 24px | 700 | `--bpwc-text` | Seitentitel (h1) |
| **Section Title** | 18px | 600 | `--bpwc-text` | Abschnittsüberschriften (h2) |
| **Subsection** | 15px | 600 | `--bpwc-text` | Unterabschnitte (h3) |
| **Card Title** | 15px | 600 | `--bpwc-text` | Titel in Karten |
| **Body** | 14px | 400 | `--bpwc-text` | Fliesstext |
| **Small** | 13px | 400 | `--bpwc-text-secondary` | Hilfstexte, Descriptions |
| **Caption** | 12px | 400 | `--bpwc-text-muted` | Meta-Info, Timestamps |
| **Micro** | 11px | 600 | `--bpwc-text-muted` | Labels, Badges, Counters |
| **Uppercase Label** | 10px | 700 | `--bpwc-text-muted` | Feldgruppen-Labels, letter-spacing: 0.5px |
| **Monospace** | 13px | 400 | — | Code-Snippets, IDs, Tokens |

```css
font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
```

### Zeilenhöhen
- Überschriften: `1.3`
- Body: `1.5`
- Kompakte Listen: `1.4`

---

## Layout

### Seitenstruktur

```
┌──────────────────────────────────────────────────┐
│ WordPress Admin Bar (32px)                        │
├────────┬─────────────────────────────────────────┤
│        │  Header (Titel + Action Buttons)         │
│ Sidebar│──────────────────────────────────────────│
│ (220px)│  Content                                 │
│        │  (max-width: 900px für Formulare)        │
│        │  (volle Breite für Listen/Tabellen)      │
│        │                                          │
│        │                          ┌──────────┐   │
│        │                          │ Preview  │   │
│        │                          │ (300px)  │   │
│        │                          └──────────┘   │
├────────┴─────────────────────────────────────────┤
```

### Breiten
| Element | Breite | Hinweis |
|---------|--------|---------|
| Sidebar | `220px` | Fixed, nicht collapsible |
| Content max-width | `900px` | Formulare, Editoren |
| Content full | `100%` | Listen, Tabellen |
| Preview | `300px` | Sticky, right-aligned |
| Form fields max-width | `700px` | Innerhalb von Content |

### Abstände (Spacing Scale)

Basierend auf 4px-Grid:

| Token | Wert | Verwendung |
|-------|------|-----------|
| `--space-xs` | `4px` | Innerhalb von Elementen, Icon-Gaps |
| `--space-sm` | `8px` | Kleine Gaps, kompakte Abstände |
| `--space-md` | `12px` | Card-Gaps, Feld-Abstände in Reihen |
| `--space-lg` | `16px` | Standard-Padding, Feld-Abstand vertikal |
| `--space-xl` | `20px` | Panel-Padding, Section-Abstände |
| `--space-2xl` | `24px` | Page-Padding, grosse Abstände |
| `--space-3xl` | `32px` | Zwischen Hauptsektionen |

### Regeln
- Seiten-Padding: `24px 32px`
- Panel-Padding: `24px`
- Card-Padding: `16px 20px`
- Kein Margin auf dem äussersten Element — Container bestimmt den Abstand
- Vertikaler Abstand zwischen Feldern: `20px`
- Vertikaler Abstand zwischen Panels/Cards: `12px`
- Horizontaler Gap in Reihen: `12px`

---

## Komponenten

### Buttons

| Typ | Hintergrund | Text | Border | Verwendung |
|-----|-------------|------|--------|-----------|
| **Primary (CTA)** | `--bpwc-accent` | `#FFF` | none | Save, Publish, Create |
| **Secondary** | `#FFF` | `--bpwc-text-secondary` | `--bpwc-border` | Add, Sync, Cancel |
| **Tertiary** | transparent | `--bpwc-primary` | none | Back-Links, weniger wichtige Aktionen |
| **Destructive** | transparent | `--bpwc-error` | none | Delete, Remove |
| **Link** | transparent | `--bpwc-primary` | none | Inline-Links in Text |

```css
/* Alle Buttons */
border-radius: 6px;
font-weight: 600;
font-size: 13px;
padding: 8px 16px;
transition: all 0.15s;

/* Primary */
.bpwc-btn--primary {
    background: var(--bpwc-accent);
    color: #fff;
    border: none;
}

/* Secondary */
.bpwc-btn--secondary {
    background: #fff;
    color: var(--bpwc-text-secondary);
    border: 1px solid var(--bpwc-border);
}
```

### Cards

```css
.bpwc-card {
    background: var(--bpwc-bg-card);
    border: 1px solid var(--bpwc-border);
    border-radius: 12px;
    padding: 16px 20px;
    transition: all 0.15s;
}

/* Interaktive Cards (klickbar) */
.bpwc-card--interactive:hover {
    border-color: var(--bpwc-primary);
    box-shadow: 0 2px 8px rgba(50, 118, 234, 0.1);
    transform: translateY(-1px);
}

/* Ausgewählte Cards */
.bpwc-card--selected {
    border-color: var(--bpwc-primary);
    background: var(--bpwc-primary-light);
}

/* Deaktivierte Cards */
.bpwc-card--disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
```

### Panels (Formular-Container)

```css
.bpwc-panel {
    background: var(--bpwc-bg-card);
    border: 1px solid var(--bpwc-border);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 16px;
}

/* Spezial-Panel (z.B. Bot Instructions) */
.bpwc-panel--highlight {
    border-color: #E8D5B7;
    background: #FFFBF5;
}
```

### Eingabefelder

```css
/* Text-Input / Textarea */
.bpwc-input {
    border: 1px solid var(--bpwc-border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    transition: border-color 0.15s;
}

.bpwc-input:focus {
    border-color: var(--bpwc-primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(50, 118, 234, 0.15);
}

/* Label */
.bpwc-label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: var(--bpwc-text);
    margin-bottom: 4px;
}

/* Help-Text */
.bpwc-help {
    font-size: 13px;
    color: var(--bpwc-text-muted);
    margin-top: 4px;
}
```

### Select / Dropdown
Gleich wie Input, mit zusätzlichem Pfeil-Icon rechts. Nutze WordPress `SelectControl` mit unseren Farb-Overrides.

### Color Picker
```
┌─────────────────────────┐
│ Label                    │
│ ┌──┐ ┌────────┐         │
│ │██│ │ #3276EA │         │
│ └──┘ └────────┘         │
└─────────────────────────┘
```
- Farbfeld: 40x40px, border-radius: 8px
- Hex-Input: monospace, 100px breit

### Toggle Switch

```css
.bpwc-toggle {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: #CCC; /* off */
}

.bpwc-toggle.is-active {
    background: var(--bpwc-success); /* #34C759 */
}

/* Knob */
.bpwc-toggle-knob {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #FFF;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}
```

### Range Slider

```css
.bpwc-slider {
    height: 6px;
    background: var(--bpwc-border);
    border-radius: 3px;
}

.bpwc-slider::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--bpwc-primary);
    border: 3px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
```

---

## Notices / Meldungen

```
┌──────────────────────────────────────────┐
│ ✓ Settings saved.                    ✕   │  ← Success (grüner Hintergrund)
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ ✕ Error saving settings.            ✕   │  ← Error (roter Hintergrund)
└──────────────────────────────────────────┘
```

```css
.bpwc-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
}
```

---

## Status Badges

```css
.bpwc-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 13px;
}

/* Varianten */
.bpwc-badge--success { background: var(--bpwc-success-bg); color: var(--bpwc-success-text); }
.bpwc-badge--error   { background: var(--bpwc-error-bg);   color: var(--bpwc-error-text); }
.bpwc-badge--warning { background: var(--bpwc-warning-bg); color: var(--bpwc-warning-text); }
```

---

## Tabellen

```css
.bpwc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.bpwc-table th {
    background: #F8F9FA;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    color: var(--bpwc-text-secondary);
    border-bottom: 2px solid var(--bpwc-border);
    letter-spacing: 0.3px;
}

.bpwc-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--bpwc-border-light);
    vertical-align: middle;
}

.bpwc-table tr:hover td {
    background: #FAFBFC;
}
```

---

## Icons

**System:** WordPress Dashicons (bereits geladen im Admin).

| Verwendung | Dashicon |
|-----------|----------|
| Navigation: Identity | `dashicons-businessman` |
| Navigation: Appearance | `dashicons-art` |
| Navigation: Features | `dashicons-admin-settings` |
| Navigation: Data Sources | `dashicons-database` |
| Navigation: Connection | `dashicons-admin-links` |
| Navigation: Knowledge | `dashicons-book-alt` |
| Navigation: Conversations | `dashicons-format-chat` |
| Aktion: Add | `+` (Text) |
| Aktion: Delete | `dashicons-trash` oder `×` |
| Aktion: Back | `←` (Unicode) |
| Aktion: Sync | `↻` (Unicode) |
| Aktion: Close | `×` (Unicode) |
| Status: Active | Toggle (grün) |
| Status: Error | Badge (rot) |

**Source-Typ Icons** (Emoji, da keine passenden Dashicons):
📝 Text, 📊 Table, 🗄️ WP Data, 📄 Internal Pages, 🌐 External Pages, 🗺️ Sitemap, 📡 RSS, 📎 File

---

## Pagination

```
┌─────────────────────────────────────────┐
│ Showing 1-25 of 142        ◀ 1 2 3 ▶   │
└─────────────────────────────────────────┘
```

```css
.bpwc-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    margin-top: 16px;
    border-top: 1px solid var(--bpwc-divider);
    font-size: 13px;
    color: var(--bpwc-text-muted);
}

.bpwc-pagination__buttons {
    display: flex;
    gap: 4px;
}

.bpwc-pagination__btn {
    min-width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--bpwc-border);
    background: #fff;
    font-size: 13px;
    cursor: pointer;
}

.bpwc-pagination__btn.is-active {
    background: var(--bpwc-primary);
    color: #fff;
    border-color: var(--bpwc-primary);
}
```

---

## Schatten

| Stufe | Wert | Verwendung |
|-------|------|-----------|
| **none** | `none` | Standard-Karten, Panels |
| **sm** | `0 1px 3px rgba(0,0,0,0.08)` | Hover-Elevation (Buttons) |
| **md** | `0 2px 8px rgba(50,118,234,0.1)` | Hover auf interaktiven Cards |
| **lg** | `0 4px 24px rgba(0,0,0,0.12)` | Webchat-Preview, Modals |
| **focus** | `0 0 0 2px rgba(50,118,234,0.15)` | Focus-Ring auf Inputs |

**Regel:** Karten haben im Ruhezustand **keinen Schatten** — nur Border. Schatten erscheinen nur bei Hover/Interaktion oder bei schwebenden Elementen (Preview, Modals).

---

## Dialoge / Modals

```css
/* Overlay */
.bpwc-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
}

/* Dialog */
.bpwc-modal {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    max-width: 480px;
    width: 90%;
    box-shadow: var(--shadow-lg);
}

.bpwc-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.bpwc-modal__title {
    font-size: 18px;
    font-weight: 600;
}

.bpwc-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--bpwc-divider);
}
```

---

## Border Radius

| Element | Radius |
|---------|--------|
| Buttons | `6px` |
| Inputs / Selects | `6px` |
| Cards | `12px` |
| Panels | `12px` |
| Modals | `16px` |
| Badges | `12px` (pill) |
| Toggles | `12px` |
| Avatar / Icons (rund) | `50%` |
| Thumbnails | `8px` |
| Stats-Bar Segmente | `10px` (äussere Ecken) |

---

## Responsive

| Breakpoint | Anpassung |
|-----------|-----------|
| `< 1200px` | Formular-Grid-Reihen werden 1-spaltig |
| `< 960px` | Preview wird ausgeblendet |
| `< 782px` | WordPress Admin wird mobil — unsere Sidebar collapst |

---

## CSS Custom Properties (Zusammenfassung)

```css
:root {
    /* Colors */
    --bpwc-primary: #3276EA;
    --bpwc-primary-hover: #2058B8;
    --bpwc-primary-light: #EEF3FF;
    --bpwc-accent: #F97316;
    --bpwc-accent-hover: #EA580C;
    --bpwc-success: #34C759;
    --bpwc-error: #E74C3C;
    --bpwc-warning: #FF9800;

    /* Text */
    --bpwc-text: #1A1A1A;
    --bpwc-text-secondary: #555;
    --bpwc-text-muted: #888;

    /* Backgrounds */
    --bpwc-bg: #F8F9FA;
    --bpwc-bg-card: #FFF;

    /* Borders */
    --bpwc-border: #E4E4E4;
    --bpwc-border-light: #F0F0F0;
    --bpwc-divider: #EEE;

    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 12px;
    --space-lg: 16px;
    --space-xl: 20px;
    --space-2xl: 24px;
    --space-3xl: 32px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 2px 8px rgba(50,118,234,0.1);
    --shadow-lg: 0 4px 24px rgba(0,0,0,0.12);
    --shadow-focus: 0 0 0 2px rgba(50,118,234,0.15);

    /* Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-pill: 12px;
    --radius-round: 50%;
}
```

---

## Do / Don't

| Do | Don't |
|----|-------|
| Verwende CSS Custom Properties | Hardcoded Farben inline |
| Border statt Schatten für Ruhezustand | Box-Shadow auf ruhenden Cards |
| System-Font-Stack | Google Fonts laden |
| Dashicons für Navigation/Aktionen | Font Awesome oder andere Icon-Libs |
| Emoji für Source-Typen (konsistent) | Gemischte Icon-Systeme |
| `border-radius: 12px` für Cards | Verschiedene Radien pro Seite |
| `transition: all 0.15s` für Hover | Keine Transitions (harte Wechsel) |
| Weissraum für Struktur | Trennlinien überall |
| WordPress `SelectControl`, `TextControl` | Eigene Input-Komponenten (ausser nötig) |
| Mobile-First denken | Nur Desktop |
