#!/usr/bin/env node
// Publishes announcements, events and banners from publish/content/news.json to every launcher, with no rebuild of anything.
//   node tools/publish/publish-news.js            (add --dry-run to only check the file, --config <file> for another config)
'use strict';
const path = require('path');
const P = require('./lib/publisher');

(async () => {
  const args = process.argv.slice(2), at = args.indexOf('--config');
  const cfg = P.loadConfig(at >= 0 ? args[at + 1] : undefined), dryRun = args.includes('--dry-run');
  const key = await P.loadSigningKey(cfg);
  const trusted = await P.checkKeyIsTrusted(cfg, key);
  const backend = dryRun ? { name: 'none', exists: async () => true, putBytes: async () => {} } : P.makeBackend(cfg), http = P.makeHttp(cfg);
  const file = path.join(path.dirname(cfg._file), cfg.newsFile || 'content/news.json');
  await P.publishNews(cfg, backend, http, key, trusted, file, { dryRun });
  http.close();
})().catch(e => { console.error('Publishing stopped: ' + e.message); process.exit(1); });
