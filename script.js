(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header and mobile navigation
  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const setHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
  window.addEventListener("scroll", setHeader, { passive: true });
  setHeader();

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      menu.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      menu.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      menu.setAttribute("aria-label", "Abrir navegación");
    }));
  }

  // Small, non-essential entrance motion
  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    document.querySelectorAll(".solution-card,.process-step,.plan-card,.detail-row,.technology-detail-grid article").forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll(".solution-card,.process-step,.plan-card,.detail-row,.technology-detail-grid article").forEach(el => el.classList.add("is-visible"));
  }

  // Showcase tabs
  const previewTabs = [...document.querySelectorAll(".preview-tab")];
  const previewPanels = [...document.querySelectorAll("[data-preview-panel]")];
  previewTabs.forEach(tab => tab.addEventListener("click", () => {
    const key = tab.dataset.preview;
    previewTabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    previewPanels.forEach(panel => panel.hidden = panel.dataset.previewPanel !== key);
  }));

  // Prices are sourced from the existing cotizer catalog. app.js remains unchanged.
  const catalog = window.KODEXA?.CATALOG?.bases;
  if (catalog) {
    document.querySelectorAll("[data-catalog-price]").forEach(el => {
      const item = catalog[el.dataset.catalogPrice];
      if (item && Number.isFinite(item.price)) {
        el.textContent = "$" + item.price.toLocaleString("es-AR");
      }
    });
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  // KODEXA Copiloto — local guided assistant, no simulated AI or external API.
  const launcher = document.getElementById("copilot-launcher");
  const panel = document.getElementById("copilot-panel");
  const closeButton = document.getElementById("copilot-close");
  const messages = document.getElementById("copilot-messages");
  const form = document.getElementById("copilot-form");
  const input = document.getElementById("copilot-input");
  const suggestions = document.getElementById("copilot-suggestions");
  if (!launcher || !panel || !messages || !form || !input) return;

  const WA = "https://wa.me/5492213642475?text=";
  const cotizer = "cotizador-desktop.html";
  let opened = false;
  let lastFocus = null;
  let flow = "";

  const addMessage = (text, who = "bot") => {
    const node = document.createElement("div");
    node.className = "chat-message " + (who === "user" ? "user-message" : "bot-message");
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  };
  const addActions = (items) => {
    const wrap = document.createElement("div");
    wrap.className = "chat-actions";
    items.forEach(item => {
      const a = document.createElement("a");
      a.className = "chat-action";
      a.textContent = item.label;
      a.href = item.href;
      if (item.external) { a.target = "_blank"; a.rel = "noopener"; }
      wrap.appendChild(a);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  };
  const priceText = key => {
    const item = window.KODEXA?.CATALOG?.bases?.[key];
    return item && Number.isFinite(item.price) ? "$" + item.price.toLocaleString("es-AR") : "consultar en el cotizador";
  };
  const open = () => {
    if (opened) return;
    opened = true;
    lastFocus = document.activeElement;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-expanded", "true");
    launcher.hidden = true;
    window.setTimeout(() => input.focus(), reduceMotion ? 0 : 180);
  };
  const close = () => {
    if (!opened) return;
    opened = false;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    launcher.hidden = false;
    launcher.setAttribute("aria-expanded", "false");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    else launcher.focus();
  };
  launcher.addEventListener("click", open);
  closeButton?.addEventListener("click", close);
  document.querySelectorAll("[data-open-copilot]").forEach(btn => btn.addEventListener("click", open));

  const runIntent = raw => {
    const text = raw.toLocaleLowerCase("es-AR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/^(hola|buenas|buen dia|buenas tardes|buenas noches|hey)\b/.test(text)) {
      flow = "";
      addMessage("¡Hola! Puedo ayudarte a conocer las soluciones, revisar las referencias de planes o iniciar una cotización. ¿Por dónde querés empezar?");
      return;
    }
    if (/cotiz|presupuesto|precio|cuanto sale|cuanto cuesta|valor/.test(text)) {
      flow = "quote";
      addMessage("Podés iniciar una cotización desde el configurador. Allí seleccionás la base del proyecto y los adicionales disponibles. Los importes se muestran según el catálogo vigente.");
      addActions([{label:"Abrir cotizador",href:cotizer}]);
      return;
    }
    if (/planes|promocion|landing pro|e-commerce|sistema web/.test(text)) {
      flow = "plans";
      addMessage("Estas son las referencias actuales del catálogo: Landing Pro " + priceText("landing") + ", E-commerce " + priceText("ecommerce") + " y Sistema Web " + priceText("gestion") + ". Son importes orientativos en ARS; el presupuesto final depende del alcance y de los servicios externos.");
      addActions([{label:"Ver planes",href:"index.html#planes"},{label:"Cotizar",href:cotizer}]);
      return;
    }
    if (/servicio|solucion|que hacen|que ofrece|que desarrollan|web|tienda|pwa|saas|aplicacion|sistema/.test(text)) {
      flow = "services";
      addMessage("KODEXA desarrolla sitios web, comercio electrónico, aplicaciones PWA, plataformas SaaS e integraciones. La solución se define según el problema, los usuarios y el alcance.");
      addActions([{label:"Ver todas las soluciones",href:"soluciones.html"},{label:"Iniciar cotización",href:cotizer}]);
      return;
    }
    if (/tiempo|demora|tarda|plazo|cuando estaria/.test(text)) {
      addMessage("Los plazos dependen del alcance, los contenidos, las integraciones y las validaciones necesarias. Para darte una estimación responsable, necesitamos revisar tu proyecto. Podés iniciar una consulta por WhatsApp.");
      addActions([{label:"Consultar por WhatsApp",href:WA + encodeURIComponent("Hola KODEXA, quisiera consultar los plazos para mi proyecto."),external:true}]);
      return;
    }
    if (/arca|afip|factur/.test(text)) {
      addMessage("Podemos evaluar integraciones con servicios fiscales como parte de un proyecto. La disponibilidad depende de los requisitos técnicos, credenciales y condiciones del organismo. No afirmamos homologación ni facturación automática sin validar el caso concreto.");
      addActions([{label:"Consultar integración",href:WA + encodeURIComponent("Hola KODEXA, quiero consultar por una integración fiscal."),external:true}]);
      return;
    }
    if (/whatsapp|humano|persona|asesor|contact|hablar/.test(text)) {
      addMessage("Claro. Podés comunicarte directamente con el equipo de KODEXA por WhatsApp.");
      addActions([{label:"Abrir WhatsApp",href:WA + encodeURIComponent("Hola KODEXA, quisiera hablar con un asesor."),external:true}]);
      return;
    }
    if (/seguimiento|estado de mi proyecto|mi proyecto/.test(text)) {
      addMessage("Desde este asistente todavía no es posible consultar estados de proyectos ni acceder a cuentas de clientes. Para una consulta concreta, te derivo al equipo.");
      addActions([{label:"Contactar al equipo",href:WA + encodeURIComponent("Hola KODEXA, quisiera consultar por el estado de mi proyecto."),external:true}]);
      return;
    }
    addMessage("No tengo información suficiente para responder eso con seguridad. Puedo orientarte sobre servicios y cotizaciones, o derivarte a una persona del equipo.");
    addActions([{label:"Ver soluciones",href:"soluciones.html"},{label:"WhatsApp",href:WA + encodeURIComponent("Hola KODEXA, necesito asesoramiento."),external:true}]);
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    addMessage(value, "user");
    input.value = "";
    runIntent(value);
  });
  suggestions?.addEventListener("click", event => {
    const button = event.target.closest("button[data-intent]");
    if (!button) return;
    const intents = {quote:"Quiero cotizar",services:"Quiero ver las soluciones",plans:"Quiero consultar los planes",contact:"Quiero hablar con una persona"};
    const value = intents[button.dataset.intent];
    if (!value) return;
    addMessage(value, "user");
    runIntent(value);
    suggestions.hidden = true;
  });

  document.addEventListener("keydown", event => {
    if (!opened) return;
    if (event.key === "Escape") { close(); return; }
    if (event.key === "Tab") {
      const focusable = [...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(el => !el.hidden && el.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();