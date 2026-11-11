#!/usr/bin/env node
'use strict';
// Writes tools/movie/<movie>-cues.json from the movie as it stands in the built game: when each shot starts and when each line is spoken, so the score lands on the cuts.
//   node tools/movie/cues.js reaper [path to a built index.html]   (needs playwright and CHROMIUM)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const MOVIE = process.argv[2] || 'reaper', FILE = 'file:///' + path.resolve(process.argv[3] || path.join(__dirname, '..', '..', 'index.html')).replace(/\\/g, '/');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--no-sandbox', '--mute-audio'] }), c = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage();
  await p.addInitScript(() => { localStorage.setItem('rbg_seen', '1'); });
  await p.goto(FILE, { waitUntil: 'commit' }); await p.waitForFunction(() => window.RBDIAG && RBDIAG.ready, null, { timeout: 90000 });
  const o = await p.evaluate(k => { const d = MOVIE1.REG[k]; let a = 0; const C = [0], D = [0]; for (const s of d.shots) { C.push(+a.toFixed(3)); D.push(s.d); a += s.d; } return { total: +a.toFixed(3), C, D, reveal: d.reveal, lines: d.lines.map(l => ({ id: l.id, at: +l.at.toFixed(3), d: l.d })) }; }, MOVIE);
  fs.writeFileSync(path.join(__dirname, MOVIE + '-cues.json'), JSON.stringify(o)); console.log('total', o.total, 'shots', o.C.length - 1, 'lines', o.lines.length, 'reveal at', o.reveal.toFixed(1)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
