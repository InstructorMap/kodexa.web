/* KODEXA — Cotizador inteligente v2
 * Motor de estimación local. Sin backend, sin Supabase y sin persistencia de datos personales.
 */
(() => {
  "use strict";

  const WA = "5492213642475";
  const CATALOG = {
    solutions: {
      landing: { label: "Landing page", category: "Presencia digital", mode: "from", min: 380000, max: 380000, desc: "Una página de alto impacto para presentar una oferta y convertir visitas en consultas." },
      institutional: { label: "Sitio web institucional", category: "Presencia digital", mode: "from", min: 620000, max: 620000, desc: "Sitio multipágina, contenidos, formularios y estructura profesional." },
      ecommerce: { label: "Tienda online / e-commerce", category: "Comercio digital", mode: "from", min: 1150000, max: 1150000, desc: "Catálogo, carrito, checkout y gestión de ventas." },
      pwa: { label: "Aplicación web progresiva (PWA)", category: "Aplicaciones", mode: "range", min: 1800000, max: 4300000, desc: "Experiencia instalable, adaptable a móviles y con capacidades offline según alcance." },
      apk: { label: "Aplicación Android híbrida (APK / AAB)", category: "Aplicaciones", mode: "range", min: 2600000, max: 6500000, desc: "Aplicación web empaquetada con Capacitor e integración de funciones nativas." },
      native: { label: "Aplicación Android nativa", category: "Aplicaciones", mode: "range", min: 5200000, max: 12500000, desc: "Desarrollo nativo Android, con arquitectura y componentes propios de la plataforma." },
      saas: { label: "Plataforma SaaS multiempresa", category: "Plataformas", mode: "range", min: 4800000, max: 14500000, desc: "Producto multi-tenant con organizaciones, roles, paneles y operación recurrente." },
      operations: { label: "Sistema operativo / gestión a medida", category: "Plataformas", mode: "range", min: 5200000, max: 16800000, desc: "Flujos de trabajo, módulos operativos, trazabilidad y paneles especializados." },
      integrations: { label: "Integración o automatización", category: "Integraciones", mode: "range", min: 550000, max: 2400000, desc: "Conexión de plataformas, APIs, pagos, mensajería y procesos existentes." },
      custom: { label: "Producto digital a definir", category: "Consultoría", mode: "range", min: 1200000, max: 8000000, desc: "Análisis de una necesidad que requiere definición funcional y técnica." }
    },
    modules: {
      auth: { label: "Acceso, autenticación y recuperación", min: 280000, max: 650000, group: "Base de plataforma" },
      roles: { label: "Roles, permisos y perfiles", min: 260000, max: 720000, group: "Base de plataforma" },
      multitenant: { label: "Arquitectura multi-tenant (varias organizaciones)", min: 1500000, max: 4200000, group: "Base de plataforma" },
      admin: { label: "Panel administrativo y back-office", min: 520000, max: 1550000, group: "Gestión" },
      crm: { label: "CRM, clientes y seguimiento comercial", min: 450000, max: 1300000, group: "Gestión" },
      payments: { label: "Pagos online y estados de cobro", min: 350000, max: 1050000, group: "Comercio e integraciones" },
      invoicing: { label: "Facturación / integración ARCA", min: 480000, max: 1450000, group: "Comercio e integraciones" },
      api: { label: "Integración con APIs o sistemas externos", min: 380000, max: 1450000, group: "Comercio e integraciones" },
      whatsapp: { label: "WhatsApp y notificaciones automatizadas", min: 220000, max: 780000, group: "Comercio e integraciones" },
      qr: { label: "QR, credenciales y validador público", min: 320000, max: 980000, group: "Identidad digital" },
      wallet: { label: "Wallet, carnet o credencial digital", min: 450000, max: 1350000, group: "Identidad digital" },
      gps: { label: "Geolocalización, mapas y seguimiento", min: 520000, max: 1650000, group: "Operación en tiempo real" },
      ptt: { label: "Comunicación Push-to-Talk tipo Zello (WebRTC)", min: 1600000, max: 4800000, group: "Operación en tiempo real" },
      realtime: { label: "Eventos y sincronización en tiempo real", min: 480000, max: 1550000, group: "Operación en tiempo real" },
      push: { label: "Notificaciones push web / móviles", min: 260000, max: 850000, group: "Aplicación móvil" },
      offline: { label: "Modo offline y sincronización posterior", min: 520000, max: 1850000, group: "Aplicación móvil" },
      nativeFeatures: { label: "Funciones del dispositivo (cámara, archivos, sensores)", min: 350000, max: 1250000, group: "Aplicación móvil" },
      reports: { label: "Reportes, métricas y exportaciones", min: 320000, max: 1050000, group: "Datos e inteligencia" },
      ai: { label: "Asistente IA / procesamiento inteligente", min: 850000, max: 2800000, group: "Datos e inteligencia" },
      media: { label: "Archivos, imágenes, audio y almacenamiento", min: 280000, max: 980000, group: "Datos e inteligencia" }
    },
    maintenance: {
      none: { label: "Sin plan de mantenimiento", rate: 0 },
      essential: { label: "Mantenimiento esencial", rate: 0.08 },
      continuous: { label: "Evolución y soporte continuo", rate: 0.12 }
    }
  };

  const INCLUDED_BY_SOLUTION = {
    ecommerce: ["auth", "admin"],
    saas: ["auth", "roles", "multitenant", "admin"],
    operations: ["auth", "roles", "admin"]
  };

  const state = {
    step: 1,
    solution: "landing",
    orgs: "single",
    users: "up_to_50",
    platforms: ["web"],
    modules: [],
    maintenance: "none",
    timeline: "flexible",
    name: "",
    company: "",
    phone: "",
    email: "",
    notes: ""
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => "$" + Math.round(value).toLocaleString("es-AR");
  const solution = () => CATALOG.solutions[state.solution];
  const factor = () => {
    const scalesWithOrganizations = ["saas", "operations"].includes(state.solution);
    const scalesWithUsers = ["pwa", "apk", "native", "saas", "operations", "custom"].includes(state.solution);
    const org = scalesWithOrganizations
      ? ({ single: 1, small: 1.08, medium: 1.18, large: 1.32 }[state.orgs] || 1)
      : 1;
    const users = scalesWithUsers
      ? ({ up_to_50: 1, up_to_500: 1.08, up_to_5000: 1.2, above_5000: 1.38 }[state.users] || 1)
      : 1;
    // No se penalizan webs informativas por volumen de usuarios ni se aplica
    // un recargo automático por canales. Web + Android ya está incluido en APK híbrida.
    return org * users;
  };
  const includedModuleIds = () => INCLUDED_BY_SOLUTION[state.solution] || [];
  const requiredModuleIds = () => (
    ["operations", "custom"].includes(state.solution) && state.orgs !== "single"
      ? ["multitenant"]
      : []
  );
  const billableModuleIds = () => [...new Set([...state.modules, ...requiredModuleIds()])]
    .filter(id => !includedModuleIds().includes(id));
  const estimate = () => {
    const base = solution();
    const extras = billableModuleIds().map(id => CATALOG.modules[id]).filter(Boolean);
    const addonMin = extras.reduce((sum, item) => sum + item.min, 0);
    const addonMax = extras.reduce((sum, item) => sum + item.max, 0);
    const f = factor();
    const min = Math.round((base.min + addonMin) * f / 10000) * 10000;
    const max = Math.round((base.max + addonMax) * f / 10000) * 10000;
    return { min, max, from: base.mode === "from" && extras.length === 0, factor: f };
  };
  const monthly = () => {
    const e = estimate();
    const rate = CATALOG.maintenance[state.maintenance].rate;
    return rate ? { min: Math.round(e.min * rate / 10000) * 10000, max: Math.round(e.max * rate / 10000) * 10000 } : null;
  };

  function setStep(step) {
    state.step = Math.max(1, Math.min(4, step));
    const platformError = $("#platform-error");
    if (platformError) platformError.textContent = "";
    $$(".quote-stage").forEach(el => el.hidden = Number(el.dataset.stage) !== state.step);
    $$(".quote-stepper button").forEach(btn => {
      const n = Number(btn.dataset.go);
      btn.classList.toggle("is-current", n === state.step);
      btn.classList.toggle("is-done", n < state.step);
      btn.setAttribute("aria-current", n === state.step ? "step" : "false");
    });
    $("#quote-back").hidden = state.step === 1;
    $("#quote-next").hidden = state.step === 4;
    $("#quote-send").hidden = state.step !== 4;
    $("#quote-next").textContent = state.step === 3 ? "Revisar estimación" : "Continuar";
    renderSummary();
    $("#quote-builder").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function syncPlatformInputs() {
    $$("[name='platform']").forEach(el => {
      el.checked = state.platforms.includes(el.value);
      el.disabled = el.value === "android" && (state.solution === "apk" || state.solution === "native");
    });
  }

  function renderSolutionCards() {
    const host = $("#solution-grid");
    host.replaceChildren();
    const groups = [
      ["Presencia digital", ["landing", "institutional", "ecommerce"]],
      ["Aplicaciones", ["pwa", "apk", "native"]],
      ["Plataformas y sistemas", ["saas", "operations", "integrations", "custom"]]
    ];
    groups.forEach(([heading, ids]) => {
      const group = document.createElement("div");
      group.className = "solution-group";
      const title = document.createElement("h3"); title.textContent = heading; group.append(title);
      const grid = document.createElement("div"); grid.className = "solution-cards";
      ids.forEach(id => {
        const item = CATALOG.solutions[id];
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "solution-card" + (state.solution === id ? " is-selected" : "");
        btn.setAttribute("aria-pressed", String(state.solution === id));
        const top = document.createElement("span"); top.className = "solution-card-top";
        const cat = document.createElement("small"); cat.textContent = item.category;
        const check = document.createElement("i"); check.textContent = state.solution === id ? "✓" : "+";
        top.append(cat, check);
        const name = document.createElement("b"); name.textContent = item.label;
        const desc = document.createElement("p"); desc.textContent = item.desc;
        const price = document.createElement("strong"); price.textContent = item.mode === "from" ? "Desde " + money(item.min) : money(item.min) + " – " + money(item.max);
        const note = document.createElement("small"); note.className = "solution-card-note"; note.textContent = item.mode === "from" ? "Precio inicial orientativo" : "Rango inicial orientativo";
        btn.append(top, name, desc, price, note);
        btn.addEventListener("click", () => {
          state.solution = id;
          state.platforms = id === "apk" ? ["web", "android"] : id === "native" ? ["android"] : ["web"];
          renderSolutionCards();
          renderModules();
          syncPlatformInputs();
          renderSummary();
        });
        grid.append(btn);
      });
      group.append(grid); host.append(group);
    });
  }

  function renderModules() {
    const host = $("#module-groups");
    host.replaceChildren();
    const groups = [...new Set(Object.values(CATALOG.modules).map(item => item.group))];
    groups.forEach(groupName => {
      const section = document.createElement("section"); section.className = "module-group";
      const heading = document.createElement("h3"); heading.textContent = groupName; section.append(heading);
      const grid = document.createElement("div"); grid.className = "module-grid";
      Object.entries(CATALOG.modules).filter(([,item]) => item.group === groupName).forEach(([id,item]) => {
        const label = document.createElement("label"); label.className = "module-option";
        const included = includedModuleIds().includes(id);
        const required = requiredModuleIds().includes(id);
        const input = document.createElement("input"); input.type = "checkbox"; input.checked = included || required || state.modules.includes(id); input.disabled = included || required;
        input.addEventListener("change", () => {
          state.modules = input.checked ? [...state.modules, id] : state.modules.filter(x => x !== id);
          renderSummary();
        });
        const content = document.createElement("span"); content.className = "module-copy";
        const name = document.createElement("b"); name.textContent = item.label;
        const range = document.createElement("small"); range.textContent = included ? "Incluido en el alcance base · sin costo adicional" : required ? "Requerido por la arquitectura seleccionada · incluido en la estimación" : money(item.min) + " – " + money(item.max);
        content.append(name, range); label.append(input, content); grid.append(label);
      });
      section.append(grid); host.append(section);
    });
  }

  function renderSummary() {
    const e = estimate(), m = monthly(), base = solution();
    $("#summary-solution").textContent = base.label;
    const included = includedModuleIds().map(id => CATALOG.modules[id].label);
    const extras = billableModuleIds().map(id => CATALOG.modules[id].label);
    $("#summary-modules").textContent = [
      included.length ? "Incluidos: " + included.join(", ") : "",
      extras.length ? "Adicionales: " + extras.join(", ") : "Sin módulos adicionales"
    ].filter(Boolean).join(" | ");
    $("#summary-range").textContent = e.from ? "Desde " + money(e.min) : money(e.min) + " – " + money(e.max);
    $("#summary-mode").textContent = e.from ? "Precio inicial" : "Rango de inversión orientativo";
    $("#summary-monthly").textContent = m ? money(m.min) + " – " + money(m.max) + " / mes" : "No seleccionado";
    $("#summary-ops").textContent = "Infraestructura y servicios externos: variables, se dimensionan aparte.";
    $("#summary-factor").textContent = "Ajuste por escala (organizaciones y usuarios): ×" + e.factor.toFixed(2) + ". Plataformas informadas sin recargo automático.";
    $("#summary-platforms").textContent = state.platforms.map(x => ({web:"Web",android:"Android",ios:"iOS"}[x])).join(" · ") || "A definir";
    $("#summary-orgs").textContent = ({single:"Una organización",small:"2 a 5 organizaciones",medium:"6 a 20 organizaciones",large:"Más de 20 organizaciones"})[state.orgs];
    $("#summary-users").textContent = ({up_to_50:"Hasta 50",up_to_500:"51 a 500",up_to_5000:"501 a 5.000",above_5000:"Más de 5.000"})[state.users];
  }

  function bindInputs() {
    $("[name='orgs']").forEach(el => el.addEventListener("change", () => { if (el.checked) state.orgs = el.value; renderModules(); renderSummary(); }));
    $$("[name='users']").forEach(el => el.addEventListener("change", () => { if (el.checked) state.users = el.value; renderSummary(); }));
    $$("[name='platform']").forEach(el => el.addEventListener("change", () => {
      state.platforms = $$("[name='platform']:checked").map(x => x.value);
      if ((state.solution === "apk" || state.solution === "native") && !state.platforms.includes("android")) {
        state.platforms.push("android");
      }
      syncPlatformInputs();
      $("#platform-error").textContent = "";
      renderSummary();
    }));
    $$("[name='maintenance']").forEach(el => el.addEventListener("change", () => { if (el.checked) state.maintenance = el.value; renderSummary(); }));
    $$("[name='timeline']").forEach(el => el.addEventListener("change", () => { if (el.checked) state.timeline = el.value; }));
    ["name","company","phone","email","notes"].forEach(key => {
      const el = $("#client-" + key);
      if (el) el.addEventListener("input", () => { state[key] = el.value; });
    });
  }

  function validateStage() {
    if (state.step === 1 && !CATALOG.solutions[state.solution]) return false;
    if (state.step === 2 && !state.platforms.length) { $("#platform-error").textContent = "Seleccioná al menos una plataforma."; return false; }
    if (state.step === 2 && (state.solution === "apk" || state.solution === "native") && !state.platforms.includes("android")) {
      $("#platform-error").textContent = "La solución Android requiere mantener seleccionada esa plataforma.";
      return false;
    }
    if (state.step === 4) {
      const form = $("#quote-client-form");
      if (!form.reportValidity()) return false;
      const digits = state.phone.replace(/\D/g, "");
      if (state.name.trim().length < 2 || digits.length < 7) { $("#client-error").textContent = "Revisá el nombre y el teléfono de contacto."; return false; }
    }
    return true;
  }

  function buildMessage() {
    const e = estimate(), m = monthly();
    const lines = [
      "SOLICITUD DE PROYECTO — KODEXA",
      "Referencia: KDX-" + new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      "",
      "SOLUCIÓN: " + solution().label,
      "PLATAFORMAS: " + state.platforms.join(", "),
      "NOTA DE PLATAFORMAS: " + (state.platforms.includes("ios") ? "iOS requiere evaluación y cotización específica; no se aplica un recargo automático." : state.solution === "apk" ? "La base Web + Android está contemplada en la aplicación híbrida." : "Alcance de plataforma sujeto a validación técnica."),
      "ORGANIZACIONES: " + state.orgs,
      "USUARIOS: " + state.users,
      "FUNCIONES INCLUIDAS EN EL PRODUCTO BASE: " + (includedModuleIds().map(id => CATALOG.modules[id].label).join("; ") || "Según solución seleccionada"),
      "MÓDULOS ADICIONALES: " + (billableModuleIds().map(id => CATALOG.modules[id].label).join("; ") || "No seleccionados"),
      "MANTENIMIENTO: " + CATALOG.maintenance[state.maintenance].label,
      "PLAZO: " + state.timeline,
      "INVERSIÓN INICIAL ESTIMADA: " + (e.from ? "Desde " + money(e.min) : money(e.min) + " a " + money(e.max)),
      "MANTENIMIENTO MENSUAL: " + (m ? money(m.min) + " a " + money(m.max) : "No seleccionado"),
      "INFRAESTRUCTURA: se dimensiona aparte según uso y servicios externos.",
      "",
      "CONTACTO",
      "Nombre: " + state.name.trim(),
      "Empresa: " + (state.company.trim() || "No informada"),
      "Teléfono: " + state.phone.trim(),
      "Email: " + (state.email.trim() || "No informado"),
      "Necesidad: " + (state.notes.trim() || "A conversar"),
      "",
      "Solicito validar alcance, arquitectura, cronograma y presupuesto definitivo."
    ];
    return lines.join("\n");
  }

  function bindNavigation() {
    $("#quote-next").addEventListener("click", () => { if (validateStage()) setStep(state.step + 1); });
    $("#quote-back").addEventListener("click", () => setStep(state.step - 1));
    $$(".quote-stepper button").forEach(btn => btn.addEventListener("click", () => {
      const target = Number(btn.dataset.go);
      if (target < state.step) setStep(target);
    }));
    $("#quote-client-form").addEventListener("submit", event => {
      event.preventDefault();
      if (!validateStage()) return;
      const url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(buildMessage());
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  function init() {
    renderSolutionCards();
    renderModules();
    syncPlatformInputs();
    bindInputs();
    bindNavigation();
    renderSummary();
    setStep(1);
    const year = $("#current-year"); if (year) year.textContent = String(new Date().getFullYear());
  }
  document.addEventListener("DOMContentLoaded", init);
})();
