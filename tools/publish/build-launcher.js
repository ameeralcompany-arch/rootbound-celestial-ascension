#!/usr/bin/env node
// Builds the launcher and the installer players download.
//   node tools/publish/build-launcher.js                     builds build/launcher/RootboundSetup.exe
//   node tools/publish/build-launcher.js --no-harden         leaves the exe unlocked (only for automated UI tests)
//   node tools/publish/build-launcher.js --config <file>     another launcher config (test builds use this to point at a local server)
//   node tools/publish/build-launcher.js --out <dir>         where to put it
'use strict';
const fs = require('fs'), fsp = fs.promises, path = require('path'), { spawnSync } = require('child_process');
const { ROOT, loadConfig, loadSigningKey, recordPublicKey } = require('./lib/publisher');
const { packageLauncher } = require('./lib/launcher-package');
const { sha256File, fmtBytes } = require('../../launcher/app/core/util');

const CSC = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';

// The first stage of the installer: a tiny program in C#, compiled with the compiler every Windows PC ships with, that shows the splash, unpacks the launcher and starts it.
async function buildSetupExe({ launcherDir, out, version }) {
  const tmp = path.join(path.dirname(out), 'setup-work');
  await fsp.rm(tmp, { recursive: true, force: true });
  await fsp.mkdir(tmp, { recursive: true });
  const zip = path.join(tmp, 'payload.zip');
  const ps = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::CreateFromDirectory('${launcherDir.replace(/'/g, "''")}', '${zip.replace(/'/g, "''")}', [IO.Compression.CompressionLevel]::Optimal, $false)`;
  let r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('Could not pack the launcher: ' + r.stderr);
  const stub = path.join(tmp, 'stub.exe');
  const manifest = path.join(ROOT, 'installer', 'setup.manifest');
  r = spawnSync(CSC, ['/nologo', '/target:winexe', '/optimize+', '/platform:x64', '/out:' + stub, '/win32icon:' + path.join(ROOT, 'installer', 'rootbound.ico'), '/win32manifest:' + manifest, '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll', '/reference:System.IO.Compression.dll', '/reference:System.IO.Compression.FileSystem.dll', '/resource:' + path.join(ROOT, 'installer', 'splash.jpg') + ',splash.jpg', path.join(ROOT, 'installer', 'Setup.cs')], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('Could not compile the installer: ' + r.stdout + r.stderr);
  // The launcher travels after the program: the program finds it from the footer (payload size, then a marker). Simple, no extra tools.
  const payloadSize = (await fsp.stat(zip)).size;
  const footer = Buffer.alloc(16); footer.writeBigUInt64LE(BigInt(payloadSize), 0); footer.write('RBSETUP1', 8, 'ascii');
  await new Promise((res, rej) => {
    const w = fs.createWriteStream(out);
    w.on('error', rej);
    const add = (src, next) => { const s = fs.createReadStream(src); s.on('error', rej); s.pipe(w, { end: false }); s.on('end', next); };
    add(stub, () => add(zip, () => { w.end(footer, res); }));
  });
  await fsp.rm(tmp, { recursive: true, force: true });
  void version;
  return { size: (await fsp.stat(out)).size, hash: await sha256File(out) };
}

async function main() {
  const a = process.argv.slice(2), val = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const out = path.resolve(val('--out') || path.join(ROOT, 'build', 'launcher'));
  let config = null;
  if (val('--config')) config = JSON.parse(await fsp.readFile(val('--config'), 'utf8'));
  else {
    // a real build must trust the key updates are signed with
    const cfg = loadConfig();
    const key = await loadSigningKey(cfg);
    await recordPublicKey(cfg, key.publicKeyB64);
  }
  const { dir, version } = await packageLauncher({ outDir: path.join(out, 'app'), config, harden: !a.includes('--no-harden') });
  console.log('Launcher ' + version + ' built: ' + dir);
  if (a.includes('--no-setup')) return;
  await fsp.mkdir(out, { recursive: true });
  const setup = path.join(out, 'RootboundSetup.exe');
  const r = await buildSetupExe({ launcherDir: dir, out: setup, version });
  console.log('Installer: ' + setup + ' (' + fmtBytes(r.size) + ')\nSHA-256: ' + r.hash);
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { buildSetupExe };
