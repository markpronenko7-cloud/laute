# Accordion and second edit — 31 October 2026

The process accordion now uses photographic preview cards, circular chevrons and a dark open media composition. The main portrait player has a visible play action, with description and a separate real photographic detail alongside it. On mobile the player precedes the description. Closing or switching an item removes the old player. Playback starts only after an explicit action; errors retain native controls and show a localized message. Existing photos remain real source frames, not generated replacements.

Every process film was re-edited. The source timecodes and per-shot crop magnification are recorded in `scripts/build_factory_stages.py`. Casting now establishes the furnace before the ladle and casting station, ending on a raw blank; this is a department overview, not a claim that all shots show the same alloy or batch. Trimming holds the press action before collected castings. Machining establishes the spindle, moves into a tighter tool view and ends on the parts. Robotic polishing moves from the working cell to the contact area and back to the wider robot. Sink finishing establishes the bench, then hand/tool and edge detail. Sealant application follows continuous source time, with closer framing during the gesture. Packing ends after the box is closed.

Stabilization uses two-pass vidstab analysis and bounded translation correction: 8-frame smoothing, at most 14 output pixels, no rotation, a fixed 5 percent safety crop. There is no dynamic zoom pumping, generated scene or synthesized intermediate motion. Each edit has brief head/tail fades; direct cuts preserve the working action. Existing restrained SDR color handling is retained. Actual encoded durations determine end fades; published labels are updated to the new lengths. Shipped CMS media receives a new cache key without replacing employee text, visibility, custom media or block order.

## Current verification

An isolated headless Chromium test browser with a fresh temporary profile successfully rendered the actual local page. It did not attach to or operate the user's open Chrome window, whose URL could not be established in the earlier run.

All seven disclosures were exercised on 1440 and 390 pixel viewports: open/close, Enter and Space, explicit playback, native pause/resume, native fullscreen entry/exit, reopening with reset playback state, and absence of horizontal page overflow. Actual page errors were collected. Each film played to its natural end at playbackRate 1, then replayed from the native control. Screenshots sampled the real playback sequence roughly once per second and were visually examined across every film; this is not a claim of continuous human viewing of every frame at full motion. Translation/crop artifacts, framing and the sequence of shots were checked in those captures. All media is intentionally silent; decoded audio bytes are zero and the player states that there is no audio. No listening-based mix assessment is claimed.

Russian, English and Kazakh stage titles fit at 320, 390 and 1440 pixel widths without horizontal clipping or page overflow. Physical phones and Safari were not used. Desktop and mobile page screenshots were visually inspected. Automated rendered behavior and sampled visual inspection are recorded separately from subjective approval of the montage.

The following section records the first documentary revision and its source inventory. Its browser limitation describes that earlier run, not the isolated Chromium checks above.

---

# Process documentary package — 31 October 2026

The production accordion now has seven distinct real-footage edits, seven extracted photographic details and seven portrait posters. It no longer presents synthetic images or a shared film as evidence of different processes. Existing legacy files remain available to other CMS blocks.

Source: the user-supplied `Видео с заводов-1-001.zip` (25 videos, 2 photographs). All video files were inventoried and their visual contact sheets examined across their duration at three-second intervals. Both photographs were inspected; neither provides the seven process details, so the stills come from the corresponding videos. This is sampled visual review, **not a claim of continuous full-speed viewing**.

## Evidence and edit decisions

| Published process | Sources | What is visible |
| --- | --- | --- |
| Casting blanks | IMG_5791.MOV | Furnace, ladle and casting workstations |
| Trimming castings | IMG_5792.MOV, IMG_5793.MOV | Operator at a trimming press and collected castings |
| Machining | IMG_5795.MOV | Cutting spindle, metal chips and machined parts |
| Robotic polishing | IMG_3566.MOV, IMG_3567.MOV, IMG_3568.MOV | Robot and polishing wheel, with several viewpoints |
| Hand finishing sinks | IMG_8237.MOV | Handheld surface/edge finishing at multiple benches |
| Applying sealant | IMG_8238.MOV | Gun applying material along a sink joint |
| Kitting and packing | IMG_3570.MOV | Product placed in an insert and box closed |

Other archive material was examined and excluded from the published edits: IMG_3555.MOV and sd1780478908_2.mp4 show showroom demonstrations, not pressure tests; IMG_3556.MP4, IMG_3557.MOV, IMG_3558.MOV and IMG_3559.MOV show factory aisles/machining departments; IMG_3560.MOV, IMG_3561.MOV and IMG_3562.MOV show handheld blank examples; IMG_3563.MOV shows work-in-progress storage; IMG_3564.MOV and IMG_3565.MOV show the furnace department from the tour route; IMG_3569.MOV shows packing and stacks of boxes; IMG_5790.MOV shows metal stock; IMG_8239.MOV shows manual sink surface work without enough evidence to name a separate operation. IMG_3556.HEIC shows a factory aisle; camphoto_824023566.jpg is an incidental photograph.

No dedicated footage establishes OTK inspection, nickel/chrome deposition or post-assembly pressure tests. These entries were removed from this media sequence. This does not assert those operations are absent from the factory. A showroom faucet running water must not be described as a calibrated pressure test. Product markings in the packing footage are retained; supplied footage does not independently establish the brand of each item or ownership of every facility.

Authoring: `scripts/build_factory_stages.py` contains source timecodes, photographic frames and crop anchors. Outputs are H.264 MP4, 720 × 960, 30 fps, fast-start, without audio. Source HLG is converted to SDR; there is restrained contrast/saturation adjustment. The 3:4 edit retains substantially more of the portrait originals than a landscape crop. There is no generated footage, motion interpolation, stock machinery sound or narration. Metadata including source GPS is removed from outputs. The sealant operation remains one continuous shot; other edits use direct cuts between the operation and its details.

First edits were inspected through half-second visual sequences, then shortened to remove unnecessary walking shots and abrupt camera movements. This review covers framing and sequence, with the limitation that real-time playback has not been visually observed. Final sequences and all photographs were reviewed again after revision. Source handheld shake, uneven factory lighting and optical resolution remain limitations.

## Verification boundary

The browser control tool stopped because it could not determine the Chrome URL reliably enough to enforce its policy. No alternate UI automation was used to bypass that stop. Desktop/mobile rendered appearance, live accordion interaction, console output and full-speed playback still require browser verification. Successful builds, tests, file decoding and HTTP checks do not establish those results.

The runtime upgrades only the shipped six-illustration production presentation. Employee media, custom sections, block order and visibility remain authoritative. Each inactive panel unmounts its player; opening an item cannot leave the previous player running. `preload="none"` avoids fetching every video on page load.

---

# Historical production illustrations — 29 October 2026

The About LAUTE page now uses six new conceptual AI illustrations as selectable process slides. Each generated slide is visibly labeled as an AI illustration. These assets illustrate processes; they are not documentary evidence of LAUTE equipment, product geometry or factory installations. The existing 20-second supplied-footage film is available separately through “Посмотреть съёмку с производства”. It is not a new film or generated video.

Warranty and care are visible without expanding a disclosure. On mobile, the selected process image appears directly below its process description; on desktop, the preview sits alongside the stage list.

All six images were generated using the built-in imagegen tool, visually inspected, and encoded as 1536 × 1024 WebP assets without cropping. The first casting candidate was rejected for implausible open-mold geometry and replaced by the closed-mold illustration below.

## Current assets and prompt set

Common visual direction: Use case: photorealistic-natural. Generate one high-quality landscape 3:2 editorial photograph-style educational illustration for a premium plumbing company's production page. This is a conceptual illustration of a manufacturing step, not a photograph documenting any specific company or factory. Tightly framed operation, plausible engineering, soft neutral light, restrained brass and gray palette, realistic wear and texture. No text, logos, certificates, collage or science-fiction machinery.

- `public/images/factory/laute-process-casting-v2.webp`: A restrained molten-brass stream pours into the pouring cup of a closed two-part sand mold; the casting cavity is invisible. A rough unmachined brass blank rests nearby. No pouring onto an existing finished part and no machined threads on the blank.
- `public/images/factory/laute-process-machining-v2.webp`: Close editorial view inside a CNC machine: one brass faucet body clamped firmly in a realistic steel fixture, a single milling cutter cutting a bore, a modest amount of brass swarf and coolant. Mechanically plausible axes and fixture.
- `public/images/factory/laute-process-polishing-v2.webp`: Close editorial view of a real industrial robotic gripper holding a brass faucet body securely against a fabric buffing wheel. Only one small section of the yellow robot wrist is visible. Realistic clearance, contact and modest polishing dust, no sparks.
- `public/images/factory/laute-process-inspection-v2.webp`: Close editorial view of a technician’s two anatomically correct hands in clean fine gray industrial gloves measuring the bore of a brass faucet body with a stainless vernier caliper. Physically correct caliper jaws contact the part; no legible numerals.
- `public/images/factory/laute-process-plating-v2.webp`: Close editorial view of a row of identical small brass faucet bodies hanging individually from copper plating rack hooks above a realistic enclosed electroplating bath. One coherent orderly production detail. Muted silver metal and warm brass, no rainbow liquid, no dramatic fumes.
- `public/images/factory/laute-process-testing-v2.webp`: Close editorial view of one assembled chrome faucet firmly connected to a clean practical water-test bench with braided hoses and sealed brass connectors. A small controlled clear stream flows from the faucet into a drain. A pressure gauge exists softly out of focus with no legible digits. No electronics fantasy.

---

The following section records the earlier media package and remains for provenance. Its four conceptual material studies are legacy assets, not the six current process slides.


# Factory media direction — 27 October 2026

The page combines **conceptual AI still illustrations** with a separate **20-second documentary insert**. The generated stills do not document a particular real factory, machine installation, product SKU or production capacity. The page labels the cover and illustrations accordingly. No AI-generated video is claimed. The available session tools generate still images only; no still-image animation is substituted for video generation.

## Assets

Created with the built-in `imagegen` tool and encoded to WebP without altering the image composition. Original generated PNGs are retained outside the repository. Project assets:

- `public/images/factory/surface-study.webp`: chrome material detail; film cover.
- `public/images/factory/craft-study.webp`: conceptual hands/caliper image.
- `public/images/factory/metal-study.webp`: brass form study.
- `public/images/factory/machining-study.webp`: conceptual machining scene.

The images depict no independently verified LAUTE production facts. They must retain their conceptual labels if reused.

## Documentary insert

`public/media/laute-factory-documentary.mp4` (1280 × 720) and `public/media/laute-factory-mobile.mp4` (720 × 900) contain original supplied footage. Seven single-frame shots follow material, processing and surface finishing. No split screen, generated scene or moving still is present. Both versions last 20 seconds. The authoring source and edit decisions are in `scripts/build_factory_documentary.py`.

Small translation compensation is estimated from luminance phase correlation and limited to 26 source pixels. Deliberate camera movement remains. Source HDR clips are mapped to SDR; saturation is restrained. The original material consists of handheld portrait factory-tour clips, with limitations in optical detail, lighting and framing that editing cannot replace with a new production shoot.

The previous conversational voice track is removed. A speech-free interval of recorded machinery is filtered, crossfaded and mixed quietly. Audio evaluation in this session uses transcription and signal analysis; direct auditory review is unavailable. This is a real limitation, not an assertion of listening approval.

## Final image prompts

### Metal study

Use case: ads-marketing. Create one exquisite photographic campaign image for the manufacturing story of LAUTE, a premium bathroom fittings brand. This is an openly labeled conceptual brand illustration, not a documentary factory photograph. Landscape 16:9 composition. Subject: extreme close-up of a single unfinished brass mixer body, elegantly curved spout and machined cylindrical bore, resting on a clean pale limestone work surface. Show believable machining toolpaths, warm muted brass, fine satin grain, one precise sharply resolved circular edge. Photography: medium format macro product photograph, large soft north-facing window light, carefully flagged reflections, refined highlights without blown whites. Background very light warm grey, quiet and tactile, restrained neutral color. Strong sculptural composition, object fills about two thirds of the frame, modest negative space. Luxury industrial still life with actual physical plausibility. No text, logos, watermark, montage, collage, borders, hands, robots, sparks, blue glow, futuristic effects or fictional factory environment. Avoid glossy CGI look; subtle real-world texture and exquisite optical detail. One single coherent image.

### Surface study

Use case: ads-marketing. Single landscape 16:9 premium photographic brand illustration for LAUTE bathroom fittings, part of a restrained manufacturing/material editorial series. Extreme macro close-up of one elegant polished chrome cylindrical mixer spout and the soft curve where two machined surfaces meet. No complete fantasy product design, just a believable material detail. Silver chrome, controlled long softbox reflection, tiny authentic brushed microtexture beside mirror surface, very pale cool gray studio background. The image feels like high-end medium-format product photography with a macro tilt-shift lens, optically sharp metal edge, soft falloff, no overprocessed contrast. Calm white, silver, graphite reflections and a very small muted brass undertone. Sculptural sophisticated composition with generous quiet areas. This is a conceptual material study, not an actual factory photo. No people, hands, lettering, logo, watermark, collage, artificial blue lights, sparks, water splash, excessive gloss or impossible geometry. One coherent image.

### Craft study

Use case: ads-marketing. Create one landscape 16:9 photorealistic editorial campaign illustration for the manufacturing story of LAUTE bathroom fittings. Same calm pale-gray, white and muted brass palette as premium metal product photography. Subject: close view of a physically plausible brass faucet blank being precisely measured with a clean stainless steel vernier caliper by a technician's two naturally posed hands wearing light gray fine knit industrial gloves. Crop out the technician's face and body. One gloved hand holds the brass piece stably on a simple clean pale workbench; the other holds the caliper with jaws correctly contacting an external diameter, readable shape but no legible numerical claims. Soft directional daylight, realistic glove fibers and subtle brass tool marks, gentle shallow depth of field, understated high-end editorial photography. Refined composition focused on one genuine-looking small hand operation, absolutely natural proportions. Conceptual craft illustration, not a documentary claim about any real factory. No text, labels, logos, watermark, certificates, fake futuristic equipment, neon, sparks, overdramatic lighting or collage.

### Machining study

Use case: ads-marketing. One single landscape 16:9 photorealistic editorial image for a premium bathroom hardware material story, clearly conceptual illustration rather than a specific real factory. Macro view through an immaculate CNC machine window: a solid brass cylindrical component rigidly secured in a realistic steel fixture, a single vertical milling tool carefully machining its upper face, tiny restrained curled brass chips visible on the fixture. Cropped tight enough that no factory, brand or machine model can be identified. Physically plausible tool axis, uncluttered believable engineering, no sparks and no impossible mechanisms. Pale cool-gray machining enclosure, steel silver and muted champagne brass. Soft large-source daylight-like illumination, elegant controlled reflections, medium-format macro photographic quality, restrained neutral contrast, visible fine tool marks. Crisp subject with a gently soft background. Luxury industrial photography rather than science fiction. No words, labels, logos, watermark, collage, cyan lighting, dramatic smoke, people or fake certification details. Match the quiet white and gray visual language of sculptural brass and chrome material studies.
