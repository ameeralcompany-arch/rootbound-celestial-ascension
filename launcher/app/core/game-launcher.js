// Starts the game as its own process, so it keeps running after the launcher closes, and notices when it ends.
'use strict';
const { spawn, execFile } = require('child_process'), path = require('path'), { EventEmitter } = require('events');
const { atomicWriteJson, readJson, sleep } = require('./util');
const { parseArgs } = require('./settings');

// The arguments the game understands (see desktop/main.js), from the launcher's settings. Extra launch arguments go last.
function buildArgs(game, quick = {}) {
  const a = [];
  if (game.displayMode && game.displayMode !== 'fullscreen') a.push('--rb-display=' + game.displayMode);
  if (game.resolution && game.resolution !== 'auto') a.push('--rb-res=' + game.resolution);
  if (game.quality && game.quality !== 'game') a.push('--rb-quality=' + game.quality);
  if (quick.world && /^[a-z0-9_-]{1,16}$/.test(quick.world)) a.push('--rb-world=' + quick.world);
  if (quick.dungeon && /^[a-z0-9_-]{1,16}$/.test(quick.dungeon)) a.push('--rb-dungeon=' + quick.dungeon);
  return a.concat(parseArgs(game.launchArgs));
}

class GameLauncher extends EventEmitter {
  constructor({ stateDir, log = () => {} }) {
    super();
    this.stateDir = stateDir; this.log = log; this.child = null; this.running = null; this._watch = null;
  }
  get file() { return path.join(this.stateDir, 'game-session.json'); }

  // A game started by an earlier launcher run may still be going: pick it up rather than start a second one.
  async init() {
    const s = await readJson(this.file, null);
    if (s && s.pid && await alive(s.pid, s.image)) { this.running = s; this._watchPid(s); this.emit('state', this.state()); }
    else if (s) await atomicWriteJson(this.file, {}).catch(() => {});
    return this.state();
  }
  state() { return { running: !!this.running, pid: this.running ? this.running.pid : null, startedAt: this.running ? this.running.startedAt : null }; }

  async start({ exe, cwd, args = [], env }) {
    if (this.running) return { ok: false, code: 'ALREADY_RUNNING' };
    return new Promise(resolve => {
      let child;
      const started = Date.now();
      try {
        child = spawn(exe, args, { cwd, detached: true, stdio: 'ignore', windowsHide: false, env: env || process.env });
      } catch (e) { this.log('start failed: ' + e.message); return resolve({ ok: false, code: 'SPAWN', message: e.message }); }
      child.once('error', e => { this.log('start failed: ' + e.message); this.running = null; resolve({ ok: false, code: 'SPAWN', message: e.message }); });
      child.once('spawn', () => {
        child.unref();
        this.child = child;
        this.running = { pid: child.pid, startedAt: started, image: path.basename(exe), exe };
        atomicWriteJson(this.file, this.running).catch(() => {});
        this.emit('state', this.state());
        resolve({ ok: true, pid: child.pid });
      });
      child.once('exit', code => this._ended(code, Date.now() - started));
    });
  }

  _ended(code, ranMs) {
    if (!this.running) return;
    if (this._watch) { clearInterval(this._watch); this._watch = null; }
    this.running = null; this.child = null;
    atomicWriteJson(this.file, {}).catch(() => {});
    // a very short run that ended badly means the game could not start, which the launcher can help with
    this.emit('ended', { code, ranMs, crashed: typeof code === 'number' && code !== 0 && ranMs < 20000 });
    this.emit('state', this.state());
  }

  // For a game the launcher didn't start in this run: Windows can't give us an exit event, so ask now and then.
  _watchPid(s) {
    this._watch = setInterval(async () => {
      if (!(await alive(s.pid, s.image))) this._ended(0, Date.now() - s.startedAt);
    }, 20000);
    if (this._watch.unref) this._watch.unref();
  }
}

function alive(pid, image) {
  return new Promise(res => {
    execFile('tasklist', ['/FI', 'PID eq ' + (pid | 0), '/FO', 'CSV', '/NH'], { windowsHide: true, timeout: 8000 }, (e, out) => {
      if (e) return res(false);
      res(String(out).toLowerCase().includes('"' + String(image || 'rootbound.exe').toLowerCase() + '"'));
    });
  });
}

module.exports = { GameLauncher, buildArgs, alive, sleep };
