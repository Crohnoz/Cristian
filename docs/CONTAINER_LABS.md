# Container Labs · Cristian Cyber Academy

## Objetivo

Container Labs integra aplicaciones deliberadamente vulnerables dentro de la experiencia pedagógica de Cristian Cyber Academy sin convertir el sitio público ni el campus en un host de aplicaciones vulnerables permanentes.

La versión `1.0.0-rc.1` incorpora dos previews:

| Lab | Imagen prevista | Foco | Preview |
|---|---|---|---|
| OWASP Juice Shop | `bkimminich/juice-shop:20.2.0` | Web Security / OWASP Top 10 | `/container-lab.html` |
| VAmPI | `brightsec/vampi:latest` | API Security / OpenAPI 3 | `/api-lab.html` |

`content/container-labs.json` es la allowlist académica inicial. `runtimeEnabled` permanece en `false` para el release candidate público.

## Experiencia del alumno

1. Academy muestra el catálogo de Container Labs.
2. El alumno abre un workspace integrado.
3. Antes de acceder al runtime, ve objetivos, duración, nivel e Isolation Guard.
4. Academy solicita una sesión al futuro Container Lab Launcher.
5. El launcher provisiona una instancia efímera exclusiva para esa sesión.
6. El alumno trabaja únicamente contra el endpoint temporal asignado.
7. Academy registra evidencia pedagógica, no tráfico sensible ni secretos.
8. La instancia expira y es destruida automáticamente.

## Frontera de seguridad

Los contenedores vulnerables **no deben ejecutarse dentro del mismo runtime o red de confianza que el frontend público, Academy Core, bases de datos, secretos o infraestructura administrativa**.

Requisitos mínimos del launcher:

- imágenes allowlisted e idealmente fijadas por digest;
- una instancia por sesión/alumno;
- vida útil corta y expiración automática;
- CPU/memoria/PID limits;
- filesystem efímero o read-only cuando sea viable;
- usuario no-root cuando la imagen lo soporte;
- sin Docker socket expuesto al contenedor;
- `deny-egress` por defecto;
- sin acceso a redes de producción, Tailscale administrativa ni metadata services;
- sin secretos productivos ni variables de entorno sensibles;
- dataset ficticio/reiniciable;
- reverse proxy con URL aleatoria y autorización temporal;
- rate limits y límite de concurrencia;
- destrucción de sesión al expirar o cerrar;
- auditoría de lifecycle (`requested`, `ready`, `expired`, `destroyed`) sin capturar payloads sensibles.

## Juice Shop

OWASP Juice Shop es una aplicación deliberadamente insegura utilizada para entrenamiento, awareness, CTF y testing de herramientas. En Academy se presenta primero como un laboratorio guiado de Web Security.

El preview v1 muestra:

- storefront integrado;
- objetivos pedagógicos;
- metadata de runtime;
- estado de aislamiento;
- evidencia demo.

El runtime real queda deshabilitado hasta disponer del launcher aislado.

## VAmPI

VAmPI es una API Flask basada en OpenAPI 3 orientada a enseñar/evaluar vulnerabilidades de API. Incluye Swagger UI y puede ejecutarse en configuración vulnerable o no vulnerable.

Esto permite construir ejercicios como:

- distinguir autenticación de autorización;
- modelar recursos y límites de confianza;
- Broken Object Level Authorization;
- mass assignment;
- data exposure;
- rate limiting;
- comparación vulnerable/mitigada;
- false-positive / false-negative analysis.

El preview v1 muestra una interfaz tipo Swagger y una misión centrada en razonamiento defensivo. No realiza requests contra APIs externas.

## Señales académicas

Cuando el launcher exista, Academy debe registrar únicamente señales necesarias para aprendizaje, por ejemplo:

```text
lab_id
session_id pseudonimizado
started_at
completed_at
objective_id
objective_status
score
instructor_feedback_status
```

No registrar por defecto:

- passwords;
- tokens de la aplicación vulnerable;
- cookies;
- request/response bodies completos;
- prompts completos;
- secretos descubiertos dentro del lab;
- tráfico de terceros.

## Teacher Intranet

Teacher Intranet puede mostrar:

- sesiones activas/expiradas;
- objetivos completados;
- tiempo de laboratorio;
- evidencia entregada;
- alumnos que requieren apoyo;
- comparación de progreso por cohorte.

El profesor no necesita acceso al host Docker ni al plano de administración del launcher para realizar su trabajo cotidiano.

## Estado v1 RC

- Catálogo visual: **READY**.
- Juice Shop preview integrado: **READY**.
- VAmPI preview integrado: **READY**.
- RBAC de rutas: **READY**.
- PWA/cache coverage: **READY in source**.
- Runtime Docker público: **DISABLED**.
- Launcher aislado: **PENDING post-v1 infrastructure**.
- Exposición de contenedores vulnerables directamente en Vercel: **NOT ALLOWED BY DESIGN**.
