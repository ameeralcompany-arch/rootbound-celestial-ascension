#!/usr/bin/env node
'use strict';
// Weapons and stat gear are earned by playing, never bought. This marks every weapon and every gear item in server/catalog.json "sale":0 (the store
// and the server refuse to sell them) and gives each one its earn rule, which the game and the server both read:
//   class weapons: {cls, clv}  granted when that class reaches class level clv. Each class's store weapons form its ladder, from the lowest rarity up,
//                              never below the class level the game already asks for that rarity (86-z-classjob.js CREQ), at least 3 levels apart.
//   class gear (myb_/myh_<class>): {cls, clv}
//   other gear: {lv}           granted at that player level, by rarity band, cheapest first, never below the item's own level.
// The entries stay in the catalog (rarity, names and ownership of what players already bought keep working). Idempotent.
// Run after any catalog generator (tools/gen-catalog.py calls it). Usage: node tools/earned-catalog.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), FILE = path.join(ROOT, 'server', 'catalog.json');
const cat = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, exclusive: 6 };
const CREQ = { common: 1, uncommon: 8, rare: 18, epic: 30, legendary: 42, mythic: 50, exclusive: 50 };
// each class's weapon list, read from the game itself
const src = fs.readFileSync(path.join(ROOT, 'src', 'js', 'late', '86-classes.js'), 'utf8');
const CLS = {}; for (const m of src.matchAll(/^\s+([a-z]+):\{n:'[^']+'[^\n]*?ids:\[([^\]]*)\]/gm)) CLS[m[1]] = m[2].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
if (Object.keys(CLS).length !== 13) throw new Error('expected 13 classes, found ' + Object.keys(CLS).length);
const items = cat.items, wpn = items.filter(i => i.cat === 'weapons'), gear = items.filter(i => i.cat === 'gear');
const ladder = {};
for (const k in CLS) {
  const mine = wpn.filter(i => CLS[k].includes(i.ref)).sort((a, b) => RANK[a.rar] - RANK[b.rar] || a.price - b.price);
  const minR = Math.min(...mine.map(i => CREQ[i.rar] || 1), 99);
  let prev = -2; ladder[k] = [];
  // spread over the class's levels (each step up to 12 levels apart), never below the rarity's own class-level rule, at least 3 apart
  const step = mine.length > 1 ? Math.min(12, 40 / (mine.length - 1)) : 0;
  mine.forEach((i, n) => { let clv = Math.max(1, (CREQ[i.rar] || 1) - minR + 1, Math.round(1 + n * step)); clv = Math.max(clv, prev + 3); if (n === 0) clv = 1; prev = clv; i.earn = { cls: k, clv }; ladder[k].push([i.ref, clv]); });
}
const orphan = wpn.filter(i => !i.earn).map(i => i.ref); if (orphan.length) throw new Error('weapons in no class list: ' + orphan.join(','));
// gear: class sets by class level, the rest by player level in rarity bands
const BAND = { common: [2, 6], uncommon: [4, 18], rare: [10, 26], epic: [18, 38], legendary: [26, 50], mythic: [40, 65], exclusive: [55, 70] };
const byR = {};
for (const g of gear) {
  const m = /^my([bh])_([a-z]+)$/.exec(g.ref);
  if (m && CLS[m[2]]) { g.earn = { cls: m[2], clv: m[1] === 'h' ? 46 : 50 }; continue; }
  (byR[g.rar] = byR[g.rar] || []).push(g);
}
for (const r in byR) {
  const L = byR[r].sort((a, b) => a.price - b.price || (a.lv | 0) - (b.lv | 0)), [lo, hi] = BAND[r] || [10, 40];
  L.forEach((g, n) => { const at = Math.round(lo + (hi - lo) * (L.length > 1 ? n / (L.length - 1) : 0)); g.earn = { lv: Math.max(at, g.lv | 0) }; });
}
for (const i of [...wpn, ...gear]) { i.sale = 0; i.how = 'earn'; }
fs.writeFileSync(FILE, JSON.stringify(cat));
console.log('earned:', wpn.length, 'weapons in 13 class ladders,', gear.length, 'gear pieces');
for (const k in ladder) console.log('  ' + k.padEnd(13), ladder[k].map(([id, l]) => id + '@' + l).join('  '));
