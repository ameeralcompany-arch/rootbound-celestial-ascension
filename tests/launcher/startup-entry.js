// "Start with Windows", for real: the launcher's own code writes to Windows' start-up list, the list is read back, and the entry is removed again.
// This changes the start-up list of the PC it runs on, so it refuses to run anywhere but the throwaway build machine (the CI variable is set there).
// Run by .github/workflows/build.yml with: npx electron ../tests/launcher/startup-entry.js (from desktop/)
'use strict';
const { app, shell } = require('electron'), path = require('path'), { execFileSync } = require('child_process');

if (process.env.CI !== 'true') { console.log('Skipped: this only runs on the build machine, because it changes the start-up list.'); process.exit(0); }

const { WinSystem } = require(path.join(__dirname, '..', '..', 'launcher', 'app', 'core', 'system'));
const RUN = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
const list = () => { try { return execFileSync('reg', ['query', RUN], { encoding: 'utf8' }); } catch (_) { return ''; } };
let bad = 0;
const ok = (name, good, extra) => { if (!good) bad++; console.log((good ? 'PASS ' : 'FAIL ') + name + (!good && extra !== undefined ? '  - ' + String(extra) : '')); };

app.setAppUserModelId('com.rootbound.launcher');   // the same name the launcher runs under
app.whenReady().then(() => {
  const sys = new WinSystem({ shell, app });
  const exe = process.execPath.toLowerCase();
  const entry = () => list().split(/\r?\n/).find(l => l.toLowerCase().includes(exe)) || '';

  ok('off to begin with', !sys.startsWithWindows() && !entry(), entry());
  sys.setStartWithWindows(true);
  ok('turning it on adds the launcher to the start-up list', !!entry(), list());
  ok('it starts hidden, so it does not pop up over the desktop', entry().includes('--hidden'), entry());
  ok('the launcher reads the setting back as on', sys.startsWithWindows() === true);
  sys.setStartWithWindows(false);
  ok('turning it off removes it', !entry(), entry());
  ok('the launcher reads the setting back as off', sys.startsWithWindows() === false);
  console.log(bad ? bad + ' failed' : 'all passed');
  app.exit(bad ? 1 : 0);
}).catch(e => { console.log('FAIL crashed ' + (e && e.stack || e)); app.exit(1); });
