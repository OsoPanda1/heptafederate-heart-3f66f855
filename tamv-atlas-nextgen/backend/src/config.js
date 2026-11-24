import process from 'node:process';

const requiredEnv = [
  'TAMV_ORCID',
  'TAMV_ZENODO_RECORD',
  'TAMV_ISNI',
  'TAMV_ORG_NAME',
  'TAMV_FOUNDER_NAME',
  'TAMV_SIGNING_SEED',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (!/^[0-9a-f]{64}$/i.test(process.env.TAMV_SIGNING_SEED ?? '')) {
  throw new Error(
    'TAMV_SIGNING_SEED must be 64 hexadecimal characters representing 32 random bytes.',
  );
}

export const config = {
  port: Number(process.env.PORT ?? 8080),
  host: process.env.HOST ?? '0.0.0.0',
  environment: process.env.NODE_ENV ?? 'development',
  pids: {
    isni: process.env.TAMV_ISNI,
    orcid: process.env.TAMV_ORCID,
    zenodoRecord: process.env.TAMV_ZENODO_RECORD,
    doiPrefix: process.env.TAMV_DOI_PREFIX ?? '10.5281',
  },
  organization: {
    name: process.env.TAMV_ORG_NAME,
    founderName: process.env.TAMV_FOUNDER_NAME,
    founderAlias: process.env.TAMV_FOUNDER_ALIAS ?? 'Anubis Villaseñor',
    description:
      process.env.TAMV_ORG_DESCRIPTION ??
      'Ecosistema antifrágil de 7 federaciones con identidad autosoberana.',
  },
  did: {
    method: process.env.TAMV_DID_METHOD ?? 'tamv',
    region: process.env.TAMV_DID_REGION ?? 'rdm',
    serviceEndpoint:
      process.env.TAMV_DID_SERVICE_ENDPOINT ?? 'https://isni.tamv.online/resolve',
  },
  signing: {
    seed: process.env.TAMV_SIGNING_SEED,
  },
};
