# KODEXA — Captación de oportunidades

## Flujo actual

1. Los CTA comerciales y el copiloto llevan a `contacto.html` con parámetros de tipo y origen.
2. El formulario solicita tipo de solución, nombre, teléfono, y contexto; empresa, email, plazo e inversión son opcionales.
3. El navegador valida los campos y genera un identificador `KDX-...`.
4. El usuario revisa el mensaje estructurado en WhatsApp y decide enviarlo.
5. La web estática no guarda los datos en un servidor ni genera una bandeja central de leads.

## Campos y propósito

- **Identificación:** lead_id, created_at.
- **Atribución:** source_page, source_detail y UTM source/medium/campaign.
- **Calificación:** project_type, timeline, budget_range, description.
- **Contacto:** name, company, phone, email, contact_channel.
- **Seguimiento futuro:** status.

El esquema canónico está en `schemas/lead-record.schema.json`.

## Estados sugeridos para un futuro CRM

- `new`: recibido.
- `contacted`: primer contacto realizado.
- `qualified`: necesidad y alcance inicial entendidos.
- `proposal_sent`: propuesta enviada.
- `won`: proyecto aceptado.
- `lost`: oportunidad cerrada sin venta.

## Privacidad y límites

- No se envía información a Supabase, Google Sheets ni otro servidor.
- El formulario no guarda datos personales en localStorage.
- La información solo sale del navegador cuando la persona continúa a WhatsApp y confirma el envío.
- El número de WhatsApp y el correo comercial deben confirmarse antes de anunciar la página.
- Antes de conectar un CRM, definir responsable del tratamiento, plazo de conservación, permisos de acceso y política de privacidad.

## Parámetros de entrada

- `tipo`: web, ecommerce, pwa, saas, integraciones o otro.
- `origen`: identificador corto del CTA.
- `utm_source`, `utm_medium`, `utm_campaign`: atribución opcional.
