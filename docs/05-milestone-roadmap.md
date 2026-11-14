# Field Shift — Frontend Milestone Roadmap

**This file is a roadmap, not permission to generate or execute M1–M5 prematurely.** Only M0's four implementation guides are included in this handoff.

| Milestone | Gate and deliverable | Developer workstreams (provisional) |
|---|---|---|
| M0 Foundation | Bootstrapped app, verified design tokens, reusable controls, i18n and audio primitives, test tools; `npm run check` passes | DEV1 foundation; DEV2 controls; DEV3 locale; DEV4 audio/testing |
| M1 App shell | First-visit pulsing audio tutorial, bilingual language choice before clearly labeled phone/demo entry, Home/Profile/navigation; browser journey passes | DEV1 welcome/login; DEV2 home; DEV3 mobile nav; DEV4 profile/onboarding |
| M2 Parcel & rotation | Image-first crop selection, progressive form, current strategy plus two clearly labeled demo alternatives, explanation and crop calendar; tests for invalid/unknown states | DEV1 parcel; DEV2 compare; DEV3 explanations; DEV4 timeline/saved plan |
| M3 Map | Real Leaflet/OpenStreetMap Tadla map, verified points, popups and filters; attribution and coordinates verified | DEV1 layout; DEV2 controls; DEV3 map engine; DEV4 marker information |
| M4 Community | Lightweight experience/harvest/partner posts, post forms, external contact actions and copy/share; no messenger or auto Facebook profile posting | DEV1 feed; DEV2 creation; DEV3 listings; DEV4 sharing |
| M5 Validation | Bilingual+RTL+audio coverage, mobile use, regression tests, full production build, documentation handoff and clearly marked pending API work | Four cross-checking QA workstreams |

## Coordinator output for every new milestone

Produce `M{n}-DEV1-{slug}.md` through `M{n}-DEV4-{slug}.md`, with **complete code per owned file**, exact branch commands, expected test commands and results, file ownership, shared conventions and a PR acceptance checklist. Use the latest passing `main` state; do not assume names/files from old planning notes.

## Recording dependency

Source design ZIP has no MP3. Darija and English recordings must be scripted and approved by a speaker before buttons are advertised as audio-ready. M0 audio component handles unavailable recordings; M1 chooses recording or unavailable-state behavior. Do not generate synthetic voice files without review.

## Model dependency

`docs/04-api-contract-placeholder.md` remains a placeholder until the data science contributor supplies verified input and output fields. Never turn demo content into real agronomic advice.
