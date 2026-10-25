---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages/Dashboard.tsx"]
---

# Surface brief: app diving + centrale operativa

Scope: the whole product UI, Operate mode. Mobile app for diving operators
(`/attivita`, `/segnala`, `/amp`, step flows, login, onboarding) and the
desktop AMP dashboard (`/dashboard`). The `/mappa` tab is frozen: it keeps
its previous look via the `.legacy-map` token scope.

Audience and job: a diving operator on the dock in full sun communicates an
outing in ~30 s; AMP staff at a desk acknowledge it live.

## Direction contract

THESIS: Every outing is a Komoot-style tour card: real map of the site,
descriptive title, icon stats, depth profile, capacity. Refuses flat
grey-card UI and the bright default blue of the 2023 project.

OWN-WORLD: cool light ground, white cards with soft elevation, Prussia blue
#123a5e for structure and actions, ice blue #7fb2e5 for "yours" and the
depth line; deep Prussia panels; green/amber/red only for state. Geist,
heavy titles, tabular figures; pill primary buttons.

STORY: open Oggi, see the next outing as a tour card, tap "Pianifica
un'uscita", pick the site on a full-width map with a bottom sheet, send;
the AMP acknowledges, the card turns "Vista".

FIRST VIEWPORT: Attività: "Oggi" + date, conditions pill right; tour card
(map thumb with site label and status chip, kicker, title, stats row, depth
profile, capacity gauge with your divers in ice); full-width pill CTA.

FORM: Komoot structure with Prussia/ice palette, chosen by the user over
canon, Apple Fitness and Ionio previews. Signature: the tour card and the
one-segment-per-diver gauge. seed: a769fc15707765eb

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
