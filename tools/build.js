#!/usr/bin/env node
// Assembles index.html from src/. Same result as tools/build.py, for computers without Python (the publishing tool uses this one). Usage: node tools/build.js
'use strict';
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
const cat = (dir, ext, banner) => fs.readdirSync(path.join(R, dir)).filter(f => f.endsWith(ext)).sort().map(f => `\n/* ========== ${banner}: ${f} ========== */\n` + rd(path.join(dir, f))).join('');
let s = rd('src/legacy.html');
const swap = (k, v) => { if (s.split(k).length !== 2) throw new Error('marker ' + k); s = s.split(k).join(v); };
swap('<!--@@BOOT@@-->', rd('src/boot/boot.html'));
swap('/*@@CSS@@*/', cat('src/css', '.css', 'CSS'));
swap('<!--@@HTML@@-->', cat('src/html', '.html', 'HTML'));
swap('/*@@EARLY@@*/', cat('src/js/early', '.js', 'EARLY'));
swap('/*@@LATE@@*/', cat('src/js/late', '.js', 'LATE'));
swap('/*@@CATALOG@@*/{items:[]}', rd('server/catalog.json').split('</').join('<\\/'));
swap('/*@@NEWBLOCKS@@*/[]', rd('tools/new-blocks.json').split('</').join('<\\/'));
fs.writeFileSync(path.join(R, 'index.html'), s);
const scripts = [...s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)];
let bad = 0;
scripts.forEach((x, i) => { try { new Function(x[1]); } catch (e) { bad++; console.log('syntax error in script', i, e.message); } });
console.log('built index.html', s.length, 'bytes;', scripts.length, 'inline scripts,', bad, 'syntax errors');
if (bad) process.exit(1);
