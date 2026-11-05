// Launcher settings: one validated file. Anything unknown or out of range falls back to the default rather than breaking the launcher.
'use strict';
const fs = require('./fsx'), path = require('path');
const { atomicWriteJson } = require('./util');

const enumOf = (...vals) => v => vals.includes(v);
const bool = v => typeof v === 'boolean';
const SCHEMA = {
  game: {
    installDir: ['', v => typeof v === 'string' && v.length < 400],
    resolution: ['auto', v => v === 'auto' || /^\d{3,5}x\d{3,5}$/.test(v)],
    displayMode: ['fullscreen', enumOf('fullscreen', 'borderless', 'windowed')],
    quality: ['game', enumOf('game', 'auto', 'potato', 'low', 'med', 'high', 'ultra', 'cine')],
    launchArgs: ['', v => typeof v === 'string' && v.length < 1000],
  },
  launcher: {
    installRoot: ['', v => typeof v === 'string' && v.length < 400],
    language: ['auto', enumOf('auto', 'en', 'es', 'fr', 'ja')],
    theme: ['midnight', enumOf('midnight', 'violet', 'ocean')],
    startWithWindows: [false, bool],
    minimizeToTray: [false, bool],
    closeAfterStart: [false, bool],
    autoCheck: [true, bool],
    autoDownload: [true, bool],
    bandwidthKBps: [0, v => Number.isInteger(v) && v >= 0 && v <= 10000000],
    notifications: [true, bool],
    intro: [true, bool],
    introSound: [false, bool],
    launchAnimation: [true, bool],
  },
  performance: {
    hardwareAcceleration: [true, bool],
    efficientBackground: [true, bool],
    smoothAnimations: [true, bool],
    lowMemory: [false, bool],
  },
};

// Applied only after a restart; the UI offers one when these change.
const NEEDS_RESTART = new Set(['performance.hardwareAcceleration', 'performance.lowMemory']);

function normalize(raw) {
  const out = {};
  for (const sec of Object.keys(SCHEMA)) {
    out[sec] = {};
    for (const k of Object.keys(SCHEMA[sec])) {
      const [def, ok] = SCHEMA[sec][k], v = raw && raw[sec] ? raw[sec][k] : undefined;
      out[sec][k] = v !== undefined && ok(v) ? v : def;
    }
  }
  return out;
}

class Settings {
  constructor(file) { this.file = file; this.values = normalize(null); }
  // Synchronous on purpose: some of these must be known before Electron is ready.
  loadSync() {
    let raw = null;
    try { raw = JSON.parse(fs.readFileSync(this.file, 'utf8')); } catch (_) {}
    this.values = normalize(raw);
    return this.values;
  }
  get() { return JSON.parse(JSON.stringify(this.values)); }
  // Returns {ok, changed, needsRestart}. A value that fails validation is refused, never stored.
  async set(section, key, value) {
    const sec = SCHEMA[section], rule = sec && Object.prototype.hasOwnProperty.call(sec, key) ? sec[key] : null;
    if (!rule) return { ok: false, error: 'Unknown setting' };
    if (!rule[1](value)) return { ok: false, error: 'That value is not allowed' };
    const changed = this.values[section][key] !== value;
    this.values[section][key] = value;
    if (changed) { await fs.promises.mkdir(path.dirname(this.file), { recursive: true }); await atomicWriteJson(this.file, this.values); }
    return { ok: true, changed, needsRestart: changed && NEEDS_RESTART.has(section + '.' + key) };
  }
}

// Splits launch arguments the way a command line does, so quoted paths stay together. Nothing goes through a shell.
function parseArgs(s) {
  const out = []; let cur = '', q = null, had = false;
  for (const ch of String(s || '')) {
    if (q) { if (ch === q) q = null; else cur += ch; }
    else if (ch === '"' || ch === "'") { q = ch; had = true; }
    else if (/\s/.test(ch)) { if (cur || had) out.push(cur); cur = ''; had = false; }
    else cur += ch;
  }
  if (cur || had) out.push(cur);
  return out;
}

module.exports = { Settings, normalize, parseArgs, SCHEMA };
