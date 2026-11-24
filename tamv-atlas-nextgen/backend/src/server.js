import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { config } from './config.js';
import { buildSigningEngine } from './pqcHybrid.js';
import { buildDidDocument, buildOrganizationIdentity } from './identityRegistry.js';
import { loadPidStatus } from './pidConnectors.js';
import { discoverFusionPlan, executeFusion } from './repoFusionService.js';
import { AtlasStore } from './atlasStore.js';
import { AtlasKernelRuntime } from './atlasKernelRuntime.js';
import { createIsabellaEngine } from './isabellaEngine.js';
import { createOmniKernelGateway } from './omniKernelGateway.js';

const signingEngine = buildSigningEngine(config.signing.seed);
const orgIdentity = buildOrganizationIdentity(config, signingEngine.profile);
const atlasKernel = new AtlasKernelRuntime();
const isabellaEngine = createIsabellaEngine();
const omniKernelGateway = createOmniKernelGateway();
const atlasStoreConfig = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
const hasPersistence = Boolean(atlasStoreConfig.supabaseUrl && atlasStoreConfig.supabaseServiceRoleKey);
const atlasStore = hasPersistence ? new AtlasStore(atlasStoreConfig) : null;
if (atlasStore) await atlasStore.init();

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
  });
}



function setupSse(res) {
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'access-control-allow-origin': corsAllowedOrigin,
    'vary': 'Origin',
  });
  res.write(': connected\n\n');
}

function emitSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function buildSecurityPosture() {
  const hasValidSeed = /^[0-9a-f]{64}$/i.test(config.signing.seed);
  const hasPidTriangulation = Boolean(config.pids.orcid && config.pids.zenodoRecord && config.pids.isni);
  const hasRestrictedCors = corsAllowedOrigin !== '*';
  const controlsPassed = [
    hasValidSeed,
    hasPidTriangulation,
    hasPersistence,
    hasRestrictedCors,
  ].filter(Boolean).length;

  return {
    status: controlsPassed === 4 ? 'hardened' : 'degraded',
    antifragilityScore: controlsPassed / 4,
    controls: {
      signingKeyMaterial: hasValidSeed ? 'valid_32_byte_seed' : 'invalid_or_missing',
      activeSignatureAlgorithm: signingEngine.profile.activeAlgorithm,
      pqcSigningSeed: 'not_enabled',
      postQuantumSignature: 'not_enabled',
      pidTriangulation: hasPidTriangulation ? 'ok' : 'missing',
      persistenceAuditTrail: hasPersistence ? 'ok' : 'disabled',
      cors: hasRestrictedCors ? 'restricted' : 'open',
    },
    checkedAt: new Date().toISOString(),
  };
}

async function loadFederationReview() {
  const payload = await readFile('data/federation/osopanda-triple-review-latest.json', 'utf-8');
  return JSON.parse(payload);
}

async function loadMarkdownConsolidationReport() {
  const payload = await readFile('data/knowledge/markdown-consolidation-report.json', 'utf-8');
  return JSON.parse(payload);
}

async function loadReviewCycleReport() {
  const payload = await readFile('data/ops/review-reformulate-cycle-latest.json', 'utf-8');
  return JSON.parse(payload);
}


function requirePersistence(res) {
  if (atlasStore) return true;
  writeJson(res, 503, { error: 'Persistence backend unavailable. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
  return false;
}

function resolveCorsAllowedOrigin() {
  const configuredOrigin = process.env.TAMV_CORS_ALLOWED_ORIGIN?.trim();
  if (!configuredOrigin) {
    // Same-origin clients need no CORS grant. Keep wildcard only outside production.
    return config.environment === 'production' ? 'null' : '*';
  }

  if (configuredOrigin === '*') {
    if (config.environment === 'production') {
      throw new Error('TAMV_CORS_ALLOWED_ORIGIN must not be wildcard in production.');
    }
    return '*';
  }

  let parsed;
  try {
    parsed = new URL(configuredOrigin);
  } catch {
    throw new Error('TAMV_CORS_ALLOWED_ORIGIN must be an absolute HTTP(S) origin.');
  }

  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.origin !== configuredOrigin ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error('TAMV_CORS_ALLOWED_ORIGIN must contain only an HTTP(S) origin, without path or credentials.');
  }

  return parsed.origin;
}

const corsAllowedOrigin = resolveCorsAllowedOrigin();

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': corsAllowedOrigin,
    'vary': 'Origin',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    return writeJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/healthz') {
    return writeJson(res, 200, {
      ok: true,
      service: 'tamv-identity-api',
      environment: config.environment,
      timestamp: new Date().toISOString(),
    });
  }
  if (req.method === 'GET' && url.pathname === '/v1/security/posture') {
    return writeJson(res, 200, buildSecurityPosture());
  }
  if (req.method === 'GET' && url.pathname === '/v1/federation/review') {
    try {
      const review = await loadFederationReview();
      return writeJson(res, 200, review);
    } catch (error) {
      return writeJson(res, 404, { error: 'Federation review not generated yet', detail: error instanceof Error ? error.message : String(error) });
    }
  }

  if (req.method === 'GET' && url.pathname === '/v1/docs/consolidation') {
    try {
      const report = await loadMarkdownConsolidationReport();
      return writeJson(res, 200, report);
    } catch (error) {
      return writeJson(res, 404, { error: 'Markdown consolidation report not generated yet', detail: error instanceof Error ? error.message : String(error) });
    }
  }

  if (req.method === 'GET' && url.pathname === '/v1/ops/review-cycle') {
    try {
      const report = await loadReviewCycleReport();
      return writeJson(res, 200, report);
    } catch (error) {
      return writeJson(res, 404, { error: 'Review cycle report not generated yet', detail: error instanceof Error ? error.message : String(error) });
    }
  }

  if (req.method === 'GET' && url.pathname === '/v1/identity/org') {
    return writeJson(res, 200, orgIdentity);
  }

  if (req.method === 'GET' && url.pathname.startsWith('/v1/identity/did/')) {
    const suffix = url.pathname.replace('/v1/identity/did/', '');
    const didDocument = buildDidDocument(
      config,
      suffix,
      signingEngine.exportPublicKeyPem(),
    );
    return writeJson(res, 200, didDocument);
  }

  if (req.method === 'GET' && url.pathname === '/v1/pids/status') {
    try {
      const data = await loadPidStatus(config);
      return writeJson(res, 200, data);
    } catch (error) {
      return writeJson(res, 502, {
        error: error instanceof Error ? error.message : 'PID upstream error',
      });
    }
  }


  if (req.method === 'POST' && url.pathname === '/v1/fusion/plan') {
    try {
      const body = await parseJsonBody(req);
      const plan = await discoverFusionPlan(body.owner ?? 'OsoPanda1');
      return writeJson(res, 200, plan);
    } catch (error) {
      return writeJson(res, 502, {
        error: error instanceof Error ? error.message : 'Fusion plan failed',
      });
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/fusion/run') {
    try {
      const body = await parseJsonBody(req);
      const result = await executeFusion(body.owner ?? 'OsoPanda1');
      return writeJson(res, 200, result);
    } catch (error) {
      return writeJson(res, 502, {
        error: error instanceof Error ? error.message : 'Fusion execution failed',
      });
    }
  }



  if (req.method === 'POST' && url.pathname === '/api/v1/chat') {
    try {
      const body = await parseJsonBody(req);
      return writeJson(res, 200, isabellaEngine.chat(body));
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/vision') {
    const body = await parseJsonBody(req);
    return writeJson(res, 200, isabellaEngine.vision(body));
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/audio') {
    const body = await parseJsonBody(req);
    return writeJson(res, 200, isabellaEngine.audio(body));
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/haptics') {
    try {
      const body = await parseJsonBody(req);
      return writeJson(res, 200, isabellaEngine.haptics(body));
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/ledger/events') {
    const body = await parseJsonBody(req);
    return writeJson(res, 201, { event: isabellaEngine.registerLedgerEvent(body) });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/v1/ledger/events/')) {
    const id = url.pathname.replace('/api/v1/ledger/events/', '');
    const event = isabellaEngine.getLedgerEvent(id);
    if (!event) {
      return writeJson(res, 404, { error: 'Ledger event not found', id });
    }
    return writeJson(res, 200, { event });
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/plugins') {
    return writeJson(res, 200, { plugins: isabellaEngine.listPlugins() });
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/plugins/install') {
    try {
      const body = await parseJsonBody(req);
      return writeJson(res, 201, { plugin: isabellaEngine.installPlugin(body.id) });
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/signature/sign') {
    try {
      const body = await parseJsonBody(req);
      const payload = {
        id: randomUUID(),
        type: body.type ?? 'tamv.block',
        issuedAt: new Date().toISOString(),
        data: body.data ?? {},
      };
      const signature = signingEngine.signPayload(payload);
      return writeJson(res, 201, {
        payload,
        signature,
        profile: signingEngine.profile,
      });
    } catch (error) {
      return writeJson(res, 400, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/signature/verify') {
    try {
      const body = await parseJsonBody(req);
      const valid = signingEngine.verifyPayload(body.payload, body.signature);
      return writeJson(res, 200, {
        valid,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      return writeJson(res, 400, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }


  if (req.method === 'GET' && url.pathname === '/v1/auth/profile') {
    return writeJson(res, 200, {
      ok: true,
      issuer: config.organization.name,
      didMethod: config.did.method,
      profile: signingEngine.profile,
    });
  }

  if (req.method === 'GET' && url.pathname === '/v1/users') {
    if (!requirePersistence(res)) return;
    try {
      const users = await atlasStore.listUsers();
      return writeJson(res, 200, { users });
    } catch (error) {
      return writeJson(res, 500, { error: error instanceof Error ? error.message : 'Failed to list users' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/users') {
    if (!requirePersistence(res)) return;
    try {
      const body = await parseJsonBody(req);
      const user = atlasKernel.createUser(body.handle, body.displayName);
      const persisted = await atlasStore.createUser({ handle: user.handle, displayName: user.displayName });
      return writeJson(res, 201, { user: persisted, kernelId: user.id });
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Create user failed' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/protocols/execute') {
    if (!requirePersistence(res)) return;
    try {
      const body = await parseJsonBody(req);
      const execution = atlasKernel.executeProtocol(body.protocolId, body.actorId, body.paths ?? []);
      const persisted = await atlasStore.recordProtocolExecution(execution);
      await atlasStore.publishXrEvent('guardian.protocol.collapsed', { execution });
      return writeJson(res, 201, { execution, persisted });
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Protocol execution failed' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/economy/ledger') {
    if (!requirePersistence(res)) return;
    try {
      const body = await parseJsonBody(req);
      const entry = atlasKernel.postLedger(body.userId, Number(body.amount), body.reason);
      const persisted = await atlasStore.recordEconomyEntry({ userId: body.userId, amount: Number(body.amount), reason: body.reason, kind: entry.kind });
      return writeJson(res, 201, { entry: persisted });
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Ledger post failed' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/v1/xr/stream') {
    if (!requirePersistence(res)) return;
    setupSse(res);
    const unsubscribe = atlasStore.onXrEvent((event) => emitSse(res, 'guardian', event));
    req.on('close', () => unsubscribe());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/xr/events') {
    if (!requirePersistence(res)) return;
    try {
      const body = await parseJsonBody(req);
      const event = await atlasStore.publishXrEvent(body.eventType ?? 'xr.event', body.payload ?? {});
      return writeJson(res, 201, { event });
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Publish XR event failed' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/v1/xr/webrtc/stream') {
    if (!requirePersistence(res)) return;
    setupSse(res);
    const roomId = url.searchParams.get('roomId');
    const target = url.searchParams.get('targetId');
    const unsubscribe = atlasStore.onSignal((signal) => {
      if (roomId && signal.room_id !== roomId) return;
      if (target && signal.target_id && signal.target_id !== target) return;
      emitSse(res, 'signal', signal);
    });
    req.on('close', () => unsubscribe());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/v1/xr/webrtc/signal') {
    if (!requirePersistence(res)) return;
    try {
      const body = await parseJsonBody(req);
      const signal = await atlasStore.createSignal({
        roomId: body.roomId,
        senderId: body.senderId,
        targetId: body.targetId,
        signalType: body.signalType,
        payload: body.payload ?? {},
      });
      return writeJson(res, 201, { signal });
    } catch (error) {
      return writeJson(res, 400, { error: error instanceof Error ? error.message : 'Signal publish failed' });
    }
  }

  return writeJson(res, 404, {
    error: 'Not found',
    path: url.pathname,
  });
});

export function startServer() {
  server.listen(config.port, config.host, () => {
    // eslint-disable-next-line no-console
    console.log(
      `TAMV Identity API running on http://${config.host}:${config.port} (${config.environment})`,
    );
  });
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
