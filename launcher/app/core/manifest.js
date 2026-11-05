// Manifest verification: nothing below this point ever sees a manifest that failed these checks.
'use strict';
const { verifyEnvelope } = require('./signing');
const { safeRelPath, validVersion } = require('./util');

const HEX64 = /^[0-9a-f]{64}$/;
class ManifestError extends Error { constructor(m) { super(m); this.code = 'BAD_MANIFEST'; } }

function need(cond, msg) { if (!cond) throw new ManifestError(msg); }
const posInt = n => Number.isSafeInteger(n) && n >= 0;

// The pointer every launcher reads when it checks for updates.
function checkLatest(p, channel) {
  need(p.schema === 1 && p.kind === 'latest', 'This is not an update list');
  need(p.channel === channel, 'This update list is for another channel');
  need(posInt(p.sequence) && p.sequence > 0, 'The update list has no sequence number');
  if (p.game) {
    const g = p.game;
    need(validVersion(g.version), 'The game version is not valid');
    need(typeof g.manifest === 'string' && g.manifest.length < 600, 'The update list has no manifest path');
    need(HEX64.test(g.manifestSha256 || ''), 'The update list has no manifest hash');
    need(posInt(g.manifestSize) && g.manifestSize < 32 * 1024 * 1024, 'The manifest size is not valid');
  }
  if (p.launcher) {
    const l = p.launcher;
    need(validVersion(l.version), 'The launcher version is not valid');
    need(typeof l.file === 'string' && typeof l.envelope === 'string', 'The launcher update has no files');
    need(HEX64.test(l.sha256 || '') && posInt(l.size), 'The launcher update has no hash');
    need(posInt(l.minBootstrap || 0), 'The launcher update is not valid');
  }
  return p;
}

function checkManifest(m, expect = {}) {
  need(m.schema === 1 && m.kind === 'manifest', 'This is not a game manifest');
  need(m.product === 'rootbound', 'This manifest is for another product');
  need(validVersion(m.version), 'The manifest version is not valid');
  if (expect.version) need(m.version === expect.version, 'The manifest is for another version');
  need(safeRelPath(m.entry), 'The manifest has no valid program to start');
  need(Array.isArray(m.bases) && m.bases.length && m.bases.every(b => typeof b === 'string' && b.endsWith('/')), 'The manifest has no download addresses');
  need(Array.isArray(m.files) && m.files.length > 0 && m.files.length < 20000, 'The manifest has no files');
  const seen = new Set(); let total = 0;
  for (const f of m.files) {
    need(safeRelPath(f.path), 'The manifest has an unsafe file path');
    const low = f.path.toLowerCase();
    need(!seen.has(low), 'The manifest lists a file twice');
    seen.add(low);
    need(posInt(f.size), 'A file size in the manifest is not valid');
    need(HEX64.test(f.sha256 || ''), 'A file hash in the manifest is not valid');
    need(Array.isArray(f.chunks), 'A file in the manifest has no parts');
    let sum = 0;
    for (const c of f.chunks) {
      need(Array.isArray(c) && c.length === 5, 'A file part in the manifest is not valid');
      const [h, s, z, b, enc] = c;
      need(HEX64.test(h) && HEX64.test(enc) && posInt(s) && s > 0 && posInt(z) && z > 0 && posInt(b) && b < m.bases.length, 'A file part in the manifest is not valid');
      sum += s;
    }
    need(sum === f.size, 'The parts of a file do not add up to its size');
    total += f.size;
  }
  need(seen.has(m.entry.toLowerCase()), 'The program to start is not in the manifest');
  if (m.preserve !== undefined) need(Array.isArray(m.preserve) && m.preserve.every(safeRelPath), 'The manifest has an unsafe keep list');
  return Object.assign(m, { totalSize: total });
}

function verifyLatest(env, keys, channel) { return checkLatest(verifyEnvelope(env, keys), channel); }
function verifyManifest(env, keys, expect) { return checkManifest(verifyEnvelope(env, keys), expect); }

function checkFeed(p) {
  need(p.schema === 1 && p.kind === 'news', 'This is not a news feed');
  need(posInt(p.sequence) && p.sequence > 0, 'The news feed has no sequence number');
  need(Array.isArray(p.items) && Array.isArray(p.events), 'The news feed is not valid');
  return p;
}
function verifyFeed(env, keys) { return checkFeed(verifyEnvelope(env, keys)); }

module.exports = { verifyLatest, verifyManifest, verifyFeed, checkManifest, ManifestError };
