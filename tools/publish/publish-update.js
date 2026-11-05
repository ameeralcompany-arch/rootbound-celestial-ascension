#!/usr/bin/env node
// Publishes an update that every installed launcher will receive.
//
//   node tools/publish/publish-update.js --bump patch --notes "What changed, in a sentence or two"
//
// What it does, in order: reads the version, builds the game, runs the tests, packages and hardens the game, starts the packaged game to prove it runs, hashes every file, works out what
// changed since the version already on the server, uploads only the new parts, signs everything, and only then replaces latest.json (the moment players can see it).
// Options:
//   --bump patch|minor|major   raise the version in version.json first
//   --notes "text" / --notes-file f.md / --title "headline"
//   --launcher                 also publish the launcher's own code (from launcher/app)
//   --launcher-only            publish only the launcher's code, not the game
//   --launcher-version x.y.z   the launcher version to publish (default: launcher/package.json)
//   --from-folder <dir>        publish a game folder that is already built and hardened (skips build, tests and packaging)
//   --skip-tests               skip the automated tests (the packaged game is still started)
//   --dry-run                  do everything except sending anything to the server
//   --config <file>            another config than publish/publish.config.json
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const { sha256, cmpVersion, validVersion, fmtBytes, walkFiles } = require('../../launcher/app/core/util');
const { signEnvelope } = require('../../launcher/app/core/signing');
const { checkManifest } = require('../../launcher/app/core/manifest');
const P = require('./lib/publisher');
const { buildTree, diffManifests } = require('./lib/manifest-builder');

function parseArgs(a) {
  const o = {};
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k.startsWith('--')) throw new Error('Unknown argument: ' + k);
    const name = k.slice(2);
    if (['launcher', 'launcher-only', 'skip-tests', 'dry-run', 'help'].includes(name)) o[name] = true;
    else if (['bump', 'notes', 'notes-file', 'title', 'from-folder', 'config', 'version', 'launcher-version'].includes(name)) { o[name] = a[++i]; if (o[name] === undefined) throw new Error(k + ' needs a value'); }
    else throw new Error('Unknown option: ' + k);
  }
  return o;
}

const step = (n, t) => console.log('\n[' + n + '] ' + t);
const versionFile = cfg => cfg.versionFile ? path.resolve(path.dirname(cfg._file), cfg.versionFile) : path.join(P.ROOT, 'version.json');
const workDir = cfg => cfg.workDir ? path.resolve(path.dirname(cfg._file), cfg.workDir) : path.join(P.ROOT, 'build', 'publish');

function bumped(v, kind) {
  const p = v.split('.').map(Number);
  if (kind === 'major') return (p[0] + 1) + '.0.0';
  if (kind === 'minor') return p[0] + '.' + (p[1] + 1) + '.0';
  if (kind === 'patch') return p[0] + '.' + p[1] + '.' + (p[2] + 1);
  throw new Error('--bump must be patch, minor or major');
}

// Anything secret that ended up in the folder stops the publish. Only files that are about to go to every player are looked at.
async function refuseSecrets(dir) {
  const bad = /(\.pem|\.key|\.pfx|\.p12|\.env|credentials\.json|id_rsa|signing-key)$/i;
  for (const f of await walkFiles(dir)) if (bad.test(f.path)) throw new Error('Refusing to publish a file that looks like a secret: ' + f.path);
}

async function buildAndTest(cfg, o, version) {
  step(2, 'Building the game');
  let r = spawnSync(process.execPath, [path.join(P.ROOT, 'tools', 'build.js')], { cwd: P.ROOT, encoding: 'utf8', stdio: 'inherit' });
  if (r.status !== 0) throw new Error('The game did not build');
  const tests = (cfg.validation && cfg.validation.tests) || [];
  if (o['skip-tests']) console.log('Tests skipped (--skip-tests).');
  else {
    step(3, 'Running the automated tests: ' + tests.join(', '));
    // the tests need Playwright and a browser: use the ones already set up on this PC if nobody says otherwise
    const env = Object.assign({}, process.env), rbpw = path.join(os.tmpdir(), 'rbpw', 'node_modules'), chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
    if (!env.NODE_PATH && fs.existsSync(rbpw)) env.NODE_PATH = rbpw;
    if (!env.CHROMIUM && fs.existsSync(chrome)) env.CHROMIUM = chrome;
    for (const t of tests) {
      console.log('  ' + t);
      r = spawnSync(process.execPath, [path.join(P.ROOT, t)], { cwd: P.ROOT, encoding: 'utf8', env });
      if (/Cannot find module 'playwright'/.test(r.stderr || '')) throw new Error('The tests need Playwright. Install it with: npm i playwright (then set NODE_PATH), or use --skip-tests.');
      if (r.status !== 0) {
        console.log((r.stdout || '').split('\n').filter(l => /^FAIL|FAILED|Error/.test(l)).slice(0, 20).join('\n'));
        throw new Error('The test ' + t + ' failed, so nothing was published. Run it on its own to see why, or use --skip-tests if you are sure.');
      }
    }
  }
  const G = require('./lib/game-package');
  step(4, 'Packaging, hardening and starting the game');
  const outDir = path.join(workDir(cfg), 'game-' + version);
  const { dir, exe } = await G.packageGame({ version, outDir });
  await G.harden(exe);
  const res = await G.smoke(exe, { userData: path.join(os.tmpdir(), 'rbpub-smoke-' + process.pid) });
  if (!res.ok) throw new Error('The packaged game did not reach its first frame, so nothing was published.\n' + res.out.slice(0, 1200));
  console.log('The packaged game started and reached its first frame.');
  return dir;
}

async function publishGame(cfg, o, backend, http, key, trusted, published) {
  const prevVersion = published.latest && published.latest.game ? published.latest.game.version : null;
  let version = JSON.parse(await fsp.readFile(versionFile(cfg), 'utf8')).version;
  if (o.version) version = o.version;
  if (o.bump) version = bumped(version, o.bump);
  if (!validVersion(version)) throw new Error('The version must look like 6.13.0: ' + version);
  step(1, 'Version ' + version + (prevVersion ? ' (on the server now: ' + prevVersion + ')' : ' (nothing on the server yet)'));
  if (prevVersion && cmpVersion(version, prevVersion) <= 0) throw new Error('Version ' + version + ' is not newer than ' + prevVersion + ', which is already published. Use --bump patch.');

  const dir = o['from-folder'] ? path.resolve(o['from-folder']) : await buildAndTest(cfg, o, version);
  if (!fs.existsSync(path.join(dir, cfg.entry))) throw new Error(cfg.entry + ' is not in ' + dir);
  await refuseSecrets(dir);

  step(5, 'Hashing every file and comparing with the published version');
  let lastPct = -1;
  const { files, chunks } = await buildTree(dir, { cacheDir: path.join(workDir(cfg), 'parts-cache'), onProgress: (d, t) => { const p = Math.floor(d / t * 10) * 10; if (p !== lastPct) { lastPct = p; process.stdout.write(p + '% '); } } });
  console.log();
  const diff = diffManifests(published.manifest, files);
  console.log(`  ${diff.same.length} files unchanged, ${diff.changed.length} changed, ${diff.added.length} added, ${diff.removed.length} removed`);
  for (const f of diff.changed) console.log('  changed  ' + f);
  for (const f of diff.added.slice(0, 40)) console.log('  added    ' + f);
  for (const f of diff.removed) console.log('  removed  ' + f);

  step(6, 'Uploading new parts to ' + backend.name);
  const prevParts = new Map();
  if (published.manifest) for (const f of published.manifest.files) for (const c of f.chunks) prevParts.set(c[0], published.manifest.bases[c[3]]);
  const bases = [], baseIndex = new Map();
  const baseId = b => { if (!baseIndex.has(b)) { baseIndex.set(b, bases.length); bases.push(b); } return baseIndex.get(b); };
  let up = 0, upBytes = 0, reused = 0, reusedBytes = 0;
  const toUpload = [];
  const partBase = new Map();
  for (const [hash, rec] of chunks) {
    const name = hash + '.br';
    if (prevParts.has(hash)) { partBase.set(hash, prevParts.get(hash)); reused++; reusedBytes += rec.encSize; continue; }
    if (!o['dry-run'] && await backend.chunkExists(name)) { partBase.set(hash, backend.chunkBase(name)); reused++; reusedBytes += rec.encSize; continue; }
    toUpload.push([hash, rec]);
  }
  if (o['dry-run']) { for (const [hash] of toUpload) partBase.set(hash, new URL('chunks/', cfg.publicUrl).toString()); }
  else {
    let i = 0;
    const worker = async () => {
      for (;;) {
        const next = toUpload[i++];
        if (!next) return;
        const [hash, rec] = next;
        partBase.set(hash, await backend.putChunk(hash + '.br', rec.encFile));
        up++; upBytes += rec.encSize;
        if (up % 25 === 0) console.log('  ' + up + ' of ' + toUpload.length + ' parts');
      }
    };
    // GitHub's API asks for uploads one at a time; other hosts take several at once
    await Promise.all(Array.from({ length: cfg.storage.type === 'github' ? 1 : 6 }, worker));
  }
  const totalEnc = [...chunks.values()].reduce((a, c) => a + c.encSize, 0);
  const newBytes = toUpload.reduce((a, x) => a + x[1].encSize, 0);
  console.log(`  ${toUpload.length} new parts (${fmtBytes(newBytes)}), ${reused} already there (${fmtBytes(reusedBytes)})`);
  console.log(`  A player on ${prevVersion || 'nothing'} downloads about ${fmtBytes(newBytes)} of a ${fmtBytes(totalEnc)} game.`);

  step(7, 'Signing the manifest');
  const notes = { title: o.title || ('Rootbound ' + version), body: o['notes-file'] ? await fsp.readFile(o['notes-file'], 'utf8') : (o.notes || '') };
  const manifest = {
    schema: 1, kind: 'manifest', product: 'rootbound', version, entry: cfg.entry, publishedAt: Date.now(), bases, preserve: cfg.preserve || [],
    files: files.map(f => {
      const ch = [];
      for (const part of f.order) { const rec = chunks.get(part.hash); ch.push([part.hash, part.size, rec.encSize, baseId(partBase.get(part.hash)), rec.encHash]); }
      return { path: f.path, size: f.size, sha256: f.sha256, chunks: ch };
    }),
  };
  checkManifest(JSON.parse(JSON.stringify(manifest)));
  const envBytes = Buffer.from(JSON.stringify(signEnvelope(manifest, key.privatePem, cfg.keyId)));
  const manKey = 'manifests/game-' + version + '.json';
  const total = files.reduce((a, f) => a + f.size, 0);
  if (!o['dry-run']) await backend.putBytes(manKey, envBytes, { type: 'application/json', cache: 'public, max-age=31536000, immutable' });

  return {
    version, totalSize: total, downloadSize: totalEnc, manifest: P.publicName(backend, manKey), manifestSha256: sha256(envBytes), manifestSize: envBytes.length,
    notes, fromVersion: prevVersion, deltaBytes: newBytes,
  };
}

async function publishLauncherApp(cfg, o, backend, key) {
  const A = require('./lib/launcher-package');
  step('L', 'Packing the launcher code');
  const { version, file, size, hash, minBootstrap } = await A.packApp({ outDir: path.join(workDir(cfg), 'launcher-app'), versionOverride: o['launcher-version'] });
  const fileKey = 'launcher/app-' + version + '.asar', envKey = 'launcher/app-' + version + '.json';
  const record = { schema: 1, kind: 'launcher-app', version, sha256: hash, size, minBootstrap, publishedAt: Date.now() };
  const env = Buffer.from(JSON.stringify(signEnvelope(record, key.privatePem, cfg.keyId)));
  if (!o['dry-run']) {
    await backend.putFile(fileKey, file, { type: 'application/octet-stream' });
    await backend.putBytes(envKey, env, { type: 'application/json' });
  }
  console.log('  Launcher ' + version + ', ' + fmtBytes(size));
  return { version, file: P.publicName(backend, fileKey), envelope: P.publicName(backend, envKey), sha256: hash, size, minBootstrap, notes: { title: 'Launcher ' + version, body: o.notes || '' } };
}

// Reads the public address again, the way a player's launcher will, and checks a sample of what it finds.
async function verifyLive(cfg, http, trusted, expect) {
  const { latest, manifest } = await P.readPublished(cfg, http, trusted);
  if (!latest || latest.sequence !== expect.sequence) throw new Error('The server does not show the new update list yet (the host may cache it for a minute). Nothing is wrong with what was uploaded; check again in a minute.');
  if (manifest && expect.game) {
    const sample = [];
    for (const f of manifest.files) for (const c of f.chunks) sample.push(c);
    for (let i = 0; i < Math.min(5, sample.length); i++) {
      const c = sample[Math.floor(i * sample.length / 5)];
      const b = await http.getBytes(manifest.bases[c[3]] + c[0] + '.br', { maxBytes: c[2] + 1 });
      if (sha256(b) !== c[4]) throw new Error('A part on the server does not match its manifest: ' + c[0]);
    }
  }
  console.log('Checked from the public address: signature good, version ' + (latest.game ? latest.game.version : '-') + ', sampled parts match.');
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter(l => l.startsWith('//')).map(l => l.slice(3)).join('\n')); return; }
  const cfg = P.loadConfig(o.config);
  const key = await P.loadSigningKey(cfg);
  const trusted = await P.checkKeyIsTrusted(cfg, key);
  const backend = P.makeBackend(cfg), http = P.makeHttp(cfg);
  console.log('Publishing to ' + cfg.publicUrl + ' through ' + backend.name + (o['dry-run'] ? ' (DRY RUN: nothing will be sent)' : ''));
  const published = await P.readPublished(cfg, http, trusted);

  const latest = { schema: 1, kind: 'latest', channel: cfg.channel, sequence: P.nextSequence(published.latest && published.latest.sequence), publishedAt: Date.now(), game: published.latest ? published.latest.game : null, launcher: published.latest ? published.latest.launcher : null };
  let game = null;
  if (!o['launcher-only']) { game = await publishGame(cfg, o, backend, http, key, trusted, published); latest.game = game; }
  if (o.launcher || o['launcher-only']) latest.launcher = await publishLauncherApp(cfg, o, backend, key);

  // ---- release notes become a news item, in the source file and on the server
  if (game && !o['dry-run']) {
    const file = path.join(path.dirname(cfg._file), cfg.newsFile || 'content/news.json');
    if (fs.existsSync(file)) {
      const src = JSON.parse(await fsp.readFile(file, 'utf8'));
      src.items = src.items || [];
      const id = 'update-' + game.version;
      if (!src.items.some(i => i.id === id)) src.items.unshift({ id, type: 'update', title: game.notes.title, summary: game.notes.body.split('\n')[0].slice(0, 240), body: game.notes.body, date: new Date().toISOString().slice(0, 10), version: game.version });
      await fsp.writeFile(file, JSON.stringify(src, null, 2) + '\n');
      await P.publishNews(cfg, backend, http, key, trusted, file);
    }
  }

  step(8, 'Going live');
  if (o['dry-run']) { console.log('Dry run: everything checked out, and nothing was sent.'); return; }
  await P.publishLatest(cfg, backend, latest, key);
  if (game) await fsp.writeFile(versionFile(cfg), JSON.stringify({ version: game.version }, null, 2) + '\n');
  await backend.finish();
  await verifyLive(cfg, http, trusted, latest);
  http.close();
  console.log('\nDone. ' + (game ? 'Rootbound ' + game.version + ' is live: launchers get it the next time they check.' : 'The launcher update is live.'));
  if (game && game.fromVersion) console.log('Download for existing players: about ' + fmtBytes(game.deltaBytes) + '.');
}

main().catch(e => { console.error('\nPublishing stopped: ' + e.message); process.exit(1); });
