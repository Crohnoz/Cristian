# Cristian Cyber Academy — Identity & Access

## Objetivo

Cristian Cyber Academy reutiliza **Crohnoz Academy Core** como proveedor de identidad y expediente académico. La UI cyber no implementa un segundo sistema de usuarios.

## Superficies

- `/login` → acceso y solicitud de recuperación.
- `/account` → perfil, contraseña, postura de seguridad y cierre de sesión.
- `/reset-password` → confirmación de token y nueva contraseña.
- `/instructor` → requiere rol `instructor`.
- `/` / Mission Control → requiere sesión autenticada.

## Preview

Mientras `CCA_CONFIG.academyCore.enabled === false`, el deploy usa dos identidades **sintéticas** para validar UX y role routing:

- learner `alumno.demo`;
- instructor `cristian.demo`.

Estas cuentas no son credenciales productivas y no deben copiarse a un backend real.

## Producción

Cuando Academy Core esté habilitado:

1. `POST /api/v1/auth/token/` autentica usuario y contraseña.
2. El token DRF vive únicamente en `sessionStorage` del navegador.
3. Cada request autenticado usa `Authorization: Token …`.
4. `POST /api/v1/auth/logout/` invalida el token server-side.
5. `POST /api/v1/auth/change-password/` valida contraseña actual y política Django; al cambiarla elimina tokens existentes.
6. `POST /api/v1/auth/password-reset/request/` responde de forma genérica exista o no la cuenta.
7. El correo contiene un token firmado y temporal; nunca contiene una contraseña.
8. `POST /api/v1/auth/password-reset/confirm/` valida uid/token y política de contraseña, actualiza password e invalida sesiones anteriores.

La recuperación genérica vive en `Crohnoz/Crohnoz-academy` PR #37 para poder ser reutilizada por cualquier tenant Academy.

## Autorización por rol

El frontend aplica navegación por rol para UX, pero **no constituye la frontera de autorización productiva**. Las APIs de Academy Core deben seguir aplicando permisos y querysets server-side.

- learner → Mission Control, Academy, labs, cuenta y certificados propios;
- instructor → Instructor Operations y cohortes asignadas;
- roles superiores permanecen bajo las reglas de Academy Core.

Intentar abrir `/instructor` como learner redirige fuera de la consola. El parámetro `next` del login se limita a una allowlist same-origin para evitar open redirects.

## Perfil

`email`, rol y nombre institucional se consideran datos de identidad administrados por Academy Core. En la preview local el nombre puede modificarse para probar UX; con backend remoto el panel solo persiste campos que el serializer autoriza actualmente, como `locale`.

## Contraseñas

La UX exige 12 caracteres como mínimo, mientras Django conserva la autoridad final mediante `AUTH_PASSWORD_VALIDATORS`. No se persisten contraseñas nuevas en `localStorage` ni se envían a analytics/telemetry.

## MFA

El panel expone MFA como `ROADMAP`, no como una capacidad activa. No debe mostrarse como habilitado hasta que exista un mecanismo real en el proveedor de identidad y recuperación de cuenta compatible con MFA.

## Privacidad

- session recording OFF;
- contraseña y tokens excluidos de telemetría;
- recuperación no revela si un correo existe;
- tokens de autenticación en `sessionStorage`, no `localStorage`;
- ningún secreto de SMTP/API se versiona.

## Release gates

Antes de habilitar Academy Core remoto:

- [ ] ejecutar suite Academy Core incluyendo recovery tests;
- [ ] configurar `ACADEMY_PASSWORD_RESET_URL` del tenant;
- [ ] configurar SMTP real mediante secretos del entorno;
- [ ] validar CORS/CSRF/allowed hosts;
- [ ] confirmar token logout y password-change revocation;
- [ ] probar learner → login → account → logout;
- [ ] probar learner bloqueado de `/instructor`;
- [ ] probar instructor → login → `/instructor`;
- [ ] probar request → email → reset → nuevo login;
- [ ] revisar MFA antes de cualquier claim comercial sobre segundo factor.
