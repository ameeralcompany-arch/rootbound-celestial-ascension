// Builds the launcher: the replaceable code package (for launcher updates), and the full app folder with its own copy of Electron.
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path');
const { sha256File } = require('../../../launcher/app/core/util');
const { ROOT } = require('./publisher');
const { dep, loadPackager, packWithRetry, DESKTOP } = require('./game-package');

const LAUNCHER = path.join(ROOT, 'launcher');
// asar is only published as an ES module
const loadAsar = async () => { const m = await import(require('url').pathToFileURL(path.join(DESKTOP, 'node_modules', '@electron', 'asar', 'lib', 'asar.js')).href); return m.default && m.default.createPackage ? m.default : m; };
const launcherPkg = () => JSON.parse(fs.readFileSync(path.join(LAUNCHER, 'package.json'), 'utf8'));

// The update package: only launcher/app, with no bootstrap and no keys. The bootstrap inside the installed exe checks its signature before running it.
async function packApp({ outDir, versionOverride }) {
  await fsp.mkdir(outDir, { recursive: true });
  const pkg = launcherPkg();
  if (versionOverride) pkg.version = versionOverride;
  const file = path.join(outDir, 'app-' + pkg.version + '.asar');
  const asar = await loadAsar();
  await fsp.rm(file, { force: true });
  await asar.createPackage(path.join(LAUNCHER, 'app'), file);
  return { version: pkg.version, file, size: (await fsp.stat(file)).size, hash: await sha256File(file), minBootstrap: pkg.rootbound.minBootstrap };
}

// The whole launcher. `config` replaces update-config.json inside it (test builds point at the local server this way). harden: lock the exe.
async function packageLauncher({ outDir, config = null, harden = true, log = console.log }) {
  const pkg = launcherPkg(), stage = path.join(outDir, 'stage');
  await fsp.rm(outDir, { recursive: true, force: true });
  await fsp.mkdir(stage, { recursive: true });
  await fsp.cp(path.join(LAUNCHER, 'bootstrap'), path.join(stage, 'bootstrap'), { recursive: true });
  await fsp.cp(path.join(LAUNCHER, 'app'), path.join(stage, 'app'), { recursive: true });
  const conf = config || JSON.parse(await fsp.readFile(path.join(LAUNCHER, 'update-config.json'), 'utf8'));
  await fsp.writeFile(path.join(stage, 'update-config.json'), JSON.stringify(conf, null, 2));
  const stagePkg = { name: pkg.name, productName: pkg.productName, version: pkg.version, description: pkg.description, main: pkg.main, author: pkg.author, license: pkg.license, rootbound: pkg.rootbound };
  await fsp.writeFile(path.join(stage, 'package.json'), JSON.stringify(stagePkg, null, 2));

  const electronVersion = JSON.parse(await fsp.readFile(path.join(DESKTOP, 'node_modules', 'electron', 'package.json'), 'utf8')).version;
  const run = await loadPackager();
  log('Packaging the launcher...');
  const [out] = await packWithRetry(run, {
    dir: stage, name: pkg.productName, executableName: 'RootboundLauncher', platform: 'win32', arch: 'x64', out: path.join(outDir, 'pack'), overwrite: true, asar: true, electronVersion, appVersion: pkg.version, quiet: true, prune: false,
    icon: path.join(ROOT, 'installer', 'rootbound.ico'),
    win32metadata: { CompanyName: 'Rootbound', FileDescription: 'Rootbound Launcher', ProductName: 'Rootbound Launcher', InternalName: 'RootboundLauncher', OriginalFilename: 'RootboundLauncher.exe' },
  }, log);
  // Chromium's own translations for languages the launcher doesn't offer are 45 MB of nothing
  const keep = new Set(['en-US.pak', 'es.pak', 'fr.pak', 'ja.pak', 'es-419.pak']);
  const loc = path.join(out, 'locales');
  for (const f of await fsp.readdir(loc)) if (!keep.has(f)) await fsp.rm(path.join(loc, f), { force: true });
  await fsp.rm(path.join(out, 'LICENSES.chromium.html'), { force: true }).catch(() => {});
  const exe = path.join(out, 'RootboundLauncher.exe');
  if (harden) {
    const { flipFuses, FuseVersion, FuseV1Options } = dep('@electron/fuses');
    await flipFuses(exe, { version: FuseVersion.V1, [FuseV1Options.RunAsNode]: false, [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, [FuseV1Options.EnableNodeCliInspectArguments]: false, [FuseV1Options.OnlyLoadAppFromAsar]: true });
  }
  return { dir: out, exe, version: pkg.version };
}

module.exports = { packApp, packageLauncher, launcherPkg, loadAsar, LAUNCHER };
