# The Rootbound launcher

The launcher is a separate Windows app that installs Rootbound, keeps it up to date, and starts it. The game itself doesn't change: it is still `index.html` inside Electron. Saves stay where they have always been, in `%APPDATA%\Rootbound`.

## The short version

You need Node.js 18 or newer and `npm install` run once inside `desktop/`. This PC already has both.

First time only, on this PC:

```bash
gh auth login
```

```bash
node tools/publish/keygen.js
```

```bash
node tools/publish/build-launcher.js
```

Then give players `build/launcher/RootboundSetup.exe`.

Every time you have a game update:

```bash
node tools/publish/publish-update.js --bump patch --notes "What changed, in a sentence or two"
```

That's all. Every installed launcher sees it the next time it checks (when it opens, and every four hours while it runs) and downloads only what changed.

## Back up your signing key

`keygen.js` creates `C:\Users\<you>\.rootbound-publish\signing-key.pem`. It is the proof that an update really comes from you, and it never goes in the repository or to players.

**Copy that file somewhere safe, such as a password manager or a USB stick.** If you lose it, installed launchers will refuse new updates until players install a new launcher. If someone else gets it, they could sign updates, so keep it private. To change keys: add the new public key to `publicKeys` in `launcher/update-config.json`, ship a launcher with both keys, wait for players to move over, then switch `keyId` in `publish/publish.config.json`.

## Building the game

The publishing tool does this for you. On its own:

```bash
node tools/build.js
```

`tools/build.js` builds `index.html` from `src/`. `tools/build.py` gives the same result if you prefer Python.

The version lives in `version.json`. `--bump patch`, `--bump minor` and `--bump major` raise it for you.

## Publishing a game update

```bash
node tools/publish/publish-update.js --bump patch --title "Rootbound 6.13.1" --notes "Fixed the bridge in the Crimson Depths."
```

In order, it:

1. Reads the version and checks it is newer than the one on the server.
2. Builds `index.html`.
3. Runs the tests listed under `validation.tests` in the config.
4. Packages and locks the game, and starts the result off-screen to prove it reaches its first frame.
5. Hashes every file with SHA-256 and works out what changed, was added or was removed since the published version.
6. Uploads only the new parts.
7. Signs the manifest.
8. Adds your notes to the news feed.
9. Replaces `latest.json` last. This is the moment players can see it.
10. Reads the public address back, checks the signature and a sample of parts.

If anything fails, nothing goes live. Useful options:

| Option | What it does |
|---|---|
| `--dry-run` | Does everything except send anything to the server |
| `--skip-tests` | Skips step 3 (the game is still started in step 4) |
| `--notes-file notes.md` | Longer notes from a file |
| `--launcher` | Also publishes the launcher's own code |
| `--launcher-only` | Publishes only the launcher's code |

Tests need Playwright and Chrome, the same way as every other test here. The tool finds the copy already set up on this PC. On another PC, set `NODE_PATH` and `CHROMIUM`, or use `--skip-tests`.

The version on GitHub is still 6.12.0 and `main` has more since then, so use `--bump minor` the first time: that publishes 6.13.0.

To undo a bad release, publish the previous good code with a higher version number. Players can also go back themselves with **Game Library > Go back to**.

## Publishing the launcher itself

Change the code under `launcher/app/`, raise `version` in `launcher/package.json`, then:

```bash
node tools/publish/publish-update.js --launcher-only --notes "What changed"
```

Installed launchers download it quietly and offer a restart. The new code is checked against its signature every time it starts, and if it fails to start twice the launcher goes back to the copy it was installed with.

Changing `launcher/bootstrap/`, `update-config.json` or the Electron version needs a new installer, because those live inside the exe.

## News and events

Edit `publish/content/news.json`, put any pictures in `publish/content/images/`, then:

```bash
node tools/publish/publish-news.js
```

Launchers pick it up without any rebuild, at most 30 minutes later or the next time they open.

- **items**: `id`, `type` (`update`, `content`, `dungeon`, `equipment`, `developer`, `maintenance`, `event`), `title`, `summary`, `body`, `date`, and optionally `image`, `link`, `pin` (pinned items become Home banners).
- **events**: `id`, `title`, `summary`, `reward`, `start`, `end`, optionally `image`. Instead of dates, `recur` can be `weekly-utc-monday` or `daily-local`.
- **banners**: extra Home banners with `id`, `title`, `text`, and `image` or `art`.
- **maintenance**: `{ "title": "...", "text": "..." }` shows a notice at the top of Home. Set it back to `null` to remove it.
- **community.links**: extra links on the Community page.

The two events and four news items in the file now are real, taken from the game's code and the commit history. Change them however you like.

Everything is signed, including the hash of each picture, so a changed file on the host is refused.

## Where the files are hosted

The config is `publish/publish.config.json`, and it holds no secrets.

**Default: GitHub Releases on this repository.** The repository is already public, the game already ships from there, `gh` is already signed in on this PC, and it costs nothing. The launcher's files go in a release tagged `updates` and parts go in `updates-parts-1`, `updates-parts-2` and so on, marked as pre-releases so your normal "latest release" stays the game's. GitHub allows 1000 files per release, so the tool starts a new one at 900.

**Other storage:** change `storage` and `publicUrl`.

```json
"publicUrl": "https://updates.yourdomain.com/",
"storage": { "type": "s3", "endpoint": "https://<account>.r2.cloudflarestorage.com", "region": "auto", "bucket": "rootbound" }
```

This covers Cloudflare R2 (no download fees, the best choice if the game grows), Backblaze B2, AWS S3 and anything else with the S3 API. Keys go in `C:\Users\<you>\.rootbound-publish\credentials.json` as `{"accessKey": "...", "secretKey": "..."}` or the `RB_S3_ACCESS_KEY` and `RB_S3_SECRET_KEY` environment variables, never in the repository.

`"type": "folder"` writes to a folder for any static HTTPS web server.

**Moving hosts later:** `latest.json` must stay at the address built into the launcher (`channelUrl` in `launcher/update-config.json`), but manifests record the address of every part, so game files can move to another host without touching the launcher. Changing `channelUrl` itself needs a new installer.

## Giving the launcher to players

`node tools/publish/build-launcher.js` makes one file, `build/launcher/RootboundSetup.exe`, with everything bundled. To publish it, attach it to a normal GitHub release:

```bash
gh release create v6.13.0 build/launcher/RootboundSetup.exe --title "Rootbound 6.13" --notes "Now with a launcher."
```

Then point `README.md` and `server/download.html` at it. Those still link to `Rootbound-Windows.zip`, which keeps working.

**Windows will warn players** ("Windows protected your PC") because the installer isn't code-signed, the same as the current zip. Only a code-signing certificate removes that. It has nothing to do with the update signing above.

People who already play from the zip lose nothing: the launcher installs its own copy of the game, and saves are found in `%APPDATA%\Rootbound` as before.

## What the installer does

`RootboundSetup.exe` is a small program compiled from `installer/Setup.cs` with the C# compiler that ships with Windows, with the launcher zipped on the end. It shows a splash, unpacks the launcher to a temporary folder, and starts it in installer mode. That window lets the player pick a folder and shortcuts, copies the launcher into place, registers it in Add or Remove Programs, downloads and verifies the game through the normal update path, and offers Play. No administrator rights are needed: the default is `%LOCALAPPDATA%\Programs\Rootbound`.

Running it again offers Repair. Uninstalling removes the launcher, game, shortcuts and launcher settings, and keeps saves.

For scripted installs:

```bash
RootboundSetup.exe /silent --dir="D:\Games\Rootbound"
```

## How an update stays safe

```
latest.json          signed list: which version is current, and the hash of its manifest
manifests/game-x.json signed list of every file, its SHA-256, and its parts
chunks/<sha256>.br    the parts, compressed, each named by its own hash
```

- **Downloads only what changed.** Files are split at places chosen by their content, so a small edit inside the 30 MB `app.asar` costs a part or two rather than the whole file. Parts the PC already has are reused, even from inside a changed file.
- **Nothing unverified is used.** A part is hash-checked before it is unpacked, every rebuilt file is checked as a whole, and everything is checked again before going live. The launcher only talks HTTPS, and a redirect to plain HTTP is refused.
- **Forgeries are refused.** Unsigned lists, wrong keys, edited lists, older lists replayed to hold players back, and manifests with paths pointing outside the game folder are all refused.
- **A failed update can't break the game.** Each version is a complete folder under `game\versions\`. A new one is built beside the old one, test-started with a throwaway data folder, and only then does `install.json` switch to it in one atomic step. The previous version stays for going back, and unchanged files are hard links so this takes almost no disk.
- **Saves are never involved.** Nothing in the update path reads or writes `%APPDATA%\Rootbound`. The launcher only reads one file there, `rootbound-profile.json`, which the game writes for it.

## Where things are

```
launcher/bootstrap/   checks signatures, chooses what code to run; never changes after install
launcher/app/main/    windows, tray, installer and uninstaller steps
launcher/app/core/    update-manager, download-manager, manifest, signing, game-install, profile, settings, news
launcher/app/ui/      the pages
installer/            Setup.cs, icon, splash
tools/publish/        publish-update, publish-news, build-launcher, keygen, serve-local, storage backends
publish/              the config, and the news source
tests/launcher/       core.js (update path, about 30 s), e2e.js (everything with the real game, about 15 min)
```

Launcher settings, logs and news cache are in `%APPDATA%\Rootbound Launcher`.

## Testing without touching the real host

```bash
node tests/launcher/core.js
```

```bash
NODE_PATH="$TEMP/rbpw/node_modules" CHROMIUM="C:/Program Files/Google/Chrome/Application/chrome.exe" node tests/launcher/e2e.js
```

Both make a throwaway key and a local HTTPS server. `e2e.js` copies the real save to a temporary folder and never opens a visible window.

`tools/publish/serve-local.js` serves a folder over HTTPS with a self-made certificate if you want to try the whole path by hand. Test builds trust that certificate through `tlsCaPem` in their config. Real builds don't have it.
