// What ties the launcher into Windows: shortcuts, the Add or Remove Programs entry, moving itself into place. All per-user, no administrator rights needed.
'use strict';
const { execFile } = require('child_process'), path = require('path'), fsp = require('./fsx').promises;

const UNINSTALL_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\';

const reg = args => new Promise((res, rej) => execFile('reg', args, { windowsHide: true, timeout: 15000 }, (e, out, err) => e ? rej(new Error(String(err || e.message).trim())) : res(String(out))));

class WinSystem {
  // sysRoot and suffix exist so that test builds never touch the real Desktop, Start menu or registry entries.
  constructor({ shell, app, sysRoot = null, keySuffix = '' }) {
    this.shell = shell; this.app = app; this.sysRoot = sysRoot; this.keyName = 'RootboundLauncher' + keySuffix;
  }
  desktopDir() { return this.sysRoot ? path.join(this.sysRoot, 'Desktop') : this.app.getPath('desktop'); }
  startMenuDir() { return this.sysRoot ? path.join(this.sysRoot, 'StartMenu') : path.join(this.app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs'); }
  shortcutPaths() { return { desktop: path.join(this.desktopDir(), 'Rootbound.lnk'), start: path.join(this.startMenuDir(), 'Rootbound.lnk') }; }

  async writeShortcut(where, exe) {
    const link = this.shortcutPaths()[where];
    await fsp.mkdir(path.dirname(link), { recursive: true });
    const ok = this.shell.writeShortcutLink(link, 'create', { target: exe, cwd: path.dirname(exe), description: 'Rootbound', icon: exe, iconIndex: 0, appUserModelId: 'com.rootbound.launcher' });
    if (!ok) throw new Error('Could not create the shortcut ' + link);
    return link;
  }
  readShortcut(where) { try { return this.shell.readShortcutLink(this.shortcutPaths()[where]); } catch (_) { return null; } }
  async removeShortcuts() { for (const p of Object.values(this.shortcutPaths())) await fsp.rm(p, { force: true }).catch(() => {}); }

  // The Add or Remove Programs entry
  async registerUninstall({ exe, version, installDir, sizeKB }) {
    const key = UNINSTALL_KEY + this.keyName;
    const add = (name, type, val) => reg(['add', key, '/v', name, '/t', type, '/d', String(val), '/f']);
    await add('DisplayName', 'REG_SZ', 'Rootbound');
    await add('DisplayVersion', 'REG_SZ', version);
    await add('Publisher', 'REG_SZ', 'Rootbound');
    await add('DisplayIcon', 'REG_SZ', exe);
    await add('InstallLocation', 'REG_SZ', installDir);
    await add('UninstallString', 'REG_SZ', '"' + exe + '" --uninstall');
    await add('ModifyPath', 'REG_SZ', '"' + exe + '" --repair');
    await add('NoRepair', 'REG_DWORD', 0);
    if (sizeKB) await add('EstimatedSize', 'REG_DWORD', sizeKB);
  }
  async readUninstall() {
    try { return await reg(['query', UNINSTALL_KEY + this.keyName]); } catch (_) { return null; }
  }
  async removeUninstall() { await reg(['delete', UNINSTALL_KEY + this.keyName, '/f']).catch(() => {}); }

  setStartWithWindows(on) {
    if (this.sysRoot) return;   // test builds: tested separately, without touching this PC's start-up list
    this.app.setLoginItemSettings({ openAtLogin: !!on, path: process.execPath, args: ['--hidden'] });
  }
  startsWithWindows() { return this.sysRoot ? false : this.app.getLoginItemSettings({ path: process.execPath, args: ['--hidden'] }).openAtLogin; }
}

module.exports = { WinSystem };
