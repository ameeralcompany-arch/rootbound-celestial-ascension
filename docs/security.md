# Security

What protects the game, and what cannot be protected. `tests/security.js` attacks a real server with a raw client and runs in CI.

## Accounts

- Passwords are stored only as salted scrypt hashes, and session tokens only as hashes. Weak passwords are refused.
- Guessing is limited per connection, per address and per account. Mass sign-ups are limited per address.
- Change password (Network panel) signs every other device out. The owner password lives on the host (`OWNER_PASSWORD`).
- Owner commands are checked on the server on every call, and refused attempts are logged.

## The game page

- Rootbound is a Windows app. The live server gives a browser only a download page (`server/download.html`) and hands out none of the game's files. The app has no Content-Security-Policy header and relies on the server filtering what other players send plus the client escaping it.
- The server accepts connections only from the app, which it recognises by the app's browser identification. This stops ordinary browsers, not someone who writes their own client and fakes that identification, so everything the server already checks still matters.
- Test runs still load the game page from a local test server, with a Content-Security-Policy that allows only the exact inline scripts of the current build (by hash). The download page has the same policy.
- Everything other players send is filtered on the server and escaped on the client.
- Playwright's `waitForFunction` evaluates strings in the page, which this policy blocks, so tests that use it start the server with `csp:false`. `tests/security.js` keeps it on.

## The server

- Every world edit, trade, drop and purchase is re-checked. World ownership, gems and traded items are held on the server.
- A World Lock comes out of the server's ledger when placed; only a lock that was really paid for is handed back on release.
- Message rates and sizes are limited, connections that never identify are closed, saves have a total budget (`PROFILE_BUDGET`) so the free database cannot be filled, and a failing handler cannot take the server down.

## The desktop app

- Sandboxed, no Node in the page, no navigation away from the game, no new windows, no camera or microphone permission.
- `desktop/harden.js` turns off running the exe as Node, NODE_OPTIONS, debugger flags and loading game files from outside `app.asar`. Playwright cannot drive a hardened exe, so test before hardening; `--smoke` still works after it.

## What cannot be fully secured

- **Cheating that stays within the limits.** Mining, monster fights and movement run on the player's computer, so a modified client can claim items and gems up to the honest rate (`server/shop.js`, `server/economy.js`). Claims beyond it are refused and written to the audit log as `cheat-watch`; the owner reads them with the audit command. Stopping it entirely would mean running the whole game on the server.
- **The Windows warning.** Only a code-signing certificate tied to a verified identity removes the "Unknown Publisher" message. Nothing in the app can do it.
- **A player's own computer.** Malware there can read that player's session.
- **Large floods of traffic.** The free host has no protection of its own beyond what its provider gives.


## Player safety

- **Chat words.** `server/moderation.js` masks a short list of abusive words on the server, so no client can skip it. It reads through look-alike characters and matches whole words only, so "class" and "Scunthorpe" stay as they are.
- **Block.** The Block button or `/block name` hides that name's chat on your screen and makes the server refuse their trade requests. `/unblock name` undoes it. The list is saved on your account.
- **Report.** The Report button sends the reason and that player's recent chat in that world to the owner's Tools panel, under Reports. Limit: 5 reports an hour per player. Reports are kept in `reports.json` and also written to the audit log.

## What the server does not check

Equipping is client-side: what you wear is sent to other players as part of your presence, and the server doesn't check it against what you own. Store purchases and gem growth are checked. Moving equipment to server authority would be a separate project, because the game's fights also run on the player's computer.


## The owner

Only the server decides who the owner is: the account named by the owner settings (`OWNER_NAME`). Everything the owner does that other players can see goes through the `ofx` message, which the server refuses to anyone else and records in the audit log. It also throws away any `own`, `oa` or `ofl` a client puts in its presence and stamps its own, so a modified game can't claim the owner's plate or effects. While the owner is invisible the server stops sending their presence at all, so a modified game can't reveal them either. Flight and speed move only the owner's own character, as all movement in this game is the player's own computer's job.

To add an owner command: `OWN15.reg('name','[usage]','what it does',args=>'reply')`. To change the entrance music: replace `audio/owner-entrance.mp3`; the track list is `MUSIC` in `src/js/late/99-zzzzzzzzz-5-owner.js`, and new tracks also need a line in the audio route in `server/server.js`. The landing is timed to the hit 2.75 seconds into the current track (`TIMES` in the same file).
