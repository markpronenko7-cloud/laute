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
