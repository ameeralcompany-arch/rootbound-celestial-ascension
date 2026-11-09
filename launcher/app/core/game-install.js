// The game installation on disk. The folder looks like this:
//
//   <game folder>/
//     .rootbound-game          marker: this folder is ours to manage
//     install.json             which version is live, and the one before it (replaced atomically: this is the switch)
//     versions/<id>/           a complete copy of the game, never changed after it goes live
//     versions/<id>.manifest   the signed manifest it was built from
//     staging/<id>/            a version being built. Never started until it is verified and moved under versions/
//     cache/chunks/            downloaded parts, so an interrupted update carries on where it stopped
//
// A new version is always built next to the old one and only goes live by replacing install.json in one step, so nothing a crash, a full disk or a bad download can do
// leaves the game without a working copy. Files that did not change are hard links to the old version, which costs no disk and no copying. Saves are not in this folder at all:
// the game keeps them in %APPDATA%\Rootbound, which nothing here reads or writes.
'use strict';
const fs = require('./fsx'), fsp = fs.promises, path = require('path'), zlib = require('zlib'), crypto = require('crypto'), { EventEmitter } = require('events');
const { promisify } = require('util');
const brotliDecompress = promisify(zlib.brotliDecompress);
const { retryFs, atomicWrite, atomicWriteJson, readJson, exists, sha256, sha256File, safeRelPath, abortError, isAbort, walkFiles, cmpVersion } = require('./util');
const { verifyManifest } = require('./manifest');
const { DownloadJob } = require('./download-manager');

const MARKER = '.rootbound-game', MARKER_TEXT = 'Managed by the Rootbound launcher. Saves are not stored here.\n';

class InstallError extends Error { constructor(m, code = 'INSTALL') { super(m); this.code = code; } }

// Folders a game may never be installed into: anything that holds saves, or Windows itself.
function unsafeGameDir(dir, { saveDir, launcherDir } = {}) {
  const d = path.resolve(dir).toLowerCase() + path.sep;
  const inside = other => { if (!other) return false; const o = path.resolve(other).toLowerCase() + path.sep; return d.startsWith(o) || o.startsWith(d); };
  if (inside(saveDir)) return 'That folder holds your saves. Choose another one.';
  if (launcherDir && inside(launcherDir)) return 'That folder holds the launcher. Choose another one.';
  if (/^[a-z]:\\$/i.test(path.resolve(dir))) return 'Choose a folder rather than the top of a drive.';
  if (/\\windows(\\|$)/i.test(path.resolve(dir))) return 'That folder belongs to Windows. Choose another one.';
  return null;
}

class GameInstall extends EventEmitter {
  constructor({ dir, publicKeys, http, limiter, saveDir, concurrency = 4, log = () => {} }) {
    super();
    this.dir = path.resolve(dir); this.keys = publicKeys; this.http = http; this.limiter = limiter;
    this.saveDir = saveDir; this.concurrency = concurrency; this.log = log;
  }

  p(...a) { return path.join(this.dir, ...a); }
  get pointerFile() { return this.p('install.json'); }

  async readPointer() {
    const p = await readJson(this.pointerFile, null);
    return p && p.schema === 1 ? p : null;
  }
  async writePointer(p) { await atomicWriteJson(this.pointerFile, Object.assign({ schema: 1 }, p)); }

  versionDir(rec) { return this.p('versions', rec.id); }
  manifestFile(rec) { return this.p('versions', rec.id + '.manifest'); }

  async loadLocalManifest(rec) {
    const env = await readJson(this.manifestFile(rec), null);
    if (!env) throw new InstallError('The manifest of the installed version is missing', 'NO_LOCAL_MANIFEST');
    return verifyManifest(env, this.keys, { version: rec.version });
  }

  // What is installed right now, after dealing with anything a crash left behind. Never throws for a broken install: it reports it.
  async status() {
    const ptr = await this.readPointer();
    if (!ptr || !ptr.current) return { installed: false, dir: this.dir, previous: ptr && ptr.previous || null };
    const rec = ptr.current, exe = path.join(this.versionDir(rec), rec.entry || 'Rootbound.exe');
    return { installed: await exists(exe), broken: !(await exists(exe)), dir: this.dir, version: rec.version, id: rec.id, entry: rec.entry, exe, size: rec.size || 0, installedAt: rec.installedAt, previous: ptr.previous || null };
  }

  // Marks the folder as ours, before anything is written in it. A folder that already holds someone else's files is refused: everything else here only ever deletes inside a marked folder.
  async claim() {
    const names = await fsp.readdir(this.dir).catch(() => null);
    if (names && names.length && !names.includes(MARKER)) throw new InstallError('That folder already has other files in it. Choose an empty folder.', 'NOT_EMPTY');
    await fsp.mkdir(this.dir, { recursive: true });
    if (!names || !names.includes(MARKER)) await atomicWrite(this.p(MARKER), MARKER_TEXT);
  }

  // Runs at every launcher start. Staging folders left by a crash are never live, so they go; the cache stays so the download can carry on.
  // If the live version vanished, the one before it takes over.
  async recover() {
    if (!(await exists(this.p(MARKER)))) return { changed: false };
    await fsp.rm(this.p('staging'), { recursive: true, force: true }).catch(() => {});
    const ptr = await this.readPointer();
    if (!ptr) return { changed: false };
    const live = ptr.current && await exists(path.join(this.versionDir(ptr.current), ptr.current.entry));
    if (!live && ptr.previous && await exists(path.join(this.versionDir(ptr.previous), ptr.previous.entry))) {
      this.log('live version missing; going back to ' + ptr.previous.version);
      await this.writePointer({ current: ptr.previous, previous: null });
      return { changed: true, restored: ptr.previous.version };
    }
    await this.pruneVersions(ptr).catch(() => {});
    return { changed: false };
  }

  // Fetches and checks a manifest named by a verified update list.
  async fetchManifest(baseUrl, game, { signal } = {}) {
    const url = new URL(game.manifest, baseUrl).toString();
    const raw = await this.http.getBytes(url, { tries: 5, maxBytes: 32 * 1024 * 1024, signal });
    if (raw.length !== game.manifestSize || sha256(raw) !== game.manifestSha256) throw new InstallError('The manifest did not match the signed update list', 'BAD_MANIFEST');
    let env;
    try { env = JSON.parse(raw.toString('utf8')); } catch (_) { throw new InstallError('The manifest is unreadable', 'BAD_MANIFEST'); }
    const m = verifyManifest(env, this.keys, { version: game.version });
    return { manifest: m, envelope: raw };
  }

  // Checks every file of a version against its manifest. Reports what is wrong, changes nothing.
  async verifyTree(root, manifest, { signal, onProgress } = {}) {
    const bad = []; let done = 0;
    const total = manifest.files.reduce((a, f) => a + f.size, 0);
    for (const f of manifest.files) {
      if (signal && signal.aborted) throw abortError();
      const full = path.join(root, ...f.path.split('/'));
      let st = null;
      try { st = await fsp.stat(full); } catch (_) {}
      if (!st) { bad.push({ path: f.path, why: 'missing' }); done += f.size; if (onProgress) onProgress(done, total); continue; }
      if (st.size !== f.size) { bad.push({ path: f.path, why: 'size' }); done += f.size; if (onProgress) onProgress(done, total); continue; }
      const h = await sha256File(full, { signal, onBytes: n => { done += n; if (onProgress) onProgress(done, total); } });
      if (h !== f.sha256) bad.push({ path: f.path, why: 'hash' });
    }
    return { ok: bad.length === 0, bad };
  }

  async verifyInstalled({ signal, onProgress } = {}) {
    const ptr = await this.readPointer();
    if (!ptr || !ptr.current) return { ok: false, notInstalled: true, bad: [] };
    let m;
    try { m = await this.loadLocalManifest(ptr.current); } catch (e) { return { ok: false, manifestProblem: e.message, bad: [] }; }
    const r = await this.verifyTree(this.versionDir(ptr.current), m, { signal, onProgress });
    return Object.assign(r, { version: ptr.current.version });
  }

  // The check right before starting the game: every file is there at the right size, and the two files that hold all the code are hashed. It takes under a second.
  async preLaunchCheck() {
    const ptr = await this.readPointer();
    if (!ptr || !ptr.current) return { ok: false, why: 'not-installed' };
    let m;
    try { m = await this.loadLocalManifest(ptr.current); } catch (e) { return { ok: false, why: 'manifest', detail: e.message }; }
    const root = this.versionDir(ptr.current);
    for (const f of m.files) {
      const full = path.join(root, ...f.path.split('/'));
      let st = null;
      try { st = await fsp.stat(full); } catch (_) {}
      if (!st) return { ok: false, why: 'missing', file: f.path };
      if (st.size !== f.size) return { ok: false, why: 'changed', file: f.path };
      if (f.path === m.entry || f.path.toLowerCase() === 'resources/app.asar') {
        if ((await sha256File(full)) !== f.sha256) return { ok: false, why: 'changed', file: f.path };
      }
    }
    return { ok: true, exe: path.join(root, m.entry), cwd: root, version: ptr.current.version };
  }

  // Which local bytes can stand in for which chunks: every file of the given installed versions.
  async localChunkIndex() {
    const idx = new Map(), ptr = await this.readPointer();
    for (const rec of [ptr && ptr.current, ptr && ptr.previous]) {
      if (!rec) continue;
      let m;
      try { m = await this.loadLocalManifest(rec); } catch (_) { continue; }
      const root = this.versionDir(rec);
      for (const f of m.files) {
        const full = path.join(root, ...f.path.split('/'));
        let st = null;
        try { st = await fsp.stat(full); } catch (_) {}
        if (!st || st.size !== f.size) continue;
        let off = 0;
        for (const c of f.chunks) {
          if (!idx.has(c[0])) idx.set(c[0], []);
          idx.get(c[0]).push({ file: full, offset: off, size: c[1] });
          off += c[1];
        }
      }
    }
    return idx;
  }

  async readRange(file, offset, size) {
    const fh = await fsp.open(file, 'r');
    try {
      const b = Buffer.allocUnsafe(size);
      const { bytesRead } = await fh.read(b, 0, size, offset);
      return bytesRead === size ? b : null;
    } finally { await fh.close(); }
  }

  // Compare the target with what is on disk: whole files that can be kept, and the exact list of parts that must come over the network.
  async plan(manifest, { signal, onProgress } = {}) {
    const ptr = await this.readPointer();
    const reuse = [], rebuild = [];
    const currentRoot = ptr && ptr.current ? this.versionDir(ptr.current) : null;
    const total = manifest.files.reduce((a, f) => a + f.size, 0);
    let scanned = 0;
    const idx = await this.localChunkIndex();
    const localOk = new Map();    // chunk hash -> a verified local place, or false
    const want = new Map();       // chunk hash -> [chunk, ...] to download
    let reusedBytes = 0;

    for (const f of manifest.files) {
      if (signal && signal.aborted) throw abortError();
      if (currentRoot) {
        const cand = path.join(currentRoot, ...f.path.split('/'));
        let st = null;
        try { st = await fsp.stat(cand); } catch (_) {}
        if (st && st.size === f.size) {
          const h = await sha256File(cand, { signal, onBytes: n => { scanned += n; if (onProgress) onProgress(Math.min(scanned, total), total); } });
          if (h === f.sha256) { reuse.push({ file: f, from: cand }); reusedBytes += f.size; continue; }
          scanned -= f.size;
        }
      }
      rebuild.push(f);
      for (const c of f.chunks) {
        const hash = c[0];
        if (!localOk.has(hash)) {
          let found = false;
          for (const place of idx.get(hash) || []) {
            let b = null;
            try { b = await this.readRange(place.file, place.offset, place.size); } catch (_) {}
            if (b && sha256(b) === hash) { found = place; break; }
          }
          localOk.set(hash, found);
        }
        if (localOk.get(hash)) reusedBytes += c[1];
        else if (!want.has(hash)) want.set(hash, c);
        scanned += c[1];
        if (onProgress) onProgress(Math.min(scanned, total), total);
      }
    }
    const items = [];
    for (const [hash, c] of want) {
      items.push({ url: manifest.bases[c[3]] + hash + '.br', dest: this.p('cache', 'chunks', hash + '.br'), size: c[2], sha256: c[4], hash, rawSize: c[1] });
    }
    const removed = [];
    if (currentRoot && ptr.current) {
      try {
        const old = await this.loadLocalManifest(ptr.current), names = new Set(manifest.files.map(f => f.path.toLowerCase()));
        for (const f of old.files) if (!names.has(f.path.toLowerCase())) removed.push(f.path);
      } catch (_) {}
    }
    return {
      version: manifest.version, reuse, rebuild, items, localOk, removed, reusedBytes,
      downloadBytes: items.reduce((a, i) => a + i.size, 0), totalSize: total,
      newFileBytes: rebuild.reduce((a, f) => a + f.size, 0),
      fromVersion: ptr && ptr.current ? ptr.current.version : null,
    };
  }

  makeDownload(plan) {
    return new DownloadJob({ http: this.http, items: plan.items, concurrency: this.concurrency, limiter: this.limiter });
  }

  // Build the new version in staging from kept files, kept local parts and downloaded parts. Every part is checked before use, every finished file as a whole.
  async assemble(plan, manifest, { id, signal, onProgress } = {}) {
    const stage = this.p('staging', id);
    await fsp.rm(stage, { recursive: true, force: true });
    await fsp.mkdir(stage, { recursive: true });
    const total = manifest.files.reduce((a, f) => a + f.size, 0);
    let done = 0;
    const tick = n => { done += n; if (onProgress) onProgress(done, total); };

    for (const { file: f, from } of plan.reuse) {
      if (signal && signal.aborted) throw abortError();
      const to = path.join(stage, ...f.path.split('/'));
      await fsp.mkdir(path.dirname(to), { recursive: true });
      // a hard link: same bytes, no copy, no extra disk. If the disk can't do links (exFAT, FAT32), a real copy.
      try { await retryFs(() => fsp.link(from, to), { tries: 3 }); } catch (_) { await retryFs(() => fsp.copyFile(from, to)); }
      tick(f.size);
    }

    for (const f of plan.rebuild) {
      if (signal && signal.aborted) throw abortError();
      const to = path.join(stage, ...f.path.split('/'));
      await fsp.mkdir(path.dirname(to), { recursive: true });
      const fh = await fsp.open(to, 'w'), whole = crypto.createHash('sha256');
      try {
        for (const c of f.chunks) {
          if (signal && signal.aborted) throw abortError();
          const raw = await this._chunkBytes(c, plan);
          whole.update(raw);
          await fh.write(raw);
          tick(raw.length);
        }
        await fh.sync();
      } finally { await fh.close(); }
      if (whole.digest('hex') !== f.sha256) throw new InstallError('A rebuilt file did not match the manifest: ' + f.path, 'BAD_FILE');
    }
    return stage;
  }

  async _chunkBytes(c, plan) {
    const [hash, rawSize, , , encHash] = c;
    const place = plan.localOk.get(hash);
    if (place) {
      const b = await this.readRange(place.file, place.offset, place.size);
      if (b && sha256(b) === hash) return b;
    }
    const file = this.p('cache', 'chunks', hash + '.br');
    const enc = await fsp.readFile(file).catch(() => null);
    if (!enc) throw new InstallError('A downloaded part is missing', 'MISSING_PART');
    // checked before it is unpacked: unverified data never reaches the decompressor
    if (sha256(enc) !== encHash) { await fsp.rm(file, { force: true }); throw new InstallError('A downloaded part was damaged', 'BAD_PART'); }
    const raw = await brotliDecompress(enc, { maxOutputLength: rawSize + 1 });
    if (raw.length !== rawSize || sha256(raw) !== hash) { await fsp.rm(file, { force: true }); throw new InstallError('A downloaded part was damaged', 'BAD_PART'); }
    return raw;
  }

  // Files the player made next to the game (like safe-mode.txt) move to the new version with it.
  async carryPreserved(stage, manifest) {
    const ptr = await this.readPointer();
    if (!ptr || !ptr.current) return;
    const root = this.versionDir(ptr.current), names = new Set(manifest.files.map(f => f.path.toLowerCase()));
    for (const rel of manifest.preserve || []) {
      if (!safeRelPath(rel) || names.has(rel.toLowerCase())) continue;
      const from = path.join(root, ...rel.split('/'));
      if (await exists(from)) { const to = path.join(stage, ...rel.split('/')); await fsp.mkdir(path.dirname(to), { recursive: true }); await fsp.copyFile(from, to); }
    }
  }

  // The one step that makes a version live. Before it: the old version runs. After it: the new one does. Nothing in between can be started.
  async activate(stage, manifest, envelope, { id, size }) {
    const ptr = await this.readPointer() || {};
    await fsp.mkdir(this.p('versions'), { recursive: true });
    const dest = this.p('versions', id);
    await fsp.rm(dest, { recursive: true, force: true }).catch(() => {});
    await atomicWrite(this.p('versions', id + '.manifest'), envelope);
    await retryFs(() => fsp.rename(stage, dest));
    const rec = { id, version: manifest.version, entry: manifest.entry, size, installedAt: Date.now() };
    // a repair replaces a damaged copy of the same version: the version kept from before stays the one to go back to
    const samePrev = ptr.current && ptr.current.version === manifest.version;
    await this.writePointer({ current: rec, previous: samePrev ? ptr.previous || null : ptr.current || null });
    await atomicWrite(this.p(MARKER), MARKER_TEXT);
    await this.pruneVersions(await this.readPointer()).catch(() => {});
    await fsp.rm(this.p('staging'), { recursive: true, force: true }).catch(() => {});
    return rec;
  }

  // Keep the live version and the one before it. Anything older goes. A version still in use (the game is running from it) is left for next time.
  async pruneVersions(ptr) {
    const dir = this.p('versions');
    let names = [];
    try { names = await fsp.readdir(dir); } catch (_) { return; }
    const keep = new Set([ptr && ptr.current && ptr.current.id, ptr && ptr.previous && ptr.previous.id, ...(this.keepIds ? this.keepIds() : [])].filter(Boolean));
    for (const n of names) {
      const id = n.endsWith('.manifest') ? n.slice(0, -9) : n;
      if (keep.has(id)) continue;
      await fsp.rm(path.join(dir, n), { recursive: true, force: true, maxRetries: 2 }).catch(() => {});
    }
  }

  async clearCache() { await fsp.rm(this.p('cache'), { recursive: true, force: true }).catch(() => {}); }

  // Goes back to the version kept from before the last update, after checking it is whole.
  async restorePrevious({ signal, onProgress } = {}) {
    const ptr = await this.readPointer();
    if (!ptr || !ptr.previous) throw new InstallError('There is no earlier version kept on this PC', 'NO_PREVIOUS');
    const m = await this.loadLocalManifest(ptr.previous);
    const v = await this.verifyTree(this.versionDir(ptr.previous), m, { signal, onProgress });
    if (!v.ok) throw new InstallError('The earlier version is damaged too. Use Repair instead.', 'PREVIOUS_BROKEN');
    await this.writePointer({ current: ptr.previous, previous: ptr.current });
    return ptr.previous;
  }

  // Moves the whole game to another folder. The old one is only removed after the new one checks out.
  async moveTo(newDir, { signal, onProgress, commit } = {}) {
    const to = path.resolve(newDir);
    if (to.toLowerCase() === this.dir.toLowerCase()) return this.dir;
    // one inside the other would mean deleting the copy along with the original
    const a = to.toLowerCase() + path.sep, b = this.dir.toLowerCase() + path.sep;
    if (a.startsWith(b) || b.startsWith(a)) throw new InstallError('Choose a folder outside the current game folder.', 'BAD_DIR');
    const why = unsafeGameDir(to, { saveDir: this.saveDir });
    if (why) throw new InstallError(why, 'BAD_DIR');
    await fsp.mkdir(to, { recursive: true });
    if ((await fsp.readdir(to)).length && !(await exists(path.join(to, MARKER)))) throw new InstallError('That folder already has files in it. Choose an empty folder.', 'NOT_EMPTY');
    const ptr = await this.readPointer();
    if (ptr && ptr.current) {
      const dest = new GameInstall({ dir: to, publicKeys: this.keys, http: this.http, limiter: this.limiter, saveDir: this.saveDir, log: this.log });
      const m = await this.loadLocalManifest(ptr.current), total = m.files.reduce((a, f) => a + f.size, 0);
      const destRoot = path.join(to, 'versions', ptr.current.id);
      let done = 0;
      for (const f of await walkFiles(this.versionDir(ptr.current))) {
        if (signal && signal.aborted) throw abortError();
        const t = path.join(destRoot, ...f.path.split('/'));
        await fsp.mkdir(path.dirname(t), { recursive: true });
        await retryFs(() => fsp.copyFile(f.full, t));
        done += f.size;
        if (onProgress) onProgress(Math.min(done, total), total);
      }
      const v = await dest.verifyTree(destRoot, m, { signal });
      if (!v.ok) { await fsp.rm(to, { recursive: true, force: true }).catch(() => {}); throw new InstallError('The copy did not check out, so the game stays where it was', 'BAD_COPY'); }
      await retryFs(() => fsp.copyFile(this.manifestFile(ptr.current), path.join(to, 'versions', ptr.current.id + '.manifest')));
      await dest.writePointer({ current: ptr.current, previous: null });
      await atomicWrite(path.join(to, MARKER), MARKER_TEXT);
    }
    const old = this.dir;
    if (commit) await commit(to);
    this.dir = to;
    // only ever remove a folder we can prove is ours
    if (await exists(path.join(old, MARKER))) await fsp.rm(old, { recursive: true, force: true, maxRetries: 3 }).catch(() => {});
    return to;
  }

  // For the uninstaller: removes the game folder, and only if it carries our marker.
  async removeAll() {
    if (!(await exists(this.p(MARKER)))) {
      // never ours: at most an empty folder goes
      await fsp.rmdir(this.dir).catch(() => {});
      return;
    }
    await fsp.rm(this.dir, { recursive: true, force: true, maxRetries: 4 });
  }
}

const newVersionId = version => version + '-' + crypto.randomBytes(3).toString('hex');

module.exports = { GameInstall, InstallError, unsafeGameDir, newVersionId, isAbort, cmpVersion, MARKER };
