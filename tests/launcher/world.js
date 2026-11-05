// Sets up a complete private update world for testing: throwaway signing key, local HTTPS server, publishing config, launcher config. Nothing here touches real saves, real keys or the real host.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const { serve, makeCert } = require(path.join(ROOT, 'tools/publish/serve-local'));
const { newKeyPair } = require(path.join(ROOT, 'launcher/app/core/signing'));

async function makeWorld({ base, port = 0, testHooks = true }) {
  const T = base || fs.mkdtempSync(path.join(os.tmpdir(), 'rbl-world-'));
  const HOST = path.join(T, 'host');
  fs.mkdirSync(HOST, { recursive: true });
  const cert = makeCert(path.join(T, 'cert'));
  const keyFile = path.join(T, 'keys', 'signing-key.pem');
  let pub;
  if (fs.existsSync(keyFile)) pub = require('crypto').createPublicKey(fs.readFileSync(keyFile)).export({ format: 'der', type: 'spki' }).toString('base64');
  else { const K = newKeyPair(); pub = K.publicKeyB64; fs.mkdirSync(path.dirname(keyFile), { recursive: true }); fs.writeFileSync(keyFile, K.privatePem); }
  const S = await serve({ dir: HOST, port, cert });
  const launcherConfig = { channelUrl: S.url, channel: 'stable', publicKeys: { 'rb-test': pub }, links: { project: 'https://github.com/ameeralcompany-arch/rootbound-celestial-ascension', issues: 'https://github.com/ameeralcompany-arch/rootbound-celestial-ascension/issues' }, tlsCaPem: fs.readFileSync(cert.certFile, 'utf8'), testHooks };
  const lconf = path.join(T, 'launcher-config.json');
  fs.writeFileSync(lconf, JSON.stringify(launcherConfig, null, 2));
  const pubCfg = path.join(T, 'publish.config.json');
  fs.mkdirSync(path.join(T, 'news-src', 'images'), { recursive: true });
  if (!fs.existsSync(path.join(T, 'news-src', 'news.json'))) fs.copyFileSync(path.join(ROOT, 'publish/content/news.json'), path.join(T, 'news-src', 'news.json'));
  fs.writeFileSync(pubCfg, JSON.stringify({ channel: 'stable', publicUrl: S.url, storage: { type: 'folder', path: 'host' }, signingKey: keyFile, keyId: 'rb-test', entry: 'Rootbound.exe', preserve: ['safe-mode.txt'], launcherConfig: lconf, tlsCaFile: cert.certFile, versionFile: path.join(T, 'version.json'), workDir: 'work', newsFile: 'news-src/news.json', validation: { tests: [] } }));
  if (!fs.existsSync(path.join(T, 'version.json'))) fs.writeFileSync(path.join(T, 'version.json'), JSON.stringify({ version: '6.12.0' }));
  const run = (script, args, opts = {}) => new Promise(res => {
    const c = spawn(process.execPath, [path.join(ROOT, script), ...args], Object.assign({ stdio: ['ignore', 'pipe', 'pipe'], cwd: ROOT }, opts));
    let out = '', err = ''; c.stdout.on('data', d => { out += d; }); c.stderr.on('data', d => { err += d; });
    c.on('exit', code => res({ code, out, err }));
  });
  return {
    T, HOST, S, cert, pubCfg, lconf, launcherConfig,
    publish: (args) => run('tools/publish/publish-update.js', [...args, '--config', pubCfg]),
    publishNews: () => run('tools/publish/publish-news.js', ['--config', pubCfg]),
    run,
    close: () => S.close(),
  };
}
module.exports = { makeWorld, ROOT };
