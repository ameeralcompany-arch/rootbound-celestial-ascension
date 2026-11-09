#!/usr/bin/env node
'use strict';
// Records the Japanese battle callouts with Kokoro's own Japanese voices (Apache licence), on this PC. Each class has one voice, its own pitch and pace. The reading comes from the romaji in SKDATA, so what is said is exactly what the subtitle says.
//   input:  src/js/late/99-zzzzzzzzzz-w-skilldata.js
//   output: audio/battle/<class>_<slot>.mp3
// Tools (not in the repo): see record.js. node tools/voice/record-battle.js [--only knight] [--force]
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'audio', 'battle');
const TOOLS = process.env.RBVOICE || path.join(process.env.TEMP || os.tmpdir(), 'rbvoice');
const mod = n => require('module').createRequire(path.join(TOOLS, 'x.js'))(n);
const RATE = 24000, KBPS = 64, PEAK = 0.9, PAD = 0.04;
// voice, pitch lift (also quickens the line), speaking speed
const CLASS_VOICE = {
  brawler: ['jm_kumo', 1.08, 1.12], knight: ['jm_kumo', 0.95, 0.94], samurai: ['jm_kumo', 1.0, 0.86], archer: ['jf_alpha', 1.03, 1.04],
  mage: ['jf_gongitsune', 0.98, 0.9], demon: ['jf_nezumi', 0.92, 0.9], reaper: ['jm_kumo', 0.86, 0.8], elementalist: ['jf_tebukuro', 1.06, 1.0],
  stormcaller: ['jm_kumo', 1.13, 1.14], berserker: ['jm_kumo', 0.8, 1.0], ninja: ['jf_nezumi', 1.12, 1.22], druid: ['jf_gongitsune', 1.05, 0.95], gunslinger: ['jf_alpha', 0.9, 1.08],
};
// romaji to the sounds Kokoro's Japanese voices use
function phonemes(ro) {
  let s = ro.toLowerCase().replace(/ō/g, 'ou').replace(/,/g, ' , ');
  const out = [];
  for (const word of s.split(/\s+/).filter(Boolean)) {
    if (word === ',') { out.push(','); continue; }
    let w = word, p = '';
    const V = 'aiueo';
    for (let i = 0; i < w.length;) {
      const c = w[i], n = w[i + 1] || '', n2 = w[i + 2] || '';
      if (c === "'") { i++; continue; }
      if (V.includes(c)) {
        const v = c === 'u' ? 'ɯ' : c;
        if ((c === 'o' && n === 'u') || (c === n)) { p += v + 'ː'; i += 2; continue; }
        p += v; i++; continue;
      }
      if (c === n && c !== 'n') { p += 'ʔ'; i++; continue; }           // small tsu
      if (c === 'n' && (!n || (!V.includes(n) && n !== 'y' && n !== "'"))) { p += 'ɴ'; i++; continue; }
      if (c === 'n' && n === "'") { p += 'ɴ'; i += 2; continue; }
      if (c === 's' && n === 'h') { p += 'ɕ'; i += 2; continue; }
      if (c === 'c' && n === 'h') { p += 'ʨ'; i += 2; continue; }
      if (c === 't' && n === 's') { p += 'ʦ'; i += 2; continue; }
      if (c === 'f') { p += 'ɸ'; i++; continue; }
      if (c === 'j') { p += 'ʥ'; i++; continue; }
      if (c === 'r') { p += 'ɾ'; i++; continue; }
      if (c === 'h' && n === 'i') { p += 'ç'; i++; continue; }
      if (c === 'g' || c === 'k' || c === 's' || c === 't' || c === 'd' || c === 'z' || c === 'h' || c === 'b' || c === 'p' || c === 'm' || c === 'n' || c === 'w') {
        p += c; i++; if (n === 'y') { p += 'j'; i++; } void n2; continue;
      }
      if (c === 'y') { p += 'j'; i++; continue; }
      i++;
    }
    out.push(p);
  }
  return out.join(' ');
}
function resample(x, f) { if (f === 1) return x; const n = Math.floor(x.length / f), o = new Float32Array(n); for (let i = 0; i < n; i++) { const p = i * f, a = Math.floor(p), t = p - a; o[i] = x[a] * (1 - t) + (x[a + 1] || 0) * t; } return o; }
function bounds(x) { const w = Math.round(RATE * .01), e = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = 0; j < w; j++) s += x[i + j] * x[i + j]; e.push(Math.sqrt(s / w)); } const top = Math.max(...e, 1e-6), th = Math.max(top * .03, .002); let a = 0, b = e.length - 1; while (a < b && e[a] < th) a++; while (b > a && e[b] < th) b--; return [a * w, (b + 1) * w]; }
function finish(x) { const [a, b] = bounds(x), pad = Math.round(PAD * RATE), body = x.subarray(Math.max(0, a - pad), Math.min(x.length, b + pad)), o = Float32Array.from(body); let pk = 0; for (const v of o) pk = Math.max(pk, Math.abs(v)); const g = pk > 0 ? PEAK / pk : 1, f = Math.round(RATE * .008); for (let i = 0; i < o.length; i++) o[i] *= g; for (let i = 0; i < f && i < o.length; i++) { const k = i / f; o[i] *= k; o[o.length - 1 - i] *= k; } return o; }
let Mp3Encoder = null;
async function encodeTo(file, x) { if (!Mp3Encoder) Mp3Encoder = (await import(require('url').pathToFileURL(path.join(TOOLS, 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js')).href)).Mp3Encoder; const enc = new Mp3Encoder(1, RATE, KBPS), pcm = new Int16Array(x.length), parts = []; for (let i = 0; i < x.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))); for (let i = 0; i < pcm.length; i += 1152) { const b = enc.encodeBuffer(pcm.subarray(i, i + 1152)); if (b.length) parts.push(Buffer.from(b)); } const e = enc.flush(); if (e.length) parts.push(Buffer.from(e)); fs.writeFileSync(file, Buffer.concat(parts)); }
function lines() {
  const src = fs.readFileSync(path.join(ROOT, 'src/js/late/99-zzzzzzzzzz-w-skilldata.js'), 'utf8');
  const window = {}; new Function('window', src)(window);
  const D = window.SKDATA, out = [];
  for (const c in D.CLASS) D.CLASS[c].forEach((r, i) => out.push({ file: `${c}_c${i}`, cls: c, ro: r[6], ult: 0 }));
  for (const c in D.WEAPON) { const W = D.WEAPON[c]; for (const s of ['r1', 'r2', 'l1', 'l2']) out.push({ file: `${c}_${s}`, cls: c, ro: W[s][6], ult: 0 }); W.m.forEach((r, i) => out.push({ file: `${c}_m${i}`, cls: c, ro: r[6], ult: i == 4 })); }
  return out;
}
(async () => {
  const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null, force = process.argv.includes('--force');
  fs.mkdirSync(OUT, { recursive: true });
  const { KokoroTTS } = mod('kokoro-js');
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
  let n = 0, total = 0, longest = 0;
  for (const L of lines()) {
    if (only && L.cls !== only) continue;
    const f = path.join(OUT, L.file + '.mp3');
    if (fs.existsSync(f) && !force) { total += fs.statSync(f).size; continue; }
    const [voice, lift, speed] = CLASS_VOICE[L.cls], ph = phonemes(L.ro) + '!';
    const { input_ids } = tts.tokenizer(ph, { truncation: true });
    const a = await tts.generate_from_ids(input_ids, { voice, speed: L.ult ? speed * .92 : speed });
    const pcm = finish(resample(Float32Array.from(a.audio), lift));
    await encodeTo(f, pcm);
    const d = pcm.length / RATE; longest = Math.max(longest, d); total += fs.statSync(f).size; n++;
    if (n % 20 == 1) console.log(L.file, ph, d.toFixed(2) + 's');
  }
  console.log('recorded', n, 'lines; total', Math.round(total / 1024), 'KB; longest', longest.toFixed(2), 's');
})().catch(e => { console.error(e); process.exit(1); });
