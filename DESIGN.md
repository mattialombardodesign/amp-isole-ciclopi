---
name: AMP Isole Ciclopi
description: One live channel between diving operators, the AMP and the Guardia Costiera, where every outing reads like a route card.
colors:
  accent: "#123a5e"
  accent-hover: "#0d2d4a"
  accent-soft: "#e6eef6"
  accent-bright: "#9cc7ef"
  ice: "#7fb2e5"
  ice-ink: "#2a659c"
  ice-soft: "#e3effa"
  ground: "#f4f6f9"
  card: "#ffffff"
  ink: "#0d1a2a"
  ink-2: "#3d4b5e"
  ink-3: "#5d6b7e"
  line: "#e1e7ef"
  line-strong: "#cbd5e1"
  night: "#0a2540"
  night-2: "#1a3a5c"
  night-3: "#a5b8cc"
  night-free: "#2b4a6b"
  ok: "#0e6e3f"
  ok-soft: "#e3f3ea"
  ok-bright: "#5fd394"
  warn: "#8a5000"
  warn-fill: "#f2a516"
  warn-soft: "#fdf1da"
  bad: "#b3202d"
  bad-soft: "#fce8ea"
  bad-bright: "#ff7b84"
typography:
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline-step:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  stat:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum'"
  section:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  tour-title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  body-lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  row-title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum'"
  stat-item:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "'tnum'"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.43
  meta-line:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.43
    fontFeature: "'tnum'"
  caption:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
  tab:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.43
rounded:
  segment: "2px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  sheet: "28px"
  device: "36px"
  full: "9999px"
spacing:
  hairline-gap: "2px"
  xs: "8px"
  sm: "12px"
  stack: "16px"
  gutter: "20px"
  group: "24px"
  gutter-desk: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-lg:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "56px"
    width: "100%"
  button-dark:
    backgroundColor: "{colors.night}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    height: "44px"
  button-dark-hover:
    backgroundColor: "{colors.night-2}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ground}"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.card}"
    rounded: "{rounded.md}"
    height: "44px"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.row-title}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  list-group:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
  list-row:
    textColor: "{colors.ink}"
    padding: "12px 16px"
    height: "60px"
  list-row-selected:
    backgroundColor: "{colors.accent-soft}"
  tour-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px 16px 20px"
  site-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "14px"
    width: "224px"
  site-thumb-label:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.card}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  bottom-sheet:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.sheet}"
    padding: "12px 20px 8px"
  status-pill-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  status-pill-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    rounded: "{rounded.full}"
    height: "24px"
  status-pill-bad:
    backgroundColor: "{colors.bad-soft}"
    textColor: "{colors.bad}"
    rounded: "{rounded.full}"
    height: "24px"
  status-pill-accent:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.full}"
    height: "24px"
  conditions-pill:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.meta-line}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "36px"
  chip-dark:
    backgroundColor: "{colors.night-2}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    height: "36px"
  chip-toggle:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "40px"
  chip-toggle-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  night-panel:
    backgroundColor: "{colors.night}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  tab-bar:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tab}"
    height: "48px"
  tab-bar-active:
    textColor: "{colors.accent}"
  capacity-segment-free:
    backgroundColor: "{colors.line-strong}"
    rounded: "{rounded.segment}"
    height: "10px"
  capacity-segment-used:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.segment}"
    height: "10px"
  capacity-segment-mine:
    backgroundColor: "{colors.ice}"
    rounded: "{rounded.segment}"
    height: "10px"
  capacity-segment-over:
    backgroundColor: "{colors.bad}"
    rounded: "{rounded.segment}"
    height: "10px"
---

# Design System: AMP Isole Ciclopi

## Overview

**Creative North Star: "The Prussian Route Card"**

Every outing is a route card in the manner of Komoot: a real map of the dive site on top, a descriptive title, a row of icon stats, a depth profile where Komoot draws elevation, and the site's capacity. The palette is Prussia blue and ice on a cool light ground: deep Prussia for structure and every action, pale ice for what belongs to the operator, and green, amber and red only for state. It is light because the app is used on the dock in full sun, and it refuses both flat grey-card UI and the bright default blue of the 2023 project.

Density is comfortable on mobile (56px pill call to action, 60px rows, a 20px gutter, 40px between sections) and calmer but tighter on the desktop "centrale operativa", which shares the same palette, gauge and map pins. Titles are heavy and tightly tracked; numbers use tabular figures. White cards sit on the cool ground with a soft, Prussia-tinted elevation; inner boxes and forms stay flat with hairline rings.

The signatures are the **route card** (map preview, stats row, depth profile, gauge) and the **capacity gauge**, one segment per diver, the same picture for operator and AMP. The Mappa tab is a deliberately frozen legacy scope that keeps the previous system's colours (see Colors).

**Key Characteristics:**
- Light by default; contrast tuned for outdoor sunlight.
- Prussia blue for structure and action, ice for "yours", the state triad only for state.
- Real OpenStreetMap previews, desaturated, wherever an outing or site is represented.
- Geist with tabular figures; heavy, tightly tracked titles; icon stats in a wrapping row.
- Soft Prussia-tinted elevation on lead cards and lists; flat ringed boxes inside them.
- Fast out-expo motion, fully disabled under reduced motion.

## Colors

A cool blue-grey field, one deep Prussia blue that carries structure and action, a pale ice family that marks ownership, a deep Prussia night family for dark panels, and a strictly functional state triad.

### Primary
- **Prussia Blue** (accent): primary buttons, selected rows and checks, active tab, focus ring and caret, step-flow progress, stat icons, the site label on map previews, "used" segments in the capacity gauge, the depth profile fill (90% to 45% opacity), selected calendar day.
- **Pressed Prussia** (accent-hover): hover of primary buttons only.
- **Prussia Wash** (accent-soft): selected list row, focused dashboard row, text selection, the 3s "new item" flash, the conditions pill and accent status pill.
- **Night Ice** (accent-bright): highlighted figures on the night panel, where Prussia Blue would disappear.

### Secondary
- **Ice** (ice): what belongs to the operator: their own and their just-added divers in the capacity gauge, the site pin on map previews, the depth line over the profile fill, the plus glyph inside the primary call to action, the selection ring on Prussia map pins.
- **Ice Ink** (ice-ink): text form of ice on light surfaces: the date/time line of the operator's own outings and the "tuoi N" count. Ice itself is never text on light.
- **Ice Wash** (ice-soft): defined for ice-tinted fills; not yet used in the build.

### Neutral
- **Cool Ground** (ground): app background, hover fill of rows and secondary buttons, frosted sticky headers and bottom actions, the sheet behind the detail cover.
- **Card White** (card): every content surface: route cards, lists, inputs, calendar, dashboard panels, bottom sheet.
- **Prussia Ink** (ink): primary text and headings; selected filter chips; the active dashboard tab underline.
- **Ink Secondary** (ink-2): supporting text, field labels, stat values.
- **Ink Tertiary** (ink-3): metadata, timestamps, placeholders, inactive tabs, depth-profile caption.
- **Hairline** (line): row dividers, card rings, the sheet grabber, the empty map-tile backing.
- **Hairline Strong** (line-strong): input and secondary-button rings, unselected checks, free gauge segments, empty progress steps.

### Night (dark panel family)
- **Deep Prussia** (night): the dashboard stat strip, dashboard toasts, the dark button.
- **Prussia Raised** (night-2): dividers on night, dark chips.
- **Night Text** (night-3): secondary text and icons on night.
- **Night Free** (night-free): free gauge segments on night.

### State
- **Acknowledged Green** (ok / ok-soft / ok-bright): "Vista dall'AMP", live indicator, sites with room on pins; bright variant only on night.
- **Pending Amber** (warn / warn-soft / warn-fill): "In attesa", sites under 30% free; warn-fill is a fill (dots, pins), never text on light.
- **Full Red** (bad / bad-soft / bad-bright): site full, over-capacity segments, open reports, errors; bright variant only on night.

### Legacy scope: Mappa tab
The `/mappa` tab is frozen on purpose and wrapped in a `.legacy-map` scope that re-declares the previous tokens inside it: ground #f2f3f5, ink #0b0f14, ink-2 #3f4753, ink-3 #636b78, line #e4e7eb, line-strong #d0d5dc, accent #0a5cff (hover #0849cc, soft #e7eeff), night #0b0f14, night-2 #1b212b. Its map renders with the site map's `legacy` tone (signal-blue selection, near-black pins, ink-tinted float shadows). This is a scoped exception, not drift: do not "fix" it toward Prussia, and do not reuse its values anywhere else. Every other map uses the `prussia` tone.

### Named Rules
**The Prussia Acts Rule.** Prussia Blue means structure or "act here": actions, selection, focus, stat icons, used capacity. It never marks state and never decorates.

**The Ice Is Yours Rule.** Ice marks what belongs to the operator (own divers, own outing's time, the site pin, the depth line). If nothing on the element is the operator's, it is not ice.

**The State-Only Triad Rule.** Green, amber and red appear only when they report a state. A coloured element with no state behind it is a defect.

**The Bright-On-Night Rule.** On night surfaces use accent-bright, the `-bright` state variants and night-3; the light-ground variants are for light surfaces only.

## Typography

**Display / Body Font:** Geist (with ui-sans-serif, system-ui)
**Mono Font:** Geist Mono (coordinates in DMS format only)

**Character:** One neutral grotesk carries everything. Personality comes from heavy weights and tight negative tracking on titles, and from tabular figures (`tnum`, set on body) so times, counts and free places align.

### Hierarchy
- **Headline** (800, 34px, line-height 1, -0.035em): tab page titles ("Oggi") and the login title. The dashboard date and success titles use the same size at 700, -0.03em.
- **Headline Step** (800, 28px, 1.25, -0.03em): the single question of each flow step, onboarding titles, the outing detail title.
- **Stat** (600, 32px, 1, -0.03em): dashboard totals on the night strip. The planner's free-places figure uses 28px at 800.
- **Section** (800, 20px, -0.025em): section headings above lists and carousels.
- **Tour Title** (700, 20px, 1.375, -0.02em): the descriptive title of a route card ("Immersione guidata alla Grotta del Mago"); 18px in the review card, 16px in carousel cards.
- **Body Lead** (400, 17px, relaxed): intro sentence under login and success titles, max ~24rem.
- **Row Title** (500 to 600, 16px): list rows and input text (16px also prevents iOS zoom).
- **Body** (400, 15px): subtitles, dashboard rows, buttons at 600.
- **Stat Item** (500, 15px, ink-2): each entry of the icon stats row, with a 16px Prussia icon.
- **Label** (500, 14px): field labels, metadata, chips, capacity labels.
- **Meta Line** (600, 14px, ice-ink): the date/time line of the operator's own outing above its title or in its row.
- **Caption** (600, 12px): status pills; 12px regular for the depth-profile caption.
- **Tab** (500, 11px): bottom tab-bar labels under 24px icons.

### Named Rules
**The Title Then Stats Rule.** A route card reads top to bottom: map, meta line, title, icon stats row, depth profile, capacity. Stats are icon plus value in a wrapping row, never a table or a grid of tiles.

**The No Eyebrow Rule.** No uppercase or letter-spaced labels above headings. A line above a title is allowed only when it carries data (a date, a time, "tra 2 ore"), in sentence case.

## Layout

Two shells. On mobile the app is a single column at full width; from 768px it renders inside a centred 420px "phone" column on a slightly darker backdrop. The AMP dashboard is a separate desktop layout, max 1440px with a 24px gutter: a sticky 64px header, a headline row with conditions chips, a full-width night stat strip (2 columns, 4 from 640px), then from 1024px a two-column grid (map and capacity table at ~1.35fr, tabbed inbox at 1fr).

Mobile rhythm uses role-named spacing tokens: **gutter** 20px screen margin, **stack** 16px between related blocks, **group** 24px from a page title to its content, **section** 40px between sections; 12px from a section heading to its list. Horizontal carousels bleed to the screen edge, snap per card and keep the gutter as scroll padding.

Flows share a frame: sticky frosted header (back, "n di N", segmented progress), one step title, content, sticky bottom action with the full-width pill. The site step is a full-bleed map with a bottom sheet that overlaps it by 24px. The outing detail and login open on a full-width map cover (256px and 224px) with the ground sheet rising over it by 24px with 28px top corners.

**The Thumb Zone Rule.** The primary action of a mobile screen is the full-width 56px pill within thumb reach. Interactive targets are at least 44px.

## Elevation & Depth

A hybrid. Lead content (route cards, grouped lists, carousel site cards) floats softly over the cool ground with a hairline bottom edge plus a long, negative-spread, Prussia-tinted shadow. Boxes inside the flow (form cards, calendar, review card, text blocks, dashboard panels) stay flat with a 1px hairline ring. Sticky bars use a 90% fill with backdrop blur. Map overlays (back button, brand pill, bottom sheet) carry the strongest shadows.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 0 var(--color-line), 0 10px 24px -20px rgba(10,37,64,.45)`): grouped lists, carousel site cards.
- **Card Lead** (`box-shadow: 0 1px 0 var(--color-line), 0 16px 36px -24px rgba(10,37,64,.55)`): the route card of the next outing.
- **Action Glow** (`box-shadow: 0 10px 24px -14px rgba(18,58,94,.9)`): primary buttons only.
- **Float Button** (`box-shadow: 0 6px 16px -6px rgba(10,37,64,.5)`): round back button and brand pill over a map cover.
- **Sheet** (`box-shadow: 0 -12px 30px -18px rgba(10,37,64,.45)`): bottom sheet rising over the planner map.
- **Pin** (`box-shadow: 0 0 0 3px #fff, 0 4px 10px rgba(10,37,64,.35)`): the ice pin on map previews.

**The Prussia Shadow Rule.** Shadows are tinted with deep Prussia (rgb 10 37 64), never neutral black, and are long with negative spread so they read as lift, not outline.

## Shapes

Rounding grows with the surface: 8px for small buttons, icon buttons and the site label on maps; 12px for standard buttons, inputs and row thumbnails; 16px for lists, carousel cards, calendar, form boxes and dashboard panels; 24px for the route card and the review card; 28px for sheet tops rising over a map; 36px for the desktop phone column. The large call to action, chips, status pills, checks, calendar days and the conditions pill are fully round. Capacity segments have 2px corners and a 2px gap. Map previews are clipped rectangles inside their card's radius. Borders are 1px inset rings, 2px only for focus and the active dashboard tab underline.

## Components

### Buttons
Confident and quick: semibold label, a slight press (scale .985) on active, 35% opacity when disabled, inline spinner when loading.
- **Primary:** Prussia Blue with white text and the Action Glow, 44px high with 12px corners; Pressed Prussia on hover.
- **Large primary:** a 56px full-width pill, 16px text, the screen's main action; may lead with an ice plus glyph.
- **Dark:** Deep Prussia fill, Prussia Raised on hover.
- **Secondary:** white with a strong hairline ring, ground on hover; also the square icon button (36 or 44px).
- **Ghost:** ink-2 text, 5% ink wash on hover. **Danger:** Full Red, white text.

### Route card (signature)
- **Frame:** white, 24px corners, Card Lead shadow and hairline ring, presses to .99.
- **Map preview:** 160px high (256px as a detail cover, 144px in review, 112px in carousel cards, 48 to 72px squares in rows): a 3x3 mosaic of OpenStreetMap tiles centred on the site, desaturated (saturate .55, brightness 1.03, contrast .95). A 16px ice pin with a white 3px ring sits on the exact point; optionally a Prussia label with the site name to its right. A status pill may sit top-left.
- **Body:** 16px padding (20px bottom): meta line in ice-ink, tour title, icon stats row (time, divers, depth, zone; 16px gap), depth profile, then "Posti al sito · tuoi N" over an 8px capacity gauge.

### Depth profile
A 56px-high SVG area: a smooth curve descending from the site's minimum to maximum depth and back, filled with a vertical Prussia gradient (90% to 45%) and stroked with a 2.5px ice line. A 12px ink-3 caption states it is indicative and gives the maximum depth. Illustrative, varied per site.

### Capacity gauge (signature)
A row of equal segments, one per diver allowed at the site, 2px apart with 2px corners, 10px high (8px inside cards). Free segments are Hairline Strong (Night Free on dark); places taken by others are Prussia Blue (white on dark); the operator's own and newly added divers are Ice; if the total would exceed capacity those turn Full Red. Segments colour in sequence (14ms stagger, 500ms out-expo). Paired with "N liberi su M", amber under 30% free, red "Pieno" at zero. Map pins carry a miniature (3x4px) under the free count.

**The Same Picture Rule.** Capacity is always shown with this gauge, in every surface and for every role. Never a percentage bar, ring or number alone.

### Lists and rows
- **Group:** white, 16px corners, hairline ring, Card Rest shadow, rows divided by hairlines.
- **Choice row:** 60px minimum, optional 20px icon, title and ink-3 description, 24px round check (Prussia filled with white check when selected; row gets the Prussia Wash).
- **Nav / booking row:** same frame with a trailing chevron; booking rows lead with a 72px rounded map thumbnail, then meta line, site name and status pill.

### Status pill and chips
- **Status pill:** 24px, fully round, 12px semibold, 6px dot; soft background with state text (ok, warn, bad, accent, neutral).
- **Conditions pill:** Prussia Wash with Prussia text, beside the page title ("Mare 24° · Vento 5 km/h").
- **Conditions chips:** 36px, icon plus value, white with strong ring on light, Prussia Raised on dark.
- **Filter chips:** 40px, ground fill; selected turns ink with white text and a check.

### Inputs / Fields
White, 12px corners, 1px strong inset ring, 48px high (textarea min 144px), 16px text, ink-3 placeholder, Prussia caret. Focus thickens the ring to 2px Prussia; the global focus-visible outline is 2px Prussia with 2px offset. Errors appear as a bad-soft box with bad text. Compact inline fields use a ground fill without a ring.

### Navigation
- **Tab bar:** sticky bottom, four equal columns, white at 90% with blur and a top hairline; 24px icons at 1.75 stroke over 11px labels; active Prussia, inactive ink-3.
- **Page header:** 34px headline with the date below in ink-3, conditions pill aligned right.
- **Flow header:** 44px round back button, "n di N" counter, 4px segmented progress (Prussia up to the current step).
- **Dashboard tabs:** 48px with a 2px ink underline when active, count in a ground pill.

### Night panel
Deep Prussia, 16px corners, used on the dashboard as the day's stat strip (32px stats over night-3 labels, night-2 dividers) and as live toasts (16px corners, 16px padding). Highlighted figures use accent-bright or bad-bright.

### Map pins (Prussia tone)
A 10px state dot on the exact coordinate with a white ring, and beside it a 12px-corner pill with the free count and a miniature gauge: white with ink text, or Prussia with white text and a 3px ice ring when selected.

### Motion
Entrances rise 6px with a fade (320ms, out-expo `cubic-bezier(0.16, 1, 0.3, 1)`); the success check scales in from 0.7 with a blur (600ms); new dashboard items flash the Prussia Wash for 3s; state colour changes run 150 to 300ms. All collapse to near zero under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** represent every outing and site with a real map preview (the route card or its thumbnail), not an icon or illustration.
- **Do** keep one full-width 56px Prussia pill as the primary action per mobile screen.
- **Do** use Ice only for what belongs to the operator, and Ice Ink when it must be text on light.
- **Do** show capacity with the segmented gauge plus the "N liberi su M" label, everywhere.
- **Do** use the role spacing tokens (gutter 20px, stack 16px, group 24px, section 40px) instead of ad hoc margins.
- **Do** tint every shadow with deep Prussia and keep inner boxes flat with hairline rings.
- **Do** pass the `prussia` tone to every map outside the Mappa tab.

### Don't:
- **Don't** restyle the Mappa tab or remove its `.legacy-map` scope; don't copy its signal blue or near-black values elsewhere.
- **Don't** use green, amber or red for anything that is not a state.
- **Don't** use ice or warn-fill as text on light surfaces, or the bright state variants off night.
- **Don't** use gradients, wave motifs or illustrations as decoration; the only gradient is the depth profile fill.
- **Don't** introduce a second accent hue or a second typeface (Geist Mono is only for coordinates).
- **Don't** put uppercase or letter-spaced eyebrow labels above headings.
