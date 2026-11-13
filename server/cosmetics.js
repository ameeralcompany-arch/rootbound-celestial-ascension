'use strict';
// Cosmetics on the server: who owns which look, and the rare finds from breaking.
//   Ownership: store cosmetics are bought through shop.js (u.shop.owned); found ones live in u.cos.own. Both are granted only by the server.
//   Presence: what a player wears is sent to others as catalog "ord" numbers; anything the player does not own is removed before it is relayed.
//   Rare finds: rolled here, never on the player's computer, for a counted break: a natural tile nobody had ever edited, turned to air by a real break
//   (the client marks it br:1; harvesting trees, letters and locks do not count), near where the player stands, by a signed-in account.
//   Each tile counts once (it is edited afterwards), and an account counts at most 60 breaks a minute and 4000 a day.
//   The odds per counted break are exactly the advertised ones, from crypto.randomInt over a million:
//     Ultra-exclusive 0.01%  Mythical 0.02%  Extremely rare 0.05%  Very rare 0.10%  Rare 0.50%
//   Duplicate protection: you always get a cosmetic of that tier you do not own yet; if you own the whole tier, one from the next tier down;
//   if you own every cosmetic that can be found, you get gems instead (shown to you). Buying cosmetics never changes these odds.
//   A find is written to disk at once, numbered (#n of all ever found), and sent again on every sign-in until the game confirms it.
//   The two rarest tiers are announced to everyone online (name and item only), at most one announcement every 8 seconds.
//   Future real-money purchases: grantEnt(u, id, source, transactionId) is the one door, idempotent by transaction id. No payment provider is wired in.
const crypto = require('crypto');
const ORDER = ['ultra', 'mythical', 'extreme', 'veryrare', 'rare'], BAND = { ultra: 100, mythical: 300, extreme: 800, veryrare: 1800, rare: 6800 };
const GEMS = { ultra: 3000, mythical: 1200, extreme: 400, veryrare: 150, rare: 50 };
const PER_MIN = 60, PER_DAY = 4000, NEAR_TILES = 12, TILE = 48, W = 256;
function createCosmetics(o) {
  const { CAT, send, sessions, saveAccNow, store, sendWallet } = o, acc = () => o.acc();
  const items = [...CAT.values()].filter(i => i.cat === 'cosmetics'), byOrd = new Map(items.map(i => [i.ord, i]));
  const pool = {}; for (const t of ORDER) pool[t] = items.filter(i => i.how === 'drop' && i.tier === t);
  function ens(u) {
    if (!u.cos || typeof u.cos !== 'object') u.cos = {};
    const c = u.cos; if (!c.own || typeof c.own !== 'object') c.own = {}; if (!Array.isArray(c.pend)) c.pend = []; if (!c.n || typeof c.n !== 'object') c.n = { m: 0, mt: 0, d: 0, dt: 0 };
    if (!c.tx || typeof c.tx !== 'object') c.tx = {}; return c;
  }
  function owns(u, id) {
    if (!u) return false; const it = CAT.get(id); if (!it || it.cat !== 'cosmetics') return false;
    if (ens(u).own[id]) return true; return it.how !== 'drop' && !!(u.shop && u.shop.owned && u.shop.owned[id]);
  }
  // only what you own is shown to others
  function filterCz(u, cz) { if (!Array.isArray(cz)) return undefined; const out = []; for (const o2 of cz.slice(0, 12)) { const it = byOrd.get(o2 | 0); if (it && owns(u, it.id) && !out.includes(it.ord)) out.push(it.ord); } return out; }
  function roll() { const r = crypto.randomInt(0, 1000000); for (const t of ORDER) if (r < BAND[t]) return t; return null; }
  function pick(u, tier) { const c = ens(u); for (let i = ORDER.indexOf(tier); i < ORDER.length; i++) { const free = pool[ORDER[i]].filter(it => !c.own[it.id]); if (free.length) return { it: free[crypto.randomInt(0, free.length)], t: ORDER[i] }; } return null; }
  function counted(c, now) { const n = c.n; if (now - n.mt > 60000) { n.mt = now; n.m = 0; } if (now - n.dt > 86400000) { n.dt = now; n.d = 0; } if (n.m >= PER_MIN || n.d >= PER_DAY) return false; n.m++; n.d++; return true; }
  let lastAnn = 0; const annQ = [];
  function announce(s, it, ser) { annQ.push({ n: String(s.name || '').slice(0, 14), id: it.id, tier: it.tier, ser }); while (annQ.length > 5) annQ.shift(); flush(); }
  function flush() { const now = Date.now(); if (!annQ.length || now - lastAnn < 8000) { if (annQ.length) setTimeout(flush, 8000 - (now - lastAnn) + 50); return; } lastAnn = now; const a = annQ.shift(); for (const q of sessions.values()) if (q.uid) send(q, { t: 'cosann', d: a }); if (annQ.length) setTimeout(flush, 8100); }
  function grant(s, u, it, src, ref) {
    const c = ens(u); if (c.own[it.id]) return null;
    const A = acc(); if (!A.cosSer || typeof A.cosSer !== 'object') A.cosSer = {};
    const ser = (A.cosSer[it.id] = (A.cosSer[it.id] | 0) + 1);
    c.own[it.id] = { t: Date.now(), src, ser, w: ref || '' }; const msg = { id: it.id, tier: it.tier || '', ser, src };
    c.pend.push(msg); while (c.pend.length > 20) c.pend.shift();
    try { saveAccNow(); } catch (_) {}
    try { store.audit({ ev: 'cosmetic', uid: u.id, id: it.id, tier: it.tier || '', src, ser }); } catch (_) {}
    if (s) send(s, Object.assign({ t: 'cosm' }, msg));
    if (s && (it.tier === 'ultra' || it.tier === 'mythical')) announce(s, it, ser);
    return msg;
  }
  // called by the 'e' handler after an edit was applied; wasNatural: the tile had never been edited before
  function onBreak(s, u, w, d, wasNatural) {
    if (!u || !s || (s.kind !== 'user' && s.kind !== 'owner') || s.god) return null;
    if (!wasNatural || !d || d.br !== 1 || !Array.isArray(d.a) || d.a[0] !== 0 || d.a[1]) return null;
    const k = d.k | 0, tx = k % W, ty = (k / W) | 0, p = s.pres;
    if (!p || !Number.isFinite(+p.x) || !Number.isFinite(+p.y) || Math.abs(tx - p.x / TILE) > NEAR_TILES || Math.abs(ty - p.y / TILE) > NEAR_TILES) return null;
    const c = ens(u); if (!counted(c, Date.now())) return null;
    const t = (typeof o.roll === 'function' ? o.roll : roll)(); if (!t) return null;
    const pk = pick(u, t);
    if (!pk) { const g = GEMS[t]; try { if (u.shop && Number.isFinite(u.shop.g)) { u.shop.g += g; saveAccNow(); if (sendWallet) sendWallet(s, u); } } catch (_) {} send(s, { t: 'cosm', all: 1, tier: t, gems: g }); return { gems: g }; }
    return grant(s, u, pk.it, 'break:' + t, w && w.id);
  }
  function ack(u, id) { const c = ens(u); c.pend = c.pend.filter(x => x.id !== id); }
  // on every sign-in: what you own, and any find the game has not confirmed yet
  function resend(s, u) { const c = ens(u); send(s, { t: 'cosw', own: Object.keys(c.own) }); for (const m of c.pend) send(s, Object.assign({ t: 'cosm', again: 1 }, m)); }
  // the one door for future real-money cosmetic purchases (e.g. a verified Steam transaction): idempotent by transaction id
  function grantEnt(u, id, src, tx) {
    const it = CAT.get(id); if (!u || !it || it.cat !== 'cosmetics' || !tx) return { ok: 0, m: 'invalid' };
    const c = ens(u); if (c.tx[tx]) return Object.assign({ dup: 1 }, c.tx[tx]);
    const r = grant(null, u, it, String(src || 'purchase').slice(0, 24), String(tx).slice(0, 80)) || { id, already: 1 };
    c.tx[tx] = { ok: 1, id }; return Object.assign({ ok: 1 }, r);
  }
  // BAND holds cumulative thresholds; each tier's own chance is its band minus the one before it
  const odds = () => ORDER.map((t, i) => ({ t, p: (BAND[t] - (i ? BAND[ORDER[i - 1]] : 0)) / 1e6 }));
  return { owns, filterCz, onBreak, ack, resend, grantEnt, grant, roll, pick, odds, pool, ORDER, BAND, ens };
}
module.exports = { createCosmetics, ORDER, BAND, PER_MIN, PER_DAY };
