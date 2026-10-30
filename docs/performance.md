# Performance: compounding FPS drops in heavy play

Rootbound is a 2D canvas game in Electron (Chromium + V8). The Unity and Unreal ideas below map one to one: GC.Alloc becomes V8 heap
churn, draw calls become canvas draw operations, and object pools are the same thing.

## Diagnosis (measured, not guessed)

| Symptom | Tool | Finding |
|---|---|---|
| FPS falls the longer a fight lasts | `tools/perf/soak.js` (5 min of mining, weapon spam, rain, pets, boss fights; samples every round) | Heap after GC stayed 19–23 MB; DOM, timers and listeners were flat. **Living monsters climbed 7 → 140** while FPS fell 114 → 86 and p95 frame time 11.6 → 26.7 ms. |
| Is any one system scaling badly? | `tools/perf/mobprof.js` (ms per frame per function at 10 / 40 / 80 / 140 monsters) | Linear, about 0.02 ms per monster, almost all of it drawing. **Every monster was drawn, even far off screen.** |
| GC stutter | `tools/perf/gcprof.js` (heap churn plus V8 GC trace) | About 23 MB/s of short-lived garbage. Minor GCs are under 1 ms. About 1 full GC every 1.6 s, up to 5.8 ms. |
| Who makes the garbage? | `tools/perf/allocprof.js` (sampling heap profiler, including collected objects) | Spread thinly over per-frame drawing: colour strings, gradients and small objects in the main draw (12 %), weather (10 %), water (6 %), break-effect wisps (5.5 %) and sky (5 %). No single hot spot. |

**Root cause of the compounding drop:** the natural spawner caps monsters at about 14, but boss minions, infection spawns, rifts and
depth guardians call `mobs.push` directly. During a long fight the count only goes up, and every one of them is drawn every frame.

## Fixes in the game

1. **Entity ceiling** (`src/js/late/99-zzzzzzzz-entgov.js`, ENT13). At most 36 living monsters (24 with reduced effects; 28 while the
   frame-time governor is cutting effects).
   - Ordinary spawns past the ceiling are skipped.
   - Bosses and rift, vault or elite monsters always spawn. If that goes over the ceiling, the farthest ordinary monster leaves.
2. **Off-screen culling.** Monsters outside the view plus a margin are not drawn. They still move, fight and count.
3. **Particle pooling.** `burst()` particles are reused from `PPOOL`. They live about 1 s, long enough to be promoted to V8's old
   heap, which feeds the expensive full collections. Dead particles are swap-removed (O(1)) instead of spliced out.
4. **Already in place and kept:**
   - PERF7, the frame-time governor: scales particle counts by how far frames run over budget.
   - DEB12: a typed-array debris pool.
   - SKYC7: the sky is cached and repainted at 48 Hz.
   - TILE7: tile chunk cache.
   - Bucketed, capped sprite caches.

Result:
- The soak holds 108–128 FPS with monsters held at the ceiling.
- `tests/perfsoak.js` fails the build if monsters, heap, DOM, timers or listeners grow, or if FPS at the end falls below 80 % of
  the start.
- The remaining FPS dip in that test is the boss fight it starts halfway through.

## Diagnostic guide

1. **Reproduce long, not loud.** A compounding drop only shows over minutes. Run the soak, or play the heaviest scene for 5 minutes
   with the FPS counter on (Settings › Interface).
2. **Separate "growing" from "busy".** Sample counts every 20–30 s: entities, particles, heap after a forced GC, DOM nodes, active
   intervals, listeners. Anything that only goes up is the cause. A flat, high frame time is a budget problem instead.
3. **Scale test the suspect.** Time each per-frame function at 10×, 40×, 80× and 140× load. Linear growth means cap the count;
   worse than linear (pairwise collision, `includes` / `filter` inside loops) means fix the algorithm.
4. **GC.** Look at churn (MB/s) and full-GC pauses. Minor GCs are cheap. Full GCs come from objects that live just long enough to be
   promoted (particles, projectiles, floating text): pool those first.
5. **Draw cost.** Cull off-screen work. Pre-render static layers to offscreen canvases (the sprite atlases do this). Avoid per-frame
   `createLinearGradient`, `shadowBlur` and `filter` in hot loops. Batch by state: set `fillStyle` and composite once per group.
6. **Keep it fixed.** Add the scenario to `tests/perfsoak.js` so a regression fails CI.

## Patterns

Object pool (the PPOOL pattern):

```js
const POOL=[];
function spawn(x,y){const o=POOL.pop()||{};o.x=x;o.y=y;o.life=1;live.push(o)}
function update(dt){for(let i=live.length-1;i>=0;i--){const o=live[i];o.life-=dt;
  if(o.life<=0){const z=live.pop();if(i<live.length)live[i]=z;if(POOL.length<1000)POOL.push(o)}}}   // swap-remove + recycle
```

Hard ceiling with priority:

```js
function add(e){if(count()<CAP||e.important){if(count()>=CAP)removeFarthestOrdinary();list.push(e)}}   // never block what matters
```

Delta-time throttling. Run expensive, slow-changing work at a fixed lower rate, and catch up with dt:

```js
let acc=0;function tick(dt){acc+=dt;if(acc<1/30)return;slowUpdate(acc);acc=0}
```

Frame-budget governor. Scale optional effects by how far frames run over budget (see `PERF7` in
`src/js/late/40-z-perfgov.js`):

```js
ema+=(frameMs-ema)*.05;k=Math.max(.45,Math.min(1,best/ema));particles=Math.ceil(n*k);
```

## Running the tools

```
$env:NODE_PATH="<playwright>\node_modules"; $env:CHROMIUM="C:\Program Files\Google\Chrome\Application\chrome.exe"
node tools/perf/soak.js . 12 25000     # rounds, ms per round
node tools/perf/mobprof.js .
node tools/perf/gcprof.js .
node tools/perf/allocprof.js .
node tests/perfsoak.js
```
