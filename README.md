# YUNA V5 — Technology Company

Sitio comercial estático de YUNA Digital Solutions, preparado para GitHub Pages.

## Identidad y experiencia V5
- Sistema visual global compartido entre inicio, soluciones, tecnología y cotizador.
- Dirección dark-cinematic: navy profundo, iluminación azul/cian, geometría técnica y superficies translúcidas.
- Logotipo horizontal e isotipo V5 dedicados; favicon alineado con la marca.
- Composición responsive para escritorio, tablet y móvil.
- Navegación, tarjetas, formularios y estados interactivos con una misma identidad.
- Cotizador modular V2: web, e-commerce, PWA, Android híbrido/nativo, SaaS multi-tenant, sistemas operativos e integraciones.
- Estimaciones híbridas: precios iniciales para soluciones simples y rangos para productos complejos.
- Módulos técnicos configurables: autenticación, roles, pagos, QR, GPS, WebRTC Push-to-Talk, offline, push, IA y más.
- Especificación comercial y límites del cotizador en `docs/COTIZADOR.md`.

## Arquitectura actual
Frontend estático. El cotizador calcula en el navegador y deriva a WhatsApp con un mensaje que la persona revisa y envía. No hay autenticación, backend, almacenamiento central, CRM ni conexión a Supabase.

## Publicación
GitHub Pages desde la raíz de `main`:
https://instructormap.github.io/kodexa.web/

## Pendiente de validación comercial
- Confirmar que el número de WhatsApp configurado es el canal oficial.
- Confirmar que hola@kodexa.com es una dirección operativa.
- Revisar precios y alcance del catálogo en `app.js`.
- Definir alcance, impuestos, vigencia y condiciones comerciales de cada propuesta.
- Configurar dominio propio y analítica/consentimiento si se decide utilizarlos.

## Alcance técnico y siguiente etapa
Esta versión no incorpora Supabase ni simula capacidades de backend. Una futura etapa deberá definir autenticación, perfiles, organizaciones/tenants, roles, políticas RLS, persistencia de leads y gestión de proyectos antes de implementarlas.
