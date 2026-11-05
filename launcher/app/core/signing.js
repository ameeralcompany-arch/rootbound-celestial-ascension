// Every file the launcher trusts from the update server starts with one of these envelopes: {payload: "<exact JSON text>", kid, sig}.
// The signature covers the exact bytes of the payload text. Only the public half of the key is ever in the launcher; the private half stays on
// the publisher's computer (see tools/publish/keygen.js). Ed25519, through Node's own crypto.
'use strict';
const crypto = require('crypto');

class SignatureError extends Error { constructor(m) { super(m); this.code = 'BAD_SIGNATURE'; } }

function publicKeyObject(b64) { return crypto.createPublicKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'spki' }); }

// Returns the parsed payload, or throws. A signature made by any key not in `publicKeys` is refused.
function verifyEnvelope(env, publicKeys) {
  if (!env || typeof env !== 'object' || typeof env.payload !== 'string' || typeof env.sig !== 'string' || typeof env.kid !== 'string') throw new SignatureError('This file is not signed');
  const pub = publicKeys && Object.prototype.hasOwnProperty.call(publicKeys, env.kid) ? publicKeys[env.kid] : null;
  if (!pub) throw new SignatureError('This file was signed with an unknown key');
  let ok = false;
  try { ok = crypto.verify(null, Buffer.from(env.payload, 'utf8'), publicKeyObject(pub), Buffer.from(env.sig, 'base64')); } catch (_) { ok = false; }
  if (!ok) throw new SignatureError('The signature does not match');
  let payload;
  try { payload = JSON.parse(env.payload); } catch (_) { throw new SignatureError('The signed data is unreadable'); }
  if (!payload || typeof payload !== 'object') throw new SignatureError('The signed data is unreadable');
  return payload;
}

function signEnvelope(obj, privatePem, kid) {
  const payload = JSON.stringify(obj);
  const sig = crypto.sign(null, Buffer.from(payload, 'utf8'), crypto.createPrivateKey(privatePem)).toString('base64');
  return { payload, kid, sig };
}

function newKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  return {
    publicKeyB64: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
    privatePem: privateKey.export({ format: 'pem', type: 'pkcs8' }),
  };
}

module.exports = { verifyEnvelope, signEnvelope, newKeyPair, SignatureError };
