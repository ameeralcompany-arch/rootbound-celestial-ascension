# The Reaper's story movie: implementation report

*What the Dark Keeps* is the first class story movie: 60 shots, 3 minutes 36 seconds. The script and storyboard are in [02-class-stories.md](02-class-stories.md) and [03-storyboard-reaper.md](03-storyboard-reaper.md).

## Watch it

- **Recording:** `docs/class-movies/recording/reaper-story.mp4` (1080p, 24 fps, 132 MB) and `reaper-story-small.mp4` (50 MB). Both are filmed from the real game, frame by frame, with the final sound. Git ignores them.
- **In the game:** as a Reaper who meets the evolution requirements, open the Classes screen (K), then the Mythic card, then *Class Evolution*, then *Evolve*. A card offers three choices:
  - **Watch the story**;
  - **Skip the story**, which asks first and still evolves you;
  - **Later**.
  
  Once evolved, **Watch your story again** replays it with no reward.

## How it is built

| You asked for | Where it is |
|---|---|
| Cinematic sequence manager | `MOVIE1` in `99-zzzzzzzzzz-z5-movie.js`. Each class registers a timeline of shots. Every frame is computed from the movie's time alone, so seeking, skipping and filming are exact. |
| Camera sequence controller | Per-shot keyframes (position, zoom, roll) with easing, parallax layers, and controlled shake. |
| Dialogue and subtitles | Lines are placed by shot. Voice clips, subtitles and mouth shapes are timed from the recordings. |
| Audio transitions | The game's music fades down and comes back. The score drives the clock and recovers if it stalls or fails. The player's volume and mute settings apply. |
| Character animation | `FILM1` in `99-zzzzzzzzzz-z4-filmhero.js`: the film model of the player's own character, with keyframed poses solved by two-bone IK. |
| VFX sequences | A shared kit for every future movie: glows, crescents, sparks, motes, crows, speed lines and impact frames. |
| Skip and replay | Esc asks first. The card has Skip and Later. Replays come from the Classes screen. |
| State restoration | The world is frozen exactly where it was, using the same pause as the trailer. A gate in front of every key handler holds keys back. Held keys and mouse buttons are cleared at the end. |

**Rewards:** paying and evolving are separate saved steps. Whether a movie is closed, crashes or is skipped, it never charges twice and never loses what was paid. A signed-in payment counts as owed until the server's own wallet shows it, so a lost connection cannot hand the gems back.

**Unity:** not used. The game is not a Unity program, so Timeline and Cinemachine cannot drive it. A pre-rendered video also could not show each player's own character.

## Shot by shot

| # | Starts | Length | Shot | What actually moves | Made from |
|---|---|---|---|---|---|
| 1 | 0:00.0 | 7 s | Night over the standing stones | slow push and tilt, drifting clouds, floating motes, grass parallax | painted plates; film-model hero, small |
| 2 | 0:07.0 | 4 s | Hand tracing the carved names | hand slides along the names, lantern glow | painted stone with real carved text (one name is the player's) |
| 3 | 0:11.0 | 4.5 s | Polishing the scythe, Lavi by the lantern | polishing arm, breathing, hair, Lavi hovering and lip sync, lantern flicker, slow push | film-model hero, real Lavi art, real Mythic art |
| 4 | 0:15.5 | 4 s | "I don't sleep much." | eyes lifting, slight head drift, lip sync, hair | film-model face |
| 5 | 0:19.5 | 4.5 s | Along the blade | long tracking move, travelling glint, reflected eye | real Mythic art at full detail |
| 6 | 0:24.0 | 4 s | A name loses its letters | letters fade, motes rise, light shifts from warm to violet | painted stone |
| 7 | 0:28.0 | 2.5 s | Alarm | eyes widen, pupils shrink, brows rise, head turns, lip sync | film-model face |
| 8 | 0:30.5 | 9.8 s | The Hollow | slow rise, the Hollow fades in and blinks, hero turned toward them | painted plates; the Hollow redrawn as a silhouette at film size |
| 9 | 0:40.3 | 4 s | The Hollow Grove | crane move, falling gold motes, four depth layers | painted plates; film-model hero, small |
| 10 | 0:44.3 | 5.6 s | The Gardener | tilt up from roots to bloom ring, her idle animation | the real boss art |
| 11 | 0:49.9 | 3.2 s | "Then give back the ones you stole." | small push, wind in hair, lip sync | film-model face |
| 12 | 0:53.1 | 2 s | The charge begins | body drives forward between keyframes, dust, speed lines, rush-in camera | film-model body, keyframed |
| 13 | 0:55.1 | 1.5 s | Side-tracking sprint | running cycle, thorns erupting behind, fast parallax, speed lines | film-model body, thorn effect |
| 14 | 0:56.6 | 1.2 s | Cutting the root wall | wind-up to cut (keyframed), crescent smear, wall halves slide apart, impact frame | film-model body, effects |
| 15 | 0:57.8 | 1.4 s | Thorn spears converge | ten spears close in on a point, Gardener's casting pose | boss art, effects |
| 16 | 0:59.2 | 1.4 s | The parry | thorn point arrives, sparks burst, glow, controlled shake, impact frame | real Mythic art, effects |
| 17 | 1:00.6 | 1.6 s | Spinning sweep, Crow Flock | body rotates through the spin, scythe arcs, smear, 26 crows burst outward | film-model body, effects |
| 18 | 1:02.2 | 1.4 s | The false Gardener | crows arrive, she bursts into 240 leaves | boss art, effects |
| 19 | 1:03.6 | 1.2 s | The eye snaps sideways | gaze jumps, pupil shrinks | film-model eye, full screen |
| 20 | 1:04.8 | 2 s | The lash from behind | thorn whip, hit, hero thrown, impact frame, whip camera | boss art, film-model body, keyframed |
| 21 | 1:06.8 | 2.8 s | Skid, then the dark on the arm | skid with gouge line and sparks; black veins spreading | film-model body; drawn forearm and hand |
| 22 | 1:09.6 | 4.4 s | "The garden remembers..." | slow push, dark motes, her phase 2 pose | boss art |
| 23 | 1:14.0 | 2 s | "Left! Go left!" | Lavi frantic, panic shake, lip sync | real Lavi art |
| 24 | 1:16.0 | 4.5 s | The second charge | three keyframed swings with growing shadow wisps, drop to quarter speed, grove dims | film-model body, keyframed, effects |
| 25 | 1:20.5 | 3 s | Ring of Thorns | the ring expands, 40 thorns rise, flash | boss art, effects |
| 26 | 1:23.5 | 3 s | The scythe leaves the hand | slow-motion spin, reaching hand | real Mythic art, drawn hand |
| 27 | 1:26.5 | 3 s | Lights go out one by one | 12 lights go out in sequence, grove fades to black | painted plates, film-model silhouette |
| 28 | 1:29.5 | 3.9 s | "It's so dark." | Lavi trembling, lip sync | real Lavi art |
| 29 | 1:33.4 | 2.9 s | "Go. Get out of here." | lip sync, breathing, lit only by Lavi | film-model face |
| 30 | 1:36.3 | 4 s | "And let you get lost without me?" | she turns back, trembling, slow push, lip sync | real Lavi art |
| 31 | 1:40.3 | 2 s | The thorn, and Lavi in its way | thorn rushes from the dark, she flies into its path, flare | film-model silhouette, Lavi, effect |
| 32 | 1:42.3 | 1.5 s | White, then black | a timed cut | none |
| 33 | 1:43.8 | 4.5 s | The hands catch her | she falls into cupped hands, her glow fades | drawn hands, real Lavi art |
| 34 | 1:48.3 | 5.7 s | "I still have your name." | tears run, voice breaks, lip sync | film-model face with tears |
| 35 | 1:54.0 | 4.2 s | Sepia memory: waking in the Plaza | hero sits up on the Plaza stones and looks at Lavi, Lavi waving, lip sync | film-model body, real Lavi art, painted Plaza, sepia treatment |
| 36 | 1:58.2 | 2 s | The last of her light | a point of light shrinks to nothing | effect |
| 37 | 2:00.2 | 6 s | Closed eyes, the Hollow's words | slow push out of black | film-model face |
| 38 | 2:06.2 | 9.4 s | Facing the dark, empty hands | arms fall, eyes open, lip sync, slow push | film-model body, rim light only |
| 39 | 2:15.6 | 12 s | Twelve seconds of nearly nothing | a slow walking cycle toward one point of light, heartbeat | film-model silhouette |
| 40 | 2:27.6 | 2 s | Eyes open | both eyes open, tiny lights appear in the irises | film-model eyes, full screen |
| 41 | 2:29.6 | 6 s | Every name, a light | long pull-back, thousands of lights spread outward, drifting names | baked light layers, film-model body, real text |
| 42 | 2:35.6 | 3 s | The crows bring the scythe | tracking move, 22 crows around the weapon | real Mythic art, effects |
| 43 | 2:38.6 | 2 s | The catch; the blade opens | hit, the blade splits open onto a night sky | real Mythic art, drawn hand, effect |
| 44 | 2:40.6 | 1.5 s | Feathers on the arm | feathers grow up the forearm | drawn arm and hand, feather art |
| 45 | 2:42.1 | 1.5 s | The mantle | three rows of feathers unfold in order | film-model body, feather art |
| 46 | 2:43.6 | 1.5 s | The coat becomes feathers | hem tears into feathered tails, wind rises, loose feathers | film-model body |
| 47 | 2:45.1 | 1.5 s | The hood | the hood flows forward, eyes in shadow | film-model face, hood art |
| 48 | 2:46.6 | 2 s | Silhouette, then the black flash | black figure on violet, black flash, scythe arc, one edge of light | film-model body, effects |
| 49 | 2:48.6 | 2.5 s | A wall of crows clears | 280 crows burst outward, the figure appears as a silhouette | effects, painted sky |
| 50 | 2:51.1 | 6 s | The hero shot | slow push, 70 crows circling, cloak opening | film-model body, painted sky and moon |
| 51 | 2:57.1 | 2.5 s | Details, piece by piece | slow slide up the mantle to the head of the scythe, a travelling glint | film-model body |
| 52 | 2:59.6 | 2 s | Blink | thorns stab where the hero was, feathers burst | effects |
| 53 | 3:01.6 | 2 s | Slow sweep among thorns | slow-motion arc, thorns falling | film-model body, effects |
| 54 | 3:03.6 | 3 s | The Final Hour | the crossing, then one line across the frame and the picture slides apart along it | film-model body, boss art, effect |
| 55 | 3:06.6 | 6.2 s | The Gardener gets her face back | her blank mask fades into a real face, gold eyes open, lip sync | film-model face with a fallen hood and leaves, new to this movie |
| 56 | 3:12.8 | 4 s | The whisper | two faces level; the hero leans toward her ear; her smile; she scatters into petals | film-model faces, effects |
| 57 | 3:16.8 | 5.1 s | Lavi wakes | her glow returns, she stirs, lip sync | drawn hand, real Lavi art |
| 58 | 3:21.9 | 3 s | "You're still not sleeping, though." | small smile, tears, Lavi beside the hero, lip sync | film-model face, real Lavi art |
| 59 | 3:24.9 | 5 s | Dawn: the names are back | slow pull-back, the Hollow fades, gold names on the stones and one new one, Lavi asleep on the shoulder | painted plates |
| 60 | 3:29.9 | 6 s | Title | fade in, drifting motes | text |

## What is animated, and what is still

**Animated:**
- every camera move;
- character poses, with two-bone IK between keyframes;
- blinking, eyelids, brows and gaze;
- lip sync from each recording: 24 lines, two hero voices;
- tears;
- hair and cloth in the wind;
- the transformation layers (mantle, tails, hood, gauntlet), which grow in order;
- all effects;
- Lavi, with her own lip sync and moods;
- the Gardener's boss art.

**Still, on purpose, as in the reference:**
- The painted backgrounds move only by camera, parallax, drifting light and motes.
- The fight is shown in key poses with smears and impact frames, not as fully in-between animation.

## What is placeholder, missing or limited

- **Art ceiling.** Everything is drawn by code. It is clean anime-style vector art, not hand-painted animation. Every face is built from one film model.
- **Costume.** The hero wears the Reaper's story costume, not the player's own outfit. Hair, eyes, skin and body type come from the player's character.
- **Voices** are Kokoro, the free local model (Apache licence). It has no Korean voices, so the lines are in English, and its emotional range is limited.
- **Music** is written and rendered by code: strings, piano, choir, low drums, a plucked long zither and a two-string fiddle. Suno was not used, because its free plan forbids commercial use.
- **Only the Reaper is built.** The other 12 classes exist as stories and storyboards.

## What was tested, and how

**`tests/movie.js`**, run off-screen. All 24 checks pass:
- the evolution is paid once and granted once;
- closing the game before the story keeps the payment, and resuming it is free;
- skip asks first, and still grants the evolution;
- the world stands still and keys do nothing during the movie;
- Esc pauses and resumes;
- control returns exactly as it was;
- replays reward nothing;
- the evolution is saved;
- no movie starts during a dungeon run;
- all 60 shots draw for five very different characters;
- playback runs in real time;
- the player stays online and other players still see them;
- losing the connection mid-movie does not disturb it;
- a payment the server missed is not refunded.

**Other tests these changes touch** also pass: `classes`, `duo`, `moments`, `story` and `dungeons`.

**Performance** was measured on the packaged game with your GPU and a temporary copy of your saves, playing the whole movie in real time:

| Phase | Average fps | 99th percentile frame | Slowest frame | Frames over 33 ms |
|---|---|---|---|---|
| Playing, before the movie | 143 | 7.1 ms | 14 ms | 0 |
| The movie (216 s) | 141 | 13.9 ms | 49 ms | 2 |
| Playing, after the movie | 144 | 7.1 ms | 7 ms | 0 |

Memory was the same before, during and after. The movie's first frame takes about 150 ms while its backgrounds are painted behind black.

**Two independent reviews.** The first reported 41 issues and confirmed 38. Among them:
- a gem refund for signed-in players;
- a payment that could be lost during the old 4-second scene;
- an ending that followed the reference's shot order;
- two halo-like images;
- lore mistakes in my first drafts.

All 38 were fixed. A second review checked those fixes and found 15 more, and those were fixed too.

**Not tested:**
- No person has watched or listened to the movie. Sound was checked only by measuring its loudness each second.
- A controller was not tried.
- Other screen shapes were not tried on real hardware.
- A real signed-in account was not tried.
