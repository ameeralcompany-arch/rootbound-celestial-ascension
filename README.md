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
