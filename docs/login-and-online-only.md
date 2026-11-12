# The login screen and one online game

Rootbound now starts like an online anime RPG. You launch it, the login screen is the first thing you see, you sign in or create an account, it connects and loads your progress from the server, and you enter the online world. There is one game, one version, online only, with one account system and one save per account.

## What the player sees

**The login screen** (`src/js/late/99-zzzzzzzzzz-zz-login.js`, `src/css/99-zzzzzzzzz-login.css`):
- **Logo:** Rootbound's own symbol and wordmark reveal themselves, with the tagline "Every world is waiting to be remembered".
- **Class showcase:**
  - Each of the 13 classes is on stage as its own character, not one face with different weapons: its own hair, eyes, skin and build.
  - Each wears its evolved outfit, holds its Mythic, and stands in its own place with its own aura and floor sigil. These come from the evolution cinematics.
  - The characters breathe and blink, with wind in their hair and cloth, and turn their heads a little. Every eleven seconds they make a short flourish into their wind-up pose and back.
  - Light rays and floating motes drift, with stars over every scene, and the camera moves slowly.
- **Changing class:**
  - The class changes every eleven seconds, or when you pick one from the round portraits (or press the arrow keys).
  - The change is a cinematic: the old character slides away, a sweep of the new class's light crosses the screen, and the new character slides in.
  - The class name, role, weapon and a one-line description animate in with the class's colour.
- **The panel:**
  - A glass panel holds the account name, password (with show and hide), Remember me, Forgot password and Create an account.
  - The Sign in button has a shine, a hover glow, a press ripple and a loading spinner.
  - Below the panel: the server status (Connecting, Waking the server, Online with its ping, or Server unreachable), the game version, and a music switch.
- **Sound:** calm music written for the screen, about a minute long and looping without a seam (`tools/movie/score-login.txt`), plus soft interface sounds.

**Each step of signing in:**
- **Create an account:** the account name, password and confirmation. If this computer has progress from before accounts were required, "Bring my progress from this computer" is ticked by default.
  - The new account's recovery key is shown once.
  - Continue waits until "I have saved my recovery key" is ticked.
- **Forgot password:**
  - Enter the account name, the recovery key and a new password. You are signed in, and you get a new key; the old one stops working.
  - Accounts made before keys existed can make one in game (Worlds menu, "New recovery key"), or the server owner can type `/resetpw name` to give a temporary password.
- **Welcome back:** with Remember me on, the next launch shows "Welcome back, *name*" with one Enter button and "Use another account". With it off, the next launch asks for the password again.
- **Loading:** "Signing in", "Loading your progress", "Entering the world", then a fade into the online Plaza. A new character sees the intro film first.
- **No server:**
  - A free server that is asleep is waited for, with "Waking the server".
  - A server that cannot be reached shows "Can't reach the servers", with Retry.
  - Nothing ever starts offline.
- **In the world:**
  - **Losing the connection:** the game pauses behind "Connection lost, reconnecting" and resumes in the same world when the server is back. After 40 seconds it also offers Retry now and Back to sign in.
  - **Signing in elsewhere** shows "Signed in from another place" with Back to sign in. A kick or a ban works the same way.
  - **Signing out** returns to the login screen.

All text is in English.

## What was removed or consolidated

- **Offline play for players:**
  - The game no longer enters a local world at startup.
  - "Play here meanwhile" while the server wakes is gone, as is the local Plaza fallback.
  - Disconnecting no longer drops you into an offline save.
- **Guest play:**
  - The server refuses guests: "Sign in or create an account to play".
  - The client never asks to be a guest, and the "guest" sign-in fallback is gone.
- **The server address box and Disconnect button** in the Worlds menu are gone for players, along with the "saved on this device only" note. There is one server.
- **The single-player build switch:** players can no longer get a server-less build. That setting now exists only for automated test browsers.
- **The film-first start** (intro film, then the old title card) is replaced by the login screen, and the second logo reveal after it is skipped.

## What is kept, untouched

- Accounts, passwords, sign-in tokens, the 30-second progress upload to the server, and "the server's copy wins".
- The wallet, inventory, gear, classes, evolutions, worlds, multiplayer, parties, co-op dungeons, trading, owner tools, and the world, weather and economy code.
- The existing accounts on the server. Their saves are untouched.

Progress made on a computer before accounts were required moves into the first account created there, once, when the box is ticked.

## For automated tests only

Test browsers (webdriver) skip the login screen and may still run a world without a server or as a guest on a private test server. Each test server switches guests on with `allowGuests: true`; the live server never does. Players can't reach this path.

## Tested

`tests/login.js` runs the whole journey as a player, against a real local server. All checks pass:
- The login screen comes first, with nothing played behind it and no offline, guest or single-player option.
- The server refuses guests, and a wrong password is refused.
- A new account shows its recovery key, brings this computer's progress (level 7 came along), and enters the online Plaza.
- The same account on a second computer loads its progress from the server.
- Signing in elsewhere signs this one out.
- The server going down mid-game pauses behind "Connection lost", and play resumes in the Plaza when it's back.
- Signing out returns to the login screen.
- The recovery key resets the password; the old password stops working.
- Remember me on welcomes you back; off asks again.
- A server that can't be reached shows the connection screen, and Retry works.

It was also checked at 1280×720, 1366×768, 1600×900 and 2560×1440.
