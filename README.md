# Cristian Cyber Academy

**Cristian Cyber Academy** es una experiencia white-label de aprendizaje práctico en ciberseguridad desarrollada por **Crohnoz Labs**.

> **Learn → Practice → Explain → Score → Certify**

## Estado — v1.0.0 Release Candidate

La versión 1 organiza el producto en cuatro superficies claramente separadas:

1. **Vitrina pública** — propuesta de valor, cursos, metodología e instructor. No requiere autenticación.
2. **Campus del alumno** — onboarding, Mission Control, Academy, clases, laboratorios, progreso, Skill Graph, cuenta y certificación.
3. **Teacher Intranet** — agenda docente, cohortes, estudiantes que requieren apoyo, contenido y recomendaciones pedagógicas.
4. **Operations** — Student 360, Identity Ops, Content Studio y consola avanzada, limitados por rol.

La demo utiliza identidades, dominios, targets y evidencia **sintéticos**. No incorpora secretos productivos ni permite operar contra objetivos externos.

## Recorridos principales

### Público

```text
/                    Vitrina pública
/showcase.html       Vitrina pública alternativa
/auth.html           Acceso al campus
```

### Alumno

```text
/onboarding.html     Primera configuración guiada
/dashboard.html      Mission Control
/catalog.html        Academy y rutas
/course.html         Curso
/lesson.html         Video / live / awareness / lab / quiz
/progress.html       Mi Progreso + Skill Graph
/certificate.html    Estado de certificación
/account.html        Cuenta y seguridad
/privacy.html        Privacy & Data Controls
```

### Profesor / coordinación

```text
/teacher.html        Teacher Intranet
/instructor.html     Operations Console avanzada
/student.html        Student 360 · coordinator/admin
/users.html          Usuarios & Accesos · coordinator/admin
/studio.html         Content Studio · author/coordinator/admin
```

El build de producción conserva además `/lab.html` como shell de entrenamiento legado autenticado. No es la portada pública.

## Autenticación y roles

La capa de tenant aplica autorización temprana antes de mostrar superficies protegidas.

Roles disponibles:

- `learner`
- `instructor`
- `author`
- `reviewer`
- `coordinator`
- `admin`

El alumno entra por onboarding la primera vez. Los roles docentes aterrizan en **Teacher Intranet**. Student 360 y la administración de identidades permanecen reservados para `coordinator/admin`.

El preview local contiene únicamente cuentas demostrativas sintéticas. Las cuentas creadas por invitación local almacenan contraseñas derivadas con **PBKDF2-SHA256 + salt aleatorio mediante Web Crypto**. La arquitectura productiva real se delega a Crohnoz Academy Core.

## Experiencia de aprendizaje

La v1 incluye:

- Mission Control guiado por siguiente acción;
- cuatro rutas visuales de aprendizaje;
- clases grabadas y sesiones live simuladas;
- awareness visual y phishing con dominios `.example`;
- laboratorios controlados y objetivos sintéticos;
- checkpoints y feedback inmediato;
- Skill Graph, XP, readiness, racha y actividad reciente;
- Next Best Action;
- evidencia local y certificación demostrativa;
- Command Palette con `Ctrl/Cmd + K`;
- navegación móvil y Modo foco en Lesson Player;
- onboarding de tres pasos para nuevos alumnos.

## Teacher Intranet

La vista diaria del profesor prioriza claridad operacional:

- próxima clase live;
- agenda;
- ritmo de cohortes;
- alumnos con señales de apoyo;
- contenidos pendientes;
- recomendación de qué enseñar después.

La consola avanzada se mantiene separada para no convertir la experiencia cotidiana en un panel técnico sobrecargado.

## Privacidad y seguridad

Principios activos en esta versión:

- datos e identidades de laboratorio sintéticos;
- sin credenciales reales en phishing;
- sin arbitrary external targets;
- Cyber Range real feature-gated y fuera de esta demo;
- remote analytics OFF por defecto;
- consentimiento explícito para una futura analítica remota;
- session recording OFF;
- prompts completos prohibidos en telemetría;
- preguntas al mentor persistidas únicamente como `topic_category`;
- sesión de preview en `sessionStorage`;
- CSP, `nosniff`, framing denegado, Permissions Policy y CORP en Vercel;
- Service Worker first-party con namespace versionado y sin cachear respuestas fallidas;
- ningún proxy RawGit/GitHack/Raw GitHub forma parte de producción.

Ver también:

```text
SECURITY.md
docs/THREAT_MODEL.md
docs/OBSERVABILITY.md
docs/PLATFORM_ROLES.md
docs/V1_E2E_READINESS.md
```

## QA y release gate

La v1 tiene un gate consolidado independiente de GitHub Actions:

```bash
npm test
```

Ese gate revisa, entre otros:

- existencia de archivos runtime;
- referencias locales rotas en HTML;
- precache del Service Worker;
- separación público/privado;
- RBAC crítico;
- rutas alumno/profesor;
- ausencia de rutas legacy `type=` en Mission Control;
- ausencia de proxies raw externos;
- patrones obvios de secretos;
- CSP y headers defensivos;
- certificación autenticada;
- privacidad del mentor.

El deployment ejecuta:

```bash
npm run build
```

que primero ejecuta el release gate y solo después genera `dist/`. Si el gate falla, **Vercel no publica**.

La suite histórica pre-v1 se conserva en:

```bash
npm run test:legacy
```

Algunos contratos históricos contienen expectativas de versionado antiguas y no son el gate autoritativo de v1 hasta completar su migración.

## Build de producción

`scripts/build-static.mjs` genera un artefacto estático mínimo:

- excluye tests, documentación, schemas, OpenAPI, Supabase y archivos de desarrollo;
- publica `showcase.html` como `/index.html`;
- conserva el shell de entrenamiento anterior como `/lab.html`;
- exige que las superficies críticas existan antes de completar el build.

Vercel utiliza `vercel.json` con `buildCommand: npm run build` y `outputDirectory: dist`.

## Límites de esta v1

Esta es una **v1 comercial/demostrativa completa**, no el backend multiusuario productivo final. En particular:

- Academy Core remoto permanece deshabilitado en el preview público;
- MFA productivo continúa como gate de backend;
- el Cyber Range real permanece feature-gated;
- la persistencia principal de la demo sigue siendo local;
- no se conectan proveedores sensibles ni secretos desde el repositorio público.

La transición a producción real debe reemplazar la persistencia local por Academy Core sin reescribir la experiencia de usuario.

## Desarrollo local

Requiere Node.js 18+ para QA. La interfaz es estática y puede servirse con cualquier servidor HTTP.

```bash
npm test
npm run build
```

El objetivo de release es que **lo que se ve, lo que se navega y lo que Vercel publica correspondan al mismo artefacto versionado**.
