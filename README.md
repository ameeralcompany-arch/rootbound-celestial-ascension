# Rootbound

A multiplayer block-building sandbox. This repo is a single static file (`index.html`), so it deploys to GitHub Pages with no build step.

## Deploy to GitHub Pages

1. Create a new **public** repository on GitHub (for example `rootbound`).
2. Upload the contents of this folder to the repository root (`index.html`, `README.md`, `.nojekyll`).
   - Web UI: *Add file -> Upload files*, then commit.
   - Or with git:
     ```
     git init && git add . && git commit -m "Rootbound"
     git branch -M main
     git remote add origin https://github.com/<your-user>/rootbound.git
     git push -u origin main
     ```
3. In the repository go to **Settings -> Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute your game is live at `https://<your-user>.github.io/rootbound/`. Pages serves over HTTPS, which WebRTC needs.

## Play with a friend

1. Open the game, press **Worlds**, then **Host this world**. A 5-letter room code appears with an invite link.
2. Send your friend the code (they press **Worlds -> Join** and type it) or the invite link (`...?room=CODE`, which joins automatically).
3. Keep the host's tab open and visible. When the host closes it, the room closes. Up to 8 players fit in a room.

World edits, chat and player positions sync live. The host's world is saved in the host's browser.

## How the networking works

- PeerJS opens WebRTC data channels between browsers. The free PeerJS cloud server (`0.peerjs.com`) only introduces peers; game data goes peer to peer.
- The host relays messages and validates them (block edits, World Lock permissions, presence data).
- Some networks (strict corporate/school Wi-Fi, some mobile carriers) block direct WebRTC and need a **TURN relay**. The file ships with the public Open Relay TURN servers as a best-effort default, but shared free relays can be slow, rate-limited or change without notice. For reliable play, put your own STUN/TURN servers in the `rb-config` block near the top of `index.html`:
  ```js
  window.RB_CONFIG={
    ice:[{urls:'stun:stun.l.google.com:19302'},
         {urls:'turn:YOUR_TURN_HOST:443',username:'USER',credential:'PASS'}],
    peer:null   // or {host:'your-peerjs-server.example.com',port:443,path:'/',secure:true}
  };
  ```
- The game will not connect from inside an embedded frame (for example the Claude artifact preview). Open the GitHub Pages URL in its own tab.

## Troubleshooting

| Message | Meaning |
|---|---|
| No room with that code | Wrong code, or the host closed the room. |
| Timed out / server not answering | The PeerJS server or WebRTC is blocked or down. Try another network, or set your own `peer` server. |
| PeerJS script could not be loaded | A filter blocks the CDN. The game tries jsDelivr, unpkg, then cdnjs. |
| Room is full | The host already has 7 guests. |

---
# V6.1 — Sandbox MMORPG expansion (this release)
Source: `src/` (modular) -> `python3 tools/build.py` -> `index.html`. Tests: `node tests/run.js` (58 UI/render/account tests), `node tests/objects.js`, `node tests/social.js`.

## What was added
- **Interactive objects** (one reusable system, `src/js/late/91-objects.js`): 7 door types (Oak, Stone, Steel, Magic Portal, Neon, rare Starlit Gate, Sealed Gate), chest, crate, sign, lantern, lever, pressure plate, teleport pad, crafting table, training dummy, waystone, bench, banner. All original art drawn in code with open/close animation, glow, light and throttled sounds. Sold by the shop NPC (level gated).
- **Doors** (`92-doors.js`): E to use, G to configure (owner/builders). Destinations: another world, this world's spawn, or a linked gate/pad by label. Access: everyone / trusted+ / builders+ / owner. Requirements: level, Gate Key (optionally consumed), a lever/plate being on. Fade/portal transition, re-entrancy lock, loop guard (max 4 world jumps / 10 s), broken-link messages, name sanitising.
- **World roles**: Owner / Builder / Trusted / Visitor / Banned, per-world (World Lock owner). World tab in the hub: description, public-build toggle, listed/private, spawn, role dropdowns, bans. Waystone binds the spawn point.
- **Chests** with host-authoritative take/put (guests only receive items after the host confirms => no duplication through the protocol).
- **Crafting** (`93-craft.js`): data-driven recipes, discovery, station requirement, timed crafts that finish while you are offline, validate-then-consume.
- **Social** (`94-social.js`): chat flood limit (client + host), mute, emotes (key B / `/e`), whispers, friends, profiles, two-phase confirmed trading (escrow + refund on timeout), no real-money anything.
- **Creator console** (`95-admin.js`): `/admin on`, `/a help`. Spawn/gems/level/tp/bring/goto/kick/ban/unban/mute/perm/weather/door test/inspect/new+delete test worlds/log.
- **Hub tabs**: World, Directory (honest: only your visited worlds + live lobby when present), Social, Crafting.
- Farming: crops already grow from a stored planting timestamp, so growth continues while the game is closed (tested).

## Honest limits (read this)
- **There is no trusted server.** Authority is the browser that hosts a room. The creator console therefore works only for the room host / an offline sandbox; guests cannot run it and only obey teleport/kick that come from the host's own peer id. A real CEO/Superadmin role, permanent shared worlds, a global directory, anti-cheat, secure accounts and secure trading need a backend (accounts + roles verified server-side + a database). Nothing here stores money or payment data.
- **Accounts are a local prototype** (PBKDF2 in the browser), not real security. World data is localStorage per browser; it is shared with others only while the host is online.
- **Trades/whispers** go through the host relay: a modified client can cheat in a trade or read whispers addressed to others. The protocol only guarantees conservation between honest clients.
- Guests who travel through a cross-world door leave the host's room (a room = one world).
- Not implemented: one-way platforms/ladders, background tile layer, dungeons beyond the 3 bosses, character pose animations beyond emote bubbles/hop, private-message channel confidentiality, a ring-style "unlock cosmetics" admin command, interact-key remap.
- Windows `.exe` is **not built**: the authoring sandbox cannot download Electron. `rootbound-win/` contains a ready Electron wrapper + `build-windows.bat`.

## Test report (what actually ran)
Ran headless Chromium in the sandbox: `tests/run.js` 58/58, `tests/objects.js` (objects, door permissions, keys/levels, config sanitising, chest conservation, host validation, crafting, farming, save/reload persistence) all pass, `tests/social.js` (two real page instances joined by an in-memory fake room: trade conservation/decline/forgery/escrow refund, host op validation, rate limits, mute, whispers, console gating, host-only teleport) all pass.
NOT run: real PeerJS networking, >2 clients, real devices/GPU frame rates (headless timings are not representative), long-session soak, the Windows build.

## V7 – Editorial showcase, simpler inventory, chests

- **Showcase home screen** (`src/js/late/98-showcase.js`): pearl/ivory editorial page with a large procedurally drawn character (`89-showart.js`), index `01/06` with prev/next + ←/→ keys, rank/stars, name, lore, XP, favorite, Play/Select/Customize, and a "My Gallery" (Characters / Wings) 2x2 grid. Nav items only link to things that exist (Inventory, Store, Worlds, Collection, Profile, Settings). Opens after login; the ⌂ HUD button reopens it.
- **Characters**: slot 1 is your own look; 5 original presets unlock by level (locked ones are greyed and cannot be played). Choices persist per account.
- **Inventory**: filter chips, 3-slot hotbar (2 blocks + 1 weapon), friendly chest window, brown backing under terrain removed.
- **UI sounds** (`87-uisfx.js`): quiet synthesized cues, rate limited, mutable.
- **Tests**: `tests/showcase.js` (3 viewport sizes), plus objects/social/run suites all pass in headless Chromium.

### Not yet done / unverified
- Real-device FPS and real PeerJS multiplayer remain untested.
- Store dialog, hub, menu, HUD and skills row are still the older dark theme; no friendly trade window yet (use `/trade`).
- Art polish (eyes, shoulders), extra weapons, new lofi music and new block art are not done.
- Showcase portraits are procedural vector art, not hand-drawn character art.

## Black-screen fix (V7.1)
Cause confirmed by reproduction: the page loaded PeerJS and Google Fonts as **render-blocking** resources. If those hosts are slow or blocked on a network, the browser never creates the page body, so you see a blank/black window. Now: nothing external blocks startup; a loading screen appears immediately; `RBDIAG` records stages/errors; if the game does not reach its first frame within 12 s a diagnostic panel with a **Copy report** button appears. Blocked `localStorage` falls back to memory. The Windows build also ships `Rootbound-Safe-Mode.bat` (hardware acceleration off) in case a GPU driver is the cause on your PC. This was reproduced and fixed in headless Chromium; it has **not** been observed on your physical PC.


## V8 – Persistent worlds, owner-only admin, weather, themes (current)

**What changed**
- Startup: external fonts/PeerJS no longer block rendering; loading screen, diagnostics report, safe mode (see `tests/boot.js`).
- Multiplayer: host rooms are gone. `server/` is a dependency-free Node server (accounts, worlds, weather, admin, saved to disk). The client (`75-net.js`) connects to it, shows a public world directory, auto-reconnects, and stays playable offline.
- Admin: exactly one owner account, set with `node server/cli.js set-owner <Name>` (password stored as a scrypt hash). Every privileged action is authorised on the server; the **TOOLS** button only appears for the verified owner.
- Weather: every world has weather saved with it. Three distinct machines (Blossom, Space, Galaxy) change it for everyone in the world; persists across leaving and server restarts. Backgrounds are procedural (no image files to go missing).
- NPCs: distinct accessories per NPC, weather-themed styling, greeting sparkles (they do not walk; shops and quests depend on their position).
- Design system: `src/css/50-system.css` holds all tokens (colour, surfaces, rarity, radii, shadows, motion). Pearl light theme by default, plum night dark theme, "match system"; chosen in Hub → Settings, with UI-sound volume/mute and reduced motion.

**Run it**
- Offline: open `index.html`.
- Shared worlds: `node server/cli.js set-owner YourName`, then `node server/server.js`, open `http://localhost:PORT/` (the server also serves the game). See `server/server.js` header for env vars (PORT, DATA_DIR).

**Tests (all run in CI):** `server`, `boot`, `run` (58 UI/render), `objects`, `social`, `showcase`, `theme`, `e2e` (real server + real browsers: join, presence, block sync, weather machine, restart persistence, owner-only Tools).

**Not verified / limits**
- I cannot run the game on your PC; the black-screen cause I could reproduce (blocking CDN loads) is fixed and covered by tests, but if your screen is still black, open the game, wait ~10 s, and use the diagnostic panel's copy button.
- Player inventories, gems and levels are still stored on each device (the server is authoritative for worlds, roles, weather and admin only). Trades are peer-to-peer relays.
- The server has no TLS of its own: put it behind HTTPS (Caddy/nginx/Cloudflare) for public play.
- Real-device FPS, real internet latency and a production deployment are untested.
- The full-game reskin is partial: HUD, hub, menus, dialogs, login, inventory, showcase, chest/object panels and icons use the new tokens; the store dialog, crafting/farming panels and trade UI still use older markup with token-mapped colours, and block art is unchanged.


## V9 – Item Store, new weapons/wings/effects, music (current)

**What changed**
- **STORE** button (top right, always visible) opens a full store: Featured + collections, Weapons, Wings, Effects, Charms, Weather machines, Gear, Blocks, Seeds, Objects. Search, rarity filter, sort, "Owned only", animated preview, rarity/price/level/owned/equipped badges, purchase confirmation for bigger buys. All old shop items are in it; Mira's shop still works.
- **Catalog** is one file (`server/catalog.json`, built by `tools/gen-catalog.py`, inlined into the game by `tools/build.py`). 124 items. The server and the game read the same prices and rarities.
- **Purchases**: signed-in players buy through the server (`server/shop.js`): the server checks the item id, ignores any price the client sends, checks ownership and funds, never double-charges (request ids), and saves wallet + ownership to disk. Guests and offline play buy locally on the device.
- **New weapons** (each has its own model, swing trail, hit effect, sound, stats): Void Reaper (upgraded), Solar Fang, Frostbite Edge, Astral Katana, Crimson Rift, Verdant Breaker.
- **New wings** (own silhouette, colours and particles): Dove, Blossom, Crystal, Mechanical, Umbral Eclipse, Galaxy, Dragon, Omen Moth. Owned wings are chosen in the Character menu or the Store; they are separate from level-unlocked wings.
- **Effects**: 5 auras, 3 dash trails, 2 spawn effects, victory nova (boss defeat), 3 weapon trails, 3 weapon skins, 5 charms (Raven Companion flies beside you). Auras, charms and wings are visible to other players; they all share the game's capped particle pool.
- **Music**: calm generated music (no files) for Plaza, Blossom, Space, Galaxy and Combat, following the weather and nearby fights. New Ambience slider next to Music and Sound effects.
- **NPCs** exist only in the Plaza.

**Tests added**: `tests/store.js` (catalog/previews, 6 weapon models distinct, 8 wings distinct, purchase rules, persistence after reload, store UI, all cosmetics together, plaza-only NPCs, music moods); store block in `tests/server.js`; purchase + restart persistence in `tests/e2e.js`.

**Not verified / limits (honest)**
- Gems, levels and inventories are still earned on the device; the server limits how fast a signed-in wallet can grow but cannot prove gems were earned fairly. Level requirements for items are checked by the game, not the server.
- Weapon trails/impacts/sounds are visible/audible to the player using the weapon; other players see the weapon model. Weapon skins and weapon-trail colours are local-only.
- I could not listen to the music or watch frame rates on a real PC. Art is procedural (drawn by code), not hand-painted.
- The reference-inspired world art and full UI redesign of crafting/trade panels are only partly done.

## V10 – Sounds, water, blocks, plaza, music (current)
- **Voices and monsters:** the character now shouts short Japanese words (ya, ha, hai, ei, hya, ta, sei) when attacking, and each monster has its own soft, cute hit/defeat/idle sound.
- **Rain:** the loud rain noise bed is gone.
- **Water:** new realistic water drawing (depth colour, waves, foam, light shafts, bubbles) and a "blop" / splash sound when you put something in or step into water.
- **Wings:** wearable wings were removed (owners are refunded automatically). The wings in Appearance are the main wings, and **all of them give a double jump**.
- **Blocks:** 18 new blocks (ids 42-59, listed in `tools/new-blocks.json`) with hand-painted textures, bevel lighting, and glow for the crystal and lantern blocks. All are in the Store.
- **Plaza:** rebuilt from the new blocks only: pond with an arched bridge, cottage, fountain with a glowing crystal, torii gate, two-storey teahouse, bamboo grove, cherry trees, lantern strings, mountain backdrop. NPCs and the door keep their positions.
- **Music:** every weather and place has its own songs (10 moods, 2-3 songs each). Songs are generated from a motif that changes as it goes, and the same song never plays twice in a row.
- **Honest limits:** all sounds and music are synthesised in code. The tests check that they start and switch correctly, but nobody has listened to them, so tone and loudness are unverified; the Volume sliders in Settings control them. All art is drawn in code, not hand-made.

### V10.1
- **Companions:** four original spirits (Lumi the firefly, Mochi the cloud, Pebble the moss golem, Kitsu the two-tailed fox) in the Store's Charms tab. They follow you, hop when you jump, shut their eyes when you are hurt and doze when you stand still. Other players see them too.
- **Voice settings:** a separate Voice volume slider and a Subtitles switch (shows the Japanese word and its English meaning) in Settings.
- **Fixes:** startup crash with saves that own Store weapons or removed wings; weapons bought in the Store are kept across reloads; chests drop their contents when broken.
- **Collection Book:** the home screen "Collection" page now shows every Store item by category with owned counts and 25/50/75/100% gem rewards (offline play only; a signed-in online account never gets client-side gems).
- **Still not done (honest list):** the voice is synthesised in code, not recorded by a voice actor (no recording tool here); there is no mini-game, treasure-hunt or world-event system beyond what V9 already had.
- **Performance (V10.2):** the game now starts on Low when the PC has no hardware canvas/WebGL, adds a "Lowest (very weak PCs)" graphics level that Auto uses when frames stay slow, turns off panel blur on Low/Lowest, and paints the plaza mountain backdrop at reduced resolution only when the camera moves. The same look is kept on Medium and above. I measured the work per frame in a software-rendered test browser; I could not measure on your PC.
- **New plaza activities (V10.3):** a *Spirit Stone hunt* (7 hidden glowing stones: underwater, on the bridge, inside the cottage and teahouse, in the bamboo grove, in the fountain; +50 gems each, +500 and the "Stone Seeker" title for all 7) and the *Sky Run* parkour course (14 floating platforms from the START pad over the cottage side to the gilded FINISH; best time saved; under 90 s earns "Sky Runner" and 150 gems). Gems from both are only paid in offline/guest play. A scripted test player finished the course in about 14 s without wings; I have not played it by hand.

## V11 — Star Atlas (planetary world selection)

- **Worlds are planets.** The Worlds button, the Home screen's Worlds tab, the new planet button in the HUD and the old "Enter / Random world" boxes now open the Star Atlas (`src/js/late/89-planets.js`, `89-planets-gfx.js`, `src/css/65-planets.css`). Each planet is one real saved world on this device (recent worlds list + saved edits), plus the Plaza as the central hub.
- **Planets are procedural.** 10 looks (Verdant Haven, Cherry Blossom, Frostbound, Void Expanse, Astral Frontier, Galaxy Core, Ember Reach, Tidal Veil, Aurelian Dunes, Lumen Plaza), each with its own surface, clouds, atmosphere, orbiting particles, moons or ring. Nothing is loaded from files.
- **What is real and what is cosmetic.** The planet's *sky* follows the world's real weather setting (a Blossom/Space/Galaxy sky shows as the matching planet). Other themes (frost, void, ember, ...) are only how the planet looks; they do not change gameplay. Worlds without a chosen theme get one assigned from their name, and the panel says so. Stats shown are only what is really saved: blocks changed, objects placed, claimed-by, last played (recorded from now on), visit count.
- **Create** = name + theme with a live preview and a formation animation. The world record and an empty save are written *first*; terrain is generated by the normal world generator when you enter, so a failed load shows an error and keeps every other world.
- **Rename** changes the display name only (terrain is generated from the world id). **Delete** needs you to type the id, cannot delete the world you are standing in, and offers Undo. **Duplicate was not built**: a copy would get different terrain because terrain comes from the id, so it would not be a true copy.
- **Discovery.** Worlds you have never entered look veiled; worlds first met outside the atlas are announced the next time it opens. The Atlas button counts the world *types* you have really entered (3 / 6 / 10 give gems offline only and, at 10, the title Star Cartographer).
- **Motion/perf.** Reduce-motion turns off orbiting bits, travel animation and rotation; low-quality mode uses fewer particles. All textures, particles and the canvas are freed when the atlas closes.
- **Sound** is synthesised (a soft pad and sparse bells while open, hover/select/travel cues). It follows the music and UI-sound settings and lowers the game music while open. It has not been listened to by a person.
- Honest limits: only checked by automated tests and screenshots (`tests/planets.js`), not hand-played on a real PC; world data lives on this device, signed-in server worlds are not listed by name.
