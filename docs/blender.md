# Blender and the game

Blender is connected to Claude through MCP for Blender, and it's available in every session on this computer as long as Blender is open (the add-on starts by itself; see the MCP for Blender tab, press N). This is how Blender's work reaches the game.

The game's art is drawn by code in the browser, and the game doesn't load 3D models. So Blender's work comes into the game as pictures:

| What | How | Where it goes |
|---|---|---|
| Sprites: characters, bosses, weapons, wings, blocks, effects | `tools/blender/render_sheet.py` | `assets/sprites/<name>.png`, drawn with `RBART.draw` |
| Backgrounds and single images | the same script, one frame | `assets/sprites/` |
| Cutscenes and the intro | render to video | `audio/`, like `audio/intro-cinematic.mp4` |

## Making a sprite

From a live Blender through `execute_blender_code`:

```python
exec(open(r"C:\Users\meero\Documents\rootbound-celestial-ascension\tools\blender\render_sheet.py").read())
print(render_sheet("MyObject", r"C:\Users\meero\Documents\rootbound-celestial-ascension\assets\sprites\my-object.png", size=128, frames=(1, 24)))
```

Or with no window, in its own Blender, leaving any open one alone:

```bash
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b scene.blend --python tools/blender/render_sheet.py -- --object MyObject --out assets/sprites/my-object.png --size 128 --frames 1 24
```

It looks straight from the side, like the game's camera, with a see-through background, and writes the numbers the game needs next to the sheet (`my-object.json`).

Names are lowercase letters, numbers, `_` and `-`. Keep sheets small: the player downloads every one, and each one is memory on the graphics card.

## Using it in the game

```js
if(!RBART.draw(g,'my-object',now/1000,x,y,{w:64,fw:128,n:24,cols:5,fps:24,flip:P.f<0})){ /* what it drew before */ }
```

`draw` returns false until the sheet has loaded, and always if it's missing, so keep the old drawing as the fallback. The server hosts `assets/sprites/*.png`, GitHub Pages and a repository checkout find them beside the page, and the desktop app packs the `assets` folder (add `assets` next to `audio` when staging a package by hand).

Don't add the game's own text or interface to a sheet, and check a new sheet at the size it appears in the game: a detailed render can turn to mush at 64 pixels.

## Bringing the game's art into Blender

`node tools/unity-export.js` exports the blocks, hero, monsters and trees as pictures (it writes to `unity/Rootbound/Assets/StreamingAssets/Rootbound`). Load one as an image plane to match a style or size.

## Good to know

- `execute_blender_code` can run any Python in Blender, and Python can touch files. `BLENDER_MCP_SAFE_MODE=1` blocks that, along with saving and exporting.
- `generate_3d` and the asset libraries are off, and may cost credits or carry their own licences. Ask before turning them on.
- From inside Claude, uv needs `UV_PYTHON_INSTALL_DIR` and `UV_CACHE_DIR` outside AppData (already set in the `blender` entry in Claude's settings).
