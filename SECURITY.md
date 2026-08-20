# Security Policy

Cristian Cyber Academy contiene material de entrenamiento y, en fases posteriores, podrá orquestar laboratorios deliberadamente vulnerables. Por ese motivo la seguridad del producto y el aislamiento del Cyber Range son requisitos funcionales, no extras.

## Reglas de desarrollo

- No versionar tokens, claves, credenciales ni archivos `.env` reales.
- No usar datos personales reales en fixtures, demos o laboratorios.
- No enlazar simulaciones de phishing a páginas de captura de credenciales reales.
- No permitir targets externos o arbitrarios desde el Cyber Range.
- Aplicar autorización server-side y tenant scoping en toda operación protegida.
- Tratar todo contenido ingresado por usuarios como no confiable.
- Evitar renderizado de HTML sin sanitización/encoding contextual.
- Mantener CSP estricta en la aplicación productiva.
- Registrar cambios administrativos y ciclos de vida de laboratorios.
- Mantener separadas las credenciales y redes de demo, staging, producción y range.

## Cyber Range

Los laboratorios deben ser:

- efímeros;
- aislados;
- limitados en recursos;
- sin acceso a secretos;
- sin acceso a redes de producción;
- sin salida a Internet por defecto;
- destruidos automáticamente al terminar o expirar.

## Phishing training

El simulador MVP usa únicamente personas, organizaciones, dominios y mensajes ficticios.

Una futura función de campañas organizacionales requerirá controles adicionales:

- autorización explícita del tenant;
- scope definido;
- destinatarios pertenecientes a la organización autorizante;
- exclusión de captura de contraseñas reales;
- trazabilidad de creación y ejecución;
- controles anti-abuso y rate limits.

## Vulnerability disclosure

No publicar detalles de una vulnerabilidad de producción en un issue público. Utilizar un canal privado definido por el propietario del repositorio antes del lanzamiento público del producto.
