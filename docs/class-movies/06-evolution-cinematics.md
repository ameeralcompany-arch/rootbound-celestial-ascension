# Evolution cinematics: 20 seconds for each class

After seeing the Reaper's 3:36 story movie, you asked for something else: the evolution cinematic should be 20 seconds, fast and engaging, with moments that depend on the class. All 13 classes now have one, and each plays the moment you evolve.

The long Reaper film is out of the game. It is kept in `tools/movie/archive/reaper-film/` (see its README), not deleted.

## The shape: one timeline, thirteen classes

Every class uses the same 12-shot timeline (`EVC1.TL`), so every score lands on the same beats. What fills each shot is the class's own.

| Time | Shot | What happens |
|---|---|---|
| 0.0–1.3 | Spark | The Mythic in extreme close-up; a line of the class's light runs its length |
| 1.3–2.3 | Eyes | The eyes open with the class's mark in the irises; an impact frame as they flare |
| 2.3–4.7 | Gather | The hero, still plain, in the class's own place; its aura closes in, the wind rises, the floor sigil starts |
| 4.7–5.5 | Sigil | A low camera as the class's sigil races across the ground |
| 5.5–8.2 | Three pieces | Three close-ups, 0.9 s each; one piece of the new look grows in per shot |
| 8.2–9.1 | Peak | A black silhouette against the class's light. **The evolution is granted here.** |
| 9.1–11.7 | Hero | The evolved hero: the poster frame |
| 11.7–12.5 | Wind-up | Tight on the face; eyes narrow; speed lines |
| 12.5–15.3 | Signature move | The class's own move, with up to three impacts |
| 15.3–20.0 | Title | The evolution's name and line, then fade to black |

## Each class

| Class | Evolution | Its place, look and move |
|---|---|---|
| Knight | Aurelian Vanguard | Dawn over a broken rampart; columns of light; a sword-compass sigil. Steel breastplate and pauldrons, a gold winged crest, a red cape. **Dawnbreak:** a leap and slam, and a wall of light runs across the ground, raising pillars. |
| Samurai | Hanakage Ronin | A cherry road at dusk. Lacquered shoulder guards and obi, a headband with a swept crest, a petal-printed haori. **Iai:** the world drains to grey, one draw, the blade goes home with a click, and every petal on screen splits in two. |
| Archer | Galewarden | Windswept highland grass. A leaf circlet and a wind-torn mantle. **Galeshot:** one arrow inside a widening gale spiral that tears the clouds. |
| Mage | Starwright | An observatory terrace under stars; an astrolabe sigil. A tall swept hat, a star-cloth collar, a rune ring at the waist. **Starfall:** equations written in the air collapse into one point, and a star falls. |
| Bloodbound (demon) | Sanguine Regent | A crimson wasteland. Horns, a high collar, wings. **Crimson Verdict:** a dash that carves a huge blood-red crescent, which fractures into a storm of drops. |
| Elementalist | Primal Conduit | A volcano and an ice field together; a four-colour sigil. A split coat, a feathered circlet, orbiting elements. **Convergence:** four streams meet on the spear point and detonate, then fire, ice, wind and earth erupt from the ground. |
| Stormcaller | Tempest Herald | A storm over standing rocks. A lightning crown, a storm-cloud mantle, a bolt emblem. **Skyfall:** the sky strikes the raised hammer, a slam sends a discharge across the ground, and it erupts back into the clouds. |
| Berserker | Ashen Warlord | A volcanic plain. A horned war helm, fur pauldrons, war paint. **Cinderfall:** an overhead slam that cracks the ground into magma fissures, which erupt. |
| Ninja | Voidstep Phantom | Bamboo by moonlit water. A hood, a face mask, trailing ribbons. **Voidstep:** the body breaks into ink, the world turns to pale paper, black cuts land one after another, then all open at once. |
| Druid | Elder Wildheart | A deep forest with light shafts. Antler branches, a leaf mantle, a moss cloak. **Rootwake:** the staff is driven into the earth, and a wave of giant roots erupts and blooms. |
| Gunslinger | Last Light Marshal | A frontier town at sunset; a clock sigil. A wide hat, a duster, a sunburst badge. **Six Bells:** time stops, six shots hang in the air, then everything lands at once. |
| Brawler | Sunfist Champion | A desert arena at sunset. A headband with long tails, hand wraps, sun flares at the back. **Hundred Suns:** a blur of fists, then one giant sun-fist shatters a stone monolith. |
| Reaper | Nightshade Reaper | A night wood. A feather mantle, feathered tails, a hood, a feathered gauntlet. **The Final Hour:** a wall of crows rushes in, the reaper crosses the field in one cut, and a crescent of light runs through the flock. |

Each cinematic stars the player's own character: their hair, eyes, skin and body type, drawn by the film model.

## How it was made

**Code:**
- `src/js/late/99-zzzzzzzzzz-z7-evocine.js` (EVC1) holds the shared timeline and camera, the default poses for each weapon kind, and the helpers.
- The film model (`z4-filmhero.js`) gained outfit hooks, so each class can draw its own outfit on the body in any pose.
- Each class is one file: `src/js/late/99-zzzzzzzzzz-z8-evc-<class>.js`.

**Process:**
- I built the Knight as the reference.
- The other 12 were built in parallel. Each builder checked its work on rendered frames.
- Each class then had an independent review against the rules: nothing bright behind the head, no religious imagery, faces visible, original designs, and performance.
- Every issue found was then fixed. 124 issues were reported, six of them rule problems: a crescent crest above the Samurai's head; hooded robe shapes in the Gunslinger's move; star sparkles on the Archer's bow; a big flash behind the Stormcaller's head; a face out of frame for the Elementalist; slow impact frames for the Mage.
- Three shared camera problems were fixed in the template after that: tall crests clipped at the start of the hero shot, a spark burst on the close-ups, and the wind-up zoom.

**Music:**
- `tools/movie/score-evo.txt` composes each 20-second score in code, on the shared beats. Each class has its own key, mode, tempo, lead instrument and impact sounds.
  - Knight: brass, D major.
  - Samurai: a plucked zither, pentatonic.
  - Ninja and Gunslinger: a two-string fiddle.
  - Mage: bells, Lydian mode.
  - Berserker: horns over taiko drums.
- `tools/movie/evo-score.js` renders them, reading the impact times from the cinematics themselves. Each score is 313 KB; all 13 come to 4.1 MB.
- There are no voices. Suno was not used, because its free plan forbids commercial use.

## Evolving, step by step

1. **Evolve** charges the gems and materials once, then plays the class's cinematic at once.
2. At the silhouette (8.2 s) the evolution is granted and saved.
3. **Esc** asks before skipping. Skipping still grants the evolution.
4. If the game is closed or crashes mid-cinematic, the payment is kept. The Classes screen then shows **Evolve now**, which costs nothing.
5. Once evolved, **Watch the evolution again** replays it, with no reward.

The world is frozen while it plays. You stay online, and other players still see you.

## Tools

- `bash tools/movie/evo-build.sh`: a private build for previews, in %TEMP%/rbevo.
- `node tools/movie/evo-preview.js <class> out.jpg [sheet|shots|looks|<seconds>]`: contact sheets.
- `node tools/movie/evo-score.js [classes]`: the scores.
- `node tools/movie/evo-record.js out.mp4 [classes]`: filming, with sound.

## Tested

- `tests/movie.js` passes all 23 checks:
  - all 13 cinematics exist at 20.0 s, each with its score and its impacts inside the move;
  - the evolution is paid once and granted once, at the silhouette;
  - closing the game mid-cinematic keeps the payment, and finishing costs nothing;
  - the world stands still and keys do nothing;
  - Esc asks; skipping still grants;
  - control returns exactly as it was; replays reward nothing; the evolution is saved;
  - a payment the server missed is not refunded;
  - nothing plays during a dungeon run;
  - every shot of all 13 draws for three very different characters;
  - real-time playback;
  - staying online, and losing the connection mid-cinematic.
- Frame cost in previews: at most 14 ms on the slowest frame, 2 to 6 ms on average.

## Not tested

- No person has watched or listened to these. The music was checked only by measuring its loudness each second.
- A controller was not tried.
