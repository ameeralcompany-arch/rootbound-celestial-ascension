#!/usr/bin/env node
'use strict';
// Renders the evolution cinematics' scores, from nothing but code, off-screen and silently (OfflineAudioContext in a headless browser).
//   node tools/movie/evo-score.js [class ...] [--build path/to/index.html]   (default: all 13, read from the built game)
// Shot starts and impact times come from the cinematics themselves (MOVIE1.REG[k].shots and .hits), so the music lands on the cuts.
// Writes audio/movie/evo/<class>.mp3 for the game and %TEMP%/rbmovie/evo/<class>.pcm for recordings. Prints the loudness of each second.
const fs = require('fs'), path = require('path'), os = require('os');
const pw = (() => { try { return require('playwright'); } catch (_) { return require(path.join(os.tmpdir(), 'rbpw', 'node_modules', 'playwright')); } })();
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'audio', 'movie', 'evo'), TMP = path.join(os.tmpdir(), 'rbmovie', 'evo');
const TOOLS = process.env.RBVOICE || path.join(os.tmpdir(), 'rbvoice');
const args = process.argv.slice(2), bi = args.indexOf('--build'), BUILD = bi >= 0 ? path.resolve(args[bi + 1]) : path.join(ROOT, 'index.html'); if (bi >= 0) args.splice(bi, 2);
const ALL = ['knight', 'samurai', 'archer', 'mage', 'demon', 'elementalist', 'stormcaller', 'berserker', 'ninja', 'druid', 'gunslinger', 'brawler', 'reaper'], LIST = args.length ? args : ALL;
const engine = fs.readFileSync(path.join(__dirname, 'score-engine.txt'), 'utf8'), compose = fs.readFileSync(path.join(__dirname, 'score-evo.txt'), 'utf8');
const script = `(async function(ARGS){ const {cues, cls}=ARGS; const STEM=null;
${engine}
${compose}
master.gain.setValueAtTime(1,TOTAL-1.0); master.gain.linearRampToValueAtTime(0,TOTAL-.04);
const r=await ac.startRendering(); const L=r.getChannelData(0),R=r.getChannelData(1); let pk=0; for(let i=0;i<L.length;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));
const g=pk>.891?.891/pk:1; const i16=new Int16Array(L.length*2); for(let i=0;i<L.length;i++){i16[i*2]=Math.max(-32768,Math.min(32767,Math.round(L[i]*g*32767)));i16[i*2+1]=Math.max(-32768,Math.min(32767,Math.round(R[i]*g*32767)))}
const sec=[]; for(let s=0;s<Math.ceil(TOTAL);s++){let e=0;const a=s*SR,b=Math.min(L.length,a+SR);for(let i=a;i<b;i++)e+=(L[i]*g)**2;sec.push(Math.round(10*Math.log10(e/Math.max(1,b-a)+1e-12)))}
let bin='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=32768)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
return {b64:btoa(bin),sr:SR,peakBefore:pk,sec}; })`;
(async () => {
  const { Mp3Encoder } = await import(require('url').pathToFileURL(path.join(TOOLS, 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js')).href);
  const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--mute-audio'] });
  const c = await b.newContext(); await c.addInitScript(() => { try { localStorage.setItem('rbg_seen', '1'); } catch (_) {} }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file:///' + BUILD.replace(/\\/g, '/'), { waitUntil: 'commit' }); await p.waitForFunction(() => window.RBDIAG && RBDIAG.ready, null, { timeout: 90000 });
  const CUES = await p.evaluate(L => { const o = {}; for (const k of L) { const d = MOVIE1.REG[k]; if (!d) continue; let a = 0; const C = [0]; for (const s of d.shots) { C.push(+a.toFixed(3)); a += s.d; } o[k] = { total: +a.toFixed(3), C, hits: d.hits || [], lines: [] }; } return o; }, LIST);
  await p.goto('about:blank'); fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });
  for (const k of LIST) {
    if (!CUES[k]) { console.log(k, 'has no cinematic in', BUILD); continue; }
    const t0 = Date.now(), r = await p.evaluate(`(${script})(${JSON.stringify({ cues: CUES[k], cls: k })})`), pcm = Buffer.from(r.b64, 'base64'), n = pcm.length / 4, LL = new Int16Array(n), RR = new Int16Array(n);
    for (let i = 0; i < n; i++) { LL[i] = pcm.readInt16LE(i * 4); RR[i] = pcm.readInt16LE(i * 4 + 2); }
    const e = new Mp3Encoder(2, r.sr, 128), ch = []; for (let i = 0; i < n; i += 1152) { const q = e.encodeBuffer(LL.subarray(i, i + 1152), RR.subarray(i, i + 1152)); if (q.length) ch.push(Buffer.from(q)); } const fin = e.flush(); if (fin.length) ch.push(Buffer.from(fin));
    const mp3 = Buffer.concat(ch); fs.writeFileSync(path.join(OUT, k + '.mp3'), mp3); fs.writeFileSync(path.join(TMP, k + '.pcm'), pcm); fs.writeFileSync(path.join(TMP, k + '.json'), JSON.stringify({ sr: r.sr }));
    console.log(k.padEnd(13), (mp3.length / 1024 | 0) + ' KB', ((Date.now() - t0) / 1000 | 0) + 's', 'peak', r.peakBefore.toFixed(2), 'hits', CUES[k].hits.join(','), '| dB/s', r.sec.join(' '));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
