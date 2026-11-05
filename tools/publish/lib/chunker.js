// Splits a file into parts at places decided by its content (not by position), so inserting a few bytes near the start of a big file only changes the parts around
// the edit. Without this, one changed line in index.html would shift everything after it inside app.asar and every player would download the whole 30 MB again.
'use strict';
const fs = require('fs'), crypto = require('crypto');

const MIN = 256 * 1024, AVG_BITS = 20 /* about 1 MB */, MAX = 4 * 1024 * 1024;
const MASK = (1 << AVG_BITS) - 1;

// A fixed table: the same content must split the same way on every build.
const GEAR = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) t[i] = crypto.createHash('sha256').update('rootbound-gear-' + i).digest().readInt32LE(0);
  return t;
})();

// Calls onChunk(buffer) for each part, in order, for a whole file. Reads in big blocks; a part can span blocks.
async function chunkFile(file, onChunk) {
  const fh = await fs.promises.open(file, 'r');
  const BLOCK = 16 * 1024 * 1024;
  let carry = Buffer.alloc(0);
  try {
    for (;;) {
      const b = Buffer.allocUnsafe(BLOCK);
      const { bytesRead } = await fh.read(b, 0, BLOCK, null);
      const eof = bytesRead < BLOCK;
      const data = carry.length ? Buffer.concat([carry, b.subarray(0, bytesRead)]) : b.subarray(0, bytesRead);
      let start = 0;
      while (data.length - start >= MAX || (eof && start < data.length)) {
        const end = boundary(data, start);
        await onChunk(data.subarray(start, end));
        start = end;
      }
      carry = Buffer.from(data.subarray(start));
      if (eof) break;
    }
  } finally { await fh.close(); }
}

function boundary(data, start) {
  const limit = Math.min(data.length, start + MAX);
  let i = start + MIN;
  if (i >= limit) return limit;
  let h = 0;
  // warm the rolling hash up a little before the first possible cut
  for (let j = i - 64; j < i; j++) h = (h << 1) + GEAR[data[j]] | 0;
  for (; i < limit; i++) {
    h = (h << 1) + GEAR[data[i]] | 0;
    if ((h & MASK) === 0) return i + 1;
  }
  return limit;
}

module.exports = { chunkFile, boundary, MIN, MAX };
