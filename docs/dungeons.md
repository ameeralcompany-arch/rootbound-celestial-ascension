# Dungeons

Ten dungeons, level 15 to endgame. A dungeon is a private world on the player's own computer: you leave the room you were in, nothing is written to any world save, and when you leave you return to exactly where you stood. A dropped connection never pulls you out.

| Dungeon | Level | Boss | Unlocked by |
|---|---:|---|---|
| Forgotten Ruins | 15 | The Ancient Sentinel | level |
| Crimson Depths | 20 | The Infernal Sovereign | Forgotten Ruins |
| Frozen Catacombs | 25 | The Frost Empress | Crimson Depths |
| Hollow Sanctuary | 30 | The Nameless Saint | Frozen Catacombs |
| Dragon's Grave | 35 | Varkhazan | Hollow Sanctuary |
| Eternal Abyss | 40 | The World Eater (its shadow) | Dragon's Grave |
| Abyss of the Fallen Star | 60 | The Fallen Star | level, Epic weapon |
| Temple of Eternal Night | 60 | The Eternal Night | Fallen Star + its sigil |
| The Hollow King's Domain | 60 | The Hollow King | Eternal Night + its sigil |
| Throne of the World Eater | 60 | The World Eater | Hollow King + its sigil |

## Files (`src/js/late/`)

- `99-zzzzzzzzz-p0-dg-data.js`: dungeons, difficulties, items, balance formulas, save (`rbdg`).
- `p1-dg-world.js`: the instance, map builder, parkour gadgets, hazards (`DG.fx`), player moves (Shift dash, wall jump, ice), cinematic camera (`DG.cam`).
- `p1b-dg-art.js`: backdrops, furniture, gate, chests, item icons.
- `p2-dg-mobs.js`: monster framework (`DG.mobs.reg`) and the flow of a run. `p3-dg-boss.js`: boss framework (`DG.boss.reg`).
- `p4-dg-ui.js`: Dungeons page, HUD, results. `p5-dg-music.js`: the synthesised score. `p6-dg-cine.js`: the film engine (`DG.cine.reg`). `p7-dg-rewards.js`: drops, chest, forging, wings, plates, titles, weeklies, owner commands.
- `q*-dg-<id>.js`: one file per dungeon: scene, map, monsters, boss, film. `q1-dg-ruins.js` is the pattern to copy.

## Balance

Health is `seconds to kill x damage per second`, not a hand-picked number. Expected damage comes from the rarity band of the gear expected at that dungeon times the level bonus. Abyssal uses the strongest weapon in the game's own table. The player's real damage moves it by a quarter, capped both ways. Damage is a share of expected health. `/dungeontest` shows every number. Real fight lengths are checked by `tests/dungeon-fights.js`.

A jump rises 2.8 rows, so a ledge 3 rows up cannot be reached without a wall or low gravity. `tests/dungeon-trials.js` crosses every trial with real physics; run it after changing a map.

## Art

Everything is canvas drawing. `tools/blender/render_dungeon.py` renders optional far backdrops into `assets/dungeons/<id>-far.webp`; list a picture in `ART.PICS` to use it. The painted layer stays as the fallback.

## Save rule

`99-a-sanitize.js` runs early, before most items are registered, so it sets unknown items aside and `99-zzzzzzzzzz-restore.js` (the last script) gives them back. Keep that file last.
