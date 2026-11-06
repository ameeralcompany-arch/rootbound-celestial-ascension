# Bosses that control the weather

Every dungeon boss now fights in four phases (75%, 50% and 20% health), with a climate that grows each phase, a voiced line and a short scene when it takes the arena and when it reaches its final form, a final form with its own look, and new signature abilities. Their own entrances, transitions, attacks and deaths are unchanged.

| Boss | Climate | New abilities (phase they arrive) |
|---|---|---|
| The Ancient Sentinel | Arcane storm | Arc Discharge (3) |
| The Infernal Sovereign | Infernal sky | Ashfall (2), Infernal Judgment (3), Crown of the Sun (4) |
| The Frost Empress | Blizzard | Whiteout (2), Frozen Eternity (3), Absolute Zero (4) |
| The Nameless Saint | Corrupted grove | Thorned Grasp (2), Rotbloom (3), The Unnamed Grove (4) |
| Varkhazan | Thunderstorm | Storm Gale (2), Heaven's Judgment (3), Heaven Rends (4) |
| The World Eater (shadow) | Void eclipse | Gravity Collapse (3) |
| The Fallen Star | Arcane storm | Arc Discharge (3) |
| The Eternal Night | Void eclipse | Abyssal Eclipse (2), Gravity Collapse (3), Eternal Eclipse (4) |
| The Hollow King | Thunderstorm | Royal Storm (3) |
| The World Eater | Void eclipse | Gravity Collapse (2), Worldbreaker (3), The Last Silence (4) |

## Files (`src/js/late/99-zzzzzzzzz-…`)

- `t0-boss-climate.js`: the climate engine (`DG.clim`). Presets, intensity per phase, wind, lightning and rods, freezing, darkness and white-out, low gravity, its sound, and drawing in two passes around the warnings.
- `t1-boss-legend.js`: each boss's climate, lore, phase names and abilities (`LEG`), the abilities themselves (`AB`), and the scene at each phase (`enter`).
- `t2-boss-ai.js`: smarter attack choice (distance, play style, ranged classes, hazards already out), never two ultimates within 16 s, a warned counter to a flurry and a guard against a burst.
- `t9-boss-voice.js`: generated from `tools/voice/boss-lines.json` by `node tools/voice/record.js --set bosses`.

## Rules every effect follows

- Anything that hurts is a `DG.fx` hazard with a warning of at least 0.6 s, so it looks and behaves like every other attack, co-op replays it, and `DG.fx.clear()` removes it.
- Wind pushes at less than walking speed. Freezing breaks with four jumps and never lasts more than 1.8 s. Darkness keeps a clear circle around you and is drawn under the warnings.
- The big phase scenes hold the fight for 2.6 s (taking the arena) and 3.4 s (final form), then always hand control back.
- Graphics quality (Settings, or Dungeons > Options, Cinematic effects) changes only how many particles are drawn. `tests/climate.js` checks the same warnings appear on Low and High.
- Dungeons > Options has **Bright flashes** and **Slow-motion moments**, both on by default, next to camera shake.

## Lightning rods and co-op

Heaven Rends puts a mark on a player and raises two rods. Burst the mark on a rod and the lightning strikes the boss instead, stunning it and opening it to extra damage. Alone you lead it yourself; in a pair, one player leads it while the other attacks. The duo mechanics from `r2-dg-duo.js` still run on top.

`tests/climate.js` plays every boss through all four phases and checks each new ability, the mechanics above, the settings, the frame rate and the clean-up.
