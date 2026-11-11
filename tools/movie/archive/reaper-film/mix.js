#!/usr/bin/env node
'use strict';
// The full mix for a recording: the rendered score with every spoken line placed on top. (In the game the voices are separate files, so they can match the character.)
//   node tools/movie/mix.js reaper [f]   (f: the hero's second voice)   writes %TEMP%/rbmovie/<movie>/mix.wav
const fs = require('fs'), path = require('path'), os = require('os');
const MOVIE = process.argv[2] || 'reaper', FEM = process.argv[3] === 'f', TMP = path.join(os.tmpdir(), 'rbmovie', MOVIE);
const cues = JSON.parse(fs.readFileSync(path.join(__dirname, MOVIE + '-cues.json'), 'utf8')), { sr } = JSON.parse(fs.readFileSync(path.join(TMP, 'score.json'), 'utf8')), pcm = fs.readFileSync(path.join(TMP, 'score.pcm'));
const n = pcm.length / 4, L = new Float32Array(n), R = new Float32Array(n); for (let i = 0; i < n; i++) { L[i] = pcm.readInt16LE(i * 4) / 32768; R[i] = pcm.readInt16LE(i * 4 + 2) / 32768; }
for (const q of cues.lines) { const id = q.id + (FEM && q.id[0] === 'p' ? '_f' : ''), b = fs.readFileSync(path.join(TMP, id + '.wav')), r0 = b.readUInt32LE(24), m = (b.length - 44) / 2, at = Math.round(q.at * sr), f = r0 / sr; for (let i = 0; i < m / f; i++) { const p = i * f, a = Math.floor(p), t = p - a, v0 = a < m ? b.readInt16LE(44 + a * 2) : 0, v1 = a + 1 < m ? b.readInt16LE(44 + (a + 1) * 2) : 0, v = (v0 + (v1 - v0) * t) / 32768 * .95; if (at + i < n) { L[at + i] += v; R[at + i] += v; } } }
let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const g = pk > .97 ? .97 / pk : 1, out = Buffer.alloc(n * 4); for (let i = 0; i < n; i++) { out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), i * 4); out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), i * 4 + 2); }
const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + out.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(out.length, 40); fs.writeFileSync(path.join(TMP, 'mix.wav'), Buffer.concat([h, out]));
console.log('mix.wav', (out.length / 1048576).toFixed(1) + ' MB, peak', pk.toFixed(2), 'gain', g.toFixed(2));
