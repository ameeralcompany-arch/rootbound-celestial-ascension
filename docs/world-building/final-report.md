# World building: final report

- **Brief:** "Complete world building, decoration, interactive objects and immersive environment system" (2026-11-15).
- **Starting point:** the git tag `checkpoint-before-world-building`, after master update 2.
- **Status:** built and tested in an off-screen browser and against a local copy of the online server. It is committed locally and **not pushed or published**. Nobody has played it yet.
- **The full list** of every block and decoration is in [catalog.md](catalog.md).

## 1. What was already there
- **Blocks:**
  - about 150 block kinds;
  - house blocks, background walls and house doors (BUILD9);
  - placeable objects with settings (doors, signs with your own text, chests, lamps, levers, teleport pads), handled by OBJ6;
  - summer seats you can sit on.
- **Feel and art:**
  - material sounds and texture debris when breaking (MSFX8, DEB12);
  - hand-painted soft-3D block art (BART9);
  - swaying grass, flowers, butterflies and fireflies (LIFE8).
- **Building tools:** a backpack with search and favourites, and a hotbar.
- **Online:** block edits are checked by the server, objects keep their settings on the server, and saving works offline and online.
- **The hard limit:** the server accepts block kinds up to 149, and only 115 to 149 were free: 35 numbers in total.

## 2. What was improved
- **Placing feels good, for every block, old and new:**
  - the block settles into its cell with a soft overshoot (150 ms);
  - a brief glaze in its material's tint;
  - four corner ticks close on the cell, the "snapped" confirmation;
  - a few small motes;
  - a soft sound per material: wood a warm knock, stone a clean tap, glass a crystal ting, ice a cold ting, metal a damped ping, magic a gentle chime, fabric, plants, sand and snow a muffled pat.

  The old square-wave blip and the big bump are gone. Pitch varies each time, a fast run gets quieter, and a voice budget stops sounds piling up.
- **Breaking:**
  - a block being hit gives a short shiver instead of shaking the screen;
  - metal throws sparks, magic blocks release motes, ice glints, and flowers and fabric shed petals and fluff;
  - metal, magic and ice get a small sound layer;
  - drops, tools and mining rules are unchanged.
- **Ground (natural terrain only; blocks a player placed are left exactly as they are):**
  - soft rounded outer corners;
  - grass wraps over exposed edges;
  - stone pebbles rise into dirt above stone, dirt crumbs fall onto stone, and sand and grass spill over each other's edges;
  - each tile has a small fixed variation in tone, with pebbles on exposed dirt faces.
- **World ground identities:** each normal world gets one from its name: meadow, blossom (fallen petals), crystal (small shards on stone), starlit (sparkles in the grass), snowy (snow caps), desert (sand ripples), enchanted (glowing moss) or dusk (violet grass). Only details and tint change, never the blocks. The Plaza, dungeons, biomes and realms keep their own look.

## 3. New systems
- **Colour and decoration data on each block:** a placed block can carry a variant (its colour or decoration kind) and a small state (on/off, facing). Both ride in two free slots of the existing world edit. The server checks them on every new edit; saved worlds load unchanged. One block number therefore covers 408 colour blocks, and another covers every decoration.
- **The colour collection:** one item per material, with the colour picked while placing (a 51-swatch strip above the hotbar, or the , and . keys). Each material remembers its last colour.
- **The decoration framework:** a table of decorations, each with:
  - a cached painted picture per facing and per on/off state;
  - a live layer only for what moves;
  - a placement rule: on the ground, under a ceiling, or anywhere;
  - an interaction kind with its own animation and sound.

  The Use key or a right-click on a decoration uses it, with a prompt saying what will happen. A short cooldown applies per decoration, with a voice budget across all of them.
- **Multiplayer for decorations:**
  - placement, colour, facing and on/off state travel with the world edit;
  - a playful reaction (a duck's quack, a cat's purr) rides on your presence for 3 seconds, and other players replay the same reaction, softer with distance;
  - switching a lamp, fountain, neon sign or mailbox flag needs build rights, like any edit.
- **The Builder** (the ` key, or the Build button by the hotbar):
  - **Finding things:** categories, search across names, families, descriptions and colour names, favourites, recently placed, and a preview card with rarity and where the item comes from.
  - **Placing:** choosing an item you have puts it in your hand, and choosing an earned pattern makes it your brush. Flip with the button or the / key.
  - **Line fill:** Shift + right-click fills a straight line from your last block, up to 16, one item each.
  - **Undo and redo:** Ctrl+Z / Ctrl+Y undo and redo your own placements in this world for 10 minutes. An undone block returns to your bag; nothing is created.
  - **Sound:** a switch mutes decoration and creature sounds.
- **Patterns:** legendary, mythic and exclusive decorations are earned by a goal checked by the server, through the same path as the exclusive looks. They are never sold and never dropped, so they cannot be traded or duplicated.

## 4. What is actually in the game
- **8 colour materials:** Plaster, Glazed Tile, Woven Fabric, Polished Stone, Fired Brick and Stained Planks, plus Tinted Glass and the Glow Block. Each comes in 51 colours, 408 blocks in all, each its own picture (checked).
- **19 fixed materials:** Birch, Cherry and Ebony Planks, Veined Marble, Polished Granite, Herringbone Parquet, Gilded Filigree, Brushed Steel, Clear Ice, Packed Snow, Celestial Tile (twinkles), Tide Glass (moving water), Moss Cobble, Terracotta Tile, Crystal Lattice (glows and sparkles), Garden Path, Flower Turf, Moonstone Bricks and Blossom Shingles.
- **62 decorations in five families:**
  - **Nature (13):** a blossom tree with drifting petals, a little pine, tulips that open by day and close at night, wildflowers, hanging vines, toadstools, glowcaps, a mossy boulder, a crystal cluster, a garden fountain, a lily pond with a frog, a fern and cattails.
  - **Furniture (15):** bench, velvet chair, tea table, bookshelf, bed, floor lamp, lantern post, mailbox, arched window, round rug, market stall, grandfather clock, music box, wind chime and stone well.
  - **Fantasy (12):** floating crystal, star lantern, moon orb (today's real moon phase), little planet, wayfarer arch, aether pillar, stargazer statue, moonwell fountain, floating islet, glyph stone, garden stone lantern and star garland.
  - **Cute (13):** puddle duck, mallard, duckling, bath duck, sleepy cat, night cat, meadow rabbit, songbird, butterfly bush, pond frog, tin helper robot, speckled egg and garden snail.
  - **Premium (9):** cloud sofa, neon heart, holo globe, glass swan, gothic candelabra, crystal chandelier, aurora tree (mythic), star carousel (exclusive) and comet egg (exclusive).
- **Not interactive on purpose:** 3 of the 62 are purely decorative (mossy boulder, arched window, round rug).
- **Already there before:** signs with your own text and real opening doors come from the existing Signpost and door objects; this brief did not duplicate them.

## 5. Interactions that fully work
Every interactive decoration in the catalog answers with its own animation and sound. The full table is in [catalog.md](catalog.md). Tested end to end:

- **The duck:** greet it and it quacks (a buzzy voice through two moving formants, sometimes twice) with one of four reactions: bob, flap, shake or hop. It has a short cooldown, and the mallard and duckling have their own voices.
- **Lamps and switches:** lamps and the lantern post switch off and on, and the state is saved and seen by everyone.
- **Seats:** benches, chairs and the sofa are real seats, and the bed lets you lie down.
- **Online:** another player's greeting replays with their reaction, and a visitor cannot switch the owner's lamp.
- **Always moving:**
  - the clock shows real time;
  - the moon orb shows the real moon phase;
  - the fountains run and trickle softly nearby;
  - wind chimes ring now and then;
  - creatures blink and fidget at random intervals;
  - plants sway with the world's wind.

## 6. Multiplayer and persistence results
**`tests/worldbuild-online.js`**, with a real server and two headless players: all 11 checks pass.

- **Server rules:**
  - clean variants are accepted;
  - negative, too big, not a number or extra slots are refused;
  - saved worlds still load.
- **Two players:**
  - Ann's colour block, duck and lantern appear for Bea with the same colour, kind and facing;
  - Bea sees Ann's duck greeting with the same reaction;
  - Ann's lantern switch reaches Bea;
  - after Ann locks her world, Bea cannot switch the lantern;
  - a forged edit with a bad colour changes nothing;
  - after leaving and coming back, Bea still sees everything as it was.

**`tests/worldbuild.js`**: all 20 checks pass.

- every combination draws its own picture;
- the colour is saved with each block;
- the material sounds play;
- a broken colour block gives back its material, never a seed;
- the colour strip and keys work;
- all 62 decorations draw;
- the duck's prompt, quack, reactions and cooldown work;
- reactions ride on presence and replay for others;
- the lamp state is saved;
- patterns are never sold, need their goal, and drop nothing;
- the Builder works: search, favourites, choosing, colour search, line fill, undo and redo.

## 7. Performance
- **A packed area:** around the player there were 920 decorations and 920 colour blocks, and 196 decorations were drawn on screen. A full frame took 3.4 ms in the off-screen renderer, against 1.9 ms for the same area empty.
- **Why it stays cheap:**
  - pictures are painted once and cached;
  - only on-screen tiles are visited;
  - only moving parts are drawn per frame;
  - lights reuse the existing lamp glow;
  - sounds have voice budgets and cooldowns;
  - the ground details are baked into cached block pictures, so they cost nothing per frame.
- **Normal play:** walking through the Plaza and a normal world costs the same as 6.13.20, about 330 ms/s and 263 ms/s of script time at 143 fps, against 325 and 297 ms/s for 6.13.20.
- **The packaged game:** run on a copy of your saves, it holds 144 fps on the login screen and in the online Plaza, with no errors.
- **Existing tests:** the building, objects, store, break effect, tools, inventory, plaza, world lock, security, server, online, creative, drops, farming, pet, looks and cosmetics tests pass with this update.

## 8. Remaining limitations
- **Nobody has played it yet:** all checks were done by automated players. The sounds are synthesised, and nobody has heard them yet.
- **Old clients:** only the 35 free block numbers sync online, so everything new fits inside them. A player still on an older version who visits a world with new blocks may get an error, until they update.
- **Existing worlds' ground:** their terrain is unchanged as data, but it is drawn with the new corners and details. A world's ground identity comes from its name and can't be chosen.
- **Decorations are not solid:** you walk through them, like the existing decorative objects. Tall ones draw over neighbouring space; they only occupy their own tile.
- **Not done:**
  - no hand-made textures from Blender: every picture is painted in code;
  - no world-owner setting to stop visitors from greeting decorations (only switches are protected);
  - no multi-tile structures (small houses, pavilions);
  - no new sign text field (the existing Signpost has one).
- **Undo and redo** cover your own placements in the current world for 10 minutes, not breaking.
