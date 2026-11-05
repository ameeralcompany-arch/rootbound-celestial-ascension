// Update manager: checks the signed update list, decides what the game needs, and runs install / update / repair as one queue of tasks.
// Download Center reads everything it shows from here: the running task, the queue and the history.
'use strict';
const fsp = require('./fsx').promises, path = require('path'), { EventEmitter } = require('events'), { spawn } = require('child_process');
const { atomicWriteJson, readJson, cmpVersion, isAbort, abortError, sha256, sleep } = require('./util');
const { verifyLatest } = require('./manifest');
const { GameInstall, newVersionId, InstallError } = require('./game-install');
const { RateLimiter } = require('./download-manager');

const HISTORY_MAX = 60;
const PHASES = { queued: 1, checking: 1, scanning: 1, downloading: 1, assembling: 1, verifying: 1, testing: 1, activating: 1, done: 1, failed: 1, canceled: 1 };

class UpdateManager extends EventEmitter {
  constructor({ config, http, stateDir, gameDir, saveDir, log = () => {}, smokeCheck = true, smokeEnv = {}, smokeUserData = null, bandwidthKBps = 0 }) {
    super();
    this.cfg = config; this.http = http; this.stateDir = stateDir; this.log = log;
    this.saveDir = saveDir; this.smokeCheck = smokeCheck; this.smokeEnv = smokeEnv; this.smokeUserData = smokeUserData;
    this.limiter = new RateLimiter(bandwidthKBps * 1024);
    this.install = new GameInstall({ dir: gameDir, publicKeys: config.publicKeys, http, limiter: this.limiter, saveDir, log });
    this.state = { lastSequence: 0, resume: null, blocked: {} };
    this.history = [];
    this.latest = null; this.latestError = null; this.lastCheck = 0;
    this.task = null; this.queue = []; this._seq = 1;
    this.checking = null; this.lock = null;
  }

  get stateFile() { return path.join(this.stateDir, 'update-state.json'); }
  get historyFile() { return path.join(this.stateDir, 'download-history.json'); }

  async init() {
    this.state = Object.assign(this.state, await readJson(this.stateFile, {}));
    this.history = (await readJson(this.historyFile, [])) || [];
    const r = await this.install.recover();
    if (r.restored) this.addHistory({ kind: 'recovery', version: r.restored, result: 'done', detail: 'previous-restored' });
    return this.status();
  }

  async saveState() { await atomicWriteJson(this.stateFile, this.state); }
  addHistory(h) {
    this.history.unshift(Object.assign({ at: Date.now() }, h));
    this.history.length = Math.min(this.history.length, HISTORY_MAX);
    atomicWriteJson(this.historyFile, this.history).catch(() => {});
    this.emit('history', this.history);
  }
  setBandwidth(kbps) { this.limiter.set(kbps * 1024); }

  // ---- what the launcher knows, for the UI
  async status() {
    const st = await this.install.status();
    const latest = this.latest && this.latest.game ? this.latest.game : null;
    const blocked = latest && this.state.blocked && this.state.blocked[latest.version];
    let action = 'none';
    if (!st.installed) action = st.broken ? 'repair' : 'install';
    else if (latest && cmpVersion(latest.version, st.version) > 0 && !blocked) action = 'update';
    else action = 'play';
    return {
      installed: !!st.installed, broken: !!st.broken, dir: this.install.dir, version: st.version || null, size: st.size || 0, installedAt: st.installedAt || null,
      previous: st.previous ? { version: st.previous.version } : null,
      latest: latest ? Object.assign({}, latest) : null, launcherUpdate: this.latest && this.latest.launcher ? Object.assign({}, this.latest.launcher) : null,
      publishedAt: this.latest ? this.latest.publishedAt : null,
      action, lastCheck: this.lastCheck, checkError: this.latestError, blocked: !!blocked,
      canResume: !!(this.state.resume && !this.task),
    };
  }

  // ---- the update list
  async check({ signal } = {}) {
    if (this.checking) return this.checking;
    this.checking = this._check(signal).finally(() => { this.checking = null; });
    return this.checking;
  }

  async _check(signal) {
    try {
      const env = await this.http.getJson(new URL('latest.json', this.cfg.channelUrl).toString(), { noCache: true, maxBytes: 2 * 1024 * 1024, signal });
      const latest = verifyLatest(env, this.cfg.publicKeys, this.cfg.channel);
      // An older list than one already seen is a replay: someone is trying to hold players back on an old version.
      if (latest.sequence < (this.state.lastSequence || 0)) {
        const e = new InstallError('The server offered an older update list than this PC has already seen', 'REPLAY'); throw e;
      }
      if (latest.sequence !== this.state.lastSequence) { this.state.lastSequence = latest.sequence; await this.saveState(); }
      this.latest = latest; this.latestError = null; this.lastCheck = Date.now();
    } catch (e) {
      if (isAbort(e)) throw e;
      this.latestError = { code: e.code || 'NET', message: e.message };
      this.lastCheck = Date.now();
      this.log('update check failed: ' + e.message);
    }
    const s = await this.status();
    this.emit('status', s);
    return s;
  }

  // ---- task queue. kinds: install (nothing there), update (newer version), repair (same version, fix what's damaged)
  enqueue(kind, opts = {}) {
    const same = [this.task, ...this.queue].find(t => t && t.kind === kind);
    if (same) return same.snapshot();
    const t = new Task(this, kind, this._seq++, opts);
    this.queue.push(t);
    this._next();
    this.emit('queue', this.queueSnapshot());
    return t.snapshot();
  }
  queueSnapshot() { return { current: this.task ? this.task.snapshot() : null, queued: this.queue.map(t => t.snapshot()), history: this.history.slice(0, HISTORY_MAX) }; }
  _next() {
    if (this.task || this.lock || !this.queue.length) return;
    this.task = this.queue.shift();
    const t = this.task;
    t.run().finally(() => {
      this.task = null;
      this.emit('queue', this.queueSnapshot());
      // only now: a Retry pressed the moment this fires has to start a new task, not find the old one
      this.emit('task-end', t.snapshot());
      this.status().then(s => this.emit('status', s));
      this._next();
    });
  }
  pause() { return this.task ? this.task.pause() : false; }
  resume() { return this.task ? this.task.resume() : false; }
  cancel(id) {
    if (this.task && (!id || this.task.id === id)) return this.task.cancel();
    const i = this.queue.findIndex(t => t.id === id);
    if (i >= 0) { const [t] = this.queue.splice(i, 1); t.markCanceled(); this.emit('queue', this.queueSnapshot()); return true; }
    return false;
  }
  busy() { return !!this.task || !!this.lock; }
  // Work on the game folder that can't share it with a task (moving it, going back). Tasks asked for meanwhile wait their turn.
  async exclusive(name, fn) {
    if (this.task || this.queue.length || this.lock) throw new InstallError('Wait for the current download to finish', 'BUSY');
    this.lock = name;
    try { return await fn(); } finally { this.lock = null; this._next(); }
  }

  async restorePrevious({ onProgress } = {}) {
    const { rec, ptr } = await this.exclusive('restore', async () => {
      const ptr = await this.install.readPointer();
      return { ptr, rec: await this.install.restorePrevious({ onProgress }) };
    });
    // the version we just left stays offered only if the player asks: automatic downloads must not put it straight back
    if (ptr && ptr.current) { this.state.blocked = Object.assign({}, this.state.blocked, { [ptr.current.version]: true }); await this.saveState(); }
    this.addHistory({ kind: 'restore', version: rec.version, result: 'done' });
    const s = await this.status(); this.emit('status', s);
    return rec;
  }
  async unblock() { this.state.blocked = {}; await this.saveState(); const s = await this.status(); this.emit('status', s); return s; }
}

class Task {
  constructor(mgr, kind, id, opts) {
    this.mgr = mgr; this.kind = kind; this.id = id; this.opts = opts;
    this.phase = 'queued'; this.startedAt = Date.now(); this.version = null; this.fromVersion = null;
    this.dl = null; this.error = null; this.paused = false;
    this.percent = 0; this.phasePercent = 0; this.download = null; this.verify = { state: 'waiting', percent: 0 }; this.installP = 0;
    this.deltaInfo = null; this.ctl = new AbortController(); this.canceled = false;
    this.notes = null; this.badFiles = null; this._lastEmit = 0;
  }

  snapshot() {
    return {
      id: this.id, kind: this.kind, phase: this.phase, version: this.version, fromVersion: this.fromVersion, paused: this.paused,
      phasePercent: this.phasePercent, percent: this.percent, download: this.download, verify: this.verify, install: this.installP, delta: this.deltaInfo,
      error: this.error, startedAt: this.startedAt, notes: this.notes, badFiles: this.badFiles,
    };
  }
  emit(force) {
    const now = Date.now();
    if (!force && now - this._lastEmit < 120) return;
    this._lastEmit = now;
    this.mgr.emit('task', this.snapshot());
  }
  setPhase(p) { this.phase = p; this.phasePercent = 0; this.emit(true); }
  markCanceled() { this.canceled = true; this.phase = 'canceled'; this.mgr.addHistory({ kind: this.kind, result: 'canceled', version: this.version }); }

  pause() {
    if (this.phase !== 'downloading' || !this.dl || this.paused) return false;
    if (this.dl.pause()) { this.paused = true; this.mgr.state.resume = { kind: this.kind, version: this.version, paused: true }; this.mgr.saveState().catch(() => {}); this.emit(true); return true; }
    return false;
  }
  resume() {
    if (!this.paused || !this.dl) return false;
    if (this.dl.resume()) { this.paused = false; this.mgr.state.resume = { kind: this.kind, version: this.version, paused: false }; this.mgr.saveState().catch(() => {}); this.emit(true); return true; }
    return false;
  }
  cancel() {
    this.canceled = true;
    this.ctl.abort();
    if (this.dl) this.dl.cancel();
    return true;
  }

  async run() {
    const mgr = this.mgr, inst = mgr.install, signal = this.ctl.signal;
    let id = null, plan = null;
    try {
      this.setPhase('checking');
      const ptr = await inst.readPointer();
      this.fromVersion = ptr && ptr.current ? ptr.current.version : null;
      let manifest = null, envelope = null;
      // Repair fixes the version that is installed, from its own signed manifest, so it works whatever has been published since.
      if (this.kind === 'repair' && ptr && ptr.current) {
        try {
          manifest = await inst.loadLocalManifest(ptr.current);
          envelope = await fsp.readFile(inst.manifestFile(ptr.current));
        } catch (_) { manifest = null; }
      }
      if (!manifest) {
        await mgr.check({ signal });
        if (mgr.latestError) throw Object.assign(new Error(mgr.latestError.message), { code: mgr.latestError.code });
        if (!mgr.latest || !mgr.latest.game) throw new InstallError('No game version has been published yet', 'NOTHING_PUBLISHED');
        this.notes = mgr.latest.game.notes || null;
        ({ manifest, envelope } = await inst.fetchManifest(mgr.cfg.channelUrl, mgr.latest.game, { signal }));
      }
      this.version = manifest.version;
      id = newVersionId(manifest.version);
      mgr.state.resume = { kind: this.kind, version: this.version, paused: false };
      await mgr.saveState();

      // ---- compare the local files with the manifest
      this.setPhase('scanning');
      plan = await inst.plan(manifest, { signal, onProgress: (d, t) => { this.phasePercent = t ? d / t * 100 : 100; this.emit(); } });
      this.deltaInfo = {
        downloadBytes: plan.downloadBytes, totalSize: plan.totalSize, reusedBytes: plan.reusedBytes, changedFiles: plan.rebuild.length, keptFiles: plan.reuse.length,
        removedFiles: plan.removed.length, parts: plan.items.length, firstInstall: !plan.fromVersion,
      };
      mgr.log(this.kind + ' ' + manifest.version + ': ' + plan.reuse.length + ' files kept, ' + plan.rebuild.length + ' rebuilt, ' + plan.removed.length + ' removed, ' + plan.downloadBytes + ' bytes to download');
      this.badFiles = this.kind === 'repair' ? plan.rebuild.map(f => f.path) : null;

      // nothing wrong at all on a repair: say so and leave the install alone
      if (this.kind === 'repair' && !plan.rebuild.length && ptr && ptr.current && ptr.current.version === manifest.version) {
        this.verify = { state: 'ok', percent: 100 };
        this.finishOk(); mgr.addHistory({ kind: 'repair', version: this.version, result: 'done', detail: 'nothing-wrong', delta: this.deltaInfo }); return;
      }

      await inst.claim();

      // ---- room on the disk?
      const free = await freeBytes(inst.dir);
      const needs = plan.downloadBytes + plan.newFileBytes + 64 * 1024 * 1024;
      if (free !== null && free < needs) throw new InstallError('Not enough free disk space. ' + Math.ceil(needs / 1048576) + ' MB is needed.', 'NO_SPACE');

      // ---- download only what is missing
      this.setPhase('downloading');
      this.dl = inst.makeDownload(plan);
      this.dl.on('progress', s => { this.download = s; this.phasePercent = s.percent; this.percent = s.percent; this.emit(); });
      if (this.opts.startPaused) { /* picked up again after a restart while paused */ }
      const running = this.dl.run();
      if (this.opts.startPaused) { await waitUntil(() => this.dl.state !== 'idle', signal).catch(() => {}); this.pause(); }
      await running;
      if (signal.aborted) throw abortError();

      // ---- build the new version beside the old one
      this.setPhase('assembling');
      const stage = await inst.assemble(plan, manifest, { id, signal, onProgress: (d, t) => { this.installP = t ? d / t * 100 : 100; this.phasePercent = this.installP; this.emit(); } });
      await inst.carryPreserved(stage, manifest);

      // ---- check every finished file
      this.setPhase('verifying');
      this.verify = { state: 'running', percent: 0 };
      const v = await inst.verifyTree(stage, manifest, { signal, onProgress: (d, t) => { this.verify.percent = t ? d / t * 100 : 100; this.phasePercent = this.verify.percent; this.emit(); } });
      if (!v.ok) { this.verify = { state: 'failed', percent: 100, bad: v.bad.slice(0, 20) }; throw new InstallError('The finished files did not match the manifest. The game was not changed.', 'VERIFY_FAILED'); }
      this.verify = { state: 'ok', percent: 100 };

      // ---- it must start before it goes live, without touching any save
      if (mgr.smokeCheck && this.kind !== 'repair') {
        this.setPhase('testing');
        const hasOld = !!(ptr && ptr.current);
        const started = await bootTest(path.join(stage, ...manifest.entry.split('/')), { env: mgr.smokeEnv, userData: path.join(inst.dir, 'staging', 'boot-test'), signal });
        if (signal.aborted) throw abortError();
        if (!started.ok) {
          mgr.log('boot test failed: ' + started.detail);
          if (hasOld) throw new InstallError('The new version did not start on this PC, so you stay on the version you have.', 'BOOT_TEST_FAILED');
          this.bootWarning = started.detail;
        }
      }

      // ---- the switch
      this.setPhase('activating');
      const size = plan.totalSize;
      await inst.activate(stage, manifest, envelope, { id, size });
      await inst.clearCache();
      mgr.state.resume = null;
      if (mgr.state.blocked && mgr.state.blocked[manifest.version]) { delete mgr.state.blocked[manifest.version]; }
      await mgr.saveState();
      this.finishOk();
      mgr.addHistory({ kind: this.kind, version: this.version, fromVersion: this.fromVersion, result: 'done', delta: this.deltaInfo });
    } catch (e) {
      await fsp.rm(inst.p('staging'), { recursive: true, force: true }).catch(() => {});
      if (this.canceled || isAbort(e)) {
        this.phase = 'canceled'; this.percent = 0;
        if (this.dl) await this.dl.removeLeftovers().catch(() => {});
        await inst.clearCache();
        mgr.state.resume = null; await mgr.saveState().catch(() => {});
        mgr.addHistory({ kind: this.kind, version: this.version, fromVersion: this.fromVersion, result: 'canceled' });
      } else {
        this.phase = 'failed';
        this.error = { code: e.code || 'ERROR', message: e.message || String(e) };
        mgr.log(this.kind + ' failed: ' + (e.stack || e));
        mgr.addHistory({ kind: this.kind, version: this.version, fromVersion: this.fromVersion, result: 'failed', detail: this.error.message, code: this.error.code });
        if (e.code === 'BOOT_TEST_FAILED') { mgr.state.blocked = Object.assign({}, mgr.state.blocked, { [this.version]: true }); mgr.state.resume = null; await inst.clearCache(); await mgr.saveState().catch(() => {}); }
      }
      this.emit(true);
    }
  }

  finishOk() {
    this.phase = 'done'; this.percent = 100; this.phasePercent = 100; this.emit(true);
    this.mgr.state.resume = null; this.mgr.saveState().catch(() => {});
  }
}

const waitUntil = async (fn, signal) => { while (!fn()) await sleep(30, signal); };

async function freeBytes(dir) {
  // statfs needs a folder that exists: walk up until one does
  let d = path.resolve(dir);
  for (let i = 0; i < 30; i++) {
    try { const s = await fsp.statfs(d); return Number(s.bavail) * Number(s.bsize); } catch (_) {
      const up = path.dirname(d); if (up === d) break; d = up;
    }
  }
  return null;
}

// Starts a build of the game in its own smoke mode, off-screen, against a throwaway data folder: real saves are never involved. Passes when the game reaches its first frame.
function bootTest(exe, { env = {}, userData, signal, timeoutMs = 90000 } = {}) {
  return new Promise(resolve => {
    let out = '', done = false, child;
    const finish = r => { if (done) return; done = true; clearTimeout(t); fsp.rm(userData, { recursive: true, force: true }).catch(() => {}); resolve(r); };
    const t = setTimeout(() => { try { child.kill(); } catch (_) {} finish({ ok: false, detail: 'timed out' }); }, timeoutMs);
    try {
      child = spawn(exe, ['--smoke', '--user-data-dir=' + userData], { env: Object.assign({}, process.env, { RB_TEST_OFFSCREEN: '1' }, env), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (e) { return finish({ ok: false, detail: e.message }); }
    child.stdout.on('data', b => { out += b; if (out.length > 65536) out = out.slice(-65536); });
    child.stderr.on('data', () => {});
    child.on('error', e => finish({ ok: false, detail: e.message }));
    child.on('exit', code => finish({ ok: /SMOKE-OK/.test(out), detail: 'exit ' + code + ' ' + out.slice(0, 200) }));
    if (signal) signal.addEventListener('abort', () => { try { child.kill(); } catch (_) {} finish({ ok: false, detail: 'stopped' }); }, { once: true });
  });
}

module.exports = { UpdateManager, freeBytes, bootTest, PHASES };
