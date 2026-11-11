#!/usr/bin/env node
'use strict';
// Contact sheets of an evolution cinematic, off-screen, for checking the art without building the real game.
//   node tools/movie/evo-preview.js <class> <out.jpg> [mode]
//   mode: 'sheet' (default: 30 frames across the 20 s), 'shots' (one frame per shot, mid-shot), 'looks' (4 moments x 4 very different characters),
//         or a comma list of seconds, e.g. '12.6,12.9,13.4' (large frames).
// Uses the private build in %TEMP%/rbevo (made by tools/movie/evo-build.sh) and evaluates the class's own file fresh from src, so editing a class file needs no rebuild.
// At most four previews run at once (a lock in %TEMP%/rbevo-lock), so several can be asked for in parallel.
const fs = require('fs'), path = require('path'), os = require('os');
const pw = (() => { try { return require('playwright'); } catch (_) { return require(path.join(os.tmpdir(), 'rbpw', 'node_modules', 'playwright')); } })();
const K = process.argv[2], OUT = path.resolve(process.argv[3] || ('evo-' + K + '.jpg')), MODE = process.argv[4] || 'sheet';
const ROOT = path.resolve(__dirname, '..', '..'), BUILD = path.join(os.tmpdir(), 'rbevo', 'index.html'), SRC = path.join(ROOT, 'src', 'js', 'late', '99-zzzzzzzzzz-z8-evc-' + K + '.js');
const EXE = process.env.CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!K || !fs.existsSync(BUILD)) { console.log('usage: evo-preview.js <class> <out.jpg> [mode]; needs ' + BUILD); process.exit(2); }
const LOCK = path.join(os.tmpdir(), 'rbevo-lock'); fs.mkdirSync(LOCK, { recursive: true });
async function slot() { for (let n = 0; n < 2400; n++) { for (let i = 0; i < 4; i++) { const d = path.join(LOCK, 's' + i); try { fs.mkdirSync(d); return d; } catch (_) { try { if (Date.now() - fs.statSync(d).mtimeMs > 240000) fs.rmSync(d, { recursive: true, force: true }); } catch (_) {} } } await new Promise(r => setTimeout(r, 500)); } throw new Error('no preview slot'); }
const LOOKS = [{ skin: '#f6dcc8', hair: '#f0eef8', hs: 5, es: 1, eyeCol: '#8a5cff', gd: 1 }, { skin: '#f1c9a0', hair: '#2a1a14', hs: 0, es: 0, eyeCol: '#6a3a1a', gd: 0 }, { skin: '#8a5a3c', hair: '#d8342c', hs: 9, es: 3, eyeCol: '#2a9a6a', gd: 2 }, { skin: '#ffe4d0', hair: '#5ab0ff', hs: 3, es: 2, eyeCol: '#2277cc', gd: 1 }];
(async () => {
  const lock = await slot(); const t0 = Date.now();
  try {
    const b = await pw.chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--mute-audio'] });
    const c = await b.newContext({ viewport: { width: 1280, height: 720 } });
    await c.addInitScript(() => { localStorage.setItem('rbg_seen', '1'); localStorage.setItem('rbp', JSON.stringify({ v: 1, inv: { 1: 20 }, gems: 50000, own: { fist: 1 }, wp: 'fist', bar: [1], done: {}, xp: 3, lvl: 90, made: true, look: { skin: '#f6d2b0', hair: '#d0342c', style: 3, shirt: '#3c6fd1', pants: '#2b3a5a', shoes: '#222', hat: 0, gd: 1, eye: '#2277cc' } })); });
    const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 300)));
    p.on('console', m => { if (m.type() == 'error' && /EVC|FILM1|MOVIE1|MYART/.test(m.text())) errs.push(m.text().slice(0, 400)); });
    await p.goto('file:///' + BUILD.replace(/\\/g, '/'), { waitUntil: 'commit' }); await p.waitForFunction(() => window.RBDIAG && RBDIAG.ready, null, { timeout: 90000 }); await new Promise(r => setTimeout(r, 1200));
    if (fs.existsSync(SRC)) { const code = fs.readFileSync(SRC, 'utf8'); const e = await p.evaluate(code => { try { (0, eval)(code); return null; } catch (e) { return String(e && e.stack || e); } }, code); if (e) errs.push('class file: ' + e.slice(0, 400)); }
    const r = await p.evaluate(async ([K, MODE, LOOKS]) => {
      if (!MOVIE1.has(K)) return { err: 'not registered: ' + K };
      const S = MOVIE1.REG[K].shots; let a = 0; const at = S.map(s => { const q = a; a += s.d; return q; }), dur = a;
      const AT = (n, u) => { const i = S.findIndex(s => s.name == n); return at[i] + S[i].d * u; };
      let times = [], looks = [0], cols = 6, w = 480;
      if (MODE == 'sheet') { for (let i = 0; i < 30; i++) times.push(+(.2 + i * (dur - .4) / 29).toFixed(2)); }
      else if (MODE == 'shots') { times = S.map((s, i) => +(at[i] + s.d * .55).toFixed(2)); cols = 4; }
      else if (MODE == 'looks') { times = [AT('p2', .8), AT('hero', .7), AT('sig', .45), AT('title', .5)]; looks = [0, 1, 2, 3]; cols = 4; }
      else { times = MODE.split(',').map(Number); cols = times.length > 1 ? 2 : 1; w = times.length > 1 ? 960 : 1600; }
      const n = times.length * looks.length, rows = Math.ceil(n / cols), h = w * 9 / 16, o = document.createElement('canvas'); o.width = cols * w; o.height = rows * h; const y = o.getContext('2d'); const ms = []; let j = 0;
      for (const li of looks) {
        MOVIE1.play(K, { rec: 1, look: LOOKS[li] });
        for (const T of times) {
          const t1 = performance.now(); MOVIE1.seek(T); ms.push(Math.round(performance.now() - t1));
          const X = (j % cols) * w, Y = (j / cols | 0) * h; y.drawImage(MOVIE1.canvas(), X, Y, w - 2, h - 2);
          let q = at.length - 1; while (q > 0 && T < at[q]) q--; y.fillStyle = 'rgba(0,0,0,.65)'; y.fillRect(X, Y, 170, 22); y.fillStyle = '#fff'; y.font = '15px monospace'; y.fillText(T.toFixed(2) + 's ' + S[q].name, X + 4, Y + 16); j++;
        }
        MOVIE1.finish('end');
      }
      return { jpg: o.toDataURL('image/jpeg', .86).split(',')[1], dur, ms: Math.max(...ms), avg: Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) };
    }, [K, MODE, LOOKS]);
    if (r.err) errs.push(r.err); else { fs.writeFileSync(OUT, Buffer.from(r.jpg, 'base64')); console.log('wrote', OUT, 'duration', r.dur.toFixed(2) + 's', 'slowest frame', r.ms + 'ms', 'average', r.avg + 'ms'); }
    console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'no errors'); await b.close();
  } finally { fs.rmSync(lock, { recursive: true, force: true }); console.log('took', ((Date.now() - t0) / 1000 | 0) + 's'); }
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
