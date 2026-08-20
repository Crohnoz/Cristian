# Cristian Cyber Academy

Plataforma white-label de entrenamiento práctico en ciberseguridad desarrollada por **Crohnoz Labs**.

> **Learn → Practice → Attack/Defend → Explain → Score → Certify**

## Estado actual — Premium MVP v0.2.0

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
- configuración white-label por tenant;
- telemetría Crohnoz local y privacy-safe;
- PWA instalable + offline application shell;
- contrato SQL multi-tenant con RLS;
- smoke tests sin dependencias;
- CSP y security headers defensivos para Vercel.

## Rutas

| Ruta | Función |
|---|---|
| `/` | Mission Control / experiencia del alumno |
| `/instructor` | Teaching Command Center |
| `/certificate` | Estado de certificación demo |

## White-label

La personalización pública y no sensible vive en:

```text
tenant.config.js
```

Permite adaptar marca, instructor, tenant, ambiente y metadata de producto sin reescribir la experiencia. Nunca deben almacenarse secretos en este archivo.

## Telemetría

`telemetry.js` implementa un bus local de eventos Crohnoz. En demo no envía datos a terceros: guarda un buffer acotado en `localStorage` y emite eventos `crohnoz:telemetry` para permitir una futura integración con observabilidad/analytics mediante adapter.

## PWA / Offline

`manifest.webmanifest` + `sw.js` convierten la plataforma en una aplicación instalable y mantienen disponible el application shell local. El service worker solo cachea recursos first-party del producto.

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
- El futuro Cyber Range debe usar sesiones efímeras, deny-egress por defecto, límites de recursos y destrucción automática.

Ver `SECURITY.md` y `docs/ARCHITECTURE.md`.

## Demo comercial

El recorrido recomendado está documentado en:

```text
docs/DEMO_RUNBOOK.md
```

## Deployment

Vercel es el target primario. Existe un fallback autocontenido READY rastreado en issue #3; el objetivo operativo sigue siendo desplegar directamente la rama multiarchivo como fuente única y validar visualmente `/`, `/instructor` y `/certificate` antes de merge/production.

## Próxima transición

1. resolver preview canónico multiarchivo;
2. validar desktop/mobile y headers;
3. mover el repositorio a privado antes de conectar servicios sensibles;
4. conectar Supabase/Auth mediante adapter remoto;
5. integrar observabilidad/analytics con consentimiento y tenant scoping;
6. conectar AI Mentor real con retrieval, guardrails y evaluación;
7. levantar Cyber Range en infraestructura separada;
8. promover a producción solo después de QA y revisión de seguridad.
