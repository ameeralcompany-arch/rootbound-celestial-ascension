#!/usr/bin/env node
'use strict';
// Builds a class story movie's sound, from nothing but code, off-screen and silently (OfflineAudioContext in a headless browser).
//   node tools/movie/score.js reaper   (needs playwright and CHROMIUM, and the cues written by tools/movie/cues.js and the recordings from record.js)
// Writes audio/movie/<movie>/score.mp3 (music and sound effects: the game plays the voices over it, so they can follow the character) and %TEMP%/rbmovie/<movie>/mix.wav (everything, for the recording).
// Prints the loudness of each second, because a person has to judge how it sounds but the shape can at least be measured.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), os = require('os');
const MOVIE = process.argv[2] || 'reaper', ROOT = path.resolve(__dirname, '..', '..'), TMP = path.join(os.tmpdir(), 'rbmovie', MOVIE), OUT = path.join(ROOT, 'audio', 'movie', MOVIE);
const TOOLS = process.env.RBVOICE || path.join(os.tmpdir(), 'rbvoice');
const cues = JSON.parse(fs.readFileSync(path.join(__dirname, MOVIE + '-cues.json'), 'utf8'));
const engine = fs.readFileSync(path.join(__dirname, 'score-engine.txt'), 'utf8'), compose = fs.readFileSync(path.join(__dirname, 'score-' + MOVIE + '.txt'), 'utf8');
const files = {}; const gdId = (id) => id; for (const L of cues.lines) files[L.id] = fs.readFileSync(path.join(TMP, gdId(L.id) + '.wav')).toString('base64');
const script = `(async function(ARGS){ const {cues, files, novo}=ARGS; const STEM=null;
${engine}
const VOFF=[];
${compose}
// the voices, already placed in their rooms by record.js; the music dips under every line
const duckAt=[];
for (const L of cues.lines){ const bin=atob(files[L.id]), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i); const buf=await ac.decodeAudioData(u.buffer); const s=ac.createBufferSource(); s.buffer=buf; s.connect(vox); s.start(L.at); duckAt.push([L.at, L.at+buf.duration]); }
if(novo) vox.gain.value=0; else vox.gain.value=.95;
const d=duck.gain; d.setValueAtTime(1,0); duckAt.sort((a,b)=>a[0]-b[0]).forEach(([a,b])=>{ d.setTargetAtTime(.5,Math.max(0,a-.15),.08); d.setTargetAtTime(1,b+.02,.35); });
master.gain.setValueAtTime(1,TOTAL-2.2); master.gain.linearRampToValueAtTime(0,TOTAL-.05);
const r=await ac.startRendering(); const L=r.getChannelData(0),R=r.getChannelData(1); let pk=0; for(let i=0;i<L.length;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));
const g=pk>.891?.891/pk:1; const i16=new Int16Array(L.length*2); for(let i=0;i<L.length;i++){i16[i*2]=Math.max(-32768,Math.min(32767,Math.round(L[i]*g*32767)));i16[i*2+1]=Math.max(-32768,Math.min(32767,Math.round(R[i]*g*32767)))}
const sec=[]; for(let s=0;s<TOTAL;s++){let e=0;const a=s*SR,b=Math.min(L.length,a+SR);for(let i=a;i<b;i++)e+=(L[i]*g)**2;sec.push(Math.round(10*Math.log10(e/(b-a)+1e-12)))}
let bin='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=32768)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
return {b64:btoa(bin),sr:SR,peakBefore:pk,sec}; })`;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--no-sandbox', '--mute-audio'] }), p = await b.newPage(); await p.goto('about:blank');
  p.on('pageerror', e => console.log('ERR', e.message));
  for (const novo of [true]) {
    const t0 = Date.now(), r = await p.evaluate(`(${script})(${JSON.stringify({ cues, files, novo })})`);
    const pcm = Buffer.from(r.b64, 'base64');
    if (novo) { // the game's copy: stereo mp3
      const { Mp3Encoder } = await import(require('url').pathToFileURL(path.join(TOOLS, 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js')).href);
      const n = pcm.length / 4, LL = new Int16Array(n), RR = new Int16Array(n); for (let i = 0; i < n; i++) { LL[i] = pcm.readInt16LE(i * 4); RR[i] = pcm.readInt16LE(i * 4 + 2); }
      const e = new Mp3Encoder(2, r.sr, 112), ch = []; for (let i = 0; i < n; i += 1152) { const q = e.encodeBuffer(LL.subarray(i, i + 1152), RR.subarray(i, i + 1152)); if (q.length) ch.push(Buffer.from(q)); } const fin = e.flush(); if (fin.length) ch.push(Buffer.from(fin));
      fs.mkdirSync(TMP, { recursive: true }); fs.writeFileSync(path.join(TMP, 'score.pcm'), pcm); fs.writeFileSync(path.join(TMP, 'score.json'), JSON.stringify({ sr: r.sr })); fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'score.mp3'), Buffer.concat(ch)); console.log('score.mp3', (Buffer.concat(ch).length / 1048576).toFixed(1) + ' MB', 'took', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    } else {
      const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(r.sr, 24); h.writeUInt32LE(r.sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
      fs.mkdirSync(TMP, { recursive: true }); fs.writeFileSync(path.join(TMP, 'mix.wav'), Buffer.concat([h, pcm])); console.log('mix.wav', (pcm.length / 1048576).toFixed(1) + ' MB', 'took', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    console.log('dB per second:', r.sec.join(' '));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
