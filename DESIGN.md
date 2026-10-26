---
name: AMP Isole Ciclopi
description: One live channel between diving operators, the AMP and the Guardia Costiera, drawn with the quiet iOS taste of Joi.
colors:
  ground: "#fafafa"
  card: "#ffffff"
  row: "#f0f0f2"
  row-2: "#e6e6e9"
  ink: "#111113"
  ink-2: "#3c3c43"
  ink-3: "#6a6a6f"
  line: "#e3e3e6"
  line-strong: "#d1d1d6"
  accent: "#0a7aff"
  accent-hover: "#006be6"
  accent-ink: "#0062d6"
  accent-soft: "#e3efff"
  accent-bright: "#64a8ff"
  night: "#141416"
  night-2: "#2c2c2e"
  night-3: "#a1a1a6"
  night-free: "#3a3a3c"
  ok: "#1b7331"
  ok-soft: "#e4f4e8"
  ok-bright: "#4cd964"
  warn: "#9a5b00"
  warn-fill: "#ff9f0a"
  warn-soft: "#fff1d6"
  bad: "#c4291f"
  bad-soft: "#ffe5e3"
  bad-bright: "#ff6961"
  map-ground: "#eef0f2"
  map-ok: "#34c759"
  map-bad: "#ff3b30"
  zone-c: "#8e8e93"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum'"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
    fontFeature: "'tnum'"
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "-0.01em"
    fontFeature: "'tnum'"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "'tnum'"
  tab-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  segment: "2px"
  sm: "8px"
  pill: "10px"
  md: "12px"
  lg: "16px"
  tile: "18px"
  xl: "24px"
  sheet: "28px"
  device: "36px"
  full: "9999px"
spacing:
  segment-gap: "2px"
  row-gap: "8px"
  row-x: "16px"
  stack: "16px"
  gutter: "20px"
  group: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.night-2}"
  button-primary-lg:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "56px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.row}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.row-2}"
  button-ghost:
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.accent-soft}"
  button-danger:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    height: "44px"
  field:
    backgroundColor: "{colors.row}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "56px"
  row:
    backgroundColor: "{colors.row}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "56px"
  row-hover:
    backgroundColor: "{colors.row-2}"
  pill:
    backgroundColor: "{colors.row-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "32px"
  pill-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  status-neutral:
    backgroundColor: "{colors.row-2}"
    textColor: "{colors.ink-3}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  status-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  status-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
  status-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
  status-bad:
    backgroundColor: "{colors.bad-soft}"
    textColor: "{colors.bad}"
  night-panel:
    backgroundColor: "{colors.night}"
    textColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "20px"
  tab-bar:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tab-label}"
    height: "48px"
  tab-bar-active:
    textColor: "{colors.ink}"
---

# Design System: AMP Isole Ciclopi

## Overview

**Creative North Star: "The Quiet Logbook"**

The app borrows the clean iOS taste of Joi and applies it to dive outings: a near-white ground, filled grey rows, small precise system type and a single black action per screen. Nothing is decorated. Depth comes from tone, not from lines or shadows, and colour is spent in tiny, meaningful doses: blue says "time, selection, yours"; green, amber and red say state.

One dark panel carries the next outing on Oggi and the action-needed numbers on the AMP dashboard. It is the only heavy surface, so the eye lands there first. Its signature is the capacity gauge: one segment per diver, the same drawing in the flow, on the map and on the dashboard, so diving and AMP read the same picture.

The mobile app lives in a 420px phone column; the AMP dashboard is the same system widened to a 1440px desk layout. The map is a neutral, desaturated backdrop for data pins.

**Key Characteristics:**
- Apple system font stack, contained scale 34 / 28 / 20 / 17 / 15 / 13 / 11, tabular numerals everywhere.
- Filled grey rows (`row`) separated by 8px of ground, no borders, no shadows.
- Black primary button, full width at the bottom of flows.
- Blue only for times, selection, focus and "your divers".
- One `night` panel per screen at most.
- Shadows exist only on things floating over the map.

## Colors

A neutral greyscale with one system blue and three iOS state colours.

### Primary
- **Ink Black** (`ink`): text, the primary button, occupied gauge segments.
- **System Blue** (`accent`): times, the "your divers" gauge segments, focus ring, caret, map pins without occupancy. `accent-ink` is the text-safe version for links, ghost buttons and accent pills on `accent-soft`; `accent-hover` darkens it. `accent-bright` is the blue on the night panel.

### Neutral
- **Paper Ground** (`ground`): every screen background; also the translucent tab bar and sticky headers (90-95% with backdrop blur).
- **Card White** (`card`): only for surfaces over the map (pin labels, site sheet, chips) and the light Weather chips.
- **Filled Row** (`row`): rows, fields, secondary buttons, the calendar, dashboard panels.
- **Pressed Row** (`row-2`): row hover/pressed, neutral pills and status, empty progress segments, the desktop backdrop behind the phone column.
- **Ink 2 / Ink 3** (`ink-2`, `ink-3`): row icons and secondary text; `ink-3` for subtitles, captions, labels, placeholders.
- **Line / Line Strong** (`line`, `line-strong`): free gauge segments, the tab bar top rule, table rules, unchecked choice ring, chevrons, scrollbars.
- **Night** (`night`, `night-2`, `night-3`, `night-free`): the dark panel, its secondary text (`night-3`), dark chips (`night-2`) and free gauge segments on dark (`night-free`). `night-2` is also the primary button hover.

### State
- **Ok / Warn / Bad** (`ok`, `warn`, `bad`) with `-soft` fills for status badges. `warn-fill` and the `-bright` variants are for the night panel, where the soft fills are replaced by the bright colour at 15% opacity.
- **Map colours**: `map-ground` behind the tiles; pin dots use `map-ok`, `warn-fill`, `map-bad`; zone circles are `zone-c` (C), `warn-fill` (B) and `map-bad` (A), 1.25px dashed at 5% fill. These are iOS system values drawn on the map only.

### Named Rules
**The Blue Means Selected Rule.** Blue marks what is selected or active — selected choices, chips and calendar day, the active tab, flow progress, the active map toggle, upcoming times — plus the operator's own divers and inline text links ("Modifica", "Copia", "Vedi il testo"). Navigation chrome ("Indietro", calendar arrows, "Chiudi") is `ink-2`. Blue never fills the primary button (always black, with a white icon) or a large surface.

**The One State, One Colour Rule.** On the phone every sent communication (outing, report, request) is green "Invio confermato": the AMP gives no feedback in the app, so there is no "Ricevuta", "In attesa" or "Vista" (the app confirms the sending, not that someone read it). Green also marks "Vista" / "Gestita" inside the operations centre (internal only); amber is only for warnings (rough sea, site almost full); blocking problems are red (`bad`); everything informational is `ink-3`. Map zones are greys with different dashes so red/amber only ever mean "full / almost full".

**The One Night Rule.** At most one `night` panel per screen; it holds the most important thing (next outing, pending count).

## Typography

**Body Font:** Apple system stack (`-apple-system`, SF Pro Text/Display, Helvetica Neue, Inter fallback)
**Mono Font:** `ui-monospace`, SF Mono, Menlo

**Character:** Native iOS: tight negative tracking on headings, -0.01em on body, tabular numerals globally so times and counts align.

### Hierarchy
- **Display** (700, 34px, line-height 1, -0.03em): the next-outing time on the night panel and the pending count on the dashboard. Nowhere else.
- **Headline** (700, 28px, 1.25, -0.02em): page titles (`PageHeader`), step titles, success screens, dashboard date.
- **Title** (700, 20px, -0.02em): section headings above lists.
- **Body** (400, 17px): row titles, fields, large buttons, calendar days. Base size of the document.
- **Body small** (400-600, 15px): subtitles, meta, buttons sm/md, pills, labels, dashboard text.
- **Caption** (400-600, 13px): row descriptions, status badges, pin labels, gauge legends, weekday headers, weather chips.
- **Tab label** (500, 11px): tab bar only.

### Named Rules
**The Five Steps Rule.** Text sizes come from 28 / 20 / 17 / 15 / 13; 34 and 11 are reserved for the next-outing time and tab labels. Weight, not size, carries emphasis (semibold 600 for buttons and status).

## Layout

- **Phone column:** the app renders in a column max 420px wide, full screen on mobile; from `md` (768px) it is centred on a `row-2` backdrop with 36px corners and a soft device shadow.
- **Gutter:** `gutter` (20px) on every screen edge. Rhythm uses role tokens: `stack` (16px) between related blocks, `group` (24px) between a title and its content, `section` (32px) between sections. Rows stack with 8px gaps. Inside a section: 12px between a label row and its content, between a list and a note or button under it, and before inline errors. Content rows use 12px vertical padding (`py-3`, at least 56px tall).
- **Headers:** page headers start at `max(3.5rem, safe-area-top)`; flow headers are sticky with a back control, "n di N" counter and a segmented 3px progress bar.
- **Bottom action:** flows end with a sticky bar fading from `ground`, bottom padding `max(2rem, safe-area-bottom)`.
- **Tab bar:** sticky, four equal columns, 48px minimum touch height.
- **Dashboard:** 1440px max, 24px side padding, 64px sticky header; from `lg` a two-column grid (1.35fr / 1fr): map and site table left, tabbed feed right.
- **Map screen:** full-bleed map; title pill, filter chips and the site sheet float over it with `gutter` insets.

## Elevation & Depth

Flat by default. Content surfaces sit on the ground by tone alone (`row` on `ground`, `row-2` for pressed). Shadows are reserved for elements floating over the map or the desktop backdrop; they are soft, negative-spread and tinted with ink.

### Shadow Vocabulary
- **Map chip** (`0 4px 14px -6px rgba(17,17,19,.3)`): title pill, filter chips, light weather chips over the map.
- **Map pin label** (`0 4px 14px -4px rgba(17,17,19,.3)`): site pin pill.
- **Map sheet** (`0 12px 36px -12px rgba(17,17,19,.35)`): the site card on Mappa.
- **Leaflet popup** (`0 10px 30px -10px rgb(17 17 19 / 0.25)`).
- **Toast** (`0 16px 40px -12px rgba(17,17,19,.5)`): dashboard night toasts.
- **Device** (`0 30px 60px -30px rgba(17,17,19,.35)`): the phone column on desktop.

### Named Rules
**The Float-Only Shadow Rule.** If it does not float over the map, a toast layer or the desktop backdrop, it has no shadow and no border.

## Shapes

Generous, continuous iOS corners. Gauge segments 2px; icon buttons 8px; pills 10px; small/medium buttons and pin labels 12px; rows, fields, large buttons, popups 16px; success tile 18px; night panel, calendar, map frames and dashboard panels 24px; map sheet 28px; phone column 36px; badges, chips, tab-free circles fully round. No visible borders on content; the only strokes are the dashed divider inside the night panel, the dashed "add" field in the flow, and table/tab rules on the dashboard.

## Components

### Buttons
- **Shape:** 12px (sm 36px / md 44px tall), 16px for the 56px full-width large button.
- **Primary:** `ink` with white semibold text; hover `night-2`; press scales to 0.985; disabled 30% opacity; loading spinner inline.
- **Secondary:** `row` → `row-2` on hover. **Ghost:** `accent-ink` text, `accent-soft` hover. **Danger:** `bad`.

### Lists and rows
- **Style:** a `List` stacks rows with 8px gaps; each row is `row` at 16px radius, min 56px (booking rows 64px), 12/16px padding, 17px title over a 13px `ink-3` description.
- **Choice row:** optional leading icon (`ink-2`, `accent` when selected); trailing 24px circle; selected = `accent` fill with white check, unselected = 1.5px `line-strong` ring. No ring or background change on the row itself.
- **Chip** (`Chip` in ui.tsx): 32px pill, 15px, 12px side padding, 16px icons; selected `accent` + white, unselected `row-2` + ink, no border. Used for day, duration and people. Every pill in the app is 32px: map title and filter, weather chips, onboarding team chips, the dashed "+ Aggiungi" field (the only dashed pill).
- **Bottom action hint:** when the primary button is disabled, a 15px `ink-3` line above it says what is missing ("Scegli un sito per continuare").
- **Nav row:** trailing `line-strong` chevron. Hover `row-2`.

### Pills and status
- **Pill:** 32px tall, 10px radius, 15px medium; neutral `row-2` or accent (`accent-soft` / `accent-ink`) for times awaiting the AMP.
- **Status:** 24px, fully round, 13px semibold with a 6px leading dot in `currentColor`; tones neutral, accent, ok, warn, bad. Diving side: "Invio confermato" ok for outings, reports and requests, "Annullata" neutral for a cancelled outing (the row turns `ink-3`, its time pill neutral). Dashboard only: "Vista", "Gestita" ok.
- **Timeline** (`Timeline` + `TimelineStep`): a `row` card with 24px step circles joined by a 2px line; done = `ink`, the positive outcome = `ok`, a cancellation = `bad`, todo = `line-strong` ring. Used on outing and report details: "Inviata" (time) → "Invio confermato" (ok, "Arrivata ad AMP e Guardia Costiera") → "Annullata" (bad, only if cancelled).
- **Forecast row** (`ForecastRow`): sea forecast at the chosen entry time (waves, wind, water) in a `row`; switches to `warn-soft` / `warn` text with "Mare mosso previsto" above 1.25 m waves or 30 km/h wind. Hidden when no forecast exists.
- **Emergency call** (`EmergencyCall`): `bad-soft` row with Phone icon linking to tel:1530; on Assistenza and on abuse reports.

### Inputs / Fields
- **Style:** filled `row`, 16px radius, 56px tall (textarea min 160px), 17px text, `ink-3` placeholder, blue caret, no border.
- **Focus:** 2px `accent` ring. Labels are 15px `ink-3` above the field.

### Navigation
- **Tab bar:** four icon+label tabs (24px icons, 1.75 stroke, 11px labels); active `accent`, inactive `ink-3`; translucent `ground` with a `line` top rule.
- **Flow header:** grey circular back glyph (`row-2`) + "Indietro" in `ink-2` (hidden on a first step with nowhere to go back), step counter, segmented progress (`accent` done, `row-2` todo).
- **Step title** (`FlowTitle`): every flow step opens with the 28px question and a 15px `ink-3` context line, then `group` spacing.
- **New activity flow (6 steps, CTA "Nuova attività"):** Cosa fai? (Immersione "Con le bombole" / Sea watching "Snorkeling in superficie", choice rows) → Quando esci? → Dove ti immergi? ("Dove fai sea watching?") → Chi va in acqua? → Pallone e accesso al sito → Controlla e invia. Team, buoy and access default to the last outing; a draft survives closing the app; "Modifica" returns to the summary. `?modifica=id` opens the same flow on the summary with every value of a sent outing ("Invia la modifica"; the outing goes back to "In attesa"); `?ripeti=id` keeps site and team and asks only when, then jumps to the summary.
- **Outing detail actions:** a list under the timeline: Modifica l'uscita (Pencil), Ripeti questa uscita (Repeat), Annulla l'uscita (CalendarX, `bad` text) with an inline confirmation (danger "Sì, annulla" + secondary "No, tienila"). Past or cancelled outings only offer Ripeti.
- **Onboarding (5 screens, nothing to fill in):** the diving is already registered at the AMP offices, so it only presents the app. Benvenuto (the eye opens among water ripples, "Ciao, {diving}") → Un'uscita in 30 secondi (summary rows rise one by one while a stopwatch counts to 0:30, then a black "Inviata") → Posti liberi in tempo reale (three gauges fill, then one changes live) → Il tuo team è già qui (staff chips rise, dashed "Aggiungi" nudges) → Invio confermato, subito (the night "Invio confermato" notice drops, the status goes from "Invio in corso" to green "Invio confermato"). Illustration on top, centred 28px title and 17px `ink-3` text below, `accent` page dots, black "Continua"/"Inizia", "Salta" in `ink-2`; swipe or arrow keys move between screens. Login has no sign-up: credentials come from the AMP.
- **Quando esci? has no preselection.** Three sections with one pattern: icon + 17px semibold label + chosen value on the right ("Da scegliere" until picked), then the choice: Giorno (chips Oggi · Domani · Altro giorno → calendar), Entrata in acqua (`TimePicker`, an iOS-style wheel of hours 06–20 and quarter hours on a `row` tray with a white selection band; a grey suggestion until the operator scrolls or taps; value shown as "circa 10:00" with the note "Basta un orario indicativo"), Tempo in acqua (chips 45 min · 1 h · 1 h 30 · 2 h). Times are approximate everywhere: "circa" in the flow, "Orario indicativo" in the summary, "(indicativo)" in the text for the authorities. Past times and times that would end after 23:45 are faded, not hidden. The exit row is computed and stays "Si calcola da sola" until entry and duration are both chosen.
- **Sea watching flow (5 steps, lighter):** snorkeling is bathing for the AMP decree, so: Cosa fai? → Quando esci? → Dove fai sea watching? (tap a free point on the map or "Usa la mia posizione", like reports; the point is named after the nearest site, "Vicino a Isola Lachea"; under the map a 13px `ink-3` note "Zona B · snorkeling consentito, senza posti da prenotare", or in zone A an amber `warn-soft` box about the marked areas of Isola Lachea; no capacity) → Il gruppo (Chi accompagna as one bottom-sheet picker, Partecipanti as a − N + counter "Basta il numero, senza nomi", Come arrivate? Da riva / In barca chips, Boa segnasub Con la boa / Senza chips; 15px section titles) → Controlla e invia (Punto, Gruppo · N partecipanti, Accesso e boa). Rows and panels show "N persone" instead of "N sub"; the detail page adds a small map of the point.
- **Chi va in acqua?:** kept light, it shows only who goes in the water. The capacity line sits on the ground (site in `ink-3`, "Usi N dei M posti liberi" on the right, gauge under it), no card. Istruttori and Guide: a 15px semibold title with the count in 13px `ink-3` on the right, then the chosen people as blue chips with an X (tap to remove) followed by the dashed "+ Aggiungi" chip, which opens a bottom sheet with every saved name as a checkbox row and a dashed "+ Aggiungi un istruttore" row that turns into a field + "Aggiungi" (the new name is saved to the team and chosen). Ospiti are always new names: chips with an X and the same dashed "+ Aggiungi" chip, which turns into a "Nome e cognome" field (Enter adds and keeps it open, Esc closes).
- **Bottom sheet** (`BottomSheet` in ui.tsx): slides up over a 30% `ink` scrim, `ground` surface, 28px top corners, grabber, 20px title with a 15px `ink-3` subtitle and "Fatto" (`accent-ink`, semibold) on the right; content scrolls, max 85% of the screen. Closes with "Fatto", a tap outside or Esc; the page underneath does not scroll.
- **Choosing a point (Segnala):** the map is for placing the pin only: protection zones and site labels stay visible but do not take taps or open popups, and the blue pin always sits above the labels.
- **In programma (home):** outing rows are 56px: Sailboat, site, "date · N sub", time pill on the right; no status pill (every sent outing is confirmed), only "Annullata" when cancelled. Up to 3 rows show; beyond that a 48px row "Altre N in programma · fino al {date}" with a chevron expands the list in place ("Mostra meno" closes it).
- **Home greeting:** above "Oggi" a 15px medium `ink-2` line with the small animated eye (28px, blinking and glancing) and a greeting by time of day plus the diving name ("Buongiorno, Acitrezza Diving Center"; Buon pomeriggio from 13, Buonasera from 18), via `PageHeader eyebrow`.
- **Account** (`/account`): personal credentials, one person per account. The home ("Oggi") has a single 28px `CircleUserRound` in `ink-2` at the top right of the header; it opens the Account page (Indietro + "Account"): title = the person's name, then an accent "Admin" or neutral "Membro" status and the diving name; sections Tu (email), Chi ha accesso al diving (32px initials circle, name, email, accent "Admin" badge; the admin also gets "Chiedi un accesso per un collaboratore" → an AMP request), Il team (admin: chips with an X and dashed "+ Aggiungi"; members: read-only rows and "Il team del diving lo gestisce l'admin"), App, Esci. The older description below is kept for the rest of the layout. Title = diving name; sections Il tuo diving (email, with a note that name and email come from the registration at the AMP offices), Il tuo team (roles with the names underneath, read-only; people are added with "+ Aggiungi" in the flow), App (data mode, Rivedi la presentazione, Centrale operativa for AMP staff, Ricomincia la demo in demo mode) and a secondary "Esci"; a small still eye + "AMP Isole Ciclopi" closes the page. The AMP tab only holds requests.
- **Controlla e invia:** summary rows put the 13px label and "✎ Modifica" (Pencil 16px + text, `accent-ink`) on one line and the value below at full width. Under them, the section "Il testo per gli enti" (20px title + context) shows the exact message in a `row` card: "A: AMP Isole Ciclopi · Guardia Costiera", the first lines with a fade, then "Leggi tutto il testo".
- **Dove ti immergi?:** the map gets the room (320px); pins show the site name, the coloured dot carries the capacity state. Site rows are single-line: name, "Zona X · N liberi", check circle.

### Night panel (signature)
`night` ground, 24px radius, 20px padding: 15px `night-3` label with a bright-tone status, 34px time with the end time in `night-3`, 17px site, 15px meta, dashed `night-free` divider, then the capacity gauge in dark tone with "tuoi n" in `accent-bright`.

### Capacity gauge (signature)
One 8px-tall segment per diver, 2px gaps and radius. Occupied `ink` (white on dark), operator's own and those being added `accent`, overflow `bad`, free `line` (`night-free` on dark). Colour transitions 500ms on the expo ease, staggered 14ms per segment. Map pins carry the site name and, unless `compactPins` is set, a 3×4px mini version under it; compact pins (flow, report, dashboard maps) show the name only.

### Map pins
A 10px state dot (`map-ok` / `warn-fill` / `map-bad`, `accent` with no data) with a white 2px ring, plus a white 12px-radius label pill offset by the site's label direction. The pill's title is always the site name (13px semibold); on Mappa and wherever occupancy is known a 3×4px mini gauge sits under it, while free places are read from the dot and the site sheet; selected pins invert to `accent`. Reports are 22px rotated squares (`map-bad` open, `ink-3` closed). The tile layer is desaturated (`grayscale .7, brightness 1.06, contrast .9`).

### Logo (signature)
The cyclops' eye (`CyclopsEye`): an `accent` rounded silhouette with an eye-shaped opening and a notched pupil; the white of the eye takes the background colour (`sclera` fill class). It blinks every 7s (once, then twice in a row) by squashing the eye to 6% height around its centre; on Login and the first onboarding screen it opens from closed and the pupil glances left and right. Used on Login (80px), onboarding (128px), the home greeting (28px), the loading screen (48px) and the dashboard header (32px); the favicon is the still version.

### Motion
Screens and steps enter with a 6px rise over 320ms on `cubic-bezier(0.16, 1, 0.3, 1)`; new dashboard items flash `accent-soft` for 3s; the success tile pops in over 600ms. Onboarding illustrations use `rise` (14px, 600ms), `drop` (the notice, 700ms), `ripple` (rings around the eye) and `nudge` (the add chip). Reduced motion collapses all of it: the eye stays open and still, ripples are hidden, illustrations start at their final state.

## Do's and Don'ts

### Do:
- **Do** use the `gutter` / `stack` / `group` / `section` spacing tokens for screen padding and vertical rhythm.
- **Do** build lists as filled `row` blocks with 8px gaps and 16px corners.
- **Do** keep one black primary action per screen, full width at the bottom of flows.
- **Do** show times in a pill (blue when upcoming, neutral when past) and keep blue for selection, active states, inline links and the operator's own divers.
- **Do** follow the icon standard (lucide, always `ink-2` unless the row is selected): 22px / 1.75 stroke as the leading icon of rows, fields, summaries and step rows; 18px / 2 inside buttons, chips and text lines; 16px / 2.5 for chevrons; 24px in the tab bar.
- **Do** keep one icon per concept: Sailboat = outing, WavesArrowDown = immersione (scuba), Waves = sea watching (snorkeling), Anchor = diving centre, Fish = fishing, Ship = boat, Footprints = from shore, ArrowDownToLine / ArrowUpFromLine = entry / exit from the water, Clock = time window, LifeBuoy = buoy, MapPin = site, GraduationCap / UserRound / UsersRound = instructors / guides / guests, ShieldAlert / Binoculars / Trash2 = abuse / sighting / waste, Landmark = AMP, LogOut = sign out only, Pencil = edit, Repeat = repeat, CalendarX = cancel outing, LocateFixed = my position, Phone = emergency call, RotateCcw = restart demo, CircleUserRound = account, Presentation = replay the onboarding, Timer = the 30-second promise.
- **Do** reuse the capacity gauge wherever site capacity appears.

### Don't:
- **Don't** add borders or drop shadows to rows, cards or panels on the ground.
- **Don't** fill a primary button or a large surface with blue.
- **Don't** use type sizes outside 28 / 20 / 17 / 15 / 13 (34 and 11 only in their reserved roles).
- **Don't** put more than one `night` panel on a screen.
- **Don't** use the map's bright iOS state colours (`map-ok`, `map-bad`) for text on light surfaces; use `ok` / `bad`.
