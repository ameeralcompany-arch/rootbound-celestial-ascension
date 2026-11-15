# Master update 2: audit findings and the plan

This is the audit of the "Master update" brief, written on 2026-11-15 from six read-only investigations. Each section gives the facts first, then the decision.

## Lavi (`99-zzzzzzzzz-s6-lavi-guide.js`, art in `s4`, voice data in `s5`, saved state in `s0` RPG.S)

Why she repeated herself:
- Every tour line was spoken twice: `after()` called `say(lastLine)` again.
- The intro replayed on every reload for a new player.
- The "carry on" offer appeared on every launch: "Not now" was not saved, and its audio did not match its text.
- Reloading, resuming or muting restarted the current step's lines.
- Level-up and unlock reactions had no memory (only an 8 s gap) and played mid-fight.
- She kept talking under the reconnect cover.
- No record was kept of which lines had been heard.

Overlaps: her own lines cut each other off. Town, side-story and boss voices could play over her.

**Decision:**
- A per-account `said` memory: a line is spoken once and comes back as text only.
- Self-offered lines go through a queue: once ever, after 3 calm seconds, 25 s apart, never near a fight, a boss, a film or another voice.
- One voice channel (VOX1).
- Press-and-hold to drag, with the position saved as screen fractions.
- Click opens a menu of real pages.
- Replaying one step leaves the tour progress alone.

## Combat facing

`P.f` is the only facing value. Movement rewrites it every frame (legacy.html:372 `if(ax)P.f=ax`), so a mouse-aimed attack faces the right way for one frame and then snaps back while the move runs. The hit still goes toward the aim.

Other mismatches:
- Root motion (`P.vx=r0.vx*P.f`) lunges toward the movement side.
- Mythic poses use the start facing while the body flips live.
- Guns refuse to aim behind, and bows clamp the arm.
- Each system tests the aim side differently.
- `mx/my` go stale after a zoom.

Remote players never see FIGHT poses: `FIGHT.remote` is never called. They only get the old swing.

**Decision:**
- One attack-facing lock `FIGHT.face()`, set by every attack path. Movement yields to it while it is active.
- One shared aim-side test with a dead zone.
- `mx/my` recomputed every frame.
- The move's facing and aim sent in `cx.fa`, with remote poses wired up.

## World size, Plaza and block size

`T=48, W=256, H=128` are constants. Physics is in px, and saved builds are in tile keys `y*W+x`. Natural terrain is regenerated from (seed, W, H), so changing W or H reshuffles every world. Every world, including the Plaza and dungeons, is 256×128. The Plaza layout is `PLZ7` in `76-plaza3.js`: a street at row 64 across all 256 columns. Zoom `ZM` already exists (0.5–2.2, default 1).

**Decisions:**
- **Bigger blocks:** a higher default zoom (about +14%). One-time move for players still on 100%, and the `0` key resets to the new default. T is unchanged, so saves, collision, parkour and drops are untouched.
- **Bigger Plaza:** grow it inside its 256×128 (W cannot change safely). Add new districts below and above the street:
  - a garden and water terrace with bridges;
  - raised walkways and lookouts;
  - hidden grottoes.
  - Move the Plaza decor tables onto PLZ7 coordinates.
- **Compact normal worlds:** a new generator version `g:3` for newly made worlds only. It has a playable band of about 160 columns with natural walls, the camera, player and monsters kept inside, and points of interest placed closer together. Existing worlds (`g:1` and `g:2`) keep their size and every build.

## Tools

There are five levelled tools (pip, pebble, glimmer, twiggy, bubbles) plus the wrench. They have flat smiley art and a swing that starts a third of the way through. They level 1→10 from use alone, client-side, paying gems, with no cost and no server check.

**Decision:**
- New art per grade (wood or copper, steel, gem-set, celestial) and a proper wind-up, strike and recoil.
- Levelling: use fills the bar, then the forge charges gems plus the tool's own material line to level up.
- The forge is server-validated like the weapon forge (`server/toolforge.js`): request id, from-level check, charged in one step.
- Existing levels are seeded from the saved profile and never lowered.

## Store and cosmetics

The store sells:
- **Looks only:** 16 cosmetics, 35 wings, 35 effects, 15 charms, 16 pets/pet clothes, 8 weather machines (only Neon Rain does anything: it waters crops).
- **Things with a function:** 61 blocks, 18 seeds, 24 objects.

Ownership is kept in several places:
- shop items: `u.shop.owned` and `rbc3`;
- found cosmetics: `u.cos.own`;
- earned wings: `rbcwing` and `DG.S.wings`.

**Decision:**
- Every looks-only item becomes `sale:0` with a real earning rule. The server already refuses `sale:0`.
- The store keeps blocks, seeds, objects, pet care and Neon Rain.
- All ownership checks keep accepting shop-bought items, so nothing owned is lost.
- Sources come from existing systems: achievements, dungeon first clears, world bosses, the Plaza, daily streaks, the Logbook, discoveries, class levels and rare breaking drops.
- Every source is written in `docs/master-update-2/cosmetic-sources.md`.

## Inventory and drops

There is no saved item order, and the whole panel is rebuilt on every count change (`sh.innerHTML`), which:
- resets the scroll;
- breaks drags mid-way (stuck drag flags);
- loses hover.

Keys 1–7 can swap the hotbar by accident. The Equipped strip is hidden at half height.

Dropping online waits behind two confirm dialogs and a full server round trip. Drops can rise into blocks, and the label says E although the key is F.

**Decision:**
- A saved per-tab order with a "My order" sort.
- The sheet is built once and tiles are patched in place.
- Re-renders are grouped and paused during a drag.
- Tiles accept drops: insert, or swap on the centre.
- The categories follow real item kinds.
- Drops show at once as a placeholder that the server answer turns real or takes back.
- One physics step with ceiling and wall checks.
- One confirm, only for precious items.

## UI design system

There are 470 KB of CSS in 56 files, with 1,633 `!important`:
- 55 radii, 247 shadows, 478 gradients;
- core tokens redefined in up to 9 layers;
- rarity colours that disagree between six places;
- four tooltip styles.

**Decision:**
- One `--rb-*` token set: colour, type, spacing, radii, shadows, motion, and one rarity table for CSS and JS.
- A bridge file maps the old variables onto it.
- Shared panel, button and tooltip rules are applied to the existing ids. No markup changes.
- Applied screen by screen, each checked with off-screen screenshots.
