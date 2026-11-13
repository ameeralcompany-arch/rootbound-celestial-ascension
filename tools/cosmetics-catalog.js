#!/usr/bin/env node
'use strict';
// Cosmetics: looks only, zero stats, never in WEAR (so nothing that adds up stats can ever see them). Sold in the store (how:'store', price in gems)
// or found only by breaking (how:'drop', tier = which of the advertised odds it belongs to). Every cosmetic is in a collection; "ord" is append-only
// (other players are told what you wear by these numbers), so never renumber, only add. Upserts into server/catalog.json; idempotent.
// Usage: node tools/cosmetics-catalog.js
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'server', 'catalog.json');
// drop tiers: chance per counted break, rolled by the server (server/cosmetics.js). These are the numbers shown to players.
const TIERS = { ultra: { n: 'Ultra-exclusive', p: 0.0001, rar: 'exclusive' }, mythical: { n: 'Mythical', p: 0.0002, rar: 'mythic' }, extreme: { n: 'Extremely rare', p: 0.0005, rar: 'legendary' }, veryrare: { n: 'Very rare', p: 0.001, rar: 'epic' }, rare: { n: 'Rare', p: 0.005, rar: 'rare' } };
const SETS = {
  mochi: 'Mochi Dreams', crimson: 'Crimson Covenant', silvermoon: 'Silver Moon Court', sakura: 'Sakura Festival', nebula: 'Nebula Drift', sunken: 'Sunken Empire', mist: 'Wanderer of Mist'
};
// [ord, id, name, slot, set, how, rarity or tier, price, description]
const C = [
  [1, 'cos_cat_hoodie', 'Cat-Ear Hoodie', 'outfit', 'mochi', 'store', 'uncommon', 900, 'An oversized pastel hoodie with little cat ears on the hood and paw pockets.'],
  [2, 'cos_bunny_suit', 'Moonbun Costume', 'suit', 'mochi', 'store', 'rare', 1800, 'A fluffy bunny suit: tall soft ears, a round tail and mitten paws.'],
  [3, 'cos_pastel_dress', 'Marshmallow Dress', 'outfit', 'mochi', 'store', 'rare', 1500, 'A soft magical dress in pastel layers with ribbon trim.'],
  [4, 'cos_ribbon_bow', 'Big Ribbon', 'hairacc', 'mochi', 'store', 'common', 300, 'A big satin ribbon that bounces when you run.'],
  [5, 'cos_bear_pack', 'Bear Backpack', 'back', 'mochi', 'store', 'uncommon', 700, 'A plush bear who rides on your back and looks around.'],
  [6, 'cos_horn_crown', 'Obsidian Horns', 'hat', 'crimson', 'store', 'rare', 1400, 'Curved black horns with crimson veins of light.'],
  [7, 'cos_shadow_coat', 'Crimson Covenant Coat', 'outfit', 'crimson', 'store', 'epic', 2600, 'A long black coat lined in crimson, with silver clasps.'],
  [8, 'cos_oni_mask', 'Oni Half-Mask', 'mask', 'crimson', 'store', 'rare', 1300, 'A lacquered red oni mask worn over the lower face.'],
  [9, 'cos_bat_mantle', 'Nightwing Mantle', 'back', 'crimson', 'store', 'epic', 2400, 'A mantle that ends in two small bat wings, which fold and open as you move.'],
  [10, 'cos_royal_coat', 'Silver Moon Regalia', 'outfit', 'silvermoon', 'store', 'epic', 2800, 'A white and gold court coat with a high collar and long tails.'],
  [11, 'cos_moon_tiara', 'Crescent Tiara', 'hat', 'silvermoon', 'store', 'rare', 1200, 'A slim silver tiara set with a small crescent and a pearl.'],
  [12, 'cos_moon_cape', 'Moonlit Cape', 'back', 'silvermoon', 'store', 'epic', 2400, 'A long silver cape that catches the light like water.'],
  [13, 'cos_sakura_yukata', 'Sakura Yukata', 'outfit', 'sakura', 'store', 'rare', 1500, 'A summer festival yukata with cherry blossoms and a wide obi.'],
  [14, 'cos_kanzashi', 'Blossom Kanzashi', 'hairacc', 'sakura', 'store', 'uncommon', 500, 'A hair ornament of silk blossoms with dangling petals.'],
  [15, 'cos_wagasa', 'Paper Umbrella', 'back', 'sakura', 'store', 'rare', 1100, 'A red paper umbrella carried on your back.'],
  [16, 'cos_fox_mask', 'Festival Fox Mask', 'mask', 'sakura', 'store', 'uncommon', 800, 'A white fox mask, worn tilted on the side of the head.'],
  // found only by breaking
  [17, 'cos_laurel', 'Sunken Laurel', 'hat', 'sunken', 'drop', 'rare', 0, 'A bronze laurel from an empire under the sea.'],
  [18, 'cos_bronze_mantle', 'Sunken Bronze Mantle', 'outfit', 'sunken', 'drop', 'rare', 0, 'Tarnished bronze plates over sea-blue cloth.'],
  [19, 'cos_wanderer_hat', 'Wanderer\'s Hat', 'hat', 'mist', 'drop', 'rare', 0, 'A wide straw hat with a veil of thin mist cloth.'],
  [20, 'cos_coral_ribbon', 'Coral Ribbon', 'hairacc', 'sunken', 'drop', 'rare', 0, 'A ribbon of living coral that sways as if underwater.'],
  [21, 'cos_comet_scarf', 'Comet Scarf', 'outfit', 'nebula', 'drop', 'veryrare', 0, 'A long scarf whose end trails a comet\'s tail.'],
  [22, 'cos_moonstone_mask', 'Moonstone Mask', 'mask', 'nebula', 'drop', 'veryrare', 0, 'A pale mask with moonstone eyes that glow softly.'],
  [23, 'cos_relic_shield', 'Tide Relic Shield', 'back', 'sunken', 'drop', 'veryrare', 0, 'An ancient round shield, still dripping, carried on your back.'],
  [24, 'cos_mist_cloak', 'Mistwalker Cloak', 'outfit', 'mist', 'drop', 'veryrare', 0, 'A grey cloak that fades into mist at the hem.'],
  [25, 'cos_star_crown', 'Fallen Star Crown', 'hat', 'nebula', 'drop', 'extreme', 0, 'A small crown of real starlight that never stops glittering.'],
  [26, 'cos_spirit_lantern', 'Spirit Lantern', 'back', 'mist', 'drop', 'extreme', 0, 'A paper lantern that floats behind you on its own.'],
  [27, 'cos_abyss_armor', 'Abyssal Regent Armor', 'suit', 'crimson', 'drop', 'extreme', 0, 'Dark demonic armor with a crimson core that pulses like a heart.'],
  [28, 'cos_galaxy_cloak', 'Galaxy Cloak', 'back', 'nebula', 'drop', 'mythical', 0, 'A cloak with a whole galaxy turning slowly inside it.'],
  [29, 'cos_porcelain_mask', 'Porcelain Mask', 'mask', 'mist', 'drop', 'mythical', 0, 'A flawless white mask with one painted tear of gold.'],
  [30, 'cos_nebula_suit', 'Nebula Sovereign', 'suit', 'nebula', 'drop', 'ultra', 0, 'A gown or suit of living nebula, stars drifting through the cloth. The rarest thing in Rootbound.'],
];
const FEAT = ['cos_cat_hoodie', 'cos_shadow_coat', 'cos_royal_coat', 'cos_sakura_yukata', 'cos_bunny_suit', 'cos_horn_crown'];
const cat = JSON.parse(fs.readFileSync(FILE, 'utf8')), byId = new Map(cat.items.map((i, n) => [i.id, n]));
const seenOrd = new Set();
for (const [ord, id, n, sub, set, how, r, price, d] of C) {
  if (seenOrd.has(ord)) throw new Error('duplicate ord ' + ord); seenOrd.add(ord);
  const drop = how === 'drop', T = drop ? TIERS[r] : null; if (drop && !T) throw new Error('bad tier ' + r);
  const it = { id, cat: 'cosmetics', n, price: drop ? 0 : price, rar: drop ? T.rar : r, stack: 0, ref: id, lv: 0, d: d + (drop ? ' Found only by breaking: ' + T.n + ', ' + (T.p * 100).toFixed(2) + '% per counted break.' : ''), how, sub, set, setn: SETS[set], ord, feat: FEAT.includes(id) ? 1 : 0, new: drop ? 0 : 1 };
  if (drop) { it.tier = r; it.sale = 0; }
  if (byId.has(id)) cat.items[byId.get(id)] = it; else cat.items.push(it);
}
cat.cosTiers = TIERS; cat.cosSets = SETS;
fs.writeFileSync(FILE, JSON.stringify(cat));
console.log('cosmetics:', C.length, '(' + C.filter(c => c[5] === 'store').length + ' in the store, ' + C.filter(c => c[5] === 'drop').length + ' found by breaking)');
