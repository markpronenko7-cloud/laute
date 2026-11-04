# Production films, edit 5 — 2026-11-04

Rebuilt from the supplied factory archive, not from the previous encoded ads.
The reproducible shot list, source timecodes and crop anchors are in
`scripts/build_company_ads.mjs`. No generated footage, speed changes, repeated
loops, optical interpolation or synthetic narration. Opening identification
lasts 2.8 seconds; there is no stock advertising end card.

| Process | Actual duration | Editorial structure |
| --- | ---: | --- |
| Casting | 19s | Working area → equipment → fixtures → blanks; four shots |
| Mould work | 15.5s | Bench → uninterrupted eight-second manual operation → collected castings |
| Machine shop | 18.5s | Workshop → fixture → six-second close view of a part → batch |
| Robotic polishing | 23s | Cell → nine-second robot movement → second angle → cell |
| Sink finishing | 23.5s | Ten-second tool pass → ten-second edge operation → surface |
| Sealing | 10.5s | One continuous real-time gesture; only one source angle exists |
| Packing | 28s | Insert → placement → accessories → box preparation → closing |

Music: **Airport Lounge — Kevin MacLeod**, CC BY 4.0. Bass, drum kit,
electric piano and vibraphone. Individual excerpts, a -25 LUFS target and
soft fades replace Newer Wave. Attribution, source link, hash and exact
excerpt timings: `public/media/music-credits.txt`. The artist's track entry
and `pieces.json` were checked on 2026-11-04. Source conversations are omitted.

The process UI expands each card independently, avoiding the scroll jump
caused by collapsing an earlier large card. CSS grid animates both opening
and closing; collapsed regions are inert and hidden from accessibility APIs.
Arrow keys, Home and End move between headings. Reduced motion removes the
disclosure transitions. Existing CMS text, blocks and custom media survive;
only shipped film URLs receive the edit-5 cache key and updated durations.

The map uses Leaflet's EPSG:3857 projection for both tiles and markers,
one bounded world (-180…180 longitude), non-wrapping tiles and explicit paint
containment. The map requires no new key or paid service. OpenStreetMap
attribution and the address-search fallback remain available.

Validation: full FFmpeg decoding of all seven files; audio measurements
between -25.47 and -24.82 LUFS; sampled contact sheets; actual desktop and
390px mobile Chrome playback, keyboard/focus, disclosure, zoom, drag, reset,
touch-pinch and marker-versus-tile projection checks (under 2 CSS px).
Automated checks do not constitute physical-phone testing or a continuous
frame-by-frame artistic review. Tile availability depends on OpenStreetMap.

Run browser verification with the existing Playwright installation:
`node scripts/verify_company_browser.cjs [base-url]`.
Set `PLAYWRIGHT_MODULE_PATH` if Playwright is installed outside this project.
