# Progression: Level → Dungeons → Materials → Upgrades → Combat Power

All of this is one loop, and every number you might want to change is in `RPG.CFG` at the top of `src/js/late/99-zzzzzzzzz-s0-rpg-core.js`.

| File (`src/js/late/99-zzzzzzzzz-…`) | What it does |
|---|---|
| `s0-rpg-core.js` | The numbers, Combat Power, who may enter a dungeon, the save (`rbrpg`) |
| `s1-rpg-forge.js` | The weapon forge, solo dungeon gems |
| `s2-rpg-items.js` | What every item is for, read from the real recipes and drop tables; the item card |
| `s3-rpg-path.js` | "What should I grind next?", the roadmap, the dungeon page's requirements and rewards, the CP counter |
| `s4-lavi-art.js`, `s5-lavi-voice.js`, `s6-lavi-guide.js` | Lavi: drawing, voice timings (generated), behaviour and tutorial |

## Combat Power

`CP = 1.6 x weapon power x enhancement x progression x gear`

- **Weapon power** is `WPOWER`, measured from the weapon's real attacks: damage, speed, reach. A fast weapon and a heavy one score by what they deal over time.
- **Enhancement, progression, gear** use the same values as `dmgM`, `LVL9` and `CLASS7`, the code that deals real damage. Crits use the real odds. Effective health counts on a quarter-power curve.
- Class levels count through `g`, the same total value for every class, not through each class's own perk. That is what keeps classes equal. `tests/rpg.js` holds every class within 15% at five stages of equal investment.
- A dungeon you have already cleared stays open, so no later balance change can lock anyone out of their progress.

## Enhancement

`enhCost` lists the price of each level. **`server/enhance.js` holds the same table**, because the server does the charging: change both, and `tests/rpg.js` fails if they differ.

- +1 to +3 need only Stone and gems, so a new player can reach the 200 CP the first dungeon asks for. After that, each band needs dungeon materials.
- An upgrade cannot fail, and never removes a level. Old upgrades keep their level and are not charged again.
- Damage per level is `enhDmg`: +18% to +10, then +6%. The old engine's `upDmg` reads it.
- Tools keep their old Stone-and-gems upgrade at the smith.

## What the server can and can't protect

The server charges upgrades against its ledger once, and answers a retry from its record (`u.enh`, `u.enhRid`). It caps how fast dungeon materials can appear (`DG_PER_MIN` in `server/economy.js`), and limits what a solo clear pays (`dgs`, `DG_DAY`). Fights still run on the player's computer, so a modified client can still claim a clear it did not earn, up to those limits. It cannot invent materials beyond them or spend them twice. Guests have no ledger.

## Lavi

Her lines are in `tools/voice/fairy-lines.json`. Run `tools/voice/record.js` after changing one: it re-records only what changed. It needs Kokoro (`kokoro-js`) installed outside the repo; see the top of the script. A recording can't say a player's name, so `{name}` appears in the subtitle only. Automated browsers don't start her by themselves unless `localStorage.rb_lavi_test` is set.
