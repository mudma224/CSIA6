# src/data — vetted static data files

This folder holds the **source-cited static data** consumed by frontend screens (system-design §4: "source-cited static POIs, vetted crop labels"). These files are data deliverables from the data-science contributor; they are **not** invented demo content. Do not edit values without team review — see `docs/decisions.md` for the underlying decisions.

| File | Consumed by | Status |
|---|---|---|
| `crops.v1.json` | Parcel form crop list (FR-C, "validated study crop list") | Supplied v1 — pending team linguistic review of Arabic names |
| `verified-places.v1.geojson` | M3 map layer (FR-E01..E05) | Supplied v1 — 5 verified points; honest empty categories for markets/suppliers |

## crops.v1.json

- **Label source:** Ouassanouan et al. 2025 ground-truth dataset v2 (CC BY 4.0), DOI `10.6084/m9.figshare.28486022.v2` — Tadla-labelled records, n=1,558, observed 2024-02-19..24. Counts were verified against `quality_summary.json` of the retrieved package.
- **Arabic names:** Modern Standard Arabic (فصحى), checked against agricultural extension literature on 2026-11-15. Rationale for MSA instead of Darija: see `docs/decisions.md`. UI microcopy stays Darija per cahier des charges §5.2 — crop names are data fields, not microcopy.
- **Form list (P0):** entries with `form_p0: true` (13 crops). Rare observed crops (count = 1) stay in the vocabulary with `rare: true` but are excluded from the P0 form. Rotation candidates (barley, berseem clover) are `observed: false`.
- **Required form behavior:** 324 of 1,558 Tadla records declare no species — the form must offer an explicit **unspecified / not declared** state (FR-C03) instead of forcing a fabricated choice.

## verified-places.v1.geojson

- **Contents:** 5 verified points — 2 dams (Bin El Ouidane, Ahmed El Hansali) and 3 cities (Béni Mellal, Kasba Tadla, Fquih Ben Salah / ORMVAT seat).
- **Every feature carries:** source list with URLs, verification date (`2026-11-15`), and a precision caveat. Dam capacities are intentionally omitted: reported values differ across sources (see `metadata.known_gaps`).
- **Deliberately excluded:** irrigation-sector polygons (no official ORMVAT GIS file yet — request pending via Local Lead), zone label points (team-derived approximations — not sourced geometry), markets and suppliers (no verified coordinates).
- **Frontend contract for M3:** filter categories by `properties.category`; render `name_ar` with RTL support and `name_en`; display `precision_caveat` in popups where space allows; show an honest empty state for categories with no features.

## Verification and review trail

- 2026-11-15: v1 created by the data-science contributor from the sources listed above and the regional research reference document. Arabic names pending team linguistic review (recorded in `docs/decisions.md`).
