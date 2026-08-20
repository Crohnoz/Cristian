# Bitácora — Cristian Cyber Academy

## 2026-08-20 — Cierre de jornada

### Estado general

La plataforma evolucionó desde una demo funcional de ciberseguridad hacia una experiencia de producto visual, white-label y navegable. El estado de trabajo de referencia al cierre es **v0.7.1 — Public Showcase + Unified Product Experience** sobre la rama `feat/cyber-academy-mvp` y el PR #2.

### Avance material de hoy

- Se consolidó **Mission Control** como entrada principal post-login.
- Se adoptó una dirección visual premium inspirada en un dashboard cyber profesional: navy/carbono, violeta moderado, azul y acentos semánticos; se redujo el uso de negro puro y verde neón para mejorar ergonomía visual en sesiones largas.
- Se incorporó un **avatar genérico para Cristian**, con barba media, lentes y camisa roja a cuadros, sin replicar identidad biométrica real.
- Se pobló la Academy con cuatro cursos visuales:
  1. Phishing Defense.
  2. Web Application Security.
  3. SOC & Incident Response.
  4. Cloud & Identity Security.
- Se construyó un flujo de curso inmersivo con distintos formatos pedagógicos:
  - video asincrónico;
  - clase sincrónica/live;
  - replay;
  - simulación visual de awareness/phishing con datos sintéticos;
  - laboratorio aislado;
  - checkpoint/quiz;
  - recursos y evidencia de aprendizaje.
- Se agregó material visual propio para portadas, clases, simulaciones y laboratorios.
- Se unificó el shell visual de **Mission Control → Academy → Course → Lesson** mediante componentes compartidos.
- Se armonizó Instructor Console con la misma familia visual.
- Se mantuvieron Student 360, usuarios/cohortes, cuenta, privacidad y certificados como superficies existentes del producto.
- Se mantuvo Academy Core como frontera reusable para identidad y datos académicos; el backend remoto sigue deshabilitado en preview público.
- La PWA y el application shell fueron ampliados para cubrir las nuevas superficies.
- Se agregaron contratos de regresión para Mission Control, shell unificado y vitrina pública. Los tests están escritos, pero no se declara ejecución en este runner.
- GitHub Actions sigue sin utilizarse deliberadamente.
- Se creó **`/showcase`** (`showcase.html` + `showcase.css`) como superficie pública sin bootstrap de autenticación de Academy, sin Student 360 y sin operaciones privadas.
- Se documentó la topología definitiva en `docs/PLATFORM_ROLES.md`.
- Se creó `public-preview.html` como preview pública autocontenida de un solo archivo para handoff/deploy independiente de assets y autenticación.

### Arquitectura de producto acordada al cierre

La plataforma se separará en tres superficies principales:

1. **Vitrina pública**
   - visible sin login;
   - compartible por URL;
   - explica propuesta, cursos, formatos, metodología e instructor;
   - puede mostrar demos sintéticas y recorridos de ejemplo;
   - nunca expone datos de alumnos, operaciones internas, tokens ni información sensible.

2. **Campus / Intranet de estudiantes**
   - autenticación obligatoria;
   - Mission Control del alumno;
   - cursos, rutas, video, live, labs, quizzes, progreso, Skill Graph, certificados, cuenta y soporte.

3. **Campus / Intranet de profesores y coordinación**
   - autenticación + RBAC;
   - Teaching / Instructor Console;
   - cohortes;
   - Student 360;
   - usuarios e invitaciones;
   - contenido;
   - intervenciones;
   - analytics académicos;
   - auditoría.

Regla: el sitio público y la intranet pueden compartir marca y design system, pero no deben compartir la misma frontera de autorización ni datos.

### Deployment

- Netlify quedó descartado temporalmente por límite de uso.
- Vercel es el target primario actual.
- Se generó una showcase standalone v0.7 mediante carga directa a Vercel.
- La integración de Vercel sigue presentando una inconsistencia: acepta deployments y entrega URL/alias/ID, pero luego no los resuelve correctamente desde sus herramientas de lectura y el team continúa mostrando 0 proyectos vinculados.
- El deploy directo actual no puede completarse desde este conector porque el backend exige `target`, `name` y `files`, pero la función expuesta no permite enviar esos argumentos.
- El fallback Netlify entregó un comando firmado de deploy, pero el runner local no dispone de salida DNS, por lo que no pudo clonar GitHub ni ejecutar el CLI.
- El importador alternativo de Vercel rechazó GitHub raw porque acepta exclusivamente bundles desde `claudeusercontent.com`.
- Pendiente crítico y único bloqueo real de hosting: importar/vincular `Crohnoz/Cristian` como proyecto real de Vercel para obtener Project ID, previews por commit, logs, control de Deployment Protection y alias canónico.
- La nueva ruta pública `/showcase` y `public-preview.html` ya están en GitHub, pero no se declaran publicadas/validadas en Vercel hasta resolver el vínculo de proyecto.

### Acceso público

Decisión de producto: **la vitrina/demo compartible debe ser pública y no requerir cuenta de Vercel ni autenticación de Academy**. El acceso de estudiantes/profesores sí debe permanecer protegido.

La ruta `/showcase` fue construida precisamente bajo esa regla: no carga `auth.session.js`, `users.js`, `student.js` ni `instructor.js`. Su CTA deriva al campus autenticado.

Mientras no exista un Project ID de Vercel vinculado, no se considera cerrada la validación de Deployment Protection a nivel plataforma. La demo standalone fue diseñada sin autenticación de aplicación, pero la configuración de protección de Vercel debe validarse cuando el proyecto quede enlazado.

### Seguridad mantenida

- datos sintéticos en phishing y labs;
- sin credenciales reales;
- sin targets externos arbitrarios;
- Cyber Range real separado, efímero y deny-egress por defecto;
- AI Mentor live y Cyber Range live continúan apagados;
- analytics remota OFF por defecto y consentimiento requerido;
- session recording OFF;
- Student 360 remoto no inventa evidencia cyber;
- acciones administrativas continúan sujetas a RBAC y futura MFA/step-up.

## Próxima jornada — foco acordado

### 1. Experiencia del estudiante

Diseñar el recorrido completo:

`sitio público → explorar Academy → inscripción/invitación → login → onboarding → Mission Control → curso → clase/lab/quiz → progreso → certificado`

Definir estados nuevos:
- alumno nuevo;
- alumno activo;
- curso en progreso;
- clase live agendada;
- entrega pendiente;
- lab completado;
- feedback disponible;
- certificación desbloqueada.

### 2. Experiencia del profesor

Formalizar:

`login → Instructor Console → cohortes → alumnos → Student 360 → contenidos → clase live → evidencia → intervención`

### 3. Vitrina pública

La primera versión ya existe en `/showcase`. Próximo pase:
- navegación pública completa;
- instructor y propuesta de valor;
- catálogo público de cursos;
- metodología visual;
- tipos de clase;
- ejemplos de labs;
- certificaciones;
- CTA de ingreso/solicitud de acceso;
- responsive/human QA;
- dominio/alias público canónico.

### 4. Roles y permisos

Mantener como mínimo:
- `learner`;
- `instructor`;
- `coordinator`;
- `admin`;
- opcionales: `author`, `reviewer`.

### 5. Primera tarea de mañana

1. Importar `Crohnoz/Cristian` en Vercel como `cristian-cyber-academy`.
2. Production branch temporal: `feat/cyber-academy-mvp`.
3. Validar `/showcase` como acceso público sin Vercel Authentication.
4. Verificar `/auth` y campus con autenticación propia.
5. Ejecutar QA desktop/mobile.

### 6. Cierre técnico pendiente

- vincular GitHub → Vercel como proyecto canónico;
- confirmar demo pública sin Vercel Authentication;
- ejecutar suite Node local/capable runner;
- QA desktop/mobile;
- no mergear PR #2 ni Academy Core #37 sin revisión y tests.

---

**Cierre de laboratorio 01:39:** código, arquitectura, showcase pública, preview autocontenida y bitácora quedan persistidos en GitHub. El producto no tiene un bloqueo funcional para continuar; el único bloqueo para URL canónica pública es la vinculación del proyecto en Vercel. Se da por cerrada la jornada sin mergear PRs ni activar capacidades de mayor riesgo.

## 2026-08-20 — Pase adicional v0.8.0 Premium Polish

A solicitud de elevar la percepción de valor antes del próximo deploy, se realizó un pase transversal enfocado en orden, profesionalismo, reactividad y ergonomía visual.

### Cambios incorporados

- nueva capa compartida `premium-ui.css` para superficies, profundidad, hover/focus y microestados;
- nuevo sistema `premium-layout.css` para aumentar respiración, legibilidad, proporción de sidebar/topbar y jerarquía tipográfica;
- nueva capa `premium-ui.js` sin dependencias externas;
- Command Palette real con `Ctrl/Cmd + K`;
- navegación móvil inferior persistente;
- aparición progresiva de tarjetas mediante `IntersectionObserver`;
- barras de progreso animadas al cargar;
- iluminación contextual sutil de tarjetas siguiendo el puntero;
- feedback visual/toast en acciones relevantes;
- estados de foco visibles para navegación por teclado;
- soporte de `prefers-reduced-motion`;
- retorno de foco al cerrar Command Palette;
- acceso por teclado a la búsqueda del shell;
- Mission Control recibió escala tipográfica y spacing más generosos;
- el shell compartido de Academy/Course/Lesson recibió las mismas proporciones premium;
- Instructor Console hereda las nuevas reglas de superficie/espaciado;
- PWA avanzó a `cca-shell-v14-premium-polish` y cachea los nuevos assets;
- `package.json` y tenant avanzaron a **v0.8.0**;
- se agregó `tests/premium-polish-contract.mjs`.

### QA

Los contratos fueron escritos y agregados al comando `npm test`, pero **no se declara su ejecución** en este runner. Se mantiene como gate ejecutar la suite y hacer QA humano desktop/mobile antes de merge o producción.
