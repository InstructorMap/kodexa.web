(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const setHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
  window.addEventListener("scroll", setHeader, {passive:true});
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

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), {threshold:.12});
    document.querySelectorAll(".solution-card,.process-step,.plan-card,.detail-row,.technology-detail-grid article,.v4-solution-card,.v4-approach-grid article,.v4-process-grid article").forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll(".solution-card,.process-step,.plan-card,.detail-row,.technology-detail-grid article,.v4-solution-card,.v4-approach-grid article,.v4-process-grid article").forEach(el => el.classList.add("is-visible"));
  }

  document.querySelectorAll(".preview-tab").forEach(tab => tab.addEventListener("click", () => {
    const key = tab.dataset.preview;
    document.querySelectorAll(".preview-tab").forEach(item => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-preview-panel]").forEach(panel => panel.hidden = panel.dataset.previewPanel !== key);
  }));

  // Preserve campaign attribution while moving through internal lead CTAs.
  const currentQuery = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source","utm_medium","utm_campaign"];
  document.querySelectorAll('a[href*="contacto.html"]').forEach(link => {
    const target = new URL(link.href, window.location.href);
    utmKeys.forEach(key => {
      const value = currentQuery.get(key);
      if (value && !target.searchParams.has(key)) target.searchParams.set(key, value);
    });
    link.href = target.pathname + target.search + target.hash;
  });

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  // KODEXA Copiloto: transparent, local guidance. No external AI or client-account access.
  const launcher = document.getElementById("copilot-launcher");
  const panel = document.getElementById("copilot-panel");
  const closeButton = document.getElementById("copilot-close");
  const messages = document.getElementById("copilot-messages");
  const form = document.getElementById("copilot-form");
  const input = document.getElementById("copilot-input");
  const suggestions = document.getElementById("copilot-suggestions");
  if (!launcher || !panel || !messages || !form || !input) return;
  let opened = false, lastFocus = null;

  const addMessage = (value, who="bot") => {
    const node = document.createElement("div");
    node.className = "chat-message " + (who === "user" ? "user-message" : "bot-message");
    node.textContent = value;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  };
  const addActions = items => {
    const wrap = document.createElement("div"); wrap.className = "chat-actions";
    items.forEach(item => {
      const a = document.createElement("a"); a.className = "chat-action";
      a.textContent = item.label; a.href = item.href;
      if (item.external) { a.target="_blank"; a.rel="noopener noreferrer"; }
      wrap.appendChild(a);
    });
    messages.appendChild(wrap); messages.scrollTop = messages.scrollHeight;
  };
  const open = () => {
    if (opened) return;
    opened = true; lastFocus = document.activeElement;
    panel.classList.add("is-open"); panel.setAttribute("aria-hidden","false");
    launcher.setAttribute("aria-expanded","true"); launcher.hidden = true;
    window.setTimeout(() => input.focus(), reduceMotion ? 0 : 180);
  };
  const close = () => {
    if (!opened) return;
    opened = false; panel.classList.remove("is-open"); panel.setAttribute("aria-hidden","true");
    launcher.hidden = false; launcher.setAttribute("aria-expanded","false");
    (lastFocus && typeof lastFocus.focus === "function" ? lastFocus : launcher).focus();
  };
  launcher.addEventListener("click",open); closeButton?.addEventListener("click",close);
  document.querySelectorAll("[data-open-copilot]").forEach(btn => btn.addEventListener("click",open));

  const normalize = value => value.toLocaleLowerCase("es-AR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const runIntent = raw => {
    const value = normalize(raw);
    if (/^(hola|buenas|buen dia|buenas tardes|buenas noches|hey)\b/.test(value)) {
      addMessage("¡Hola! Puedo ayudarte a explorar soluciones, orientar el alcance o iniciar una cotización. ¿Qué querés mejorar?");
    } else if (/cotiz|presupuesto|precio|cuanto sale|cuanto cuesta|valor/.test(value)) {
      addMessage("Podés configurar una referencia inicial de inversión. El importe es orientativo y el alcance final se confirma mediante una propuesta escrita.");
      addActions([{label:"Iniciar consulta",href:"contacto.html?tipo=general&origen=copiloto"}]);
    } else if (/tienda|venta|ecommerce|e-commerce|catalogo|carrito/.test(value)) {
      addMessage("Para vender online podemos diseñar un e-commerce con catálogo, carrito, checkout y herramientas de gestión. Las pasarelas y sus credenciales se validan según el proveedor.");
      addActions([{label:"Ver comercio electrónico",href:"soluciones.html#ecommerce"},{label:"Iniciar consulta",href:"contacto.html?tipo=ecommerce&origen=copiloto"}]);
    } else if (/web|pagina|landing|sitio/.test(value)) {
      addMessage("Podemos construir una web institucional o landing orientada a presentar tu propuesta, generar confianza y facilitar consultas.");
      addActions([{label:"Ver soluciones web",href:"soluciones.html#web"},{label:"Iniciar consulta",href:"contacto.html?tipo=web&origen=copiloto"}]);
    } else if (/saas|sistema|gestion|plataforma|usuarios|multi.?tenant/.test(value)) {
      addMessage("Desarrollamos sistemas web y plataformas SaaS con módulos, roles y permisos según el alcance. La autenticación y el backend se diseñan como parte de la arquitectura; no están habilitados en este sitio comercial.");
      addActions([{label:"Ver plataformas SaaS",href:"soluciones.html#saas"},{label:"Conversar sobre arquitectura",href:"contacto.html?tipo=saas&origen=copiloto"}]);
    } else if (/pwa|aplicacion|app|offline/.test(value)) {
      addMessage("Una PWA permite ofrecer una experiencia web instalable. Las capacidades offline y notificaciones dependen de la arquitectura y compatibilidad de cada dispositivo.");
      addActions([{label:"Ver aplicaciones PWA",href:"contacto.html?tipo=pwa&origen=copiloto"}]);
    } else if (/arca|afip|fiscal|factur/.test(value)) {
      addMessage("Podemos evaluar integraciones fiscales. La facturación y el uso de servicios de ARCA dependen de requisitos, credenciales y autorizaciones; no afirmamos homologación ni habilitación sin verificarlas.");
      addActions([{label:"Consultar integración",href:"contacto.html?tipo=integraciones&origen=copiloto"}]);
    } else if (/tiempo|demora|plazo|cuando estaria/.test(value)) {
      addMessage("Los plazos se estiman después de definir alcance, contenidos, integraciones y validaciones. Preferimos darte un plazo realista antes que prometer uno sin analizar el proyecto.");
      addActions([{label:"Definir mi proyecto",href:"contacto.html?tipo=general&origen=copiloto"}]);
    } else if (/contact|humano|persona|asesor|whatsapp|hablar/.test(value)) {
      addMessage("Claro. Podés contactar directamente al equipo de KODEXA.");
      addActions([{label:"Abrir WhatsApp",href:"contacto.html?tipo=general&origen=copiloto"}]);
    } else if (/seguimiento|estado de mi proyecto|mi proyecto/.test(value)) {
      addMessage("Este asistente todavía no accede a cuentas de clientes ni consulta estados de proyectos. Para una consulta concreta, te derivo al equipo.");
      addActions([{label:"Consultar al equipo",href:"contacto.html?tipo=general&origen=seguimiento"}]);
    } else {
      addMessage("Para orientarte con precisión, contame si buscás una web, una tienda online, una aplicación o un sistema de gestión. También podés hablar con el equipo.");
      addActions([{label:"Ver soluciones",href:"soluciones.html"},{label:"Hablar con KODEXA",href:"contacto.html?tipo=general&origen=copiloto"}]);
    }
  };

  form.addEventListener("submit",event=>{
    event.preventDefault(); const value=input.value.trim(); if(!value)return;
    addMessage(value,"user"); input.value=""; runIntent(value);
  });
  suggestions?.addEventListener("click",event=>{
    const button=event.target.closest("button[data-intent]"); if(!button)return;
    const prompts={quote:"Quiero cotizar un proyecto",services:"Quiero ver las soluciones",business:"Tengo un negocio y quiero mejorarlo",contact:"Quiero hablar con una persona"};
    const value=prompts[button.dataset.intent]; if(!value)return;
    addMessage(value,"user"); runIntent(value); suggestions.hidden=true;
  });
  document.addEventListener("keydown",event=>{
    if(!opened)return;
    if(event.key==="Escape"){close();return;}
    if(event.key==="Tab"){
      const focusable=[...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(el=>!el.hidden&&el.getClientRects().length);
      if(!focusable.length)return; const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
})();