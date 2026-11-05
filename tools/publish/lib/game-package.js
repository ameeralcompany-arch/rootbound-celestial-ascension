// Builds a clean, hardened copy of the game for publishing: the same steps as the Package step of .github/workflows/build.yml, in a folder of its own, so nothing here touches desktop/dist.
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), { spawn, spawnSync } = require('child_process');
const { ROOT } = require('./publisher');

const DESKTOP = path.join(ROOT, 'desktop');
const dep = name => require(path.join(DESKTOP, 'node_modules', name));
// the packager is only published as an ES module
const loadPackager = async () => { const m = await import(require('url').pathToFileURL(path.join(DESKTOP, 'node_modules', '@electron', 'packager', 'dist', 'index.js')).href); return m.packager || m.default; };

// The packager checks its copy of Electron against a list on GitHub every time, and that download has bad moments: wait and try again rather than fail a publish over it.
async function packWithRetry(run, opts, log = () => {}) {
  for (let i = 0; ; i++) {
    try { return await run(opts); } catch (e) {
      const net = /HTTPError|Response code 5|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|fetch failed/i.test(String(e && e.message));
      if (!net || i >= 5) throw e;
      const wait = 15000 * (i + 1);
      log('GitHub did not hand over the Electron checksum list (' + e.message + '). Trying again in ' + wait / 1000 + ' seconds...');
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

async function copyDir(from, to) { await fsp.cp(from, to, { recursive: true }); }

async function packageGame({ version, outDir, log = console.log }) {
  const stage = path.join(outDir, 'stage');
  await fsp.rm(outDir, { recursive: true, force: true });
  await fsp.mkdir(stage, { recursive: true });
  for (const f of ['main.js']) await fsp.copyFile(path.join(DESKTOP, f), path.join(stage, f));
  const pkg = JSON.parse(await fsp.readFile(path.join(DESKTOP, 'package.json'), 'utf8'));
  pkg.version = version; delete pkg.devDependencies; delete pkg.scripts;
  await fsp.writeFile(path.join(stage, 'package.json'), JSON.stringify(pkg, null, 2));
  await fsp.copyFile(path.join(ROOT, 'index.html'), path.join(stage, 'index.html'));
  await copyDir(path.join(ROOT, 'audio'), path.join(stage, 'audio'));
  await copyDir(path.join(ROOT, 'assets'), path.join(stage, 'assets'));

  log('Packaging the game...');
  const electronVersion = JSON.parse(await fsp.readFile(path.join(DESKTOP, 'node_modules', 'electron', 'package.json'), 'utf8')).version;
  const run = await loadPackager();
  const [out] = await packWithRetry(run, { dir: stage, name: 'Rootbound', platform: 'win32', arch: 'x64', out: path.join(outDir, 'pack'), overwrite: true, asar: true, electronVersion, appVersion: version, quiet: true, prune: false }, log);
  await fsp.copyFile(path.join(DESKTOP, 'Rootbound-Safe-Mode.bat'), path.join(out, 'Rootbound-Safe-Mode.bat'));
  const exe = path.join(out, 'Rootbound.exe');
  return { dir: out, exe };
}

async function harden(exe) {
  const r = spawnSync(process.execPath, [path.join(DESKTOP, 'harden.js'), exe], { cwd: DESKTOP, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('Hardening failed: ' + r.stdout + r.stderr);
}

// Starts the packaged game off-screen with a throwaway data folder. Passes when it reaches its first frame.
function smoke(exe, { userData, timeoutMs = 90000 }) {
  return new Promise(resolve => {
    let out = '';
    const c = spawn(exe, ['--smoke', '--user-data-dir=' + userData], { env: Object.assign({}, process.env, { RB_TEST_OFFSCREEN: '1' }), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const t = setTimeout(() => { c.kill(); resolve({ ok: false, out: out + '\n(timed out)' }); }, timeoutMs);
    c.stdout.on('data', d => { out += d; }); c.stderr.on('data', () => {});
    c.on('exit', () => { clearTimeout(t); fsp.rm(userData, { recursive: true, force: true, maxRetries: 3 }).catch(() => {}); resolve({ ok: /SMOKE-OK/.test(out), out }); });
    c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: e.message }); });
  });
}

module.exports = { packageGame, packWithRetry, harden, smoke, dep, loadPackager, DESKTOP };
