# Cristian Cyber Academy — Demo Runbook

## Objetivo

Demostrar un recorrido completo alumno → práctica → scoring → instructor → certificado sin usar credenciales reales, targets externos ni infraestructura ofensiva.

## Rutas

- `/` — experiencia del alumno.
- `/instructor` — consola del instructor.
- `/certificate` — estado de certificación de la demo.

Con `cleanUrls` de Vercel también funcionan los archivos `.html` directamente.

## Recorrido recomendado

### 1. Overview

1. Abrir la vista alumno.
2. Mostrar Cyber Readiness, Skill Graph, XP y próxima misión.
3. Explicar que el estado de demo se persiste únicamente en `localStorage`.

### 2. Phishing Lab

1. Entrar a **Phishing Lab**.
2. Abrir un mensaje.
3. Analizar dominio, urgencia, contexto y solicitud.
4. Clasificarlo como legítimo o phishing.
5. Repetir hasta obtener al menos dos respuestas correctas.

Resultado esperado:

- se registra el intento;
- la primera resolución correcta entrega XP;
- la precisión se actualiza;
- el evento aparece en la consola del instructor.

Todos los dominios del laboratorio usan el TLD reservado `.example`.

### 3. Cyber Range

1. Entrar a **Cyber Range**.
2. Leer el brief de XSS.
3. Seleccionar la mitigación correcta: encoding contextual de salida + plantillas seguras.

Resultado esperado:

- se registra el intento;
- el primer éxito completa el lab;
- aumenta Web Security;
- se entregan XP;
- el evento queda trazable.

Este laboratorio es una simulación pedagógica. No ejecuta payloads ni interactúa con sistemas externos.

### 4. AI Mentor

Preguntas sugeridas:

- `¿Por qué output encoding ayuda contra XSS?`
- `¿Qué señales miro en un correo de phishing?`
- `¿Cuál es la diferencia entre autenticación y autorización en una API?`
- `¿Cómo valido un hallazgo OSINT?`

En esta etapa el mentor es determinístico y local. La arquitectura contempla reemplazarlo por un servicio de IA con retrieval, guardrails y observabilidad.

### 5. Instructor Console

Abrir `/instructor` en otra pestaña del mismo navegador/origen.

Mostrar:

- cohortes;
- skill gaps;
- recomendación de contenido;
- alumno demo con señal en vivo;
- audit trail de actividades;
- asignación demostrativa de un módulo.

El estado local se comparte entre las dos pestañas mediante `localStorage` y eventos `storage`.

### 6. Certificate

Abrir `/certificate`.

Gate de demo:

- Cyber Readiness ≥ 75;
- 2 clasificaciones correctas de phishing;
- 1 laboratorio de Cyber Range completado.

Si se cumplen los criterios se habilita impresión/guardado como PDF.

El documento indica explícitamente que es un **Demo Achievement** y no una certificación profesional acreditada.

## Reinicio

Desde el dashboard o certificado se puede eliminar únicamente el progreso local de la demo.

## Validación local

No requiere dependencias:

```bash
npm test
```

El smoke test comprueba:

- superficies alumno/instructor/certificate;
- dominios `.example`;
- tracking básico;
- CSP;
- headers defensivos;
- invariantes de seguridad documentados.

## Paso a backend real

El archivo `supabase/001_core_schema.sql` define el contrato inicial para:

- tenants;
- membresías y roles;
- cohortes;
- módulos;
- labs;
- asignaciones;
- attempts;
- skill scores;
- learning events;
- certificados.

Todas las tablas de datos de usuario tienen RLS habilitado. No se debe conectar un proyecto real ni agregar variables de entorno mientras el repositorio sea público.

## Cyber Range real — boundary

El orquestador de contenedores debe vivir fuera de la aplicación web y de la base de datos principal.

Requisitos mínimos:

- sesiones efímeras;
- imágenes aprobadas;
- red aislada;
- egress denegado por defecto;
- sin secretos de producción;
- CPU/RAM/TTL limitados;
- destrucción automática;
- auditoría de lifecycle.
