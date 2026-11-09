// News, events and banners from the signed feed on the update server. The feed is verified, stored, and shown from the store, so the page has content offline.
// Images are downloaded here, checked against the hash in the signed feed and served to the page from the local cache only; the page itself can't reach the network at all.
'use strict';
const fsp = require('./fsx').promises, path = require('path');
const { atomicWriteJson, atomicWrite, readJson, sha256, exists } = require('./util');
const { verifyFeed } = require('./manifest');

const str = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const IMG_NAME = /^[0-9a-f]{64}\.(webp|png|jpg|jpeg)$/;

// Everything shown in the page goes through here: known fields, known types, sane lengths.
function cleanFeed(p) {
  const image = i => (i && /^[0-9a-f]{64}$/.test(i.sha256 || '') && typeof i.url === 'string' && ['webp', 'png', 'jpg', 'jpeg'].includes(i.ext)) ? { url: i.url, sha256: i.sha256, ext: i.ext, size: i.size | 0, file: i.sha256 + '.' + i.ext } : null;
  const https = u => { try { return new URL(u).protocol === 'https:' ? u : ''; } catch (_) { return ''; } };
  const items = (p.items || []).slice(0, 80).map(i => ({ id: str(i.id, 80), type: str(i.type, 20), title: str(i.title, 160), summary: str(i.summary, 400), body: str(i.body, 8000), date: str(i.date, 40), version: str(i.version, 20), pin: !!i.pin, image: image(i.image), link: https(i.link) })).filter(i => i.id && i.title);
  const events = (p.events || []).slice(0, 60).map(e => ({ id: str(e.id, 80), title: str(e.title, 160), summary: str(e.summary, 500), reward: str(e.reward, 200), kind: str(e.kind, 20), start: str(e.start, 40), end: str(e.end, 40), recur: str(e.recur, 30), image: image(e.image) })).filter(e => e.id && e.title);
  const banners = (p.banners || []).slice(0, 8).map(b => ({ id: str(b.id, 80), title: str(b.title, 120), text: str(b.text, 300), art: str(b.art, 30), image: image(b.image), newsId: str(b.newsId, 80) }));
  const links = ((p.community && p.community.links) || []).slice(0, 12).map(l => ({ title: str(l.title, 80), text: str(l.text, 200), url: https(l.url), icon: str(l.icon, 20) })).filter(l => l.title && l.url);
  const m = p.maintenance && typeof p.maintenance === 'object' ? { title: str(p.maintenance.title, 160), text: str(p.maintenance.text, 800), until: str(p.maintenance.until, 40) } : null;
  return { sequence: p.sequence, publishedAt: p.publishedAt, items, events, banners, community: { links }, maintenance: m && m.title ? m : null };
}

class News {
  constructor({ dir, http, config, log = () => {} }) {
    this.dir = dir; this.http = http; this.cfg = config; this.log = log;
    this.feed = null; this.error = null; this.fetchedAt = 0;
  }
  get file() { return path.join(this.dir, 'feed.json'); }
  get imageDir() { return path.join(this.dir, 'images'); }

  async load() {
    const saved = await readJson(this.file, null);
    if (saved) { try { this.feed = cleanFeed(verifyFeed(saved, this.cfg.publicKeys)); } catch (_) { this.feed = null; } }
    return this.state();
  }
  state() { return { feed: this.feed, error: this.error, fetchedAt: this.fetchedAt }; }

  feedUrl() { return this.cfg.newsUrl || new URL('news.json', this.cfg.channelUrl).toString(); }

  async refresh() {
    try {
      const env = await this.http.getJson(this.feedUrl(), { tries: 3, noCache: true, maxBytes: 4 * 1024 * 1024 });
      const p = verifyFeed(env, this.cfg.publicKeys);
      // same rule as updates: an older feed than the one already here is ignored
      if (this.feed && p.sequence < this.feed.sequence) { this.error = { code: 'OLD_FEED', message: 'The server has an older news feed' }; return this.state(); }
      this.feed = cleanFeed(p);
      await atomicWriteJson(this.file, env);
      this.error = null; this.fetchedAt = Date.now();
      await this.fetchImages();
    } catch (e) {
      this.error = { code: e.code || 'NET', message: e.message };
      this.log('news refresh failed: ' + e.message);
    }
    return this.state();
  }

  async fetchImages() {
    const wanted = new Set();
    const all = [...this.feed.items, ...this.feed.events, ...this.feed.banners].map(x => x.image).filter(Boolean);
    await fsp.mkdir(this.imageDir, { recursive: true });
    for (const im of all) {
      wanted.add(im.file);
      const f = path.join(this.imageDir, im.file);
      if (await exists(f)) continue;
      try {
        const buf = await this.http.getBytes(new URL(im.url, this.feedUrl()).toString(), { maxBytes: 5 * 1024 * 1024 });
        if (sha256(buf) !== im.sha256) { this.log('news image failed its hash: ' + im.url); continue; }
        await atomicWrite(f, buf);
      } catch (e) { this.log('news image: ' + e.message); }
    }
    // images no longer in the feed
    for (const n of await fsp.readdir(this.imageDir).catch(() => [])) if (!wanted.has(n)) await fsp.rm(path.join(this.imageDir, n), { force: true }).catch(() => {});
  }

  // For the page's image protocol: only names of the right shape, only from this one folder.
  imagePath(name) { return IMG_NAME.test(name) ? path.join(this.imageDir, name) : null; }
}

// The next time a repeating event comes round, and the current window of a fixed one.
function eventTimes(e, now = Date.now()) {
  if (e.recur === 'weekly-utc-monday') {
    const d = new Date(now); d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay() || 7, start = d.getTime() - (day - 1) * 864e5;
    return { state: 'active', start, end: start + 7 * 864e5 };
  }
  if (e.recur === 'daily-local') {
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    const n = new Date(d); n.setDate(n.getDate() + 1);
    return { state: 'active', start: d.getTime(), end: n.getTime() };
  }
  const start = Date.parse(e.start), end = Date.parse(e.end);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return { state: now < start ? 'upcoming' : now >= end ? 'ended' : 'active', start, end };
}

module.exports = { News, cleanFeed, eventTimes };
