import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const configUrl = new URL('../src/config.js', import.meta.url).href;
const required = {
  NODE_ENV: 'test',
  TAMV_ORCID: '0009-0008-5050-1539',
  TAMV_ZENODO_RECORD: '19436662',
  TAMV_ISNI: 'TAMV-ONLINE-0001',
  TAMV_ORG_NAME: 'TAMV test org',
  TAMV_FOUNDER_NAME: 'TAMV test founder',
};

function loadConfig(seed) {
  const env = { ...process.env, ...required };
  if (seed === undefined) delete env.TAMV_SIGNING_SEED;
  else env.TAMV_SIGNING_SEED = seed;
  return spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', `import(${JSON.stringify(configUrl)})`],
    { env, encoding: 'utf8' },
  );
}

test('configuration refuses a missing signing seed', () => {
  const result = loadConfig(undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /TAMV_SIGNING_SEED/);
});

test('configuration refuses a seed that is not 32 bytes of hexadecimal', () => {
  for (const seed of ['too-short', 'g'.repeat(64), 'a'.repeat(63), 'a'.repeat(65)]) {
    const result = loadConfig(seed);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /64 hexadecimal characters/);
  }
});

test('configuration accepts exactly 32 bytes represented as hex', () => {
  const result = loadConfig('0123456789abcdef'.repeat(4));
  assert.equal(result.status, 0, result.stderr);
});
