# Rootbound art studio (Unity)

The real game is the web/Electron Rootbound in the rest of this repo. This Unity project is only a **studio** for rendering
upgraded art with Unity's 2D lighting, bloom and particles. Anything it makes goes back into the web game as files the game
loads. Gameplay is never built here.

The project (`unity/Rootbound`, Unity 6000.6.7f1, URP 2D) draws the game's world from the game's own art and world generator.

## Tools

| Tool | What it renders | Status |
|---|---|---|
| `Scripts/Studio/IntroDirector.cs` + `Editor/RootboundStudio.cs` (`RenderIntro`) | A 14 s camera flight over a generated world (night, dawn, a glide to the hero) into a WebM video | Not used by the game: the story intro is drawn in the game's anime style instead (`src/js/late/89-z-cine.js`). |

Batch render: `Unity.exe -batchmode -projectPath unity/Rootbound -executeMethod Rootbound.EditorTools.RootboundStudio.RenderIntro`
with `RB_STUDIO=intro`, `RB_STUDIO_OUT=<frames dir>`, `RB_STUDIO_VIDEO=<output .webm>`.

## Bringing the game's art into Unity

`tools/unity-export.js` runs the web game headless and exports its blocks, item and weapon icons, trees, the hero and the
monsters (with animation frames), plus their data, into `Assets/StreamingAssets/Rootbound/`:

```bash
node tools/unity-export.js
```
