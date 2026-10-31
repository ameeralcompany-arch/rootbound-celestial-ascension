# Rootbound art studio (Unity)

The real game is the web/Electron Rootbound in the rest of this repo. This Unity project is only a **studio**: it renders
upgraded animations and designs using Unity's 2D lighting, bloom and particles, and the results go back into the web game as
files it loads. Gameplay is never built here.

The project (`unity/Rootbound`, Unity 6000.6.7f1, URP 2D) draws the game's world from the game's own art and world generator,
which is what the studio scenes film.

## What it makes

| Output | Used by the web game | How to re-render |
|---|---|---|
| `media/intro.webm` (14 s, 1600×900): the world at night, the light returning, dawn over the floating islands, a glide to the hero at the spawn door | The backdrop of the last two story-intro scenes ("restore" and "title") in `src/js/late/89-z-cine.js`. The rays, flash, motes and the RootBound title still draw on top; without the video the painted world draws as before. | Batch: `Unity.exe -batchmode -projectPath unity/Rootbound -executeMethod Rootbound.EditorTools.RootboundStudio.RenderIntro` with `RB_STUDIO=intro`, `RB_STUDIO_OUT=<frames dir>`, `RB_STUDIO_VIDEO=<repo>/media/intro.webm` |

The camera path and timing live in `Assets/Rootbound/Scripts/Studio/IntroDirector.cs`.

## Bringing the game's art into Unity

`tools/unity-export.js` runs the web game headless and exports its blocks, item and weapon icons, trees, the hero and the
monsters (with animation frames), plus their data, into `Assets/StreamingAssets/Rootbound/`:

```bash
node tools/unity-export.js
```

Re-run it after changing the game's art, then re-render.

## Desktop app

The packaged app ships `media/` next to `index.html` (see `desktop/build-windows.bat`); the video plays from inside the
app archive.
