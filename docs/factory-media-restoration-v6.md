# Restored montage and packaging replacement — 2026-11-04

The user selected the montage published in `60abcd6`, before `1749de5`.
`d1450d1` restores all seven original video streams without re-encoding and
replaces their audio. The original video packet SHA-256 was checked for all
seven films before the separate packaging composite. All retain 392 frames,
30 fps and the original 13.0667-second timeline.

Soundtrack: **Dream Culture — Kevin MacLeod**, CC BY 4.0. One identical
encoded excerpt, starting at 32s, is shared by all seven films. The mix uses
a 7kHz low-pass, a -25 LUFS target, -4 dBTP ceiling and soft fades. Full
attribution, source hash and license link are in `public/media/music-credits.txt`.
`scripts/restore_company_films.mjs` reproduces this restoration and mix.

The subsequent packaging revision changes the printed Kraus marks to the
existing LAUTE logo on the box surfaces. It uses perspective tracks for the
visible faces, a generated clean surface, local light/texture blending and
foreground masks for the hands and the lifted carton. It retains the restored
shot sequence and the same audio. The poster is extracted from the resulting
film. The packaging film/poster use `brand=7`; the other six use `edit=6`.

Authoring intermediates and per-frame tracks remain in `.temp/restore-v6/`.
This folder also contains the original Git-extracted films, clean plate,
392-frame lossless composite and contact sheets for all 327 footage frames.
OpenCV was used only for authoring; no application dependency was added.

Validation: every footage frame was included in contact-sheet review, with
full-size inspection and corrections of the moving/occluded marks; full FFmpeg
decoding; 392-frame count; identical encoded audio hashes across all seven
films; isolated CMS/media tests and production build. Visual review cannot
prove a flawless composite under every viewing condition. Physical-device
testing was not performed.

Map and disclosure fixes from `1749de5` are retained. CMS employee text,
custom media and localization migration are retained. `src/ai/` is unchanged.
