import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.TAMV_ORCID = '0009-0008-5050-1539';
process.env.TAMV_ZENODO_RECORD = '19436662';
process.env.TAMV_ISNI = 'TAMV-ONLINE-0001';
process.env.TAMV_ORG_NAME = 'TAMV Online - Infraestructura Soberana';
process.env.TAMV_FOUNDER_NAME = 'Edwin Oswaldo Castillo Trejo';
process.env.TAMV_SIGNING_SEED = '0123456789abcdef'.repeat(4);
process.env.PORT = '8092';

const { startServer } = await import('../src/server.js');

const server = startServer();
const base = 'http://127.0.0.1:8092';

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('POST /api/v1/chat returns response and ledger event', async () => {
  const response = await fetch(`${base}/api/v1/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: 'Hola Isabella', modality: 'text' }),
  });

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.response.answer.includes('Hola Isabella'));
  assert.equal(data.ledgerEvent.type, 'chat');
});

test('POST /api/v1/haptics validates intensity', async () => {
  const response = await fetch(`${base}/api/v1/haptics`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pattern: 'pulse', intensity: 2 }),
  });

  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /intensity/);
});

test('POST /api/v1/ledger/events and GET by id', async () => {
  const create = await fetch(`${base}/api/v1/ledger/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'audit', detail: { policy: 'ethics-v1' } }),
  });

  assert.equal(create.status, 201);
  const created = await create.json();

  const read = await fetch(`${base}/api/v1/ledger/events/${created.event.id}`);
  assert.equal(read.status, 200);
  const readData = await read.json();
  assert.equal(readData.event.type, 'audit');
});

test('plugins list and install endpoint works', async () => {
  const install = await fetch(`${base}/api/v1/plugins/install`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 'metaverso-xr' }),
  });

  assert.equal(install.status, 201);

  const list = await fetch(`${base}/api/v1/plugins`);
  assert.equal(list.status, 200);
  const data = await list.json();
  assert.ok(data.plugins.some((plugin) => plugin.id === 'metaverso-xr'));
});
