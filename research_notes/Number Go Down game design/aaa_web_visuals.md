# AAA-Quality Visuals for a 3D Web Game on Phones: Art Direction, Stylized Rendering, Lighting, VFX and Polish

Scope: what the most visually impressive browser 3D games and sites do, and how a small team gets a Three.js portrait phone game ("Number Go Down": Emonad, a cartoon emo-kid ragdoll, flung down a crypto-crash "descending hell") to that level at 60fps on mid-range phones. Research date: 14 Oct 2026.

Method note for the report writer: several key primary sources (80.lv, Awwwards case studies, Communication Arts, utsubo.com, cinevva.com) could not be opened directly from this research environment (egress-blocked), so the facts below from those pages come from search-result summaries of those pages, not full reads. GitHub (three.js releases, examples index and example source, pmndrs/postprocessing, three.quarks, Bruno Simon's folio-2025, Hunyuan3D license) was read directly. The shared web-search budget ran out partway, so some sub-questions (Kour.io/Krunker internals, Coastal World, Lusion/Active Theory technique write-ups, Sea of Thieves/Arcane talks, Supercell UI) are recorded as gaps rather than answered.

## 1. Best-in-class web 3D (2023-2026): what the top browser games and experiences do technically and artistically

### Takeaway
The browser pieces that read as "console quality" do it through tight art direction (one strong stylized look, limited palette, baked or faked lighting, custom shaders) rather than raw realism. They are built by tiny teams with custom in-browser tools, Blender/Houdini content, aggressive texture compression and instancing. Three.js is now at r186 (Sep 2026) with a maturing WebGPU/TSL path, and WebGPU ships by default on iOS 26. A WebGL2 fallback is still mandatory for older iPhones.

### Cited Findings
**Messenger (Abeto, 2025): the reference for "a cel-shaded browser game that feels like a console game"**
- Free browser game released 25 Sep 2025, developed by Vicente Lucendo and Michael Sungaila, music by Kevin Colombin, published by Abeto — [Wikipedia](https://en.wikipedia.org/wiki/Messenger_(video_game))
- Built on WebGL and Three.js. You deliver mail on a tiny planet, and 80.lv warns that walking on a sphere "might be a bit disorienting" — [80.lv](https://80.lv/articles/deliver-mail-on-tiny-colorful-planet-in-this-relaxing-web-game)
- Lucendo (interview): the goal was a feeling "somewhere between strangeness and calm". Building multiplayer tech was a practical goal. Worlds are capped at ten players because more "made us lose the sense of calm". Hundreds of players are connected at all times. Modeling was done in Blender and Houdini, three.js was the front end, and "almost everything else was custom made" — [Communication Arts webpick](https://www.commarts.com/webpicks/messenger) (via search summary)
- Secondary reporting says the stack is Three.js (WebGL) for 3D, three-mesh-bvh for optimization (collision/raycast acceleration), Houdini/Blender/Substance for visuals, and Node.js + WebSockets for multiplayer. The style is anime-inspired and cel-shaded — [VidaExtra (Spanish)](https://vidaextra.com/aventura-plataformas/imposible-resistirse-a-este-juego-cozy-repartidor-ambientado-japon-que-esta-gratis-navegador) (secondary; treat as unconfirmed)
- An unofficial open-source clone reproduces the look with `MeshToonMaterial` + `OutlineEffect` in Three.js. This is a fan reimplementation, not Abeto's code — [GitHub: Glowin/messager](https://github.com/Glowin/messager)
- HN discussion thread: "A WebGL game where you deliver messages on a tiny planet" — [Hacker News](https://news.ycombinator.com/item?id=45396441) (could not be read; listed for the writer)

**Bruno Simon's portfolio (2019 to the 2025 rebuild): the reference for "a whole playable world, MIT-licensed, with source"**
- He rebuilt his 2019 car-driving portfolio "for the WebGPU era". Three.js gained TSL (shaders written in JavaScript), he planned multiplayer, the world is built in Blender, and progress was documented in a YouTube devlog series — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html) (via search summary)
- Described as a Three.js project using both WebGL and WebGPU, with game-like features (achievements, hidden elements). Code and Blender files are on GitHub under MIT and the music is CC0 — [GeekNews](https://news.hada.io/topic?id=24963)
- The repo README (read directly) shows:
  - **Architecture:** a staged, ordered game loop (stages 0-999) with modules for DayCycles, Lighting, Wind, Grass, Foliage, Leaves, WaterSurface, Weather, Fog, Snow, RainLines, Lightnings, Tornado, Trails and an InstancedGroup stage, plus Physics, PhysicalVehicle, audio and UI stages.
  - **Textures:** Blender exports are left uncompressed, then a compress script encodes GLB-embedded textures and PNG/JPG with ETC1S (`--quality 255`) via KTX tooling, and turns UI images into WebP.
  - **Materials:** a palette texture is set directly on materials.
  - **License:** MIT.
  - Source: [GitHub: brunosimon/folio-2025](https://github.com/brunosimon/folio-2025)
- A mirror shows the repo created 2025-12-10 with homepage bruno-simon.com — [Gitee mirror](https://gitee.com/hoppin/folio-2025)

**Igloo Inc (2024): the reference for "Site of the Year-level WebGL that still runs on weak phones"**
- Awwwards case study (Sept 2024): the landing page for Igloo Inc. (parent of Pudgy Penguins), made via Bureaux. The team built concept mockups, then worked on code and 3D art in parallel "directly in the browser", using custom tools to adjust shaders, textures and models in real time — [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html) (via search summary)
- Listed with a Developer Award and Site of the Year 2024 (developer category) — [Awwwards WebGL collection](https://www.awwwards.com/du-haihang/collections/webgl-animations/)
- A Reddit r/threejs commenter noted it stays performant "on potato devices" — [Reddit via redlib](https://redlib.hbubli.cc/r/threejs/comments/1f3aaw2/how_would_you_recreate_this)

**Active Theory / Lusion (agency-grade WebGL)**
- Active Theory v4 (Awwwards SOTM Jan 2018): the homepage was "an endless journey through 5 repeating alley geometries" — [Awwwards](https://awwwards.com/active-theory-v4-wins-january-2018-site-of-the-month.html)
- Active Theory v5 is built in WebGL on their internal JS framework, with real-time changing environments the user toggles — [Communication Arts](https://www.commarts.com/webpicks/active-theory-1)
- Active Theory's 20 Years of Xbox Museum (six 3D environments) won a Webby — [Webby Awards](https://webbyawards.com/crafted-with-code/20-years-of-xbox-museum)
- Lusion is a small studio focused on real-time animation. Its site redesign (HTML5/CSS3/WebGL, 3D homepage visuals) was a 2024 Cannes Lions entry — [Cannes Lions / Love the Work](https://lovethework.com/work-awards/campaigns/lusion-1630885); [Awwwards 2019 case study](https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html)

**Slow Roads (Anslo)**
- An endless procedural driving game in Three.js/WebGL. Anslo calls it an exploration of procedural scenery and "an experiment testing the boundaries of 3D application development within JavaScript". It runs on modest hardware. Players choose scene, road complexity, weather, time of day, planet and vehicle — [Stuff](https://stuff.co.za/2022/10/25/stressed-go-play-slow-roads-this-free-browser-based-endless-driving-simulator/); [Jalopnik](https://jalopnik.com/slow-roads-best-browser-driving-game-1850304751); [FlowingData](https://flowingdata.com/2022/11/04/procedurally-generated-driving-game/)
- It is funded only by donations, so the developer can't work on it full-time — [Prima Games](https://primagames.com/news/slow-roads-chill-driving-game-browser)

**PlayCanvas SWOOOP (older but still cited)**
- A low-poly biplane game with ambient occlusion "for realistic shadowing" and particle effects, built by a small team in 4 weeks — [PlayCanvas blog](https://blog.playcanvas.com/swooop); [Chrome Experiments](https://experiments.withgoogle.com/swooop)
- Phone results vary by device: one user reports it runs "astonishingly perfect" on mobile, another saw about 11 fps on one Android phone — [PlayCanvas forum](https://forum.playcanvas.com/t/problem-in-optimization-we-must-be-doing-something-wrong/1165)

**Other recent Three.js showcase pieces**
- CapCôtier (R3F) gets its stylized look from a custom water shader with wave displacement, foam and a Wind-Waker-style wake — [three.js forum](https://discourse.threejs.org/t/capcotier-a-3d-game-to-learn-the-coastal-boat-license-r3f-synthesized-audio/93050)
- outlol runs a fixed 60 Hz physics sim in one player's browser and syncs the others over WebRTC — [three.js forum](https://discourse.threejs.org/t/outlol-multiplayer-browser-football-and-foosball-3d-view-in-three-js/94799)

**Platform state, Oct 2026**
- Three.js release dates and highlights:

  | Release | Date | Highlights |
  |---|---|---|
  | r183 | 20 Feb 2026 | `scene.environment` IBL for Lambert/Phong; BatchedMesh per-instance opacity |
  | r184 | 16 Apr 2026 | Non-blocking `compileAsync()`; a reported 3.0x TSL compile-time improvement |
  | r185 | 1 Jul 2026 | WebXR on WebGPU; UBO update optimizations |
  | r186 | 24 Sep 2026 | `compileComputeAsync()`; TSL made side-effect-free for tree-shaking; cascaded shadow maps via `SunLight` |

  Sources: [three.js releases](https://github.com/mrdoob/three.js/releases); dev `package.json` is 0.186.0 — [three.js package.json](https://github.com/mrdoob/three.js/blob/dev/package.json)
- WebGPU is on by default in Safari on iOS/iPadOS 26. Earlier iOS needs a feature flag — [App Developer Magazine](https://appdevelopermagazine.com/WebGPU-in-iOS-26/); [Digital Strategy Force](https://digitalstrategyforce.com/journal/now-that-webgpu-works-on-iphone-should-your-website-use-3d/)
- Three.js falls back to WebGL2 when WebGPU is missing. Claims of "30-50%" WebGPU gains come without methodology — same sources (marketing-grade; unverified)
- A 2026 engine guide says WebGPU went Baseline across major browsers in Nov 2025 and calls Three.js "the foundation most web 3D is built on" — [LogRocket](https://blog.logrocket.com/best-javascript-html5-game-engines-2025/); see also [VR.org](https://vr.org/articles/webgpu-baseline-2026-three-js-webxr-default) (secondary)
- Poki claims 90M+ players and 1B+ monthly gameplays (self-reported, sponsored line) — [Web Game Dev Newsletter](https://buttondown.com/webgamedev/archive/issue-030/)

### Inferences
- The common thread is not polycount. It is (a) one coherent stylized look, (b) custom shaders, and (c) fast iteration in the browser itself. Igloo's in-browser shader/texture tuning and Bruno's staged loop plus compress script are processes a 1-3 person team can copy. Recommend a dev-only tweak panel (lil-gui or the new three.js `Inspector` addon used throughout r18x examples) for every zone's fog, LUT, bloom and toon ramp from day one.
- Bruno Simon's repo (MIT, with Blender files) is the best legal "read the source" reference for a full Three.js game loop, KTX2/ETC1S pipeline, weather/trail/foliage modules and instancing. Messenger is the best visual target for "cel-shaded, calm, console-feeling". For Number Go Down the energy should be closer to Hi-Fi Rush (loud, comic) than to Messenger (calm), but the craft lessons transfer.
- Active Theory's "endless journey through 5 repeating geometries" is a direct precedent for an endless vertical shaft built from a few recycled modular segments (see Q5).
- Ship WebGL2 as the baseline renderer with WebGPU as an opt-in upgrade. iOS 26 adoption is not universal, and three.js's WebGPU path is still evolving release to release (r184-r186 changes are mostly WebGPU/TSL plumbing). Writing materials and post in TSL lets one codebase target both backends, since TSL compiles to GLSL for WebGL2 and WGSL for WebGPU.

### Gaps
- Could not find or read technical write-ups for Kour.io, Krunker, Smash Karts or Poki/CrazyGames top 3D titles. Search returned nothing on their engines or rendering. Their engines (Unity WebGL vs custom) are unverified.
- "Coastal World" could not be found under that name. It may be a different title or a metaverse demo.
- No first-party Abeto rendering breakdown for Messenger exists in the results. The cel-shading and outline specifics are inferred from screenshots and the fan clone. Igloo Inc is widely attributed to Abeto in community discussion, but no fetched source confirmed the credit.
- No official technique write-ups from Lusion or Active Theory were retrievable (Awwwards/80.lv blocked here).
- No independent iPhone/Android benchmarks for three.js WebGPU vs WebGL2 were found.

## 2. Stylized rendering choices that look premium on phones, and their GPU cost

### Takeaway
On phones, premium stylization comes from cheap per-pixel math done in the material: stepped/ramped toon lighting, rim/fresnel, matcaps, baked light, plus a few signature touches (halftone in shadows, inverted-hull outlines on the hero only). Full-screen edge-detection outlines and stacked full-res post effects are what blow the fill-rate budget. AAA stylized games (Hi-Fi Rush, Guilty Gear Xrd) get their look from art-directed hacks (thresholds, edited normals, face shadow maps) rather than physically correct lighting.

### Cited Findings
**Hi-Fi Rush (GDC 2024, "3D Toon Rendering in Hi-Fi RUSH", Kosuke Tanaka and Takashi Komada, Tango Gameworks)**
- A deferred toon renderer on customized UE4. Custom render passes are stylized and combined in deferred post-process volumes. The game held 60 fps at native resolution. Topics: comic shaders, toon lights, dynamic and static shadow map strategies, light-probe GI and a dedicated face-shadow implementation — [GDC Vault](https://gdcvault.com/play/1034330/3D-Toon-Rendering-in-Hi); [GDC schedule](https://schedule.gdconf.com/session/3d-toon-rendering-in-hi-fi-rush/899802); [80.lv summary](https://80.lv/articles/the-making-of-hi-fi-rush-s-3d-toon-rendering-style)
- Body shading thresholds N·L with a step function for performance. For faces, adjusting normals broke under rotation and deformation, so they switched to a height-map-like "threshold map" texture for face shadows — [GCORES (Chinese)](https://www.gcores.com/articles/181912)

**Guilty Gear Xrd (GDC 2015, Junya Motomura, Arc System Works)**
- 3D models for a hand-drawn look. The team deliberately avoided "strict mathematical accuracy" to get consistent cel shading. The game ran on Unreal Engine 3, and the talk and handout are public — [GDC Vault](https://gdcvault.com/play/1022031/GuiltyGearXrd-s-Art-Style-The); [Arc System Works](https://www.arcsystemworks.com/guilty-gear-xrd-art-talk-at-game-developers-conference-2015/)
- Community analyses highlight edited and baked normals for clean shadow shapes and line-work tricks with extra UV maps — [BlenderNation](https://www.blendernation.com/2015/07/26/junya-c-motomura-behind-the-scenes-of-guilty-gear-xrd/). A separate mesh per frame for sword/smear trails is credited to Xrd — [Polycount](https://polycount.com/discussion/comment/2344470)

**Spider-Verse / comic halftone**
- Three.js Journey has a halftone-shading lesson that layers a GLSL halftone pattern over subtle lighting (the Spider-Verse approach) — [Three.js Journey](https://threejs-journey.com/lessons/halftone-shading-shaders)
- Breakdowns of the film look: halftone dots on specular highlights, hatching lines in shadows, and CMYK misregistration (offset) instead of conventional DOF — [GarageFarm](https://blog.garagefarm.net/blog/recreating-the-spider-verse-look-in-the-blender-node-editor); [itch.io comic effects pack](https://lucy-creates.itch.io/spider-verse-effects)

**Three.js building blocks (official examples, r186 index read directly)**
- Examples available:
  - Toon: `webgl_materials_toon`, `webgpu_materials_toon`
  - Matcap: `webgl_materials_matcap`, `webgpu_materials_matcap`
  - Lightmap: `webgpu_materials_lightmap`
  - Halftone: `webgpu_tsl_halftone`, `webgl_postprocessing_rgb_halftone`
  - Outlines: `webgl/webgpu_postprocessing_outline`, `webgpu_postprocessing_sobel`
  - Hair and clothing: `webgpu_loader_gltf_sheen`, `webgpu_clearcoat`
  - Pixelation: `webgpu_postprocessing_pixel`, `webgpu_postprocessing_retro`
  - Source: [three.js examples index](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)
- The WebGPU toon example uses `MeshToonMaterial` with a `gradientMap` (an N-pixel `DataTexture` ramp) and TSL's built-in `toonOutlinePass` — [webgpu_materials_toon source](https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_materials_toon.html)
- The WebGPU halftone example is built from TSL nodes (`normalWorld`, `screenCoordinate`, `rotate`, `mix`) with several layered halftone settings — [webgpu_tsl_halftone source](https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_tsl_halftone.html)

**Outline cost tradeoffs**
- Post-process outlines hit mobile and notebook GPUs, which "commonly have much lower fill-rate throughput". Cost scales with resolution, not object count — [Tom Looman](https://www.tomlooman.com/ue4-local-outlines)
- Three.js `OutlinePass` is reported "very inefficient when there are a lot of objects" — [three.js forum](https://discourse.threejs.org/t/performance-issues-with-three-outlinepass/7363)
- Depth-related work tends to be expensive on mobile GPUs — [Godot forum](https://forum.godotengine.org/t/how-does-stencil-outline-work-and-is-it-efficient-on-mobile-gpus/133096)
- Inverted hull (push vertices along normals, render back faces) costs an extra draw call and vertex pass per outlined object. It gives no interior lines at intersections, and thickness varies with distance unless corrected in the shader — [Unity discussions](https://discussions.unity.com/t/unlit-rendering-toon-outline-inquiry/1600735); [RealTimeVFX](https://realtimevfx.com/t/unity-outline-by-normals-for-mobile-game-urp/14919)

### Inferences
Recommended look for Emonad: "comic-punk toon" (Hi-Fi Rush energy, Spider-Verse print texture, emo palette). The cost tiers below are my estimates from how these techniques work, not measured benchmarks:
- **Hero character (Emonad)**
  - Custom toon material: a 2-3 band `gradientMap` ramp (or TSL step on N·L), plus rim light (fresnel × light-side mask) in hot pink/purple, plus a matcap-style fake spec for the hair "sheen".
  - Real `MeshPhysicalMaterial` clearcoat and sheen on the hair is the most expensive per-pixel material in three.js. Because Emonad fills a lot of portrait screen, prefer a faked anisotropic highlight band (a scrolling texture or tangent-based stripe) on a toon base. Keep physical clearcoat/sheen as a "High" quality-tier option only.
  - Inverted-hull black outline on Emonad only: +1 skinned draw call, small cost, and the outline stays readable while he tumbles.
  - Face: copy Hi-Fi Rush and Guilty Gear. Use a face threshold/shadow map or hand-edited normals so his face never gets ugly shadow blotches mid-ragdoll. This matters because ragdoll rotations are extreme.
- **Environment**
  - Unlit or matcap/baked materials with vertex-color or palette-texture shading (Bruno Simon's palette-texture approach), so hundreds of props share one material and batch.
  - No real-time shadows except a cheap blob/projected shadow or none. In a vertical fall, shadows are rarely readable anyway.
- **Halftone/hatching**
  - Do it inside the material, only in the shadow band (Spider-Verse rule), using screen-space dots. It costs a few ALU ops and no extra pass. Reserve a full-screen halftone/CMYK-offset post effect for brief moments (big bone-break freeze-frames, zone transitions).
- **Avoid on mid-range phones**
  - Full-res Sobel/normal-depth outline passes, SSAO/GTAO, SSGI, SSR, PCSS soft shadows. All are in the three.js examples, but all are full-screen multi-tap passes that eat the fill-rate budget at phone DPR.
- **Rough cost tiers** (cheapest to most expensive): unlit/vertex color < matcap < MeshToon/Lambert + ramp < toon + rim + in-shader halftone < Standard PBR < Physical with clearcoat/sheen. Post: LUT/vignette (nearly free when merged) < bloom (mip chain) < radial blur (sample count) < DOF < velocity motion blur < outline/SSAO passes.

### Gaps
- Arcane-style painterly shading and Sea of Thieves GDC material were not retrieved (search budget exhausted).
- No measured mobile GPU timings for toon vs PBR vs outline techniques in three.js were found. The cost tiers above are reasoned estimates and need profiling on target devices (e.g. a Snapdragon 7-series Android and an iPhone 12/13 class device).
- Hi-Fi Rush's exact halftone/comic shader formulas are behind GDC Vault membership.

## 3. Lighting and post-processing that sell depth in a vertical fall

### Takeaway
Use one merged post pass (pmndrs `EffectPass` on WebGL2, or a TSL node graph on WebGPU) containing tone mapping, a per-zone LUT, vignette, light film grain/dither and a small bloom. Add speed effects (radial blur and speed lines) driven by fall velocity, and pay for DOF or motion blur only in short slow-mo moments. Depth in a vertical shaft is sold mostly by height/distance fog and light-to-dark value gradients, not by expensive volumetrics.

### Cited Findings
**pmndrs/postprocessing (WebGL)**
- `EffectPass` automatically merges any combination of effects to minimize render operations and avoid pass-chaining penalties. Fullscreen passes use a single triangle, not a quad — [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)
- Effects include Bloom, Blur, Color Depth, Color Grading (Brightness/Contrast, Hue/Saturation, LUT), Depth of Field, Vignette, Chromatic Aberration, Noise, Glitch, God Rays, Dot-Screen/Grid/Scanline patterns, Pixelation, Outline, Shock Wave (with depth picking), SSAO, Texture and Tone Mapping — [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)
- Recommended renderer settings are `powerPreference: "high-performance"`, `antialias: false`, `stencil: false`, `depth: false`. Intermediate buffers default to 8-bit sRGB, "which can band in dark scenes", and `HalfFloatType` is preferred for HDR-like work. Keep renderer `toneMapping` at `NoToneMapping` and put a `ToneMappingEffect` at the end — [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)
- Anti-aliasing approach is unclear. A search summary of the README says it recommends WebGL2 MSAA, and a forum reply says the library "has no post AA, it uses multi sampling" — [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing); [three.js forum](https://discourse.threejs.org/t/dodecahedron-ballpit/17604). My direct read of the README did not surface MSAA text, so treat this as unconfirmed. The original design proposal aimed to do all effects "in one go" with a single fullscreen render operation — [pmndrs/postprocessing issue #82](https://github.com/pmndrs/postprocessing/issues/82)
- Typical AA cost order is none < FXAA < SMAA < SSAA — [ShapeDiver docs](https://help.shapediver.com/doc/post-processing-settings)
- A maintainer-adjacent forum reply says it is "fast enough on mobile" for most use cases (anecdotal) — [three.js forum](https://discourse.threejs.org/t/dodecahedron-ballpit/17604)

**Three.js WebGPU/TSL post (r186 examples)**
- Available examples: `webgpu_postprocessing_bloom`, `_bloom_emissive`, `_bloom_selective`, `_dof`, `_dof_basic`, `_motion_blur`, `_radial_blur`, `_godrays`, `_3dlut`, `_ca` (chromatic aberration), `_afterimage`, `_anamorphic`, `_lensflare`, `_fxaa`, `_smaa`, `_traa`, `_fog`, plus `webgpu_fog_height`, `webgpu_custom_fog`, `webgpu_custom_fog_scattering`, `webgpu_volume_lighting` — [three.js examples index](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)
- Motion blur writes a per-pixel `velocity` buffer via MRT from the scene pass, then applies `motionBlur(beauty, velocity * blurAmount)` — [webgpu_postprocessing_motion_blur source](https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_postprocessing_motion_blur.html)
- Radial blur is a TSL addon, `radialBlur(scenePass, { weight, decay, count, exposure })`, with each parameter a uniform you can drive at runtime — [webgpu_postprocessing_radial_blur source](https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_postprocessing_radial_blur.html)
- Selective bloom tags emissive objects via a material `mrtNode` and blooms only that channel — [webgpu_postprocessing_bloom_selective source](https://github.com/mrdoob/three.js/blob/dev/examples/webgpu_postprocessing_bloom_selective.html)
- The classic GodRays shader blurs a depth-derived mask along radial lines from the light's screen position over several passes with growing filter support and a constant sample count — [three.js GodRaysShader](https://app.unpkg.com/three@0.139.2/files/examples/jsm/shaders/GodRaysShader.js)

**LUT colour grading**
- `LUTPass` takes a `Data3DTexture` and has an `intensity` (default 1). TSL `Lut3DNode(input, lut, size, intensityNode)` takes intensity as a node, so it can be animated — [three.js LUTPass docs](https://threejs.org/docs/pages/LUTPass.html); [Lut3DNode docs](https://threejs.org/docs/pages/Lut3DNode.html)
- pmndrs ships a `.cube` loader (`LUTCubeLoader`) and a LUT effect with optional tetrahedral interpolation. `.cube`/`.3dl` are the common formats — [react-postprocessing LUT](https://react-postprocessing.docs.pmnd.rs/effects/lut); [three.js forum](https://discourse.threejs.org/t/use-of-external-luts-possible/32104)

**Speed lines and stylized fog**
- Radial speed-line shaders animate noise-texture spikes by changing the sampling radius over time. The distortion variant mixes sharp and blurred screen samples by line intensity (Godot GLSL, portable) — [Godot Shaders: Radial Speedlines](https://godotshaders.com/shader/radial-speedlines/); [Distortion Speed Lines](https://godotshaders.com/shader/distortion-speed-lines/)
- Commercial mobile stylized-fog packs use height-based fog (start/end height, density, colour, distance fade) as a renderer feature. "Fake lighting" packs sell screen-space halos as a cheap stand-in for true volumetrics — [Fab listing](https://www.fab.com/listings/c9b42fae-ddf2-45ed-81ea-cc8348c6b369); [Fab listing](https://www.fab.com/listings/b0cd7ea3-8f17-4dda-a68b-88beb75aa04b)

### Inferences
Suggested phone post stack (one merged pass where possible). This is a design recommendation, not a measured result:
- **Always on (cheap, merged)**
  - ACES/AgX tone mapping, a per-zone LUT (crossfade two LUTs over ~1 s at zone boundaries by blending intensities, or with a TSL mix of two `Lut3DNode`s), vignette, and subtle noise/dither. The dither matters: the 8-bit banding warning applies directly to a dark, red/purple hell gradient.
  - Render post at reduced resolution on weak devices (cap DPR at ~1.5-2, scale dynamically).
- **Bloom**
  - Selective/emissive-only bloom at half or quarter res with few mips. Keep emissive values above threshold only for neon signage, liquidation fire, red candles, Emonad's rim and impact flashes. This keeps the image from going milky.
- **Velocity-driven speed FX**
  - Map fall speed to radial blur strength/`count` (centered slightly below screen center, where he is heading in portrait), screen-space speed-line overlays (a single full-screen quad with an animated noise texture, additive), FOV kick (+5-15°) on boosts, and chromatic aberration only during boosts.
  - Prefer radial blur and speed lines over true velocity motion blur. The MRT velocity buffer adds bandwidth on every frame and per-object motion blur is overkill for a mostly-downward camera.
- **Slow-mo bone-break moments**
  - Enable DOF (focus on Emonad) and optionally a CMYK-offset/halftone "comic panel" grade for 0.3-1.0 s. The frame rate budget is easier because the sim is slowed, and the effect is temporary.
- **Depth cues in the shaft**
  - Exponential-squared distance fog toward a zone colour, plus "depth fog" coloured darker and redder below the player and lighter above. Layered silhouette cards at different depths and scroll rates (parallax). Fake god-rays as additive gradient cards/cones (one quad each) shining down the shaft, rather than the radial-blur godrays pass.
  - A single key light angled from above (so the descent goes from light into darkness) plus coloured rim from below (hellfire uplight) reads instantly on a small screen.
- **AA**
  - Use MSAA x4 if affordable on the device, else FXAA. Avoid TRAA/TAA on fast motion because it smears and ghosts at high speed. Outlines and toon edges benefit greatly from MSAA.

### Gaps
- No public per-effect millisecond costs for pmndrs effects or three.js TSL post on mid-range phones were found. Profile with `renderer.info` plus a GPU timer, or Chrome/Safari remote devtools.
- No source found on per-zone LUT blending patterns in three.js (suggested method above is inferred).
- No direct source for "speed lines in Three.js" as a packaged library. The Godot shaders and radial-blur addon are the closest references.

## 4. VFX for impacts and hell zones: particle systems, fire, embers, smoke, sparks, shockwaves, decals, trails, flipbooks

### Takeaway
Use three.quarks (MIT, batched, Unity-Shuriken-compatible, with a visual editor) for authored bursts. Use a hand-rolled instanced-billboard or TSL compute system for ambient embers and ash, flipbook textures for fire and smoke, ribbon/fat-line trails for Emonad's flight, and the built-in Shock Wave effect or a distortion ring for bone-break impacts. Keep the number of systems and draw calls small, and fake volume with sprites.

### Cited Findings
**three.quarks**
- TypeScript VFX engine for three.js. Most particle data is computed on the CPU, with instancing/batching to keep draw calls low — [npm three.quarks](https://npmjs.com/package/three.quarks); [libraries.io](https://libraries.io/npm/three.quarks)
- Features (GitHub README):
  - **Renderers:** Billboard, Stretched Billboard (velocity-aligned), Mesh and Trail (ribbon).
  - **Emitter shapes:** point, sphere, hemisphere, cone, circle, mesh surface, grid.
  - **Behaviours:** colour/size/rotation over life, force fields, orbital, texture animation (atlas/flipbook), sub-emitters, custom plugins.
  - **Batching:** one `BatchedRenderer` batches all systems sharing a pipeline to minimize draw calls.
  - **Tooling and status:** WYSIWYG editor at quarks.art with JSON export; "Unity compatible" import; WebGPU rendering is an unchecked roadmap item, while the separate `quarks.nodes` package has experimental WebGPU compute; MIT license.
  - Source: [GitHub: three.quarks](https://github.com/Alchemist0823/three.quarks)
- GPU/WASM simulation is listed as WIP on the npm page, so it is not available yet — [npm three.quarks](https://npmjs.com/package/three.quarks)

**Three.js native VFX references (r186 examples)**
- `webgpu_compute_particles`, `_particles_rain`, `_particles_snow`, `webgpu_particles`, `webgpu_particles_soft` (soft depth-faded particles), `webgpu_tsl_vfx_linkedparticles`, `webgpu_volume_fire`, `webgl_decals`, `webgl_lines_fat`/`webgpu_lines_fat` (thick lines for trails), `webgpu_instance_sprites`, `webgpu_postprocessing_afterimage` (frame-feedback trails) — [three.js examples index](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)
- Practitioner claims say CPU-updated particles bottleneck around 50k particles on typical hardware, while WebGPU compute with persistent `instancedArray` buffers scales to millions. This is unbenchmarked; a 2^18 (262,144) particle compute snippet is the common example — [utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips); [Makio64 advanced TSL repo](https://github.com/Makio64/advanced-threejs-tsl-webgpu-rendering)
- pmndrs includes a Shock Wave effect with depth picking — [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing)

**Game-feel precedents for impacts**
- Vlambeer: the screen shakes when guns fire or enemies are hit, and the game briefly pauses on hits and kills ("hit-stop") so impacts land harder — [Amara transcript of "The Art of Screenshake"](https://amara.org/en/videos/po7TV1hgkspB/en-gb/3101525/)
- "Juice it or lose it" (Jonasson and Purho, Nordic Game Jam 2012) and "The Art of Screenshake" (Jan Willem Nijman, 2013) are the canonical talks — [Juicy Break (itch.io)](https://crcdng.itch.io/juicy-break)
- One developer's testing found 0.05-0.1 s of hit-stop works best (anecdotal) — [Easton Dev](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)
- Counterpoint: juice for its own sake can distract from the core goal — [RPG Playground](https://rpgplayground.com/research-making-a-juicy-game/)
- Guilty Gear Xrd's smear/sword trails use a separate mesh per frame — [Polycount](https://polycount.com/discussion/comment/2344470)

### Inferences
VFX recipe list for Number Go Down (budget: aim for 1-4 particle draw calls total via batching, under ~2-5k live CPU particles on mid-range phones, all additive or alpha-tested, no soft particles on Low tier):
- **Bone-break impact ("CRACK")**
  1. 60-100 ms hit-stop.
  2. A white flash frame on Emonad (emissive pulse).
  3. A stylized comic "impact star" mesh or sprite (hand-drawn shape, not realistic).
  4. A bone-fragment burst (mesh particles of cartoon bone shapes) plus radial sparks (stretched billboards).
  5. A pmndrs Shock Wave or a distortion ring at the hit point.
  6. Trauma-based camera shake.
  7. The damage number pops.
  - Gore stays stylized: cartoon bones, stars, "X" eyes, confetti-like particles in brand purple/pink instead of blood.
- **Liquidation fire / hell fire**
  - Flipbook fire sprites (8×8 atlas) on camera-facing quads, with emissive values for bloom. A few big "fire curtain" cards with scrolling noise UVs on the shaft walls are cheaper than particles for large areas.
- **Ambient embers and ash**
  - One instanced-billboard system that wraps around the camera (particles respawn above and below the camera in camera-relative space), so the cost is constant while falling forever. Ember streaks stretched by fall velocity double as speed lines.
- **Trails**
  - A ribbon trail (three.quarks Trail renderer, or a fat line) off Emonad's sneakers and hands, coloured purple/neon, widening with speed. It sells speed and makes his tumbling silhouette readable.
- **Decals**
  - Cracks and splat stickers ("REKT", purple "X" marks) on obstacles he hits, via `DecalGeometry` or simple pre-placed quads. Cap and recycle them (pool of ~20).
- **Crypto-themed bursts**
  - Red candle shards, falling coins, "-99%" text particles, broken chart-line segments (fat-line pieces) bursting on impacts with chart bars.
- **Tooling**
  - Author bursts in quarks.art (JSON) so artists can iterate without code. Flipbooks can be authored in Blender or EmberGen and packed to KTX2 atlases.

### Gaps
- three-nebula's current maintenance status was not checked (search budget). Treat it as lower priority than three.quarks.
- No mobile particle-count benchmarks were found for three.quarks or TSL compute. The numbers above are rules of thumb to validate.
- EmberGen licensing and flipbook authoring sources were not retrieved.

## 5. Environment art for a long vertical descent: modular kits, procedural placement, parallax, skyboxes, readable speed, landmarks per zone; hell/crypto-crash theme

### Takeaway
Build the shaft from a small modular kit of 3-6 interchangeable segments per zone, recycled endlessly (the Active Theory "5 repeating geometries" trick). Instance all props, and share one palette-texture material per zone so each zone renders in a few draw calls. Readable speed comes from close-passing repeating elements (rings, ribs, girders, chart grid lines) and parallax silhouette layers. Each zone needs a single dominant colour key, a skyline-like silhouette motif and one big landmark that reads as a shape at phone size.

### Cited Findings
- Active Theory's v4 homepage was "an endless journey through 5 repeating alley geometries" — [Awwwards](https://awwwards.com/active-theory-v4-wins-january-2018-site-of-the-month.html)
- Bruno Simon's folio uses an instanced-group stage and modular world systems (fog, weather, foliage, wind, day cycles), and sets a palette texture directly on materials — [GitHub: folio-2025](https://github.com/brunosimon/folio-2025)
- Slow Roads generates scenery procedurally ("paths naturally draped over hills and valleys"), with selectable weather and time of day, so long sessions rarely look alike — [Jalopnik](https://jalopnik.com/slow-roads-best-browser-driving-game-1850304751); [FlowingData](https://flowingdata.com/2022/11/04/procedurally-generated-driving-game/)
- Draw calls are the main bottleneck. A practitioner budget is under 500 per frame and ideally under 100 on mobile, monitored via `renderer.info.render.calls`. Instancing gives one draw call per unique mesh, and merged geometry suits static parts — [MetaDesign Solutions](https://metadesignsolutions.com/blog/threejs-performance-optimization-best-practices); [Digital Strategy Force](https://digitalstrategyforce.com/journal/how-do-you-optimize-threejs-performance-for-mobile-devices/) (rules of thumb, not measurements)
- Three.js has `InstancedMesh`, `BatchedMesh` (per-instance opacity added in r183), instancing scatter/LOD examples (`webgl_instancing_scatter`, `webgl_batch_lod_bvh`), `webgpu_sky`, `webgpu_fog_height` and `webgl_modifier_curve_instanced` — [three.js examples index](https://github.com/mrdoob/three.js/blob/dev/examples/files.json); [three.js releases](https://github.com/mrdoob/three.js/releases)
- PlayCanvas guidance: decide each texture's resolution from the maximum screen space it occupies, and know your VRAM budget on low-end devices — [PlayCanvas forum](https://forum.playcanvas.com/t/how-to-make-optimized-models-for-big-metaverse-project/32701)

### Inferences
Zone structure suggestion for "descending hell" (portrait, the camera looks down or at a slight angle so the player sees what is coming):
1. **"Bull Market Heaven" (launch/tutorial, top).** Bright, gold and mint green, green candles, clouds, the emo slingshot (a giant studded-belt band and safety-pin frame, purple and black). Establishes "up is good". The palette inverts as you fall.
2. **"The Dip" (red candles).** Giant candlestick pillars (thin wick plus body) as the main obstacle silhouette. Body red, wicks black, glowing edges. Background: a huge falling price chart line made of fat lines breaking into segments. Speed cue: horizontal chart grid lines rushing past.
3. **"Whale Waters" (deep).** Massive whale silhouettes (flat dark cutout cards with emissive eye and rim) slowly crossing in parallax layers. A "splash" bounce pad, bioluminescent purple/cyan. Landmark: one huge whale mouth you fall past.
4. **"Liquidation Inferno".** Lava, fire curtains (scrolling-noise cards), flipbook fire, ember streams going up while you fall down (opposed motion doubles perceived speed). Neon "LIQUIDATED" and "REKT" signs (emissive, bloom-tagged) as breakable obstacles.
5. **"Emo Abyss / Rug Pull" (bottom).** Black-purple void, giant hanging rug-pull carpets, broken hearts, guitar-string laser tripwires, mascara-drip walls. The final "Number Go Down" floor slam with a big comic finisher.

How to make it readable and fast:
- **Readability on a small screen.** One hero colour per zone (red, deep blue, orange, purple) plus black silhouettes and emissive accents. Obstacles get the highest-contrast colour plus a thin bright rim so they read against fog. Keep text/sign meshes chunky and short ("REKT", "-90%", "SELL"), because 3-6 character words survive at phone size.
- **Speed readability.** Close-passing repeating geometry at a fixed spacing (shaft ribs, rings, scaffolding, chart gridlines) is the strongest speed cue, because frequency equals speed. Add parallax layers: near walls (fast), mid silhouettes (medium), far backdrop and skybox gradient (slow or static).
- **Endless streaming.** Keep segments in a pool. As a segment leaves the top of the view, move it below and re-decorate it with seeded random instanced props (procedural placement with designer-authored "set pieces" every N metres). There is no need to load or unload meshes mid-fall, so no hitches. Use floating-origin re-centering (shift the world and player up periodically) to avoid float precision jitter at large Y values.
- **Skybox/backdrop.** A gradient-shader backdrop (cylinder or sphere with a vertical gradient and noise) per zone is cheaper and more stylized than cubemap skyboxes. Crossfade gradient colours together with the fog and LUT at zone boundaries.
- **Draw-call target.** One palette-texture material per zone, InstancedMesh per prop type, merged static shaft walls. Realistically ~30-80 draw calls per frame including the character, VFX batches and UI.

### Gaps
- No published breakdown of a vertical-descent/falling web game's environment pipeline was found. The zone and streaming recommendations are design inferences from the endless-runner precedents above.
- No source was found for crypto-themed game art conventions (candles, whales) beyond common meme iconography. Treat theme ideas as creative proposals.

## 6. UI/HUD polish: readable damage counter, combo callouts, comic typography, menus with personality

### Takeaway
The damage counter and combo callouts are a core "juice" channel, not just a HUD. Use big, chunky, outlined comic numerals that pop, shake and colour-code by severity, synced with hit-stop and audio. Build HUD in DOM/CSS or a single canvas layer over WebGL, with SDF/MSDF text if text must live in 3D. Study the Game UI Database's comic/graphic style filters for references.

### Cited Findings
- The Game UI Database (by Edd Coates) catalogues UI screens from 1,100+ games, filterable by art style, camera type, control scheme and more. Style categories include "Comic/Graphic", "Flat" and "Skeuomorphic" — [GameFromScratch](https://gamefromscratch.com/the-game-ui-database/); [GIGAZINE](https://www.gigazine.net/news/20201207-game-ui-database/)
- Version 2.0 added a major interface overhaul and over 55,500 new screenshots and videos (counts vary by source and date) — [80.lv](https://80.lv/articles/game-ui-database-2-0-has-been-released); [Digital Production](https://digitalproduction.com/2021/02/22/spielemenue-bibliothek-gaming/)
- Mobbin is suggested for real mobile app UI patterns — [AlternativeTo](https://alternativeto.net/software/game-ui-database)
- Damage feedback works through iconography, text size, colour coding, timing and audio together — [Acagamic](https://acagamic.com/newsletter/2022/03/08/show-juicy-feedback-to-indicate-player-damage-in-video-games/)
- Floating text, flash, shake, particles and sound together create "game feel". Hit-stop of 0.05-0.1 s is reported as the sweet spot (anecdotal) — [Easton Dev](https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/)
- Three.js r184 added an `HTMLTexture`, a route to rendering HTML content into the 3D scene — [three.js releases](https://github.com/mrdoob/three.js/releases)

### Inferences
- **Damage counter (the "Number Go Down" pun)**
  - A huge counter near the top-centre in portrait. Thumb zones are at the bottom, and Emonad falls through the middle third.
  - It ticks like a crashing stock ticker: red, with a down arrow, digits rolling. Each bone break adds a chunk with a separate floating callout near the impact (screen-projected), e.g. "FEMUR -$420", "SKULL -69%".
  - Scale-punch (1.0 → 1.4 → 1.0 over ~150 ms), slight rotation jitter and colour escalation (white → yellow → orange → red → purple glitch) as combos grow.
- **Combo callouts**
  - Comic onomatopoeia ("CRACK!", "SNAP!", "REKT!", "LIQUIDATED!") in a heavy, slanted display face with thick black stroke and offset drop shadow (Spider-Verse print offset). Pop in on the hit-stop frame and leave via squash and fade.
  - Rarer combos earn bigger words ("RUG PULLED", "CAPITULATION", "FULL PORT DOWN").
- **Implementation**
  - Use DOM/CSS for HUD and callouts (crisp at any DPR, cheap, easy to animate with CSS transforms/WAAPI, GPU-composited), but pool the elements and only animate `transform`/`opacity`.
  - For 3D-anchored text, project the impact point to screen space and position a DOM element there. Use troika-three-text/MSDF only for text that must be occluded or lit in-world (signage).
- **Menus with personality**
  - Emo-scrapbook layer: ripped notebook paper, safety pins, sticker labels, marker scribbles, a broken-heart cursor and a purple/black palette, mixed with crypto terminal UI (red tickers, candle icons).
  - Emonad idles and reacts in the menu (sighing, fringe flip). The slingshot pull is the "Play" button, so the menu flows straight into gameplay.
  - The sibling game "Number Go Up" can share a UI kit with inverted colours (green/up) for brand cohesion.
- **Results screen**
  - An X-ray "bone report card" of Emonad showing every broken bone highlighted, with a stock-chart graph of the run's damage and a shareable card. A share card is a major virality lever for meme games.
- **Accessibility and readability**
  - Minimum ~18-24 CSS px for secondary HUD text and 48+ px for the main counter. Thick outlines so text reads over busy bloom/fire. Respect the safe area (notch and home indicator) with `env(safe-area-inset-*)`.

### Gaps
- Could not retrieve breakdowns of Supercell (Brawl Stars, Squad Busters) or other top mobile UI (search budget exhausted). These remain good reference targets but are unsourced here.
- No source found comparing DOM vs WebGL text performance for HUDs on phones. The recommendation is practitioner reasoning.

## 7. Asset creation workflows for a small team in 2026: Blender, AI 3D generation, Mixamo, texture generation, asset packs and licenses

### Takeaway
Hand-build the hero (Emonad) in Blender. He is the brand, the ragdoll and the face of the game, and AI meshes are not yet reliable for clean topology, rigging and stylized hair. Use AI 3D generators (Meshy, Tripo, Rodin, Hunyuan3D) for blockouts and background props, then retopo/clean in Blender. Use CC0 packs (Kenney) for placeholders and filler, and Mixamo for prototype animations. Run everything through glTF-Transform with KTX2 textures. Check every license at download time. Notable traps: Hunyuan3D's license excludes the EU/UK/South Korea, and Synty licenses are per-seat.

### Cited Findings
**AI 3D generators (vendor-adjacent comparison sources; verify on vendor pages)**
- Meshy free-tier outputs are reportedly CC BY 4.0 (commercial use with credit), with full ownership on paid tiers (Premium cited at $40/month). One source contradicts this, saying free assets cannot be downloaded — [Cinevva guide](https://app.cinevva.com/guides/ai-asset-generators-games); [Ludo.ai comparison](https://ludo.ai/compare/meshy-alternatives); [Krea](https://www.krea.ai/blog/best-ai-3d-model-generators-2026)
- Tripo: sources conflict on free-tier terms (non-commercial vs CC BY 4.0). Commercial rights come with paid plans — [Cinevva](https://app.cinevva.com/guides/ai-asset-generators-games); [Ludo.ai](https://ludo.ai/compare/best-ai-3d-model-generators); [Sorceress](https://sorceress.games/blog/best-free-ai-3d-model-generator-honest-2026-picks)
- Rodin (Hyper3D): generation is free and downloads are paid. It is noted for clean quad topology but outputs static meshes only, with no rigging — [Cinevva](https://app.cinevva.com/guides/ai-asset-generators-games); [Scenario help center](https://help.scenario.com/en/articles/comparing-generative-3d-models/)
- Ludo.ai is a competitor-published comparison, so expect bias — [Ludo.ai](https://ludo.ai/compare/meshy-alternatives)
- **Hunyuan3D 2.1 license (read directly):**
  - It "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA". "Territory" means worldwide excluding those regions.
  - You "must not use, reproduce, modify, distribute, or display the ... Works, Output or results ... outside the Territory".
  - Licensees with over 1 million MAU (at the version's release date) must request a license from Tencent.
  - Source: [Hunyuan3D-2.1 LICENSE](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE)

**Mixamo**
- The Mixamo FAQ (as quoted on Adobe Community): characters and animations are royalty-free for personal, commercial and non-profit projects, including video games. The only restriction is not distributing the raw character/animation files (e.g. in asset packs or stock sales) — [Adobe Community](https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775)
- No credit is required ("would be welcomed") — [Steam discussion (Mixamo dev)](https://steamcommunity.com/app/257400/discussions/0/604941528491325843)
- An asset-store submission with Mixamo content was rejected for missing third-party licenses. This matters only if you resell packs — [Unity discussions](https://discussions.unity.com/t/asset-rejected-due-to-licenses-required-for-third-party-assets/871153)
- Some quoted Mixamo terms date from its "technology preview" era, so verify against the current Adobe Terms — [Adobe Community](https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400)

**Asset packs**
- Kenney: all assets CC0 (commercial use, no attribution) — [Gamineai](https://gamineai.com/blog/20-best-free-game-assets-every-developer-should-know-about); [Cinevva free model sites](https://app.cinevva.com/fr/guides/free-3d-model-sites)
- Quaternius: long described as CC0, but one source reports a newer "Quaternius Asset Licence (QAL v1.0)" for future releases. It allows commercial use in games without attribution but bans reselling/redistributing raw assets. Verify on quaternius.com — [Cinevva (Spanish)](https://app.cinevva.com/es/guides/free-rigged-3d-character-models). KayKit packs are reported mostly free/CC0 — [Cinevva (French)](https://app.cinevva.com/fr/guides/free-3d-model-sites)
- Synty POLYGON packs are licensed "5 seats per copy" — [Synty Store: POLYGON Dungeon](https://syntystore.com/products/polygon-dungeon-pack). The Unity Asset Store version uses Restricted Single/Multi Entity licenses — [Unity Asset Store](https://assetstore.unity.com/packages/slug/202117). Bundle licenses may be single-seat — [GameFromScratch](https://gamefromscratch.com/?p=11275). No source confirmed web/browser distribution terms.

**Pipeline/compression**
- GPU-compressed textures (KTX2/Basis) cut VRAM substantially (one forum figure is ~6x vs uncompressed) — [PlayCanvas forum](https://forum.playcanvas.com/t/how-to-make-optimized-models-for-big-metaverse-project/32701)
- don McCurdy recommends starting with `gltf-transform` using UASTC (quality) and ETC1S (size) — [three.js forum](https://discourse.threejs.org/t/three-scene-optimization-texture-size-calculation-in-gpu-compression-merge-meshes-what-the-limits/23972)
- Bruno Simon's pipeline compresses all textures to ETC1S (q255) after uncompressed Blender export and converts UI images to WebP — [GitHub: folio-2025](https://github.com/brunosimon/folio-2025)
- Messenger's team used Blender + Houdini, with Substance per secondary reporting — [Communication Arts](https://www.commarts.com/webpicks/messenger); [VidaExtra](https://vidaextra.com/aventura-plataformas/imposible-resistirse-a-este-juego-cozy-repartidor-ambientado-japon-que-esta-gratis-navegador)
- three.js has a Rapier joints example (relevant to ragdoll rigs) and skinned-mesh instancing examples — [three.js examples index](https://github.com/mrdoob/three.js/blob/dev/examples/files.json)

### Inferences
Recommended small-team pipeline:
1. **Emonad (hero)**
   - Concept sheet (turnaround and expression sheet), then a hand-modelled Blender mesh at ~8-15k tris with clean edge loops at joints so ragdoll bends deform well. The hair fringe is separate mesh cards with a toon and sheen shader. Hand-painted or flat-colour textures on a small atlas (1024²), with a face texture swap for expressions (eye-X, wince, smirk) rather than blendshape-heavy rigs.
   - Rig to a Mixamo-compatible humanoid skeleton so prototype animations (idle, flail, landing) can be retargeted. Build the ragdoll from the same bones (capsule colliders and Rapier joints).
   - An AI generator can produce a first-pass sculpt from the concept art. Expect to retopologize and re-rig, since sources note Rodin outputs static meshes and quality varies.
2. **Environment props**
   - Generate candidates with Meshy/Tripo/Rodin (paid tier for clear commercial rights). Decimate and retopo in Blender, strip PBR maps and re-texture to the zone palette (single palette texture plus vertex colour). Stylization consistency matters more than per-prop detail, and AI textures tend to look "realistic-noisy", which clashes with toon shading.
   - Avoid Hunyuan3D outputs if the game will be played or distributed in the EU/UK/South Korea (it is a global web game, so effectively avoid it).
3. **Packs**
   - Kenney (CC0) for prototyping and filler. Synty only if you buy seats for each team member and confirm web distribution terms.
4. **Export and runtime**
   - glTF/GLB → `gltf-transform` (meshopt or Draco geometry, KTX2: UASTC for the hero's normal/face textures, ETC1S for environment) → `KTX2Loader` + `MeshoptDecoder`.
   - Target a total first-load download of ~5-10 MB, with later zones streamed during the menu and slingshot phase.
5. **Keep a license ledger**
   - Record source URL, license text snapshot, date and seat count for every asset, AI output and font.

### Gaps
- The AI generator facts come from vendor-adjacent blogs (Cinevva, Ludo, Krea, Sorceress) that conflict on free-tier terms and that I could not open in full. Current pricing and terms must be checked on Meshy/Tripo/Hyper3D's own license pages.
- Quaternius's QAL change comes from a single secondary source, and the Kenney license was not read from kenney.nl directly.
- Synty's EULA text for web games was not found.
- No 2026 source compared AI-generated character quality for rigging/ragdoll use. AI texture generators (e.g. Substance/Adobe, Meshy texturing, Scenario) were not researched in depth.
