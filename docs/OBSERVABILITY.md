# Observability — Cristian Cyber Academy

## Objetivo

Medir la salud del producto y los resultados de aprendizaje sin convertir la academia en una superficie de vigilancia ni capturar material sensible.

## Capas

### 1. Learning evidence

Estado pedagógico necesario para que el alumno vea progreso y el instructor pueda enseñar:

- intentos;
- resultados agregados;
- XP;
- readiness;
- skills;
- certificados;
- asignaciones.

En la demo se mantiene en `localStorage`. En producción debe migrar al core multi-tenant con RLS.

### 2. Crohnoz local telemetry

`telemetry.js` mantiene un buffer local y acotado para troubleshooting y trazabilidad de la demo. No transmite datos por red.

### 3. Product analytics

`analytics.js` agrega un límite explícito entre la app y cualquier proveedor de analítica:

- eventos en allowlist;
- propiedades en allowlist;
- strings truncados;
- tenant y versión agregados automáticamente;
- provider remoto apagado por defecto;
- consentimiento explícito requerido antes de cualquier forward remoto.

## Datos prohibidos en analítica

Nunca enviar:

- nombres, correos, teléfonos o identificadores personales;
- contenido de mensajes simulados;
- direcciones de correo analizadas;
- respuestas textuales del alumno;
- prompts completos enviados al mentor;
- payloads, exploits o comandos de laboratorio;
- credenciales, tokens, cookies o secretos;
- IP como identificador pedagógico;
- screenshots o grabaciones de sesión.

## PostHog

El proyecto conectado se reserva inicialmente para feature flags, experimentos y futura analítica consentida.

Flags creados:

- `cca-premium-experience` — premium UX rollout, actualmente habilitado;
- `cca-ai-mentor-live` — activación futura del mentor respaldado por modelo, actualmente deshabilitado.

Session recording debe permanecer deshabilitado para este producto salvo una revisión específica de privacidad y seguridad.

## Eventos permitidos

El adapter acepta únicamente eventos de bajo riesgo como:

- `app_opened`;
- `view_opened`;
- `phishing_correct` / `phishing_retry`;
- `range_completed` / `range_retry`;
- `certificate_unlocked`;
- `achievement_unlocked`;
- `mentor_topic` usando solo una categoría, nunca el texto de la pregunta;
- `assignment_created`;
- `evidence_exported`;
- `command_opened`;
- `pwa_ready`.

## Producción

Antes de activar un provider remoto:

1. repositorio privado;
2. política de privacidad definida;
3. consentimiento UX implementado;
4. dominio y proxy/endpoint aprobados;
5. analytics provider configurado fuera del código fuente;
6. verificación de que no exista session recording;
7. revisión de eventos/property payloads;
8. test de red demostrando que contenido sensible no abandona el navegador.
