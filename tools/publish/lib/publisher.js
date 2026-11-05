// The publishing steps shared by publish-update.js and publish-news.js.
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), os = require('os');
const { Http } = require('../../../launcher/app/core/http');
const { signEnvelope, newKeyPair, verifyEnvelope } = require('../../../launcher/app/core/signing');
const { verifyLatest, verifyManifest } = require('../../../launcher/app/core/manifest');
const { sha256, exists, atomicWrite, readJson } = require('../../../launcher/app/core/util');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const home = p => p.replace(/^~(?=$|[\\/])/, os.homedir());

function loadConfig(file) {
  const f = path.resolve(file || path.join(ROOT, 'publish', 'publish.config.json'));
  const cfg = JSON.parse(fs.readFileSync(f, 'utf8'));
  cfg._file = f;
  if (!/^https:\/\//i.test(cfg.publicUrl || '') || !cfg.publicUrl.endsWith('/')) throw new Error('publicUrl in ' + f + ' must start with https:// and end with /');
  if (!cfg.storage || !cfg.storage.type) throw new Error('storage.type is missing in ' + f);
  cfg.channel = cfg.channel || 'stable'; cfg.keyId = cfg.keyId || 'rb-1'; cfg.entry = cfg.entry || 'Rootbound.exe';
  cfg.launcherConfig = path.resolve(path.dirname(f), cfg.launcherConfig || path.join(ROOT, 'launcher', 'update-config.json'));
  return cfg;
}

function loadCreds(cfg) {
  const c = readCredFile(cfg);
  return { accessKey: process.env.RB_S3_ACCESS_KEY || c.accessKey, secretKey: process.env.RB_S3_SECRET_KEY || c.secretKey, githubToken: c.githubToken };
}
function readCredFile(cfg) {
  const f = home(cfg.credentialsFile || '~/.rootbound-publish/credentials.json');
  if (isInside(f, ROOT)) throw new Error('The credentials file must not be inside the repository: ' + f);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return {}; }
}

function isInside(file, dir) {
  const rel = path.relative(path.resolve(dir), path.resolve(file));
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function makeBackend(cfg) {
  const s = cfg.storage;
  if (s.type === 'folder') return require('../backends/folder')(Object.assign({}, s, { path: path.resolve(path.dirname(cfg._file), s.path) }), cfg.publicUrl);
  if (s.type === 's3') return require('../backends/s3')(s, cfg.publicUrl, loadCreds(cfg));
  if (s.type === 'github') return require('../backends/github')(s, cfg.publicUrl, loadCreds(cfg), s._testOptions || {});
  throw new Error('Unknown storage type: ' + s.type + ' (use github, s3 or folder)');
}

function makeHttp(cfg) {
  return new Http({ userAgent: 'rootbound-publish', ca: cfg.tlsCaFile ? fs.readFileSync(path.resolve(path.dirname(cfg._file), cfg.tlsCaFile)) : null });
}

// The signing key lives in the publisher's home folder. On first use it is created, and its public half goes into the launcher's config.
async function loadSigningKey(cfg, { create = true, log = console.log } = {}) {
  const file = home(cfg.signingKey || '~/.rootbound-publish/signing-key.pem');
  if (isInside(file, ROOT)) throw new Error('The signing key must not be inside the repository: ' + file);
  if (!(await exists(file))) {
    if (!create) throw new Error('No signing key at ' + file + '. Run: node tools/publish/keygen.js');
    const { publicKeyB64, privatePem } = newKeyPair();
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, privatePem, { mode: 0o600, flag: 'wx' });
    log('Created a new signing key: ' + file);
    log('KEEP A BACKUP OF THIS FILE. Without it, players\' launchers will not accept new updates until they reinstall.');
    await recordPublicKey(cfg, publicKeyB64);
  }
  const privatePem = await fsp.readFile(file, 'utf8');
  const pub = require('crypto').createPublicKey(privatePem).export({ format: 'der', type: 'spki' }).toString('base64');
  return { privatePem, publicKeyB64: pub, file };
}

async function recordPublicKey(cfg, pub) {
  const lc = await readJson(cfg.launcherConfig, null);
  if (!lc) throw new Error('Launcher config not found: ' + cfg.launcherConfig);
  lc.publicKeys = lc.publicKeys || {};
  lc.publicKeys[cfg.keyId] = pub;
  await atomicWrite(cfg.launcherConfig, JSON.stringify(lc, null, 2) + '\n');
}

// Public keys the launcher will trust. The key used to publish has to be one of them, or nothing published would ever install.
async function checkKeyIsTrusted(cfg, key) {
  const lc = await readJson(cfg.launcherConfig, null);
  const trusted = lc && lc.publicKeys ? lc.publicKeys : {};
  if (trusted[cfg.keyId] !== key.publicKeyB64) throw new Error('The launcher does not trust this signing key yet (' + cfg.launcherConfig + '). Run: node tools/publish/keygen.js --trust, then rebuild and redistribute the launcher.');
  return trusted;
}

// The current state of the host, read from the public address, the way players see it.
async function readPublished(cfg, http, trusted) {
  let env = null;
  try { env = await http.getJson(new URL('latest.json', cfg.publicUrl).toString(), { noCache: true }); } catch (e) { if (e.status !== 404) throw new Error('Could not read the current update list from ' + cfg.publicUrl + ': ' + e.message); }
  if (!env) return { latest: null, manifest: null };
  const latest = verifyLatest(env, trusted, cfg.channel);
  let manifest = null;
  if (latest.game) {
    const raw = await http.getBytes(new URL(latest.game.manifest, cfg.publicUrl).toString(), { maxBytes: 32 * 1024 * 1024 });
    manifest = verifyManifest(JSON.parse(raw.toString('utf8')), trusted, { version: latest.game.version });
  }
  return { latest, manifest };
}

// A sequence number that only ever goes up, even across computers.
const nextSequence = prev => Math.max((prev || 0) + 1, Math.floor(Date.now() / 1000));

function publicName(backend, key) { return backend.assetName ? backend.assetName(key) : key; }

async function publishLatest(cfg, backend, latestObj, key) {
  const env = signEnvelope(latestObj, key.privatePem, cfg.keyId);
  await backend.putBytes('latest.json', Buffer.from(JSON.stringify(env)), { type: 'application/json', cache: 'public, max-age=60' });
}

// ---- news. The source file is publish/content/news.json; images beside it in publish/content/images.
function checkNewsItem(it, where) {
  const types = ['update', 'content', 'dungeon', 'equipment', 'developer', 'maintenance', 'event'];
  const bad = m => { throw new Error(where + ': ' + m); };
  if (!it || typeof it !== 'object') bad('not an object');
  if (typeof it.id !== 'string' || !it.id) bad('needs an id');
  if (typeof it.title !== 'string' || !it.title) bad('needs a title');
  if (!types.includes(it.type)) bad('type must be one of ' + types.join(', '));
  if (!it.date || !Number.isFinite(Date.parse(it.date))) bad('needs a date like 2026-11-05');
}
function checkEvent(ev, where) {
  const bad = m => { throw new Error(where + ': ' + m); };
  if (typeof ev.id !== 'string' || !ev.id) bad('needs an id');
  if (typeof ev.title !== 'string' || !ev.title) bad('needs a title');
  if (ev.recur) { if (!['daily-local', 'weekly-utc-monday'].includes(ev.recur)) bad('recur must be daily-local or weekly-utc-monday'); return; }
  if (!Number.isFinite(Date.parse(ev.start)) || !Number.isFinite(Date.parse(ev.end))) bad('needs start and end dates');
  if (Date.parse(ev.end) <= Date.parse(ev.start)) bad('ends before it starts');
}

async function publishNews(cfg, backend, http, key, trusted, contentFile, { log = console.log, dryRun = false } = {}) {
  const src = JSON.parse(await fsp.readFile(contentFile, 'utf8'));
  const dir = path.dirname(contentFile);
  const items = src.items || [], events = src.events || [], banners = src.banners || [];
  items.forEach((it, i) => checkNewsItem(it, 'news item ' + (it.id || i)));
  events.forEach((ev, i) => checkEvent(ev, 'event ' + (ev.id || i)));
  // images are hashed into the signed feed, so a swapped image on the host is simply refused
  const prepImage = async (name, owner) => {
    if (!name) return null;
    const f = path.resolve(dir, 'images', name);
    if (!isInside(f, path.join(dir, 'images'))) throw new Error(owner + ': image must be in the images folder');
    const buf = await fsp.readFile(f).catch(() => { throw new Error(owner + ': image not found: ' + f); });
    if (buf.length > 4 * 1024 * 1024) throw new Error(owner + ': image is over 4 MB');
    const hash = sha256(buf), ext = path.extname(name).toLowerCase().replace('.', '');
    if (!['webp', 'png', 'jpg', 'jpeg'].includes(ext)) throw new Error(owner + ': image must be webp, png or jpg');
    const k = 'news/' + hash + '.' + ext;
    if (!dryRun && !(await backend.exists(k))) await backend.putBytes(k, buf, { type: 'image/' + (ext === 'jpg' ? 'jpeg' : ext), cache: 'public, max-age=31536000, immutable' });
    return { url: publicName(backend, k), sha256: hash, size: buf.length, ext };
  };
  const out = [];
  for (const it of items) out.push(Object.assign({}, it, { image: await prepImage(it.image, it.id) }));
  const evs = [];
  for (const ev of events) evs.push(Object.assign({}, ev, { image: await prepImage(ev.image, ev.id) }));
  const bns = [];
  for (const b of banners) bns.push(Object.assign({}, b, { image: await prepImage(b.image, b.id || 'banner') }));
  let prevSeq = 0;
  try {
    const old = await http.getJson(new URL(publicName(backend, 'news.json'), cfg.publicUrl).toString(), { noCache: true });
    prevSeq = verifyEnvelope(old, trusted).sequence || 0;
  } catch (e) { if (e.status !== 404 && e.code !== 'BAD_SIGNATURE') log('(could not read the old news feed: ' + e.message + ')'); }
  const payload = { schema: 1, kind: 'news', sequence: nextSequence(prevSeq), publishedAt: Date.now(), items: out, events: evs, banners: bns, community: src.community || { links: [] }, maintenance: src.maintenance || null };
  const env = signEnvelope(payload, key.privatePem, cfg.keyId);
  if (!dryRun) await backend.putBytes('news.json', Buffer.from(JSON.stringify(env)), { type: 'application/json', cache: 'public, max-age=60' });
  log('News feed: ' + out.length + ' items, ' + evs.length + ' events, ' + bns.length + ' banners' + (dryRun ? ' (dry run, nothing sent)' : ' published'));
  return payload;
}

module.exports = { ROOT, loadConfig, loadCreds, makeBackend, makeHttp, loadSigningKey, recordPublicKey, checkKeyIsTrusted, readPublished, nextSequence, publicName, publishLatest, publishNews, isInside, home, checkNewsItem };
