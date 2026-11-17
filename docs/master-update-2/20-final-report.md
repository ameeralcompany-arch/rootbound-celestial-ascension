# Master update 2: final report

- **Brief:** "Master update: world design, Lavi, inventory, UI/UX, exclusive items, wings and gameplay polish" (2026-11-15).
- **Starting point:** 6.13.20, the git tag `checkpoint-before-master-update-2`.
- **Status:** every part below was built and tested in an off-screen browser, with local servers and temporary data. Everything is committed locally and **not pushed or published**.
- **Not yet done:** nobody has played it yet.

## 1. Audit findings
The full audit is in [01-audit.md](01-audit.md). The main causes it found:

- **Lavi repeated herself because of several bugs, not one:**
  - every tour line was said twice;
  - the intro replayed on every reload;
  - the resume offer appeared on every launch;
  - nothing recorded which lines had been heard;
  - reactions had no memory.
- **Combat facing:** walking rewrote the facing on every frame, so an aimed attack snapped back after one frame. Other players never saw anyone's attack poses, skills or emotes, because the code that plays them for others (`FIGHT.remote`) was never called.
- **Inventory:** there was no saved order, and the whole panel was rebuilt on every block placed or picked up. That threw the list back to the top and broke drags halfway.
- **Dropping online:** it waited behind two dialogs and a server round trip, and the server stayed silent when it refused a drop.
- **Tools:** every swing started a third of the way into its animation. Levelling was free and checked only by the game.
- **Styling:** 470 KB of CSS in 56 files, with 55 radii, 247 shadows, rarity colours that disagreed between six places, and four tooltip styles.

## 2. Lavi
- **She speaks each line once.** What she has said is remembered per account, so reloads, reconnects and returning never replay it. A tour step she already explained comes back as text only.
- **Lines she offers herself wait for a calm moment:** 3 quiet seconds and at least 25 s apart. She never speaks near a fight, a boss, a film, the reconnect cover or another voice. Each line is offered once ever.
- **One voice at a time (VOICE1).** Townsfolk, side stories and bosses stop her voice; her words stay on screen. Muting her mid-line doesn't restart it.
- **You can carry her anywhere:** press, hold and drag. She glows softly while held and settles with a small bounce. She stays inside the window, remembers the spot after a reload, and a drag never opens her menu or makes her talk.
- **Clicking her opens a menu of real pages:**
  - what to do next;
  - the beginner guide;
  - dungeons;
  - items and tools;
  - making your gear stronger;
  - the story so far;
  - replaying one tutorial step, without touching your tour progress;
  - going back to her corner;
  - her voice on or off.
- **Tests:** `tests/lavi.js`, 23 checks.

## 3. Combat facing
- **Attacks hold your facing.** An attack, skill, Mythic swing or held gun or bow keeps you facing your aim until it ends. Backing away mid-swing is a careful step: 45% speed, or 70% with a bow or gun so kiting still works.
- **One shared aim test** with a small dead zone, so a cursor right on your body never flickers your facing.
- **The aim is re-read every frame,** so zooming (ultimates, the camera) never leaves it stale.
- **A skill pressed during another move's wind-up** waits up to 0.5 s instead of vanishing.
- **Turning is drawn as a 70 ms squash-turn.** Hit areas and game logic still use the real facing.
- **Multiplayer:** other players now see your moves, emotes and skill effects, with your facing and aim.
- **Tests:** `tests/facing.js` covers all 65 class weapons and Mythics, a plain weapon, a gun and a bow, aiming one way while walking the other.

## 4. The Plaza: the Lantern Gardens
The town street is unchanged. Under it, a garden level about as wide as the street opens up (x 24–232), roughly doubling the Plaza. It is reached by two **Garden Steps** arches on the street. From west to east:

- **Waterfall Nook:** a hidden alcove behind the waterfall, reached by swimming, with a Moon Lily that answers.
- **Willow Walk.**
- **Lantern Stream:** an arched bridge with koi underneath.
- **Flower Meadow.**
- **The Moon Pavilion:** the central meeting place, under Gate Square, with a marble terrace, a fountain, a stone moon gate, benches and lanterns.
- **Bamboo Grove.**
- **Starlight Terrace:** a raised lookout with a telescope.
- **Koi Pond:** with stepping stones.
- **Wisteria Arbor.**
- **Firefly Hollow:** tucked behind a hedge.

Around the whole level:

- **Glass skylights** in the street let people above look down, with daylight shafts at day and lantern glows at night.
- **Five benches** are real seats.
- **Name cards** appear as you enter each part.
- **It reads as the surface:** no mine music, no depth zone, no underground darkness.
- **Cost:** sprites are cached per zoom level, and anything off screen is skipped. A whole frame at the pavilion takes about 1.8 ms in the off-screen renderer.
- **Not done:** no new garden NPCs were added.
- **Tests:** `tests/plaza.js` has 9 new checks: the steps both ways, walking the gardens end to end both ways, the hidden alcove, depth and music, benches, and cost.

## 5. Normal worlds
- **Worlds made from now on are compact:** the same land and village inside a 160-block valley between two cliff faces, instead of 256 blocks.
- **Crossing one on foot** takes about 30 s instead of about 47 s.
- **The cliffs:**
  - They are cut last, so nothing else carves into them.
  - Walking, jumping and flying all stop at them.
  - The camera and monster spawns stay inside.
  - They can't be broken, and the server refuses edits beyond them.
- **Every placement system uses the valley:** biome chambers and beacons, depth rooms, Word letters and sky islands.
- **Kept at full width:** every existing world, with its terrain and builds, plus dungeons, path lands and realms. A terrain check against 6.13.20 shows existing worlds generate block for block the same.
- **Not done:** existing worlds were not trimmed. Doing that could cut off land players explore.
- **Tests:** `tests/worldsize.js`, 13 checks.

## 6. Bigger-looking blocks
- **Blocks look 14% bigger on screen** because the default camera is 14% closer.
- **Nothing else changed:** the grid, block size, collision, physics, saved worlds and dungeon parkour are untouched.
- **Players who never changed their zoom** move to the new default once. Anyone who chose their own keeps it, and the 0 key resets to the new default.
- **Tests:** the navigation, dungeon (163 checks), world-boss and Plaza tests all pass with it.

## 7. Tools
**The art.** Each tool has its own shape:

- Pip is a spade.
- Pebble is a mason's hammer.
- Glimmer is a double pickaxe.
- Twiggy is a bearded axe.
- Bubbles is a rod with a reel.

They come in four grades by level: 1–3 wood and copper, 4–6 steel with a leather grip, 7–9 gem-set with gold fittings, and 10 celestial. Tools now swing through their whole arc; before, the swing started a third of the way in.

**Levelling has to be earned.**

- Using a tool fills its bar. A full bar doesn't level the tool by itself; it is "ready to forge".
- The **Tool Forge**, in the Tool Guide (G), charges gems plus the tool's own material line, rarer at each step, with dungeon materials near the top. That is 7,500 gems per tool in all.
- Online, the server checks and charges every forge (`server/toolforge.js`). A retried request is charged once.
- A short anvil moment with soft strikes plays before the level-up celebration.
- Levels already earned are kept exactly. Levelling no longer pays gems, since forging costs them.

**Tests:** `tests/toolforge.js` has 14 checks; `tests/tools.js` was updated.

## 8. Cosmetics leave the store
- **121 looks** are no longer sold: 35 wings, 35 effects, 15 companions, 13 pets and pet clothes, 16 cosmetics, and 7 weather machines that only change the sky.
- **Each has one themed goal,** harder the rarer it is. Goals use level, monsters, blocks broken or placed, fish, harvests, bosses, worlds, dungeons, world bosses, achievements and classes.
- **The full list** of every look and its source is in [cosmetic-sources.md](cosmetic-sources.md).
- **Kept in the store:** blocks, seeds, objects, pet care, and Neon Rain (it waters crops).
- **The game claims earned looks every 3 seconds.** Online, the server checks the goal and adds the look to what you own. One or two new looks get their own card; more share a single card.
- **Everything already owned stays owned.**
- **The Wings, Collection and store screens** name the goal instead of a price.
- **Tests:** `tests/looks.js` has 10 checks. The store, cosmetics, pet, break-effect and wing tests were updated.

## 9. Exclusive presentation
Every rarity has its own look on backpack tiles, Collection cards and reward cards:

| Rarity | Look |
|---|---|
| Rare | A crisp, cool edge |
| Epic | A breathing violet glow |
| Legendary | A gold edge with a light sweep |
| Mythic | A turning rose-violet edge with drifting glints |
| Exclusive | A prismatic edge over stars |

- **Worn looks show too:** wearing a legendary or better look puts a few slow glints around your character, and others see them.
- **Calm:** none of it flashes, and it stops for anyone who reduces motion.
- **Tests:** `tests/exclusive.js`.

## 10. Item dropping
- **Online, a drop appears at once** in your throw arc and turns into the real drop when the server answers. A refusal floats it back with a note. The server now answers every refusal, including dropping too fast.
- **Fewer dialogs:** only Epic items and above ask "are you sure".
- **No clipping:** drops can't rise into a ceiling or slide into a wall at head height. A drop that starts inside blocks is moved out.
- **Feedback:** a soft landing sound, plus a sparkle in the tier's colour from Rare up.
- **The right key:** the label shows your own Use key, and the E skill key no longer picks things up.
- **Unchanged:** the reward economy and drop rates.
- **Tests:** `tests/dropfeel.js`, and the online test now checks the instant drop.

## 11. Inventory
- **"My order",** now the default, is saved per tab. Move items with Move up / Move down, Alt + arrows, or by dragging a tile onto another: the left part puts it before, the right part after, the middle swaps.
- **The real bug is fixed:**
  - the game's refreshes run once a frame at most;
  - they wait for a drag to finish;
  - they skip when nothing visible changed;
  - they keep the grid's scroll.
- **Number keys:** keys 1–7 file an item into a slot only while your pointer is over the backpack.
- **Tabs by purpose:** Equipment, Wearables, Tools, Materials, Blocks, Seeds, Consumables, Special. Old tab names open the nearest one.
- **New sorts:** type and upgrade level. "Newest first" now also follows items you pick up again.
- **The bottom drawer** already slid up smoothly; it now stays smooth because the panel isn't rebuilt on every change. The Equipped strip shows at half height.
- **Tests:** `tests/invorder.js`. The inventory and equipment-menu tests were updated.

## 12. New wings
Ten wings, each with its own shape, palette, sparkle and trail. All are earned, never sold.

| Wing | Rarity | Theme | Goal |
|---|---|---|---|
| Prismheart Facets | Epic | Crystal | 16 Discoveries |
| Lumen Cascade | Legendary | Celestial light | 6 dungeons cleared |
| Emberhorn Membrane | Legendary | Demonic | 25 bosses defeated |
| Snow Owl Mantle | Rare | Feathered | 1,500 monsters defeated |
| Moonmoth Veil | Epic | Butterfly | 300 fish caught |
| Vector Array | Epic | Futuristic | 60 elites defeated |
| Camellia Bloom | Rare | Floral | 10,000 blocks placed |
| Gossamer Drift | Legendary | Ethereal | 22 Discoveries |
| Origami Crane | Rare | Unusual | Level 40 |
| Dawnbreaker Regalia | Mythic | Endgame | Level 120, 4 world bosses and the Gossamer Drift |

They use the existing wing animation system: unfolding, flapping, gliding, landing, and the flight bend and bank. They are added at the end of the wing list, so no existing wing changes.

## 13. One visual language
- **Tokens:** `01-tokens.css` defines night surfaces, ivory text, one gold for primary actions, one rarity table, a type scale, spacing, four radii, three shadows and four motion speeds.
- **The bridge:** `99-zzzzzzzzzz-unify.css` points every older variable at the tokens. It gives the big panels one radius, hairline, shadow and a near-solid surface, so the world no longer shows through their text. It also unifies four tooltip styles and the primary buttons, and adds a visible focus ring.
- **The game canvas** uses the same rarity colours, and the bundled Montserrat font in place of a font that only loaded online.
- **Fixed along the way** (both already broken in 6.13.20):
  - the new Collection window never closed when another window opened;
  - the skill buttons overlapped the hotbar on windows under 980 px.
- **Not done:** the 56 CSS files were not rewritten one by one. The bridge brings them in line without changing any layout or element id.

## 14. Performance
- **The Lantern Gardens:** a whole frame at the pavilion took 1.8 ms in the off-screen renderer.
- **Cheap additions:**
  - Lavi parks at 30 fps;
  - wearer glints are three small sprites;
  - tier edges are CSS;
  - the inventory no longer rebuilds on every change.
- **Before and after:** walking through the Plaza and a normal world (perfbase), measured on the build that also has the world-building update, same save and same screen. These are main-thread script time per second of play; lower is better. Both builds reach about 143 fps off-screen.

  | | 6.13.20 | Now |
  |---|---|---|
  | Plaza | 325–533 ms/s | 327–331 ms/s |
  | A normal world | 297–507 ms/s | 260–265 ms/s |

  The 6.13.20 range is wide because the earlier runs were taken on a busy machine.
- **The packaged game on a copy of your saves** (`realult`): 144 fps on the login screen and in the online Plaza, with no page errors. The two "load aborted" lines in its log appear the same way in 6.13.20.

## 15. Multiplayer
- **Facing travels with each move,** and other players' moves and emotes now play on them.
- **Server-checked:** tool forging, earned looks and drop answers.
- **Online suites:** the online, online-server, online-mobs, server, accounts and economy tests pass. Two tests do not, and both fail the same way on 6.13.20:
  - the owner test stops while the page reloads after signing in;
  - netstress can't load its pages through its own proxy here.

## 16. Preserved
- **Saves and worlds:** every account and save, every existing world's terrain and builds.
- **Ownership:** every owned item, including looks bought before, and every tool level.
- **Systems:** combat, classes, weapons, progression, the story and the dungeons. The dungeon (163 checks), boss (150) and world-boss suites pass.

## 17. Known issues and unfinished work
- **Nobody has played this yet.**
- **Not done:**
  - no new garden NPCs;
  - existing worlds were not trimmed;
  - the CSS files were bridged, not rewritten;
  - the ten new wings reuse the existing wing families rather than new hand-drawn painters.
- **The full test run** covered all 99 test files, run one after another. Every failure was rerun against 6.13.20:
  - **Regressions from this update, found and fixed:**
    - The new solid panels lost to an older glass rule on several screens, and they ignored the "Low shadows" setting.
    - Summer seats, floaties and treasure chests were placed before the new valley cliffs were cut, so some ended up inside rock.
    - New weapons of your class were buried under "My order" in the backpack.
  - **Tests that expected the old design, updated:** looks and charms are earned now, not bought; new worlds are compact, so tests built beyond the cliffs; the shared panel is near-solid with 20 px corners; there are 50 exclusive wings.
  - **One known issue left:** a compact world's realms (the Inferno and the others) are still generated full width, so a new compact world's Inferno is not the same land, burnt, as the world itself (`tests/words.js`). Making realms follow their base world needs a server change, and it must not touch existing realms. It is left as a follow-up.
- **Test failures that already happen on 6.13.20, unchanged by this update:**
  - the store's music-mood check;
  - three hotbar checks for under-level weapons;
  - the arsenal "three attacks chain" check (the test's character starts a pixel in the air);
  - the end-to-end test's own time limit;
  - balance (three dungeon weapons' power by level);
  - dungeon-trials (the bot can't finish three trials);
  - qol ("You can buy now" shelf);
  - restore (a guardian's colour filter);
  - the owner and netstress tests (see Multiplayer above);
  - two water checks (the "Press E" prompt wording and the Plaza pier).
- **Fixed along the way:** the worldlife check found a set named "Crimson Covenant", a religious word, in 6.13.20 too. It is now "Crimson Nocturne" (same items, only the name changed).
- **Old clients:** online, a player still on 6.13.20 inside a new compact world sees the full-width land, because the old version doesn't know the valley. Publishing the new version fixes this.
