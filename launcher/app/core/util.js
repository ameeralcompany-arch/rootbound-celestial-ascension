// Small helpers shared by the launcher core and the publishing tools. No Electron here, so all of it can be tested with plain Node.
'use strict';
const fs = require('./fsx'), fsp = fs.promises, path = require('path'), crypto = require('crypto');

function abortError() { const e = new Error('Stopped'); e.name = 'AbortError'; e.code = 'ABORTED'; return e; }
const isAbort = e => !!e && (e.name === 'AbortError' || e.code === 'ABORTED');

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  if (signal && signal.aborted) return reject(abortError());
  const t = setTimeout(done, ms);
  function done() { if (signal) signal.removeEventListener('abort', onAbort); resolve(); }
  function onAbort() { clearTimeout(t); reject(abortError()); }
  if (signal) signal.addEventListener('abort', onAbort, { once: true });
});

// Windows antivirus and the search indexer briefly lock files that were just written: try again rather than fail an update for that.
async function retryFs(fn, { tries = 9, baseMs = 80 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      if (!['EPERM', 'EBUSY', 'EACCES', 'ENOTEMPTY', 'EMFILE', 'ENFILE', 'UNKNOWN'].includes(e.code)) throw e;
      await sleep(Math.min(3000, baseMs * Math.pow(2, i)));
    }
  }
  throw last;
}

// Writes the whole file or nothing: a crash leaves either the old file or the new one, never half of one.
async function atomicWrite(file, data) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp-' + process.pid + '-' + crypto.randomBytes(3).toString('hex');
  const fh = await fsp.open(tmp, 'w');
  try { await fh.writeFile(data); await fh.sync(); } finally { await fh.close(); }
  try { await retryFs(() => fsp.rename(tmp, file)); } catch (e) { await fsp.rm(tmp, { force: true }).catch(() => {}); throw e; }
}
const atomicWriteJson = (file, obj) => atomicWrite(file, JSON.stringify(obj, null, 1));

async function readJson(file, fallback = null) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); } catch (_) { return fallback; }
}
function readJsonSync(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}
const exists = p => fsp.access(p).then(() => true, () => false);

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

async function sha256File(file, { signal, onBytes } = {}) {
  const h = crypto.createHash('sha256');
  const s = fs.createReadStream(file, { highWaterMark: 1024 * 1024 });
  try {
    for await (const b of s) {
      if (signal && signal.aborted) throw abortError();
      h.update(b);
      if (onBytes) onBytes(b.length);
    }
  } finally { s.destroy(); }
  return h.digest('hex');
}

// A path from a manifest may only ever point inside the folder it is applied to.
function safeRelPath(p) {
  if (typeof p !== 'string' || !p || p.length > 400) return false;
  if (p.includes('\\') || p.includes(':') || p.startsWith('/')) return false;
  if (/[<>"|?*\x00-\x1f]/.test(p)) return false;
  for (const seg of p.split('/')) {
    if (!seg || seg === '.' || seg === '..' || /[. ]$/.test(seg)) return false;
    if (/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(seg)) return false;
  }
  return true;
}

const fmtBytes = n => {
  if (!Number.isFinite(n) || n < 0) return '0 B';
  if (n < 1024) return n + ' B';
  const u = ['KB', 'MB', 'GB', 'TB']; let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)) + ' ' + u[i];
};

// Version compare: 6.12.0 < 6.13.0 < 6.13.1. Only numbers count.
function cmpVersion(a, b) {
  const pa = String(a).split('.').map(x => parseInt(x, 10) || 0), pb = String(b).split('.').map(x => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}
const validVersion = v => typeof v === 'string' && /^\d{1,5}\.\d{1,5}\.\d{1,5}$/.test(v);

// Everything inside a folder as forward-slash relative paths, with sizes. Links are not followed.
async function walkFiles(root) {
  const out = [];
  async function walk(dir, rel) {
    for (const e of await fsp.readdir(dir, { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name, full = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) await walk(full, r);
      else if (e.isFile()) out.push({ path: r, full, size: (await fsp.stat(full)).size });
    }
  }
  await walk(root, '');
  return out.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

module.exports = { sleep, abortError, isAbort, retryFs, atomicWrite, atomicWriteJson, readJson, readJsonSync, exists, sha256, sha256File, safeRelPath, fmtBytes, cmpVersion, validVersion, walkFiles };
