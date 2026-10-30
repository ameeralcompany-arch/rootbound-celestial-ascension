# Opening cinematic: voice, pacing, water and props

How the launch intro (`src/js/late/89-z-cine.js`) is voiced, timed and drawn, and how to upgrade it to studio voice-over.

## 1. Voice-over

### What was wrong

- **Lines cut off.** Each line was spoken when its scene began, but most lines ran 1 to 3 s longer than their scene. They stacked up in
  the speech queue, and the title's "RootBound" call used `cancel`, which wiped whatever was still queued. The intro's end also
  stopped the voice after 2.5 s.
- **Robotic tone.** The system voice was pitched down to 0.58 to 0.74. Windows voices pitch-shift by resampling, so anything under
  about 0.8 turns metallic.

### What the game does now

| | Before | Now |
|---|---|---|
| Pitch / rate | 0.74 / 0.90 (dark 0.58 / 0.82) | 0.88 / 0.96 (dark 0.80 / 0.88) |
| Utterances | one per line | one per sentence, kept referenced until it ends (Chromium otherwise garbage-collects it mid-sentence) |
| Cancels | the title cancelled the queue | nothing cancels a line in flight |
| Scene length | fixed | at least the spoken line + 0.65 s of breath (`retime()`); the clock also eases into slow motion for up to 3 s at a scene's end while its line is still being spoken |
| Music | ducked to 50 % | ducked to 45 % only while the voice is actually speaking |

Speech length comes from `VOX12.est()`. It is fitted to Microsoft David measured off-screen: about 0.3 s per word, 0.95 s per
sentence and 0.3 s per comma. Altogether the intro now runs about 106 s.

### Studio voice-over with ElevenLabs (optional)

The game ships with the free Windows voice. To use ElevenLabs:

1. Pick a deep, calm narrator voice in your ElevenLabs Voice Library and copy its Voice ID.
2. In PowerShell:
   ```
   $env:ELEVENLABS_API_KEY="your key"; $env:ELEVENLABS_VOICE_ID="the voice id"; node tools/vo-elevenlabs.js
   ```
3. That writes `desktop/vo/<scene>.mp3` (17 files). Repackage the desktop app. On launch the game probes `vo/title.mp3`; if every
   clip loads, it plays them instead of the system voice and times each scene to its clip's real length. If any clip is missing, it
   keeps the system voice for the whole intro, so voices never mix.

Settings live in `tools/vo-script.json`:

| Setting | Value | Why |
|---|---|---|
| stability | 0.50 (0.42 for dramatic beats, 0.58–0.62 for hushed ones) | higher goes flat and robotic; lower wobbles and stutters |
| similarity_boost | 0.78 | clean timbre without copying recording noise |
| style | 0.18 (up to 0.35 for gags and the fight) | emotion without artifacts; high style adds instability |
| use_speaker_boost | true | presence |
| speed | 0.93 (0.85–0.90 on slow beats) | calm, cinematic |
| previous_text / next_text | neighbouring lines | each line takes the intonation of a continuous take |

Rules that prevent truncation and stutter:

- End every line with `.`, `!` or `?`. The script adds a full stop if one is missing. Never end on `...`; the model trails off.
- Use `<break time="0.3s" />` for a dramatic pause (eleven_multilingual_v2 supports it). Keep breaks under about 1 s and use at most
  2–3 per line. Ellipses mid-line (`waited... for someone`) make a softer, breathier pause.
- Spell out names the way they should sound: the title is read as `Root... bound.`
- Keep each line to one or two sentences. Very short lines (one word) render unstably; one-word beats are joined with breaks, as in
  the montage.

### Delivery direction

Use the low, close, unhurried voice of an anime prologue narrator: a storyteller, not an announcer.

- Let the voice drop at the end of each sentence.
- Breathe between sentences rather than mid-phrase.
- Warmth rises on the friend and camp beats.
- Restraint on "the roots fell silent"; let the silence do the work.
- The gags (`a small... very loud sprout`, `about as well as you would expect`) get a dry beat before the punchline.
- The title is slow and resonant, with room for the chord under it.

## 2. Pacing

- Each line starts on its scene's first frame. A scene lasts at least as long as its line plus 0.65 s of breath, so the next cut never
  lands mid-word.
- Scenes that were already longer than their line keep their designed length, so the visual beats (the eclipse crack, the boss
  panels, the clash) still hit on time.
- The score is scheduled from each scene's start, so it follows the new timings automatically.
- The montage stretches its four cuts to fit "Build. Mine. Fish. Climb." The fishing cut now opens on 0.6 s of still lake before the
  first bite, and its sounds are shifted to match.

## 3. Water and props

The game is a 2D canvas, so these are canvas equivalents of the usual shader passes. All of it is pre-rendered or drawn as a few dozen
calls per frame, and it only runs during the lake shots.

| Shader idea | Rootbound version (`lake()`, `wRing()`, `wSplash()`) |
|---|---|
| Planar reflection | the sky, moon and treeline are mirrored into a cached half-res texture (`AB.m3r`: blurred, multiplied cool blue), drawn in 5 px strips displaced by two sine waves that grow with nearness (calm far, choppy near) |
| Fresnel | a gradient from bright and mirror-like at the horizon to deep, see-through blue-black up close |
| Caustics | a tileable light-net texture (`AB.caus`) drawn additively in the shallows: two layers drifting against each other, squashed by perspective, fading with depth |
| Specular / glitter | anime sparkle dashes and four-point glints in the moon's path, each flickering on its own phase |
| Normal-map ripples | thin curved wind-crest highlights that scale with depth and drift with the breeze |
| Shoreline foam | a broken foam line where the water meets the far shore |
| Interaction | ripple rings with a bright leading edge, a dark trailing edge and a second ring; splashes with a white crown, beaded droplets on ballistic arcs and a spreading foam patch; drops off the boot leave tiny rings where they land |

How the props are grounded:

- **One source of truth.** The montage builds and mines with the game's own painted block sprites (BART9), not separate cinematic
  art, so the story matches the world.
- **Contact and shadow.** The house casts a long soft shadow away from the low sun. A falling block's shadow sharpens as it lands. The
  float sits *in* the water: red top above the line, white half seen dimly through it, a meniscus ring, its reflection.
- **Scene light.** A warm rim on the sun-facing edges and one soft-light grade put the blocks in the sunset. The boot gets a night
  grade, a cool moon rim and wet specular streaks. The koi gets a moonlit rim.
- **Physical response.** The boot and koi are reflected in the water and shed drips under gravity. The boot sinks through the surface
  (clipped at the water line) with its own splash. Mined stone breaks into tumbling fragments of the real stone texture.

Taking it further in an engine (Unity URP or Unreal):

- planar reflections or SSR plus a Fresnel term
- a depth-fade shallow colour with a caustics projector
- a flipbook foam mask driven by intersection depth
- a GPU particle splash with a collision-spawned ripple decal
- for props, a shared trim sheet and texel density, AO and contact shadows, and a light-matched rim pass

The ideas above map one to one.
