# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: diving operators.** Instructors or owners of a diving center at
  Aci Trezza who, minutes before leaving the harbour by boat or from shore,
  must notify each outing. They use a phone, often standing, outdoors in strong
  Sicilian sun, sometimes with wet hands, in a hurry.
- **Secondary: AMP staff (Direzione) and Guardia Costiera.** They receive and
  acknowledge outings, reports and requests from a desktop in an office: the
  "centrale operativa" at `/dashboard`.

## Product Purpose

Every outing inside the Area Marina Protetta Isole Ciclopi must be
communicated to the AMP and the Guardia Costiera with a fixed set of data
(site and coordinates, date, entry/exit time, instructors, guides, guests,
signal buoy, exit mode). Today this is a hand-written email that takes about
5 minutes every time, and each actor works in isolation. The product turns it
into a guided flow of about 30 seconds and gives every actor the same live
picture. Success: outings communicated quickly and correctly, acknowledged by
the AMP, and no dive site over capacity.

## Positioning

- **One channel for everyone:** diving centers, AMP Direzione and Guardia
  Costiera see the same information at the same moment, instead of scattered
  emails.
- **Capacity per site:** the app knows how many divers are already booked at
  each site for a given day and refuses overcrowding, to protect the habitat.
  The check runs server-side.
- **30 seconds instead of 5 minutes:** recurring data (team members, sites) is
  already there; the operator confirms instead of retyping.

## Operating Context

- Area: AMP Isole Ciclopi, Aci Trezza / Aci Castello (Catania), Zones A, B, C.
- Activities: "Immersione" (guided scuba visit, with tanks) and "Sea
  watching" (snorkeling at the surface), chosen at the start of the "Nuova
  attività" flow. Sea watching is lighter: for the AMP decree snorkeling
  is "balneazione" (allowed in zones B and C, in zone A only in the marked
  areas of Isola Lachea), so it has no site capacity and no guest names:
  a free point on the map, who leads the group and how many people; also reports (illegal fishing/anchoring, species
  sightings, waste) and requests to the AMP (appointments with experts,
  assistance).
- People, not shared logins: each person of a diving has personal
  credentials (created by the AMP) and belongs to the diving's space as
  admin (the owner: manages the team, asks the AMP for colleagues'
  access) or member. Outings, reports and requests belong to the diving
  and show who sent them.
- The AMP never gives feedback in the app: the operator only gets the
  confirmation that the communication reached AMP and Guardia Costiera
  ("Invio confermato"), never a "received/seen by the AMP". "Presa visione" / "Gestita" are internal tools of the
  operations centre and are not shown on the phone.
- Origin: UX/UI project from a master (2023, research with 9 interviews of AMP
  workers, 48h of process analysis, 8 marine-area apps reviewed), rebuilt as a
  working app for the final exam of the "Vibe Coding for Design" course (NID,
  26 Oct 2026). The demo is shown via screen sharing, 5–7 minutes.

## Capabilities and Constraints

- React 19 + Vite + Tailwind v4, Supabase (Postgres, Auth, Realtime, RLS),
  Leaflet/OpenStreetMap, Vercel. A demo mode (browser storage +
  BroadcastChannel) runs without Supabase.
- Interface language: Italian.
- Dive site coordinates, capacities and zone perimeters are indicative
  (demo data), not official AMP data.

## Brand Commitments

No official AMP logo or palette is required. The 2023 master project is a
reference for flows only, not for visual style.

Standing preference (chosen by the user, 25 Oct 2026, after several preview
rounds): the clean iOS taste of the Joi app — Apple system font (SF Pro), Joi's
type scale (28 / 20 / 17 / 15 / 13), near-white neutral surfaces, filled grey
rows without borders or shadows, black primary buttons, colour in small doses
(blue for times, selection and "your divers"). Applied to the second version
of the app (Oggi with the dark next-outing panel, lists, 6-step flow). Copy
Joi's taste, not its components. The Mappa tab follows the same style but its
functions, behaviour and components must not change.

## Evidence on Hand

- Research figures from the master project: 9 interviews, 48h analysis, 8 apps
  reviewed; ~5 minutes per email vs ~30 seconds with the flow (average over 9
  user tests).
- No real customers, testimonials or official AMP endorsement: none may be
  invented. Diving center names and people in the demo data are fictional.

## Product Principles

1. Speed in the field: every outing must be communicable one-handed, in the
   sun, in about 30 seconds.
2. One shared truth: what the operator sends is exactly what the AMP and the
   Guardia Costiera see, live.
3. The habitat comes first: capacity and zones are part of the flow, not
   fine print.
4. Confirm, don't retype: reuse what the app already knows.

## Accessibility & Inclusion

Outdoor use in strong sunlight: high contrast and large touch targets are
required on the mobile app.
