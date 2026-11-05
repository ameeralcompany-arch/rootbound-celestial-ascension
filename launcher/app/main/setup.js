// The second half of the installer, and the uninstaller. RootboundSetup.exe unpacks the launcher to a temporary folder and starts it with --installer; from there this file copies it
// to the folder the player chose, makes shortcuts and the Add or Remove Programs entry, downloads and verifies the game through the normal update path, and hands over to the installed launcher.
'use strict';
const fs = require('../core/fsx'), fsp = fs.promises, path = require('path'), { spawn } = require('child_process');
const { unsafeGameDir, GameInstall } = require('../core/game-install');
const { freeBytes } = require('../core/update-manager');
const { walkFiles, retryFs, atomicWrite } = require('../core/util');

function register(ctx) {
  const { ipcMain, handlers, M, settings, CONFIG, boot, log, send, launcherDir, gameDataDir, defaultRoot, isInstalled, app, argVal, quit } = ctx;

  const existing = () => {
    const gd = settings.values.game.installDir, root = settings.values.launcher.installRoot || (gd ? path.dirname(gd) : '');
    if (!root) return null;
    const exe = path.join(root, 'launcher', 'RootboundLauncher.exe');
    return fs.existsSync(exe) ? { root, exe, gameDir: gd || path.join(root, 'game') } : null;
  };

  const add = (name, fn) => {
    handlers[name] = fn;
    ipcMain.handle(name, async (e, arg) => {
      if (!e.senderFrame || !String(e.senderFrame.url).startsWith('file:')) throw new Error('Not allowed');
      return fn(arg === undefined ? {} : arg);
    });
  };

  async function copyLauncher(root) {
    const to = path.join(root, 'launcher');
    if (path.resolve(to).toLowerCase() === path.resolve(launcherDir).toLowerCase()) return path.join(to, path.basename(process.execPath));
    // only ever replace a launcher folder we made
    const names = await fsp.readdir(to).catch(() => null);
    if (names && names.length && !names.includes('.rootbound-launcher')) throw new Error('That folder already has a "launcher" folder that is not Rootbound\'s. Choose another location.');
    const tmp = to + '.new';
    await fsp.rm(tmp, { recursive: true, force: true });
    await fsp.mkdir(tmp, { recursive: true });
    const files = await walkFiles(launcherDir), total = files.reduce((a, f) => a + f.size, 0);
    let done = 0;
    for (const f of files) {
      const t = path.join(tmp, ...f.path.split('/'));
      await fsp.mkdir(path.dirname(t), { recursive: true });
      await retryFs(() => fsp.copyFile(f.full, t));
      done += f.size;
      send('setup', { step: 'copy', percent: total ? done / total * 100 : 100 });
    }
    await fsp.writeFile(path.join(tmp, '.rootbound-launcher'), 'The Rootbound launcher lives here.\n');
    // the old copy moves aside and is deleted only once the new one is in place
    const old = to + '.old';
    await fsp.rm(old, { recursive: true, force: true }).catch(() => {});
    if (names) await retryFs(() => fsp.rename(to, old));
    try { await retryFs(() => fsp.rename(tmp, to)); } catch (e) { if (names) await fsp.rename(old, to).catch(() => {}); throw e; }
    await fsp.rm(old, { recursive: true, force: true, maxRetries: 3 }).catch(() => {});
    return path.join(to, path.basename(process.execPath));
  }

  async function install({ dir, desktop = true, startMenu = true }) {
    const root = path.resolve(dir);
    const why = unsafeGameDir(root, { saveDir: gameDataDir() });
    if (why) return { ok: false, message: why };
    await fsp.mkdir(root, { recursive: true }).catch(() => {});
    try { await fsp.access(root, fs.constants.W_OK); } catch (_) { return { ok: false, message: 'That folder cannot be written to. Choose another one.' }; }
    log('installing to ' + root);
    send('setup', { step: 'copy', percent: 0 });
    const exe = await copyLauncher(root);
    send('setup', { step: 'shortcuts' });
    // a game the player moved somewhere else stays there
    const had = settings.values.game.installDir;
    const gameDir = had && fs.existsSync(path.join(had, 'install.json')) ? had : path.join(root, 'game');
    await settings.set('game', 'installDir', gameDir);
    await settings.set('launcher', 'installRoot', root);
    M.updates.install.dir = gameDir;
    if (desktop) await M.system.writeShortcut('desktop', exe);
    if (startMenu) await M.system.writeShortcut('start', exe);
    await M.system.registerUninstall({ exe, version: boot.appVersion, installDir: root, sizeKB: 0 });
    ctx.installedExe = exe; ctx.installedRoot = root;
    return { ok: true, exe, root, gameDir };
  }

  // The game itself: the same engine, the same checks, the same recovery as every later update.
  function downloadGame() {
    M.updates.install.dir = settings.values.game.installDir || M.updates.install.dir;
    return M.updates.enqueue('install');
  }

  add('setup.info', async () => {
    const root = defaultRoot(), ex = existing();
    const st = await M.updates.check().catch(() => null);
    return { defaultDir: ex ? ex.root : root, existing: ex, free: await freeBytes(root), latest: st && st.latest ? st.latest : null, checkError: st ? st.checkError : null, version: boot.appVersion, saves: fs.existsSync(gameDataDir()) ? gameDataDir() : null };
  });
  add('setup.free', async ({ dir }) => ({ free: await freeBytes(dir), why: unsafeGameDir(dir, { saveDir: gameDataDir() }) }));
  add('setup.pickDir', async () => {
    const r = await require('electron').dialog.showOpenDialog(M.win, { properties: ['openDirectory', 'createDirectory'], title: 'Choose where to install Rootbound' });
    if (r.canceled) return null;
    const p = r.filePaths[0];
    return path.basename(p).toLowerCase().includes('rootbound') ? p : path.join(p, 'Rootbound');
  });
  add('setup.install', o => install(o).catch(e => ({ ok: false, message: e.message })));
  add('setup.downloadGame', async () => ({ ok: true, task: downloadGame() }));
  add('setup.repair', async () => {
    const ex = existing();
    if (!ex) return { ok: false, message: 'Nothing is installed yet' };
    const r = await install({ dir: ex.root, desktop: fs.existsSync(M.system.shortcutPaths().desktop), startMenu: true }).catch(e => ({ ok: false, message: e.message }));
    if (!r.ok) return r;
    M.updates.install.dir = ex.gameDir;
    const st = await M.updates.status();
    return { ok: true, task: M.updates.enqueue(st.installed ? 'repair' : 'install') };
  });
  // Hands over to the launcher that was just installed, which stays after this temporary copy has gone.
  add('setup.finish', async ({ play } = {}) => {
    const exe = ctx.installedExe || (existing() && existing().exe);
    if (exe) {
      app.releaseSingleInstanceLock();
      const keep = process.argv.filter(a => a.startsWith('--user-data-dir='));
      const c = spawn(exe, (play ? ['--play'] : []).concat(keep), { detached: true, stdio: 'ignore' });
      c.unref();
    }
    setTimeout(() => quit(), 200);
    return true;
  });
  add('setup.quit', () => { quit(); return true; });

  // ---- uninstall
  add('uninstall.info', async () => {
    const dir = settings.values.game.installDir || '';
    return { gameDir: dir, saves: fs.existsSync(gameDataDir()) ? gameDataDir() : null, running: !!M.game.running, root: isInstalled ? path.dirname(launcherDir) : null };
  });
  async function uninstall() {
    if (M.game.running) return { ok: false, message: 'Close the game first.' };
    send('setup', { step: 'remove-game' });
    const gameDir = settings.values.game.installDir;
    if (gameDir) await new GameInstall({ dir: gameDir, publicKeys: CONFIG.publicKeys, http: M.http, saveDir: gameDataDir() }).removeAll().catch(e => log('remove game: ' + e.message));
    send('setup', { step: 'remove-links' });
    await M.system.removeShortcuts();
    await M.system.removeUninstall();
    M.system.setStartWithWindows(false);
    // the launcher can't delete the folder it runs from: a small command does it a moment after this exits. Saves are in another folder and are not touched.
    const victims = [app.getPath('userData')];
    if (isInstalled) victims.push(launcherDir);
    const root = isInstalled ? path.dirname(launcherDir) : null;
    const tmpDir = app.getPath('temp'), script = path.join(tmpDir, 'rootbound-uninstall-' + process.pid + '.cmd');
    // in a batch file % is special, and paths may hold any language: UTF-8 code page, doubled percent signs
    const q = p => '"' + p.replace(/"/g, '').replace(/%/g, '%%') + '"';
    const lines = ['@echo off', 'chcp 65001 >nul',
      // wait for this launcher to really be gone, whenever the player closes the window
      ':wait', 'ping -n 2 127.0.0.1 >nul', 'tasklist /FI "PID eq ' + process.pid + '" /NH | find "' + process.pid + '" >nul', 'if not errorlevel 1 goto wait', 'ping -n 2 127.0.0.1 >nul'];
    for (const v of victims) lines.push('rmdir /s /q ' + q(v), 'if exist ' + q(v) + ' (ping -n 3 127.0.0.1 >nul & rmdir /s /q ' + q(v) + ')');
    if (root) lines.push('rmdir ' + q(root) + ' 2>nul');
    lines.push('(goto) 2>nul & del "%~f0"');
    await atomicWrite(script, lines.join('\r\n') + '\r\n');
    spawn('cmd.exe', ['/d', '/s', '/c', '"' + script + '"'], { detached: true, stdio: 'ignore', windowsHide: true, cwd: tmpDir, windowsVerbatimArguments: true }).unref();
    send('setup', { step: 'done' });
    // nothing can finish until this exits, so it doesn't wait for a click for long
    setTimeout(() => quit(), 6000);
    return { ok: true };
  }
  add('uninstall.run', () => uninstall().catch(e => ({ ok: false, message: e.message })));

  // ---- no window at all: for automated installs, and for testing the locked-down exe
  return ctx;
}

module.exports = {
  register(ctx) { this.ctx = register(ctx); return this.ctx; },
  async silent() {
    const { M, log, argVal, handlers } = this.ctx;
    const end = code => { M.quitting = true; setTimeout(() => require('electron').app.exit(code), 100); };
    if (process.argv.includes('--uninstall')) { const r = await handlers['uninstall.run'](); log('UNINSTALL ' + (r.ok ? 'OK' : 'FAILED ' + r.message)); return end(r.ok ? 0 : 1); }
    const dir = argVal('dir') || this.ctx.defaultRoot();
    const r = await handlers['setup.install']({ dir, desktop: !process.argv.includes('--no-desktop'), startMenu: true });
    if (!r.ok) { log('INSTALL FAILED ' + r.message); return end(1); }
    log('LAUNCHER INSTALLED ' + r.exe);
    const done = new Promise(res => M.updates.once('task-end', res));
    let last = -1;
    M.updates.on('task', t => { const p = Math.floor(t.phasePercent / 10) * 10; if (p !== last) { last = p; log(t.phase + ' ' + p + '%'); } });
    await handlers['setup.downloadGame']();
    const t = await done;
    log('GAME ' + (t.phase === 'done' ? 'INSTALLED ' + t.version : 'FAILED ' + (t.error && t.error.message)));
    return end(t.phase === 'done' ? 0 : 1);
  },
};
