# THWAP — Game Summary & Art / Asset Handoff Spec

> Purpose: a self-contained brief you can paste into an art-planning chat (e.g. Makko), plan art
> against, and hand back to the coding side to implement. It covers **what the game is**, **how it
> renders today**, **every asset that could carry an art style**, and **the specs art must hit** so
> it drops into the game without breaking gameplay.

---

## 1. What THWAP is (60-second version)

A **one-button, phone-first browser game.** You are a small, googly-eyed **sticky hand** climbing the
inside of a giant, abandoned, **endless claw machine.** One verb, three timings:

- **HOLD** — wind up. The hand orbits the stud it's gripping, charging.
- **RELEASE** — fling. You always launch upward; *when* you let go steers you left/right.
- **TAP (mid-air)** — grab. Stick to the nearest peg within reach.

**Falls are the punishment** — miss a grab and you drop, watching your height `%` drain. No enemies,
no health bar. The whole game is *execution mastery* + *not falling*.

- **Sessions:** 5–10 min. **Audience:** Gen Z / Gen Alpha. **Tone:** deadpan-funny on the surface,
  secretly a gut-punch (see the story below).
- **Feel target:** twitchy, juicy, immediately legible, one-thumb.
- **Shareable:** "call a hand" (send a friend the grab you missed) + a daily challenge with an
  emoji-grid receipt.

**This spec is about cosmetics only.** The physics, hitboxes, and layout are fixed and identical in
every art version. Art dresses the machine; it never changes how it plays.

---

## 2. The world & story (so the art has a soul)

The machine is a vertical world. You climb through named regions, bottom → top:

| Zone | Height band | What it is |
|---|---|---|
| **the pit** | 0–8% | The crowded floor of unwon toys. Home. A whole society lives here. |
| **the spill** | 8–30% | Just off the floor; the first climb. |
| **the reef** | 30–55% | Old toys fused into layers — the ones that fell and gave up. |
| **the gallery** | 55–75% | A glass wall. You can see *out* — into a dead, dark arcade. |
| **claw country** | 75–92% | The claw's domain. |
| **the cornice** | 92–101% | The top ledge. A nest. |
| **the chute** | ~100% | The summit — and then the machine goes **endless** above it. |

**The cast (currently mostly text; strong candidates for real art):**
- **YOU** — a thumb-sized googly-eyed sticky hand. You carry a single eye everywhere you climb.
- **MOOSE** — a big, **one-eyed plush**, the oldest toy in the pit; he raised you. The claw took him
  years ago protecting you; his eye rolled down to you and you kept it. He's who you're climbing toward.
- **GERALD** — the claw itself. Not evil; a bored machine with one instruction, dropping every 3 seconds.
- **The pit toys** — **GLORIA** (soft, motherly), **PALMER** (wry, watchful, got to 89% once and never
  tried again), **THE COLONEL** (grim record-keeper), **NANA** (frail, gentle), **THE KING** (deluded
  optimist who insists Moose "made it OUT").
- Tagline on the machine: **EVERYBODY GOES HOME.**

The vibe is **Terry Pratchett / Dungeon Crawler Carl** — funny and devastating in the same breath.
An art style should feel like it belongs to a lonely, glowing, coin-op machine in a dark room.

---

## 3. How it renders TODAY (the key technical fact)

**The entire game is a single self-contained `index.html` — canvas 2D, drawn with code primitives
(circles, rects, gradients). There are ZERO image files right now.** No backend, no dependencies,
`localStorage` only.

Coordinate system art must respect:
- **Portrait phone screen**, full viewport.
- A fixed **virtual world 430 units wide** (`VW=430`). Everything is authored in world units, then
  scaled to the device (`S = screenWidth / 430`, retina DPR capped at 2.5).
- Camera scrolls vertically and keeps the **hand at ~62% down the screen**. Up = higher = more height.

Because it's all code-drawn, "an art style" can plug in **two ways:**

### Path A — Data reskin (already supported, zero new pipeline)
The game already has a theming system. A new look can be **pure data** — colors + shape choices —
with no images at all:
- `FINISHES` — hand identities (body color, 2nd color, eye style, glow, motion trail).
- `STUDSETS` — the pegs (plastic / glass / plush colors + a shape: round/square/gem/bolt).
- `BACKDROPS` — per-zone gradient (`top`/`bottom` colors) + a `motif` (banners/embers/stars/runes/snow/bubbles).
- **This is the fast lane.** A whole new "vibe" can ship as one block of JSON. Good for palettes,
  material feels, mood — bad for anything that needs actual illustration.

### Path B — Authored image assets (where Makko art feeds in)
Replace the primitive drawing with **images** (PNG sprites / vector SVG / backdrop art). Bigger lift:
needs an asset manifest + loader, and the code's `paint*`/`draw*` functions blit the image when one
exists and fall back to primitives when it doesn't. **This is what most "different art styles" will
want** — real illustration for the hand, Moose, the claw, the backgrounds.

> **Decision to make (flag for code):** the game is currently one self-contained file. Image assets
> can either be **base64-embedded** (keeps single-file, but every version's art inflates the HTML —
> keep total well under a few MB for a phone game) or shipped as a **folder of assets + a manifest**
> (cleaner, more art, but no longer one file). Recommendation below in §7.

---

## 4. THE ASSET CATALOG — everything that could carry art

Each item: **what it is**, its **current code implementation**, and **what art could replace it**
(with rough sizing in world units; screen width = 430 units).

### 4.1 The Hand — the player (HERO ASSET)
- **What:** the googly-eyed sticky hand you control. Rotates while winding, flies through the air,
  grabs. Also carries a tiny **loose eye** (Moose's) tucked on its lower-right.
- **Current:** `paintHand()` draws a ~**22-unit-diameter** blob (radius 11) with a radial-gradient
  body; `paintEyes()` draws googly eyes whose pupils **physically track velocity** (they lag/swing as
  you move). 9 identities exist (`FINISHES`): FACTORY RED, MIDNIGHT, BANANA (one-eye cyclops), GHOST
  (translucent), EMBER (fire trail), GILDED, THE OPERATOR'S OWN (chrome), THE REGULAR (green), EMPLOYEE
  OF THE MONTH (gold). Each also has a **motion trail** (stars/afterimage/fire/sparkle) and optional glow.
- **Art notes:** the eyes wobbling is core juice — recommend **a body sprite + keep the eyes
  code-drawn on top** (or a tiny sprite sheet if you want stylized eyes). Needs to read at ~5% of
  screen width, so it must be **bold and simple**. Rotation: the body may spin during the wind — either
  supply a rotation-friendly symmetric sprite or a short spin sheet.
- **Deliverable per style:** 1 hero body sprite (transparent PNG/SVG), ideally + a couple of finish
  variants. ~256×256 px art @ display ~22 units.

### 4.2 The Studs — the grab points (GAMEPLAY-CRITICAL)
- **What:** the pegs you grab. **Three materials, and the material read is a game rule:**
  - **plastic** — solid, grippable forever. (round/square/gem/bolt shape per set)
  - **glass** — translucent, **you CANNOT grab it** (visual trap). Must look see-through/untouchable.
  - **plush** — soft, round, **grip is temporary** (rips loose after 1.5s). Must look soft.
- **Current:** `drawStud()` — plastic ø ~14u, plush ø ~18u (always round + soft highlight), glass ø
  ~16u (16% fill + outline). `STUDSETS` recolor all three + pick a shape.
- **Art notes:** **The 3-material legibility law is sacred** — a player must tell plastic vs glass vs
  plush apart in a glance, mid-fall, at ~4% screen width, or the game breaks. Any illustrated stud set
  must preserve: plastic = solid/opaque, glass = clearly transparent, plush = clearly soft. Tiny —
  favor bold silhouette over detail.
- **Deliverable per style:** 3 material sprites (or a palette+shape data set via Path A). ~96×96 px each.

### 4.3 The Backdrop — the machine interior (BIGGEST STYLE LEVER)
- **What:** what you climb *through* — the inner walls of the machine, one mood per zone, scrolling
  vertically for the whole climb. You stare at this every second.
- **Current:** `themeBG()` paints a **per-zone vertical gradient** (top/bottom color) + `drawMotif()`
  overlays a repeating pattern (banners/embers/stars/runes/snow/bubbles). `BACKDROPS` holds 6+ sets of
  per-zone `{top,bottom,motif}`.
- **Art notes:** **This is the easiest, highest-impact place to feed authored art.** Two options:
  (a) **Data:** just new per-zone gradient palettes + motif choice (Path A, instant).
  (b) **Illustration:** a **tall, seamless-vertical background strip per zone** (parallax-friendly if
  you supply 2–3 depth layers). Must **tile/blend vertically** with no seam, and stay **dark enough
  that the hand + studs pop** on top. 6 zones + a generic "endless" one above the summit.
- **Deliverable per style:** 6–7 zone backgrounds. Seamless vertical. ~430u wide (2–3× for retina,
  so ~1080 px wide × tall). Optional separate parallax layers.

### 4.4 The Claw — "Gerald" (HERO PROP)
- **What:** the machine's claw. Hangs near the top, **descends every 3 seconds and opens/closes.**
  Also a grabbable bar you use in the finale.
- **Current:** `drawClaw()` — a **120-unit-wide** (~28% screen) mechanical claw, animated.
- **Art notes:** wants a real illustration — a big, dumb, iconic claw. Animation is code-driven
  (position + open/close), so supply **an open sprite + a closed sprite** (or a short sheet) and the
  cables/arm as needed. It should read as menacing-but-pathetic, per the story.
- **Deliverable per style:** claw open + closed (transparent). ~512 px wide art @ ~120 units.

### 4.5 Moose — the mentor (STORY HERO)
- **What:** the one-eyed plush you're climbing toward. Appears in the **opening cinematic** and at the
  **summit reunion.** Big, soft, worn.
- **Current:** `iMoose()` draws him from ellipses in the cold-open only.
- **Art notes:** the emotional center of the game — a proper Moose illustration would carry a lot.
  One eye (the other is the one you carry). Ideally 2–3 poses: raising-you (flashback), the sacrifice,
  the summit turn.
- **Deliverable per style:** 1–3 Moose illustrations (transparent). ~512–1024 px.

### 4.6 The pit toys — the supporting cast (OPTIONAL / STORY EXPANSION)
- **What:** Gloria, Palmer, the Colonel, Nana, the King. Currently **text lines only** (they whisper
  while you rest in the pit). Candidates for **portraits or small sprites** if we build out the story.
- **Deliverable per style (optional):** 5 character portraits/sprites.

### 4.7 Quarters / tokens
- **What:** collectible coins (¢) wedged in the machine; they fund the cosmetic shop.
- **Current:** small gold circles.
- **Deliverable:** 1 coin sprite (~48 px) + a pickup pop, or keep primitive.

### 4.8 Effects & juice
- Grab-impact **burst ring**, motion **trail**, screen **flash**, **slow-mo** on clutch saves, **+¢
  pickup pops**. Currently all code-drawn (colors come from the finish). Mostly fine to leave as code;
  a style could supply a particle sprite or two.

### 4.9 UI / HUD / chrome
- **What:** the giant `%` height readout, `BEST`, the **daily countdown clock**, the charge pip,
  buttons, and the panels: fall screen, **share card**, THE MACHINE (shop), THE ARCHIVE, note cards
  (styled as **torn paper scraps**), win screen, THE DAILY GRAB.
- **Current:** HTML/CSS + canvas text, `ui-monospace` font, dark theme, amber/red accents.
- **Art notes:** a style can bring **a font**, a **color scheme**, button/panel framing, and a card
  texture. The **torn-scrap note card** and the **share receipt** are the two surfaces worth real
  design attention.
- **Deliverable per style:** a small UI kit — font choice, palette, button/panel treatment, note-scrap
  texture, HUD numerals.

### 4.10 The share card / daily receipt (VIRALITY SURFACE)
- **What:** the image/text a player sends friends — "call a hand" fall card + the daily emoji-grid
  receipt. **This is what non-players see first**, so its art punches above its weight.
- **Current:** the fall card renders to a canvas image; the daily receipt is an emoji block grid
  (🟧⬛) + stats text.
- **Deliverable per style:** a share-card frame/branding + how the stats/emoji sit in it.

### 4.11 Title / icon / favicon / cold-open
- App title card, the browser-tab **favicon** (currently emoji), and the **opening cinematic** (7
  beats, drawn from `iHand`/`iMoose`/`iClaw`). A style could illustrate the whole cold open.

---

## 5. What defines one "art-style version" (the checklist)

For a version to feel coherent, one style should cover this bundle. Mark each as **Data (Path A)** or
**Art (Path B)** so we know the build cost:

- [ ] **Palette** — the machine's overall color world (backdrops per zone)
- [ ] **The hand** — hero look + eye treatment (+ any finish variants)
- [ ] **The studs** — 3 materials, preserving the plastic/glass/plush read
- [ ] **The claw (Gerald)** — open + closed
- [ ] **Moose** — at least the summit + cold-open pose
- [ ] **Backdrops** — 6 zones + endless (data gradients or illustrated strips)
- [ ] **Effects tint** — trail/burst/flash colors
- [ ] **UI kit** — font, buttons, panels, note scrap, HUD numerals
- [ ] **Share card** — frame/branding
- [ ] *(optional)* pit-toy portraits, full illustrated cold open

**Example direction slots** (for the planning chat to fill — not prescriptive):
neon-arcade / hand-drawn storybook / grimy-realistic claw machine / paper cut-out / vaporwave /
8-bit pixel / clean flat-vector / crayon-kid. Each is a full pass over the checklist above.

---

## 6. Production specs for the art (give these to Makko)

- **Orientation:** portrait, phone-first. World is **430 units wide**; author to that ratio.
- **Format:** **transparent PNG** for sprites/characters; **SVG** is great for crisp/flat/vector styles
  and stays tiny. Backdrops can be PNG (or JPG if fully opaque).
- **Resolution:** author at **2–3× display size** for retina (device DPR is capped at 2.5). E.g. a
  22-unit hand → ~256 px art; a full-width backdrop → ~1080 px wide.
- **Backgrounds:** **seamless top-to-bottom** (the camera scrolls continuously) and **dark/low-contrast
  enough** that the hand and studs read clearly on top. Optional 2–3 parallax depth layers.
- **Studs:** obey the **3-material legibility law** — plastic solid, glass transparent, plush soft —
  distinguishable at a glance at ~4% screen width. Bold silhouettes over fine detail.
- **The hand & small props:** must read at tiny sizes; strong silhouette, few colors.
- **Consistency:** everything sits inside a dark, glowing, coin-op machine — keep a shared light logic
  and palette across a version.
- **Naming:** `style-<name>/<slot>.png`, e.g. `neon/hand.png`, `neon/stud-plastic.png`,
  `neon/bg-reef.png`, `neon/claw-open.png`, `neon/moose-summit.png`. One folder per style.

**Gameplay guardrails art must not break:**
1. Studs must stay legible by material (it's a game rule, not decoration).
2. The hand must stay clearly visible against every backdrop.
3. Nothing changes hitboxes or sizes — art is drawn at the code's world-unit sizes; the collision is
   the code's radius, not the art's edge.

---

## 7. Integration notes for the coding side

- **Recommended model: one asset manifest per style + a loader**, and `paint*`/`draw*` functions that
  **blit the image if the manifest has it, else fall back to the existing primitive.** This lets a
  style be partial (e.g. new backdrops + hand, keep primitive studs) and keeps Path A and Path B
  mixable.
- **Manifest shape (proposed):** `{ style:'neon', hand:'...', studs:{plastic,glass,plush}, bg:{pit,
  spill,reef,gallery,claw_country,cornice,endless}, claw:{open,closed}, moose:{summit,coldopen},
  ui:{font, colors, cardFrame} }` — assets as URLs or base64.
- **Single-file vs folder:** for a couple of light data-reskins, stay single-file. For real
  illustrated styles, go to **`index.html` + an `assets/<style>/` folder + manifest.** Keep per-style
  art lean (phone bandwidth) — target a few hundred KB, not megabytes.
- **Versioning model — recommended: separate deploys per style.** Fork the game per art version
  (`thwap` / `thwap-neon` / `thwap-paper`…), each its own URL, sharing the same engine. Cleanest for
  A/B testing which look actually spreads. (Alternative: one build with an in-game style picker —
  more code, bloats the file with all art; only worth it if switching is a feature.)
- Physics/layout are seed-locked and identical across versions — the tower, hitboxes, and daily seeds
  don't change, so any art version stays comparable and share-compatible with the others.

---

## 8. TL;DR for the planning chat

THWAP is a one-thumb phone climber — a googly-eyed sticky hand ascending an endless, lonely claw
machine, with a secret Pratchett-esque story about a lost plush named Moose. It's **100% code-drawn
today**, so a new "art style" is either **(A) a data reskin** (palettes + peg shapes, instant) or
**(B) authored art** for the hand, studs, backdrops, the claw (Gerald), and Moose. Plan a **complete
bundle** per style using the §5 checklist, hit the §6 specs (portrait, transparent, 2–3× retina,
seamless dark backdrops, 3-material stud legibility), and hand back a **per-style asset folder +
manifest** for the code to wire in. Art is cosmetic only — it never touches physics.
