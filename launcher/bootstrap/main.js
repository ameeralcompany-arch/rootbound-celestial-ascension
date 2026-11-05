// The part of the launcher that never changes after install, and the only code that decides what else may run. The rest of the launcher (app/) can be updated, so before loading a
// downloaded copy this file checks its signature against the public keys built into this exe and its SHA-256 against the signed record. If the check fails, or a new copy fails to start
// twice in a row, the copy that shipped with the installer runs instead. Nothing downloaded runs without passing this.
'use strict';
const { app } = require('electron');
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'update-config.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const BOOTSTRAP = (pkg.rootbound && pkg.rootbound.bootstrapVersion) || 1;

function verifyEnvelope(env) {
  const pub = env && config.publicKeys && Object.prototype.hasOwnProperty.call(config.publicKeys, env.kid) ? config.publicKeys[env.kid] : null;
  if (!pub || typeof env.payload !== 'string' || typeof env.sig !== 'string') return null;
  const key = crypto.createPublicKey({ key: Buffer.from(pub, 'base64'), format: 'der', type: 'spki' });
  if (!crypto.verify(null, Buffer.from(env.payload, 'utf8'), key, Buffer.from(env.sig, 'base64'))) return null;
  return JSON.parse(env.payload);
}

const cmp = (a, b) => {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d < 0 ? -1 : 1; }
  return 0;
};

// Which copy of the app code to run: a verified update, or the one in this exe.
function chooseApp() {
  const dir = path.join(app.getPath('userData'), 'launcher-update');
  const stateFile = path.join(dir, 'boot-state.json');
  const fallback = { base: path.join(ROOT, 'app'), version: pkg.version, updated: false };
  let picked = fallback, state = { attempts: 0, bad: [] };
  try { state = Object.assign(state, JSON.parse(fs.readFileSync(stateFile, 'utf8'))); } catch (_) {}
  try {
    const env = JSON.parse(fs.readFileSync(path.join(dir, 'current.json'), 'utf8'));
    const rec = verifyEnvelope(env);
    if (!rec || rec.kind !== 'launcher-app') throw new Error('signature');
    if (cmp(rec.version, pkg.version) <= 0) throw new Error('not newer');
    if ((rec.minBootstrap || 1) > BOOTSTRAP) throw new Error('needs a newer installer');
    if ((state.bad || []).includes(rec.version)) throw new Error('marked as not starting');
    if (state.version === rec.version && state.attempts >= 2) {
      state.bad = (state.bad || []).concat(rec.version);
      fs.writeFileSync(stateFile, JSON.stringify(state));
      throw new Error('failed to start twice');
    }
    const file = path.join(dir, 'app-' + rec.version + '.asar');
    // the real file system: Electron's fs would treat an .asar file as a folder
    const hash = crypto.createHash('sha256').update(require('original-fs').readFileSync(file)).digest('hex');
    if (hash !== rec.sha256) throw new Error('hash');
    picked = { base: file, version: rec.version, updated: true };
    state.attempts = state.version === rec.version ? (state.attempts || 0) + 1 : 1;
    state.version = rec.version;
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch (_) { /* no update, or one that didn't pass: run the built-in copy */ }
  return { picked, stateFile, dir };
}

const { picked, stateFile, dir: updateDir } = chooseApp();

global.rootboundBoot = {
  config,
  appVersion: picked.version,
  builtInVersion: pkg.version,
  updated: picked.updated,
  bootstrapVersion: BOOTSTRAP,
  updateDir,
  // called once the app has opened properly: the update is good, stop counting attempts
  ok() {
    if (!picked.updated) return;
    try { fs.writeFileSync(stateFile, JSON.stringify(Object.assign(JSON.parse(fs.readFileSync(stateFile, 'utf8')), { attempts: 0 }))); } catch (_) {}
  },
  // called when this copy leaves because another is already open: that says nothing about whether the update works
  notStarted() {
    if (!picked.updated) return;
    try { const s = JSON.parse(fs.readFileSync(stateFile, 'utf8')); s.attempts = Math.max(0, (s.attempts || 0) - 1); fs.writeFileSync(stateFile, JSON.stringify(s)); } catch (_) {}
  },
};

try {
  require(path.join(picked.base, 'main', 'index.js'));
} catch (e) {
  // the update itself throws on load: mark it and start again from the built-in copy
  if (picked.updated) {
    try {
      const s = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      s.bad = (s.bad || []).concat(picked.version);
      fs.writeFileSync(stateFile, JSON.stringify(s));
    } catch (_) {}
    app.relaunch();
    app.exit(0);
  } else throw e;
}
