// The whole thing, for real, on this PC, in throwaway folders and off-screen: the real game packaged and published with the real tool to a local HTTPS server, the real installer, the real launcher
// (unlocked so it can be driven, and locked for the parts that can run without being driven), real downloads, real game starts on a temporary copy of the real save.
//   NODE_PATH=... CHROMIUM=... node tests/launcher/e2e.js [screenshot folder]
// Never touches the real save, real Desktop, real Start menu, real uninstall entry, or the live host.
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), os = require('os'), crypto = require('crypto'), { spawn, execFileSync } = require('child_process');
const { _electron } = require('playwright');
const { makeWorld, ROOT } = require('./world');
const { packageLauncher, loadAsar } = require(path.join(ROOT, 'tools/publish/lib/launcher-package'));
const { buildSetupExe } = require(path.join(ROOT, 'tools/publish/build-launcher'));
const { sha256File, walkFiles } = require(path.join(ROOT, 'launcher/app/core/util'));

let fails = 0, passes = 0;
const ok = (n, c, d) => { if (c) passes++; else fails++; console.log((c ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? '  - ' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 400) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'rbl-e2e-'));
const SHOTS = process.argv[2] ? path.resolve(process.argv[2]) : path.join(T, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const OFFENV = { RB_TEST_OFFSCREEN: '1', RB_L_W: '1360', RB_L_H: '840' };
const envFor = o => Object.assign({}, process.env, OFFENV, o);

// Runs a program, collects its output, with a time limit. Keeps this process's test server responsive.
const exec = (exe, args, { env, timeoutMs = 300000 } = {}) => new Promise(res => {
  const c = spawn(exe, args, { env: env || process.env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let out = '', err = '';
  const t = setTimeout(() => { c.kill(); res({ code: 'timeout', out, err }); }, timeoutMs);
  c.stdout.on('data', d => { out += d; }); c.stderr.on('data', d => { err += d; });
  c.on('error', e => { clearTimeout(t); res({ code: 'error', out, err: e.message }); });
  c.on('exit', code => { clearTimeout(t); res({ code, out, err }); });
});

async function until(fn, ms = 30000, step = 200) {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) return null;
    await sleep(step);
  }
}

async function openLauncher(exe, userData, env = {}, args = []) {
  const app = await _electron.launch({ executablePath: exe, args: ['--user-data-dir=' + userData, ...args], env: envFor(Object.assign({ RB_L_SYS_ROOT: path.join(T, 'sys') }, env)), timeout: 60000 });
  const p = await app.firstWindow();
  p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await until(() => p.evaluate(() => !!window.__rbReady).catch(() => false), 30000);
  return { app, p };
}
const S_ = (p, f, a) => p.evaluate(f, a);
const shot = (p, name) => p.screenshot({ path: path.join(SHOTS, name + '.png') }).catch(() => {});
const appGone = app => { try { return app.process().exitCode !== null; } catch (_) { return true; } };
// A game started by the launcher inherits the test's output pipe, so the test driver's close() can wait for as long as the game runs even though the launcher is gone: don't wait on it for ever.
const closeApp = async app => { await Promise.race([app.close().catch(() => {}), until(() => appGone(app), 20000, 250)]); await sleep(600); };
const processAlive = pid => { try { return execFileSync('tasklist', ['/FI', 'PID eq ' + pid, '/FO', 'CSV', '/NH'], { encoding: 'utf8' }).includes('"'); } catch (_) { return false; } };
const killTree = pid => { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const dirHash = async d => { const m = {}; for (const f of await walkFiles(d)) m[f.path] = f.size + ':' + (f.size < 8e6 ? await sha256File(f.full) : ''); return JSON.stringify(m); };

// A small real change to the real game: the asar is unpacked, one line added to index.html, packed again.
async function patchedGame(fromDir, toDir, marker) {
  const asar = await loadAsar();
  await fsp.rm(toDir, { recursive: true, force: true });
  await fsp.cp(fromDir, toDir, { recursive: true });
  const tmp = toDir + '-x';
  await fsp.rm(tmp, { recursive: true, force: true });
  asar.extractAll(path.join(toDir, 'resources', 'app.asar'), tmp);
  const f = path.join(tmp, 'index.html');
  const s = await fsp.readFile(f, 'utf8');
  await fsp.writeFile(f, s.replace('</title>', '</title><!-- ' + marker + ' -->'));
  await asar.createPackage(tmp, path.join(toDir, 'resources', 'app.asar'));
  await fsp.rm(tmp, { recursive: true, force: true });
}

async function main() {
  const t0 = Date.now();
  const W = await makeWorld({ base: path.join(T, 'world') });
  const realSaves = path.join(process.env.APPDATA, 'Rootbound', 'Local Storage');
  const realSaveBefore = fs.existsSync(realSaves) ? await dirHash(realSaves) : null;
  const realGameDataFiles = fs.existsSync(path.dirname(realSaves)) ? fs.readdirSync(path.dirname(realSaves)).length : 0;
  const realPrograms = path.join(process.env.LOCALAPPDATA, 'Programs', 'Rootbound');
  const programsBefore = fs.existsSync(realPrograms);

  // ---- the publishing tool, for real: build, tests, package, harden, start, hash, upload, sign, go live
  console.log('\n--- publishing the real game (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const cfg = JSON.parse(fs.readFileSync(W.pubCfg, 'utf8')); cfg.validation = { tests: process.env.RB_E2E_NO_GAME_TESTS ? [] : ['tests/boot.js'] }; fs.writeFileSync(W.pubCfg, JSON.stringify(cfg));
  const pub1 = await W.publish(['--version', '6.13.0', '--title', 'Rootbound 6.13', '--notes', 'Two-player dungeons, the Soft Glass look, and now a launcher that keeps the game up to date.']);
  ok('publish-update builds, tests, packages, starts and publishes the real game', pub1.code === 0 && /Rootbound 6\.13\.0 is live/.test(pub1.out), pub1.code === 0 ? pub1.out.split('\n').filter(l => /files unchanged|parts|reached|Checked/.test(l)).join(' | ') : pub1.err.slice(0, 900));
  if (pub1.code !== 0) throw new Error('cannot continue without a published game');
  ok('the news feed went up with it', fs.existsSync(path.join(W.HOST, 'news.json')));
  ok('the version file was updated', JSON.parse(fs.readFileSync(path.join(W.T, 'version.json'))).version === '6.13.0');
  const gameV1 = path.join(W.T, 'work', 'game-6.13.0', 'pack', 'Rootbound-win32-x64');
  ok('the published game is hardened', (() => { const b = fs.readFileSync(path.join(gameV1, 'Rootbound.exe')); return b.length > 1e8; })());
  const asarLib = await loadAsar();
  const pkgJson = JSON.parse(asarLib.extractFile(path.join(gameV1, 'resources/app.asar'), 'package.json').toString());
  // Electron names the data folder after this; Windows folder names ignore case, so this is %APPDATA%\Rootbound, the same as every earlier build
  ok('the game keeps its name, so saves stay in %APPDATA%\Rootbound', (pkgJson.productName || pkgJson.name).toLowerCase() === 'rootbound', pkgJson.productName || pkgJson.name);

  // ---- launcher builds
  console.log('\n--- building the launcher (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const open = await packageLauncher({ outDir: path.join(T, 'l-open'), config: W.launcherConfig, harden: false, log: () => {} });
  const locked = await packageLauncher({ outDir: path.join(T, 'l-locked'), config: W.launcherConfig, harden: true, log: () => {} });
  ok('the launcher builds', fs.existsSync(open.exe) && fs.existsSync(locked.exe));
  const unusedLocales = fs.readdirSync(path.join(path.dirname(locked.exe), 'locales')).length;
  ok('only the languages it offers are shipped', unusedLocales <= 5, { locales: unusedLocales });
  const setup = path.join(T, 'RootboundSetup.exe');
  const st = await buildSetupExe({ launcherDir: path.dirname(locked.exe), out: setup, version: locked.version });
  ok('the installer builds as one exe', st.size > 5e7, { size: Math.round(st.size / 1048576) + ' MB' });
  // no key material in anything distributed
  { const K = fs.readFileSync(path.join(W.T, 'keys', 'signing-key.pem'), 'utf8').split('\n')[1];
    const bad = []; const asarBuf = fs.readFileSync(path.join(path.dirname(locked.exe), 'resources', 'app.asar'));
    if (asarBuf.includes(K)) bad.push('private key'); if (asarBuf.includes('PRIVATE KEY')) bad.push('a private key header');
    ok('the distributed launcher holds no private key', bad.length === 0, bad); }

  // ---- the real installer, locked exe, no window, like a real first install on a clean account
  console.log('\n--- running the real installer (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const setupDirs = () => fs.readdirSync(os.tmpdir()).filter(n => n.startsWith('RootboundSetup-'));
  const setupBefore = setupDirs();
  const inst1 = path.join(T, 'installed one', 'Rootbound'), ud1 = path.join(T, 'ud1');
  const r1 = await exec(setup, ['/silent', '--dir=' + inst1, '--user-data-dir=' + ud1], { env: envFor({ RB_L_SYS_ROOT: path.join(T, 'sys1'), RB_L_GAME_DATA: path.join(T, 'gd1') }) });
  ok('Setup.exe installs the launcher and the game (locked exe, real download, real verification, real test start)', r1.code === 0 && /GAME INSTALLED 6\.13\.0/.test(r1.out), { code: r1.code, tail: r1.out.slice(-300), err: r1.err.slice(-200) });
  const ins1exe = path.join(inst1, 'launcher', 'RootboundLauncher.exe');
  ok('the launcher is in place', fs.existsSync(ins1exe) && fs.existsSync(path.join(inst1, 'launcher', '.rootbound-launcher')));
  ok('the game is in place, in its own folder', fs.existsSync(path.join(inst1, 'game', 'install.json')));
  { const links = path.join(T, 'sys1');
    ok('Desktop and Start menu shortcuts exist', fs.existsSync(path.join(links, 'Desktop', 'Rootbound.lnk')) && fs.existsSync(path.join(links, 'StartMenu', 'Rootbound.lnk')));
    const q = await exec('reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\RootboundLauncherTest']);
    ok('Add or Remove Programs knows about it', q.code === 0 && /UninstallString/.test(q.out) && q.out.includes('--uninstall'), q.out.slice(0, 200)); }
  ok('the installer cleaned up its temporary folder', (await until(() => setupDirs().every(n => setupBefore.includes(n)), 15000)) === true);
  const smoke1 = await exec(ins1exe, ['--smoke', '--user-data-dir=' + ud1], { env: envFor({ RB_L_GAME_DATA: path.join(T, 'gd1') }), timeoutMs: 60000 });
  ok('the installed, locked launcher starts and sees the game', /LAUNCHER-OK/.test(smoke1.out) && /game=6\.13\.0/.test(smoke1.out) && /action=play/.test(smoke1.out), smoke1.out.trim());

  // ---- the installer's first window, drawn off-screen
  { const pic = path.join(SHOTS, 'setup-splash.png');
    const c = spawn(setup, ['--no-such-flag'], { env: envFor({ RB_SETUP_SCREENSHOT: pic, RB_L_SYS_ROOT: path.join(T, 'sysx'), RB_L_GAME_DATA: path.join(T, 'gdx') }), stdio: 'ignore' });
    await until(() => fs.existsSync(pic), 15000);
    await sleep(1500);
    ok('the branded first window draws', fs.existsSync(pic) && fs.statSync(pic).size > 20000);
    killTree(c.pid);
    await sleep(1500);
    // killed on purpose, so it couldn't tidy up after itself
    for (const n of setupDirs()) if (!setupBefore.includes(n)) await fsp.rm(path.join(os.tmpdir(), n), { recursive: true, force: true, maxRetries: 3 }).catch(() => {}); }

  // ---- the installer window, driven by hand (unlocked build, same code)
  console.log('\n--- installer window (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const inst2 = path.join(T, 'installed two', 'Rootbound'), ud2 = path.join(T, 'ud2'), gd2 = path.join(T, 'gd2');
  await fsp.mkdir(gd2, { recursive: true });
  { const e = { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: gd2 };
    const { app, p } = await openLauncher(open.exe, ud2, e, ['--installer']);
    await until(() => p.evaluate(() => !!document.querySelector('#installBtn')), 20000);
    await sleep(500); await shot(p, 'setup-welcome');
    ok('installer: shows the location, the free space and the size', await S_(p, () => /free/.test(document.body.innerText) && /Rootbound 6\.13\.0/.test(document.body.innerText)));
    // a folder the installer must refuse: inside the saves
    const refuse = await S_(p, d => RB.call('setup.free', { dir: d + '\\x' }), gd2);
    ok('installer: refuses to install into the saves folder', !!refuse.why, refuse.why);
    // the choice of location really is used
    await S_(p, d => { const el = document.querySelector('#dirText'); return RB.call('setup.free', { dir: d }).then(() => el.textContent); }, inst2);
    const setDir = await S_(p, async d => { const b = document.querySelector('[data-setup=pick]'); RB.call = (orig => (n, a) => n === 'setup.pickDir' ? Promise.resolve(d) : orig(n, a))(RB.call); b.click(); await new Promise(r => setTimeout(r, 200)); return document.querySelector('#dirText').textContent; }, inst2);
    ok('installer: Change sets the location', setDir === inst2, setDir);
    await p.click('[data-chk=desktop]');
    ok('installer: shortcut choices toggle', await S_(p, () => document.querySelector('[data-chk=desktop]').getAttribute('aria-checked') === 'false'));
    await p.click('[data-chk=desktop]');
    W.S.ctl.throttleBps = 8 * 1024 * 1024;
    await p.click('#installBtn');
    const saw = await until(() => S_(p, () => { const b = document.querySelector('[data-b=sub]'); return RB.state.task && RB.state.task.phase === 'downloading' && b && b.textContent && /of/.test(b.textContent) ? b.textContent : null; }), 40000);
    ok('installer: shows a real download with sizes and speed', !!saw, saw);
    await shot(p, 'setup-downloading');
    W.S.ctl.throttleBps = 0;
    const done = await until(() => S_(p, () => !!document.querySelector('#playNow') || !!document.querySelector('#retryBtn')), 240000, 400);
    await shot(p, 'setup-done');
    ok('installer: reaches the finished page with Play', done && await S_(p, () => !!document.querySelector('#playNow')), await S_(p, () => document.body.innerText.slice(0, 200)));
    ok('installer: no page errors', p.errs.length === 0, p.errs);
    ok('installer: launcher and game are where it was told', fs.existsSync(path.join(inst2, 'launcher', 'RootboundLauncher.exe')) && fs.existsSync(path.join(inst2, 'game', 'install.json')));
    // Play now hands over to the installed launcher, which starts the game. Test builds point the game at a throwaway data folder.
    await p.click('#playNow');
    const sessFile = path.join(ud2, 'game-session.json');
    const sess = await until(() => { try { const j = JSON.parse(fs.readFileSync(sessFile, 'utf8')); return j.pid ? j : null; } catch (_) { return null; } }, 40000, 500);
    ok('installer: Play now opens the installed launcher, and it starts the game', !!sess, sess);
    await until(() => appGone(app), 8000);
    const killInstalled = async () => { await exec('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq '" + path.join(inst2, 'launcher', 'RootboundLauncher.exe').replace(/'/g, "''") + "' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"]); };
    if (sess) killTree(sess.pid);
    await killInstalled();
    await sleep(1500);
    await fsp.rm(sessFile, { force: true });
    await closeApp(app);
    // run it again: the installer offers Repair
    const again = await openLauncher(open.exe, ud2, e, ['--installer']);
    await until(() => again.p.evaluate(() => !!document.querySelector('#repairBtn')), 20000);
    ok('installer: run again, it offers Repair', await S_(again.p, () => !!document.querySelector('#repairBtn')));
    await closeApp(again.app);
  }

  // ---- a real game start, through the launcher, on a temporary copy of the real save
  console.log('\n--- playing on a copy of the real save (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const installedOpen = path.join(inst2, 'launcher', 'RootboundLauncher.exe');
  const save = path.join(T, 'gd2');
  const hadSave = fs.existsSync(realSaves);
  if (hadSave) await fsp.cp(realSaves, path.join(save, 'Local Storage'), { recursive: true });
  let L = await openLauncher(installedOpen, ud2, { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: save }, []);
  ok('the launcher opens with no page errors', L.p.errs.length === 0, L.p.errs);
  await until(() => S_(L.p, () => RB.state.status && RB.state.status.action === 'play'), 15000);
  await sleep(1200);
  await shot(L.p, 'home-installed');
  ok('Home says Play and shows the version', await S_(L.p, () => document.querySelector('#primaryBtn').textContent.includes('Play') && /6\.13\.0/.test(document.querySelector('#heroChips').textContent)));
  // every page opens, nothing throws
  for (const n of ['library', 'news', 'events', 'updates', 'settings', 'community', 'profile', 'home']) { await L.p.click('[data-nav=' + n + ']'); await sleep(300); await shot(L.p, 'page-' + n); ok('page opens: ' + n, await S_(L.p, n => !!document.querySelector('#view-' + n) && RB.current === n, n)); }
  ok('News page shows the published items', await (async () => { await L.p.click('[data-nav=news]'); await sleep(200); return S_(L.p, () => /Two-player dungeons/.test(document.body.innerText)); })());
  await L.p.click('[data-news]'); await sleep(250);
  ok('A news item opens and reads', await S_(L.p, () => !!document.querySelector('.dialog') && document.querySelector('.dialog').innerText.length > 40));
  await shot(L.p, 'news-open');
  await L.p.keyboard.press('Escape');
  await L.p.click('[data-nav=events]'); await sleep(300);
  const c0 = await S_(L.p, () => document.querySelector('[data-count]') && document.querySelector('[data-count]').textContent);
  await sleep(1500);
  const c1 = await S_(L.p, () => document.querySelector('[data-count]') && document.querySelector('[data-count]').textContent);
  ok('Event countdowns run', c0 && c1 && c0 !== c1, [c0, c1]);
  // profile before playing: says so
  await L.p.click('[data-nav=profile]'); await sleep(200);
  ok('Profile invents nothing before the game has run', await S_(L.p, () => /No profile yet/.test(document.body.innerText)));

  // Play, for real
  await L.p.evaluate(() => RB.show('home'));
  await sleep(300);
  await L.p.click('#primaryBtn');
  const gs = await until(() => S_(L.p, () => RB.state.game.running ? RB.state.game : null), 15000);
  ok('Play starts the game', !!gs, gs);
  await shot(L.p, 'home-playing');
  const pid = gs && gs.pid;
  ok('the button says Playing', await S_(L.p, () => /Playing/.test(document.querySelector('#primaryBtn').textContent)));
  const prof = path.join(save, 'rootbound-profile.json');
  const firstProf = await until(() => { try { const j = JSON.parse(fs.readFileSync(prof, 'utf8')); return j.game ? j : null; } catch (_) { return null; } }, 60000, 1000);
  ok('the game writes its real profile', !!firstProf, firstProf && { level: firstProf.game.level, made: firstProf.game.made, ach: firstProf.game.achievements && firstProf.game.achievements.total, dg: firstProf.game.dungeons && firstProf.game.dungeons.total });
  // the film plays first, then the game enters the world
  const entered = await until(() => { try { const j = JSON.parse(fs.readFileSync(prof, 'utf8')); return j.game && j.game.entered && !j.game.cover && j.playSeconds > 0 ? j : null; } catch (_) { return null; } }, 150000, 2000);
  ok('after the film the game enters a world and counts playtime', !!entered, entered && { world: entered.game.world, secs: entered.playSeconds, version: entered.version });
  if (entered) {
    ok('the save copy loaded: the same character as on this PC', entered.game.level >= 1, { level: entered.game.level, name: entered.game.name ? '(has a name)' : '(none)' });
    ok('the game reports the version the launcher installed', entered.version === '6.13.0', entered.version);
    /* the picture is encoded off the main thread, so it arrives with a report or two after the first */const withAv = await until(() => { try { const j = JSON.parse(fs.readFileSync(prof, 'utf8')); return j.game && typeof j.game.avatar === 'string' && j.game.avatar.startsWith('data:image/png') ? j : null; } catch (_) { return null; } }, 30000, 1000);
    ok('the game drew an avatar for the profile', !!withAv);
    ok('recent worlds are recorded', entered.recentWorlds.length > 0, entered.recentWorlds.slice(0, 2));
  }
  await sleep(1000);
  await S_(L.p, () => RB.call('profile.get').then(x => { RB.state.profile = x; RB.emit('profile'); RB.show('profile'); }));
  await sleep(600);
  await shot(L.p, 'profile-real');
  ok('Profile shows the real character', await S_(L.p, () => RB.state.profile.available && /Level/.test(document.body.innerText)));
  await L.p.evaluate(() => RB.show('home')); await sleep(500);
  await shot(L.p, 'home-continue');
  ok('Continue Playing lists real worlds', await S_(L.p, () => !!document.querySelector('[data-quick-world],[data-quick-dungeon]')));
  // closing the launcher leaves the game running
  await closeApp(L.app);
  await sleep(1500);
  ok('the launcher really exits while the game is running', appGone(L.app));
  ok('the game keeps running after the launcher closes', pid && processAlive(pid));
  // reopening notices it, and won't start a second copy
  L = await openLauncher(installedOpen, ud2, { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: save }, []);
  ok('a reopened launcher notices the game is still running', await until(() => S_(L.p, () => RB.state.game.running), 8000));
  ok('it refuses to start a second copy', (await S_(L.p, () => RB.call('game.play', {}))).code === 'ALREADY_RUNNING');
  killTree(pid);
  await sleep(1000);
  ok('the real save was not touched by any of this', !hadSave || realSaveBefore === await dirHash(realSaves));
  await closeApp(L.app);

  // ---- launch options really reach the game (unlocked game build, driven)
  { console.log('\n--- launch options (' + Math.round((Date.now() - t0) / 1000) + 's)');
    const G = require(path.join(ROOT, 'tools/publish/lib/game-package'));
    const gdir = path.join(T, 'game-open');
    const built = await G.packageGame({ version: '6.13.0', outDir: gdir, log: () => {} });
    const app = await _electron.launch({ executablePath: built.exe, args: ['--user-data-dir=' + path.join(T, 'gd-open'), '--rb-res=1100x640', '--rb-display=windowed', '--rb-quality=low', '--rb-world=quickworld'], env: envFor({}), timeout: 60000 });
    const gp = await app.firstWindow();
    await until(() => gp.evaluate(() => window.RBDIAG && RBDIAG.ready).catch(() => false), 60000, 500);
    const size = await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; return { b: w.getBounds(), fs: w.isFullScreen() }; });
    ok('--rb-res sets the window size', size.b.width === 1100 && size.b.height === 640, size);
    ok('--rb-display=windowed stays out of fullscreen', size.fs === false);
    const q = await until(() => gp.evaluate(() => typeof QM !== 'undefined' && QM.cur.id === 'low').catch(() => false), 10000);
    ok('--rb-quality reaches the game', !!q);
    ok('--rb-world makes a quick launch land in that world', await gp.evaluate(() => recents()[0] === 'quickworld'));
    const ua = await gp.evaluate(() => navigator.userAgent);
    ok('a launched game still has the user agent the live server lets in', /\bElectron\/\d/.test(ua) && /\bWindows NT\b/.test(ua), ua);
    await app.close().catch(() => {});
  }

  // ---- a delta update of the real game, picked up by a real launcher
  console.log('\n--- delta update (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const gameV2 = path.join(T, 'game-v2');
  await patchedGame(gameV1, gameV2, 'a small change for 6.13.1');
  const pub2 = await W.publish(['--from-folder', gameV2, '--version', '6.13.1', '--title', 'Rootbound 6.13.1', '--notes', 'A small fix.']);
  ok('a second publish goes live', pub2.code === 0 && /is live/.test(pub2.out), pub2.code ? pub2.err : pub2.out.split('\n').filter(l => /unchanged|new parts|downloads about/.test(l)).join(' | '));
  W.S.ctl.throttleBps = 0;
  L = await openLauncher(installedOpen, ud2, { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: save, RB_L_NO_BOOT_TEST: '' }, []);
  const b0 = W.S.ctl.stats.bytes;
  const liveTask = await until(() => S_(L.p, () => RB.state.task ? RB.state.task.kind : null), 20000);
  ok('the launcher finds the update on opening and starts it by itself', liveTask === 'update', liveTask);
  const v2done = await until(() => S_(L.p, () => RB.state.status && RB.state.status.version === '6.13.1' && !RB.state.task), 180000, 500);
  const sent = W.S.ctl.stats.bytes - b0;
  const total = (await walkFiles(gameV2)).reduce((a, f) => a + f.size, 0);
  ok('the update installs', !!v2done, await S_(L.p, () => JSON.stringify(RB.state.queue.history[0])));
  ok('a small change means a small download', sent < 20 * 1024 * 1024 && sent < total / 8, { sent: Math.round(sent / 1048576 * 10) / 10 + ' MB', game: Math.round(total / 1048576) + ' MB' });
  const hist = await S_(L.p, () => RB.state.queue.history[0]);
  ok('it kept nearly every file', hist.delta && hist.delta.changedFiles <= 2 && hist.delta.keptFiles > 40, hist.delta);
  await shot(L.p, 'home-updated');
  ok('Home says Play on the new version', await S_(L.p, () => /Play/.test(document.querySelector('#primaryBtn').textContent) && /6\.13\.1/.test(document.querySelector('#heroChips').textContent)));
  const ptr = JSON.parse(fs.readFileSync(path.join(inst2, 'game', 'install.json')));
  ok('the earlier version is kept for going back', ptr.previous && ptr.previous.version === '6.13.0');
  { const lv = path.join(inst2, 'game', 'versions', ptr.current.id), pv = path.join(inst2, 'game', 'versions', ptr.previous.id);
    ok('unchanged files are shared between versions, not copied', fs.statSync(path.join(lv, 'Rootbound.exe'), { bigint: true }).ino === fs.statSync(path.join(pv, 'Rootbound.exe'), { bigint: true }).ino);
    const list = await walkFiles(lv); ok('every file checks out after the update', (await S_(L.p, () => RB.call('game.verify'))).ok === true, list.length + ' files'); }

  // ---- Download Center, pause, resume, cancel, by real clicks on a real download
  console.log('\n--- download center (' + Math.round((Date.now() - t0) / 1000) + 's)');
  const gameV3 = path.join(T, 'game-v3');
  await fsp.cp(gameV2, gameV3, { recursive: true });
  await fsp.writeFile(path.join(gameV3, 'resources', 'big-new-file.bin'), crypto.randomBytes(40 * 1024 * 1024));
  const pub3 = await W.publish(['--from-folder', gameV3, '--version', '6.13.2', '--title', 'Rootbound 6.13.2', '--notes', 'Testing the Download Center.']);
  ok('third publish', pub3.code === 0, pub3.err);
  W.S.ctl.throttleBps = 3 * 1024 * 1024;
  await S_(L.p, () => RB.call('updates.check'));
  await until(() => S_(L.p, () => RB.state.task && RB.state.task.phase === 'downloading' && RB.state.task.download && RB.state.task.download.downloaded > 1048576), 30000);
  await L.p.click('[data-nav=home]'); await sleep(300);
  await shot(L.p, 'home-downloading');
  ok('Home shows progress with size, percent and speed', await S_(L.p, () => { const s = document.querySelector('#dlBox [data-b=sub]').textContent; const r = document.querySelector('#dlBox [data-b=right]').textContent; return /of/.test(s) && /\/s/.test(s) && /%/.test(r); }), await S_(L.p, () => document.querySelector('#dlBox').innerText.replace(/\n/g, ' | ')));
  await L.p.click('[data-nav=updates]'); await sleep(200);
  await L.p.evaluate(() => { document.querySelector('[data-tab2=downloads]').click(); });
  await sleep(500);
  await shot(L.p, 'download-center');
  ok('Download Center shows the current download in full', await S_(L.p, () => { const v = n => document.querySelector('[data-s=' + n + ']').textContent; return /of/.test(v('dl')) && /\/s/.test(v('speed')) && v('eta') !== '–' && /%/.test(v('pct')) && !!document.querySelector('.step.now'); }), await S_(L.p, () => document.querySelector('#dcCur').innerText.replace(/\n/g, ' ')));
  // never freezes: the main process keeps answering at once during the download
  { const lag = await S_(L.p, async () => { let worst = 0; for (let i = 0; i < 25; i++) { const a = performance.now(); await RB.call('system.memory'); worst = Math.max(worst, performance.now() - a); await new Promise(r => setTimeout(r, 40)); } return worst; });
    ok('the launcher stays responsive during a download', lag < 400, { worstMs: Math.round(lag) }); }
  await L.p.click('#dcPause');
  ok('Pause works', await until(() => S_(L.p, () => RB.state.task && RB.state.task.paused), 4000));
  await sleep(800); const b1 = W.S.ctl.stats.bytes; await sleep(1200);
  ok('paused means nothing is coming in', W.S.ctl.stats.bytes - b1 < 300000, W.S.ctl.stats.bytes - b1);
  await shot(L.p, 'download-paused');
  await L.p.click('#dcPause');
  ok('Resume works', await until(() => S_(L.p, () => RB.state.task && !RB.state.task.paused && RB.state.task.download.speed > 0), 8000));
  await sleep(1200);
  await L.p.click('#dcCancel');
  ok('Cancel works', await until(() => S_(L.p, () => !RB.state.task), 8000));
  W.S.ctl.throttleBps = 0;
  ok('history records it', await S_(L.p, () => RB.state.queue.history[0].result === 'canceled'));
  ok('cancel left the game on the installed version', await S_(L.p, () => RB.state.status.version === '6.13.1'));
  ok('the update is still offered', await S_(L.p, () => RB.state.status.action === 'update'));

  // ---- failure, then Retry, through the page
  console.log('\n--- failures (' + Math.round((Date.now() - t0) / 1000) + 's)');
  await S_(L.p, () => RB.call('settings.set', { section: 'launcher', key: 'autoDownload', value: false }).then(r => { RB.state.settings = r.settings; }));
  // this build retries for about 30 s before giving up, so break it fast with a part that always arrives damaged
  W.S.ctl.fault = u => u.includes('/chunks/') ? { status: 500 } : null;
  await S_(L.p, () => { RB.act('update'); });
  const failedNotice = await until(() => S_(L.p, () => !RB.state.task && RB.state.queue.history[0].result === 'failed'), 150000, 500);
  ok('a server failing every download ends in a clear message', !!failedNotice, await S_(L.p, () => RB.state.queue.history[0]));
  await sleep(300);
  ok('the game is still fine after that', await S_(L.p, () => RB.call('game.verify').then(r => r.ok)));
  await shot(L.p, 'after-failure');
  W.S.ctl.fault = null;
  await S_(L.p, () => { RB.act('update'); });
  const v3 = await until(() => S_(L.p, () => RB.state.status && RB.state.status.version === '6.13.2' && !RB.state.task), 200000, 500);
  ok('trying again succeeds', !!v3, await S_(L.p, () => RB.state.queue.history[0]));

  // ---- the integrity check protects Play; Repair fixes it
  const ptr3 = JSON.parse(fs.readFileSync(path.join(inst2, 'game', 'install.json')));
  const live3 = path.join(inst2, 'game', 'versions', ptr3.current.id);
  { const asarFile = path.join(live3, 'resources', 'app.asar');
    const keep = fs.readFileSync(asarFile);
    // replace rather than edit: the old version shares this file through a hard link and must stay good
    fs.rmSync(asarFile); const bad = Buffer.from(keep); bad[bad.length >> 1] ^= 0xff; fs.writeFileSync(asarFile, bad);
    await L.p.evaluate(() => RB.show('home')); await sleep(300);
    await L.p.click('#primaryBtn');
    const dlg = await until(() => S_(L.p, () => document.querySelector('.dialog') ? document.querySelector('.dialog').innerText : null), 10000);
    ok('a game file changed on disk stops Play and offers Repair', !!dlg && /repair/i.test(dlg), dlg);
    await shot(L.p, 'needs-repair');
    ok('the changed game was not started', await S_(L.p, () => !RB.state.game.running));
    const b2 = W.S.ctl.stats.bytes;
    await L.p.click('.dialog .btn.p');
    const fixed = await until(() => S_(L.p, () => !RB.state.task && RB.state.queue.history[0].kind === 'repair' && RB.state.queue.history[0].result === 'done'), 120000, 500);
    ok('Repair puts it right', !!fixed, await S_(L.p, () => RB.state.queue.history[0]));
    ok('Repair downloaded only what was damaged', W.S.ctl.stats.bytes - b2 < 12 * 1024 * 1024, Math.round((W.S.ctl.stats.bytes - b2) / 1048576) + ' MB');
    ok('all files check out after Repair', (await S_(L.p, () => RB.call('game.verify'))).ok === true);
  }

  // ---- forged update list while the launcher is open: refused, game untouched, message shown
  { const real = fs.readFileSync(path.join(W.HOST, 'latest.json'));
    const j = JSON.parse(real); const pl = JSON.parse(j.payload); pl.game.version = '9.9.9'; j.payload = JSON.stringify(pl);
    fs.writeFileSync(path.join(W.HOST, 'latest.json'), JSON.stringify(j));
    await L.p.click('[data-nav=updates]'); await sleep(200);
    await S_(L.p, () => { RB.pages.updates.setTab('updates'); RB.show('updates'); });
    await S_(L.p, () => RB.call('updates.check').then(s => { RB.state.status = s; RB.emit('status'); }));
    await sleep(400);
    await shot(L.p, 'forged-list');
    ok('a forged update list is refused and says so', await S_(L.p, () => RB.state.status.checkError && RB.state.status.checkError.code === 'BAD_SIGNATURE' && /security check/.test(document.body.innerText)));
    ok('and the game is still ready', await S_(L.p, () => RB.state.status.action === 'play'));
    fs.writeFileSync(path.join(W.HOST, 'latest.json'), real);
    await S_(L.p, () => RB.call('updates.check').then(s => { RB.state.status = s; RB.emit('status'); }));
  }

  // ---- going back
  await L.p.click('[data-nav=library]'); await sleep(300);
  await shot(L.p, 'library-installed');
  ok('Library shows version, status, size, last played, location', await S_(L.p, () => { const s = document.body.innerText; return /6\.13\.2/.test(s) && /Up to date/.test(s) && /MB|GB/.test(s) && !/Not played yet/.test(s); }));
  await L.p.click('[data-do=restore]');
  ok('Go back restores the earlier version', await until(() => S_(L.p, () => RB.state.status.version === '6.13.1'), 60000));
  await S_(L.p, () => RB.call('updates.unblock'));
  await S_(L.p, () => { RB.act('update'); });
  ok('and forward again without downloading the world', await until(() => S_(L.p, () => RB.state.status.version === '6.13.2' && !RB.state.task), 90000, 500));

  // ---- settings: every one persists and does what it says
  console.log('\n--- settings (' + Math.round((Date.now() - t0) / 1000) + 's)');
  await L.p.click('[data-nav=settings]'); await sleep(200);
  // real mouse clicks: a dropdown stays a dropdown, a click on nothing does nothing
  { await S_(L.p, () => { window.__sel = document.querySelector('select[data-set="game.displayMode"]'); });
    await L.p.click('select[data-set="game.displayMode"]'); await sleep(150);
    await L.p.keyboard.press('Escape');
    await L.p.click('.setrow .lbl'); await sleep(150);
    ok('clicking in Settings does not redraw the page under the mouse', await S_(L.p, () => window.__sel.isConnected)); }
  await L.p.selectOption('select[data-set="game.displayMode"]', 'windowed'); await sleep(100);
  await L.p.selectOption('select[data-set="game.quality"]', 'low'); await sleep(100);
  await L.p.fill('input[data-set="game.launchArgs"]', '--safe-mode'); await L.p.keyboard.press('Tab'); await sleep(200);
  await L.p.click('[data-sec=launcher]'); await sleep(100);
  await L.p.selectOption('select[data-set="launcher.language"]', 'ja'); await sleep(400);
  ok('Language changes the whole interface at once', !!(await until(() => S_(L.p, () => document.querySelector('.nav[data-nav=home]').textContent.includes('ホーム') && RB.lang === 'ja'), 3000)));
  await shot(L.p, 'settings-japanese');
  await L.p.click('[data-sec=launcher]'); await sleep(100);
  await L.p.selectOption('select[data-set="launcher.language"]', 'en'); await sleep(300);
  await L.p.click('[data-sec=launcher]'); await sleep(100);
  await L.p.click('[data-theme=violet]'); await sleep(200);
  ok('Theme applies at once', await S_(L.p, () => document.documentElement.dataset.theme === 'violet'));
  await shot(L.p, 'settings-violet');
  await L.p.selectOption('select[data-set="launcher.bandwidthKBps"]', '2000'); await sleep(100);
  await L.p.click('[data-set="launcher.closeAfterStart"]'); await sleep(100);
  await L.p.click('[data-set="launcher.minimizeToTray"]'); await sleep(100);
  await L.p.click('[data-set="launcher.intro"]'); await sleep(100);
  await L.p.click('[data-sec=performance]'); await sleep(100);
  await L.p.click('[data-set="performance.smoothAnimations"]'); await sleep(200);
  ok('Smooth animations off really stops them', await S_(L.p, () => document.documentElement.dataset.motion === 'off'));
  await L.p.click('[data-set="performance.smoothAnimations"]'); await sleep(100);
  await L.p.click('[data-set="performance.lowMemory"]'); await sleep(250);
  ok('Low-memory mode asks to restart', await S_(L.p, () => !!document.querySelector('.dialog')));
  await L.p.keyboard.press('Escape'); await sleep(100);
  await L.p.click('[data-set="performance.lowMemory"]'); await sleep(250); await L.p.keyboard.press('Escape');
  await L.p.click('[data-sec=about]'); await sleep(200);
  await shot(L.p, 'settings-about');
  const unknown = await S_(L.p, () => RB.call('settings.set', { section: 'launcher', key: 'nope', value: 1 }));
  const badVal = await S_(L.p, () => RB.call('settings.set', { section: 'game', key: 'resolution', value: '../../x' }));
  ok('bad settings are refused', !unknown.ok && !badVal.ok);
  ok('the page cannot open anything but https addresses', (await S_(L.p, () => RB.call('shell.open', { url: 'file:///C:/Windows/notepad.exe' }))) === false);
  ok('the page has no way to reach Node', await S_(L.p, () => typeof require === 'undefined' && typeof process === 'undefined'));
  ok('settings: no page errors', L.p.errs.length === 0, L.p.errs);
  ok('the page itself cannot reach the network', await S_(L.p, () => fetch('https://localhost:1/').then(() => false, () => true)));
  await closeApp(L.app);
  const saved = JSON.parse(fs.readFileSync(path.join(ud2, 'settings.json'), 'utf8'));
  ok('settings are in the file', saved.game.displayMode === 'windowed' && saved.game.quality === 'low' && saved.game.launchArgs === '--safe-mode' && saved.launcher.theme === 'violet' && saved.launcher.bandwidthKBps === 2000 && saved.launcher.closeAfterStart === true && saved.launcher.minimizeToTray === true && saved.launcher.intro === false && saved.performance.smoothAnimations === true, saved);
  L = await openLauncher(installedOpen, ud2, { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: save }, []);
  ok('settings survive a restart', await S_(L.p, () => RB.state.settings.game.displayMode === 'windowed' && document.documentElement.dataset.theme === 'violet'));
  // minimize to tray: closing keeps it alive, the tray brings it back; closeAfterStart: starting the game ends the launcher and the game lives on, with the settings applied
  { const before = await L.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length);
    await L.p.click('[data-win=close]'); await sleep(800);
    const vis = await L.app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().map(w => w.isVisible()));
    ok('with minimize to tray on, Close hides to the tray', before === 1 && vis.length === 1 && vis[0] === false, vis);
    await L.app.evaluate(({ BrowserWindow }) => { BrowserWindow.getAllWindows()[0].showInactive(); });
    await sleep(300);
    await L.p.evaluate(() => RB.show('home')); await sleep(300);
    const r = await S_(L.p, () => RB.call('game.play', {})).catch(() => null);
    ok('Play with close after start', r && r.ok, r);
    await until(() => appGone(L.app), 8000);
    ok('the launcher closed itself after starting the game', appGone(L.app));
    const gameFile = path.join(ud2, 'game-session.json');
    const sess = JSON.parse(fs.readFileSync(gameFile, 'utf8'));
    await sleep(1500);
    ok('and the game is still running on its own', sess.pid && processAlive(sess.pid), sess);
    if (sess.pid) {
      const cmd = await exec('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_Process -Filter "ProcessId=' + sess.pid + '").CommandLine']);
      ok('the game got the settings as arguments', /--rb-display=windowed/.test(cmd.out) && /--rb-quality=low/.test(cmd.out) && /--safe-mode/.test(cmd.out), cmd.out.trim().slice(-200));
      killTree(sess.pid);
      await sleep(800);
    }
  }

  // ---- news published with no rebuild of anything
  { const src = path.join(W.T, 'news-src', 'news.json'), j = JSON.parse(fs.readFileSync(src));
    const img = path.join(W.T, 'news-src', 'images', 'pic.webp'); fs.copyFileSync(path.join(ROOT, 'launcher/app/ui/art/crystal-thumb.webp'), img);
    j.items.unshift({ id: 'maintenance-notice', type: 'maintenance', title: 'Server maintenance on Sunday', summary: 'A test notice, published with no launcher rebuild.', body: 'Body.', date: '2026-11-05', image: 'pic.webp' });
    j.events.push({ id: 'limited-test', title: 'Double gems weekend (test)', summary: 'A test event', reward: 'Test reward', start: new Date(Date.now() - 3600e3).toISOString(), end: new Date(Date.now() + 2 * 86400e3).toISOString() });
    j.events.push({ id: 'soon-test', title: 'Coming soon (test)', start: new Date(Date.now() + 86400e3).toISOString(), end: new Date(Date.now() + 2 * 86400e3).toISOString() });
    j.maintenance = { title: 'Maintenance notice (test)', text: 'Shown at the top of Home.' };
    fs.writeFileSync(src, JSON.stringify(j));
    const r = await W.publishNews();
    ok('publish-news goes live with no rebuild', r.code === 0, r.out + r.err);
    await sleep(400);
    const ud3 = ud2;
    // closeAfterStart is on from the last test; it doesn't matter here
    L = await openLauncher(installedOpen, ud3, { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: save }, []);
    await until(() => S_(L.p, () => RB.state.news.feed && RB.state.news.feed.items.some(i => i.id === 'maintenance-notice')), 15000);
    await S_(L.p, () => RB.show('home')); await sleep(500);
    await shot(L.p, 'home-maintenance');
    ok('a running launcher picks the news up', await S_(L.p, () => /Maintenance notice/.test(document.body.innerText)));
    await S_(L.p, () => RB.show('news')); await sleep(600);
    const imgOk = await S_(L.p, () => { const im = [...document.querySelectorAll('img')].find(i => i.src.startsWith('rbimg:')); return im ? im.complete && im.naturalWidth > 0 : false; });
    ok('news images load from the verified local cache', imgOk);
    await S_(L.p, () => RB.show('events')); await sleep(500);
    await shot(L.p, 'events-full');
    ok('active and upcoming events both show, with countdowns', await S_(L.p, () => /Double gems/.test(document.body.innerText) && /Coming soon/.test(document.body.innerText) && document.querySelectorAll('[data-count]').length >= 3));
    // a swapped news image on the host is refused
    const f = path.join(W.HOST, 'news', fs.readdirSync(path.join(W.HOST, 'news'))[0]);
    const cached = path.join(ud2, 'news', 'images'); for (const n of fs.readdirSync(cached)) fs.rmSync(path.join(cached, n));
    fs.writeFileSync(f, Buffer.concat([fs.readFileSync(f), Buffer.from('x')]));
    await S_(L.p, () => RB.call('news.refresh')); await sleep(300);
    ok('a news image changed on the host is refused', fs.readdirSync(cached).length === 0, fs.readdirSync(cached));
    // performance when idle: real figures from this very process
    await S_(L.p, () => RB.show('home'));
    await sleep(6000);
    const m = await S_(L.p, () => RB.call('system.memory'));
    const mem = m.metrics.reduce((a, x) => a + x.mem, 0) / 1024, cpu = m.metrics.reduce((a, x) => a + x.cpu, 0);
    console.log('INFO idle memory across processes: ' + Math.round(mem) + ' MB; ' + m.metrics.map(x => x.type + ' ' + Math.round(x.mem / 1024) + 'MB ' + x.cpu.toFixed(1) + '%').join(', '));
    ok('idle memory is reasonable for what this is', mem < 600, { MB: Math.round(mem) });
    await closeApp(L.app);
  }

  // ---- the launcher updates its own code; a bad update can't take it down (locked exe)
  console.log('\n--- launcher self-update (' + Math.round((Date.now() - t0) / 1000) + 's)');
  // versions come from the launcher's own package, so raising it never breaks this test
  const BUILT_L = require(path.join(__dirname, '..', '..', 'launcher', 'package.json')).version, NEXT_L = '9.0.0';
  { const pl = await W.publish(['--launcher-only', '--launcher-version', NEXT_L, '--notes', 'Launcher test update']);
    ok('publishing the launcher code works', pl.code === 0 && /launcher update is live/i.test(pl.out), pl.err || pl.out.slice(-200));
    const e = envFor({ RB_L_SYS_ROOT: path.join(T, 'sys1'), RB_L_GAME_DATA: path.join(T, 'gd1') });
    let r = await exec(ins1exe, ['--smoke', '--apply-launcher-update', '--user-data-dir=' + ud1], { env: e, timeoutMs: 90000 });
    ok('the locked launcher downloads its own update', r.out.includes('LAUNCHER-UPDATE ready=' + NEXT_L), r.out.trim());
    r = await exec(ins1exe, ['--smoke', '--user-data-dir=' + ud1], { env: e, timeoutMs: 60000 });
    ok('after a restart it runs the new code, checked by the built-in signature check', r.out.includes('version=' + NEXT_L + ' updated=true builtIn=' + BUILT_L), r.out.trim());
    const dir = path.join(ud1, 'launcher-update'), asarF = path.join(dir, 'app-' + NEXT_L + '.asar'), keep = fs.readFileSync(asarF);
    const bad = Buffer.from(keep); bad[bad.length >> 1] ^= 0xff; fs.writeFileSync(asarF, bad);
    r = await exec(ins1exe, ['--smoke', '--user-data-dir=' + ud1], { env: e, timeoutMs: 60000 });
    ok('a changed code package is never run: it falls back to the built-in copy', r.out.includes('version=' + BUILT_L + ' updated=false'), r.out.trim());
    fs.writeFileSync(asarF, keep);
    const cur = path.join(dir, 'current.json'), envKeep = fs.readFileSync(cur), je = JSON.parse(envKeep), pay = JSON.parse(je.payload); pay.version = '1.0.2'; je.payload = JSON.stringify(pay);
    fs.writeFileSync(cur, JSON.stringify(je));
    r = await exec(ins1exe, ['--smoke', '--user-data-dir=' + ud1], { env: e, timeoutMs: 60000 });
    ok('a forged record is never trusted either', r.out.includes('version=' + BUILT_L + ' updated=false'), r.out.trim());
    fs.writeFileSync(cur, envKeep);
    // an update that never reports a good start twice in a row is dropped
    fs.writeFileSync(path.join(dir, 'boot-state.json'), JSON.stringify({ version: NEXT_L, attempts: 2, bad: [] }));
    r = await exec(ins1exe, ['--smoke', '--user-data-dir=' + ud1], { env: e, timeoutMs: 60000 });
    ok('a code update that keeps failing to start is given up on', r.out.includes('version=' + BUILT_L + ' updated=false'), r.out.trim());
  }

  // ---- uninstall (locked exe), and what it leaves
  console.log('\n--- uninstall (' + Math.round((Date.now() - t0) / 1000) + 's)');
  { await fsp.mkdir(path.join(T, 'gd1', 'Local Storage'), { recursive: true }); await fsp.writeFile(path.join(T, 'gd1', 'Local Storage', 'keep.txt'), 'a save');
    const r = await exec(ins1exe, ['--uninstall', '--silent', '--user-data-dir=' + ud1], { env: envFor({ RB_L_SYS_ROOT: path.join(T, 'sys1'), RB_L_GAME_DATA: path.join(T, 'gd1') }), timeoutMs: 60000 });
    ok('uninstall runs', r.code === 0 && /UNINSTALL OK/.test(r.out), r.out + r.err);
    const gone = await until(() => !fs.existsSync(inst1), 25000, 500);
    ok('the install folder is gone', !!gone, fs.existsSync(inst1) ? fs.readdirSync(inst1) : []);
    ok('the launcher settings are gone', !fs.existsSync(ud1));
    ok('the shortcuts are gone', !fs.existsSync(path.join(T, 'sys1', 'Desktop', 'Rootbound.lnk')) && !fs.existsSync(path.join(T, 'sys1', 'StartMenu', 'Rootbound.lnk')));
    const q = await exec('reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\RootboundLauncherTest']);
    ok('Add or Remove Programs no longer lists it', q.code !== 0);
    ok('the saves are still there', fs.readFileSync(path.join(T, 'gd1', 'Local Storage', 'keep.txt'), 'utf8') === 'a save');
  }

  // ---- uninstall through its window, the way a player does it (unlocked build)
  { const e = { RB_L_SYS_ROOT: path.join(T, 'sys2'), RB_L_GAME_DATA: save };
    const U = await openLauncher(installedOpen, ud2, e, ['--uninstall']);
    await until(() => U.p.evaluate(() => !!document.querySelector('#uninstBtn')), 15000);
    await shot(U.p, 'uninstall');
    ok('the uninstaller says saves are kept', await S_(U.p, () => /kept/.test(document.body.innerText)));
    await U.p.click('#uninstBtn');
    await until(() => U.p.evaluate(() => !!document.querySelector('#uninstClose')).catch(() => true), 30000);
    await shot(U.p, 'uninstall-done');
    await U.p.click('#uninstClose').catch(() => {});
    await until(() => appGone(U.app), 10000);
    const gone2 = await until(() => !fs.existsSync(inst2), 30000, 500);
    ok('the window uninstaller removes everything once it closes', !!gone2, fs.existsSync(inst2) ? await walkFiles(inst2).then(l => l.slice(0, 5).map(x => x.path)) : []);
    ok('its settings are gone too', !fs.existsSync(path.join(ud2, 'settings.json')));
    ok('the saves are still there', !hadSave || fs.existsSync(path.join(save, 'Local Storage')));
  }

  // ---- nothing reached the real places
  ok('the real save folder is unchanged', !hadSave || realSaveBefore === await dirHash(realSaves));
  ok('no files were added to the real game data folder', !fs.existsSync(path.dirname(realSaves)) || fs.readdirSync(path.dirname(realSaves)).length === realGameDataFiles);
  ok('nothing was installed in the real Programs folder', fs.existsSync(realPrograms) === programsBefore);
  ok('no real shortcut was made', !fs.existsSync(path.join(os.homedir(), 'Desktop', 'Rootbound.lnk')));

  await W.close();
  console.log('\n' + passes + ' passed, ' + fails + ' failed, ' + Math.round((Date.now() - t0) / 60000) + ' min. Screenshots: ' + SHOTS);
  if (!fails) fs.rmSync(T, { recursive: true, force: true, maxRetries: 3 }); else console.log('Kept for inspection: ' + T);
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.log('FAIL crashed', e); console.log('Kept for inspection: ' + T); process.exit(1); });
