// HTTPS only, in every build. Redirects are followed by hand so that each hop is checked: a redirect to plain HTTP is refused.
'use strict';
const https = require('https');
const { abortError } = require('./util');

class NetError extends Error {
  constructor(msg, { retry = true, status = 0, code = 'NET' } = {}) { super(msg); this.retry = retry; this.status = status; this.code = code; }
}

function requireHttps(u) {
  let url;
  try { url = new URL(u); } catch (_) { throw new NetError('The address is not valid: ' + u, { retry: false, code: 'BAD_URL' }); }
  if (url.protocol !== 'https:') throw new NetError('Only secure (HTTPS) addresses are allowed', { retry: false, code: 'NOT_HTTPS' });
  return url;
}

class Http {
  // ca: extra trusted certificate, only used by test builds pointed at a local server.
  constructor({ ca = null, userAgent = 'RootboundLauncher', connectTimeoutMs = 20000, idleTimeoutMs = 30000 } = {}) {
    this.ca = ca; this.ua = userAgent; this.connectTimeoutMs = connectTimeoutMs; this.idleTimeoutMs = idleTimeoutMs;
    this.agent = new https.Agent({ keepAlive: true, maxSockets: 8, ca: ca || undefined });
  }

  // Resolves with the live response. The caller reads it and must destroy it on the way out.
  open(u, { start = 0, signal, maxRedirects = 6, noCache = false, headers = {} } = {}) {
    return new Promise((resolve, reject) => {
      let url;
      try { url = requireHttps(u); } catch (e) { return reject(e); }
      if (signal && signal.aborted) return reject(abortError());
      const h = Object.assign({ 'User-Agent': this.ua, Accept: '*/*' }, headers);
      if (start > 0) h.Range = 'bytes=' + start + '-';
      if (noCache) { h['Cache-Control'] = 'no-cache'; h.Pragma = 'no-cache'; }
      const req = https.request(url, { method: 'GET', agent: this.agent, headers: h, signal });
      req.setTimeout(this.connectTimeoutMs, () => req.destroy(new NetError('The server did not answer in time', { code: 'TIMEOUT' })));
      req.on('error', e => {
        if (e && (e.name === 'AbortError' || e.code === 'ABORT_ERR')) return reject(abortError());
        reject(e instanceof NetError ? e : new NetError(e.message || 'Network error', { code: e.code || 'NET' }));
      });
      req.on('response', res => {
        const st = res.statusCode;
        if (st >= 300 && st < 400 && res.headers.location) {
          res.resume();
          if (maxRedirects <= 0) return reject(new NetError('Too many redirects', { retry: false }));
          let next;
          try { next = new URL(res.headers.location, url).toString(); } catch (_) { return reject(new NetError('Bad redirect', { retry: false })); }
          return this.open(next, { start, signal, maxRedirects: maxRedirects - 1, noCache, headers }).then(resolve, reject);
        }
        if (st !== 200 && st !== 206) {
          res.resume();
          return reject(new NetError('The server answered ' + st, { status: st, retry: st === 404 || st === 408 || st === 416 || st === 429 || st >= 500 }));
        }
        res.setTimeout(this.idleTimeoutMs, () => res.destroy(new NetError('The download stalled', { code: 'STALLED' })));
        resolve(res);
      });
      req.end();
    });
  }

  // A small file, whole, in memory. Larger than maxBytes is an error: nobody can make the launcher fill memory.
  async getBytes(u, { maxBytes = 4 * 1024 * 1024, signal, noCache = false } = {}) {
    const res = await this.open(u, { signal, noCache });
    const chunks = []; let n = 0;
    try {
      for await (const b of res) {
        n += b.length;
        if (n > maxBytes) throw new NetError('The server sent more data than expected', { retry: false, code: 'TOO_BIG' });
        chunks.push(b);
      }
    } catch (e) {
      if (e instanceof NetError) throw e;
      if (e.name === 'AbortError' || e.code === 'ABORT_ERR') throw abortError();
      throw new NetError(e.message || 'Network error');
    } finally { res.destroy(); }
    return Buffer.concat(chunks);
  }

  async getJson(u, opts) {
    const b = await this.getBytes(u, opts);
    try { return JSON.parse(b.toString('utf8')); } catch (_) { throw new NetError('The server sent an unreadable file', { retry: true, code: 'BAD_JSON' }); }
  }

  close() { this.agent.destroy(); }
}

module.exports = { Http, NetError, requireHttps };
