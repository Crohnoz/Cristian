# Threat Model — Cristian Cyber Academy

## Scope

Este documento cubre la web app, el plano de datos, la telemetría/analítica y el futuro Cyber Range. La demo actual no ejecuta ataques reales; el objetivo es fijar límites antes de habilitar infraestructura dinámica.

## Activos

1. Identidad y permisos de alumnos, instructores y administradores.
2. Evidencia de aprendizaje, scores y certificados.
3. Contenido propietario y configuración white-label.
4. Credenciales de infraestructura y proveedores.
5. Aislamiento del Cyber Range.
6. Integridad de la analítica y del Skill Graph.
7. Privacidad del contenido ingresado por alumnos.

## Trust boundaries

### Browser ↔ Web App

Todo estado del navegador es no confiable. `localStorage`, parámetros de URL, hashes y contenido ingresado deben tratarse como datos controlados por usuario.

### Web App ↔ Core API

En producción, autenticación no reemplaza autorización. Cada operación debe validar tenant, rol y ownership server-side.

### Core API ↔ Data Plane

RLS constituye defensa en profundidad, no la única autorización. Las políticas deben negar por defecto y todo acceso cross-tenant debe ser imposible salvo operaciones administrativas explícitas.

### Web App ↔ Analytics

Solo eventos y propiedades allowlisted pueden abandonar el navegador. Session recording permanece deshabilitado. Prompts, mensajes, emails, payloads y PII están fuera del contrato de analítica.

### Web App/Core ↔ Cyber Range

El Range es una zona hostil por diseño. Nunca comparte secretos, red, service accounts ni datastore con producción.

## Threats and controls

### Spoofing

**Threats**
- suplantación de instructor/admin;
- sesiones robadas;
- certificados falsificados.

**Controls**
- proveedor de autenticación robusto;
- MFA para roles privilegiados;
- cookies seguras/rotación de sesión;
- autorización server-side;
- certificados firmados/verificables en producción;
- audit trail administrativo.

### Tampering

**Threats**
- modificar XP/scores desde cliente;
- alterar assignments;
- modificar manifests de labs;
- manipular feature flags.

**Controls**
- el cliente nunca es fuente autoritativa en producción;
- attempts y scoring calculados/validados server-side;
- manifests versionados y validados contra schema;
- feature flags administrados fuera del cliente;
- commits/reviews para cambios de contenido sensible.

### Repudiation

**Threats**
- negar cambios administrativos;
- dificultad para reconstruir quién asignó o publicó contenido.

**Controls**
- audit log append-only para acciones privilegiadas;
- timestamps server-side;
- actor, tenant, resource y action en cada evento administrativo.

### Information Disclosure

**Threats**
- exposición cross-tenant;
- prompts o respuestas en analytics;
- secretos en repositorio/logs;
- datos reales en phishing/labs.

**Controls**
- RLS + tenant scoping;
- analytics allowlist y consentimiento;
- session recording OFF;
- secret manager/env vars fuera del repo;
- datos sintéticos y dominios `.example`;
- redacción de logs;
- CSP y output encoding.

### Denial of Service

**Threats**
- abuso del AI Mentor;
- creación masiva de labs;
- consumo excesivo de CPU/RAM;
- campañas/simulaciones abusivas.

**Controls**
- quotas por tenant/usuario;
- rate limits;
- límites de tokens/modelo;
- TTL de labs;
- CPU/RAM hard limits;
- concurrent-session caps;
- circuit breakers y presupuestos FinOps.

### Elevation of Privilege

**Threats**
- alumno accede a Instructor Console real;
- instructor se convierte en tenant admin;
- lab alcanza producción;
- object IDs permiten BOLA.

**Controls**
- RBAC server-side;
- políticas por tenant y recurso;
- tests negativos de autorización;
- Range en cuenta/proyecto/red separados;
- deny-egress;
- jamás confiar en IDs enviados por cliente.

## Cyber Range security invariants

Un lab real solo puede iniciarse si:

- el manifest valida contra `schemas/lab-manifest.schema.json`;
- `target_type == synthetic`;
- `network_policy == isolated-no-egress`;
- `secrets == none`;
- el usuario está autenticado y autorizado;
- existe quota disponible;
- el lab tiene TTL;
- la imagen pertenece al catálogo aprobado;
- no existen mounts/credentials de producción;
- lifecycle y destroy events quedan auditados.

## AI Mentor security invariants

- el flag `cca-ai-mentor-live` debe estar activo;
- no entregar automáticamente soluciones completas cuando una pista pedagógica basta;
- no recibir secretos, credenciales o PII;
- recuperar contexto únicamente del tenant y curso autorizados;
- prompts del alumno no se envían a product analytics;
- logs de modelo deben minimizar contenido y respetar retención definida;
- tool use, si existe, limitado a recursos educativos explícitos.

## Release gates

Antes de producción:

1. repositorio privado;
2. autenticación + RBAC;
3. RLS revisado;
4. negative authorization tests;
5. CSP/headers verificados sobre HTTP real;
6. dependency/security scan;
7. analytics privacy test;
8. backups y restore drill;
9. incident runbook;
10. Range y AI reales permanecen feature-gated hasta security sign-off.
