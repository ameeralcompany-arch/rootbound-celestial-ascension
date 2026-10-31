# Rootbound in Unity

A full rewrite of Rootbound in Unity (C#, URP 2D), built in phases. The web/Electron game in the rest of this repo stays as it is,
and the Unity version keeps its own saves, so it never touches your web save.

## What's in phase 1

- **World generator**, ported step by step with the same seeds, so a world name grows the same land as in the web game:
  - hills, plains and mesas;
  - dirt, stone and deepslate layers;
  - caves, lakes and underground pools;
  - every ore, from copper to diamond, plus moonstone, amber, magma and void geodes;
  - glowshrooms, urns, tackle boxes, sky islands and wild trees.
- **The hero:** the web game's movement physics (running, the floaty jump, coyote time, swimming) with the same anime
  character, rendered at 3× resolution.
- **Mining with the five tools**, using the same rules as the web game:
  - the right tool breaks a block in one hit;
  - the Ore Pick only mines ores and takes the whole vein;
  - Geode Rock only breaks with the Rock Tapper;
  - the Tree Axe gets bonus wood.
- **Building:** right click places the held block. Items drop and fly to you; the hotbar and inventory work.
- **Unity effects:**
  - URP 2D lighting: daylight that pours into cave mouths, dark caves, glowing ores and glowshrooms, and a light around the hero;
  - bloom, vignette and a gentle colour grade;
  - particles: debris, dust, sparkles, falling leaves, fireflies at night;
  - a day/night sky with sun, moon, stars, clouds and parallax hills;
  - swaying trees and flowing water.
- **Saving:** worlds save only what you changed. Your position, inventory and the time of day are kept.

Later phases: villages, chests, depth zones, biomes and letter words, monsters and combat, classes, bosses, shop, wings,
pets and fishing.

## Art and data

The blocks, icons, trees and hero come straight from the web game. `tools/unity-export.js` renders them headless and writes
them to `Rootbound/Assets/StreamingAssets/Rootbound/`. Re-run it after changing the web game's art:

```bash
node tools/unity-export.js
```

## Opening it in Unity

1. Install **Unity Hub** from unity.com/download and sign in (a free Personal licence is fine).
2. In Unity Hub, go to **Installs → Install Editor** and install **Unity 6 LTS** with **Windows Build Support**.
   - Once the editor is installed, Claude finishes the project files off-screen: the Universal 2D template's settings and
     packages, compiling and a test run. `unity/Rootbound` only holds the game's own code and art until then.
3. Unity Hub → **Projects → Add → Add project from disk** → choose the folder `unity/Rootbound` in this repo.
4. Open it. The first time takes a few minutes. The **Rootbound** scene opens by itself.
5. Press **Play** ▶. Type a world name and press Play in the game.

To make a Windows build, use the menu **Rootbound → Build Windows**. The game appears in `unity/Rootbound/Builds/Windows/`.

## Controls

| Key | Action |
|---|---|
| A / D or arrows | Move |
| W, Space or Up | Jump (and swim up) |
| Left click | Use the held tool |
| Right click | Place the held block |
| 1–9 or mouse wheel | Choose a hotbar slot |
| I or Tab | Inventory (click an item to put it in the selected slot) |
| Esc | Pause menu (save & leave, quit) |
| F3 | FPS counter |
