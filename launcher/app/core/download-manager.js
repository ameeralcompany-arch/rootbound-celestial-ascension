// Download manager. Downloads a list of files with several connections at once, a shared speed limit, resuming through HTTP ranges, retries with growing
// waits, and a hash check on every file before it is accepted. A file that fails its hash is thrown away and fetched again.
'use strict';
const fs = require('./fsx'), fsp = fs.promises, path = require('path'), crypto = require('crypto'), { EventEmitter } = require('events');
const { sleep, isAbort, abortError, retryFs, sha256File, exists } = require('./util');
const { NetError } = require('./http');

// A shared bucket: every connection asks it before writing, so the limit holds across all of them and can change while downloading. 0 means no limit.
class RateLimiter {
  constructor(bytesPerSec = 0) { this.limit = bytesPerSec; this.tokens = 0; this.last = Date.now(); }
  set(bytesPerSec) { this.limit = bytesPerSec > 0 ? bytesPerSec : 0; }
  async take(n, signal) {
    let left = n;
    while (this.limit > 0 && left > 0) {
      const now = Date.now();
      // at most a fifth of a second can be saved up, so the limit holds from the first moment
      this.tokens = Math.min(this.limit * 0.2, this.tokens + (now - this.last) / 1000 * this.limit);
      this.last = now;
      if (this.tokens >= 1) { const use = Math.min(left, this.tokens); this.tokens -= use; left -= use; }
      if (left > 0) await sleep(Math.min(200, Math.max(10, left / this.limit * 1000)), signal);
    }
  }
}

class Speedometer {
  constructor(windowMs = 4000) { this.windowMs = windowMs; this.samples = []; this.bytes = 0; }
  add(n) { this.bytes += n; this.samples.push([Date.now(), this.bytes]); this.trim(); }
  trim() { const cut = Date.now() - this.windowMs; while (this.samples.length > 2 && this.samples[1][0] < cut) this.samples.shift(); }
  bytesPerSec() {
    this.trim();
    if (this.samples.length < 2) return 0;
    const [t0, b0] = this.samples[0];
    return Math.max(0, (this.bytes - b0) / Math.max(0.25, (Date.now() - t0) / 1000));
  }
  reset() { this.samples = []; this.bytes = 0; }
}

// items: [{url, dest, size, sha256}]. States: idle, running, paused, done, failed, canceled.
class DownloadJob extends EventEmitter {
  constructor({ http, items, concurrency = 4, limiter, maxAttempts = 6, backoffMs = 1000 }) {
    super();
    this.http = http; this.items = items; this.concurrency = concurrency;
    this.limiter = limiter || new RateLimiter(0);
    this.maxAttempts = maxAttempts; this.backoffMs = backoffMs;
    this.state = 'idle'; this.error = null; this.retries = 0;
    this.totalBytes = items.reduce((a, i) => a + i.size, 0);
    this.doneBytes = 0;             // bytes of files finished and verified
    this.progressById = new Map();  // bytes so far of files still in progress
    this.pending = []; this.speed = new Speedometer();
    this._ctl = null; this._finish = null; this._timer = null;
  }

  get downloadedBytes() { let n = this.doneBytes; for (const v of this.progressById.values()) n += v; return n; }

  snapshot() {
    const speed = this.state === 'running' ? this.speed.bytesPerSec() : 0, downloaded = Math.min(this.downloadedBytes, this.totalBytes), left = this.totalBytes - downloaded;
    return {
      state: this.state, downloaded, total: this.totalBytes, speed,
      percent: this.totalBytes ? downloaded / this.totalBytes * 100 : 100,
      eta: speed > 0 ? left / speed : null,
      filesDone: this.items.length - this.pending.length, filesTotal: this.items.length,
      retries: this.retries, error: this.error ? this.error.message : null,
    };
  }

  // Resolves when every file is verified; rejects if it fails or is canceled. While paused it just waits.
  run() {
    return new Promise((resolve, reject) => {
      this._finish = { resolve, reject };
      this._prepare().then(() => { if (this.state !== 'canceled') this._go(); }).catch(e => this._end(e));
    });
  }

  async _prepare() {
    this.pending = [];
    for (const it of this.items) {
      await fsp.mkdir(path.dirname(it.dest), { recursive: true });
      // already here and whole (from an earlier run): keep it, no download needed
      if (await exists(it.dest)) {
        const st = await fsp.stat(it.dest);
        if (st.size === it.size && (await sha256File(it.dest)) === it.sha256) { this.doneBytes += it.size; continue; }
        await fsp.rm(it.dest, { force: true });
      }
      let have = 0;
      try { have = (await fsp.stat(it.dest + '.part')).size; } catch (_) {}
      if (have > it.size) { await fsp.rm(it.dest + '.part', { force: true }); have = 0; }
      if (have) this.progressById.set(it, have);
      this.pending.push(it);
    }
  }

  _go() {
    this.state = 'running'; this.speed.reset();
    const run = new AbortController();
    this._ctl = run;
    this._emit();
    if (!this._timer) { this._timer = setInterval(() => this._emit(), 250); if (this._timer.unref) this._timer.unref(); }
    const queue = this.pending.slice();
    const worker = async () => {
      for (;;) {
        const it = queue.shift();
        if (!it) return;
        await this._downloadOne(it, run.signal);
        this.pending.splice(this.pending.indexOf(it), 1);
      }
    };
    const workers = [];
    for (let i = 0; i < Math.max(1, this.concurrency); i++) workers.push(worker());
    this._workersDone = Promise.allSettled(workers);
    Promise.all(workers).then(() => { if (this._ctl === run) this._end(null); }, e => {
      if (this._ctl !== run) return;   // paused or canceled in the meantime
      run.abort(); this._end(e);
    });
  }

  async _downloadOne(it, signal) {
    let attempt = 0;
    for (;;) {
      try { await this._fetchFile(it, signal); return; } catch (e) {
        if (isAbort(e) || signal.aborted) throw abortError();
        attempt++; this.retries++;
        this.emit('retry', { item: it, attempt, error: e });
        if ((e instanceof NetError && e.retry === false) || attempt >= this.maxAttempts) throw e;
        await sleep(this.backoffMs * Math.pow(2, attempt - 1) + Math.random() * 300, signal);
      }
    }
  }

  async _fetchFile(it, signal) {
    const part = it.dest + '.part';
    let have = 0;
    try { have = (await fsp.stat(part)).size; } catch (_) {}
    if (have > it.size) { await fsp.rm(part, { force: true }); have = 0; }
    let h = crypto.createHash('sha256');
    if (have) for await (const b of fs.createReadStream(part)) h.update(b);
    this.progressById.set(it, have);
    if (have < it.size) {
      const res = await this.http.open(it.url, { start: have, signal });
      let fh = null;
      try {
        // the server ignored the range and is sending the whole file: start the file over
        if (have > 0 && res.statusCode !== 206) { have = 0; h = crypto.createHash('sha256'); this.progressById.set(it, 0); }
        fh = await fsp.open(part, have > 0 ? 'a' : 'w');
        for await (const buf of res) {
          if (signal.aborted) throw abortError();
          if (have + buf.length > it.size) throw new NetError('The server sent more data than the manifest says', { code: 'OVERSIZE' });
          await this.limiter.take(buf.length, signal);
          await fh.write(buf);
          h.update(buf);
          have += buf.length;
          this.progressById.set(it, have);
          this.speed.add(buf.length);
        }
        await fh.sync();
      } catch (e) {
        if (isAbort(e) || signal.aborted || e.code === 'ABORT_ERR') throw abortError();
        // an oversize answer leaves a part file that can't be trusted to continue from
        if (e.code === 'OVERSIZE') { if (fh) { await fh.close().catch(() => {}); fh = null; } await fsp.rm(part, { force: true }).catch(() => {}); this.progressById.set(it, 0); }
        throw e instanceof NetError ? e : new NetError(e.message || 'The download failed', { code: e.code || 'NET' });
      } finally {
        if (fh) await fh.close().catch(() => {});
        res.destroy();
      }
    }
    const st = await fsp.stat(part);
    if (st.size !== it.size) throw new NetError('The download ended early (' + st.size + ' of ' + it.size + ' bytes)', { code: 'SHORT' });
    const got = h.digest('hex');
    if (got !== it.sha256) {
      await fsp.rm(part, { force: true });
      this.progressById.set(it, 0);
      this.emit('corrupt', { item: it, got });
      throw new NetError('A downloaded file was damaged; downloading it again', { code: 'BAD_HASH' });
    }
    await retryFs(() => fsp.rename(part, it.dest));
    this.progressById.delete(it);
    this.doneBytes += it.size;
    this.emit('file', it);
  }

  pause() {
    if (this.state !== 'running') return false;
    this.state = 'paused';
    const c = this._ctl; this._ctl = null; if (c) c.abort();
    this._emit(); return true;
  }
  resume() {
    if (this.state !== 'paused') return false;
    this.state = 'running';
    // old connections must have let go of their files before new ones open them
    Promise.resolve(this._workersDone).then(() => { if (this.state === 'running' && !this._ctl) this._go(); });
    return true;
  }
  cancel() {
    if (['done', 'failed', 'canceled'].includes(this.state)) return false;
    this.state = 'canceled';
    const c = this._ctl; this._ctl = null; if (c) c.abort();
    this._end(abortError()); return true;
  }

  async removeLeftovers() {
    await Promise.resolve(this._workersDone);
    for (const it of this.items) { await fsp.rm(it.dest + '.part', { force: true }).catch(() => {}); await fsp.rm(it.dest, { force: true }).catch(() => {}); }
  }

  _emit() { try { this.emit('progress', this.snapshot()); } catch (_) {} }

  _end(err) {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    if (!this._finish) return;
    const f = this._finish; this._finish = null;
    if (!err) { this.state = 'done'; this._emit(); f.resolve(); return; }
    if (this.state !== 'canceled') { this.state = 'failed'; this.error = err; }
    this._emit(); f.reject(err);
  }
}

module.exports = { DownloadJob, RateLimiter, Speedometer };
