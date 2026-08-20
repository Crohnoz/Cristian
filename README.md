# Cristian Cyber Academy

Plataforma de entrenamiento práctico en ciberseguridad desarrollada por **Crohnoz Labs**.

> **Learn → Practice → Attack/Defend → Explain → Score → Certify**

## Estado actual

La rama `feat/cyber-academy-mvp` contiene una **demo end-to-end funcional** sin backend ni secretos:

- experiencia del alumno;
- Academy;
- Phishing Lab con escenarios ficticios y dominios `.example`;
- Cyber Range defensivo/simulado;
- AI Mentor en modo local;
- Skill Graph;
- XP y scoring;
- progreso persistente en `localStorage`;
- learning event trail;
- Instructor Console;
- certificado demostrativo con gate de progreso;
- contrato SQL multi-tenant con RLS;
- smoke tests sin dependencias;
- security headers y CSP para Vercel.

## Rutas

| Ruta | Función |
|---|---|
| `/` | Experiencia del alumno |
| `/instructor` | Consola de Cristian / instructor |
| `/certificate` | Estado de certificación demo |

## Ejecutar localmente

No requiere instalación de dependencias para la demo estática.

Puede servirse con cualquier servidor HTTP estático. Para validar invariantes del repositorio:

```bash
npm test
```

El test usa únicamente Node.js >= 18.

## Arquitectura

La demo usa `localStorage` deliberadamente para poder mostrar el flujo completo sin conectar infraestructura sensible.

El contrato del backend real está en:

```text
supabase/001_core_schema.sql
```

Incluye:

- tenants;
- memberships y roles;
- cohorts;
- modules;
- labs;
- assignments;
- attempts;
- skill scores;
- learning events;
- certificates;
- Row Level Security.

La migración a backend real debe realizarse mediante un adapter de persistencia, reemplazando el almacenamiento local sin reescribir la experiencia de usuario.

## Seguridad

- Todo laboratorio ofensivo real debe ejecutarse únicamente en entornos aislados y autorizados.
- No se almacenan credenciales reales en simulaciones.
- Los ejercicios de phishing usan identidades, dominios y datos ficticios.
- No se aceptan targets externos arbitrarios.
- Secrets y claves nunca se versionan en el repositorio.
- El futuro Cyber Range debe usar sesiones efímeras, egress denegado por defecto, límites de recursos y destrucción automática.

Ver `SECURITY.md` y `docs/ARCHITECTURE.md`.

## Demo comercial

El recorrido recomendado está documentado en:

```text
docs/DEMO_RUNBOOK.md
```

## Deployment

Vercel es el target primario. El preview está actualmente bloqueado por permisos del proyecto Vercel y se rastrea en el issue **#3**. No se ha promovido ningún build a producción.

## Próxima transición

Una vez que el repositorio sea privado y el permiso de Vercel esté resuelto:

1. crear/conectar proyecto Supabase;
2. aplicar migración con RLS;
3. implementar autenticación y adapter remoto;
4. conectar AI Mentor real con guardrails;
5. levantar el Cyber Range en infraestructura separada;
6. validar desktop/mobile y seguridad sobre preview;
7. promover únicamente después de esa validación.
