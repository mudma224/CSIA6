# flaht bladi — Decision log

Brief dated records of non-obvious tradeoffs (documentation-strategy §1). Newest first.

---

## 2026-11-15 — Internal data-verification page at /data-preview

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
