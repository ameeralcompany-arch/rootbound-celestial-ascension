# Ultimate update: final report

- **Started:** 2026-11-13, from the checkpoint tag `checkpoint-before-ultimate-update` (6.13.19, b29999b).
- **Status:** everything below is built and tested by automated players in an off-screen browser and against local servers.
- **Released:** pushed to the live server on 2026-11-13 (9da374f) and published as 6.13.20 with the fixes from the release check (section 2). No human has played any of it yet.
- **Audio:** this update also covers the signature audio direction ("smooth, chill and satisfying").

## 1. Completed features

### Economy and progression
- **Weapons and gear are earned by playing, not sold.**
  - Each class has a weapon ladder by class level. For example, the Knight gets Emberbrand at 1, Glacial Edge at 11, Skyspear at 21, Tidecaller at 31 and Solar Fang at 41.
  - Stat gear is earned by player level, or by class level for the class sets.
  - A newly earned weapon is equipped automatically if it is better than the one you hold. You keep everything you had.
  - An unlock card shows what you earned.
  - The server records each earned item and checks the class and level, so no other class's weapons ever come along.
  - The inventory says how each one is earned, for example "Earned at Gunslinger level 36".
- **The store is cosmetic-only.**
  - It opens on the seven cosmetic collections, each marked "looks only, no stats".
  - It also sells wings, effects, charms, pets, weather and blocks, as before.
  - **Wings are looks only now.** Every wing flies the same at the same level, and flight grows with your level (at level 150 about 2.8 times higher than at level 1). A legendary or mythic wing keeps its own trail, flakes, rings and motes, but no longer flies higher than an epic one.
  - The server refuses any weapon, gear or rare-find purchase with "This is earned by playing, not sold".

### Cosmetics
- **30 hand-drawn cosmetics in 7 collections:**
  - Mochi Dreams
  - Crimson Covenant
  - Silver Moon Court
  - Sakura Festival
  - Nebula Drift
  - Sunken Empire
  - Wanderer of Mist
- **Slots:** full costumes, outfits, hats, masks, hair accessories and back pieces.
- **Fit:** every piece is drawn on the real character. It fits all three body types and moves with standing, running and jumping.
- **Over gear:** suits and hats hide the worn gear's look.
- **Others see only what you own:** the server removes anything you don't own from what others are sent.

### Rare finds from breaking, decided by the server
- **The odds:**

  | Tier | Chance per counted break |
  |---|---|
  | Ultra-exclusive | 0.01% |
  | Mythical | 0.02% |
  | Extremely rare | 0.05% |
  | Very rare | 0.10% |
  | Rare | 0.50% |

- **Rolling:** the server rolls with `crypto.randomInt`. A break counts only if it is a real break of a natural tile, near you, and at most 60 a minute and 4,000 a day per account.
- **Duplicates:** you never get one. If you own a whole tier, you get a find from the next tier down; if you own every findable cosmetic, you get gems instead.
- **Safety:** each find is saved at once, numbered ("number 3 ever found"), recorded in the audit log, and sent again until the game confirms it.
- **Announcement:** the two rarest tiers are announced to everyone online.
- **Discovery:** a full-screen moment with a beam, your character wearing the find, the odds, and "Wear it now".
- **The Collection:** every cosmetic, owned or not, with:
  - a live try-on;
  - rarity, set and where it comes from (the store and its price, or breaking and its exact odds);
  - Wear and Take off buttons;
  - completion per collection;
  - the odds and the duplicate rule written out in full.
- **Future real-money purchases:** one server door, `grantEnt`, is idempotent by transaction ID. No payment provider is connected; that decision was left open.

### The Plaza
- **"CHOOSE YOUR PATH" arrows:** glowing, bobbing arrows over the 13 class masters until you choose a class.
  - After that, only your own master keeps a "YOUR MASTER" marker, and masters of classes you could learn next show a faint arrow.
  - With no master on screen, a pointer at the edge of the screen shows the way.
- **Decorations:** cherry trees in the gaps between the houses with petals drifting down the street, and paper lantern posts that glow at dusk.
- **Benches:** three new benches you can sit on, and other players now see you sitting.
- **Mochi:** a sleepy cat on a bench who reads you one fortune a day.
- **Golden petals:** they fall now and then; catch them for a chime and a count of today's catch.
- **Body emotes everyone can see:** wave, dance, cheer, heart, bow, laugh and think.
  - Two players doing the same emote together are "in sync", shown by a burst of light.
- **Server-paid Plaza rewards:** each pays once per account and only in the Plaza:
  - Spirit Stones: 50 gems each, and 500 for all seven.
  - Sky Run under 90 seconds: 150 gems.
  - Before this update, these were paid on the player's computer.

### Dungeons
- **Stray chests:** the cave chests and relic vaults of the world you came from no longer appear in dungeons. The dungeons' own chests stay.
- **Dash:** the class dash (Shift) now gets through dash gates. Before, it bounced off every one.
  - It also works on laser walls, the ice cage and the orb dodge.
  - A dash that ended a moment before a gate still carries you through.
- **Prompts:** dungeon prompts show your Use key (F), not E, which is now a skill key.
- **Two-player fixes:**
  - Your friend is pulled into the boss room before it locks. Before, the second player could be locked outside.
  - The first fight waits up to 20 s for your friend to arrive.
  - The puzzle pad takes you both down to the chamber.
  - If your friend leaves, the dungeon adjusts to one player.
  - The revive hold uses your Use key.
  - A boss phase missed during a dropped connection is caught up on return.

### Sound: the smooth, chill identity
- **One mixing desk for every sound engine** (effects, interface, music, bosses, the login film). It:
  - gently cuts the harsh band around 3 kHz and the brittle top above 6 kHz;
  - keeps the low end clean;
  - "glues" loud moments with a soft compressor;
  - ends with a limiter, so nothing can clip;
  - plays at the loudness the game was made at, never louder (its output takes back the volume the browser's compressors add).
- **A softer synth for the hundreds of game sounds:** no clicks, no raw buzzing square or saw waves, a slightly different pitch on each repeat, and at most 28 sounds at once. The dull 420 Hz muffle on noise sounds is gone.
- **Weapon sound profiles** for every weapon type, each one layered sound:
  - fast blades: an airy whoosh and a clean slice;
  - heavy weapons: warm, deep air and a gentle low note;
  - scythes: a sweeping wind with a dark resonance;
  - magic: crystal tones;
  - bows: a soft string;
  - guns: a round pop.
  - Element touches: ice, fire, storm, starlight and nature, plus a warm low undertone for demonic weapons.
  - Three rotating variations, with very fast weapons sounding on every other shot.
- **Clean impacts** for your own hits, and a soft chime when a monster falls.
- **Picking things up:** a soft pluck that climbs a pentatonic scale while you collect several in a row, and a brighter bell for gems.
  - At most one note every 60 ms.
  - It replaces the fixed-pitch blip, which had no limit.
- **Unchanged:** the breaking sounds (each material already had its own soft sound) and the interface sounds (already soft) were kept, and now pass through the mixing desk.
- **A different ultimate sound for each of the 13 classes**, timed to its own strikes:
  - a smooth build-up while the music dips;
  - a clean release on each strike, the last one the biggest;
  - controlled low notes;
  - a long fade.
  - Instruments include koto plucks, crystal bells, taiko, wind chimes, flute, a dark pad and soft thunder.
- **Ambience:** gentle wind and birds by day, crickets at night, and a low hum with water drops underground and in dungeons. It follows the Ambience slider.
- **Music:**
  - It changes mood with a dip and a swell instead of silence.
  - The class theme no longer flips on every skill: it plays near your class house, on the Classes page and in boss fights.

### Marketing
- **The $0 marketing pack** is in [08-marketing-pack.md](08-marketing-pack.md).

## 2. Fixed bugs
- The odds table the server reported was cumulative (0.03% for Mythical, and so on). It now reports each tier's own chance.
- Old-world chests and relic vaults showed up, unopenable, inside dungeons.
- The class dash bounced off every dash gate, so the parkour trials needed the old dash.
- The second player in co-op was locked outside the boss arena.
- Leaving a co-op dungeon left the other player stuck at two-player gates.
- Dungeon prompts said E (a skill key) for actions bound to F.
- The inventory still said "You need N more gems" for items the store no longer sells.
- The Collection's cards were shorter than their text.
- The rare-find screen let tutorial banners show through.
- Things this update itself broke were found and fixed by its tests before the end. These include:
  - a load-order mistake that stopped dungeons loading;
  - a name clash between the new class arrows and the existing guide path;
  - the revive key check.
- **Found by the release check (the packaged game on a copy of a real save), fixed in 6.13.20:**
  - **The mixing desk was bypassed.** Its "installed" mark was set where every sound node inherits it, so every sound looked like part of the desk and skipped it. The first audio test missed this because it built the desk by hand before measuring. The sound now really goes through the desk, the audio test proves it (a real sound has to build the desk, and every measured recording is checked), and the desk's output was set so the game is no louder than before.
  - **Holding a class-skill key (X, C, Q, E…) did not skip a world boss's opening film**: it fired the skill underneath instead. This was already in 6.13.19. The skill keys now stand aside during that film, as they already did for the other films.
  - **The wings test still expected the old rule** that rarer wings fly higher. It was rewritten to the looks-only rule above (it had not been run during the update).

## 3. Preserved systems
- **Online-only:** unchanged, and the login screen is untouched.
- **Player data:** never deleted. Every weapon a player owns stays owned, and all saves load.
- **Wings, effects, charms, pets, weather and blocks:** still sold, as before.
- **Unchanged areas:**
  - dungeons, bosses and fights;
  - classes and evolutions;
  - the story, the Journal and Lavi;
  - the forge;
  - the Sky Run and the Spirit Stones (only the payout moved to the server).
- **No pay-to-win:** cosmetics have zero stats. Buying cosmetics never changes the rare-find odds.

## 4. New assets
- **Code-drawn art:** 30 cosmetics (7 files), Plaza decorations (cherry tree, lantern post, Mochi), class-master arrows, and the find and Collection screens.
- **Code-built sound:** the mixing desk, the soft synth, weapon, impact and ultimate sounds, and ambience.
- **Re-recorded voice:** one fairy line ("stronger"), because weapons are earned now.

## 5. Tests and results
All tests run off-screen: headless browsers, local servers and temporary data only.

**New tests:**

| Test | Checks | Result |
|---|---|---|
| `tests/cosmetics.js` (server, no browser) | 38 | all pass |
| `tests/dg-fixes.js` | 12 | all pass |
| `tests/plaza-life.js` | 18 | all pass |
| `tests/audio.js` | 12 | all pass |

- **`tests/cosmetics.js` covers:**
  - the odds over 2,000,000 server rolls;
  - what never counts as a break;
  - finds being saved, numbered and announced;
  - the duplicate rule, walking down the tiers to gems;
  - the 60-a-minute cap;
  - others seeing only cosmetics you own;
  - the store refusing weapons, gear and finds;
  - earned weapons needing the right class and level;
  - resending after a restart;
  - the idempotent purchase door;
  - server-paid Plaza rewards.
- **`tests/dg-fixes.js` covers:** no old-world chests or vaults in dungeons, the class dash through gates, walking into a gate still bouncing you back, and prompts naming the Use key.
- **`tests/plaza-life.js` covers:**
  - the class-master arrows and the edge pointer;
  - emotes as body moves, sent to and played on others, and "in sync";
  - sitting sent to others and validated;
  - the new benches being real seats;
  - Mochi's fortune;
  - golden petals;
  - the Plaza layer drawing in under 4 ms.
- **`tests/audio.js` covers** a 150-second offline soak of 363 attacks with every weapon kind:

  | Measure | Result |
  |---|---|
  | Peak | 0.06, far under full scale |
  | Harsh band (2.5-5 kHz) | 2.3% of the energy (5.7% without the desk) |
  | Above 8 kHz | 0.04% (0.14% without the desk) |

  It also checks that the game's own sounds build and use the desk, that all 13 ultimates are distinct, audible and under full scale (harsh band at most 6%), that pickups are audible, that the music dips and comes back, and that the ambience follows the place. 14 checks, all pass.

**Existing suites:**

| Suite | Result |
|---|---|
| Two-player dungeons (`duo`) | 67 pass |
| Login and online-only | 21 pass |
| Security | 62 pass |
| Online server | 114 pass |
| Online play | 49 pass |
| RPG | 61 pass |
| Dungeons | 163 pass |
| Depths | 41 pass |
| Chests | 28 pass |
| Class job | 23 pass |
| Arsenal | 19 pass |
| Creative | 18 pass |
| Outfits | 8 pass |
| Plaza | 19 pass |
| NPC | 9 pass |
| Keys | 10 pass |

**Older tests rewritten to the new rules** (weapons and gear are earned; the store sells cosmetics):

| Suite | Result |
|---|---|
| `store` | 40 pass, 1 existing failure |
| `combat` | all pass |
| `inventory` | 33 pass |
| `gear` | 12 pass |
| `economy` | 39 pass |
| `e2e` | every check reached passes |
| `wings` (looks-only flight) | all pass |

**Rechecked for the release:** login 21, boot 10, cosmetics 38, cinematics 21, bosses 150, world bosses (with the skip fix) all pass, combat and Plaza life all pass.

**Not caused by this update:**
- **Store music-mood check:** it fails the same way on the published version 6.13.19.
- **`e2e`:** it stops at its own 280-second time limit on 6.13.19 too.

## 6. Performance
### The game-wide performance soak (`tests/perfsoak.js`)
- **Load:** a minute of mining, weapon spam, monster floods, boss fights, and rain switching off and on.
- **Frame rate:** 130 fps at the start, 143 at the end.
- **Memory:** retained heap flat, 26.4 to 27.0 MB.
- **Page:** DOM, timers and listeners flat.
- **Monsters:** they stayed under the ceiling.
- **Result:** all pass.

### Cosmetics in a crowd
- **Measure:** canvas operations counted per character draw.
- **Plain character:** about 680 operations.
- **What was expensive:** the one-pixel cel-shading edge (a clip per shape) and gradients re-created every frame.
- **What changed:**
  - Glows now come from cached sprites. The Nebula Gown went from about 16 gradient creations per draw to 1.
  - Shade colours are remembered.
  - With 9 or more players around, or on Low quality, other players' cosmetics draw flat. This halves the heaviest outfits: the Nebula Gown is about 530 weighted operations in a crowd.
  - Your own character and every try-on always draw in full detail.
- **The Plaza layer** (trees, posts, Mochi, petals and the town's people) draws in under 4 ms.

### Sound
- **Voices:** at most 28 at once.
- **Clipping:** none over a 150-second attack soak (the peak is 0.06 of full scale).
- **Mixing desk:** one per audio engine, created once. In the packaged game on a real save it ran at 143-144 fps on the login screen and in the Plaza.

### Multiplayer
Every server and online suite passes on local servers:

| Suite | Checks |
|---|---|
| Security | 62 |
| Online server | 114 |
| Online play | 49 |
| Login | 21 |
| Two-player dungeons | 67 |
| Cosmetics server | 38 |

The live server took this update on 2026-11-13 and answered healthy after its restart.

## 7. Unfinished work (honest list)
- **Phase 5 (movement, physics, animation, skill VFX): not reworked.**
  - The existing systems were kept: dust, squash, class dashes and skills.
  - Only the body emotes were added.
  - Physics was deliberately left alone, because the dungeon parkour bots and trials depend on its exact numbers.
- **Music:**
  - No new composed Japanese-inspired songs were added. The existing generated music already includes a Japanese pentatonic scale; only crossfades, ducking and the class-theme fix were done.
  - Breaking sounds were softened only through the shared synth and the desk. The mining sound set itself was not redesigned.
- **Plaza:**
  - There is no fountain: the town has no free ground wide enough near the World Gate.
  - The Spirit Stones are the only secrets; no new secrets or mini-games were added beyond golden petals.
- **"Creative freedom with validation":** the existing Creative mode is unchanged.
- **Real-money cosmetics:** only the server door (`grantEnt`) exists. No store, payment provider or price list is connected.
- **Platform-wide tests:** older tests that assumed weapons are bought were rewritten to the new rules. `tests/e2e.js` runs out of its own time limit after its checks, the same as on the published version, so this is not caused by this update.

## 8. Known issues and risks
- **Unseen by a human:** nobody has seen or heard any of this in real play yet. Rare-find announcements and duo dungeons need real players.
- **Old saves:** players whose gear was bought before the update keep it. The first time an existing player loads, the guide's one-time goals ("Hold your class weapon", "Reach 200 Combat Power") may pay out together, because earned weapons can complete them at once.
- **Wing owners:** players who bought a legendary or mythic wing for its flight lose that edge. The wing keeps its look and its trail effects.
- **The first second of sound:** a fresh desk's compressor opens over its first second, so the very first sound after the game starts can be a little softer.
- **Cosmetic cost in crowds:** with 9 or more other players around (or on Low quality), other players' cosmetics draw with flat shading. That looks the same at game size, but it is a little simpler.
- **Fake breaks:** the server cannot see terrain, so a modified client could fake "natural" breaks. The caps (60 a minute, 4,000 a day, and only near the player) limit this to what a fast real player could reach anyway.

## 9. Marketing package
See [08-marketing-pack.md](08-marketing-pack.md). It has:
- 30 video ideas;
- 10 full 9:16 scripts;
- captions;
- hashtag sets;
- a free capture and edit workflow;
- a 4-week posting rhythm;
- honesty rules.
