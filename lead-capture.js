/* YUNA — Secure lead capture through the Supabase Edge Function */
(() => {
  "use strict";

  const TYPES = {
    web: { label: "Sitio web / landing page", intro: "Una presencia digital profesional para comunicar y generar consultas." },
    ecommerce: { label: "Tienda online / e-commerce", intro: "Un canal de venta digital con catálogo, compra y gestión." },
    pwa: { label: "Aplicación web / PWA", intro: "Una aplicación web adaptada a los flujos de usuarios y equipos." },
    saas: { label: "Sistema de gestión / plataforma SaaS", intro: "Una plataforma con módulos, usuarios, permisos y procesos." },
    integraciones: { label: "Integraciones y automatizaciones", intro: "Conectar sistemas, servicios y tareas para mejorar la operación." },
    otro: { label: "Proyecto por definir", intro: "Una necesidad que primero requiere análisis y orientación." }
  };

  const form = document.getElementById("lead-form");
  if (!form) return;

  const config = window.YUNA_SUPABASE_CONFIG;
  const params = new URLSearchParams(window.location.search);
  const typeField = document.getElementById("lead-type");
  const requestedType = params.get("tipo");
  if (requestedType && TYPES[requestedType]) typeField.value = requestedType;
  else if (requestedType === "general") typeField.value = "otro";

  const source = (params.get("origen") || "contacto-directo")
    .replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
  const utm = {
    source: (params.get("utm_source") || "").slice(0, 80),
    medium: (params.get("utm_medium") || "").slice(0, 80),
    campaign: (params.get("utm_campaign") || "").slice(0, 100)
  };
  const status = document.getElementById("lead-error");
  const submitButton = document.getElementById("lead-submit");
  const honeypot = document.getElementById("lead-website");
  const clean = value => String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "";
    status.classList.remove("is-success");

    if (!form.reportValidity()) return;
    if (!config?.quoteRequestEndpoint || !config?.publishableKey) {
      status.textContent = "El formulario no está disponible en este momento. Escribinos por WhatsApp desde el enlace de contacto.";
      return;
    }

    const data = new FormData(form);
    const type = TYPES[data.get("project_type")];
    if (!type) {
      typeField.focus();
      return;
    }

    const name = clean(data.get("name"));
    const company = clean(data.get("company"));
    const phone = clean(data.get("phone"));
    const email = clean(data.get("email")).toLowerCase();
    const details = clean(data.get("details"));
    const timeline = clean(data.get("timeline")) || "A definir";
    const budget = clean(data.get("budget")) || "No informado";

    const phoneDigits = phone.replace(/\D/g, "");
    if (name.length < 2 || phoneDigits.length < 7 || details.length < 5) {
      status.textContent = "Revisá el nombre, el teléfono y la descripción para poder registrar la consulta.";
      return;
    }

    const message = [
      type.intro,
      "",
      "Necesidad: " + details,
      "Plazo: " + timeline,
      "Inversión: " + budget,
      utm.source || utm.medium || utm.campaign
        ? "Campaña: " + [utm.source, utm.medium, utm.campaign].filter(Boolean).join(" / ")
        : ""
    ].filter(Boolean).join("\n");

    submitButton.disabled = true;
    submitButton.textContent = "Enviando consulta…";

    try {
      const response = await fetch(config.quoteRequestEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": config.publishableKey
        },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          service: type.label,
          message: message.slice(0, 3000),
          source_page: ("contacto.html?origen=" + source).slice(0, 300),
          website: clean(honeypot?.value)
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "No pudimos registrar la consulta.");
      }

      form.reset();
      status.classList.add("is-success");
      status.textContent = "¡Consulta recibida! Gracias por contactarte con YUNA. Nos comunicaremos con vos.";
      submitButton.textContent = "Consulta enviada ✓";
    } catch (error) {
      status.classList.remove("is-success");
      status.textContent = error.message || "No pudimos enviar la consulta. Intentá nuevamente en unos minutos.";
      submitButton.disabled = false;
      submitButton.textContent = "Reintentar envío ↗";
    }
  });
})();
