# KODEXA V4 — Digital Engineering Studio

Sitio comercial estático de KODEXA Digital Solutions, preparado para GitHub Pages.

## Experiencia V4
- Landing institucional responsive con identidad visual KODEXA.
- Páginas de soluciones y enfoque tecnológico.
- Cotizador unificado responsive basado en el catálogo de `app.js`.
- KODEXA Copiloto local basado en reglas, con derivación a cotización y WhatsApp.
- Metadatos SEO, Open Graph, `robots.txt` y `sitemap.xml`.
- Accesibilidad base: enlace para saltar al contenido, navegación etiquetada, foco visible, estados ARIA y soporte para movimiento reducido.

## Arquitectura actual
Esta versión continúa siendo frontend estático. El cotizador calcula en el navegador y abre WhatsApp con un mensaje que la persona revisa y envía. No hay autenticación, cuentas, backend, almacenamiento central, CRM ni conexión a Supabase.

## Publicación
El sitio está preparado para GitHub Pages desde la raíz de `main`:
https://instructormap.github.io/kodexa.web/

## Antes de operar comercialmente
- Confirmar que el número de WhatsApp configurado corresponde al canal oficial.
- Confirmar que `hola@kodexa.com` es una dirección operativa.
- Revisar precios y alcance del catálogo en `app.js`.
- Definir alcance, impuestos, vigencia y condiciones comerciales en cada propuesta.
- Configurar dominio propio y analítica/consentimiento si se decide utilizarlos.

## Evolución posterior
La futura conexión con Supabase deberá implementarse como una etapa separada: autenticación, perfiles, organizaciones/tenants, roles, políticas RLS, persistencia de leads y gestión de proyectos. No se simulan esas capacidades en V4.
