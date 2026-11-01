# Putting Rootbound online for free

The server runs on **Render's free web service**, and saves are kept in **Upstash's free Redis database**. Neither asks for a credit card.
Render's free disk is erased on every restart, so the server copies its saves to Upstash and reads them back when it starts (`server/cloud.js`).

## What you do (about 15 minutes)

**1. Make the database.** Sign up at [upstash.com](https://upstash.com), create a Redis database, and copy its **REST URL** and **REST token**.

**2. Make the server.** The code must be on GitHub first. Then sign up at [render.com](https://render.com), choose **New > Blueprint**, and pick this repository. Render reads `render.yaml` and asks for these values:

| Setting | What to type |
| --- | --- |
| `OWNER_NAME` | Your in-game account name: 3-16 letters, numbers, `_` or `-` |
| `OWNER_PASSWORD` | A password of at least 12 characters. Only you know it |
| `OWNER_EMAIL` | Optional: your email, so you can sign in with it instead of the name |
| `UPSTASH_REDIS_REST_URL` | From step 1 |
| `UPSTASH_REDIS_REST_TOKEN` | From step 1 |

These stay in Render's dashboard. They are never in the repository or in the game file.

**3. Play.** Render gives you an address like `https://rootbound.onrender.com`. Open it, go to **Worlds > Sign in**, and sign in with your owner name and password. Type `/god` in chat to check it worked.

**4. Optional: the desktop app and GitHub Pages copy.** They stay single-player until they know the address. Put it in `RB_SERVER` near the top of `src/legacy.html`, rebuild and publish.

## Accounts and monsters

- **Each account has its own save, kept on the server.** A new account always starts at level 1, and it follows the account to any computer. The offline save on a computer stays separate.
- **Resetting every account:** raise `ACCOUNT_GEN` in `server/server.js` by one and deploy. It runs once when the server starts: every account and saved progress is deleted, the owner is recreated, and worlds stay but belong to nobody. This cannot be undone.
- **Monsters are shared.** One player's computer runs each world's monsters and sends their positions about 5 times a second, only while at least two players are in that world. This uses some of the free bandwidth, roughly 10 MB an hour per player. Bosses, letter wardens, totem waves, rifts and vault guards stay personal.

## What the free plan means

- **It sleeps.** After 15 minutes with nobody connected the server stops, and the next visitor waits about a minute while it starts. Nobody is cut off while they are playing, because game traffic keeps it awake.
- **Saves wait up to 20 seconds.** A restart saves first, but a crash can lose the last 20 seconds of changes.
- **Bandwidth is limited.** Render's free allowance was reported as 5 GB a month in August 2026, shared with everything in your account. If it runs out, the server is suspended until next month, and you are not billed unless you added a card. Movement is sent in small updates to make this last, but expect a small group of friends rather than hundreds of players. Check your usage in Render's dashboard.
- **Upstash allows 500,000 commands and 250 MB.** Saves are batched, so this should be plenty for a small game.
- **Moving to a paid host later is easy.** It runs on any machine with Node 18+. Without the Upstash settings, it keeps saves on its own disk.

## Owner commands (type in chat)

| Command | What it does |
| --- | --- |
| `/god`, `/god off` | Max level, everything unlocked, 999 of every block, no damage, build anywhere. Stays on until you turn it off. Off reloads the page and restores your real save |
| `/pull name` | Brings a player in this world to you |
| `/summon name` | Brings a player from any world to you |
| `/ban name [minutes] [reason]`, `/unban name` | Bans an account, online or offline. No minutes means until you unban |
| `/give name item [amount]` | Gives items or gems. Item is `gems`, a number, or a name like `iron_ore`. `me` means you |
| `/kick name`, `/smute name [minutes]`, `/sunmute name`, `/announce text` | Removes, silences or unsilences a player, or messages everyone |

Everyone can use `/trade name [giveItem n wantItem n]`, `/drop item [amount]` and the wrench (press **V**, click a player). To claim a world with no owner, place a World Lock in it.

## Limits worth knowing

The server decides who owns and can edit each world, what blocks and dropped items exist, and every trade, ban and gift. These parts are not fully protected or shared:

- **Earned items and gems are reported by the game on the player's device.** The server limits how fast they can grow, but a modified client could still claim items slowly.
- **Levels and most progress are saved on each device**, not on the server.
- **Monsters run separately on each player's screen**, so two players in a world do not see the same monsters.
- **Guests** can look around and pick up items, but they cannot own worlds, trade or drop. Guest bans work by address.
