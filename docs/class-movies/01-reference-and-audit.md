# Class story movies: reference study and audit

Status of this page: written 2026-11-10, from what was actually measured or read.

## 1. The reference video, what I could and could not do

**Video:** youtube.com/watch?v=fZ5dpxiu6Vk, a 110-second story movie for another game's first class line (uploaded 2021).

**What I actually did:** I played the whole video once, off-screen and muted, and captured about six frames a second (650 frames), the on-screen English captions with their times, and an automatic list of its cuts. I then looked at contact sheets of every shot.

**What I could not do:** I cannot hear. I know the music and voices only from what the pictures and captions imply. The frames stayed in a temporary folder and are not in the game or in this repository.

### How it is built

| Time | Length | What happens on screen | The job it does |
|---|---|---|---|
| 0:00 | 8.0 s | Wide painting of a castle at sunrise, an oath in voice-over | Place, stakes, calm |
| 0:08 | 3.9 s | Full body, eyes closed, hands on the sword | Who this is |
| 0:12 | 3.9 s | Huge close-up, eyes closed | Intimacy, before anything happens |
| 0:16 | 7.7 s | Sepia memory of family | Why it matters |
| 0:24 | 4.4 s | The same close-up, eyes open | Decision; then a white flash |
| 0:28 | 5.7 s | Wide of a burning city, dark red | The world turns |
| 0:33 | 6.8 s | **One long slow pan** across a single wide battle painting | A whole journey, in one image |
| 0:40 | 2.0 s | The sword, broken, lying on the floor | Defeat, told by a prop |
| 0:42 | 8.0 s | Kneeling; a far-better sister stands in the foreground | Self-doubt |
| 0:51 | 1.6 s | White | A breath |
| 0:52 | 9.4 s | Strange purple place; the rival; extreme profile | The question is asked |
| 1:02 | 7.4 s | Sepia faces of friends | The answer is people |
| 1:10 | 4.0 s | Profile, then medium shot, shouting the decision | The choice |
| 1:14 | **15.0 s** | **Near-black blue with one point of light** | Silence before the change |
| 1:29 | 8.5 s | Fifteen or so half-second pulses: hand on sword, lightning, eyes, teeth | The change, in impact frames |
| 1:38 | 3.0 s | Cape sweeping across the whole frame | The new form, in pieces |
| 1:41 | 2.9 s | Slow pan over new armour | The new form, in pieces |
| 1:44 | 6.0 s | Full-body hero pose; the last line | The reward |

### What it teaches (and what we keep)

1. **Most of it is not animated.** It is beautiful still paintings with slow pushes and pans, layered effects and flashes. Quality comes from the composition of each still, not from frames per second. Rootbound can afford this.
2. **Long, then short.** Shots run 4 to 8 seconds until the awakening. Then about 15 cuts in 8 seconds. The contrast is the excitement.
3. **Fifteen seconds of almost nothing** is the most confident moment in the film.
4. **Defeat is shown with an object** (the broken sword) rather than explained.
5. **The new costume is revealed in pieces** before the whole figure.
6. **Memory has its own colour** (sepia), so the audience understands instantly.
7. **The reason is other people.** The awakening is not a request for strength.

Everything above is craft and structure. No character, line, music or asset from that video is used. Its shot order is not used either: an independent review found my first draft's ending ran the same five beats as the reference's ending, in the same order and at nearly the same lengths, so I changed it. In the Reaper's movie the crows clear to show the whole figure first, the details come after, and nothing sweeps across the lens.

## 2. The audit of Rootbound

### The engine, and what it means for Unity

The game is a web/Electron game that draws everything by code on a 2D canvas. Unity is used only to make art for it, by standing decision (2026-10-31): *"use unity ONLY for upgrading my game's animations and designs, don't rebuild the game on unity."*

| You asked for, where compatible | Status | What is used instead |
|---|---|---|
| Unity Timeline | Installed in the art project (6.6.0), **but it cannot drive the game**, which is not a Unity program | A timeline of shots in the game's own code |
| Cinemachine | Not installed in the art project, and same reason | A camera controller with keyframes, easing, roll, parallax and focus |
| Animator / Animation Rigging | The Animator module is in the art project but unused; Animation Rigging is not installed; and the characters are code, not rigged meshes | Keyframed poses solved with two-bone IK |
| Existing VFX / audio / multiplayer | Partly | The game's audio settings are honoured and the evolution's closing effect is reused. The film draws its own effects. A movie does not touch multiplayer: you stay connected, and other players still see you, standing where you were |

A movie rendered in Unity and played as a video could only show a fixed hero. Built in the game's own engine, **the star is the player's own character**: their hair, eyes, skin, body type, name and Mythic. So the movies are built in the game's engine. "Test in Unity" becomes "test in the real game".

### Classes

Each of the 13 classes already has a keeper in the Plaza, one Mythic and one evolution. These relationships are the backbone of the stories.

| Class | Keeper in the Plaza | Mythic | Evolution |
|---|---|---|---|
| Brawler | Pip, the village kid | Cindermaw | Sunfist Champion |
| Knight | Kael, the gate guard | Dawnwarden | Aurelian Vanguard |
| Samurai | Lulu, the teahouse keeper | Sakura Elegy | Hanakage Ronin |
| Archer | Hana, the gardener | Starlight Aurelis | Galewarden |
| Mage | Seren, the astral mage | Arcana Veil | Starwright |
| Bloodbound | Vesper, the fortune teller | Crimson Pact | Sanguine Regent |
| Reaper | The Hollow, the night wanderer | Nightveil Harvester | Nightshade Reaper |
| Elementalist | Lumi, the moth spirit | Tempest Prism | Primal Conduit |
| Stormcaller | Tobi, the baker | Thunderveil | Tempest Herald |
| Berserker | Bram, the blacksmith | Ruinbringer | Ashen Warlord |
| Ninja | Ren, the wandering traveler | Inkshade | Voidstep Phantom |
| Druid | Elder Oak | Thornbloom | Elder Wildheart |
| Gunslinger | Mira, the merchant | Chrono Reaver | Last Light Marshal |

### Lore the stories must honour (docs/story.md, docs/story-proposal.md)

- The Great Silence; the Rootways; name-words; the World Eater, which is the universe forgetting itself.
- The player woke after a hundred years, is not chosen, and "simply remembers what other people forgot".
- Message: *"Sometimes, all it takes to bring light back is someone willing to remember."*
- Guardians are misunderstood, not evil. Five realms, ten dungeons.
- Lavi is cheerful, a little bossy and **afraid of the dark**.
- **No religious names or imagery.** No halos, crosses, shrines, saints, or anything that reads like them.

### Characters and art available

| Asset | State |
|---|---|
| Player character | Procedural 2D figure, about 54 units tall, cheerful chibi proportions. Faces show only open, blinking or determined. Facing left or right only |
| Lavi | A detailed fairy with moods, poses and lip sync, already made for close-ups |
| Bosses | Procedural art that scales cleanly, including the Nameless Gardener |
| Mythics | Detailed vector art |
| Evolved looks | 13 small costume layers on the game figure |
| Voices | Kokoro, a free model with an Apache licence, running on this PC. **It has no Korean voice**, so lines are in English |
| Music | Written by code, rendered offline |

### Limits found in the audit, and the solution

The game figure cannot carry a film. It has no eyelids, no mouth shapes, no knees that read at large size, and its head is a third of its height. Scaling it up is what produces the "sticker" look.

**Solution: a film model.** Same hair style, hair colour, eyes, skin and body type as the player's character, drawn from the same data, but built for close-ups: real eyelids, brows, gaze, mouth shapes, tears, anime proportions, tapered limbs, and a 3D-aware head that can turn. The game figure is left completely untouched.

### What is not possible here, stated plainly

- Everything is drawn by code. It will not equal a studio's hand-painted animation, and I will not say it does. The aim is the same structure, direction and emotional beats at the best quality this art style can reach.
- I cannot listen to the music or voices, only measure them. **A person must judge how they sound.**
- Suno is not used: its free plan is for non-commercial use only and cannot be upgraded later for songs already made, and it would need your sign-in. Music is written by code instead, so you own it outright.
