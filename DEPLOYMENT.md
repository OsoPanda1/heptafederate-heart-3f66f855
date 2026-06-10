# TAMV Core Kodex — Deployment Guide (3 paquetes)

Despliegue unificado del monorepo. Tres boundaries operativos, un solo
`docker-compose.yml` raíz:

| Paquete | Imagen | Puerto | Runtime | Rol |
| --- | --- | --- | --- | --- |
| **App Kodex** (`/`) | `tamv/core-kodex` | `3000` | Node 22 (Nitro SSR) | Frontend + SSR TanStack Start |
| **Backend NextGen** (`tamv-atlas-nextgen/backend`) | `tamv/nextgen-backend` | `8080` | Node 22 | AtlasKernel, Isabella, OmniKernel Gateway, PID reconciler |
| **Atlas ingestion** (`tamv-core-atlas`) | `node:22-alpine` (batch) | — | Node 22 | Pipeline batch on-demand: discover→fetch→from-nextgen→normalize→classify→relate→publish |

Rutas:
1. **Lovable Cloud** (recomendado para la app): pulsar **Publish**.
2. **Self-host con Docker** (este documento) — soporta los tres paquetes.
3. **CI/CD a un servidor** vía `.github/workflows/deploy.yml` (solo App Kodex; NextGen y Atlas se levantan en el host).

---

## 1. Requisitos

- Docker 24+ y Docker Compose v2.
- Puertos abiertos: `3000` (app), `8080` (backend NextGen). Recomendado detrás de Caddy/Traefik/Nginx con TLS.
- (Opcional) Token GitHub `public_repo` para el pipeline `atlas`.

## 2. Build & arranque — los 3 paquetes

### 2.1 App Kodex sola (mínimo viable)

```bash
docker compose up -d --build kodex
curl -fsS http://localhost:3000/ | head -n 5
docker compose logs -f kodex
```

### 2.2 Stack completo (App + Backend NextGen)

```bash
docker compose --profile full up -d --build
# verificación de los tres healthchecks
curl -fsS http://localhost:3000/        # app SSR
curl -fsS http://localhost:8080/health   # backend NextGen
```

### 2.3 Ingestión Atlas (batch on-demand)

```bash
cp tamv-core-atlas/.env.example tamv-core-atlas/.env
# editar GITHUB_TOKEN
docker compose --profile ingest run --rm atlas
# salida: tamv-core-atlas/atlas/{index,graph,taxonomy}.json
#          tamv-core-atlas/atlas/repos/*
#          tamv-core-atlas/atlas/external/nextgen-*.json (bridge)
```

## 3. Flujo de datos — NextGen → Atlas → UI

```
┌────────────────────────────┐      ┌──────────────────────────┐
│  tamv-atlas-nextgen/data   │      │  tamv-core-atlas/atlas   │
│  (federation reviews,      │ ───▶ │  external/nextgen-*.json │
│   bookpi blocks,           │      │  (bridge from-nextgen)   │
│   knowledge reports)       │      └──────────┬───────────────┘
└────────────────────────────┘                 │
                                                ▼
                              normalize → classify → relate → publish
                                                │
                                                ▼
                              atlas/{index,graph,taxonomy}.json
                                                │
                                                ▼
                              UI App Kodex (src/lib/csp-data.ts swap)
```

El bridge `tamv-core-atlas/ingestion/from-nextgen.ts` lee los JSON canónicos
que produce el backend NextGen y los normaliza como fuentes externas para que
`normalize.ts` los absorba. Ya está cableado en `scripts/sync-all.sh` y en
`npm run build` (entre `extract` y `normalize`).

## 4. Verificación post-deploy

```bash
# 1. Atlas pipeline está completo y consistente
cd tamv-core-atlas
bash scripts/validate-atlas.sh
# debe imprimir "atlas OK" y validar:
#   atlas/index.json
#   atlas/graph.json
#   atlas/taxonomy.json

# 2. Backend NextGen responde
curl -fsS http://localhost:8080/health

# 3. App SSR funciona
curl -fsS http://localhost:3000/ | grep -q "TAMV"

# 4. Reporte de consistencia canónica
# Abrir en navegador: http://localhost:3000/admin/canon
# Verificar:
#   - 0 contradicciones doctrinales
#   - tabla de hashes SHA-256 completa
#   - clusters por tag con membresía esperada
```

## 5. CI/CD (`deploy.yml`)

Workflow construye y publica `tamv/core-kodex` a GHCR; opcionalmente hace
SSH al host objetivo y ejecuta `docker compose pull && up -d`.

| Tipo | Nombre | Ejemplo |
| --- | --- | --- |
| Repository variable | `DEPLOY_HOST` | `kodex.tamv.org` |
| Repository variable | `DEPLOY_USER` | `deploy` |
| Repository variable | `DEPLOY_PATH` | `/srv/tamv-kodex` |
| Repository secret | `DEPLOY_SSH_KEY` | clave SSH privada (PEM) |

Backend NextGen y Atlas no se construyen en CI por defecto (requieren
secretos sensibles y artefactos locales). Para añadir su pipeline, copiar el
job `build-and-push` y apuntar `context: ./tamv-atlas-nextgen` con
`file: backend/Dockerfile`.

## 6. Rollback por paquete

```bash
# App Kodex
docker pull ghcr.io/<owner>/tamv-core-kodex:<sha-anterior>
docker tag ghcr.io/<owner>/tamv-core-kodex:<sha-anterior> tamv/core-kodex:latest
docker compose up -d kodex

# Backend NextGen (si está tageado en GHCR via backend-cicd.yml propio)
docker pull ghcr.io/<owner>/tamv-atlas-nextgen/tamv-identity-api:<sha-anterior>
docker tag  ghcr.io/<owner>/tamv-atlas-nextgen/tamv-identity-api:<sha-anterior> tamv/nextgen-backend:latest
docker compose --profile full up -d nextgen-backend

# Atlas ingestion (re-run con commit anterior del pipeline)
git -C tamv-core-atlas checkout <sha-anterior>
docker compose --profile ingest run --rm atlas
```

## 7. Reverse proxy + HTTPS (Caddy)

```caddyfile
kodex.tamv.org {
  encode zstd gzip
  reverse_proxy localhost:3000
}

api.tamv.org {
  encode zstd gzip
  reverse_proxy localhost:8080
}
```

## 8. Healthchecks

| Servicio | Endpoint | Comando |
| --- | --- | --- |
| App Kodex | `GET /` | `wget -qO- http://127.0.0.1:3000/` |
| Backend NextGen | `GET /health` | `wget -qO- http://127.0.0.1:8080/health` |
| Atlas ingestion | `validate-atlas.sh` | `bash tamv-core-atlas/scripts/validate-atlas.sh` |
| Canon report | `GET /admin/canon` | abrir en navegador, debe mostrar 0 contradicciones |

## 9. Isabella-Gateway (TAMVAI) — servicio externo opcional

El isabella-gateway (Fastify + routing dinámico de modelos vLLM/Ollama,
Zero Trust con JWT, OpenTelemetry) **NO corre dentro de la app TanStack**
ni en el runtime serverless de Lovable Cloud: requiere un host Node con
acceso a GPUs locales o a un endpoint LLM externo.

Contrato OpenAPI 3.1 en `docs/tamvai-api.yml`. Para generar SDKs:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/tamvai-api.yml \
  -g typescript-fetch \
  -o packages/tamvai-sdk
```

Desplegar el gateway como contenedor separado (fuera de este compose) y
apuntar la app Kodex vía `VITE_TAMVAI_BASE_URL` cuando esté disponible.

## 10. Variables de entorno (runtime)

| Servicio | Variable | Default | Descripción |
| --- | --- | --- | --- |
| kodex | `PORT` | `3000` | Puerto HTTP SSR |
| kodex | `HOST` | `0.0.0.0` | Bind host |
| nextgen-backend | `PORT` | `8080` | Puerto backend |
| nextgen-backend | `ATLAS_OUT_DIR` | `/shared/atlas-feed` | Carpeta de export para bridge atlas |
| atlas | `GITHUB_TOKEN` | — | `public_repo` para descubrir/clonar repos |
| atlas | `GITHUB_OWNER` | `OsoPanda1` | Owner a indexar |

## 11. Troubleshooting

| Síntoma | Verificación | Acción |
| --- | --- | --- |
| `validate-atlas.sh` falla con "missing atlas/index.json" | `npm run build` en `tamv-core-atlas` | Verificar `GITHUB_TOKEN` y volver a correr el perfil `ingest`. |
| Bridge `from-nextgen` sin artefactos | `ls tamv-atlas-nextgen/data/**/*.json` | Levantar backend NextGen y dejar que produzca los JSON antes del pipeline atlas. |
| `/admin/canon` muestra contradicciones | Tabla del reporte | Auditar los 2+ docs con mismo `contentId`: alinear contenido o renombrar título canónico. |
| Push GHCR falla | Permisos workflow | Confirmar `packages: write` y `GITHUB_TOKEN` válido. |
| Backend NextGen no levanta | `docker compose logs nextgen-backend` | Confirmar `node:22-alpine`, `port 8080` libre, secretos `.env`. |
| SSH deploy falla | Variables/secrets en repo | Confirmar `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`. |

---

**Custodio canónico:** Edwin O. Castillo Trejo · ORCID 0009-0008-5050-1539
**DOI canon:** 10.5281/zenodo.19436662