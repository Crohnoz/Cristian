# Product Definition — Cristian Cyber Academy

## Producto

Cristian Cyber Academy es una plataforma white-label de entrenamiento práctico en ciberseguridad construida sobre capacidades reutilizables de Crohnoz Labs.

La propuesta no es un LMS tradicional. El producto combina aprendizaje breve, práctica guiada, simulación segura, laboratorios aislados, evaluación y analítica de competencias.

## North Star

**Learn → Practice → Attack/Defend → Explain → Score → Certify**

## Usuario principal

### Alumno

Necesita aprender conceptos de seguridad mediante práctica contextual, feedback y progresión visible.

### Instructor

Necesita crear cohortes, asignar rutas, visualizar desempeño, identificar brechas y reutilizar contenido.

### Administrador

Necesita controlar usuarios, tenants, permisos, contenido y políticas de ejecución de laboratorios.

## MVP

### 1. Academy

- Rutas de aprendizaje.
- Módulos y lecciones.
- Microcontenidos.
- Quizzes.
- Progreso por alumno.

### 2. Phishing Lab

- Inbox 100% simulado.
- Remitentes y dominios ficticios.
- Clasificación legítimo/phishing.
- Explicación de indicadores.
- Puntaje y evolución.

### 3. Cyber Range

- Catálogo de laboratorios.
- Entornos efímeros y aislados.
- Datos sintéticos.
- Objetivos, hints y mitigación.
- Separación clara entre modo atacante y modo defensor.

### 4. AI Mentor

- Explicación conceptual.
- Pistas progresivas.
- Preguntas de comprobación.
- Recomendaciones basadas en Skill Graph.
- Sin entregar automáticamente soluciones completas a un challenge activo.

### 5. Skill Graph

Competencias iniciales:

- Phishing & Social Engineering
- Web Security
- API Security
- OSINT
- Secure Coding
- Incident Response
- Cloud Security

Cada competencia se calcula usando actividades observables: quizzes, labs, decisiones, reintentos y tiempo de resolución.

### 6. Instructor Console

- Cohortes.
- Alumnos.
- Asignaciones.
- Analytics.
- Gestión de contenido.
- Exportación de resultados.

## Diferenciadores

1. Aprendizaje práctico antes que contenido pasivo.
2. White-label completo para instructores y organizaciones.
3. Mentor IA contextual al laboratorio.
4. Skill Graph dinámico, no solo porcentaje de curso.
5. Attack/Defend pedagógico dentro de entornos controlados.
6. Arquitectura reusable para nuevos verticales Crohnoz.

## Métricas MVP

- Activation: primer laboratorio iniciado durante la primera sesión.
- Completion: porcentaje de labs completados.
- Accuracy: decisiones correctas por competencia.
- Improvement: cambio de score entre primera y última evaluación.
- Retention: usuarios que vuelven a entrenar durante 7/30 días.
- Instructor value: tiempo para asignar una ruta y visualizar brechas.

## No incluido inicialmente

- Campañas de phishing contra terceros.
- Captura de credenciales reales.
- Malware real.
- Persistencia ofensiva.
- Escaneo de infraestructura externa.
- Explotación fuera de targets aislados y autorizados.
- Certificación formal acreditada por terceros.

## Definition of Done del primer demo

- Navegación responsive.
- Dashboard del alumno.
- Academy visible.
- Phishing Lab con al menos cuatro escenarios ficticios.
- Cyber Range demostrativo.
- AI Mentor demostrativo.
- Branding Cristian + Crohnoz Labs.
- Ninguna dependencia de secretos o backend para ejecutar el demo.
