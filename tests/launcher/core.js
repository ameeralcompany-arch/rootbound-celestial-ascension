// The update path, end to end, against a real local HTTPS server with the real publishing tool and a small made-up game: first install, delta updates, broken networks,
// corrupt files, forged manifests, crashes, repair and rollback. Plain Node, no Electron and no browser. node tests/launcher/core.js
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), os = require('os'), crypto = require('crypto'), http = require('http'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), CORE = path.join(ROOT, 'launcher', 'app', 'core');
const { Http } = require(path.join(CORE, 'http'));
const { UpdateManager } = require(path.join(CORE, 'update-manager'));
const { GameInstall, unsafeGameDir } = require(path.join(CORE, 'game-install'));
const { signEnvelope, newKeyPair, verifyEnvelope } = require(path.join(CORE, 'signing'));
const { checkManifest } = require(path.join(CORE, 'manifest'));
const { sha256File, sha256, walkFiles, safeRelPath } = require(path.join(CORE, 'util'));
const { serve, makeCert } = require(path.join(ROOT, 'tools', 'publish', 'serve-local'));
const { signV4 } = require(path.join(ROOT, 'tools', 'publish', 'backends', 's3'));

let fails = 0, passes = 0, lastOk = Date.now(), watch = null;
const ok = (n, c, d) => { lastOk = Date.now(); if (c) passes++; else fails++; console.log((c ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? '  - ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 300) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'rblauncher-core-'));
const rnd = n => { const b = Buffer.alloc(n), s = crypto.createHash('sha256').update('seed' + n).digest(); for (let i = 0, x = s.readUInt32LE(0); i < n; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; b[i] = x & 255; } return b; };
const write = (root, rel, buf) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); };
const treeHash = async dir => { const m = {}; for (const f of await walkFiles(dir)) m[f.path] = await sha256File(f.full); return m; };

const HOST = path.join(T, 'host'), WORK = path.join(T, 'work');
const cert = makeCert(path.join(T, 'cert'));
const K = newKeyPair(), KEYFILE = path.join(T, 'keys', 'signing-key.pem');
fs.mkdirSync(path.dirname(KEYFILE), { recursive: true }); fs.writeFileSync(KEYFILE, K.privatePem);

async function main() {
  // nothing here may hang: if no check has finished in a minute, say what the update was doing and stop
  setInterval(() => { if (Date.now() - lastOk > 60000) { console.log('FAIL stuck', watch ? JSON.stringify(watch()).slice(0, 900) : ''); process.exit(1); } }, 2000).unref();
  fs.mkdirSync(HOST, { recursive: true }); fs.mkdirSync(WORK, { recursive: true });
  const S = await serve({ dir: HOST, cert });
  const channelUrl = S.url;
  const lconf = path.join(T, 'launcher-config.json');
  const conf = { channelUrl, channel: 'stable', publicKeys: { 'rb-test': K.publicKeyB64 } };
  fs.writeFileSync(lconf, JSON.stringify(conf));
  const pubCfg = path.join(T, 'publish.config.json');
  fs.writeFileSync(pubCfg, JSON.stringify({ channel: 'stable', publicUrl: channelUrl, storage: { type: 'folder', path: 'host' }, signingKey: KEYFILE, keyId: 'rb-test', entry: 'Rootbound.exe', preserve: ['safe-mode.txt'], launcherConfig: lconf, tlsCaFile: cert.certFile, versionFile: path.join(T, 'version.json'), workDir: 'work', newsFile: 'news-src/news.json' }));
  fs.writeFileSync(path.join(T, 'version.json'), JSON.stringify({ version: '1.0.0' }));
  fs.mkdirSync(path.join(T, 'news-src', 'images'), { recursive: true });
  fs.writeFileSync(path.join(T, 'news-src', 'news.json'), JSON.stringify({ items: [], events: [] }));
  const client = () => new Http({ ca: cert.cert, userAgent: 'test', idleTimeoutMs: 6000 });
  // not spawnSync: the test server lives in this process and has to keep answering
  const runPublish = (dir, version, notes) => new Promise(res => {
    const c = spawn(process.execPath, [path.join(ROOT, 'tools/publish/publish-update.js'), '--from-folder', dir, '--version', version, '--notes', notes, '--config', pubCfg], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = ''; c.stdout.on('data', d => { out += d; }); c.stderr.on('data', d => { err += d; });
    c.on('exit', code => res({ status: code, stdout: out, stderr: err }));
  });
  const publish = async (dir, version, notes = 'notes ' + version) => {
    const r = await runPublish(dir, version, notes);
    if (r.status !== 0) throw new Error('publish failed: ' + r.stdout + r.stderr);
    return r.stdout;
  };

  // ---- pure parts
  ok('safe paths: ordinary path allowed', safeRelPath('resources/app.asar') && safeRelPath('Rootbound.exe'));
  for (const bad of ['../x', 'a/../../x', '/etc/x', 'C:/x', 'a\\b', 'a/./b', 'con', 'x/nul.txt', 'a:b', 'x. ', 'a//b']) ok('safe paths: refuses ' + bad, !safeRelPath(bad));
  // AWS's own published example for Signature V4 (GET object, "Example: GET Object" in their S3 docs)
  { const s = signV4({ method: 'GET', host: 'examplebucket.s3.amazonaws.com', canonicalPath: '/test.txt', headers: { range: 'bytes=0-9' }, payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', accessKey: 'AKIAIOSFODNN7EXAMPLE', secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', region: 'us-east-1', now: new Date('2013-05-24T00:00:00Z') });
    ok('S3 signature matches the example in AWS\'s documentation', s.headers.authorization.endsWith('Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41'), s.headers.authorization); }

  // ---- the publisher refuses what it must
  const G1 = path.join(T, 'g1');
  const exe = rnd(9 * 1024 * 1024), asar = rnd(30 * 1024 * 1024), big = rnd(5 * 1024 * 1024);
  write(G1, 'Rootbound.exe', exe); write(G1, 'resources/app.asar', asar); write(G1, 'locales/en-US.pak', big); write(G1, 'old.dat', rnd(40000)); write(G1, 'empty.txt', Buffer.alloc(0));
  { const G0 = path.join(T, 'g0'); write(G0, 'Rootbound.exe', Buffer.from('x')); write(G0, 'resources/signing-key.pem', Buffer.from('secret'));
    const r = await runPublish(G0, '0.9.0', 'x');
    ok('the publisher refuses a build containing a key file', r.status !== 0 && /secret/.test(r.stderr), r.stderr.trim()); }
  ok('nothing was published by the refused build', !fs.existsSync(path.join(HOST, 'latest.json')));

  // ---- first install
  const out1 = await publish(G1, '1.0.0');
  ok('publish 1.0.0 went live', /is live/.test(out1) && fs.existsSync(path.join(HOST, 'latest.json')));
  ok('latest.json and the manifest are signed', (() => { const e = JSON.parse(fs.readFileSync(path.join(HOST, 'latest.json'))); return verifyEnvelope(e, conf.publicKeys).game.version === '1.0.0'; })());
  const saves = path.join(T, 'saves'); write(saves, 'Local Storage/leveldb/000.log', rnd(5000)); const savesBefore = await treeHash(saves);
  const stateDir = path.join(T, 'state');
  const mkMgr = (o = {}) => new UpdateManager(Object.assign({ config: conf, http: client(), stateDir, gameDir: path.join(T, 'game'), saveDir: saves, smokeCheck: false }, o));
  const finish = m => new Promise(res => { const on = t => { m.off('task-end', on); res(t); }; m.on('task-end', on); });
  let M = mkMgr();
  watch = () => ({ hist: M.history.slice(0, 3), count: M.listenerCount('task-end'), task: M.task && M.task.snapshot(), dl: M.task && M.task.dl && { state: M.task.dl.state, pending: M.task.dl.pending.length, retries: M.task.dl.retries }, handles: process._getActiveHandles().length });
  await M.init();
  let st = await M.check();
  ok('check finds a version to install', st.action === 'install' && st.latest.version === '1.0.0', st.action);
  let end = finish(M); M.enqueue('install'); let t = await end;
  ok('first install finishes', t.phase === 'done', t.error);
  const live = async () => { const p = JSON.parse(fs.readFileSync(path.join(T, 'game', 'install.json'))); return { p, dir: path.join(T, 'game', 'versions', p.current.id) }; };
  let L = await live();
  ok('the installed files are exactly the published ones', JSON.stringify(await treeHash(L.dir)) === JSON.stringify(await treeHash(G1)));
  ok('every part was downloaded on the first install', t.delta.firstInstall && t.delta.downloadBytes > 0, t.delta);
  ok('the status says Play', (await M.status()).action === 'play' && (await M.status()).version === '1.0.0');
  ok('pre-launch check passes', (await M.install.preLaunchCheck()).ok);
  ok('the cache is cleaned after installing', !fs.existsSync(path.join(T, 'game', 'cache')));
  ok('nothing is left in staging', !fs.existsSync(path.join(T, 'game', 'staging')));

  // ---- delta update: a small edit near the start of a big file, one file removed, one added
  write(L.dir, 'safe-mode.txt', Buffer.from('player made this'));
  const G2 = path.join(T, 'g2');
  fs.cpSync(G1, G2, { recursive: true });
  const asar2 = Buffer.concat([asar.subarray(0, 1000000), Buffer.from('a change of a few bytes pushed everything after it along'), asar.subarray(1000000)]);
  write(G2, 'resources/app.asar', asar2); fs.rmSync(path.join(G2, 'old.dat')); write(G2, 'new.dat', rnd(70000));
  const out2 = await publish(G2, '1.0.1', 'A small fix');
  ok('the publisher lists what changed', /1 changed/.test(out2) && /1 added/.test(out2) && /1 removed/.test(out2) && /changed\s+resources\/app\.asar/.test(out2), out2.split('\n').filter(l => /changed|added|removed/.test(l)).join(' | '));
  const parts1 = fs.readdirSync(path.join(HOST, 'chunks')).length;
  const before = S.ctl.stats.bytes;
  st = await M.check();
  ok('check offers the update', st.action === 'update' && st.latest.version === '1.0.1');
  ok('the notes come with it', st.latest.notes && st.latest.notes.body === 'A small fix');
  const inoExe1 = fs.statSync(path.join(L.dir, 'Rootbound.exe'), { bigint: true }).ino;
  end = finish(M); M.enqueue('update'); t = await end;
  const sent = S.ctl.stats.bytes - before;
  const totalSize = asar2.length + exe.length + big.length;
  ok('the update finishes', t.phase === 'done', t.error);
  ok('it downloaded far less than the whole game', sent < totalSize * 0.15, { sent, totalSize, delta: t.delta });
  ok('only the changed file was rebuilt, others kept', t.delta.changedFiles === 2 && t.delta.keptFiles >= 3, t.delta);
  const prevDir = L.dir; L = await live();
  ok('new version is live and identical to what was published', (await (async () => { const a = await treeHash(L.dir); delete a['safe-mode.txt']; return JSON.stringify(a) === JSON.stringify(await treeHash(G2)); })()));
  ok('a removed file is gone from the new version', !fs.existsSync(path.join(L.dir, 'old.dat')));
  ok('a new file arrived', fs.existsSync(path.join(L.dir, 'new.dat')));
  ok('the player\'s own file moved along', fs.readFileSync(path.join(L.dir, 'safe-mode.txt'), 'utf8') === 'player made this');
  ok('unchanged files take no extra disk (hard links)', fs.statSync(path.join(L.dir, 'Rootbound.exe'), { bigint: true }).ino === inoExe1);
  ok('the previous version is still kept', fs.existsSync(prevDir) && L.p.previous && L.p.previous.version === '1.0.0');
  ok('saves were never touched', JSON.stringify(await treeHash(saves)) === JSON.stringify(savesBefore));

  // ---- broken networks
  const G3 = path.join(T, 'g3'); fs.cpSync(G2, G3, { recursive: true }); write(G3, 'locales/en-US.pak', rnd(6 * 1024 * 1024)); await publish(G3, '1.0.2');
  await M.check();
  { // connections dropped halfway through, once per file: must resume with a range, not start over
    const seen = new Set(); let ranges0 = S.ctl.stats.rangeRequests;
    S.ctl.fault = (url) => { if (!url.includes('/chunks/')) return null; if (!seen.has(url)) { seen.add(url); return { dropAfter: 128 * 1024 }; } return null; };
    M.install.concurrency = 2;
    end = finish(M); M.enqueue('update'); t = await end;
    S.ctl.fault = null;
    ok('downloads that were cut off carry on and finish', t.phase === 'done', t.error);
    ok('it picked up where it stopped, with ranges', S.ctl.stats.rangeRequests > ranges0, { ranges: S.ctl.stats.rangeRequests - ranges0 });
    L = await live();
    ok('the result after cut-off downloads is still exact', (await sha256File(path.join(L.dir, 'locales/en-US.pak'))) === (await sha256File(path.join(G3, 'locales/en-US.pak'))));
  }
  const G4 = path.join(T, 'g4'); fs.cpSync(G3, G4, { recursive: true }); write(G4, 'locales/en-US.pak', rnd(7 * 1024 * 1024)); await publish(G4, '1.0.3');
  await M.check();
  { // corrupted bytes on the wire: the hash refuses them, the part is fetched again
    const seen = new Set(); let refused = 0;
    S.ctl.fault = url => { if (!url.includes('/chunks/')) return null; if (!seen.has(url)) { seen.add(url); refused++; return { corrupt: true }; } return null; };
    end = finish(M); M.enqueue('update'); t = await end;
    S.ctl.fault = null;
    ok('corrupt downloads are refused and fetched again', t.phase === 'done' && refused > 0, { refused, err: t.error });
    L = await live();
    ok('no corrupt byte reached the game', (await sha256File(path.join(L.dir, 'locales/en-US.pak'))) === (await sha256File(path.join(G4, 'locales/en-US.pak'))));
  }
  const G5 = path.join(T, 'g5'); fs.cpSync(G4, G5, { recursive: true }); write(G5, 'locales/en-US.pak', rnd(8 * 1024 * 1024)); await publish(G5, '1.0.4');
  await M.check();
  { // the server stays down: the task fails, the game stays as it was, Retry finishes with what is already cached
    const before = (await live()).p.current.version;
    let down = true;
    S.ctl.fault = url => { if (!url.includes('/chunks/')) return null; return down ? { status: 503 } : null; };
    M.install.http = client();
    const job = M.install.makeDownload; M.install.makeDownload = function (plan) { const j = job.call(this, plan); j.backoffMs = 10; j.maxAttempts = 3; return j; };
    end = finish(M); M.enqueue('update'); t = await end;
    ok('a server that stays down ends in a clear failure', t.phase === 'failed' && /503/.test(t.error.message), t.error);
    ok('the game is unchanged after a failed update', (await live()).p.current.version === before && (await M.install.preLaunchCheck()).ok);
    ok('the launcher still knows the update is there to retry', (await M.status()).canResume && (await M.status()).action === 'update');
    down = false; S.ctl.fault = null;
    end = finish(M); M.enqueue('update'); t = await end; M.install.makeDownload = job;
    ok('retry succeeds', t.phase === 'done', t.error);
    ok('and the update is now live', (await live()).p.current.version === '1.0.4');
  }

  // ---- pause, resume, cancel, speed limit
  const G6 = path.join(T, 'g6'); fs.cpSync(G5, G6, { recursive: true }); write(G6, 'resources/app.asar', rnd(31 * 1024 * 1024)); await publish(G6, '1.0.5');
  await M.check();
  { S.ctl.throttleBps = 6 * 1024 * 1024; M.setBandwidth(3000);
    end = finish(M); M.enqueue('update');
    let snap = null; M.on('task', s => { snap = s; });
    while (!(snap && snap.phase === 'downloading' && snap.download && snap.download.downloaded > 1024 * 1024)) await sleep(50);
    await sleep(1500);
    const speed = snap.download.speed;
    ok('the speed limit holds', speed > 0 && speed < 3000 * 1024 * 1.5, { speed: Math.round(speed / 1024) + ' KB/s' });
    ok('progress reports size, percent, speed and time left', snap.download.total > 0 && snap.download.percent > 0 && snap.download.eta > 0, { pct: snap.download.percent, eta: snap.download.eta });
    M.setBandwidth(0);
    ok('pause is accepted', M.pause());
    await sleep(400);
    const reqs = S.ctl.stats.bytes; await sleep(800);
    ok('while paused nothing downloads', S.ctl.stats.bytes === reqs, { delta: S.ctl.stats.bytes - reqs });
    ok('the task says paused', M.task.snapshot().paused === true);
    const at = S.ctl.stats.bytes, rr = S.ctl.stats.rangeRequests;
    ok('resume is accepted', M.resume());
    t = await end; S.ctl.throttleBps = 0;
    ok('it finishes after resuming', t.phase === 'done', t.error);
    ok('resume used ranges (no start over)', S.ctl.stats.rangeRequests > rr);
    ok('the result is exact', (await sha256File(path.join((await live()).dir, 'resources/app.asar'))) === (await sha256File(path.join(G6, 'resources/app.asar'))));
  }
  const G7 = path.join(T, 'g7'); fs.cpSync(G6, G7, { recursive: true }); write(G7, 'resources/app.asar', rnd(32 * 1024 * 1024)); await publish(G7, '1.0.6');
  await M.check();
  { S.ctl.throttleBps = 4 * 1024 * 1024;
    end = finish(M); M.enqueue('update');
    let snap = null; const on = s => { snap = s; }; M.on('task', on);
    while (!(snap && snap.phase === 'downloading' && snap.download && snap.download.downloaded > 200000)) await sleep(30);
    ok('cancel is accepted', M.cancel());
    t = await end; S.ctl.throttleBps = 0; M.off('task', on);
    ok('cancel leaves the game as it was', t.phase === 'canceled' && (await live()).p.current.version === '1.0.5', t.phase);
    ok('cancel cleans up its downloads', !fs.existsSync(path.join(T, 'game', 'cache')) || (await walkFiles(path.join(T, 'game', 'cache'))).length === 0);
    ok('history records it', M.history[0].result === 'canceled');
  }

  // ---- a launcher killed in the middle of a download carries on
  { const code = `
const {UpdateManager}=require(${JSON.stringify(path.join(CORE, 'update-manager'))});const {Http}=require(${JSON.stringify(path.join(CORE, 'http'))});const fs=require('fs');
(async()=>{const m=new UpdateManager({config:${JSON.stringify(conf)},http:new Http({ca:fs.readFileSync(${JSON.stringify(cert.certFile)})}),stateDir:${JSON.stringify(stateDir)},gameDir:${JSON.stringify(path.join(T, 'game'))},saveDir:${JSON.stringify(saves)},smokeCheck:false});await m.init();await m.check();m.on('task',s=>{if(s.download&&s.download.downloaded>${8 * 1024 * 1024})console.log('MID')});m.enqueue('update')})();`;
    S.ctl.throttleBps = 8 * 1024 * 1024;
    const c = spawn(process.execPath, ['-e', code], { stdio: ['ignore', 'pipe', 'inherit'] });
    await new Promise(res => { c.stdout.on('data', d => { if (/MID/.test(d)) res(); }); c.on('exit', res); });
    c.kill('SIGKILL'); await sleep(400); S.ctl.throttleBps = 0;
    ok('the killed run left no half-built version live', (await live()).p.current.version === '1.0.5');
    const cached = (await walkFiles(path.join(T, 'game', 'cache'))).reduce((a, f) => a + f.size, 0);
    const m2 = mkMgr(); await m2.init();
    ok('the next start knows there is work to resume', (await m2.status()).canResume);
    await m2.check();
    const before2 = S.ctl.stats.bytes;
    const e2 = finish(m2); m2.enqueue('update'); const t2 = await e2;
    ok('after a crash the update finishes', t2.phase === 'done', t2.error);
    const sent2 = S.ctl.stats.bytes - before2;
    ok('it did not start over: what was downloaded before the crash was kept', cached > 4 * 1024 * 1024 && sent2 < t2.delta.downloadBytes - 2 * 1024 * 1024, { cached, sent2, whole: t2.delta.downloadBytes });
    M = m2;
  }

  // ---- repair and integrity
  L = await live();
  { fs.writeFileSync(path.join(L.dir, 'Rootbound.exe'), Buffer.concat([exe.subarray(0, 100), Buffer.from('EVIL'), exe.subarray(104)]));
    fs.rmSync(path.join(L.dir, 'new.dat'));
    const v = await M.install.verifyInstalled();
    ok('integrity check finds exactly the damaged files', !v.ok && v.bad.length === 2 && v.bad.some(b => b.path === 'Rootbound.exe' && b.why === 'hash') && v.bad.some(b => b.path === 'new.dat' && b.why === 'missing'), v.bad);
    ok('a changed program stops the pre-launch check', !(await M.install.preLaunchCheck()).ok);
    const asarIno = fs.statSync(path.join(L.dir, 'resources/app.asar'), { bigint: true }).ino, b4 = S.ctl.stats.bytes;
    end = finish(M); M.enqueue('repair'); t = await end;
    ok('repair finishes', t.phase === 'done', t.error);
    ok('repair names the damaged files', t.badFiles && t.badFiles.includes('Rootbound.exe') && t.badFiles.includes('new.dat'), t.badFiles);
    const L2 = await live();
    ok('repair restored everything', (await M.install.verifyInstalled()).ok && L2.p.current.version === L.p.current.version);
    ok('repair keeps the older version to go back to', L2.p.previous && L2.p.previous.version === L.p.previous.version, L2.p.previous);
    ok('repair downloaded only what was damaged', S.ctl.stats.bytes - b4 < 12 * 1024 * 1024, { bytes: S.ctl.stats.bytes - b4 });
    ok('undamaged files were not rewritten', fs.statSync(path.join(L2.dir, 'resources/app.asar'), { bigint: true }).ino === asarIno);
    ok('the player\'s own file survived the repair', fs.readFileSync(path.join(L2.dir, 'safe-mode.txt'), 'utf8') === 'player made this');
    end = finish(M); M.enqueue('repair'); t = await end;
    ok('repair on a healthy game changes nothing', t.phase === 'done' && (await live()).p.current.id === L2.p.current.id);
    const hs = M.history[0]; ok('and history says nothing was wrong', hs.detail === 'nothing-wrong', hs);
  }

  // ---- local changes never count as published
  L = await live();
  { const fake = JSON.parse(fs.readFileSync(M.install.manifestFile(L.p.current))); const payload = JSON.parse(fake.payload); payload.files[0].size += 1;
    const forgedPtr = Object.assign({}, fake, { payload: JSON.stringify(payload) });
    const mf = M.install.manifestFile(L.p.current), keep = fs.readFileSync(mf);
    fs.writeFileSync(mf, JSON.stringify(forgedPtr));
    const v = await M.install.verifyInstalled();
    ok('a local manifest edited by hand is refused', !v.ok && /signature/i.test(v.manifestProblem || ''), v);
    fs.writeFileSync(mf, keep);
    const G8 = path.join(T, 'g8'); fs.cpSync(G7, G8, { recursive: true }); write(G8, 'new.dat', Buffer.from('local-only change'));
    const s = await M.check();
    ok('building a new version locally changes nothing for players', s.latest.version === '1.0.6' && !fs.existsSync(path.join(HOST, 'manifests', 'game-1.0.7.json')));
  }

  // ---- forged data from the server
  const realLatest = fs.readFileSync(path.join(HOST, 'latest.json'));
  { const evil = newKeyPair(), payload = JSON.parse(JSON.parse(realLatest).payload);
    fs.writeFileSync(path.join(HOST, 'latest.json'), JSON.stringify(signEnvelope(Object.assign({}, payload, { sequence: payload.sequence + 5 }), evil.privatePem, 'rb-test')));
    let s = await M.check();
    ok('a list signed with another key is refused', s.checkError && s.checkError.code === 'BAD_SIGNATURE', s.checkError);
    fs.writeFileSync(path.join(HOST, 'latest.json'), JSON.stringify(signEnvelope(Object.assign({}, payload, { sequence: payload.sequence + 5 }), evil.privatePem, 'someone-else')));
    s = await M.check(); ok('a list signed by an unknown key is refused', s.checkError && s.checkError.code === 'BAD_SIGNATURE');
    fs.writeFileSync(path.join(HOST, 'latest.json'), JSON.stringify({ payload: JSON.stringify(Object.assign({}, payload, { sequence: payload.sequence + 5 })), kid: 'rb-test', sig: JSON.parse(realLatest).sig }));
    s = await M.check(); ok('an edited list with the old signature is refused', s.checkError && s.checkError.code === 'BAD_SIGNATURE');
    fs.writeFileSync(path.join(HOST, 'latest.json'), JSON.stringify(payload));
    s = await M.check(); ok('an unsigned list is refused', s.checkError && s.checkError.code === 'BAD_SIGNATURE');
    // an older, genuinely signed list: rollback attack
    fs.writeFileSync(path.join(HOST, 'latest.json'), JSON.stringify(signEnvelope(Object.assign({}, payload, { sequence: 5, game: Object.assign({}, payload.game, { version: '1.0.0' }) }), K.privatePem, 'rb-test')));
    s = await M.check(); ok('an older signed list (a replay) is refused', s.checkError && s.checkError.code === 'REPLAY', s.checkError);
    fs.writeFileSync(path.join(HOST, 'latest.json'), realLatest);
    s = await M.check(); ok('the genuine list is accepted again', !s.checkError && s.latest.version === '1.0.6');

    // the manifest on the server is swapped for a different one
    const mf = path.join(HOST, 'manifests', 'game-1.0.6.json'), real = fs.readFileSync(mf);
    const G9 = path.join(T, 'g9'); fs.cpSync(G7, G9, { recursive: true }); write(G9, 'resources/app.asar', rnd(33 * 1024 * 1024)); const out9 = await publish(G9, '1.0.7'); await M.check();
    const mf7 = path.join(HOST, 'manifests', 'game-1.0.7.json'), real7 = fs.readFileSync(mf7);
    fs.writeFileSync(mf7, real);
    end = finish(M); M.enqueue('update'); t = await end;
    ok('a swapped manifest is refused', t.phase === 'failed' && t.error.code === 'BAD_MANIFEST', t.error);
    fs.writeFileSync(mf7, real7);
    // a validly signed manifest asking for a path outside the game folder (a stolen key still can't write elsewhere)
    const bad = JSON.parse(JSON.parse(real7).payload); bad.files[0].path = '../../evil.exe';
    let threw = ''; try { checkManifest(bad); } catch (e) { threw = e.message; }
    ok('a manifest that points outside the game folder is refused', /unsafe/.test(threw), threw);
    const bad2 = JSON.parse(JSON.parse(real7).payload); bad2.files.find(f => f.chunks.length).chunks[0][1] += 5;
    threw = ''; try { checkManifest(bad2); } catch (e) { threw = e.message; }
    ok('a manifest whose parts don\'t add up is refused', /add up/.test(threw), threw);
    // a part swapped on the host fails its hash even though the manifest is genuine
    const anyChunk = JSON.parse(JSON.parse(real7).payload).files.find(f => f.path === 'resources/app.asar').chunks[0][0] + '.br';
    const pf = path.join(HOST, 'chunks', anyChunk), realPart = fs.readFileSync(pf);
    fs.writeFileSync(pf, Buffer.concat([realPart.subarray(0, 8), Buffer.from('tamper'), realPart.subarray(14)]));
    const job = M.install.makeDownload; M.install.makeDownload = function (plan) { const j = job.call(this, plan); j.backoffMs = 10; j.maxAttempts = 2; return j; };
    end = finish(M); M.enqueue('update'); t = await end; M.install.makeDownload = job;
    ok('a part changed on the server is refused and the update stops', t.phase === 'failed' && /damaged/.test(t.error.message), t.error);
    ok('the game is unchanged', (await live()).p.current.version === '1.0.6' && (await M.install.preLaunchCheck()).ok);
    fs.writeFileSync(pf, realPart);
    end = finish(M); M.enqueue('update'); t = await end;
    ok('and works once the server has the real part again', t.phase === 'done', t.error);
  }

  // ---- HTTPS only
  { const h = client(); let err = '';
    try { await h.getBytes('http://localhost:' + S.port + '/latest.json'); } catch (e) { err = e.code; }
    ok('plain HTTP addresses are refused', err === 'NOT_HTTPS', err);
    const redirectSrv = await serve({ dir: HOST, cert }); redirectSrv.srv.removeAllListeners('request');
    redirectSrv.srv.on('request', (q, r) => { r.writeHead(302, { Location: 'http://localhost:1/x' }); r.end(); });
    err = ''; try { await h.getBytes(redirectSrv.url + 'x'); } catch (e) { err = e.code; }
    ok('a redirect to plain HTTP is refused', err === 'NOT_HTTPS', err);
    const bare = new Http({ userAgent: 'test' }); err = '';
    try { await bare.getBytes(S.url + 'latest.json'); } catch (e) { err = e.code || e.message; }
    ok('a certificate the system does not trust is refused', !!err && err !== 'NOT_HTTPS', err);
    await redirectSrv.close(); bare.close();
  }

  // ---- restore the earlier version; the live one vanishing
  { L = await live();
    const prevV = L.p.previous.version;
    await M.restorePrevious();
    const L3 = await live();
    ok('restore goes back to the earlier version', L3.p.current.version === prevV && (await M.install.verifyInstalled()).ok);
    const s = await M.status();
    ok('it doesn\'t offer to put the same version straight back', s.action === 'play' && s.blocked, { action: s.action, blocked: s.blocked });
    await M.unblock();
    ok('asking again offers it', (await M.status()).action === 'update');
    end = finish(M); M.enqueue('update'); t = await end;
    ok('updating forward again works', t.phase === 'done' && (await live()).p.current.version === '1.0.7', t.error);
    // the live folder disappears: next start falls back to the previous one
    const L4 = await live();
    fs.rmSync(L4.dir, { recursive: true, force: true });
    const m3 = mkMgr(); await m3.init();
    const L5 = await live();
    ok('if the live version vanishes the kept one takes over', L5.p.current.version === L4.p.previous.version && (await m3.install.preLaunchCheck()).ok, L5.p);
    ok('recovery is in the history', m3.history[0].kind === 'recovery');
    await m3.check();
    end = finish(m3); m3.enqueue('update'); t = await end;
    ok('and it can update forward from there', t.phase === 'done', t.error);
    M = m3;
    // crash leftovers
    fs.mkdirSync(path.join(T, 'game', 'staging', 'broken'), { recursive: true }); fs.writeFileSync(path.join(T, 'game', 'staging', 'broken', 'Rootbound.exe'), 'half');
    await mkMgr().init();
    ok('half-built versions from a crash are cleared at start', !fs.existsSync(path.join(T, 'game', 'staging')));
    // a build that won't start must not go live
    const G10 = path.join(T, 'g10'); fs.cpSync(path.join(T, 'g9'), G10, { recursive: true }); write(G10, 'new.dat', rnd(71000)); await publish(G10, '1.0.8');
    const m4 = mkMgr({ smokeCheck: true }); await m4.init(); await m4.check();
    const v0 = (await live()).p.current.version;
    end = finish(m4); m4.enqueue('update'); t = await end;
    ok('a version that fails to start never goes live', t.phase === 'failed' && t.error.code === 'BOOT_TEST_FAILED' && (await live()).p.current.version === v0, t.error);
    ok('and automatic updates stop offering it', (await m4.status()).blocked);
    M = m4;
  }

  // ---- moving, and folders that are off limits
  { ok('saves folder is off limits for the game', !!unsafeGameDir(path.join(saves, 'x'), { saveDir: saves }));
    ok('a folder containing the saves is off limits', !!unsafeGameDir(T, { saveDir: saves }));
    ok('the top of a drive is off limits', !!unsafeGameDir('C:\\', {}));
    ok('the Windows folder is off limits', !!unsafeGameDir('C:\\Windows\\Stuff', {}));
    ok('an ordinary folder is fine', !unsafeGameDir('C:\\Games\\Rootbound', { saveDir: saves }));
    const full = path.join(T, 'occupied'); write(full, 'mine.txt', Buffer.from('precious'));
    let err = ''; try { await M.install.moveTo(full); } catch (e) { err = e.code; }
    ok('moving into a folder with other files is refused', err === 'NOT_EMPTY' && fs.readFileSync(path.join(full, 'mine.txt'), 'utf8') === 'precious', err);
    err = ''; try { await M.install.moveTo(path.join(M.install.dir, 'inside')); } catch (e) { err = e.code; }
    ok('moving the game into its own folder is refused', err === 'BAD_DIR' && (await M.install.preLaunchCheck()).ok, err);
    const claimed = new GameInstall({ dir: full, publicKeys: conf.publicKeys, http: client(), saveDir: saves });
    err = ''; try { await claimed.claim(); } catch (e) { err = e.code; }
    ok('an install into a folder with other files is refused', err === 'NOT_EMPTY', err);
    fs.mkdirSync(path.join(full, 'staging'), { recursive: true });
    await claimed.recover();
    ok('tidying up never touches a folder that is not ours', fs.existsSync(path.join(full, 'staging')));
    const oldDir = M.install.dir, target = path.join(T, 'moved', 'game');
    let committed = null;
    await M.install.moveTo(target, { commit: d => { committed = fs.existsSync(oldDir) ? d : 'old already gone'; } });
    ok('the new place is saved before the old copy goes', committed === target, committed);
    ok('moving the game works', (await M.install.preLaunchCheck()).ok && (await M.install.verifyInstalled()).ok);
    ok('the old folder is gone', !fs.existsSync(oldDir));
    ok('saves stayed where they were', JSON.stringify(await treeHash(saves)) === JSON.stringify(savesBefore));
    const notOurs = new GameInstall({ dir: full, publicKeys: conf.publicKeys, http: client(), saveDir: saves });
    await notOurs.removeAll();
    ok('uninstalling never removes a folder that is not ours', fs.readFileSync(path.join(full, 'mine.txt'), 'utf8') === 'precious');
    await M.install.removeAll();
    ok('uninstalling removes the game folder', !fs.existsSync(target));
    ok('and leaves the saves alone', JSON.stringify(await treeHash(saves)) === JSON.stringify(savesBefore));
  }

  // ---- every word on the page exists, in every language
  { const vm = require('vm'), ui = path.join(ROOT, 'launcher/app/ui/js');
    const ctx = { window: {}, document: { documentElement: {} } }; ctx.RB = ctx.window.RB = {};
    vm.runInNewContext(fs.readFileSync(path.join(ui, 'i18n.js'), 'utf8').replace("window.RB = window.RB || {};", ''), ctx);
    const STR = ctx.RB.STR, en = Object.keys(STR.en);
    for (const l of Object.keys(STR)) { const miss = en.filter(k => !STR[l][k]); ok('language ' + l + ' has every string', miss.length === 0, miss.slice(0, 12)); }
    const used = new Set();
    for (const f of fs.readdirSync(ui)) for (const m of fs.readFileSync(path.join(ui, f), 'utf8').matchAll(/[( ]t\('([a-zA-Z_]+)'(?!\s*\+)/g)) used.add(m[1]);
    const unknown = [...used].filter(k => !STR.en[k]);
    ok('every string the pages ask for exists', unknown.length === 0, unknown);
    const dyn = ['updates', 'news', 'events', 'library', 'home', 'settings', 'community'].concat(['queued', 'checking', 'scanning', 'downloading', 'assembling', 'verifying', 'testing', 'activating', 'done', 'failed', 'canceled', 'paused'].map(x => 'phase_' + x), ['install', 'update', 'repair', 'restore', 'recovery'].map(x => 'kind_' + x), ['done', 'failed', 'canceled'].map(x => 'r_' + x), ['update', 'content', 'dungeon', 'equipment', 'developer', 'maintenance', 'event'].map(x => 't_' + x), ['hat', 'body', 'wing', 'boot', 'glove'].map(x => 'slot_' + x));
    ok('every computed string exists too', dyn.every(k => STR.en[k]), dyn.filter(k => !STR.en[k]));
  }

  // ---- no hosting at all yet
  { const empty = fs.mkdtempSync(path.join(T, 'empty-')), s2 = await serve({ dir: empty, cert });
    const m = new UpdateManager({ config: Object.assign({}, conf, { channelUrl: s2.url }), http: client(), stateDir: path.join(T, 'state2'), gameDir: path.join(T, 'game2'), saveDir: saves, smokeCheck: false });
    await m.init(); const s = await m.check();
    ok('with nothing published the launcher says so instead of inventing a version', s.action === 'install' && !s.latest && s.checkError && s.checkError.code !== undefined, s.checkError);
    const e = finish(m); m.enqueue('install'); const t3 = await e;
    ok('and installing fails clearly', t3.phase === 'failed', t3.error);
    await s2.close();
    const offline = new UpdateManager({ config: Object.assign({}, conf, { channelUrl: 'https://localhost:1/' }), http: client(), stateDir: path.join(T, 'state3'), gameDir: path.join(T, 'game3'), saveDir: saves, smokeCheck: false });
    await offline.init(); const off = await offline.check();
    ok('offline is reported, not hidden', !!off.checkError, off.checkError);
  }

  // ---- publishing to GitHub Releases, against a stand-in for GitHub's API
  await githubBackendTest(cert);

  await S.close();
  console.log('\n' + passes + ' passed, ' + fails + ' failed');
  fs.rmSync(T, { recursive: true, force: true, maxRetries: 3 });
  process.exit(fails ? 1 : 0);
}

async function githubBackendTest() {
  const github = require(path.join(ROOT, 'tools/publish/backends/github'));
  const releases = new Map(); let nextId = 1, flaky = 0; const log = [];
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'), c = [];
    req.on('data', d => c.push(d));
    req.on('end', () => {
      const body = Buffer.concat(c), send = (s, o) => { res.writeHead(s, { 'Content-Type': 'application/json' }); res.end(o === undefined ? '' : JSON.stringify(o)); };
      log.push(req.method + ' ' + u.pathname);
      if (req.headers.authorization !== 'Bearer test-token') return send(401, { message: 'bad creds' });
      if (flaky > 0) { flaky--; return send(502, { message: 'bad gateway' }); }
      let m;
      if ((m = /\/repos\/o\/r\/releases\/tags\/(.+)$/.exec(u.pathname))) { const r = releases.get(m[1]); return r ? send(200, { id: r.id }) : send(404, { message: 'nf' }); }
      if (req.method === 'POST' && u.pathname === '/repos/o/r/releases') { const j = JSON.parse(body); const r = { id: nextId++, tag: j.tag_name, assets: [], prerelease: j.prerelease }; releases.set(j.tag_name, r); return send(201, { id: r.id }); }
      if ((m = /\/repos\/o\/r\/releases\/(\d+)\/assets$/.exec(u.pathname))) {
        const r = [...releases.values()].find(x => x.id === +m[1]);
        if (req.method === 'GET') { const page = +u.searchParams.get('page') || 1; return send(200, r.assets.slice((page - 1) * 100, page * 100).map(a => ({ id: a.id, name: a.name, state: a.state || 'uploaded' }))); }
        const name = u.searchParams.get('name');
        if (r.assets.some(a => a.name === name)) return send(422, { message: 'already exists' });
        const a = { id: nextId++, name, size: body.length, data: body }; r.assets.push(a); return send(201, { id: a.id, name });
      }
      if ((m = /\/repos\/o\/r\/releases\/assets\/(\d+)$/.exec(u.pathname))) {
        for (const r of releases.values()) { const i = r.assets.findIndex(a => a.id === +m[1]); if (i >= 0) { if (req.method === 'DELETE') { r.assets.splice(i, 1); return send(204); } if (req.method === 'PATCH') { r.assets[i].name = JSON.parse(body).name; return send(200, {}); } } }
        return send(404, {});
      }
      send(500, { message: 'unhandled ' + req.url });
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const b = github({ repo: 'o/r', tag: 'updates' }, 'https://github.com/o/r/releases/download/updates/', { githubToken: 'test-token' }, { apiBase: base, uploadBase: base, retryMs: 1 });
  const tmp = path.join(T, 'gh-part'); fs.writeFileSync(tmp, 'part-bytes');
  await b.putBytes('latest.json', Buffer.from('{"a":1}'));
  const rel = () => releases.get('updates');
  ok('GitHub storage: creates the release and uploads', rel() && rel().assets[0].name === 'latest.json' && rel().prerelease === true);
  await b.putBytes('latest.json', Buffer.from('{"a":2}'));
  ok('GitHub storage: replaces a file in place, no duplicate', rel().assets.length === 1 && rel().assets[0].data.toString() === '{"a":2}' && rel().assets[0].name === 'latest.json', rel().assets.map(a => a.name));
  await b.putBytes('manifests/game-1.0.0.json', Buffer.from('{}'));
  ok('GitHub storage: flattens folders into file names', rel().assets.some(a => a.name === 'manifests-game-1.0.0.json'));
  const url = await b.putChunk('abc.br', tmp);
  ok('GitHub storage: parts go in their own release and report their address', url === 'https://github.com/o/r/releases/download/updates-parts-1/' && releases.get('updates-parts-1').assets[0].name === 'abc.br', url);
  ok('GitHub storage: knows the part is there afterwards', await b.chunkExists('abc.br'));
  const b2 = github({ repo: 'o/r', tag: 'updates' }, 'https://github.com/o/r/releases/download/updates/', { githubToken: 'test-token' }, { apiBase: base, uploadBase: base, retryMs: 1 });
  ok('GitHub storage: a later run finds parts already uploaded', await b2.chunkExists('abc.br') && b2.chunkBase('abc.br') === url);
  // an upload cut off in an earlier run must not count as published
  releases.get('updates-parts-1').assets.push({ id: nextId++, name: 'broken.br', state: 'starter', size: 0, data: Buffer.alloc(0) });
  const b3 = github({ repo: 'o/r', tag: 'updates' }, 'https://github.com/o/r/releases/download/updates/', { githubToken: 'test-token' }, { apiBase: base, uploadBase: base, retryMs: 1 });
  ok('GitHub storage: a half-finished upload does not count as there', !(await b3.chunkExists('broken.br')) && !releases.get('updates-parts-1').assets.some(a => a.name === 'broken.br'));
  await b3.putChunk('broken.br', tmp);
  ok('GitHub storage: and it can be uploaded again', releases.get('updates-parts-1').assets.some(a => a.name === 'broken.br' && a.size > 0));
  flaky = 2;
  await b3.putChunk('flaky.br', tmp);
  ok('GitHub storage: uploads survive a bad moment at GitHub', releases.get('updates-parts-1').assets.some(a => a.name === 'flaky.br') && flaky === 0);
  for (let i = 0; i < 905; i++) await b3.putChunk('n' + i + '.br', tmp);
  ok('GitHub storage: moves to a new release before hitting the limit of 1000 files', releases.get('updates-parts-1').assets.length <= 900 && releases.get('updates-parts-2').assets.length > 0, { a: releases.get('updates-parts-1').assets.length, b: releases.get('updates-parts-2').assets.length });
  srv.closeAllConnections(); srv.close();
}

main().catch(e => { console.log('FAIL crashed', e); process.exit(1); });
