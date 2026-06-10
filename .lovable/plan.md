# Plan de unificación CSP-α → producción

Trabajo grande pero acotado. Lo divido en 4 entregables coherentes que aterrizan tu mensaje sin tocar infra que no podemos verificar desde el sandbox (k8s, vLLM, Stripe real). Todo queda listo para que `docker compose up -d` lo levante en self-host.

## 1. DEPLOYMENT.md unificado (3 paquetes)

Reescribir `DEPLOYMENT.md` raíz para cubrir los tres boundaries reales:

- **App Kodex** (TanStack Start SSR) — `Dockerfile` + `docker-compose.yml` raíz, puerto 3000.
- **Backend NextGen** (`tamv-atlas-nextgen/backend`) — Node 22, puerto 8080, ya tiene Dockerfile propio.
- **Atlas ingestion** (`tamv-core-atlas`) — pipeline batch on-demand, perfil `ingest` en compose.

Incluir:
- Tabla de servicios, puertos, healthchecks y dependencias.
- Comandos self-host por paquete (build, run, logs, stop).
- Procedimiento de rollback por imagen GHCR con SHA explícito para cada uno.
- Flujo de ingesta: backend NextGen produce JSON canónicos → `tamv-core-atlas` los normaliza → `atlas/{index,graph,taxonomy}.json` → UI los lee.
- Sección "Verificación post-deploy" con `validate-atlas.sh` y check de `/admin/canon`.

Actualizar `docker-compose.yml` raíz para añadir el servicio `nextgen-backend` (build context `tamv-atlas-nextgen/`, dockerfile `backend/Dockerfile`).

## 2. Pipeline backend → ingesta + reporte de canon

- Añadir `tamv-core-atlas/ingestion/from-nextgen.ts`: lee artefactos JSON de `tamv-atlas-nextgen/data/` (federation reviews, bookpi blocks, knowledge reports) y los incorpora como fuentes para `normalize.ts`.
- Wiring en `scripts/sync-all.sh` para correr `from-nextgen` antes de `normalize`.
- Crear `src/lib/canon-consistency.ts`: scanner que recorre `WIKIS` + seeds y calcula:
  - hash SHA-256 por documento canónico,
  - detección de IDs duplicados con hashes distintos (contradicción doctrinal),
  - clusters por solapamiento de tags/título (sugerencia de convergencia).
- Página `/admin/canon` (route `src/routes/admin.canon.tsx`) que renderiza:
  - tabla de hashes,
  - alertas rojas por contradicción,
  - tabla de clusters sugeridos,
  - botón "Re-escanear" (recalcula client-side).
- Ruta `admin` (`src/routes/admin.tsx`) como layout simple con sidebar y `<Outlet />`.

## 3. Navegación completa `/wikis` (búsqueda, tags, deep-links)

Reemplazar `src/routes/wikis.tsx`:
- Input de búsqueda fulltext (filtra título + body markdown, debounced).
- Chips de tags (derivados de frontmatter / heurísticos por contenido).
- URL state: `?q=...&tag=...` para deep-links compartibles.
- Sidebar agrupada por repo de origen.
- Página individual `/wikis/$slug` ya existe; añadir:
  - breadcrumb,
  - tabla de contenidos auto-generada (h2/h3),
  - "Wikis relacionadas" por solapamiento de tags.

Extender `src/lib/wikis.ts` con: `tags`, `searchIndex` (texto plano sin markdown).

## 4. (Fuera de scope ahora) isabella-gateway real

El isabella-gateway con Fastify + routing dinámico de modelos NO se puede correr en este runtime (Cloudflare Workers, no Node host). Lo dejo documentado en `DEPLOYMENT.md` como servicio externo opcional, y dejo el OpenAPI 3.1 en `docs/tamvai-api.yml` para generación de SDKs futuros. La implementación viva debe correr fuera del sandbox de Lovable.

---

## Lo que NO voy a hacer en este turno (y por qué)

- **Levantar realmente el backend NextGen ni vLLM** — requieren k8s/GPU; queda solo el wiring docker-compose.
- **Ejecutar `validate-atlas.sh`** — necesita `npm install` dentro de `tamv-core-atlas` y artefactos reales; queda documentado en DEPLOYMENT.
- **Fusionar los 7 ZIP adjuntos nuevos** (`kernel-tamv-main`, `tamvonline-eco-main`, `genesis-digytamv-nexus`, etc.) en este mismo turno — ya tienes `tamv-atlas-nextgen/` integrado del turno anterior. Mezclar 4 monorepos más en una sola pasada rompería la coherencia. **Confírmame si quieres que en un turno siguiente los integre uno por uno** (recomiendo: `tamvonline-eco` como capa económica, `kernel-tamv` como kernel canónico, descartar `Codex Installer.exe` por seguridad).

## Archivos a tocar

```text
DEPLOYMENT.md                                  (reescritura)
docker-compose.yml                              (añadir nextgen-backend)
docs/tamvai-api.yml                             (nuevo, OpenAPI 3.1)
src/lib/wikis.ts                                (tags + searchIndex)
src/lib/canon-consistency.ts                    (nuevo)
src/routes/wikis.tsx                            (búsqueda/tags/URL state)
src/routes/wikis.$slug.tsx                      (TOC + relacionadas)
src/routes/admin.tsx                            (nuevo layout)
src/routes/admin.canon.tsx                      (nuevo reporte)
src/components/layout/AppShell.tsx              (entrada "Admin")
tamv-core-atlas/ingestion/from-nextgen.ts       (nuevo bridge)
tamv-core-atlas/scripts/sync-all.sh             (añadir paso)
```

¿Procedo con este plan, o quieres que añada/quite algo (p. ej. omitir admin, o sí incluir la fusión de los nuevos ZIP)?
