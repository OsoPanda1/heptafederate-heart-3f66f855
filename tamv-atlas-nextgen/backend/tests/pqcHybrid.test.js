import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSigningEngine } from '../src/pqcHybrid.js';

const seedA = '0123456789abcdef'.repeat(4);
const seedB = 'fedcba9876543210'.repeat(4);

test('same seed derives the same Ed25519 key and public-key key id', () => {
  const first = buildSigningEngine(seedA);
  const second = buildSigningEngine(seedA);
  assert.equal(first.profile.activeAlgorithm, 'Ed25519');
  assert.equal(first.profile.keyId, second.profile.keyId);
  assert.equal(first.exportPublicKeyPem(), second.exportPublicKeyPem());
  assert.match(first.profile.keyId, /^tamv-ed25519-[0-9a-f]{12}$/);
  assert.match(first.profile.mlDsaProfile, /not enabled/i);
});

test('signature verifies across engine instances made from the same seed', () => {
  const first = buildSigningEngine(seedA);
  const afterRestart = buildSigningEngine(seedA);
  const payload = { type: 'federation.block', data: { node: 'rdm', sequence: 7 } };
  const signature = first.signPayload(payload);
  assert.equal(afterRestart.verifyPayload(payload, signature), true);
  assert.equal(afterRestart.verifyPayload({ ...payload, sequence: 8 }, signature), false);
});

test('different seeds derive different keys and signatures are not interchangeable', () => {
  const first = buildSigningEngine(seedA);
  const second = buildSigningEngine(seedB);
  const payload = { purpose: 'tamv-key-isolation' };
  const signature = first.signPayload(payload);
  assert.notEqual(first.profile.keyId, second.profile.keyId);
  assert.notEqual(first.exportPublicKeyPem(), second.exportPublicKeyPem());
  assert.equal(second.verifyPayload(payload, signature), false);
});

test('invalid seed formats fail closed and malformed signatures return false', () => {
  for (const invalidSeed of ['', 'short', 'g'.repeat(64), 'a'.repeat(63), 'a'.repeat(65), null, 42]) {
    assert.throws(() => buildSigningEngine(invalidSeed), /64 hexadecimal characters/);
  }
  const engine = buildSigningEngine(seedA);
  assert.equal(engine.verifyPayload({ ok: true }, ''), false);
  assert.equal(engine.verifyPayload({ ok: true }, 'not-base64'), false);
});
