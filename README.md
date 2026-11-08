# YUNA — Technology Company

Sitio comercial estático de YUNA, empresa de tecnología enfocada en productos digitales, plataformas SaaS e ingeniería de soluciones.

## Identidad y experiencia
- Identidad YUNA (優奈): negro tinta, rosa sakura, marfil y rojo profundo.
- Lenguaje visual japonés contemporáneo con ornamentación sakura discreta.
- Logotipo, isotipo y asistente visual adaptados a YUNA.
- Experiencia responsive en inicio, soluciones, tecnología, cotizador y contacto.
- Cotizador modular con estimaciones híbridas para soluciones digitales.

## Arquitectura actual
Frontend estático. El cotizador calcula en el navegador y deriva a WhatsApp con un mensaje que la persona revisa y envía. No hay autenticación, backend, almacenamiento central, CRM ni conexión a Supabase.

## Publicación
El repositorio conserva su URL técnica de GitHub Pages:
https://instructormap.github.io/kodexa.web/

## Validaciones pendientes antes de operar comercialmente
- Confirmar el número de WhatsApp como canal oficial.
- Definir y configurar el correo corporativo de YUNA.
- Revisar precios, alcance y condiciones comerciales del cotizador.
- Configurar dominio propio y analítica/consentimiento si se decide utilizarlos.

## Próxima etapa técnica
Antes de conectar Supabase habrá que definir autenticación, perfiles, organizaciones/tenants, roles, políticas RLS, persistencia de leads y gestión de proyectos. Esta versión no incorpora ni simula esas capacidades.
