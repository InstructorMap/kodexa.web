/* KODEXA — structured lead capture without a server or local PII storage */
(() => {
  "use strict";
  const PHONE = "5492213642475";
  const TYPES = {
    web: {label:"Sitio web / landing page", intro:"Una presencia digital profesional para comunicar y generar consultas."},
    ecommerce: {label:"Tienda online / e-commerce", intro:"Un canal de venta digital con catálogo, compra y gestión."},
    pwa: {label:"Aplicación web / PWA", intro:"Una aplicación web adaptada a los flujos de usuarios y equipos."},
    saas: {label:"Sistema de gestión / plataforma SaaS", intro:"Una plataforma con módulos, usuarios, permisos y procesos."},
    integraciones: {label:"Integraciones y automatizaciones", intro:"Conectar sistemas, servicios y tareas para mejorar la operación."},
    otro: {label:"Proyecto por definir", intro:"Una necesidad que primero requiere análisis y orientación."}
  };
  const form = document.getElementById("lead-form");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const typeField = document.getElementById("lead-type");
  const requestedType = params.get("tipo");
  if (requestedType && TYPES[requestedType]) typeField.value = requestedType;
  else if (requestedType === "general") typeField.value = "otro";
  const source = (params.get("origen") || "contacto-directo").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,50);
  const utm = {
    source: (params.get("utm_source") || "").slice(0,80),
    medium: (params.get("utm_medium") || "").slice(0,80),
    campaign: (params.get("utm_campaign") || "").slice(0,100)
  };
  const error = document.getElementById("lead-error");
  const clean = value => String(value || "").replace(/[\u0000-\u001f\u007f]/g," ").trim();
  const makeId = () => {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g,"").slice(0,14);
    const random = Math.random().toString(36).slice(2,7).toUpperCase();
    return "KDX-"+stamp+"-"+random;
  };
  form.addEventListener("submit", event => {
    event.preventDefault();
    error.textContent = "";
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const type = TYPES[data.get("project_type")];
    if (!type) { typeField.focus(); return; }
    const record = {
      schema_version:"1.0",
      lead_id:makeId(),
      created_at:new Date().toISOString(),
      source_page:"contacto.html",
      source_detail:source,
      utm,
      project_type:String(data.get("project_type")),
      name:clean(data.get("name")),
      company:clean(data.get("company")),
      phone:clean(data.get("phone")),
      email:clean(data.get("email")),
      timeline:clean(data.get("timeline")) || "A definir",
      budget_range:clean(data.get("budget")) || "No informado",
      description:clean(data.get("details")),
      contact_channel:"WhatsApp",
      status:"new"
    };
    const phoneDigits = record.phone.replace(/\\D/g,"");
    if (record.name.length < 2 || phoneDigits.length < 7 || record.description.length < 3) {
      error.textContent = "Revisá el nombre, el teléfono y la descripción para poder preparar la consulta.";
      if (record.name.length < 2) document.getElementById("lead-name").focus();
      else if (phoneDigits.length < 7) document.getElementById("lead-phone").focus();
      else document.getElementById("lead-details").focus();
      return;
    }
    const lines = [
      "NUEVA CONSULTA KODEXA",
      "Referencia: "+record.lead_id,
      "Tipo de proyecto: "+type.label,
      "Objetivo: "+type.intro,
      "Origen: "+record.source_detail,
      "Fecha: "+new Date(record.created_at).toLocaleString("es-AR"),
      "",
      "CONTACTO",
      "Nombre: "+record.name,
      "Empresa/organización: "+(record.company || "No informada"),
      "WhatsApp/teléfono: "+record.phone,
      "Email: "+(record.email || "No informado"),
      "",
      "CALIFICACIÓN",
      "Plazo: "+record.timeline,
      "Inversión estimada: "+record.budget_range,
      "Necesidad: "+record.description,
      "",
      "Siguiente paso: revisar el alcance y responder al contacto."
    ];
    if (record.utm.source || record.utm.medium || record.utm.campaign) {
      lines.splice(5,0,"Campaña: "+[record.utm.source,record.utm.medium,record.utm.campaign].filter(Boolean).join(" / "));
    }
    const url = "https://wa.me/"+PHONE+"?text="+encodeURIComponent(lines.join("\n"));
    window.location.assign(url);
  });
})();
