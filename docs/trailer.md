# The official trailer

`audio/trailer.mp4`: 92 seconds, 1920×1080, 24 fps, with its own score, sound design and voices. In the game, open **Settings > General > Trailer > Watch**. The intro film's player shows it, with the same skip prompt and Skip button after 3 seconds. Nothing of the trailer loads until the button is pressed, and the video is released when it ends.

Every picture comes from the real game. There are no stand-in characters, no generated art and no clips from other games.

- **Live shots:** the game itself, filmed off-screen on a virtual clock: its worlds, dungeons, monsters, bosses, weapons and their effects, the boss weather and the co-op partner. A directed camera and slow motion are added.
- **Stage shots:** the game's own renderers, drawn large on a canvas laid over the game, the way an animator lays out a cut. These use the hero (`AC6.draw`), the bosses' art (`DG.boss.DEF[id].art`), the real worlds as a blurred background (depth of field) and the dungeons' own opening films. This is how the trailer gets close-ups, silhouettes and a low-angle hero that the gameplay camera never shows.

## The story it tells

It follows the game's lore: the World Tree, the worlds drifting apart, the ten dungeons and the World Eater at the bottom of everything. The narrator is **Lavi**, the game's fairy guide, in her own in-game voice. She talks to the player ("you"), as the game does.

> Long ago... every world grew from a single root. Then came the Great Silence... and the worlds drifted apart.
> A hundred years. You have slept long enough.
> Pick up a weapon... and become someone new.
> Beneath the roots, the old doors are opening. Don't go down there alone.
> Every world began with a root... and something down there... is still hungry.
> *The World Eater's shadow:* I am only its shadow. Imagine the rest.

The boss lines are the bosses' own recorded voices from `audio/bosses/`. The trailer leaves out every boss, dungeon and line with a religious name or image: the Nameless Saint, the Hollow Sanctuary, the Temple of Eternal Night, "Heaven…" lines, and the Dragon's Grave arena, whose grave markers read as crosses.

## Storyboard

The score is 120 BPM, so a bar is 2 s, and every cut and impact sits on that grid (`cues.json`).

| Time | Scene | Shot | Camera and effect | Sound |
|---|---|---|---|---|
| 0:00 | **1 The unknown world** | black | | wind, a low swell |
| 0:01.6 | | the first world from high above at dawn (live) | slow descent through mist, floating motes | piano: the theme, alone. Lavi: "Long ago…" |
| 0:04.7 | | the Galaxy, floating stone under the stars (live) | slow push | strings breathe in. Lavi: "…the Great Silence…" |
| 0:07.3 | | the World Tree (the story intro's painting) | push in | |
| 0:10 | **2 The main character** | boots step onto the glowing ring (stage, real ground blurred behind) | low, the hero walks into frame | footstep, ring chime |
| 0:11.6 | | tilt up the coat to the Astral Katana on the back (stage) | tilt, a glint runs along the guard | glint |
| 0:13.2 | | the eyes open (stage, 30× the game's size) | a sweep of light across the face | a breath. Lavi: "A hundred years…" |
| 0:15 | | low angle, wind; a slow-motion sweep of the blade (stage) | half, then quarter speed, an anime smear and a flash | the draw, a hit |
| 0:17 | | the wings burst open in the real world; the hero rises (live) | pull back from 2.9× to the cliff over the lake | wings, a bloom of strings and choir; a riser; a quarter-beat of silence |
| 0:18 | | card: **YOU**, "A hundred years asleep. Awake at last." | | |
| 0:20 | **3 The warriors** | one hero, a different weapon each bar, all in real fight rooms (live): Samurai (Astral Katana), Mage (Star Wand), Archer (Raijin Bow, in the air), Stormcaller (Thunder Hammer), Ninja (Moon Chakram), Berserker (Titan Maul) | slow motion around each blow, whip pans between classes, class cards, an impact frame and speed lines on the last blow | drums enter; a brass hit on every class. Lavi: "Pick up a weapon…" |
| 0:32 | **4 The dungeon awakens** | the dungeons' own opening films, titles removed: Crimson Depths, Frozen Catacombs, Abyss of the Fallen Star | slow camera moves inside the films | darker harmony, a low pulse. Lavi: "Beneath the roots…" |
| 0:32.3 | | card: **TEN DUNGEONS**, "Ten guardians waiting below." | | |
| 0:39 | | two players at the dungeon's door: the partner walks up beside you (live) | | Lavi: "Don't go down there alone." Warm strings |
| 0:39.3 | | card: **DESCEND TOGETHER**, "Two-player co-op dungeons" | | |
| 0:41 | | fighting side by side in the Forgotten Ruins (live) | | |
| 0:44 | | toward the sealed temple door (the ruins film) | push in, fade to black | riser, drum roll, cut |
| 0:46 | **5 The boss reveal** | the dragon's silhouette against a burning sky (stage) | the camera climbs from its claws to its eye; dust falls with each step | three footsteps, braams, a roar |
| 0:49 | | Varkhazan, the Ancient Dragon, revealed in its storm (stage) | push in, shake on the roar, lightning | "The sky is my grave, and yours." |
| 0:51.5 | | the Frost Empress (live fight) | | "Winter does not end. It waits." |
| 0:54 | | the Infernal Sovereign and its beam (live fight) | | "Kneel, and burn with my kingdom!" |
| 0:56.5 | | the counterattack in slow motion (live) | impact frame | |
| 0:58 | | the Infernal Sovereign's face, close (stage) | | heartbeat, riser |
| 1:00 | **6 The final battle** | the two of you against the Infernal Sovereign (live): the clash, an aerial attack, its enraged phase, a slow-motion dodge, rapid half-beat cuts, a combined attack, the last blow | cuts on bars and half bars, flash cuts, shake, impact frames | full orchestra, the theme on brass. "Witness the crown of the sun!" |
| 1:15.5 | | white flash | | the last hit, then nothing |
| 1:16 | **7 The final reveal** | the hero on a ledge in the void, rim-lit, as the World Eater wakes ahead (the Throne's film with the hero in front) | slow push | wind, the theme far away. Lavi: "Every world began with a root… and something down there… is still hungry." |
| 1:24 | | the World Eater's six eyes, close; they flare (stage) | | heartbeats, a growl. "I am only its shadow. Imagine the rest." |
| 1:26 | **8 Title** | the real logo (`launcher/app/ui/art/logo.png`) over the Galaxy's sky | a sweep of light reveals it, a glint crosses it | one great impact, the whole orchestra on D major, the theme's last notes |
| 1:28.5 | | "Every world is waiting to be remembered." · OUT NOW · WINDOWS | | shimmer, a tail of reverb |

## The sound

`tools/trailer/score.js` builds everything from code in an offline audio renderer. No samples or bought libraries are used.

- **Score:** an original hybrid-orchestral piece in D minor, built on one theme (A–D–E–F, E–D–C–A–D). It runs through piano, strings, brass, choir, taiko and low strings, and resolves to D major on the title.
- **Sound design:** whooshes, slashes, hits, magic, thunder, quakes, footsteps, roars, wings, the sword draw and risers. Each one sits on its own cue in `cues.json`.
- **Voices:**
  - Lavi's narration: Kokoro, a free voice model that runs on this PC, `af_heart` like her in-game lines.
  - The bosses' recorded lines.
  - Each voice is EQ'd and compressed, and placed in a hall.
  - The World Eater's line is doubled lower.
  - The music ducks under every line.

## How it is made (the `Documents/rootbound-video` project)

1. Narration: `node tools/trailer/vo.js`, which writes `public/trailer/vo/`.
2. Film the shots: `node tools/trailer/shoot.js <game repo> public/trailer/film [shots…]`. Run it off-screen, on a throwaway save, with `PREVIEW=8` for quick checks. Then run `node tools/trailer/frames.js`.
3. The sound: `node tools/trailer/score.js <game repo> public/trailer/mix.wav`.
4. The picture: `npx remotion render RootboundTrailer out/trailer-video.mp4 --crf=17 --muted`. The edit is `src/Trailer/Trailer.tsx`.
5. Put the two together:

   ```bash
   npx remotion ffmpeg -i out/trailer-video.mp4 -i public/trailer/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart out/rootbound-trailer.mp4
   ```

   That file is the master for publishing. The game ships a smaller copy as `audio/trailer.mp4`, re-encoded at CRF 26.
6. Review: `node tools/trailer/stills.js <dir> <seconds…>`, `sheet.js` and `grid.js` make stills and contact sheets.

## Limits

- **2D only.** The game's camera looks straight from the side, so there are no true orbits around the hero. The trailer uses parallax, push-ins, tilts and the stage close-ups instead.
- **Facing and faces.** The hero faces left or right only, and faces show only the expressions the renderer has: open, blinking, determined.
- **The co-op partner.** The second player is drawn by the same call the game uses for a co-op partner (`drawChar` with their own look and wings), but it is scripted for filming. It is not a second person playing over the network.
- **Unseen in action.** The World Eater appears only in its film and as a silhouette, not in a live fight. It is the last boss, and the trailer keeps it a mystery.
