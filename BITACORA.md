# Bitácora — Cristian Cyber Academy

## 2026-08-20 — Cierre de jornada

### Estado general

La plataforma evolucionó desde una demo funcional de ciberseguridad hacia una experiencia de producto visual, white-label y navegable. El estado de trabajo de referencia es **v0.7.0 — Unified Product Experience** sobre la rama `feat/cyber-academy-mvp` y el PR #2.

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
- Se agregaron contratos de regresión para Mission Control y el shell unificado. Los tests están escritos, pero no se declara ejecución en este runner.
- GitHub Actions sigue sin utilizarse deliberadamente.

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
- Pendiente crítico: importar/vincular `Crohnoz/Cristian` como proyecto real de Vercel para obtener Project ID, previews por commit, logs, control de Deployment Protection y alias canónico.

### Acceso público

Decisión de producto: **la vitrina/demo compartible debe ser pública y no requerir cuenta de Vercel ni autenticación de Academy**. El acceso de estudiantes/profesores sí debe permanecer protegido.

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

Construir una landing comercial compartible con:
- hero;
- propuesta de valor;
- instructor;
- catálogo público de cursos;
- metodología visual;
- tipos de clase;
- ejemplos de labs;
- certificaciones;
- CTA de ingreso/solicitud de acceso.

### 4. Roles y permisos

Mantener como mínimo:
- `learner`;
- `instructor`;
- `coordinator`;
- `admin`;
- opcionales: `author`, `reviewer`.

### 5. Cierre técnico pendiente

- vincular GitHub → Vercel como proyecto canónico;
- confirmar demo pública sin Vercel Authentication;
- ejecutar suite Node local/capable runner;
- QA desktop/mobile;
- revisar README/CHANGELOG para reflejar v0.7+;
- no mergear PR #2 ni Academy Core #37 sin revisión y tests.

---

**Cierre:** la demo ya permite mostrar no solo una Academy vacía, sino una visión creíble de cómo Cristian podría impartir cursos, clases sincrónicas/asincrónicas, laboratorios y seguimiento académico bajo una plataforma propia de Crohnoz Labs.
