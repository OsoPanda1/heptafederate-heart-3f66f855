import test from 'node:test';
import assert from 'node:assert/strict';
import { get } from 'node:http';

process.env.NODE_ENV = 'test';
process.env.TAMV_ORCID = '0009-0008-5050-1539';
process.env.TAMV_ZENODO_RECORD = '19436662';
process.env.TAMV_ISNI = 'TAMV-ONLINE-0001';
process.env.TAMV_ORG_NAME = 'TAMV Online - Infraestructura Soberana';
process.env.TAMV_FOUNDER_NAME = 'Edwin Oswaldo Castillo Trejo';
process.env.TAMV_SIGNING_SEED = '0123456789abcdef'.repeat(4);
process.env.PORT = '8091';

const { startServer } = await import('../src/server.js');

const server = startServer();
const base = 'http://127.0.0.1:8091';

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /healthz returns ok', async () => {
  const response = await fetch(`${base}/healthz`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.ok, true);
});

test('GET /v1/security/posture returns controls and score', async () => {
  const response = await fetch(`${base}/v1/security/posture`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(typeof data.antifragilityScore, 'number');
  assert.ok(data.controls);
  assert.equal(data.controls.pidTriangulation, 'ok');
});

test('sign + verify cycle should be valid', async () => {
  const signRes = await fetch(`${base}/v1/signature/sign`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'federation.block',
      data: { federation: '7f', impacto_humanista: 0.95 },
    }),
  });

  assert.equal(signRes.status, 201);
  const signed = await signRes.json();

  const verifyRes = await fetch(`${base}/v1/signature/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ payload: signed.payload, signature: signed.signature }),
  });

  assert.equal(verifyRes.status, 200);
  const verification = await verifyRes.json();
  assert.equal(verification.valid, true);
});

test('GET /v1/pids/status returns aggregated provider state', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => {
      if (url.includes('/person')) {
        return Response.json({
          name: {
            'given-names': { value: 'Edwin' },
            'family-name': { value: 'Castillo Trejo' },
          },
        });
      }
      if (url.includes('/works')) {
        return Response.json({ group: [] });
      }
      if (url.includes('zenodo.org/api/records/')) {
        return Response.json({
          doi: '10.5281/zenodo.19436662',
          metadata: { title: 'Canon TAMV', publication_date: '2026-04-01' },
          links: { html: 'https://zenodo.org/records/19436662' },
        });
      }
      if (url.includes('isni.org/isni/')) {
        return new Response('ok', { status: 200 });
      }
      return new Response('not-found', { status: 404 });
    };

    const response = await new Promise((resolve, reject) => {
      get(`${base}/v1/pids/status`, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      }).on('error', reject);
    });

    assert.equal(response.statusCode, 200);
    const data = JSON.parse(response.body);
    assert.equal(data.records.orcid.reachable, true);
    assert.equal(data.records.zenodo.reachable, true);
    assert.equal(data.records.isni.reachable, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('omni-kernel register/process/status endpoints work', async () => {
  const isni = 'TAMVONLINE-ECOSISTEM-LATAM';

  const registerRes = await fetch(`${base}/v1/omni/users/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ isni, name: 'Edwin Oswaldo Castillo Trejo' }),
  });
  assert.equal(registerRes.status, 201);

  const processRes = await fetch(`${base}/v1/omni/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ isni, requestType: 'model-inference', payload: { content: 'Explica arquitectura MD-X4' } }),
  });
  assert.equal(processRes.status, 200);
  const processData = await processRes.json();
  assert.equal(processData.approved, true);

  const userRes = await fetch(`${base}/v1/omni/users/${encodeURIComponent(isni)}`);
  assert.equal(userRes.status, 200);

  const statusRes = await fetch(`${base}/v1/omni/status`);
  assert.equal(statusRes.status, 200);
  const status = await statusRes.json();
  assert.equal(typeof status.metrics.totalRequests, 'number');
});
