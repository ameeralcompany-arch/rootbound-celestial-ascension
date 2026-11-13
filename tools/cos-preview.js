#!/usr/bin/env node
'use strict';
// Contact sheets of cosmetic art on the real in-game character, off-screen. One row per cosmetic of a collection (or the ids you name), eight views:
// standing, facing left, running (two moments), in the air, a broad body type, a slim body type, and worn over a gear hat and body (to see the gear hide).
//   node tools/cos-preview.js <set> <out.jpg> [id,id,...]  [--scale 3]
// Uses the private build in %TEMP%/rbevo (tools/movie/evo-build.sh) and evaluates the collection's art file fresh from src
// (src/js/late/99-zzzzzzzzzz-j2-cos-<set>.js), so no rebuild is needed while drawing. At most four previews run at once.
const fs = require('fs'), path = require('path'), os = require('os');
const pw = (() => { try { return require('playwright'); } catch (_) { return require(path.join(os.tmpdir(), 'rbpw', 'node_modules', 'playwright')); } })();
const args = process.argv.slice(2), si = args.indexOf('--scale'), SC = si >= 0 ? +args[si + 1] : 3; if (si >= 0) args.splice(si, 2);
const SET = args[0], OUT = path.resolve(args[1] || ('cos-' + SET + '.jpg')), IDS = args[2] ? args[2].split(',') : null;
const ROOT = path.resolve(__dirname, '..'), BUILD = path.join(os.tmpdir(), 'rbevo', 'index.html'), SRC = path.join(ROOT, 'src', 'js', 'late', '99-zzzzzzzzzz-j2-cos-' + SET + '.js');
const EXE = process.env.CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!SET || !fs.existsSync(BUILD)) { console.log('usage: cos-preview.js <set> <out.jpg> [ids]; needs ' + BUILD); process.exit(2); }
const LOCK = path.join(os.tmpdir(), 'rbevo-lock'); fs.mkdirSync(LOCK, { recursive: true });
async function slot() { for (let n = 0; n < 2400; n++) { for (let i = 0; i < 4; i++) { const d = path.join(LOCK, 's' + i); try { fs.mkdirSync(d); return d; } catch (_) { try { if (Date.now() - fs.statSync(d).mtimeMs > 240000) fs.rmSync(d, { recursive: true, force: true }); } catch (_) {} } } await new Promise(r => setTimeout(r, 500)); } throw new Error('no preview slot'); }
(async () => {
  const lock = await slot();
  try {
    const b = await pw.chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--mute-audio'] }), c = await b.newContext({ viewport: { width: 1280, height: 720 } });
    await c.addInitScript(() => { localStorage.setItem('rbg_seen', '1'); localStorage.setItem('rbp', JSON.stringify({ v: 1, inv: { 1: 20 }, gems: 50000, own: { fist: 1 }, wp: 'fist', bar: [1], done: {}, xp: 3, lvl: 40, made: true, look: { skin: '#f6d2b0', hair: '#5a3a2a', style: 3, shirt: '#3c6fd1', pants: '#2b3a5a', shoes: '#222', hat: 0, gd: 1, eye: '#2277cc' } })); });
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 300))); p.on('console', m => { if (m.type() == 'error' && /COS1|art/.test(m.text())) errs.push(m.text().slice(0, 300)); });
    await p.goto('file:///' + BUILD.replace(/\\/g, '/'), { waitUntil: 'commit' }); await p.waitForFunction(() => window.RBDIAG && RBDIAG.ready && window.COS1, null, { timeout: 90000 }); await p.waitForTimeout(800);
    if (fs.existsSync(SRC)) { const e = await p.evaluate(code => { try { (0, eval)(code); return null; } catch (e) { return String(e && e.stack || e); } }, fs.readFileSync(SRC, 'utf8')); if (e) errs.push('art file: ' + e.slice(0, 400)); } else errs.push('no art file ' + SRC);
    const r = await p.evaluate(([SET, IDS, SC]) => {
      const C = COS1, list = (IDS || C.items.filter(i => i.set === SET).map(i => i.id)).map(id => C.byId.get(id)).filter(Boolean);
      const V = [['standing', {}], ['facing left', { f: -1 }], ['running', { vx: 220, t: .1 }], ['running', { vx: 220, t: .31 }], ['in the air', { air: true }], ['broad build', { gd: 0 }], ['slim build', { gd: 2 }], ['over gear', { gear: 1 }]];
      const cw = 230, ch = 250, o = document.createElement('canvas'); o.width = cw * V.length; o.height = ch * Math.max(1, list.length); const y = o.getContext('2d'); y.fillStyle = '#26203a'; y.fillRect(0, 0, o.width, o.height);
      const ms = []; const miss = [];
      list.forEach((it, row) => {
        if (!C.ART[it.id]) miss.push(it.id);
        V.forEach(([lab, v], col) => {
          const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const x = cv.getContext('2d'); x.fillStyle = col % 2 ? '#3a3256' : '#463d66'; x.fillRect(0, 0, cw, ch);
          const gd0 = cel.ap.gd, wear0 = wear; try { if (v.gd != null) cel.ap.gd = v.gd; if (v.gear) wear = Object.assign({}, wear, { hat: 'crown', body: 'plate' }); const t1 = performance.now(); C.preview(x, it, cw, ch, v.t || .5, { scale: SC, f: v.f || 1, vx: v.vx || 0, air: !!v.air }); ms.push(performance.now() - t1); } finally { cel.ap.gd = gd0; wear = wear0; }
          y.drawImage(cv, col * cw, row * ch); y.fillStyle = 'rgba(0,0,0,.6)'; y.fillRect(col * cw, row * ch, cw, 18); y.fillStyle = '#fff'; y.font = '12px monospace'; y.fillText((col ? '' : it.id + ' ') + lab, col * cw + 4, row * ch + 13);
        });
      });
      return { jpg: o.toDataURL('image/jpeg', .88).split(',')[1], n: list.length, miss, ms: Math.max(...ms, 0).toFixed(1) };
    }, [SET, IDS, SC]);
    fs.writeFileSync(OUT, Buffer.from(r.jpg, 'base64'));
    console.log('wrote', OUT, r.n, 'cosmetics; slowest draw', r.ms + 'ms' + (r.miss.length ? '; NO ART for: ' + r.miss.join(',') : ''));
    console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'no errors'); await b.close();
  } finally { fs.rmSync(lock, { recursive: true, force: true }); }
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
