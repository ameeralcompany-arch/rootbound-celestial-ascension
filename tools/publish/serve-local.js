#!/usr/bin/env node
// A small HTTPS file server with ranges, for testing the whole update path on one PC. Not for real players: it uses a self-made certificate.
//   node tools/publish/serve-local.js --dir build/local-host --port 8443
// As a module it can also misbehave on purpose (drop connections, corrupt bytes, answer 500), which is how the failure tests work.
'use strict';
const https = require('https'), fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');

const OPENSSL = () => {
  for (const c of ['openssl', 'C:/Program Files/Git/usr/bin/openssl.exe', 'C:/Program Files/Git/mingw64/bin/openssl.exe']) {
    const r = spawnSync(c, ['version'], { encoding: 'utf8' });
    if (r.status === 0) return c;
  }
  throw new Error('openssl was not found (it comes with Git for Windows)');
};

// A certificate for localhost, valid a year. Its own file doubles as the CA that test builds trust.
function makeCert(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const key = path.join(dir, 'localhost-key.pem'), cert = path.join(dir, 'localhost-cert.pem');
  if (!fs.existsSync(key) || !fs.existsSync(cert)) {
    const r = spawnSync(OPENSSL(), ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '365', '-keyout', key, '-out', cert, '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { encoding: 'utf8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1', MSYS2_ARG_CONV_EXCL: '*' }) });
    if (r.status !== 0) throw new Error('Could not make a certificate: ' + r.stderr);
  }
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert), certFile: cert };
}

const TYPES = { '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };

function serve({ dir, port = 0, cert }) {
  const root = path.resolve(dir);
  const stats = { requests: 0, bytes: 0, byPath: new Map(), rangeRequests: 0 };
  // faults(url, req) may return: null, or {status}, {dropAfter: bytes}, {corrupt: true}, {delayMs}, {stall: true}, {ignoreRange: true}
  const ctl = { fault: null, throttleBps: 0, stats, redirectAll: null };
  const srv = https.createServer({ key: cert.key, cert: cert.cert }, (req, res) => {
    stats.requests++;
    const url = decodeURIComponent(new URL(req.url, 'https://x').pathname);
    const full = path.join(root, ...url.split('/').filter(Boolean));
    stats.byPath.set(url, (stats.byPath.get(url) || 0) + 1);
    if (!full.startsWith(root)) { res.writeHead(403); return res.end(); }
    const f = ctl.fault ? ctl.fault(url, req) : null;
    if (f && f.status) { res.writeHead(f.status); return res.end('fault'); }
    if (f && f.stall) return;   // never answers
    let st;
    try { st = fs.statSync(full); } catch (_) { res.writeHead(404); return res.end('not found'); }
    if (!st.isFile()) { res.writeHead(404); return res.end('not found'); }
    let start = 0, end = st.size - 1, code = 200;
    const m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if (m && !(f && f.ignoreRange)) {
      stats.rangeRequests++;
      start = +m[1]; if (m[2]) end = Math.min(+m[2], end);
      if (start >= st.size) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
      code = 206;
    }
    const headers = { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream', 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' };
    if (code === 206) headers['Content-Range'] = `bytes ${start}-${end}/${st.size}`;
    res.writeHead(code, headers);
    if (req.method === 'HEAD') return res.end();
    const s = fs.createReadStream(full, { start, end, highWaterMark: 64 * 1024 });
    let sent = 0;
    s.on('data', chunk => {
      if (f && f.corrupt && sent === 0 && chunk.length > 10) { chunk = Buffer.from(chunk); chunk[5] ^= 0xff; }
      sent += chunk.length; stats.bytes += chunk.length;
      if (f && f.dropAfter !== undefined && sent >= f.dropAfter) { s.destroy(); res.destroy(); return; }
      const more = res.write(chunk);
      // one wait at a time: either the socket is full, or the test asked for a slow server
      if (!more) { s.pause(); res.once('drain', () => { if (ctl.throttleBps > 0) setTimeout(() => s.resume(), chunk.length / ctl.throttleBps * 1000); else s.resume(); }); }
      else if (ctl.throttleBps > 0) { s.pause(); setTimeout(() => s.resume(), chunk.length / ctl.throttleBps * 1000); }
    });
    s.on('end', () => res.end());
    s.on('error', () => res.destroy());
    res.on('close', () => s.destroy());
  });
  return new Promise(resolve => srv.listen(port, '127.0.0.1', () => resolve({ srv, ctl, port: srv.address().port, url: 'https://localhost:' + srv.address().port + '/', close: () => new Promise(r => { srv.closeAllConnections(); srv.close(r); }) })));
}

module.exports = { serve, makeCert };

if (require.main === module) {
  const a = process.argv.slice(2), val = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const dir = path.resolve(val('--dir', 'build/local-host')), port = +val('--port', 8443);
  fs.mkdirSync(dir, { recursive: true });
  const cert = makeCert(path.join(os.homedir(), '.rootbound-publish', 'localhost'));
  serve({ dir, port, cert }).then(s => console.log('Serving ' + dir + ' at ' + s.url + '\nCertificate: ' + cert.certFile));
}
