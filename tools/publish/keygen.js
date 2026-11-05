#!/usr/bin/env node
// Creates the signing key that proves updates really come from you, and tells the launcher to trust it.
//   node tools/publish/keygen.js            creates the key if there is none, and records its public half in launcher/update-config.json
//   node tools/publish/keygen.js --trust    only records the public half of the key you already have
// The private key stays in your home folder, outside this repository. Back it up somewhere safe.
'use strict';
const P = require('./lib/publisher');
(async () => {
  const at = process.argv.indexOf('--config');
  const cfg = P.loadConfig(at >= 0 ? process.argv[at + 1] : undefined);
  const key = await P.loadSigningKey(cfg);
  await P.recordPublicKey(cfg, key.publicKeyB64);
  console.log('Signing key: ' + key.file);
  console.log('Key name: ' + cfg.keyId + '. Its public half is now in ' + cfg.launcherConfig);
  console.log('Rebuild the launcher after this so it trusts the key: node tools/publish/build-launcher.js');
})().catch(e => { console.error(e.message); process.exit(1); });
