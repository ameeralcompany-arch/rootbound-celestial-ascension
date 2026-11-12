#!/usr/bin/env node
'use strict';
// Renders the login screen's music from code (tools/movie/score-login.txt), off-screen and silently, as a seamless loop: it plays four seconds past the
// end and folds them back over the start. Writes audio/login/theme.mp3.   node tools/movie/login-score.js
const fs = require('fs'), path = require('path'), os = require('os');
const pw = (() => { try { return require('playwright'); } catch (_) { return require(path.join(os.tmpdir(), 'rbpw', 'node_modules', 'playwright')); } })();
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'audio', 'login'), TOOLS = process.env.RBVOICE || path.join(os.tmpdir(), 'rbvoice');
const LOOP = 64, TAIL = 4;
const engine = fs.readFileSync(path.join(__dirname, 'score-engine.txt'), 'utf8'), compose = fs.readFileSync(path.join(__dirname, 'score-login.txt'), 'utf8');
const script = `(async function(ARGS){ const {cues}=ARGS; const STEM=null;
${engine}
${compose}
const r=await ac.startRendering(); const L=r.getChannelData(0),R=r.getChannelData(1),N=Math.round(${LOOP}*SR),X=Math.round(${TAIL}*SR);
// fold the tail over the head with an equal-power crossfade, so the loop point is seamless
for(let i=0;i<X;i++){const k=i/X,a=Math.cos(k*Math.PI/2),b=Math.sin(k*Math.PI/2);L[i]=L[i]*b+L[N+i]*a;R[i]=R[i]*b+R[N+i]*a}
let pk=0;for(let i=0;i<N;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const g=.62/Math.max(pk,1e-4);
const i16=new Int16Array(N*2);for(let i=0;i<N;i++){i16[i*2]=Math.round(Math.max(-1,Math.min(1,L[i]*g))*32767);i16[i*2+1]=Math.round(Math.max(-1,Math.min(1,R[i]*g))*32767)}
const sec=[];for(let s=0;s<${LOOP};s+=4){let e=0;const a=s*SR,b=Math.min(N,a+4*SR);for(let i=a;i<b;i++)e+=(L[i]*g)**2;sec.push(Math.round(10*Math.log10(e/(b-a)+1e-12)))}
let bin='';const u8=new Uint8Array(i16.buffer);for(let i=0;i<u8.length;i+=32768)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
return {b64:btoa(bin),sr:SR,pk,sec}; })`;
(async () => {
  const { Mp3Encoder } = await import(require('url').pathToFileURL(path.join(TOOLS, 'node_modules', '@breezystack', 'lamejs', 'dist', 'lamejs.js')).href);
  const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--mute-audio'] }), p = await b.newPage(); await p.goto('about:blank');
  const t0 = Date.now(), r = await p.evaluate(`(${script})(${JSON.stringify({ cues: { total: LOOP + TAIL, C: [0], hits: [], lines: [] } })})`), pcm = Buffer.from(r.b64, 'base64'), n = pcm.length / 4, LL = new Int16Array(n), RR = new Int16Array(n);
  for (let i = 0; i < n; i++) { LL[i] = pcm.readInt16LE(i * 4); RR[i] = pcm.readInt16LE(i * 4 + 2); }
  const e = new Mp3Encoder(2, r.sr, 112), ch = []; for (let i = 0; i < n; i += 1152) { const q = e.encodeBuffer(LL.subarray(i, i + 1152), RR.subarray(i, i + 1152)); if (q.length) ch.push(Buffer.from(q)); } const fin = e.flush(); if (fin.length) ch.push(Buffer.from(fin));
  fs.mkdirSync(OUT, { recursive: true }); const mp3 = Buffer.concat(ch); fs.writeFileSync(path.join(OUT, 'theme.mp3'), mp3);
  console.log('theme.mp3', (mp3.length / 1024 | 0) + ' KB', ((Date.now() - t0) / 1000 | 0) + 's', 'peak', r.pk.toFixed(2), '| dB per 4 s', r.sec.join(' '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
