# Security

What protects the game, and what cannot be protected. `tests/security.js` attacks a real server with a raw client and runs in CI.

## Accounts

- Passwords are stored only as salted scrypt hashes, and session tokens only as hashes. Weak passwords are refused.
- Guessing is limited per connection, per address and per account. Mass sign-ups are limited per address.
- Change password (Network panel) signs every other device out. The owner password lives on the host (`OWNER_PASSWORD`).
- Owner commands are checked on the server on every call, and refused attempts are logged.

## The game page

- A Content-Security-Policy allows only the exact inline scripts of the current build (by hash) and lets the page talk only to its own server, so injected code cannot run or send a token elsewhere. It applies to the page the server hosts. The desktop app and a GitHub Pages copy have no such header and rely on the server filtering what other players send plus the client escaping it.
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
