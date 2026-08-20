# Architecture — Cristian Cyber Academy

## Objetivo

Diseñar una plataforma multi-tenant que pueda comenzar como demo estática y evolucionar hacia un producto con autenticación, contenido, IA, analítica y laboratorios efímeros sin mezclar la superficie pública con infraestructura de práctica ofensiva.

## Capas

### Web App

Responsabilidades:

- experiencia alumno/instructor;
- rutas, contenidos y progreso;
- phishing simulator seguro;
- visualización de Skill Graph;
- acceso al AI Mentor;
- lanzamiento de laboratorios autorizados.

Recomendación para fase productiva:

- Next.js/React para frontend;
- API separada para dominio y seguridad;
- SSR solo donde aporte valor;
- CSP estricta y componentes sin HTML no confiable.

### Core API

Responsabilidades:

- users;
- tenants;
- cohorts;
- enrollments;
- content;
- attempts;
- skills;
- audit log;
- lab orchestration requests.

Stack recomendado, compatible con Crohnoz Labs:

- Django + Django REST Framework;
- PostgreSQL;
- Redis;
- Celery para tareas asíncronas;
- object storage para material educativo.

### AI Mentor Service

El modelo nunca recibe secretos de infraestructura ni acceso directo a hosts externos.

Contexto permitido:

- contenido de la lección;
- objetivos del lab;
- hints autorizados;
- resultados del alumno;
- rúbrica;
- Skill Graph.

Funciones:

- explicación;
- generación de preguntas;
- hints progresivos;
- feedback de respuestas;
- recomendación de siguiente actividad.

### Cyber Range Orchestrator

Servicio separado del Core API.

Responsabilidades:

1. validar que el lab solicitado está permitido;
2. crear un entorno efímero desde una imagen aprobada;
3. aplicar aislamiento de red;
4. entregar un endpoint temporal al alumno;
5. recolectar eventos pedagógicos mínimos;
6. destruir el entorno al terminar o expirar.

No debe permitir targets arbitrarios definidos por el usuario.

### Lab Runtime

Cada laboratorio:

- usa datos sintéticos;
- dispone de recursos limitados;
- no comparte red con producción;
- tiene salida a Internet deshabilitada por defecto;
- utiliza imágenes versionadas;
- expira automáticamente;
- no monta secretos de producción.

## Multi-tenancy

Entidades principales:

- Tenant
- User
- Membership
- Cohort
- LearningPath
- Module
- Lesson
- Challenge
- LabDefinition
- LabSession
- Attempt
- Skill
- SkillScore
- Certificate
- AuditEvent

Toda entidad de negocio sensible debe estar tenant-scoped.

## Roles iniciales

- platform_admin
- tenant_admin
- instructor
- student

Permisos deben resolverse server-side. El frontend nunca es fuente de autorización.

## Flujo de laboratorio

1. Student selecciona Challenge.
2. Core API valida enrollment y permisos.
3. Core API solicita sesión al Range Orchestrator.
4. Orchestrator selecciona una imagen aprobada.
5. Runtime se crea en red aislada.
6. Se genera un token de sesión corto y scoped.
7. Student accede al target temporal.
8. Eventos pedagógicos se envían a Core API.
9. Timeout o finalización destruye el runtime.
10. Score alimenta Skill Graph.

## Flujo AI Mentor

1. Alumno envía pregunta.
2. Backend recupera contexto pedagógico permitido.
3. Policy layer determina máximo nivel de ayuda.
4. Mentor responde con explicación o hint.
5. Conversación útil puede registrar un evento pedagógico, nunca datos secretos.

## Observabilidad

- structured logs;
- correlation IDs;
- auth events;
- lab lifecycle events;
- instructor/admin mutations;
- rate limit events;
- errores de sandbox;
- métricas de uso sin capturar contenido sensible innecesario.

## Entornos

### Demo

Static frontend, datos locales ficticios, sin secretos.

### Staging

Backend real, identidades de prueba, laboratorios aislados no públicos.

### Production

Separación de cuentas/proyectos para app, datos y range; backups; secret manager; alertas; revisión de dependencias; control de cambios.

## Principio rector

La plataforma educativa puede ser accesible desde Internet. La infraestructura vulnerable del Cyber Range no debe convertirse en una red general-purpose ni tener conectividad innecesaria hacia producción o terceros.
