# Cristian Cyber Academy — Identity Operations

## Objetivo

Cristian Cyber Academy usa **Crohnoz Academy Core** como autoridad de identidad académica. La capa cyber no debe implementar un segundo sistema de usuarios.

El flujo objetivo es:

```text
coordinator/admin
  → crea invitación
  → Academy Core genera token temporal
  → correo o fallback manual entrega activation link
  → usuario elige username + password
  → invitación se consume
  → perfil académico nace con rol mínimo
  → coordinator asigna cohorte
  → learner/instructor entra a su superficie autorizada
  → coordinator/admin puede suspender/reactivar mediante acciones auditadas
```

## Superficies

| Ruta | Propósito | Acceso |
|---|---|---|
| `/login` | Login y solicitud de recuperación | pública |
| `/activate` | Activación one-time de invitación | pública con token |
| `/reset-password` | Confirmación de recuperación | pública con token |
| `/account` | Perfil, idioma, contraseña y sesión | autenticado |
| `/instructor` | Teaching Command Center | instructor/coordinator/admin |
| `/users` | Identity, lifecycle & Cohort Operations | coordinator/admin |

## Modelo de roles

### learner
- campus;
- labs;
- progreso propio;
- certificados propios;
- cuenta propia.

### instructor
- capacidades learner;
- docencia;
- lectura de cohortes asignadas;
- evidencia pedagógica autorizada;
- **sin** administración de identidades.

### coordinator
- capacidades instructor;
- invitaciones;
- roles no-admin;
- cohortes y memberships;
- suspensión/reactivación de cuentas no-admin;
- operación académica;
- contenido institucional.

### admin
- control institucional completo;
- puede asignar admin;
- puede administrar lifecycle de otros admins no-superuser;
- debe utilizarse de forma excepcional.

El frontend expone permisos (`learn`, `teach`, `manage_users`, `manage_cohorts`, etc.) para evitar que la autorización dependa de comparaciones dispersas de nombres de rol. El backend sigue siendo la autoridad final.

## Contraseñas

El panel administrativo **nunca** solicita ni muestra la contraseña de otra persona.

- Producción: Django almacena hashes de contraseña y aplica `AUTH_PASSWORD_VALIDATORS`.
- Cambio de password: exige la contraseña actual y revoca el token DRF existente.
- Password reset: usa token firmado/expirable y respuesta anti-enumeración.
- Invitación: el usuario define su credencial al activar el enlace.
- Preview: cuentas creadas mediante invitación usan PBKDF2-SHA256, salt aleatorio y Web Crypto. Las dos identidades demo base conservan credenciales fijas únicamente para demostración.

## Invitaciones

Academy Core mantiene `AccessInvitation` con:

- email;
- role;
- locale;
- expiración;
- token almacenado únicamente como hash;
- accepted/revoked timestamps;
- audit events.

El token raw se entrega una sola vez en la respuesta de creación y puede enviarse por email mediante `ACADEMY_INVITATION_ACTIVATION_URL` + SMTP configurable. El panel conserva un botón de copia como fallback operacional.

La cohorte sugerida puede viajar en metadata, pero **invitar y matricular son operaciones distintas**. Una identidad existente se agrega a una cohorte mediante `/api/v1/ops/cohort-memberships/`, donde Academy Core valida capacidad y crea la matrícula académica correspondiente.

## Suspensión y reactivación

`is_active` permanece **read-only** en el serializer genérico de perfiles. El lifecycle usa acciones explícitas:

```text
POST /api/v1/ops/profiles/{id}/suspend/
POST /api/v1/ops/profiles/{id}/reactivate/
```

Al suspender:

- se valida que el operador tenga permisos;
- se prohíbe auto-suspensión;
- un coordinator no puede suspender admin;
- superusers quedan fuera del API de tenant;
- `user.is_active` pasa a false;
- se eliminan los tokens DRF existentes del usuario;
- se registra `account.suspended`.

Al reactivar:

- se repiten los controles de autorización;
- `user.is_active` vuelve a true;
- se registra `account.reactivated`;
- el usuario debe autenticarse nuevamente para obtener una sesión.

Esto evita convertir una operación de alto impacto en un simple `PATCH is_active=false` difícil de auditar.

## Operaciones conectadas

`academy-core.adapter.js` expone:

- `opsProfiles()` / `updateOpsProfile()`;
- `suspendOpsProfile()` / `reactivateOpsProfile()`;
- `invitations()` / `createInvitation()` / `revokeInvitation()`;
- `activateInvitation()`;
- `opsCohorts()`;
- `opsMemberships()` / `createMembership()` / `updateMembership()`;
- `opsEnrollments()`;
- `opsCertificates()`;
- `opsAuditEvents()`.

En preview las mismas interfaces se representan con datos sintéticos locales.

## Auditoría

El modelo productivo registra al menos:

- invitación creada/revocada/aceptada;
- login exitoso;
- profile update / role change;
- account suspended/reactivated;
- cohort membership;
- password change;
- password reset request/completion;
- logout;
- matrículas, progreso, evaluaciones y certificados.

No deben registrarse contraseñas, tokens raw, prompts completos, cookies ni credenciales.

## Estado v0.3.2

Implementado en Cristian:

- login role-aware;
- coordinator preview para Cristian;
- `/users` Identity Operations;
- invitaciones y revocación;
- activation flow;
- cuentas preview derivadas con PBKDF2;
- cambio de roles;
- asignación/remoción de cohortes;
- progreso agregado;
- estado ACTIVE/SUSPENDED;
- último acceso cuando Academy Core lo provee;
- suspensión/reactivación;
- audit trail;
- account panel;
- password recovery contract;
- clean routes + PWA cache;
- Academy Core adapter de operaciones.

Backend compartido en revisión:

- password reset reusable;
- email de activación por invitación;
- login audit + `last_login`;
- activity posture de perfiles;
- suspensión/reactivación auditada con revocación de token;
- pruebas negativas de lifecycle.

## Gates productivos pendientes

1. Ejecutar gates Django/SQLite y PostgreSQL del Academy Core.
2. Configurar SMTP real y dominios frontend autorizados.
3. Elegir deployment privado/staging del backend.
4. Conectar `academyCore.apiBaseUrl` sin versionar secrets.
5. Validar CORS/CSRF/TLS y rate limits.
6. Pruebas negativas de tenant boundaries en staging.
7. MFA/step-up authentication para acciones administrativas de alto riesgo.
8. QA humano desktop/mobile del lifecycle completo: invite → activate → login → suspend → denied → reactivate → login.
