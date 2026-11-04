# Rootbound UI redesign: audit and plan

This redesign changes the interface only. Gameplay, saves, items and progression stay as they are.

## What the audit found

**Features you can't reach, or that do nothing**
- The Collection Book has no button at all.
- "Customize character" in the old ≡ menu does nothing.
- Bosses have no menu of their own. They sit halfway down the Quests tab.
- Equipment only opens with the C key, while the CHARACTER button (labelled "C") opens something else.
- The Starting Guide only opens with F1.
- ★ only opens the journal, and ♫ only mutes the music.
- Sign-in is hidden inside Worlds.

**The same job in several places**
- Gear: the C menu, the Hub's Equipment tab, and the inventory.
- Quests and achievements: the J journal, the ★ button, and the Hub's Quests tab.
- Worlds: the ≡ menu, the Hub's Directory tab, and the world door.
- Audio and graphics: the old Options screen, and Settings.
- Crafting: the Crafting Table, and the Hub's Crafting tab.
- Inventory: the I key, the bottom tab, and a hidden 34-pixel strip along the screen's bottom edge.

**Bugs in the interface**
- The Settings key list is out of date.
- The "Break effect" setting has gone missing from Settings.
- The Respawn sound is silent.
- K can leave the Store open behind Classes.
- Several panels ignore Esc.
- The intro film swallows the F keys.
- Esc plays a close sound when nothing is open.

**Look**
- The HUD is light grey and white, with text buttons of mixed sizes across the top.
- The Hub is one panel with 15 tabs.

## The new layout

| Screen area | What goes there |
|---|---|
| Top left | Character card, then Respawn (plus Owner and Tools for the owner) |
| Top centre | World name, hidden word |
| Top right | Minimap with zoom and music buttons, quest tracker below it |
| Bottom left | Gear skills |
| Bottom centre | Hotbar |
| Bottom right | **The new menu dock** |

The dock has one icon button per feature, each with a tooltip showing its name, its key and what it does.

| Section | Buttons |
|---|---|
| Character | Character (P), Equipment (C), Inventory (I), Classes (K), Skills (U) |
| World | Worlds, Bosses (N), Quests (J), Achievements (Y), Collection, Guide (G) |
| Social | Social |
| Shop | Store |
| System | Settings (O) |

Old keys all keep working. P, U, N, Y and O are new, and none of them was in use. On small windows the dock folds into a single Menu button that opens the same buttons with labels.

## What moves where

| Old place | New home |
|---|---|
| CHARACTER button | Character dock button, showing only Profile, Appearance, Wings & Aura and Nameplates |
| Hub > Skills | Skills dock button |
| Hub > Equipment | Removed. The C menu, the inventory and the Store cover it |
| Hub > Quests, ★, J journal | Quests dock button: daily, getting started and town quests on one page |
| Bosses inside Quests | Bosses dock button: every boss with its info, rewards, difficulty and progress |
| Achievements inside Quests | Achievements dock button, plus milestones |
| ≡ menu > Worlds, Hub > Directory | Worlds dock button |
| Hub > World | "This world" tab beside Travel, with a new Events tab |
| ≡ menu > Options | Removed. Settings already covers it |
| Hub > Settings, Save Data | Settings dock button |
| Hub > Tool Guide, Crafting, F1 guide | Guide dock button |
| Hub > Social | Social dock button |
| Bottom Inventory tab and hidden strip | Removed. The dock button replaces them |
| ≡ and ★ buttons | Removed |

## Look and feel

- A new "Night" skin becomes the default: deep indigo panels, soft violet and rose gradients, gold for selected items, small Japanese section titles, and one icon set.
- Everything keeps running at full speed. Panels are see-through without live blur, and animations only use movement and fading.
- Other themes stay available in Settings.

## How it gets tested

- An off-screen script opens every dock button and shortcut, and checks that each opens the right panel, that only one panel is open at a time, and that Esc closes it.
- A scan at seven window sizes checks for overlapping buttons and anything off-screen.
- I look at screenshots of every panel, and a contrast check flags hard-to-read text.
- The full 58-file test suite runs at the end.
