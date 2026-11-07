# KODEXA V3 — paquete de rediseño

Este paquete contiene la nueva landing, dos páginas secundarias, el sistema visual y KODEXA Copiloto.

## Archivos incluidos
- `index.html`
- `styles.css`
- `script.js`
- `soluciones.html`
- `tecnologia.html`
- `assets/` (logos Architect, robot/copiloto y visuales SVG)

## Integración en el repositorio actual
Copiar los archivos incluidos sobre el repositorio `InstructorMap/kodexa.web`, conservando los archivos existentes que no están en este paquete.

**No reemplazar ni modificar:**
- `app.js`
- `cotizador-desktop.html`
- `cotizador-paso1.html`
- `cotizador-paso2.html`
- `cotizador-paso3-resumen.html`

La landing carga el `app.js` actual para leer `window.KODEXA.CATALOG`; no lo modifica. Los importes mostrados se alimentan de ese catálogo.

## Rutas
El sitio está pensado para publicarse en la raíz de GitHub Pages de `https://instructormap.github.io/kodexa.web/`. Los enlaces a las páginas secundarias y al cotizador son relativos.

## KODEXA Copiloto
Asistente local basado en reglas. No usa API externa ni se presenta como IA generativa. Puede orientar sobre soluciones, planes, cotización, contacto y consultas frecuentes. Las preguntas que no puede responder se derivan a WhatsApp.

## Importante antes de publicar
1. Abrir `index.html` mediante un servidor local (no solo `file://`) para probar rutas y scripts.
2. Verificar cotizadores completos en escritorio y móvil.
3. Confirmar que `hola@kodexa.com` es una dirección operativa.
4. Confirmar importes y alcance comercial del catálogo antes de publicar.
5. Revisar el logo a tamaños pequeños y favicon en los navegadores objetivo.
6. No se ha hecho push, merge ni publicación en GitHub.
