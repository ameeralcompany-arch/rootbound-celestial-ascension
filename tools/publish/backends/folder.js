// Storage backend: a plain folder. Point any static HTTPS web server at it, or use tools/publish/serve-local.js for testing.
'use strict';
const fsp = require('fs').promises, path = require('path');
const { atomicWrite } = require('../../../launcher/app/core/util');

module.exports = function folderBackend(conf, publicUrl) {
  const root = path.resolve(conf.path);
  const full = key => path.join(root, ...key.split('/'));
  return {
    name: 'folder ' + root,
    async putFile(key, file) { const t = full(key); await fsp.mkdir(path.dirname(t), { recursive: true }); await fsp.copyFile(file, t + '.tmp'); await fsp.rename(t + '.tmp', t); },
    async putBytes(key, buf) { await atomicWrite(full(key), buf); },
    async exists(key) { return fsp.access(full(key)).then(() => true, () => false); },
    // where a part ends up; every manifest stores this per part so a later move to another host needs no launcher change
    async putChunk(name, file) { await this.putFile('chunks/' + name, file); return new URL('chunks/', publicUrl).toString(); },
    chunkExists(name) { return this.exists('chunks/' + name); },
    chunkBase() { return new URL('chunks/', publicUrl).toString(); },
    async finish() {},
  };
};
