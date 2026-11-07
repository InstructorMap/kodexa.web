# Cotizador KODEXA — especificación comercial y técnica

## Objetivo
El cotizador configura soluciones digitales por producto, arquitectura, módulos y continuidad. No es una lista cerrada de páginas web.

## Catálogo de soluciones
- Landing page y sitio institucional.
- Tienda online / e-commerce.
- Aplicación web progresiva (PWA).
- Aplicación Android híbrida con Capacitor (APK/AAB).
- Aplicación Android nativa.
- Plataforma SaaS multiempresa (multi-tenant).
- Sistema operativo o de gestión a medida.
- Integraciones y automatizaciones.
- Producto digital por definir.

## Módulos configurables
Autenticación, roles y permisos, multi-tenant, panel administrativo, CRM, pagos, facturación ARCA, APIs, WhatsApp, QR, wallet/credenciales, GPS/mapas, Push-to-Talk/WebRTC, sincronización en tiempo real, push, offline, funciones nativas, reportes, IA y almacenamiento multimedia.

## Modelo de estimación
- Soluciones simples: muestran un precio inicial de referencia.
- Productos complejos: muestran un rango inicial orientativo.
- Los módulos agregan un rango incremental.
- La cantidad de organizaciones, usuarios y plataformas ajusta la complejidad.
- El mantenimiento se estima aparte como una referencia porcentual sobre el desarrollo inicial.
- Hosting, base de datos, almacenamiento, tráfico, voz, mensajería, licencias y servicios externos se dimensionan por separado.

## Base económica
Los importes del catálogo en `app.js` son **parámetros comerciales preliminares de referencia**, expresados en ARS. No son una lista de precios aprobada ni un compromiso contractual. Antes de hacer campañas o aceptar proyectos, KODEXA debe validar margen, horas, alcance, impuestos, costos de terceros y vigencia de cada valor. El catálogo se centraliza en `CATALOG` para permitir ajustes sin reescribir la interfaz ni el motor.

## Flujo y privacidad
1. El usuario configura el producto.
2. La estimación se recalcula en el navegador.
3. El usuario completa sus datos de contacto.
4. Se prepara un mensaje de WhatsApp al número comercial confirmado de KODEXA: 5492213642475.
5. La persona revisa y envía el mensaje desde WhatsApp.

No hay persistencia, CRM, backend ni Supabase en esta etapa. No se guardan datos personales en localStorage. La estimación no se envía automáticamente a un servidor.

## Límites
- PWA no equivale a APK nativa.
- APK/AAB híbrida usa Capacitor para empaquetar la aplicación web e integrar capacidades del dispositivo.
- Android nativo requiere desarrollo específico de plataforma.
- Push-to-Talk tipo Zello se ofrece como módulo de comunicación en tiempo real basado en WebRTC; el alcance final depende de simultaneidad, calidad de servicio, redes, TURN, grabación, retención y controles de acceso.
- Integraciones con ARCA, pagos, WhatsApp, Apple/Google y otros proveedores dependen de credenciales, aprobaciones, políticas y costos externos.
- Los rangos no sustituyen relevamiento, diseño técnico, análisis de riesgos ni propuesta comercial formal.

## QA previo a publicación
- Verificar que las cuatro etapas se naveguen correctamente.
- Probar combinaciones de producto, plataforma, organizaciones, usuarios y módulos.
- Verificar cálculo de mínimo/máximo y mantenimiento.
- Validar campos de contacto y generación del mensaje de WhatsApp.
- Probar diseño en escritorio y móvil.
- Confirmar publicación exitosa de GitHub Pages.
