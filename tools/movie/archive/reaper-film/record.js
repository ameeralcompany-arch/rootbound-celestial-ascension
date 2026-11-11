#!/usr/bin/env node
'use strict';
// Records a class story movie's spoken lines with Kokoro, the free voice model (Apache licence) that runs on this PC. Nothing is sent anywhere.
//   node tools/movie/record.js [reaper]
// input:  tools/movie/<movie>-lines.json
// output: audio/movie/<movie>/<id>.mp3 (and <id>_f.mp3 for the hero's second voice), %TEMP%/rbmovie/<movie>/<id>.wav for the film mix, src/js/late/99-zzzzzzzzzz-z5a-movievoice.js (window.MOVIEVOICE: length and mouth shapes)
// Each line gets its own direction: pace, deepening, level, a slight tremble, and the space it was spoken in. Kokoro has no Korean voices, so lines are in English.
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const MOVIE = process.argv[2] || 'reaper';
const ROOT = path.resolve(__dirname, '..', '..'), LINES = path.join(__dirname, MOVIE + '-lines.json'), OUT = path.join(ROOT, 'audio', 'movie', MOVIE), TMP = path.join(os.tmpdir(), 'rbmovie', MOVIE), DATA = path.join(ROOT, 'src', 'js', 'late', '99-zzzzzzzzzz-z5a-movievoice.js'), MAN = path.join(__dirname, 'manifest-' + MOVIE + '.json');
const TOOLS = process.env.RBVOICE || path.join(os.tmpdir(), 'rbvoice'), mod = n => require('module').createRequire(path.join(TOOLS, 'x.js'))(n);
const RATE = 24000, KBPS = 64, DTYPE = 'fp32';
function resample(x, f) { if (f === 1) return x; const n = Math.floor(x.length / f), o = new Float32Array(n); for (let i = 0; i < n; i++) { const p = i * f, a = Math.floor(p), t = p - a; o[i] = x[a] * (1 - t) + (x[a + 1] || 0) * t; } return o; }
function trim(x) { const w = Math.round(RATE * 0.01), e = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = 0; j < w; j++) s += x[i + j] * x[i + j]; e.push(Math.sqrt(s / w)); } const top = Math.max(...e, 1e-6), th = Math.max(top * 0.02, 0.0015); let a = 0, b = e.length - 1; while (a < b && e[a] < th) a++; while (b > a && e[b] < th) b--; const pad = Math.round(.12 * RATE); return x.slice(Math.max(0, a * w - pad), Math.min(x.length, (b + 1) * w + pad)); }
// one-pole filters, a small plate-like reverb, gentle saturation: enough to place a dry voice in a room
function hp(x, f) { const a = 1 / (1 + 2 * Math.PI * f / RATE), o = new Float32Array(x.length); let px = 0, py = 0; for (let i = 0; i < x.length; i++) { py = a * (py + x[i] - px); px = x[i]; o[i] = py; } return o; }
function lp(x, f) { const a = 1 - Math.exp(-2 * Math.PI * f / RATE), o = new Float32Array(x.length); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); o[i] = y; } return o; }
function reverb(x, sec, wet, damp, pre) { const tail = Math.round(RATE * sec), n = x.length + tail, out = new Float32Array(n), P = Math.round((pre || 0) * RATE), combs = [1116, 1188, 1277, 1356, 1422, 1491].map(d => Math.round(d * RATE / 44100)); const fb = Math.pow(.001, 1 / (sec * RATE / 1300));
  const wetBuf = new Float32Array(n); for (const d of combs) { const b = new Float32Array(d); let i = 0, s = 0; for (let t = 0; t < n; t++) { const inp = t >= P && t - P < x.length ? x[t - P] : 0, y = b[i]; s = y * (1 - damp) + s * damp; b[i] = inp + s * fb; i = (i + 1) % d; wetBuf[t] += y / combs.length; } }
  for (const d of [225, 341, 556].map(v => Math.round(v * RATE / 44100))) { const b = new Float32Array(d); let i = 0; for (let t = 0; t < n; t++) { const y = b[i], v = wetBuf[t]; b[i] = v + y * .5; wetBuf[t] = y - v * .5; i = (i + 1) % d; } }
  for (let t = 0; t < n; t++) out[t] = (t < x.length ? x[t] : 0) + wetBuf[t] * wet; return out; }
function direct(x, L, S) { let y = hp(x, 95); if (L.shake) { const f = 7.2, d = .1 + .28 * L.shake; for (let i = 0; i < y.length; i++) y[i] *= 1 - d * (.5 + .5 * Math.sin(2 * Math.PI * f * i / RATE + Math.sin(i / RATE * 2.3) * .8)); }
  if (S === 'memory') { y = lp(hp(y, 300), 3300); }
  // lift the presence a little, then even out the level
  { const b = hp(y, 2600); for (let i = 0; i < y.length; i++) y[i] += b[i] * .35; }
  let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); const g = pk ? .78 / pk : 1; for (let i = 0; i < y.length; i++) { const v = y[i] * g * 1.5; y[i] = Math.tanh(v) / Math.tanh(1.5) * .78; }
  const R = { close: [.5, .1, .55, 0], far: [2.0, .34, .5, .03], grove: [2.2, .28, .45, .02], void: [3.2, .26, .35, .04], memory: [1.6, .42, .55, .05] }[S] || [.5, .1, .55, 0];
  const o = reverb(y, R[0], R[1], R[2], R[3]); const gain = L.gain == null ? 1 : L.gain; for (let i = 0; i < o.length; i++) o[i] = Math.max(-.98, Math.min(.98, o[i] * gain)); let end = o.length; while (end > 0 && Math.abs(o[end - 1]) < .0006) end--; return o.slice(0, end + 200); }
function env(x) { const step = Math.round(RATE * .05); let out = '', top = 0; const a = []; for (let i = 0; i + step <= x.length; i += step) { let s = 0; for (let j = 0; j < step; j++) s += x[i + j] * x[i + j]; const r = Math.sqrt(s / step); a.push(r); top = Math.max(top, r); } for (const r of a) out += Math.min(9, Math.round(r / (top || 1) * 9)); return out; }
function wav(f, x) { const pcm = Buffer.alloc(x.length * 2); for (let i = 0; i < x.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), i * 2); const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40); fs.writeFileSync(f, Buffer.concat([h, pcm])); }
let Mp3Encoder;
function encode(x) { const enc = new Mp3Encoder(1, RATE, KBPS), pcm = new Int16Array(x.length), ch = []; for (let i = 0; i < x.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))); for (let i = 0; i < pcm.length; i += 1152) { const b = enc.encodeBuffer(pcm.subarray(i, i + 1152)); if (b.length) ch.push(Buffer.from(b)); } const e = enc.flush(); if (e.length) ch.push(Buffer.from(e)); return Buffer.concat(ch); }
const hashOf = (s, v, L) => crypto.createHash('sha1').update(JSON.stringify([s, v, L.speed, L.space, L.gain, L.shake, RATE, KBPS, 3])).digest('hex').slice(0, 16);
(async () => {
  const src = JSON.parse(fs.readFileSync(LINES, 'utf8')); let man = {}; try { man = JSON.parse(fs.readFileSync(MAN, 'utf8')); } catch (_) {}
  fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true });
  const jobs = []; for (const [id, L] of Object.entries(src.lines)) { jobs.push([id, L, src.voices[L.v]]); if (L.v === 'hero') jobs.push([id + '_f', L, src.voices.heroF]); }
  const todo = jobs.filter(([id, L, v]) => !man[id] || man[id].hash !== hashOf(L.say || L.text, v, L) || !fs.existsSync(path.join(OUT, id + '.mp3')) || !fs.existsSync(path.join(TMP, id + '.wav')));
  if (todo.length) { Mp3Encoder = (await import(require('url').pathToFileURL(path.join(TOOLS, 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js')).href)).Mp3Encoder;
    const { KokoroTTS } = mod('kokoro-js'), tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: DTYPE, device: 'cpu' });
    let n = 0; for (const [id, L, v] of todo) { const s = L.say || L.text, a = await tts.generate(s, { voice: v.voice, speed: L.speed || 1 }), x = direct(trim(resample(Float32Array.from(a.audio), v.lift || 1)), L, L.space); fs.writeFileSync(path.join(OUT, id + '.mp3'), encode(x)); wav(path.join(TMP, id + '.wav'), x); man[id] = { hash: hashOf(s, v, L), dur: +(x.length / RATE).toFixed(2), env: env(x) }; console.log(`${++n}/${todo.length} ${id} ${v.voice} ${man[id].dur}s`); }
    fs.writeFileSync(MAN, JSON.stringify(man, null, 1)); }
  // every movie's data lives in one small file
  let all = {}; try { all = JSON.parse(fs.readFileSync(path.join(__dirname, 'voice-data.json'), 'utf8')); } catch (_) {} const o = {}; for (const id of Object.keys(src.lines)) { const m = man[id], f = man[id + '_f']; o[id] = f ? { dur: Math.max(m.dur, f.dur), env: m.env, envf: f.env } : { dur: m.dur, env: m.env }; } all[MOVIE] = o; fs.writeFileSync(path.join(__dirname, 'voice-data.json'), JSON.stringify(all));
  fs.writeFileSync(DATA, '// ===== MOVIEVOICE: generated by tools/movie/record.js, do not edit. How long each spoken line of a class story movie runs and how open the mouth is, every 50 ms. =====\ntry{window.MOVIEVOICE=' + JSON.stringify(all) + '}catch(e){console.error(\'MOVIEVOICE\',e)}\n');
  console.log(MOVIE, 'lines', Object.keys(o).length, '· recorded now', todo.length);
})().catch(e => { console.error(e); process.exit(1); });
