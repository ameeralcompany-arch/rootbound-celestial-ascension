# The story: how it is built

*The Worlds We Left Behind* was approved on 2026-11-07 (see [story-proposal.md](story-proposal.md)) and built in six stages. Every story beat hangs on something the game already records, so there are no story flags of its own to fall out of step with play.

| What it reads | Where it comes from |
|---|---|
| A realm seen | the world you stand in (`WORD9.stageOf`: 0 first world, 1 Inferno, 2 Galaxy, 3 Abyssal Sea, 4 Crystal Realm) |
| A realm's word spoken | `WORD9.state.w[world].ok` |
| A realm's guardian at rest | `WBOSS13.state.w[world]` |
| Dungeons cleared | `DG.S.clr[id]` |
| Side-story progress | the game's own counters (`stats.break/plant/kill`), `inv`, `night` |

## The modules

| File | What it does |
|---|---|
| `99-zzzzzzzzzz-d-story.js` (STORY1) | **The Journal.** There are 24 story pages in 8 chapters, plus 8 side-story pages, each unlocked by a rule above. It is read from Rootlink (M > Journal). Lavi speaks her recorded line (`st_*`) at key unlocks, but waits while you are in a dungeon run, a boss fight or a film. |
| `99-zzzzzzzzzz-e-town.js` (STORY2) | **The townsfolk remember.** Each townsperson has story lines that unlock with Journal pages. Talking to them plays the first unheard line, once, in their own voice. A gold spark over a townsperson means they have something new to say. |
| `99-zzzzzzzzzz-f-restore.js` (RESTORE1) | **Restoration.** A realm is Silent, then Waking, then Restored. Colour (a CSS filter only in Silent and Waking worlds), music (the `silent` mood, then the realm's own) and warm lights in Restored worlds follow its state. The Plaza gets one lantern strand per restored realm, and a festival with its own music (`festival`) when all five are back. Rootlink shows how many worlds are restored. |
| `99-zzzzzzzzzz-g-side.js` (SIDE1) | **Eight side stories**, offered and handed in by talking to their townsperson, each with a reward and a Journal page: Kevin, The Last Seed, One Perfect Blade, Grandmother's Bread, A Letter by the Water, Lumi's Lantern, The Festival Bell, and The Music Box. The phone lists the ones in progress. |
| `99-zzzzzzzzzz-h-moments.js` (MOMENT1) | **The cinematic moments**, each played once, never blocking the controls. Waking comes when a world remembers its name. Restored is a wave of colour from the player. The ending plays on coming home to the Plaza after the last page; the Journal's last page can play it again. |

## Voices

All voices are Kokoro, the free model that runs on this PC.

- **Lavi:** her story lines are in `tools/voice/fairy-lines.json` (`st_*`). Record them with `node tools/voice/record.js`.
- **Townsfolk:** 35 story lines and 16 side-story lines, one voice per character, in `tools/voice/town-lines.json`. Record them with `node tools/voice/record-town.js`, which writes `audio/town/` and `99-zzzzzzzzz-s5b-town-voice.js`.
- **Bosses:** the three lines that mentioned heaven or a sanctuary were rewritten and re-recorded with `node tools/voice/record.js --set bosses`.

## Religious names

`tools/rename-religious.js` changed display text only, and every internal id stays the same, so saves, items and the server are untouched. It renamed:

- the Nameless Saint to the **Nameless Gardener**;
- the Hollow Sanctuary to the **Hollow Grove**;
- the Temple of Eternal Night to the **Halls of the Eternal Night**;
- the Demon class to **Bloodbound**;
- angels, seraphs, halos, shrines, cathedrals, holy, divine, judgement, heaven and "God mode", all reworded.

The art was cleaned up too:

- dungeon windows no longer form crosses;
- the Gardener's halo is an orbit of leaves, and her robe carries a vine, not a cross;
- the Dragon's Grave swords read as swords;
- the knight's backdrop is a castle and the samurai's is a bridge;
- the mage's circle has no pentagram, and the reaper's graveyard has no crosses.

## Tests

- `tests/story.js`: the Journal, Lavi and the townsfolk, plus a scan for religious words in boss, class, dungeon and story text.
- `tests/side.js`: the side stories.
- `tests/restore.js`: restoration, colour and music.
- `tests/moments.js`: the cinematic moments and the ending.
