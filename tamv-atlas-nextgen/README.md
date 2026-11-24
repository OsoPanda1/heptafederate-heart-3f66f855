# TAMV Atlas

Plataforma full‑stack para operar el **Atlas TAMV**: una base de conocimiento/operación con frontend React, backend Node, integración de identidad (DID/PID), firma criptográfica, eventos XR y pipeline de federación de repositorios.

> Este README describe el **estado real actual del repo** (no roadmap idealizado), incluyendo nivel de madurez para producción y despliegue.

---

## 1) ¿Qué es este repositorio?

`tamv-atlas` es un monorepo operativo que combina:

- **Frontend web** (Vite + React + TypeScript) para Atlas/Wiki y módulos TAMV.
- **Backend API** (Node HTTP nativo + ESM) con endpoints de identidad, firmas, fusión de repos y eventos.
- **Núcleo federado** (`AtlasKernel`) con contratos y lógica de protocolos/economía/eventos.
- **Integración opcional con Supabase** como persistencia y señalización SSE/WebRTC.
- **Scripts de unificación** para descubrir/importar repos de `OsoPanda1` vía GitHub API + `git subtree`.

En resumen: este repo sirve como **plataforma base de operación del Atlas** (contenido + identidad + protocolos + telemetría).

---

## 2) ¿Qué hace hoy, de forma funcional?

### Frontend

- Renderiza páginas y rutas wiki/módulos TAMV.
- Consume backend para firmas, investigación/fusión y métricas (según configuración `VITE_TAMV_BACKEND_URL`).

### Backend

Expone endpoints funcionales para:

- Salud del servicio (`/healthz`).
- Identidad organizacional y DID (`/v1/identity/*`).
- Estado de PIDs (ORCID/Zenodo/ISNI) (`/v1/pids/status`).
- Firma y verificación de payloads (`/v1/signature/sign`, `/v1/signature/verify`).
- Chat/visión/audio/háptica y ledger de Isabella (`/api/v1/*`).
- Usuarios, protocolos, economía y stream XR con persistencia opcional (`/v1/users`, `/v1/protocols/execute`, `/v1/economy/ledger`, `/v1/xr/*`).
- Postura de seguridad/antifragilidad (`/v1/security/posture`).

### Federación de repos

- Descubre repos del owner en GitHub.
- Genera manifiesto consolidado.
- Puede importar repos por `subtree --squash` en `federation/`.

---

## 3) ¿Cómo lo hace? (arquitectura real)

```text
[React/Vite Frontend]
         |
         | HTTP (REST)
         v
[Node API Server]
  |      |         |
  |      |         +--> [Repo Fusion Service -> Bash script -> GitHub API/git subtree]
  |      +------------> [Identity/PQC/PID modules]
  +-------------------> [AtlasKernelRuntime]
                           |
                           +--> [Supabase persistence/events/signals] (opcional por env)
```

Principio operativo real:

- Si no hay `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, la API sigue viva pero desactiva rutas que requieren persistencia (responde `503` con mensaje explícito).

---

## 4) ¿Para qué sirve?

- **Orquestación de Atlas TAMV**: identidad, protocolos y ledger básico en un solo backend.
- **Base de producto digital**: wiki + operación API para iterar producto real.
- **Núcleo de integración**: puente entre narrativa/canon TAMV y ejecución técnica verificable.
- **Preparación de ecosistema federado**: consolidación de repositorios y estructura común.

---

## 5) ¿Para quién sirve?

- **Equipo núcleo TAMV (producto/arquitectura/operaciones)**: para consolidar stack y despliegue.
- **Desarrolladores full‑stack**: para extender frontend, API y kernel federado.
- **Investigación/estrategia digital**: para auditar madurez y planificar evolución a producción.
- **Socios técnicos**: para integración con identidades, señales XR y flujos antifragilidad.

---

## 6) Importancia y posicionamiento global (honesto)

### Importancia

- Resuelve un punto clave: pasar de documentación dispersa a **base ejecutable** con API+frontend.
- Ya ofrece componentes diferenciales (identidad soberana, firma, eventos y federación de repos).

### Posicionamiento global actual

- **Etapa:** pre‑producción avanzada / consolidación.
- **Ventaja:** visión transversal (frontend + backend + protocolos + identidad + repos).
- **Brecha:** hardening operativo (seguridad, observabilidad, CI/CD robusto, cumplimiento, SLAs).

No está en nivel “enterprise global listo” todavía; está en nivel “plataforma técnicamente prometedora con piezas funcionales”.

---

## 7) Porcentaje real de avance para producción y despliegue

> Estimación técnica basada en lo implementado visible en código, scripts y pruebas actuales.

| Área | Estado real | % avance |
|---|---|---:|
| Frontend funcional (rutas, páginas, build) | Sólido para iteración | **78%** |
| Backend funcional (endpoints core operativos) | Funcional, aún monolítico | **72%** |
| Persistencia real (Supabase opcional) | Integrada pero dependiente de env y endurecimiento | **58%** |
| Seguridad operativa (controles, posture endpoint) | Base creada, faltan controles enterprise | **46%** |
| Observabilidad y monitoreo | Parcial (sin stack integral de tracing/alerting) | **38%** |
| Calidad/QA automatizada | Existe test suite, pero con señales de estabilidad pendientes en runner | **52%** |
| CI/CD y despliegue productivo | Parcial, requiere pipeline endurecido y gates | **44%** |
| Gobernanza de APIs/contratos | Buena base, falta versionado y políticas formales | **55%** |
| Federación de repos OsoPanda1 | Descubrimiento/importación funcional | **68%** |

### Promedio ponderado de readiness

- **Readiness producción (global): 56%**
- **Readiness despliegue controlado (staging/partners): 67%**

Interpretación:

- Ya puede desplegarse en **entornos controlados** (demo, staging, pilotos).
- Aún no recomendable para **producción crítica a gran escala** sin hardening adicional.

---

## 8) Qué falta para llegar a producción global (prioridad)

1. **Estabilizar pruebas y ejecución concurrente** (eliminar cuelgues/handles abiertos, separar puertos y lifecycles por suite).
2. **Seguridad enterprise**: authn/authz robusta, rate limiting, CORS estricto por entorno, secrets rotation, auditoría firmada.
3. **Observabilidad total**: métricas, logs estructurados, tracing distribuido, alertas y SLOs.
4. **CI/CD con quality gates**: lint, test, typecheck, build, security scans, release strategy.
5. **Contrato API formal** (OpenAPI/versionado/deprecación).
6. **Runbooks operativos** y recuperación (backup/restore, incident response, chaos drills).

---

## 9) Ejecución local

### Frontend

```bash
npm install
npm run dev
```

### Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### API local

```bash
npm run api:start
```

Variables clave:

- `VITE_TAMV_BACKEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TAMV_ORCID`, `TAMV_ZENODO_RECORD`, `TAMV_ISNI`
- `TAMV_SIGNING_SEED` (obligatoria: 32 bytes aleatorios en hexadecimal)
- `TAMV_CORS_ALLOWED_ORIGIN` (opcional: origen exacto para frontend separado)

---

## 10) Clave de firma y CORS

El backend utiliza **Ed25519** para firmar y verificar. ML-DSA/PQC permanece como hoja de ruta y no está activado como algoritmo de firma.

`TAMV_SIGNING_SEED` es obligatoria y debe contener exactamente 64 caracteres hexadecimales que representen 32 bytes generados aleatoriamente. Desde ese secreto se deriva una clave Ed25519 estable; el `keyId` se calcula con la huella de la clave pública, no con un valor predeterminado conocido. No reutilices la misma semilla entre entornos ni la guardes en Git.

Genera una semilla local con Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Guarda el resultado únicamente en el gestor de secretos del entorno de ejecución. El ejemplo de Kubernetes contiene un marcador deliberadamente inválido hasta que el operador lo sustituya.

**Compatibilidad de firmas previas:** las firmas anteriores a esta corrección usaban claves Ed25519 efímeras no persistidas. No se garantiza que continúen siendo verificables tras reiniciar o migrar; conserva las claves públicas históricas disponibles y verifica los registros firmados durante la migración.

Para un frontend alojado en otro origen, define `TAMV_CORS_ALLOWED_ORIGIN` con un origen HTTP(S) exacto, sin ruta ni credenciales. En producción, si la variable no está definida, el backend no concede CORS a orígenes web externos; los clientes del mismo origen siguen funcionando. El comodín `*` solo se permite fuera de producción. La postura de seguridad seguirá en estado `degraded` si falta una semilla válida, la triangulación de PIDs, la persistencia o CORS restringido.

## 11) Estado ejecutivo

**TAMV Atlas hoy es un sistema real funcional en evolución**, con capacidad de operar casos de uso concretos y base suficientemente robusta para pilotos serios. Su siguiente salto no depende de “más idea”, sino de **industrialización técnica** (hardening, observabilidad, CI/CD y seguridad operativa).
