// The player's profile, read from rootbound-profile.json, which the game itself writes while it runs. The launcher never opens the save and never changes this file.
// If the game hasn't run yet there is nothing to show, and the page says that; nothing here makes up a number.
'use strict';
const path = require('path');
const { readJson } = require('./util');

const num = (v, d = 0) => Number.isFinite(v) ? v : d;
const str = (v, m = 80) => typeof v === 'string' ? v.slice(0, m) : '';
const list = (v, n) => Array.isArray(v) ? v.slice(0, n) : [];

function clean(raw) {
  if (!raw || typeof raw !== 'object') return { available: false };
  const g = raw.game && typeof raw.game === 'object' ? raw.game : {};
  const av = typeof g.avatar === 'string' && g.avatar.startsWith('data:image/png;base64,') && g.avatar.length < 400000 ? g.avatar : null;
  const ach = g.achievements || {}, dg = g.dungeons || {};
  return {
    available: true,
    updatedAt: num(raw.updatedAt), gameVersion: str(raw.version, 20),
    playSeconds: Math.round(num(raw.playSeconds)),
    lastSession: raw.lastSession ? { startedAt: num(raw.lastSession.startedAt), endedAt: num(raw.lastSession.endedAt), seconds: num(raw.lastSession.seconds) } : null,
    name: str(g.name, 40), account: str(g.account, 40), signedIn: !!g.signedIn, made: !!g.made,
    level: num(g.level), xp: num(g.xp), xpNext: num(g.xpNext), gems: num(g.gems), title: str(g.title, 60),
    klass: g.klass ? { name: str(g.klass.name, 40), level: num(g.klass.level) } : null,
    weapon: g.weapon ? { name: str(g.weapon.name, 60) } : null,
    outfit: list(g.outfit, 8).map(o => ({ slot: str(o.slot, 12), name: str(o.name, 60) })),
    skills: g.skills ? { mine: num(g.skills.mine), farm: num(g.skills.farm), fight: num(g.skills.fight) } : null,
    stats: g.stats && typeof g.stats === 'object' ? { break: num(g.stats.break), kill: num(g.stats.kill), harvest: num(g.stats.harvest), place: num(g.stats.place), worlds: num(g.stats.worlds) } : null,
    achievements: { done: num(ach.done), total: num(ach.total), list: list(ach.list, 200).map(a => ({ name: str(a.name, 60), desc: str(a.desc, 120), done: !!a.done })) },
    dungeons: { cleared: num(dg.cleared), total: num(dg.total), list: list(dg.list, 30).map(d => ({ id: str(d.id, 20), name: str(d.name, 60), sub: str(d.sub, 120), entry: num(d.entry), cleared: !!d.cleared, locked: !!d.locked, diffs: list(d.diffs, 8).map(x => str(x, 20)), glow: /^#[0-9a-f]{3,8}$/i.test(d.glow || '') ? d.glow : '' })) },
    recentWorlds: list(raw.recentWorlds, 12).map(w => ({ name: str(w.name, 20), at: num(w.at) })),
    knownWorlds: list(g.worlds, 12).map(w => str(w, 20)),
    recentDungeons: list(raw.recentDungeons, 12).map(d => ({ id: str(d.id, 20), name: str(d.name, 60), diff: str(d.diff, 20), at: num(d.at) })),
    avatar: av,
  };
}

class Profile {
  constructor({ gameDataDir }) { this.dir = gameDataDir; }
  async read() { return clean(await readJson(path.join(this.dir, 'rootbound-profile.json'), null)); }
}

module.exports = { Profile, clean };
