#!/usr/bin/env node
'use strict';
// Films the evolution cinematics frame by frame, off-screen, on a virtual clock (every frame exact, whatever the machine's speed), with their scores.
//   node tools/movie/evo-record.js <out.mp4> [class ...] [--build path/to/index.html]   (default: all 13 back to back, each with a different player look)
// Needs the scores' raw audio from tools/movie/evo-score.js (%TEMP%/rbmovie/evo/<class>.pcm) and an ffmpeg (FFMPEG, or Remotion's copy in ../rootbound-video).
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const pw = (() => { try { return require('playwright'); } catch (_) { return require(path.join(os.tmpdir(), 'rbpw', 'node_modules', 'playwright')); } })();
const ROOT = path.resolve(__dirname, '..', '..'), TMP = path.join(os.tmpdir(), 'rbmovie', 'evo'), FPS = 24;
const args = process.argv.slice(2), bi = args.indexOf('--build'), BUILD = bi >= 0 ? path.resolve(args[bi + 1]) : path.join(ROOT, 'index.html'); if (bi >= 0) args.splice(bi, 2);
const OUT = path.resolve(args.shift() || 'evolutions.mp4');
const ALL = ['knight', 'samurai', 'archer', 'mage', 'demon', 'elementalist', 'stormcaller', 'berserker', 'ninja', 'druid', 'gunslinger', 'brawler', 'reaper'], LIST = args.length ? args : ALL;
const FF = process.env.FFMPEG || path.resolve(ROOT, '..', 'rootbound-video', 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
const LOOKS = [{ skin: '#f6dcc8', hair: '#f0eef8', hs: 5, es: 1, eyeCol: '#8a5cff', gd: 1 }, { skin: '#f1c9a0', hair: '#2a1a14', hs: 0, es: 0, eyeCol: '#6a3a1a', gd: 0 }, { skin: '#8a5a3c', hair: '#d8342c', hs: 9, es: 3, eyeCol: '#2a9a6a', gd: 2 }, { skin: '#ffe4d0', hair: '#5ab0ff', hs: 3, es: 2, eyeCol: '#2277cc', gd: 1 }];
(async () => {
  // the sound: each class's score, one after another
  let sr = 48000; const parts = []; for (const k of LIST) { const f = path.join(TMP, k + '.pcm'); if (!fs.existsSync(f)) throw new Error('no score audio for ' + k + ': run tools/movie/evo-score.js first'); parts.push(fs.readFileSync(f)); sr = JSON.parse(fs.readFileSync(path.join(TMP, k + '.json'), 'utf8')).sr; }
  const pcm = Buffer.concat(parts), h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  const WAV = path.join(TMP, 'record-mix.wav'); fs.writeFileSync(WAV, Buffer.concat([h, pcm]));
  const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--mute-audio'] });
  const c = await b.newContext({ viewport: { width: 1920, height: 1080 } }); await c.addInitScript(() => { try { localStorage.setItem('rbg_seen', '1'); } catch (_) {} });
  const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() == 'error' && /EVC|FILM1|MOVIE1/.test(m.text())) console.log('C', m.text().slice(0, 300)); });
  await p.goto('file:///' + BUILD.replace(/\\/g, '/'), { waitUntil: 'commit' }); await p.waitForFunction(() => window.RBDIAG && RBDIAG.ready, null, { timeout: 90000 }); await new Promise(r => setTimeout(r, 2000));
  const ff = spawn(FF, ['-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-i', WAV, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'ignore', 'pipe'] });
  let ferr = ''; ff.stderr.on('data', d => { ferr = (ferr + d).slice(-1500); }); const fin = new Promise(r => ff.on('close', r));
  const t0 = Date.now(); let frames = 0;
  for (let j = 0; j < LIST.length; j++) {
    const k = LIST[j], dur = await p.evaluate(([k, look]) => { MOVIE1.play(k, { rec: 1, look, lowq: false }); return MOVIE1.state.dur; }, [k, LOOKS[j % LOOKS.length]]);
    const n = Math.round(dur * FPS);
    for (let i = 0; i < n; i++) { const d = await p.evaluate(T => { MOVIE1.seek(T); return MOVIE1.canvas().toDataURL('image/jpeg', .92).split(',')[1]; }, i / FPS); if (!ff.stdin.write(Buffer.from(d, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); frames++; }
    await p.evaluate(() => MOVIE1.finish('end')); console.log(k, 'filmed,', frames, 'frames so far,', ((Date.now() - t0) / 1000 | 0) + 's');
  }
  ff.stdin.end(); const code = await fin; console.log('ffmpeg', code, code ? ferr : '', OUT, (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB'); await b.close();
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
