// Turns a finished game folder into a manifest and its parts. Parts are compressed once and kept in a local cache, so publishing again is quick.
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const { promisify } = require('util');
const brotli = promisify(zlib.brotliCompress);
const { walkFiles, sha256, exists, safeRelPath } = require('../../../launcher/app/core/util');
const { chunkFile } = require('./chunker');

// Compression at moderate effort: strong enough to halve the program files, fast enough for a 400 MB game.
async function compress(raw) {
  return brotli(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 7, [zlib.constants.BROTLI_PARAM_LGWIN]: 22, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length } });
}

// Runs at most `limit` jobs at a time and rethrows the first failure.
function pool(limit) {
  const running = new Set(); let failure = null;
  return {
    async add(job) {
      if (failure) throw failure;
      while (running.size >= limit) await Promise.race(running);
      if (failure) throw failure;
      const p = job().catch(e => { failure = e; }).finally(() => running.delete(p));
      running.add(p);
    },
    async drain() { await Promise.all(running); if (failure) throw failure; },
  };
}

// Returns { files, chunks: Map(hash -> {size, encSize, encHash, encFile}) }.
async function buildTree(root, { cacheDir, onProgress } = {}) {
  await fsp.mkdir(cacheDir, { recursive: true });
  const list = await walkFiles(root);
  const chunks = new Map(), files = [];
  const total = list.reduce((a, f) => a + f.size, 0);
  let done = 0;
  const work = pool(Math.max(2, Math.min(8, require('os').cpus().length - 1)));
  for (const f of list) {
    if (!safeRelPath(f.path)) throw new Error('This file name cannot be published: ' + f.path);
    const whole = crypto.createHash('sha256'), order = [];
    await chunkFile(f.full, async buf => {
      whole.update(buf);
      const hash = sha256(buf), size = buf.length;
      order.push({ hash, size });
      if (!chunks.has(hash)) {
        const rec = { size, encSize: 0, encHash: '', encFile: path.join(cacheDir, hash + '.br') };
        chunks.set(hash, rec);
        const copy = Buffer.from(buf);
        await work.add(async () => {
          if (!(await exists(rec.encFile))) {
            const enc = await compress(copy);
            const tmp = rec.encFile + '.tmp' + process.pid;
            await fsp.writeFile(tmp, enc); await fsp.rename(tmp, rec.encFile);
          }
          const enc = await fsp.readFile(rec.encFile);
          rec.encSize = enc.length; rec.encHash = sha256(enc);
          done += copy.length; if (onProgress) onProgress(done, total);
        });
      } else { done += size; if (onProgress) onProgress(done, total); }
    });
    files.push({ path: f.path, size: f.size, sha256: whole.digest('hex'), order });
  }
  await work.drain();
  return { files, chunks };
}

// What changed between two manifests, for the publisher's summary.
function diffManifests(prev, files) {
  const before = new Map((prev ? prev.files : []).map(f => [f.path, f]));
  const added = [], changed = [], same = [];
  for (const f of files) {
    const old = before.get(f.path);
    if (!old) added.push(f.path); else if (old.sha256 !== f.sha256) changed.push(f.path); else same.push(f.path);
    before.delete(f.path);
  }
  return { added, changed, same, removed: [...before.keys()] };
}

module.exports = { buildTree, diffManifests, compress, pool };
