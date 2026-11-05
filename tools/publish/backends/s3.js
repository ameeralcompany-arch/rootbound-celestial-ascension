// Storage backend: anything that speaks the S3 API. Cloudflare R2, Backblaze B2, AWS S3, Wasabi, DigitalOcean Spaces... Signing is AWS Signature V4, written out here so the tool needs no packages.
// Keys come from the environment or the credentials file in your home folder (see tools/publish/lib/credentials.js), never from this repository.
'use strict';
const https = require('https'), http = require('http'), crypto = require('crypto'), fs = require('fs');
const { sha256 } = require('../../../launcher/app/core/util');

const hmac = (k, s) => crypto.createHmac('sha256', k).update(s).digest();
const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const encKey = k => k.split('/').map(enc).join('/');

// Pure, so it can be checked against AWS's published example.
function signV4({ method, host, canonicalPath, query = '', headers, payloadHash, accessKey, secretKey, region, service = 's3', now = new Date() }) {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''), day = amzDate.slice(0, 8);
  const all = Object.assign({ host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate }, headers);
  const names = Object.keys(all).map(k => k.toLowerCase()).sort();
  const lower = {}; for (const k of Object.keys(all)) lower[k.toLowerCase()] = String(all[k]).trim();
  const canonHeaders = names.map(n => n + ':' + lower[n] + '\n').join(''), signed = names.join(';');
  const canon = [method, canonicalPath, query, canonHeaders, signed, payloadHash].join('\n');
  const scope = [day, region, service, 'aws4_request'].join('/');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canon)].join('\n');
  const key = hmac(hmac(hmac(hmac('AWS4' + secretKey, day), region), service), 'aws4_request');
  const sig = hmac(key, toSign).toString('hex');
  return { headers: Object.assign({}, lower, { authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signed}, Signature=${sig}` }) };
}

module.exports = function s3Backend(conf, publicUrl, creds) {
  const endpoint = new URL(conf.endpoint), region = conf.region || 'auto', bucket = conf.bucket, prefix = (conf.prefix || '').replace(/^\/|\/$/g, '');
  const keyOf = k => (prefix ? prefix + '/' : '') + k;
  const accessKey = creds.accessKey, secretKey = creds.secretKey;
  if (!accessKey || !secretKey) throw new Error('S3 storage needs an access key and secret key. Put them in your credentials file or the RB_S3_ACCESS_KEY and RB_S3_SECRET_KEY environment variables.');

  async function request(method, key, body, extra = {}) {
    const canonicalPath = '/' + bucket + '/' + encKey(keyOf(key));
    const payloadHash = body ? sha256(body) : sha256('');
    const { headers } = signV4({ method, host: endpoint.host, canonicalPath, headers: extra, payloadHash, accessKey, secretKey, region });
    if (body) headers['content-length'] = String(body.length);
    const lib = endpoint.protocol === 'https:' ? https : http;
    return new Promise((resolve, reject) => {
      const req = lib.request({ protocol: endpoint.protocol, hostname: endpoint.hostname, port: endpoint.port, method, path: canonicalPath, headers, rejectUnauthorized: conf.insecureForTests ? false : true }, res => {
        const c = []; res.on('data', d => c.push(d)); res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(c) }));
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }
  const put = async (key, buf, opts = {}) => {
    const r = await request('PUT', key, buf, { 'content-type': opts.type || 'application/octet-stream', 'cache-control': opts.cache || 'public, max-age=31536000, immutable' });
    if (r.status < 200 || r.status >= 300) throw new Error('Upload of ' + key + ' failed (' + r.status + '): ' + r.body.toString().slice(0, 300));
  };
  return {
    name: 's3 ' + endpoint.host + '/' + bucket,
    async putFile(key, file, opts) { await put(key, await fs.promises.readFile(file), opts); },
    async putBytes(key, buf, opts = {}) { await put(key, Buffer.from(buf), { type: opts.type || 'application/json', cache: opts.cache || 'public, max-age=60' }); },
    async exists(key) { const r = await request('HEAD', key); return r.status === 200; },
    async putChunk(name, file) { await put('chunks/' + name, await fs.promises.readFile(file)); return new URL('chunks/', publicUrl).toString(); },
    chunkExists(name) { return this.exists('chunks/' + name); },
    chunkBase() { return new URL('chunks/', publicUrl).toString(); },
    async finish() {},
  };
};
module.exports.signV4 = signV4;
