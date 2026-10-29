# Wing sprite sheets (v9 ascended wings)

Rendered by the game's own wing renderer (`WingArt` + `WING9`, `src/js/late/50-z-wings2.js`) in headless Chromium.
Regenerate after a build with `node tools/wing-sheets.js [ids]` (needs `NODE_PATH` pointing at a Playwright install and `CHROMIUM`).

| File | Wing | Sheet | Frame |
|---|---|---|---|
| `haloseraph-sheet.png` / `-black.png` | Halo Seraph | 2048 x 872 | 512 x 408 |
| `voidshroud-sheet.png` / `-black.png` | Abyssal Shroud | 2528 x 1048 | 632 x 496 |
| `stormlance-sheet.png` / `-black.png` | Stormlance Wings | 2240 x 952 | 560 x 448 |

`*-sheet.png` has a transparent background, `*-sheet-black.png` a solid black one. Exact sizes and anchors are also in `sheets.json`.

## Layout
- 4 columns x 2 rows, row-major: **F1 Flare, F2 Upstroke Peak, F3 Power Snap, F4 Max Extension** (top row),
  **F5 Recovery Lift, F6 Hover, F7 Hover Billow, F8 Hover Settle** (bottom row).
- Every cell = a 28 px label strip on top (frame name) + the frame itself below it. Cell origin of frame k:
  `x = (k % 4) * frameW`, `y = floor(k / 4) * (frameH + 28) + 28`.
- Art scale 2x the in-game size (in game the wings are drawn at 1x around a ~60 px tall character).

## Anchor
The anchor is the shoulder-blade root shared by both wings, identical in every frame of a sheet:
Halo Seraph (256, 270), Abyssal Shroud (316, 310), Stormlance (280, 294), in pixels from the top-left of each frame
(horizontally centred). Frame size is the union of all 8 poses plus 12 px padding, so no wingtip or trail particle is cut off.
Facing right (the far wing on the left is drawn 5 % smaller and slightly dimmer for depth).

## Cycle
- F1 plays once when the wings first open (equip, take-off / first jump into the air).
- F2 -> F3 -> F4 -> F5 -> F2 loops while flying / ascending. In game it is synced to the flight lift: F2 is the beat sound,
  F3 (power snap) is the moment of maximum lift. Keys are spaced 0 / 0.25 / 0.45 / 0.72 of a beat (fast downstroke, slow recovery).
- F6 -> F7 -> F8 -> F6 loops as the heavy hover / glide idle (about 2.3-3.2 s per loop).
- In game the frames are interpolated (Catmull-Rom), and the three tiers sample the cycle with small phase lags.
