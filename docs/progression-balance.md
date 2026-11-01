# Progression and economy balance

This is the balance plan for Rootbound's classes, mythic weapons, levelling, economy and letter guardians. Every formula below is what the
game runs. Rootbound pays in **gems** (there is no gold), and items never wear out, so there are no repair costs. The gem sinks are the
store, weapon upgrades at the blacksmith, and mythic forging and ascension.

## 1. A mythic weapon and combo for every class

Every class has its own mythic weapon type. Only the Reaper's is a scythe. Each class also has a three-move combo that no other class
shares. All 39 moves are distinct (`src/js/late/99-zzzzzzzzz-2b-mythmoves.js`).

| Class | Weapon | Playstyle | Move 1 | Move 2 | Move 3 |
|---|---|---|---|---|---|
| Brawler | gauntlets | close rush | Ember Flurry (4 rapid jabs) | Comet Dash (dash through, i-frames) | Meteor Uppercut (launch + fire pillar) |
| Knight | greatsword | guardian | Oath Cleave (huge slow piercing wave) | Aegis (2.5 s, half damage) | Judgement (3 falling light columns) |
| Samurai | katana | precision | Iaido Flash (blink-dash, marked foes burst) | Petal Storm (drifting cyclone) | Thousand Cuts (slash rain) |
| Archer | bow | range | Starpiercer (pierces everything) | Fan of Light (5 arrows) | Starfall (volley from the sky) |
| Mage | staff | control | Arcane Missiles (homing) | Spectral Chains (pull + bind) | Event Horizon (black hole) |
| Demon | blade | risk / lifesteal | Blood Rend (draining tendrils) | Blood Pact (−8% HP: +40% damage + lifesteal, 4 s) | Crimson Moon (meteor; heals per foe hit) |
| Reaper | scythe | souls | Crow Flock | Soul Harvest (×2.2 on foes under 40%; souls heal) | Grave Rupture (line of eruptions) |
| Elementalist | spear | dual element | Glacier Line (freezes) | Flame Geyser (burns) | Prism Nova (fire + frost ring) |
| Stormcaller | hammer | chaining | Chain Lightning (5 jumps) | Thunder Slam (twin ground waves, stun) | Tempest (storm cloud strikes for 1.9 s) |
| Berserker | axe | momentum | Whirlwind (steerable spin) | Earthbreaker Leap (leap + crater) | Blood Rage (+30% damage and attack speed, 5 s) |
| Ninja | chakram | trickery | Shadow Step (teleport behind, ×2 backstab) | Shuriken Orbit (orbit, then scatter) | Ink Clones (two clones cut an X) |
| Druid | branch staff | nature / sustain | Strangling Roots (root + poison) | Thorn Whip (lash + pull) | Healing Bloom (heal 6% + flower ring) |
| Gunslinger | pistol | rapid tricks | Triple Tap (burst) | Ricochet (bounces through 5 foes) | Clockwork Grenade (lobbed explosive) |

Melee weapons sweep a real arc. Each type has its own reach, timing and swing angles. Ranged weapons (bow, pistol, staffs) attack with the
move itself.

## 2. UI and inventory priority

- **Classes screen:**
  - The status orb is the **Equip class** button. It switches to a learned class, or learns and equips a new one when you are allowed to.
  - Every owned weapon card has **Equip**. It is disabled with the reason when level- or class-locked.
  - The Mythic card has **Equip `<weapon>`**.
- **Class emblems:** each class has a round emblem (`MYART.emblem`). It appears on the class rail and on every class weapon in the
  inventory, dimmed for the other classes.
- **Inventory highlight:** your class's weapons get a glow in the class colour and a sweeping shine. Reduced motion turns the shine off.
- **Smart sorting:** your class's weapons always sort to the top, before favourites and before the chosen sort.
- **Per-class loadouts (`LOAD15`):** while you play a class, its equipment (hat, body, wings, boots, gloves), held weapon, full hotbar and
  mythic outfit switch are saved for that class. Switching class stores the old loadout and restores the new class's.

## 3. Levelling and gear pacing

| Curve | Before | Now | Effect |
|---|---|---|---|
| Player XP to next level | 60 + 38·L² | **80 + 45·L² + 0.6·L³** | ×1.3 at L10, ×1.7 at L30, ×2.1 at L60 |
| Class XP to next level | 40 + 22·L² | **60 + 30·L² + 0.4·L³** | ×1.5 to class 10, ×1.9 at 25, ×2.3 at 50 |
| Class level cap | 100 | **75** | |
| Weapon upgrade +1…+10 (+18% damage each) | 120·(l+1)^1.5 gems at level l+2 | **150·(l+1)^1.8 gems at level 3+3l** | +10 costs about 38k gems in total and needs level 30 |

The professions (mining, farming, combat) use the player curve × 0.7.

**Class weapons need class levels by rarity** once you have chosen a class:

| Rarity | Common | Uncommon | Rare | Epic | Legendary | Mythic |
|---|---|---|---|---|---|---|
| Class level | 1 | 8 | 18 | 30 | 42 | 50 |

This sits on top of the existing player-level requirement. The weapon cards in the Classes screen show "Class Lv N".

## 4. Economy

**Income model:** active play at player level L earns about **income(L) = 30 + 4.5·L gems per minute**. This counts monster drops (4–60
gems each by depth), quests, depth activities, chests and bosses.

**Store prices (`ECON14`).** A power item costs about as many minutes of play as its rarity deserves, at the income you have when you can
use it:

```
minutes(rarity)  = common 2 · uncommon 5 · rare 10 · epic 18 · legendary 30 · mythic 50
level(item)      = its level requirement, else the typical level of its rarity (1, 8, 16, 25, 38, 55)
weight(category) = weapons, gear, wings, charms 1 · weather machines 0.8 · effects 0.6
price            = round5( 0.3 × designed price + 0.7 × income(level) × minutes × weight )
```

Blocks, seeds, objects and pets keep their prices, so building stays cheap. Examples:

| Item | Price before | Price now |
|---|---|---|
| Legendary weapon, level 40 | about 1.8–4.2k | about 5.5–6.6k |
| Epic weapon, level 25 | about 0.9–2.8k | about 2.2–2.9k |
| Common weapon | about 60–120 | about 70–90 |

| Stage | Player level | Typical buys | Gems per purchase |
|---|---|---|---|
| Early | 1–10 | commons and uncommons, first upgrades | 70–330 |
| Mid | 10–25 | rares and epics, weather machines | 800–2,900 |
| Late | 25–45 | legendaries, wings, +6…+10 upgrades | 4,000–7,000 |
| Endgame | 45+ | mythic store items, mythic ascensions | 10,000–40,000 |

## 5. Mythic weapon: forge and five upgrades

You forge the mythic weapon at **class level 50**. Each upgrade then unlocks every five class levels, up to the class cap of 75. That is
five upgrades in all (tiers II–VI).

Every upgrade needs three time-consuming things, counted from your last ascension, and each tier asks for more than the one before:

1. **Slay**: monsters slain with this class's weapons.
2. **Boss**: bosses defeated with this class's weapons.
3. **Tribute**: gems plus depth materials. The rarest materials come from the Singing Crystals and the relic vaults, two of each per
   world, so the top tiers send you exploring new worlds.

| Tier | Class level | Slay | Bosses | Gems | Materials | Gives |
|---|---|---|---|---|---|---|
| I (forge) | 50 | — | — | 5,000 | 8 Glowspore, 4 Sun Amber | the weapon and its three-move combo |
| II | 55 | 500 | 2 | 4,000 | 6 Amethyst, 3 Sapphire | +25% damage; first move 30% stronger and wider |
| III | 60 | 1,000 | 3 | 9,000 | 5 Sapphire, 3 Emerald, 1 Resonant Shard | +50%; the finisher is thrown (scythe, axe, hammer, chakram) or strikes again |
| IV | 65 | 1,800 | 5 | 16,000 | 5 Emerald, 3 Starheart, 2 Resonant Shards | +75%; hits echo with bursts |
| V | 70 | 3,000 | 7 | 26,000 | 4 Starheart, 2 Voidstone, 1 Relic | +100%; doubled finisher that heals |
| VI | 75 | 5,000 | 10 | 40,000 | 3 Voidstone, 2 Prismatic, 2 Relics | +125%; Mythic Awakening (effects 20% larger and stronger) |

The class XP curve puts class 50 at about 1.8M class XP and class 75 at about 7M. So the forge is a mid-to-late goal, and Tier VI is a long
endgame chase. Each tier is a clear power jump: +25% damage plus a new mechanic. Every forge and ascension plays a scene you can't skip.

## 6. Letter Wardens (mini-bosses)

Every hidden-word letter is sealed by a mini-boss that rises when you come near it (`GUARD16`).

- **Health:** 400 + 90·L. A mid-strength fight of about 15–30 s, about a third of a full boss at your level.
- **Damage:** 8 + 0.9·L per hit. Armour and Guard apply.
- **Styles:**
  - Charger: wind-up, then a straight dash.
  - Hopper: arcing leaps and a slam on landing.
  - Caster: three slow orbs, and blinks away after a few hits.
- **Reward:**
  - Gems: about 3 minutes of income, 3·(30 + 4.5·L).
  - Player XP: 8% of your current level, 0.08·xpNeed(L).
  - Class XP: 40 + L.
  - A reward card.
- Defeated wardens stay defeated for that world. Creative mode has none.

## 7. Biome worlds

Every normal world (not the Plaza, not an Inferno) is a first-tier world (`BIOME17`). Its hidden word always has **3 letters**, and under
the surface it has **one biome per letter**, in equal bands of **30 depths**. Depth counts tiles below the surface.

| Band | Depth | Holds |
|---|---|---|
| Biome I | 6–36 m | its letter (deep in the band), 3 beacons |
| Biome II | 36–66 m | its letter, 3 beacons |
| Biome III | 66–96 m (its rock runs on to the bedrock) | its letter, 3 beacons |

Each world draws three of six biomes from its name, so the layout is the same on every visit:

| Biome | Blocks | Monsters | Beacons |
|---|---|---|---|
| Verdant Hollow | Moss Rock, Root Loam, moss caverns, glowshrooms | Moss Beetle (armoured walker), Spore Puff (hopper) | Spore Totems |
| Frost Grotto | Frost Rock, Packed Ice, frozen pools, icicles | Frost Slime (hopper), Ice Wisp (flyer) | Frost Lanterns |
| Sunken Dunes | Dune Rock, Dune Sand layers, buried sandstone ruins with urns | Sand Scarab (fast walker), Dust Wraith (flies through rock) | Sun Obelisks |
| Amethyst Geodes | Geode Rock, Amethyst Crystal, hollow geodes | Crystal Golem (tank), Shard Sprite (fast flyer) | Resonant Prisms |
| Tidewater Caves | Reef Rock, Brain Coral, pools | Reef Crab (walker), Glow Jelly (slow flyer) | Tide Shells |
| Cinder Depths | Cinder Rock, Cinder Ash, basalt spires, magma veins | Cinder Toad (big hopper), Flame Moth (flyer) | Ember Braziers |

Biome blocks break into plain blocks: stone, dirt, sand, crystal, coral, basalt and so on. Each biome's ore drops a shard worth 34–44 gems.
The biome's monsters drop it too.

**Biome trial.** Each biome's letter is sealed, and its warden sleeps, until the trial is done. The trial has three parts:

1. **Beacons:** light the biome's 3 beacons. Press E (or hit the beacon) to wake a wave of 3 + band monsters (+1 at 4 stars or more).
   Beat the wave to light the beacon.
2. **Monsters:** defeat 12 / 16 / 20 of the biome's monsters (biomes I / II / III).
3. **Ore:** mine 6 / 8 / 10 of the biome's ore.

**Monster strength:**

```
hp     = base x (1 + 0.07 (L - 1)) x (1 + 0.4 band) x (1 + 0.2 (difficulty - 1))
damage = base x (1 + 0.025 (L - 1)) x (1 + 0.25 band) x (1 + 0.12 (difficulty - 1))
gems   = base x (1 + 0.5 band) x (1 + 0.15 (difficulty - 1))
```

Base health is 26–80 and base damage 6–10. The hardest normal monster has 95 health.

**World difficulty:** every world rolls 1–5 stars from its name:

| Stars | Name | Share of worlds |
|---|---|---|
| 1 | Gentle | 20% |
| 2 | Fair | 25% |
| 3 | Tough | 25% |
| 4 | Fierce | 18% |
| 5 | Mythic | 12% |

**Rewards:**

| Goal | Gems | XP | Class XP | Materials |
|---|---|---|---|---|
| Biome trial | 4 min of income | 5% of a level | 30 + L | — |
| World conquered (all trials + the Word Gate) | (10 + 6·d) min of income | (20 + 8·d)% of a level | 100·d + 3L | 3 Amethyst, 2 Sapphire; +2 Emerald at 2★, +1 Resonant Shard at 3★, +2 Starheart at 4★, +1 Relic and 1 Voidstone at 5★ |

The world reward is paid once per world. At level 15, a 3★ world pays about 2,700 gems and 44% of a level.

Worlds where the letter hunt had already started before this update keep their old word and letter spots. Their biomes and trials still
apply, but the letters there are not sealed. The future higher-tier worlds can use more letters: one 30-depth band per letter.

## 8. Realms

Every world leads on, word by word (`WORD9` chain, `REALM10` themes). Each realm is the world's own terrain remade, and its hidden word
opens the next realm:

| Realm | Enter at | Word | Theme | Monsters (health / damage) |
|---|---|---|---|---|
| The world | any level | 3 letters | its three biomes | biome monsters |
| Inferno | level 15 | 3 letters | ash, basalt, lava | 150–460 / 16–30 |
| Galaxy | level 25 | 4 letters | Stardust, Nebula Rock, Star Crystal, Comet Ore; low gravity | 340–1050 / 26–46 |
| Abyssal Sea | level 35 | 5 letters | under the ocean: swim anywhere; Seabed Silt, Abyss Stone, Glow Anemone, Tidal Ore | 560–1500 / 36–60 |
| Crystal Realm | level 45 | 8 letters | Quartz Sand, Prism Stone, Radiant Crystal, Aurora Ore | 780–2000 / 48–74 |

Each realm has three regions (for example Nebula Fields, Meteor Craters and the Asteroid Belt in the Galaxy), its own sky, music and battle
song. Underground every realm has two biomes, by depth (10-38 m, then 38 m to the bedrock): Ashen Caverns and Molten Core (Inferno),
Nebula Caves and Void Depths (Galaxy), Pearl Grottos and Midnight Trench (Abyssal Sea), Geode Hollows and Frost Prism Depths (Crystal
Realm), each with its own rock, caverns, geodes and ore; the deeper one favours the realm's toughest monster. Realm monsters spawn day or night, never outside their realm, and drop a material worth 90–320 gems. Realm ores drop shards worth
60 / 85 / 120 gems.

**Rewards.** Solving a realm's word pays 160 x (stage + 1)^1.6 gems (stage 1 = Inferno … 4 = Crystal Realm): about 470, 930, 1480 and
2100. The Crystal Realm's word completes the world's **Celestial Ascension**: another 2500 gems.

## Where it lives

| What | File |
|---|---|
| Curves | `src/legacy.html` (`xpNeed`, weapon upgrades), `src/js/late/86-classes.js` (class XP, cap) |
| Rarity gates | `src/js/late/86-z-classjob.js` (`CJOB.creq`) |
| Prices | `src/js/late/99-zzzzzzzzz-4-econ.js` |
| Mythic tiers | `src/js/late/99-zzzzzzzzz-2-mythic.js` |
| Moves | `src/js/late/99-zzzzzzzzz-2b-mythmoves.js` |
| UI | `src/js/late/98-z-classui.js`, `src/js/late/99-zzzzzzzzz-3-mythui.js`, `src/js/late/88-inventory.js` |
| Loadouts | `src/js/late/99-zzzzzzzzz-5-loadout.js` |
| Wardens | `src/js/late/99-zzzzzzzzz-6-guards.js` |
| Biome worlds | `src/js/late/99-zzzzzzzzz-7-biomes.js`, `src/css/96-biomes.css` (word and letters: `99-zzzzzz-words.js`; zone display: `86-z-depths.js`) |
| Realms | `src/js/late/99-zzzzzz-words.js` (chain, words, gates), `src/js/late/99-zzzzzzzzz-c-realms.js` (terrain, skies, monsters), `src/js/late/87-music.js` (songs) |

Tests: `tests/mythic.js`, `tests/guards.js`, `tests/biomes.js`, `tests/classjob.js`, `tests/balance.js`, `tests/realms.js`.
