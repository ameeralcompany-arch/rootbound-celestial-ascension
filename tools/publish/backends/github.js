// Storage backend: GitHub Releases on this repository. Free, HTTPS, a CDN in front, and the project already ships from there. One release (tag "updates" by default) holds the
// small files everyone reads: latest.json, news.json, manifests, launcher files. Game parts go in numbered releases beside it, because a release may hold at most 1000 files.
// The token comes from the GITHUB_TOKEN environment variable or `gh auth token`. It is never stored anywhere by this tool.
'use strict';
const https = require('https'), http = require('http'), fs = require('fs'), { execFileSync } = require('child_process');

const PER_RELEASE = 900;

function getToken() {
  if (process.env.RB_GITHUB_TOKEN) return process.env.RB_GITHUB_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try { return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (_) { return ''; }
}

module.exports = function githubBackend(conf, publicUrl, creds, opts = {}) {
  const repo = conf.repo, mainTag = conf.tag || 'updates', chunkPrefix = conf.chunkTagPrefix || 'updates-parts-';
  const apiHost = opts.apiBase || 'https://api.github.com', uploadHost = opts.uploadBase || 'https://uploads.github.com', downloadBase = opts.downloadBase || ('https://github.com/' + repo + '/releases/download/');
  const token = (creds && creds.githubToken) || getToken();
  if (!token) throw new Error('GitHub storage needs a sign-in. Run "gh auth login" once, or set GITHUB_TOKEN.');

  function call(method, url, body, headers = {}) {
    const u = new URL(url), lib = u.protocol === 'https:' ? https : http;
    return new Promise((resolve, reject) => {
      const h = Object.assign({ Authorization: 'Bearer ' + token, 'User-Agent': 'rootbound-publish', Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, headers);
      if (body) h['Content-Length'] = body.length;
      const req = lib.request(u, { method, headers: h, rejectUnauthorized: !opts.insecureForTests, timeout: 300000 }, res => {
        const c = []; res.on('data', d => c.push(d));
        res.on('end', () => { const b = Buffer.concat(c).toString(); let j = null; try { j = JSON.parse(b); } catch (_) {} resolve({ status: res.statusCode, json: j, body: b }); });
      });
      req.on('timeout', () => req.destroy(new Error('GitHub did not answer in time')));
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }
  // GitHub has bad moments, and a publish makes hundreds of calls: try again on anything that isn't the caller's fault
  const retryable = r => r.status >= 500 || r.status === 429 || (r.status === 403 && /rate limit/i.test(r.body));
  async function callRetry(method, url, body, headers) {
    let last;
    for (let i = 0; i < (opts.attempts || 6); i++) {
      if (i) await new Promise(res => setTimeout(res, (opts.retryMs === undefined ? 2000 : opts.retryMs) * Math.pow(2, i - 1)));
      try {
        last = await call(method, url, body, headers);
        if (!retryable(last)) return last;
      } catch (e) { last = { status: 0, body: e.message, json: null }; }
    }
    return last;
  }
  async function api(method, p, obj, okStatuses = [200, 201, 204]) {
    const r = await callRetry(method, apiHost + p, obj ? Buffer.from(JSON.stringify(obj)) : null, obj ? { 'Content-Type': 'application/json' } : {});
    if (!okStatuses.includes(r.status)) throw new Error('GitHub said ' + r.status + ' for ' + method + ' ' + p + ': ' + r.body.slice(0, 300));
    return r;
  }

  const releases = new Map();   // tag -> {id, upload_url, assets: Map(name -> id)}
  async function listAssets(id) {
    const m = new Map();
    for (let page = 1; ; page++) {
      const r = await api('GET', `/repos/${repo}/releases/${id}/assets?per_page=100&page=${page}`);
      for (const a of r.json) {
        // an upload that was cut off leaves an asset nobody can download: it doesn't count, and it would block the retry
        if (a.state && a.state !== 'uploaded') await api('DELETE', `/repos/${repo}/releases/assets/${a.id}`);
        else m.set(a.name, a.id);
      }
      if (r.json.length < 100) return m;
    }
  }
  async function release(tag, create = true) {
    if (releases.has(tag)) return releases.get(tag);
    let r = await api('GET', `/repos/${repo}/releases/tags/${tag}`, null, [200, 404]);
    if (r.status === 404) {
      if (!create) return null;
      r = await api('POST', `/repos/${repo}/releases`, { tag_name: tag, name: 'Rootbound launcher files (' + tag + ')', body: 'Files read by the Rootbound launcher. Published by tools/publish/publish-update.js. Players do not need to download anything here.', prerelease: true, make_latest: 'false' });
    }
    const rec = { id: r.json.id, tag, assets: await listAssets(r.json.id) };
    releases.set(tag, rec);
    return rec;
  }
  const assetName = key => key.replace(/\//g, '-');
  async function uploadTo(rec, name, buf, type) {
    const url = uploadHost + `/repos/${repo}/releases/${rec.id}/assets?name=${encodeURIComponent(name)}`;
    let r = await callRetry('POST', url, buf, { 'Content-Type': type || 'application/octet-stream' });
    // a retry can find what a failed try left behind
    if (r.status === 422) {
      rec.assets = await listAssets(rec.id);
      if (rec.assets.has(name)) await api('DELETE', `/repos/${repo}/releases/assets/${rec.assets.get(name)}`);
      rec.assets.delete(name);
      r = await callRetry('POST', url, buf, { 'Content-Type': type || 'application/octet-stream' });
    }
    if (r.status !== 201) throw new Error('Upload of ' + name + ' failed (' + r.status + '): ' + r.body.slice(0, 300));
    rec.assets.set(name, r.json.id);
    return r.json.id;
  }
  // Replacing a file that launchers read: upload under a temporary name, then swap, so there is at most a few milliseconds without it.
  async function replace(rec, name, buf, type) {
    const old = rec.assets.get(name);
    if (old === undefined) return uploadTo(rec, name, buf, type);
    const tmp = name + '.new';
    if (rec.assets.has(tmp)) { await api('DELETE', `/repos/${repo}/releases/assets/${rec.assets.get(tmp)}`); rec.assets.delete(tmp); }
    const id = await uploadTo(rec, tmp, buf, type);
    await api('DELETE', `/repos/${repo}/releases/assets/${old}`);
    await api('PATCH', `/repos/${repo}/releases/assets/${id}`, { name });
    rec.assets.delete(tmp); rec.assets.set(name, id);
    return id;
  }

  let partIndex = conf.partIndexStart || 1, partRel = null;
  async function partRelease() {
    for (;;) {
      if (!partRel) partRel = await release(chunkPrefix + partIndex);
      if (partRel.assets.size < PER_RELEASE) return partRel;
      partIndex++; partRel = null;
    }
  }
  const known = new Map();  // part name -> its base URL, for parts already uploaded earlier
  async function scanParts() {
    for (let i = 1; ; i++) {
      const rec = await release(chunkPrefix + i, false);
      if (!rec) return;
      for (const n of rec.assets.keys()) known.set(n, downloadBase + rec.tag + '/');
      partIndex = i;
    }
  }
  let scanned = false;
  const ensureScanned = async () => { if (!scanned) { scanned = true; await scanParts(); } };

  return {
    name: 'GitHub Releases ' + repo,
    assetName,
    async putFile(key, file, o = {}) { const rec = await release(mainTag); await replace(rec, assetName(key), await fs.promises.readFile(file), o.type); },
    async putBytes(key, buf, o = {}) { const rec = await release(mainTag); await replace(rec, assetName(key), Buffer.from(buf), o.type || 'application/json'); },
    async exists(key) { const rec = await release(mainTag); return rec.assets.has(assetName(key)); },
    async chunkExists(name) { await ensureScanned(); return known.has(name); },
    chunkBase(name) { return known.get(name) || null; },
    async putChunk(name, file) {
      await ensureScanned();
      if (known.has(name)) return known.get(name);
      const rec = await partRelease();
      await uploadTo(rec, name, await fs.promises.readFile(file));
      const base = downloadBase + rec.tag + '/';
      known.set(name, base);
      return base;
    },
    async finish() {},
  };
};
module.exports.getToken = getToken;
