# 🚀 KODEXA Digital Solutions — Ecosistema Digital Completo

Plataforma institucional y cotizador interactivo paso a paso con cálculo en tiempo real, integración fiscal ARCA/AFIP 2025 y envío de presupuestos por WhatsApp.

- **Stack:** HTML5 Semántico + Tailwind CSS CDN + Plus Jakarta Sans + Vanilla JS
- **Respaldo Institucional:** ASARI S.A.S.
- **Estructura de Directorios:**
  - `index.html`: Enrutador automático e inteligente (Desktop / Mobile) con fallback.
  - `desktop/index.html`: Landing institucional de escritorio.
  - `desktop/cotizador-desktop.html`: Cotizador interactivo split layout.
  - `mobile/index.html`: Landing responsive para móviles con navegación fija.
  - `mobile/cotizador-paso1.html`: Paso 1 (Tipo de proyecto y base técnica).
  - `mobile/cotizador-paso2.html`: Paso 2 (Alcance, pasarelas y fiscalidad ARCA).
  - `mobile/cotizador-paso3-resumen.html`: Paso 3 (Resumen #KDX-8492, CUIT y WhatsApp).

## ⚡ Puesta en marcha rápida
```bash
# Con Node:
npx serve .
# O con Python:
python3 -m http.server 8080
```

## 🌐 Despliegue en la nube
Compatible de forma nativa con **Vercel**, **Netlify**, **GitHub Pages** o cualquier servidor web estático (Apache, Nginx).
