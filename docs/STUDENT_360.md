# Cristian Cyber Academy — Student 360

## Objetivo

Student 360 concentra la evidencia académica y operacional necesaria para que un coordinator/admin entienda el estado de un learner sin navegar múltiples módulos.

## Ruta y autorización

- Ruta: `/student`
- Preview file: `student.html`
- Acceso: `coordinator` / `admin`
- Permiso frontend: `manage_users`
- Academy Core sigue siendo la autoridad final de permisos.

## Fuentes de datos

En modo Academy Core remoto se consumen:

- managed profiles;
- cohort memberships;
- cohorts;
- enrollments/progress;
- certificates;
- audit events.

Student 360 no crea un segundo repositorio de datos académicos.

## Cyber Skill Graph

El backend genérico de Academy todavía no expone una persistencia server-side del Crohnoz Cyber Skill Graph.

Por integridad de producto:

- preview: se muestran scores sintéticos y se etiquetan `PREVIEW SYNTHETIC`;
- remoto: no se fabrican scores; la UI muestra `PENDING CYBER DATA`;
- un futuro contrato server-side deberá entregar skill code, score, evidence window, confidence y updated_at.

## Next Best Action

Preview puede demostrar una recomendación derivada de la skill más baja.

En remoto, mientras no exista una API de recommendation/assignment server-side, Student 360 limita la recomendación al progreso académico disponible y no persiste una asignación ficticia.

## Privacy boundary

Student 360 puede mostrar:

- identidad académica autorizada;
- rol/account posture;
- cohorte;
- progreso y matrícula;
- certificados;
- audit events autorizados;
- skill evidence cuando exista un contrato aprobado.

No debe mostrar:

- passwords;
- raw authentication tokens;
- cookies/session IDs;
- raw AI prompts;
- sensitive lab payloads;
- real target identifiers;
- unrelated PII.

## Release gate v0.3.3

`tests/student360-contract.mjs` verifica:

- existencia de la superficie;
- role/permission gate;
- consumo de fuentes Academy Core;
- no-fabrication en remote mode;
- labeling explícito del preview sintético;
- safe DOM rendering;
- ausencia de password controls;
- login routing allowlist;
- clean Netlify route;
- PWA cache coverage.

Los tests están versionados pero no se consideran ejecutados hasta correrlos en un runner adecuado.
