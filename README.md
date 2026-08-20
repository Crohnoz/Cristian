# Cristian Cyber Academy

Plataforma white-label de entrenamiento práctico en ciberseguridad desarrollada por **Crohnoz Labs**.

> **Learn → Practice → Attack/Defend → Explain → Score → Certify**

## Estado actual — Premium MVP v0.2.1

La rama `feat/cyber-academy-mvp` contiene una demo end-to-end funcional, sin backend sensible ni secretos, con:

- Mission Control del alumno;
- Academy con learning paths;
- Phishing Lab con 6 escenarios ficticios y dominios `.example`;
- Cyber Range defensivo/simulado;
- AI Mentor local con guardrails pedagógicos;
- Crohnoz Skill Graph y señal adaptativa;
- XP, scoring, achievements y readiness;
- progreso persistente en `localStorage`;
- learning event trail;
- Crohnoz Command Deck (`Ctrl/Cmd + K`);
- deep-links por vista;
- Instructor Teaching Command Center;
- live learner signal;
- evidencia exportable CSV;
- certificado demostrativo con gate de progreso;
- Privacy & Data Control Center;
- configuración white-label por tenant;
- telemetría Crohnoz local y privacy-safe;
- adapter de analytics con consentimiento y allowlists;
- feature flags PostHog para premium, AI Mentor real y Cyber Range real;
- PWA instalable + offline application shell;
- currículo y catálogo de labs versionados como datos;
- schemas JSON para learning events y lab manifests;
- contrato SQL multi-tenant con RLS;
- threat model y contrato de observabilidad;
- smoke tests sin dependencias;
- CSP y security headers defensivos para Vercel.

## Rutas

| Ruta | Función |
|---|---|
| `/` | Mission Control / experiencia del alumno |
| `/instructor` | Teaching Command Center |
| `/certificate` | Estado de certificación demo |
| `/privacy` | Privacy & Data Control Center |

## White-label

La personalización pública y no sensible vive en:

```text
tenant.config.js
```

Permite adaptar marca, instructor, tenant, ambiente, política de observabilidad, feature flags y metadata de producto sin reescribir la experiencia. Nunca deben almacenarse secretos en este archivo.

## Observabilidad y privacidad

`telemetry.js` implementa un bus local de eventos Crohnoz con allowlist de propiedades. En demo no envía datos a terceros.

`analytics.js` define la frontera para cualquier proveedor remoto:

- remote analytics OFF por defecto;
- consentimiento explícito requerido;
- eventos y propiedades allowlisted;
- PII prohibida;
- prompts completos prohibidos;
- session recording OFF.

La política está documentada en `docs/OBSERVABILITY.md` y puede inspeccionarse desde `/privacy`.

### Feature flags

PostHog mantiene tres rollout gates:

- `cca-premium-experience` — habilitada;
- `cca-ai-mentor-live` — deshabilitada;
- `cca-cyber-range-live` — deshabilitada.

Las capacidades de mayor riesgo quedan apagadas hasta completar backend, privacidad y security sign-off.

## PWA / Offline

`manifest.webmanifest` + `sw.js` convierten la plataforma en una aplicación instalable y mantienen disponible el application shell local, incluido Privacy Center. El service worker solo cachea recursos first-party del producto.

## Content contracts

El contenido deja de depender exclusivamente de markup hardcoded:

```text
content/learning-paths.json
content/labs.json
schemas/learning-event.schema.json
schemas/lab-manifest.schema.json
```

Estos contratos permiten que Academy, AI Mentor y Cyber Range compartan una fuente versionada y validable.

## Ejecutar localmente

No requiere instalación de dependencias para la demo estática. Puede servirse con cualquier servidor HTTP estático.

Para validar invariantes del repositorio:

```bash
npm test
```

El test usa únicamente Node.js >= 18.

## Backend productivo

La demo usa `localStorage` deliberadamente para mostrar el flujo completo sin infraestructura sensible. El contrato del backend real está en:

```text
supabase/001_core_schema.sql
```

Incluye tenants, memberships/roles, cohorts, modules, labs, assignments, attempts, skill scores, learning events, certificates y Row Level Security.

La migración productiva debe realizarse mediante un adapter de persistencia, reemplazando almacenamiento local sin reescribir UX.

## Seguridad

- Laboratorios ofensivos reales únicamente en entornos aislados y autorizados.
- Sin credenciales reales en simulaciones.
- Phishing con identidades y dominios ficticios.
- Sin targets externos arbitrarios.
- Secrets y API keys nunca se versionan.
- CSP estricta, framing denegado y `object-src 'none'`.
- Analytics no recibe prompts, emails, secretos ni contenido sensible de labs.
- Session recording permanece deshabilitado.
- El futuro Cyber Range usa manifests validados, sesiones efímeras, deny-egress por defecto, límites de recursos y destrucción automática.

Ver:

```text
SECURITY.md
docs/ARCHITECTURE.md
docs/THREAT_MODEL.md
docs/OBSERVABILITY.md
```

## Demo comercial

El recorrido recomendado está documentado en:

```text
docs/DEMO_RUNBOOK.md
```

## Deployment

Vercel es el target primario. Existe un preview premium autocontenido READY rastreado en el PR/issue #3; el objetivo operativo sigue siendo desplegar directamente la rama multiarchivo como fuente única y validar visualmente todas las rutas antes de merge/production.

## Próxima transición

1. resolver preview canónico multiarchivo;
2. validar desktop/mobile y headers;
3. mover el repositorio a privado antes de conectar servicios sensibles;
4. elegir explícitamente organización/entorno Supabase de staging y aplicar schema;
5. conectar Auth + adapter remoto;
6. activar analítica remota únicamente tras consentimiento y policy review;
7. conectar AI Mentor real detrás de `cca-ai-mentor-live`;
8. levantar Cyber Range separado detrás de `cca-cyber-range-live`;
9. promover a producción solo después de QA y revisión de seguridad.
