---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages/Dashboard.tsx"]
---

# Surface brief: app diving + centrale operativa

Scope: the whole product UI, Operate mode. Mobile app for diving operators
(`/attivita`, `/segnala`, `/mappa`, `/amp`, step flows, login, onboarding) and
the desktop AMP dashboard (`/dashboard`). On `/mappa` only the visual style may
change; functions, behaviour and components stay as they are.

## Direction contract

THESIS: The clean iOS taste of Joi applied to a dive-outing tool: quiet
neutral surfaces, small precise type, one black action. Refuses decorative
themes, oversized type, borders and drop shadows on content.

OWN-WORLD: near-white ground #fafafa, filled grey rows #f0f0f2, near-black
ink and black primary buttons, one dark panel for the next outing; system
blue only for times, selection and "your divers"; green/amber/red for state.
Apple system font, scale 28/20/17/15/13.

STORY: open Oggi, read the next outing on the dark panel, tap Nuova uscita,
six one-question steps, send; the AMP acknowledges, the badge turns green.

FIRST VIEWPORT: Attività: "Oggi" 28 bold, date and sea conditions in grey
15; dark panel with time 34 bold, site, divers, capacity gauge (yours in
blue); full-width black "Nuova uscita"; then grey rows for upcoming outings
with the time in a pill, and other activities.

FORM: Joi taste on the second version of the app, chosen by the user after
canon, Komoot, Apple Fitness, Nike Run Club previews. Approved preview:
.impeccable/mocks/joi.html. Signature: the
one-segment-per-diver gauge. seed:a769fc15707765eb

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
