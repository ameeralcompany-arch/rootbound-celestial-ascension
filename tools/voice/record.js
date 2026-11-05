#!/usr/bin/env node
'use strict';
// Records Lavi's voice lines with Kokoro, a free voice model (Apache licence) that runs on this PC. Nothing is sent anywhere.
//   input:  tools/voice/fairy-lines.json   { lines: { id: { text, say?, mood } } }. text is what the subtitle shows, say is what is spoken when it differs
//   output: audio/lavi/<id>.mp3, src/js/late/99-zzzzzzzzz-s5-lavi-voice.js (window.LAVIVOICE), tools/voice/manifest.json
// Lines whose spoken words and voice settings are unchanged are not recorded again. Changing only text or mood rewrites the data file without recording.
//
// The tools are not in the repo. One time only, in a folder of your choice (default %TEMP%\rbvoice):
//   npm init -y && npm install kokoro-js @breezystack/lamejs
// The first run downloads the voice model from Hugging Face (about 330 MB) into that folder.
//
//   node tools/voice/record.js                  record what changed
//   node tools/voice/record.js --trial          compare voices on three lines, measure them, write nothing to the repo
//   NODE_PATH=<playwright>/node_modules CHROMIUM=<chrome.exe> node tools/voice/record.js --verify    decode every mp3 in headless Chrome and check its length

// ---- the voice. One place to change it
const VOICE = { id: 'af_heart', speed: 1, lift: 1.03 };   // lift: pitch raised by resampling, at most 1.04 (also speeds the line up by the same factor)
const MOOD_SPEED = { excited: 1.03, sleepy: 0.94, thinking: 0.97, surprised: 1.02 };   // small changes of pace per mood; Kokoro itself has no emotion setting
const DTYPE = 'fp32', RATE = 24000, KBPS = 56, PEAK = 0.89, PAD_S = 0.15, ENV_HZ = 20;

const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const LINES = path.join(__dirname, 'fairy-lines.json'), MANIFEST = path.join(__dirname, 'manifest.json');
const OUT = path.join(ROOT, 'audio', 'lavi'), DATA = path.join(ROOT, 'src', 'js', 'late', '99-zzzzzzzzz-s5-lavi-voice.js');
const TOOLS = process.env.RBVOICE || path.join(process.env.TEMP || os.tmpdir(), 'rbvoice');
const mod = n => require('module').createRequire(path.join(TOOLS, 'x.js'))(n);

const spokenOf = l => (l.say != null ? l.say : l.text).replace(/,?\s*\{name\}/g, '').replace(/\s+/g, ' ').trim();
const hashOf = (spoken, mood) => crypto.createHash('sha1').update(JSON.stringify([spoken, VOICE, MOOD_SPEED[mood] || 1, DTYPE, RATE, KBPS, PEAK, PAD_S])).digest('hex').slice(0, 16);
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } };
const readLines = () => { const o = readJSON(LINES, null); if (!o || !o.lines) throw new Error('No lines in ' + LINES); return o.lines; };

// ---- the model
async function loadTTS() {
  const { KokoroTTS } = mod('kokoro-js');
  return KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: DTYPE, device: 'cpu' });
}
async function speak(tts, text, voice, speed) {
  const a = await tts.generate(text, { voice, speed });
  return { pcm: Float32Array.from(a.audio), rate: a.sampling_rate };
}

// ---- sound handling
function resample(x, f) {   // reads the sound f times faster, which lifts its pitch by f
  if (f === 1) return x;
  const n = Math.floor(x.length / f), o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = i * f, a = Math.floor(p), t = p - a; o[i] = x[a] * (1 - t) + (x[a + 1] || 0) * t; }
  return o;
}
function speechBounds(x, rate) {   // where the speech starts and ends: 10 ms windows against a level relative to the line's own loudness
  const w = Math.round(rate * 0.01), e = [];
  for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = 0; j < w; j++) s += x[i + j] * x[i + j]; e.push(Math.sqrt(s / w)); }
  const top = Math.max(...e, 1e-6), th = Math.max(top * 0.02, 0.0015);
  let a = 0, b = e.length - 1;
  while (a < b && e[a] < th) a++;
  while (b > a && e[b] < th) b--;
  return [a * w, (b + 1) * w];
}
function finish(x, rate) {   // about 150 ms of silence left at each end, short fades so nothing clicks, peak level the same on every line
  const [a, b] = speechBounds(x, rate), pad = Math.round(PAD_S * rate);
  const s = Math.max(0, a - pad), body = x.subarray(s, Math.min(x.length, b + pad));
  const o = new Float32Array(body.length + Math.max(0, pad - (a - s)));
  o.set(body, Math.max(0, pad - (a - s)));
  let peak = 0; for (const v of o) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0 ? PEAK / peak : 1, f = Math.round(rate * 0.012);
  for (let i = 0; i < o.length; i++) o[i] *= g;
  for (let i = 0; i < f && i < o.length; i++) { const k = i / f; o[i] *= k; o[o.length - 1 - i] *= k; }
  return { pcm: o, gain: g, rawPeak: peak };
}
function envelope(x, rate) {   // mouth openness, 20 times a second, one digit each. Square root so quiet syllables still move the lips
  const w = Math.round(rate / ENV_HZ), n = Math.ceil(x.length / w), e = new Array(n).fill(0);
  for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = i * w; j < Math.min(x.length, (i + 1) * w); j++) { s += x[j] * x[j]; c++; } e[i] = c ? Math.sqrt(s / c) : 0; }
  const top = Math.max(...e, 1e-6);
  return e.map(v => { const q = Math.sqrt(v / top); return q < 0.12 ? 0 : Math.min(9, Math.round(q * 9)); }).join('');
}
function syll(w) {   // syllable-ish weight of a word, so longer words take longer
  const t = w.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!t) return 0.5;
  if (/\d/.test(t)) return t.length * 1.3;
  const v = t.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, v ? v.length : 1) + t.length * 0.04;
}
function wordTimes(text, dur) {   // from the displayed text, {name} included but taking no time because the recording never says it
  const pad = Math.min(PAD_S, dur * 0.2), inner = Math.max(0.05, dur - pad * 2), toks = text.split(/\s+/).filter(Boolean);
  const wt = toks.map(w => /\{name\}/.test(w) ? { a: 0, p: 0 } : { a: syll(w), p: /[.!?…]["')]*$/.test(w) ? 1.3 : /[,;:—–]["')]*$/.test(w) ? 0.6 : 0 });
  const tot = wt.reduce((s, q, i) => s + q.a + (i < wt.length - 1 ? q.p : 0), 0) || 1;
  let t = 0; const out = [];
  toks.forEach((w, i) => { out.push([w, +(pad + t / tot * inner).toFixed(2)]); t += wt[i].a + wt[i].p; });
  return out;
}
let Mp3Encoder = null;
async function loadEncoder() { Mp3Encoder = (await import(require('url').pathToFileURL(path.join(TOOLS, 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js')).href)).Mp3Encoder; }
function encode(x) {
  const enc = new Mp3Encoder(1, RATE, KBPS), pcm = new Int16Array(x.length), chunks = [];
  for (let i = 0; i < x.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));
  for (let i = 0; i < pcm.length; i += 1152) { const b = enc.encodeBuffer(pcm.subarray(i, i + 1152)); if (b.length) chunks.push(Buffer.from(b)); }
  const e = enc.flush(); if (e.length) chunks.push(Buffer.from(e));
  return Buffer.concat(chunks);
}

// ---- measurements. Nobody can listen from here, so these catch what numbers can: cut-offs, clipping, wrong pace, a voice pitched too high
function measure(x, rate, chars) {
  let peak = 0, sum = 0, clip = 0;
  for (const v of x) { const a = Math.abs(v); peak = Math.max(peak, a); sum += v * v; if (a > 0.985) clip++; }
  const [a, b] = speechBounds(x, rate), secs = (b - a) / rate;
  // pitch: autocorrelation over voiced 40 ms frames, 110 to 500 Hz
  const fw = Math.round(rate * 0.04), lo = Math.floor(rate / 500), hi = Math.ceil(rate / 110), f0 = [];
  for (let i = a; i + fw + hi < b; i += fw) {
    let e0 = 0; for (let j = 0; j < fw; j++) e0 += x[i + j] * x[i + j];
    if (e0 / fw < 1e-4) continue;
    let best = 0, lag = 0;
    for (let L = lo; L <= hi; L++) { let c = 0, e1 = 0; for (let j = 0; j < fw; j++) { c += x[i + j] * x[i + j + L]; e1 += x[i + j + L] * x[i + j + L]; } c /= Math.sqrt(e0 * e1) || 1; if (c > best) { best = c; lag = L; } }
    if (best > 0.7 && lag) f0.push(rate / lag);
  }
  f0.sort((p, q) => p - q);
  // brightness: share of energy above 3 kHz, by a one-pole high-pass. Low means muffled, very high means hissy
  const rc = 1 / (2 * Math.PI * 3000), al = rc / (rc + 1 / rate); let hp = 0, prev = 0, hs = 0;
  for (const v of x) { hp = al * (hp + v - prev); prev = v; hs += hp * hp; }
  return { secs: +secs.toFixed(2), charsPerSec: +(chars / Math.max(.1, secs)).toFixed(1), peak: +peak.toFixed(3), rmsDb: +(10 * Math.log10(sum / x.length + 1e-12)).toFixed(1), clipped: clip, medianHz: f0.length ? Math.round(f0[f0.length >> 1]) : 0, highShare: +(hs / (sum || 1)).toFixed(3) };
}

// ---- writing the data file from what has been recorded, so it always matches the current text and mood
function writeData(lines, man) {
  const o = {};
  for (const id of Object.keys(lines)) { const m = man[id]; if (!m) continue; o[id] = { text: lines[id].text, mood: lines[id].mood || 'happy', dur: m.dur, env: m.env, words: wordTimes(lines[id].text, m.dur) }; }
  const body = '// ===== LAVIVOICE: generated by tools/voice/record.js, do not edit. What each of Lavi\'s recorded lines says, its length in seconds, its mouth movement (20 Hz, 0-9) and when each word starts. =====\n'
    + 'try{window.LAVIVOICE=' + JSON.stringify(o) + '}catch(e){console.error(\'LAVIVOICE\',e)}\n';
  fs.writeFileSync(DATA, body);
}

async function trial() {
  const lines = readLines(), ids = Object.keys(lines);
  const sample = ['hello', 'intro3', ids.find(i => spokenOf(lines[i]).length > 60) || ids[ids.length - 1]].filter(i => lines[i]);
  const tts = await loadTTS();
  console.log('voices available:', Object.keys(tts.voices).filter(v => /^(af|bf)_/.test(v)).join(' '));
  for (const v of ['af_heart', 'af_bella', 'af_nicole', 'af_sky', 'af_nova', 'bf_emma']) for (const sp of [1, 1.06]) {
    const r = [];
    for (const id of sample) { const s = spokenOf(lines[id]), g = await speak(tts, s, v, sp); r.push(measure(g.pcm, g.rate, s.length)); }
    const avg = k => +(r.reduce((a, q) => a + q[k], 0) / r.length).toFixed(k == 'highShare' ? 3 : 1);
    console.log(v.padEnd(10), 'speed', sp, 'pitch', avg('medianHz') + 'Hz', 'pace', avg('charsPerSec') + ' ch/s', 'level', avg('rmsDb') + 'dB', 'peak', Math.max(...r.map(q => q.peak)), 'clipped', r.reduce((a, q) => a + q.clipped, 0), 'high', avg('highShare'));
  }
}

async function verify() {
  const man = readJSON(MANIFEST, {}), lines = readLines();
  const { chromium } = require(path.join(process.env.NODE_PATH, 'playwright'));
  const b = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM, args: ['--no-sandbox', '--mute-audio'] });
  const p = await (await b.newContext()).newPage(); let bad = 0, total = 0, worst = 0;
  for (const id of Object.keys(lines)) {
    const f = path.join(OUT, id + '.mp3');
    if (!fs.existsSync(f) || !man[id]) { console.log('MISSING', id); bad++; continue; }
    const data = fs.readFileSync(f); total += data.length;
    const r = await p.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const c = new OfflineAudioContext(1, 24000, 24000); try { const a = await c.decodeAudioData(u.buffer), d = a.getChannelData(0); let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); return { dur: a.duration, peak: pk }; } catch (e) { return { err: String(e) }; } }, data.toString('base64'));
    const diff = r.err ? 9 : Math.abs(r.dur - man[id].dur); worst = Math.max(worst, r.err ? 0 : diff);
    if (r.err || diff > 0.15 || r.peak < 0.5) { console.log('FAIL', id, JSON.stringify(r), 'expected', man[id].dur); bad++; }
  }
  await b.close();
  const n = Object.keys(lines).length;
  console.log('verified', n - bad, 'of', n, '· worst length difference', worst.toFixed(3) + 's · total', (total / 1048576).toFixed(2), 'MB');
  process.exit(bad ? 1 : 0);
}

async function record() {
  if (VOICE.lift > 1.04) throw new Error('lift above 1.04 starts to sound unnatural');
  const lines = readLines();
  const man = readJSON(MANIFEST, {});
  fs.mkdirSync(OUT, { recursive: true });
  for (const id of Object.keys(man)) if (!lines[id]) { try { fs.unlinkSync(path.join(OUT, id + '.mp3')); } catch (_) {} delete man[id]; }
  const todo = Object.keys(lines).filter(id => { const l = lines[id]; return !man[id] || man[id].hash !== hashOf(spokenOf(l), l.mood) || !fs.existsSync(path.join(OUT, id + '.mp3')); });
  if (todo.length) {
    const tts = await loadTTS(); await loadEncoder(); let i = 0;
    for (const id of todo) {
      const l = lines[id], s = spokenOf(l), sp = VOICE.speed * (MOOD_SPEED[l.mood] || 1);
      let g = await speak(tts, s, VOICE.id, sp);
      if (g.rate !== RATE) throw new Error('Unexpected sample rate ' + g.rate);
      const lifted = resample(g.pcm, VOICE.lift), raw = measure(lifted, RATE, s.length), f = finish(lifted, RATE), mp3 = encode(f.pcm), dur = +(f.pcm.length / RATE).toFixed(2);
      fs.writeFileSync(path.join(OUT, id + '.mp3'), mp3);
      man[id] = { hash: hashOf(s, l.mood), spoken: s, dur, env: envelope(f.pcm, RATE), m: raw };
      fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 0));
      console.log(`${++i}/${todo.length} ${id} ${dur}s ${raw.charsPerSec}ch/s ${raw.medianHz}Hz clipped:${raw.clipped}`);
    }
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 0));
  writeData(lines, man);
  // a line far off the usual pace was probably cut short or stretched
  const ps = Object.keys(lines).map(id => man[id].m.charsPerSec).sort((a, b) => a - b), med = ps[ps.length >> 1];
  const odd = Object.keys(lines).filter(id => spokenOf(lines[id]).length >= 12 && (man[id].m.charsPerSec < med * 0.65 || man[id].m.charsPerSec > med * 1.45));
  let size = 0; for (const id of Object.keys(lines)) size += fs.statSync(path.join(OUT, id + '.mp3')).size;
  console.log('lines', Object.keys(lines).length, '· recorded now', todo.length, '· total', (size / 1048576).toFixed(2), 'MB · median pace', med, 'ch/s · odd pace:', odd.join(', ') || 'none');
}

const arg = process.argv[2];
(arg === '--trial' ? trial() : arg === '--verify' ? verify() : record()).catch(e => { console.error(e); process.exit(1); });
