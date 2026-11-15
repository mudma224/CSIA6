# flaht bladi — Decision log

Brief dated records of non-obvious tradeoffs (documentation-strategy §1). Newest first.

---

## 2026-11-15 — Verified places v1.1: single source of truth merged into the M3 map; /data-preview removed

**Decision:** (1) `src/data/verified-places.v1.json` (renamed from `.geojson` for direct `resolveJsonModule` import; GeoJSON semantics unchanged) becomes the single source of truth for verified map points; `src/data/m3/verifiedPoints.ts` is now a runtime-validating adapter over it. (2) The internal `/data-preview` route, its components and i18n keys were removed; the data files remain committed and the data-contract test still validates them. (3) The M3 map now shows 5 points: 2 `water` (dams with the team's OSM way provenance — way 504108035 / 385347001, Bin El Ouidane coordinates upgraded to the OSM-mapped values) and 3 `reference` (cities); `market` / `supplier` stay honest empty categories.

**Rationale:** requested by the team on 2026-11-15 — the two independently produced verified-point layers (data-science deliverable and M3 implementation) described the same two dams; keeping both meant duplicated provenance and drift risk. Merging takes the better provenance for each point (OSM way precision + URLs for dams; official HCP source for Béni Mellal) and adds the 3 cities to the real map with a new `reference` category. Provenance URLs are nullable and rendered only when actually verified — no fabricated links. The preview page had served its validation purpose (data validated by the team on 2026-11-15) and the M2/M3 screens are the right surface for data display.

**Consequence:** crop vocabulary (`crops.v1.json`) is consumed by the M2 parcel form when the team wires it; the data-contract tests (`tests/crop-data-contract.test.ts`) continue to enforce schema, counts and provenance on both files. M3 messages gained `references` / `categoryReference` keys (en+ary); home copy now says "five source-checked places".

---

## 2026-11-15 — Internal data-verification page at /data-preview (superseded 2026-11-15)

**Decision:** the committed data files are rendered inside the app at a standalone route (/data-preview) so the team validates deliverables in the running frontend, and a Leaflet dependency was added for the map view.

**Rationale:** requested by the team on 2026-11-15 — validating data deliverables inside the real app is stronger than validating them in a standalone static page. The route is internal: not linked from farmer navigation, clearly badged, and it renders data only (no recommendation logic).

**Consequence:** when milestones M2 (parcel form) and M3 (map) are implemented, this page is either removed or reduced to a data-file index; the Leaflet map work is a preview, not the M3 deliverable. Leaflet 1.9.4 + @types/leaflet added to package.json (exact-pinned).

---

## 2026-11-15 — Crop names in Modern Standard Arabic (فصحى), not Darija

**Decision:** The crop vocabulary (`src/data/crops.v1.json`) carries English + Modern Standard Arabic names (e.g., القمح, البرسيم الحجازي, بنجر السكر). Darija is NOT used for crop-name data fields.

**Rationale:** (1) Team instruction of 2026-11-15: pure original Arabic, verified by web research. (2) MSA agricultural terms are the standard in Moroccan extension and administrative literature (e.g., بنجر السكر for sugar beet, الفول البلدي for faba bean), so MSA names are authoritative and unambiguous. (3) UI microcopy remains Darija per cahier des charges §5.2 — crop names are data fields, not microcopy, so the two conventions do not conflict.

**Consequence:** crop-name Arabic strings require a linguistic review pass by the team before production release, like any Darija copy.

## 2026-11-15 — No zone polygons or zone center points in the verified map layer

**Decision:** `src/data/verified-places.v1.geojson` contains only verified points (2 dams, 3 cities). Beni Moussa / Beni Amir zone polygons AND approximate zone-center points are excluded.

**Rationale:** No official ORMVAT GIS boundary has been obtained (request pending via Local Lead) — cahier des charges FR-E02/E08 forbid arbitrary polygons, and the documentation strategy forbids placeholders that look real. A "team-derived approximate center" point would look real on a map.

**Consequence:** until official boundaries arrive, the map shows the verified points and the honest empty categories; the parcel form expresses the zone as a dropdown choice (FR-C), not a drawn area.

## 2026-11-15 — Ahmed El Hansali coordinates accepted from secondary sources

**Decision:** the dam's coordinates (32.6932 N, -5.88843 W, Mapcarta) are included, flagged `secondary`.

**Rationale:** initially suspected inconsistent with the Tadla plain, but corroborated by two independent descriptions (Global Energy Monitor: "Ait Oum El Bekht, cercle de El Ksiba"; press: dam near Zaouiat Cheikh on the Khénifra road, ~50 km from Kasba Tadla). The dam sits on the upper Oum Er-Rbia near Zaouiat Cheikh, far upstream of the plain — the geography is consistent.

**Consequence:** feature keeps `precision_caveat: "confirm with ABHOER"`; one earlier web snippet claiming "5–8 km upstream of Kasba Tadla" and "185.2 million m³" (HCP figure) was rejected as inconsistent with ORMVAT's institutional description (740 Mm³ class, commissioning 2001). Dam capacities omitted from the map layer until confirmed.
