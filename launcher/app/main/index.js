// The launcher's main process: windows, tray, and the bridge between the page and the core modules. No game logic and no update logic lives here.
'use strict';
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell, nativeImage, Notification, session, protocol, net, screen } = require('electron');
const path = require('path'), fs = require('../core/fsx'), { spawn } = require('child_process'), { pathToFileURL } = require('url');

const boot = global.rootboundBoot;
const CONFIG = boot.config, TEST = !!CONFIG.testHooks;
const argv = process.argv;
const OFF = TEST && process.env.RB_TEST_OFFSCREEN === '1';
const MODE = argv.includes('--uninstall') ? 'uninstall' : argv.includes('--installer') ? 'install' : 'launcher';
const SMOKE = argv.includes('--smoke'), HIDDEN = argv.includes('--hidden'), SILENT = argv.includes('--silent');
const argVal = k => { const p = '--' + k + '='; const a = argv.find(x => x.startsWith(p)); return a ? a.slice(p.length) : ''; };

const { Settings } = require('../core/settings');
const { Http } = require('../core/http');
const { UpdateManager } = require('../core/update-manager');
const { unsafeGameDir } = require('../core/game-install');
const { News } = require('../core/news');
const { Profile } = require('../core/profile');
const { GameLauncher, buildArgs } = require('../core/game-launcher');
const { WinSystem } = require('../core/system');
const { LauncherUpdate } = require('../core/launcher-update');

// ---- before Electron is ready
const userData = app.getPath('userData');
const settings = new Settings(path.join(userData, 'settings.json'));
settings.loadSync();
if (!settings.values.performance.hardwareAcceleration) app.disableHardwareAcceleration();
if (settings.values.performance.lowMemory) { app.commandLine.appendSwitch('js-flags', '--max-old-space-size=128'); app.commandLine.appendSwitch('renderer-process-limit', '1'); app.commandLine.appendSwitch('disable-gpu-shader-disk-cache'); }
if (OFF) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
app.setAppUserModelId('com.rootbound.launcher');
protocol.registerSchemesAsPrivileged([{ scheme: 'rbimg', privileges: { standard: true, secure: true, supportFetchAPI: false } }]);

// ---- logging
const LOG = path.join(userData, 'launcher.log');
function log(m) {
  try {
    fs.mkdirSync(userData, { recursive: true });
    if (fs.existsSync(LOG) && fs.statSync(LOG).size > 1024 * 1024) fs.renameSync(LOG, LOG + '.old');
    fs.appendFileSync(LOG, new Date().toISOString() + ' ' + m + '\n');
  } catch (_) {}
  if (SMOKE || SILENT) console.log(m);
}
process.on('uncaughtException', e => { log('uncaught: ' + (e && e.stack || e)); });
process.on('unhandledRejection', e => { log('unhandled: ' + (e && e.stack || e)); });

// ---- where things are
const launcherDir = path.dirname(process.execPath);
const isInstalled = fs.existsSync(path.join(launcherDir, '.rootbound-launcher'));
const defaultRoot = () => path.join(process.env.LOCALAPPDATA || app.getPath('appData'), 'Programs', 'Rootbound');
const gameDirNow = () => settings.values.game.installDir || (isInstalled ? path.join(path.dirname(launcherDir), 'game') : path.join(defaultRoot(), 'game'));
const gameDataDir = () => (TEST && process.env.RB_L_GAME_DATA) || path.join(app.getPath('appData'), 'Rootbound');

// ---- the modules. Created once Electron is ready.
const M = { win: null, tray: null, http: null, updates: null, news: null, profile: null, game: null, system: null, launcherUpdate: null, quitting: false, uiReady: false, serverCache: null, timers: [] };

function send(type, data) { if (M.win && !M.win.isDestroyed()) M.win.webContents.send('rb:event', { type, data }); }

function notify(title, body) {
  if (!settings.values.launcher.notifications || OFF || SMOKE) return;
  if (M.win && !M.win.isDestroyed() && M.win.isVisible() && M.win.isFocused()) return;
  try { const n = new Notification({ title, body, icon: path.join(__dirname, '..', 'ui', 'art', 'app-icon.png') }); n.on('click', showWindow); n.show(); } catch (_) {}
}

async function createModules() {
  M.http = new Http({ ca: CONFIG.tlsCaPem || null, userAgent: 'RootboundLauncher/' + boot.appVersion });
  M.updates = new UpdateManager({ config: CONFIG, http: M.http, stateDir: userData, gameDir: gameDirNow(), saveDir: gameDataDir(), log, bandwidthKBps: settings.values.launcher.bandwidthKBps, smokeCheck: !(TEST && process.env.RB_L_NO_BOOT_TEST === '1') });
  M.news = new News({ dir: path.join(userData, 'news'), http: M.http, config: CONFIG, log });
  M.profile = new Profile({ gameDataDir: gameDataDir() });
  M.game = new GameLauncher({ stateDir: userData, log });
  M.system = new WinSystem({ shell, app, sysRoot: TEST ? process.env.RB_L_SYS_ROOT || null : null, keySuffix: TEST ? 'Test' : '' });
  M.launcherUpdate = new LauncherUpdate({ boot, http: M.http, log });
  await M.game.init();
  // the version a running game was started from is never tidied away
  M.updates.install.keepIds = () => (M.game.running && M.game.running.exe ? [path.basename(path.dirname(M.game.running.exe))] : []);
  await M.updates.init();
  await M.news.load();
  await M.launcherUpdate.init();

  M.updates.on('status', s => { send('status', s); M.handleStatus && M.handleStatus(s); });
  M.updates.on('task', t => send('task', t));
  M.updates.on('queue', q => send('queue', q));
  M.updates.on('task-end', t => {
    if (t.phase === 'done' && t.kind !== 'repair') notify('Rootbound ' + (t.version || ''), 'Ready to play.');
    if (t.phase === 'failed') notify('Rootbound', t.error ? t.error.message : 'The update did not finish.');
    updateTray();
  });
  M.launcherUpdate.on('state', s => send('launcherUpdate', s));
  M.game.on('state', s => { send('game', s); updateTray(); });
  M.game.on('ended', async info => {
    send('gameEnded', info);
    send('profile', await M.profile.read());
    if (info.crashed) { notify('Rootbound', 'The game closed unexpectedly.'); showWindow(); }
    stopProfilePoll();
  });
}

// ---- automatic behaviour
let autoStarted = false, autoTried = null;
M.handleStatus = s => {
  if (MODE !== 'launcher') return;
  // the launcher updates its own code quietly: nothing here can touch a running game
  if (s.launcherUpdate && M.updates.latest) M.launcherUpdate.apply(M.updates.latest.launcher, CONFIG.channelUrl);
  if (s.action === 'update' && s.latest) {
    if (!autoStarted) { autoStarted = true; notify('Rootbound ' + s.latest.version, 'An update is available.'); }
    // once per version: a failed or canceled download waits for the player, or for the next check round
    if (settings.values.launcher.autoDownload && !M.updates.busy() && autoTried !== s.latest.version) { autoTried = s.latest.version; M.updates.enqueue('update'); }
  }
  updateTray();
};

function scheduleChecks() {
  const every = (fn, ms) => { const t = setInterval(fn, ms); if (t.unref) t.unref(); M.timers.push(t); };
  // one check on opening, then a quiet one every few hours; news a bit more often, and only while someone can see it
  if (settings.values.launcher.autoCheck) M.updates.check().catch(() => {});
  every(() => { autoTried = null; if (settings.values.launcher.autoCheck && !M.updates.busy()) M.updates.check().catch(() => {}); }, 4 * 3600 * 1000);
  M.news.refresh().then(s => send('news', s)).catch(() => {});
  every(() => { if (M.win && !M.win.isDestroyed() && M.win.isVisible()) M.news.refresh().then(s => send('news', s)).catch(() => {}); }, 30 * 60 * 1000);
  // an update interrupted last time carries on
  const res = M.updates.state.resume;
  if (res && !M.updates.busy() && (settings.values.launcher.autoDownload || res.paused)) M.updates.enqueue(res.kind, { startPaused: !!res.paused });
}

// ---- profile refresh while the game runs (the game writes the file every ten seconds)
let pollT = null;
function startProfilePoll() { if (pollT) return; pollT = setInterval(async () => { if (M.win && !M.win.isDestroyed() && M.win.isVisible()) send('profile', await M.profile.read()); }, 15000); if (pollT.unref) pollT.unref(); }
function stopProfilePoll() { if (pollT) clearInterval(pollT); pollT = null; }

// ---- windows
function createWindow() {
  if (M.win && !M.win.isDestroyed()) return M.win;
  const work = screen.getPrimaryDisplay().workAreaSize;
  const installer = MODE !== 'launcher';
  const W = installer ? 880 : Math.min(1440, Math.max(1120, Math.round(work.width * 0.82))), H = installer ? 600 : Math.min(900, Math.max(700, Math.round(work.height * 0.86)));
  const test = TEST ? { width: +process.env.RB_L_W || W, height: +process.env.RB_L_H || H } : {};
  M.win = new BrowserWindow(Object.assign({
    width: W, height: H, minWidth: installer ? 880 : 1040, minHeight: installer ? 600 : 660, show: false, frame: false, resizable: !installer, maximizable: !installer, backgroundColor: '#070818', title: installer ? 'Rootbound Setup' : 'Rootbound',
    icon: path.join(__dirname, '..', 'ui', 'art', 'app-icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, preload: path.join(__dirname, '..', 'preload', 'preload.js'), backgroundThrottling: true, spellcheck: false, v8CacheOptions: 'code' },
  }, test, OFF ? { x: -32000, y: -32000, skipTaskbar: true, focusable: false } : {}));
  Menu.setApplicationMenu(null);
  const wc = M.win.webContents;
  wc.setWindowOpenHandler(() => ({ action: 'deny' }));
  wc.on('will-navigate', e => e.preventDefault());
  wc.on('will-attach-webview', e => e.preventDefault());
  wc.on('render-process-gone', (_e, d) => { log('page gone: ' + JSON.stringify(d)); if (!M.quitting && d.reason !== 'clean-exit' && M.win && !M.win.isDestroyed()) M.win.reload(); });
  wc.on('console-message', e => { if (e.level === 'error') log('page: ' + String(e.message).slice(0, 400)); });
  M.win.once('ready-to-show', () => { if (OFF) M.win.showInactive(); else if (!(HIDDEN && settings.values.launcher.minimizeToTray)) M.win.show(); });
  M.win.on('close', e => {
    if (M.quitting || MODE !== 'launcher') return;
    if (settings.values.launcher.minimizeToTray) { e.preventDefault(); hideToTray(); }
  });
  M.win.on('closed', () => { M.win = null; M.uiReady = false; if (!M.tray && !M.quitting && MODE === 'launcher') app.quit(); });
  M.win.on('maximize', () => send('window', { maximized: true }));
  M.win.on('unmaximize', () => send('window', { maximized: false }));
  M.win.on('focus', () => send('window', { focused: true }));
  M.win.on('blur', () => send('window', { focused: false }));
  M.win.on('hide', () => send('window', { hidden: true }));
  M.win.on('show', () => send('window', { hidden: false }));
  M.win.on('minimize', () => send('window', { hidden: true }));
  M.win.on('restore', () => send('window', { hidden: false }));
  M.win.loadFile(path.join(__dirname, '..', 'ui', 'index.html'), { query: { mode: MODE } });
  return M.win;
}

function showWindow() {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  const w = createWindow();
  if (OFF) { w.showInactive(); return; }
  if (w.isMinimized()) w.restore();
  w.show(); w.focus();
}

// A window hidden in the tray costs memory for nothing: with efficient background use on, its page is closed after a minute and made again when opened.
let hideTimer = null;
function hideToTray() {
  ensureTray();
  if (M.win && !M.win.isDestroyed()) M.win.hide();
  if (settings.values.performance.efficientBackground) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { hideTimer = null; if (M.win && !M.win.isDestroyed() && !M.win.isVisible()) M.win.destroy(); }, settings.values.performance.lowMemory ? 2000 : 60000);
  }
}

function ensureTray() {
  if (M.tray) return;
  const img = nativeImage.createFromPath(path.join(__dirname, '..', 'ui', 'art', 'app-icon.png')).resize({ width: 16, height: 16 });
  M.tray = new Tray(img);
  M.tray.setToolTip('Rootbound');
  M.tray.on('click', showWindow);
  updateTray();
}
async function updateTray() {
  if (!M.tray) return;
  const st = await M.updates.status().catch(() => null), running = M.game.running;
  M.tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Rootbound', click: showWindow },
    { label: running ? 'Rootbound is running' : (st && st.action === 'play' ? 'Play' : 'Play (update first)'), enabled: !running && !!st && st.action === 'play', click: () => playGame({}).catch(e => log(String(e))) },
    { label: 'Check for updates', enabled: !M.updates.busy(), click: () => M.updates.check().catch(() => {}) },
    { type: 'separator' },
    { label: 'Quit', click: () => quit() },
  ]));
}

function quit() { M.quitting = true; for (const t of M.timers) clearInterval(t); app.quit(); }

// ---- playing
async function playGame(quick) {
  const st = await M.updates.status();
  if (!st.installed) return { ok: false, code: 'NOT_INSTALLED' };
  if (M.game.running) return { ok: false, code: 'ALREADY_RUNNING' };
  if (M.updates.lock) return { ok: false, code: 'BUSY', message: 'The game files are being moved. Try again when that has finished.' };
  const check = await M.updates.install.preLaunchCheck();
  if (!check.ok) { log('pre-launch check failed: ' + JSON.stringify(check)); return { ok: false, code: 'NEEDS_REPAIR', detail: check.why, file: check.file }; }
  const args = buildArgs(settings.values.game, quick || {});
  // test builds only: the game they start must never reach the real save
  if (TEST && process.env.RB_L_GAME_DATA) args.push('--user-data-dir=' + process.env.RB_L_GAME_DATA);
  const res = await M.game.start({ exe: check.exe, cwd: check.cwd, args });
  if (!res.ok) return res;
  log('started the game, process ' + res.pid + ', version ' + check.version);
  startProfilePoll();
  if (settings.values.launcher.closeAfterStart && !M.updates.busy()) setTimeout(() => quit(), 600);
  else if (settings.values.launcher.minimizeToTray) setTimeout(() => hideToTray(), 900);
  else if (M.win && !M.win.isDestroyed() && !OFF) setTimeout(() => { if (M.win && !M.win.isDestroyed()) M.win.minimize(); }, 900);
  return { ok: true, version: check.version };
}

// ---- the real server, for the Community page. Asked only when that page is open, and at most once a minute: asking wakes the sleeping free server.
async function serverStatus() {
  const url = CONFIG.gameServer;
  if (!url) return { known: false };
  const now = Date.now();
  if (M.serverCache && now - M.serverCache.at < 60000) return M.serverCache.value;
  const t0 = Date.now();
  let value;
  try {
    const j = await M.http.getJson(new URL('/health', url).toString(), { maxBytes: 16 * 1024 });
    value = { known: true, online: !!j.ok, players: Number.isFinite(j.players) ? j.players : null, ms: Date.now() - t0 };
  } catch (e) { value = { known: true, online: false, error: e.message }; }
  M.serverCache = { at: now, value };
  return value;
}

// ---- what the page can ask for. Each handler checks its input: the page is trusted less than this process.
const handlers = {
  'state.get': async () => ({
    mode: MODE, introDone: !!M.introDone, settings: settings.get(), status: await M.updates.status(), queue: M.updates.queueSnapshot(), profile: await M.profile.read(), news: M.news.state(), game: M.game.state(),
    app: { version: boot.appVersion, builtIn: boot.builtInVersion, updated: boot.updated, installed: isInstalled, userData, locale: app.getLocale(), channelUrl: CONFIG.channelUrl, links: CONFIG.links || {}, gameServer: CONFIG.gameServer || '', startsWithWindows: M.system.startsWithWindows(), screen: screen.getPrimaryDisplay().size },
    launcherUpdate: M.launcherUpdate.state,
    saves: { dir: gameDataDir(), exists: fs.existsSync(gameDataDir()) },
  }),
  'ui.ready': () => {
    if (M.uiReady) return true;
    M.uiReady = true; M.introDone = true;
    boot.ok();
    if (MODE === 'launcher' && !M.checksScheduled) { M.checksScheduled = true; scheduleChecks(); if (argv.includes('--play')) playGame({}).catch(e => log(String(e))); }
    return true;
  },
  'settings.set': async ({ section, key, value }) => {
    const r = await settings.set(section, key, value);
    if (!r.ok) return r;
    if (section === 'launcher' && key === 'bandwidthKBps') M.updates.setBandwidth(value);
    if (section === 'launcher' && key === 'startWithWindows') M.system.setStartWithWindows(value);
    if (section === 'launcher' && key === 'minimizeToTray' && value) ensureTray();
    if (section === 'launcher' && key === 'autoCheck' && value) M.updates.check().catch(() => {});
    if (section === 'launcher' && key === 'autoDownload' && value) { autoTried = null; const s = await M.updates.status(); M.handleStatus(s); }
    return Object.assign(r, { settings: settings.get() });
  },
  'game.play': quick => playGame({ world: quick && quick.world, dungeon: quick && quick.dungeon }),
  'updates.check': () => M.updates.check(),
  'updates.unblock': () => M.updates.unblock(),
  'task.start': ({ kind }) => {
    if (!['install', 'update', 'repair'].includes(kind)) return { ok: false };
    return { ok: true, task: M.updates.enqueue(kind) };
  },
  'task.pause': () => M.updates.pause(),
  'task.resume': () => M.updates.resume(),
  'task.cancel': ({ id } = {}) => M.updates.cancel(id),
  'game.verify': async () => {
    if (M.updates.busy()) return { ok: false, busy: true };
    return M.updates.install.verifyInstalled({ onProgress: (d, t) => send('verify', { done: d, total: t }) });
  },
  'game.restorePrevious': async () => {
    try { const r = await M.updates.restorePrevious({ onProgress: (d, t) => send('verify', { done: d, total: t }) }); return { ok: true, version: r.version }; } catch (e) { return { ok: false, code: e.code, message: e.message }; }
  },
  'game.openFolder': async () => { const st = await M.updates.install.status(); return shell.openPath(st.installed ? path.dirname(st.exe) : gameDirNow()); },
  'game.openLog': () => shell.openPath(path.join(gameDataDir(), 'rootbound-startup.log')),
  'launcher.openLog': () => shell.openPath(LOG),
  'game.pickDir': async () => {
    const r = await dialog.showOpenDialog(M.win, { properties: ['openDirectory', 'createDirectory'], title: 'Choose where the game goes' });
    return r.canceled ? null : r.filePaths[0];
  },
  // Moves an existing install, or just remembers the folder if nothing is installed yet.
  'game.moveDir': async ({ dir }) => {
    if (typeof dir !== 'string' || !dir) return { ok: false };
    if (M.updates.busy()) return { ok: false, message: 'Wait for the current download to finish.' };
    if (M.game.running) return { ok: false, message: 'Close the game first.' };
    const why = unsafeGameDir(dir, { saveDir: gameDataDir(), launcherDir: isInstalled ? launcherDir : null });
    if (why) return { ok: false, message: why };
    try {
      const target = path.join(dir, path.basename(dir).toLowerCase().includes('rootbound') ? '' : 'Rootbound Game');
      // the new place is saved before the old copy is removed: a crash in between leaves a working game, not a missing one
      const to = await M.updates.exclusive('move', () => M.updates.install.moveTo(target, { commit: d => settings.set('game', 'installDir', d), onProgress: (d, t) => send('verify', { done: d, total: t, moving: true }) }));
      const s = await M.updates.status(); send('status', s);
      return { ok: true, dir: to };
    } catch (e) { return { ok: false, message: e.message }; }
  },
  'server.status': () => serverStatus(),
  'news.refresh': async () => { const s = await M.news.refresh(); send('news', s); return s; },
  'profile.get': () => M.profile.read(),
  'launcher.uninstall': () => { if (isInstalled) { app.releaseSingleInstanceLock(); spawn(process.execPath, ['--uninstall'], { detached: true, stdio: 'ignore' }).unref(); setTimeout(() => quit(), 200); return true; } return false; },
  'launcher.restart': () => { M.quitting = true; app.relaunch({ args: argv.slice(1).filter(a => !['--hidden', '--play', '--repair'].includes(a)) }); app.exit(0); },
  'window.minimize': () => { if (M.win) M.win.minimize(); },
  'window.toggleMax': () => { if (M.win) { if (M.win.isMaximized()) M.win.unmaximize(); else M.win.maximize(); } return M.win ? M.win.isMaximized() : false; },
  'window.close': () => { if (M.win) M.win.close(); },
  'shell.open': ({ url }) => {
    let u; try { u = new URL(url); } catch (_) { return false; }
    if (u.protocol !== 'https:') return false;
    shell.openExternal(u.toString()); return true;
  },
  'system.memory': () => ({ rss: process.memoryUsage().rss, metrics: app.getAppMetrics().map(m => ({ type: m.type, mem: m.memory.workingSetSize, cpu: m.cpu.percentCPUUsage })) }),
};

function registerIpc() {
  for (const [name, fn] of Object.entries(handlers)) {
    ipcMain.handle(name, async (e, arg) => {
      // only our own page, loaded from inside the app
      if (!e.senderFrame || !String(e.senderFrame.url).startsWith('file:')) throw new Error('Not allowed');
      return fn(arg === undefined ? {} : arg);
    });
  }
}

function lockDownSession() {
  const s = session.defaultSession;
  s.setPermissionRequestHandler((_c, _p, cb) => cb(false));
  s.setPermissionCheckHandler(() => false);
  s.webRequest.onBeforeRequest((d, cb) => { const u = d.url; cb({ cancel: !(u.startsWith('file:') || u.startsWith('rbimg:') || u.startsWith('data:') || u.startsWith('devtools:')) }); });
  protocol.handle('rbimg', async req => {
    const name = new URL(req.url).pathname.replace(/^\//, '');
    const f = M.news && M.news.imagePath(name);
    if (!f || !fs.existsSync(f)) return new Response('', { status: 404 });
    return net.fetch(pathToFileURL(f).toString());
  });
}

// ---- start
if (!SMOKE && !app.requestSingleInstanceLock()) {
  boot.notStarted();
  if (MODE !== 'launcher') dialog.showErrorBox('Rootbound', 'Please close the Rootbound launcher first, then try again.');
  app.exit(0);
} else {
  app.on('second-instance', () => showWindow());
  app.whenReady().then(async () => {
    lockDownSession();
    registerIpc();
    await createModules();
    if (MODE !== 'launcher') {
      const inst = require('./setup');
      inst.register({ ipcMain, handlers, M, settings, CONFIG, boot, log, send, launcherDir, gameDataDir, defaultRoot, isInstalled, app, argVal, quit });
      if (SILENT) return inst.silent();
    }
    if (SMOKE) return smokeRun();
    if (MODE === 'launcher' && argv.includes('--repair')) M.updates.enqueue('repair');
    if (HIDDEN && settings.values.launcher.minimizeToTray) { ensureTray(); handlers['ui.ready'](); return; }
    if (settings.values.launcher.minimizeToTray) ensureTray();
    createWindow();
  }).catch(e => { log('start failed: ' + (e && e.stack || e)); dialog.showErrorBox('Rootbound', 'The launcher could not start.\n' + e.message); app.exit(1); });
  app.on('before-quit', () => { M.quitting = true; });   // a real quit (Windows shutting down, say) must not just hide to the tray
  app.on('window-all-closed', () => { if (M.tray && !M.quitting) return; app.quit(); });
}

// A headless self-test that works on the locked-down exe too: starts the core, optionally checks the server, prints what it finds, exits. Opens no window.
async function smokeRun() {
  const st = await M.updates.check().catch(e => ({ error: e.message }));
  console.log('LAUNCHER-OK version=' + boot.appVersion + ' updated=' + boot.updated + ' builtIn=' + boot.builtInVersion + ' installed=' + st.installed + ' game=' + st.version + ' latest=' + (st.latest ? st.latest.version : '') + ' action=' + st.action + ' checkError=' + (st.checkError ? st.checkError.code : '') + ' launcherUpdate=' + (st.launcherUpdate ? st.launcherUpdate.version : ''));
  if (st.launcherUpdate && argv.includes('--apply-launcher-update')) { let r = await M.launcherUpdate.apply(M.updates.latest.launcher, CONFIG.channelUrl); while (M.launcherUpdate.state.working) { await new Promise(res => setTimeout(res, 100)); r = M.launcherUpdate.state; } console.log('LAUNCHER-UPDATE ready=' + r.ready + ' error=' + (r.error ? r.error.code : '')); }
  boot.ok();
  app.exit(0);
}

