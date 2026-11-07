# KODEXA Digital Solutions — Identidad visual V1

## Dirección aprobada para implementación
Una única dirección visual: **Architect refinado**. El símbolo es un bloque estructural azul con una K calada mediante máscara SVG y un acento dorado superior. No se incluyen conceptos alternativos.

## Archivos
- `assets/logo-dark.svg`: logo horizontal para fondos claros.
- `assets/logo-white.svg`: logo horizontal para fondos oscuros.
- `assets/logo-mono.svg`: versión monocromática.
- `assets/logo-icon.svg`: símbolo aislado.
- `assets/favicon.svg`: favicon a color.
- `assets/favicon-mono.svg`: favicon monocromático.
- `kodexa-brand.css`: tokens de marca, tipografía, escala y componentes base.

## Paleta
- Navy: `#020B24`
- Electric Blue: `#006BFF`
- Cyan: `#00C8FF`
- Gold: `#FFB800`
- White: `#FFFFFF`

## Reglas de uso
1. Usar `logo-dark.svg` sobre blanco o superficies claras.
2. Usar `logo-white.svg` sobre navy o fondos oscuros.
3. Usar `logo-icon.svg` / `favicon.svg` para avatar, app icon y favicon.
4. El dorado es un acento, no un color de texto ni un color de grandes superficies.
5. No estirar, inclinar, agregar sombras, contornos ni efectos glow al símbolo.
6. Mantener zona de seguridad mínima equivalente al ancho del acento dorado.
7. No usar el descriptor si el logo se reproduce a menos de 180 px de ancho.
8. Para favicon de 16 px, probar en navegador real; si el calado se cierra, usar la variante simplificada monocromática.

## Tipografía
Inter. Pesos recomendados: 400 texto, 500 soporte, 600 navegación, 700 botones, 800 titulares y wordmark.

## Nota técnica
Los SVG usan máscara explícita `userSpaceOnUse` para que el recorte de la K sea transparente y no dependa del color del fondo. El wordmark usa texto SVG con fuentes de sistema; para impresión profesional o entrega a terceros, convertir el texto a curvas en un editor vectorial antes de producción.

## Integración
Copiar la carpeta `assets/` al proyecto y `kodexa-brand.css` a la hoja de estilos. No reemplazar cotizadores ni lógica JavaScript al incorporar la identidad.
