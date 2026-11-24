import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from 'node:crypto';

const ED25519_PKCS8_PREFIX = Buffer.from(
  '302e020100300506032b657004220420',
  'hex',
);
const SIGNING_DOMAIN = Buffer.from('TAMV-ED25519-SIGNING-V1\0', 'utf8');

/**
 * Create a stable Ed25519 keypair from a cryptographically random 32-byte
 * secret. ML-DSA/PQC is not implemented; signatures currently use Ed25519.
 */
export function buildSigningEngine(seedMaterial) {
  if (typeof seedMaterial !== 'string' || !/^[0-9a-f]{64}$/i.test(seedMaterial)) {
    throw new Error(
      'TAMV_SIGNING_SEED must be 64 hexadecimal characters representing 32 random bytes.',
    );
  }

  const seedBytes = Buffer.from(seedMaterial, 'hex');
  const privateSeed = createHash('sha256')
    .update(SIGNING_DOMAIN)
    .update(seedBytes)
    .digest();

  const privateKey = createPrivateKey({
    key: Buffer.concat([ED25519_PKCS8_PREFIX, privateSeed]),
    format: 'der',
    type: 'pkcs8',
  });
  const publicKey = createPublicKey(privateKey);
  const publicKeyDer = publicKey.export({ type: 'spki', format: 'der' });
  const publicKeyFingerprint = createHash('sha256').update(publicKeyDer).digest('hex');

  return {
    profile: {
      activeAlgorithm: 'Ed25519',
      mlDsaProfile: 'ML-DSA-65 (planned; not enabled)',
      pqcRoadmap: 'Post-quantum signatures are not enabled; current signatures use Ed25519.',
      keyId: `tamv-ed25519-${publicKeyFingerprint.slice(0, 12)}`,
    },

    signPayload(payload) {
      const message = Buffer.from(JSON.stringify(payload));
      return sign(null, message, privateKey).toString('base64');
    },

    verifyPayload(payload, signatureB64) {
      if (typeof signatureB64 !== 'string' || signatureB64.length === 0) return false;
      const message = Buffer.from(JSON.stringify(payload));
      const signature = Buffer.from(signatureB64, 'base64');
      if (signature.length !== 64) return false;
      return verify(null, message, publicKey, signature);
    },

    exportPublicKeyPem() {
      return publicKey.export({ type: 'spki', format: 'pem' }).toString();
    },
  };
}
