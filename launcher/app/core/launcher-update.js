// Keeps the launcher's own code up to date. Downloads the signed code package next to the bootstrap's state; the bootstrap checks it again at every start before running it,
// so this file only has to get it there. It takes effect at the next launcher start.
'use strict';
const fsp = require('./fsx').promises, path = require('path'), { EventEmitter } = require('events');
const { atomicWrite, sha256, sha256File, cmpVersion, readJson, exists } = require('./util');
const { verifyEnvelope } = require('./signing');

class LauncherUpdate extends EventEmitter {
  constructor({ boot, http, log = () => {} }) {
    super();
    this.boot = boot; this.http = http; this.log = log;
    this.state = { ready: null, working: false, error: null };
  }
  get dir() { return this.boot.updateDir; }

  async init() {
    const env = await readJson(path.join(this.dir, 'current.json'), null);
    if (env) {
      try {
        const rec = verifyEnvelope(env, this.boot.config.publicKeys);
        if (cmpVersion(rec.version, this.boot.appVersion) > 0) this.state.ready = rec.version;
      } catch (_) {}
    }
    return this.state;
  }

  // latest: the launcher part of the verified update list
  async apply(latest, baseUrl) {
    if (!latest || this.state.working) return this.state;
    if (cmpVersion(latest.version, this.boot.appVersion) <= 0) return this.state;
    if (this.state.ready === latest.version) return this.state;
    if ((latest.minBootstrap || 1) > this.boot.bootstrapVersion) {
      this.state.error = { code: 'NEEDS_INSTALLER', message: 'This launcher update needs a newer installer' };
      this.emit('state', this.state);
      return this.state;
    }
    this.state.working = true; this.state.error = null; this.emit('state', this.state);
    try {
      await fsp.mkdir(this.dir, { recursive: true });
      const envRaw = await this.http.getBytes(new URL(latest.envelope, baseUrl).toString(), { maxBytes: 64 * 1024 });
      const env = JSON.parse(envRaw.toString('utf8'));
      const rec = verifyEnvelope(env, this.boot.config.publicKeys);
      if (rec.kind !== 'launcher-app' || rec.version !== latest.version || rec.sha256 !== latest.sha256) throw Object.assign(new Error('The launcher update did not match the signed list'), { code: 'BAD_MANIFEST' });
      const file = path.join(this.dir, 'app-' + rec.version + '.asar');
      if (!(await exists(file)) || (await sha256File(file)) !== rec.sha256) {
        const buf = await this.http.getBytes(new URL(latest.file, baseUrl).toString(), { maxBytes: 200 * 1024 * 1024 });
        if (buf.length !== rec.size || sha256(buf) !== rec.sha256) throw Object.assign(new Error('The launcher update was damaged in download'), { code: 'BAD_HASH' });
        await atomicWrite(file, buf);
      }
      await atomicWrite(path.join(this.dir, 'current.json'), JSON.stringify(env));
      this.state.ready = rec.version;
      // older copies are no longer needed
      for (const n of await fsp.readdir(this.dir)) if (/^app-.*\.asar$/.test(n) && n !== path.basename(file)) await fsp.rm(path.join(this.dir, n), { force: true }).catch(() => {});
    } catch (e) {
      this.state.error = { code: e.code || 'NET', message: e.message };
      this.log('launcher update failed: ' + e.message);
    }
    this.state.working = false;
    this.emit('state', this.state);
    return this.state;
  }
}

module.exports = { LauncherUpdate };
