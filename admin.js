import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";

const config = window.YUNA_SUPABASE_CONFIG;
if (!config?.url || !config?.publishableKey) throw new Error("No se encontró la configuración pública de Supabase.");
const supabase = createClient(config.url, config.publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { user: null, profile: null, requests: [], clients: [], quotes: [], projects: [], currentView: "overview" };
const labels = {
  request: { new: "Nueva", contacted: "Contactada", qualified: "Calificada", closed: "Cerrada", spam: "Spam" },
  quote: { draft: "Borrador", sent: "Enviada", accepted: "Aceptada", rejected: "Rechazada", expired: "Vencida", cancelled: "Cancelada" },
  project: { planning: "Planificación", in_progress: "En curso", on_hold: "En pausa", completed: "Completado", cancelled: "Cancelado" }
};
const money = (value, currency = "ARS") => new Intl.NumberFormat("es-AR", { style: "currency", currency: currency === "ARS" ? "ARS" : currency, maximumFractionDigits: 0 }).format(Number(value || 0));
const date = value => value ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";
const safe = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const feedback = (node, message, kind = "") => { node.textContent = message; node.className = "form-feedback " + kind; };
function notify(message, error = false) {
  const el = $("#global-notice"); el.textContent = message; el.className = "notice" + (error ? " error" : ""); el.hidden = false;
  window.setTimeout(() => { el.hidden = true; }, 5000);
}
function setButtonBusy(button, busy, label) { button.disabled = busy; if (busy) { button.dataset.original = button.textContent; button.textContent = label; } else if (button.dataset.original) { button.textContent = button.dataset.original; delete button.dataset.original; } }
function empty(message, title = "Sin registros") { return `<div class="empty-state"><strong>${safe(title)}</strong>${safe(message)}</div>`; }
function pill(status, type = "request") {
  const green = ["qualified", "closed", "accepted", "completed"].includes(status);
  const gray = ["spam", "cancelled", "rejected", "expired", "on_hold"].includes(status);
  return `<span class="status-pill ${green ? "green" : gray ? "gray" : ""}">${safe(labels[type]?.[status] || status || "—")}</span>`;
}
function showView(view) {
  state.currentView = view;
  $$(".view-panel").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
  $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  const titles = { overview: "Resumen general", requests: "Solicitudes", clients: "Clientes", quotes: "Cotizaciones", projects: "Proyectos" };
  $("#page-title").textContent = titles[view] || "Panel";
}
async function checkSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) return showAuth();
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id,email,display_name,role").eq("id", session.user.id).maybeSingle();
  if (profileError) throw profileError;
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    await supabase.auth.signOut();
    showAuth();
    feedback($("#login-feedback"), "Esta cuenta no tiene permisos para ingresar al panel.", "error");
    return;
  }
  state.user = session.user; state.profile = profile;
  $("#auth-screen").hidden = true; $("#dashboard-screen").hidden = false;
  $("#user-name").textContent = profile.display_name || profile.email || "Equipo YUNA";
  $("#user-role").textContent = profile.role.toUpperCase();
  $("#user-avatar").textContent = (profile.display_name || profile.email || "Y").trim().charAt(0).toUpperCase();
  $("#today-date").textContent = new Intl.DateTimeFormat("es-AR", { dateStyle: "full" }).format(new Date());
  await loadAll();
}
function showAuth() { $("#dashboard-screen").hidden = true; $("#auth-screen").hidden = false; state.user = null; state.profile = null; }
async function loadAll() {
  const results = await Promise.all([
    supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(250),
    supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(250),
    supabase.from("quotes").select("id,quote_number,client_id,title,status,currency,total,valid_until,created_at,clients(legal_name)").order("created_at", { ascending: false }).limit(250),
    supabase.from("projects").select("id,name,client_id,status,start_date,target_date,created_at,clients(legal_name)").order("created_at", { ascending: false }).limit(250)
  ]);
  const names = ["solicitudes", "clientes", "cotizaciones", "proyectos"];
  results.forEach((r, i) => { if (r.error) throw new Error("No se pudieron cargar " + names[i] + ": " + r.error.message); });
  [state.requests, state.clients, state.quotes, state.projects] = results.map(r => r.data || []);
  renderAll();
}
function renderAll() {
  const newCount = state.requests.filter(x => x.status === "new").length;
  $("#nav-new-count").textContent = newCount;
  $("#metric-new").textContent = newCount;
  $("#metric-clients").textContent = state.clients.length;
  $("#metric-quotes").textContent = state.quotes.filter(x => ["draft", "sent"].includes(x.status)).length;
  $("#metric-projects").textContent = state.projects.filter(x => ["planning", "in_progress"].includes(x.status)).length;
  renderOverview(); renderRequests(); renderClients(); renderQuotes(); renderProjects();
}
function renderOverview() {
  const latest = state.requests.slice(0, 6);
  $("#overview-requests").innerHTML = latest.length ? `<table class="admin-table"><thead><tr><th>Contacto</th><th>Servicio</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${latest.map(r => `<tr><td class="primary-cell">${safe(r.name)}</td><td>${safe(r.service)}</td><td class="secondary-cell">${date(r.created_at)}</td><td>${pill(r.status)}</td></tr>`).join("")}</tbody></table>` : empty("Cuando alguien complete el formulario del sitio, aparecerá aquí.");
  const counts = Object.entries(labels.request).map(([key, label]) => ({ key, label, count: state.requests.filter(r => r.status === key).length }));
  const max = Math.max(1, ...counts.map(x => x.count));
  $("#pipeline-list").innerHTML = counts.map(x => `<div class="pipeline-row"><div class="pipeline-meta"><span>${x.label}</span><strong>${x.count}</strong></div><div class="pipeline-track"><div class="pipeline-fill" style="width:${Math.round(x.count / max * 100)}%"></div></div></div>`).join("");
}
function renderRequests() {
  const q = ($("#request-search")?.value || "").toLowerCase(), filter = $("#request-filter")?.value || "all";
  const rows = state.requests.filter(r => (filter === "all" || r.status === filter) && [r.name,r.company,r.email,r.phone,r.service,r.message].join(" ").toLowerCase().includes(q));
  $("#requests-table").innerHTML = rows.length ? `<table class="admin-table"><thead><tr><th>Contacto</th><th>Servicio</th><th>Mensaje</th><th>Ingreso</th><th>Seguimiento</th></tr></thead><tbody>${rows.map(r => `<tr><td><div class="primary-cell">${safe(r.name)}</div><div class="secondary-cell">${safe(r.company || r.email || r.phone || "")}</div><div class="secondary-cell">${safe(r.email || "")}</div></td><td>${safe(r.service)}</td><td style="white-space:normal;min-width:210px;max-width:320px">${safe((r.message || "").slice(0,180))}${(r.message || "").length > 180 ? "…" : ""}</td><td class="secondary-cell">${date(r.created_at)}</td><td><select class="table-select" data-request-status="${r.id}" aria-label="Estado de solicitud"><option value="new" ${r.status==="new"?"selected":""}>Nueva</option><option value="contacted" ${r.status==="contacted"?"selected":""}>Contactada</option><option value="qualified" ${r.status==="qualified"?"selected":""}>Calificada</option><option value="closed" ${r.status==="closed"?"selected":""}>Cerrada</option><option value="spam" ${r.status==="spam"?"selected":""}>Spam</option></select><button class="row-action" data-convert-request="${r.id}" type="button">Convertir en cliente</button></td></tr>`).join("")}</tbody></table>` : empty("No hay solicitudes que coincidan con el filtro.");
}
function renderClients() {
  const q = ($("#client-search")?.value || "").toLowerCase();
  const rows = state.clients.filter(c => [c.legal_name,c.contact_name,c.email,c.phone,c.tax_id].join(" ").toLowerCase().includes(q));
  $("#clients-table").innerHTML = rows.length ? `<table class="admin-table"><thead><tr><th>Empresa</th><th>Contacto</th><th>Correo</th><th>Teléfono</th><th>Alta</th><th></th></tr></thead><tbody>${rows.map(c => `<tr><td class="primary-cell">${safe(c.legal_name)}</td><td>${safe(c.contact_name || "—")}</td><td>${safe(c.email || "—")}</td><td>${safe(c.phone || "—")}</td><td class="secondary-cell">${date(c.created_at)}</td><td><button class="row-action" type="button" data-edit-client="${c.id}">Editar</button></td></tr>`).join("")}</tbody></table>` : empty("Todavía no hay clientes registrados.");
}
function renderQuotes() {
  const q = ($("#quote-search")?.value || "").toLowerCase();
  const rows = state.quotes.filter(x => [x.title,x.quote_number,x.clients?.legal_name,x.status].join(" ").toLowerCase().includes(q));
  $("#quotes-table").innerHTML = rows.length ? `<table class="admin-table"><thead><tr><th>Número</th><th>Cliente</th><th>Concepto</th><th>Importe</th><th>Estado</th><th>Fecha</th><th>Documento</th></tr></thead><tbody>${rows.map(x => `<tr><td class="primary-cell">#${x.quote_number}</td><td>${safe(x.clients?.legal_name || "Sin cliente")}</td><td>${safe(x.title)}</td><td>${money(x.total,x.currency)}</td><td><select class="table-select" data-qstatus="${x.id}" aria-label="Estado de cotización">${Object.entries(labels.quote).map(([k,v])=>`<option value="${k}" ${x.status===k?"selected":""}>${v}</option>`).join("")}</select></td><td class="secondary-cell">${date(x.created_at)}</td><td><button class="row-action" data-pdf="${x.id}">PDF ↗</button></td></tr>`).join("")}</tbody></table>` : empty("Las cotizaciones creadas se mostrarán aquí.");
}
function renderProjects() {
  const q = ($("#project-search")?.value || "").toLowerCase();
  const rows = state.projects.filter(x => [x.name,x.clients?.legal_name,x.status].join(" ").toLowerCase().includes(q));
  $("#projects-table").innerHTML = rows.length ? `<table class="admin-table"><thead><tr><th>Proyecto</th><th>Cliente</th><th>Estado</th><th>Inicio</th><th>Fecha objetivo</th><th>Actividad</th><th></th></tr></thead><tbody>${rows.map(x => `<tr><td class="primary-cell">${safe(x.name)}</td><td>${safe(x.clients?.legal_name || "—")}</td><td><select class="table-select" data-project-status="${x.id}" aria-label="Estado de proyecto">${Object.entries(labels.project).map(([k,v])=>`<option value="${k}" ${x.status===k?"selected":""}>${v}</option>`).join("")}</select></td><td class="secondary-cell">${date(x.start_date)}</td><td class="secondary-cell">${date(x.target_date)}</td><td><button class="row-action" data-project-events="${x.id}" type="button">Ver historial</button></td><td><button class="row-action" data-edit-project="${x.id}" type="button">Editar</button></td></tr>`).join("")}</tbody></table>` : empty("Creá un proyecto para empezar a organizar las entregas.");
}
async function showProjectHistory(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return notify("No se encontró el proyecto.", true);
  let dialog = $("#project-history-dialog");
  if (!dialog) {
    document.body.insertAdjacentHTML("beforeend", '<dialog class="admin-dialog" id="project-history-dialog"><div class="dialog-form"><div class="dialog-head"><div><span class="admin-eyebrow">TRAZABILIDAD</span><h2 id="project-history-title">Historial del proyecto</h2></div><button type="button" class="dialog-close" data-close="project-history-dialog" aria-label="Cerrar">×</button></div><div id="project-history-content" class="table-wrap"></div></div></dialog>');
    dialog = $("#project-history-dialog");
    dialog.querySelector('[data-close="project-history-dialog"]').addEventListener("click", () => dialog.close());
  }
  $("#project-history-title").textContent = project.name;
  $("#project-history-content").innerHTML = '<div class="empty-state">Cargando actividad…</div>';
  dialog.showModal();
  const { data, error } = await supabase.from("project_events").select("event_type,description,created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(100);
  if (error) return $("#project-history-content").innerHTML = '<div class="empty-state">No se pudo cargar el historial: ' + safe(error.message) + '</div>';
  $("#project-history-content").innerHTML = data.length ? '<table class="admin-table"><thead><tr><th>Fecha</th><th>Evento</th><th>Detalle</th></tr></thead><tbody>' + data.map(e => '<tr><td>' + date(e.created_at) + '</td><td>' + safe(e.event_type) + '</td><td>' + safe(e.description) + '</td></tr>').join("") + '</tbody></table>' : empty("Todavía no hay actividad registrada para este proyecto.");
}
async function updateStatus(table, id, status, collection, render) {
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) { notify("No se pudo actualizar el estado: " + error.message, true); await loadAll(); return; }
  const item = collection.find(x => x.id === id);
  if (table === "projects" && item && item.status !== status) {
    const { error: eventError } = await supabase.from("project_events").insert({
      project_id: id, event_type: "status_changed",
      description: "Estado del proyecto actualizado: " + item.status + " → " + status,
      metadata: { previous_status: item.status, new_status: status }
    });
    if (eventError) console.warn("No se pudo registrar el evento del proyecto:", eventError.message);
  }
  if (item) item.status = status;
  renderAll(); notify("Estado actualizado correctamente.");
}
async function convertRequestToClient(id) {
  const request = state.requests.find(r => r.id === id);
  if (!request) return notify("No se encontró la solicitud.", true);
  let client = null;
  if (request.email) client = state.clients.find(c => c.email && c.email.toLowerCase() === request.email.toLowerCase());
  if (!client && request.phone) client = state.clients.find(c => c.phone && c.phone.replace(/\\D/g,"") === request.phone.replace(/\\D/g,""));
  if (!client) {
    const payload = {
      legal_name: (request.company || request.name || "Cliente potencial").trim(),
      contact_name: request.name || null,
      email: request.email || null,
      phone: request.phone || null,
      notes: ["Servicio solicitado: " + request.service, request.message].filter(Boolean).join("\\n")
    };
    const { data, error } = await supabase.from("clients").insert(payload).select("id").single();
    if (error) return notify("No se pudo crear el cliente: " + error.message, true);
    client = data;
  }
  const { error } = await supabase.from("quote_requests").update({ status: "qualified" }).eq("id", id);
  if (error) return notify("Cliente registrado, pero no se pudo actualizar la solicitud: " + error.message, true);
  await loadAll();
  notify("Solicitud convertida en cliente" + (client.id ? "." : "."));
}
async function saveClient(event) {
  event.preventDefault(); const form = event.currentTarget, button = $('button[type="submit"]', form);
  const data = Object.fromEntries(new FormData(form).entries());
  data.legal_name = data.legal_name.trim();
  ["contact_name","email","phone","tax_id","website","notes"].forEach(k => { data[k] = data[k].trim() || null; });
  setButtonBusy(button,true,"Guardando…"); feedback($("#client-feedback"),"");
  const editId = form.dataset.editId;
  const query = editId ? supabase.from("clients").update(data).eq("id",editId) : supabase.from("clients").insert(data);
  const { error } = await query;
  setButtonBusy(button,false);
  if (error) return feedback($("#client-feedback"),"No se pudo guardar: " + error.message,"error");
  delete form.dataset.editId; form.reset(); $("#client-dialog").close(); await loadAll(); notify(editId ? "Ficha de cliente actualizada." : "Cliente registrado.");
}
async function saveProject(event) {
  event.preventDefault(); const form = event.currentTarget, button = $('button[type="submit"]', form);
  const data = Object.fromEntries(new FormData(form).entries());
  data.name = data.name.trim(); data.description = data.description.trim() || null;
  data.start_date = data.start_date || null; data.target_date = data.target_date || null;
  setButtonBusy(button,true,"Creando…"); feedback($("#project-feedback"),"");
  const editId = form.dataset.editId;
  const previous = state.projects.find(p => p.id === editId);
  const query = editId ? supabase.from("projects").update(data).eq("id",editId) : supabase.from("projects").insert(data);
  const { error } = await query;
  setButtonBusy(button,false);
  if (error) return feedback($("#project-feedback"),"No se pudo guardar: " + error.message,"error");
  if (editId && previous) {
    const changed = Object.keys(data).filter(k => (previous[k] ?? "") !== (data[k] ?? ""));
    if (changed.length) {
      const { error: eventError } = await supabase.from("project_events").insert({project_id:editId,event_type:"project_edited",description:"Se actualizaron datos del proyecto: "+changed.join(", "),metadata:{changed_fields:changed}});
      if (eventError) console.warn("No se pudo registrar la edición del proyecto:",eventError.message);
    }
  }
  delete form.dataset.editId; form.reset(); $("#project-dialog").close(); await loadAll(); notify(editId ? "Proyecto actualizado." : "Proyecto creado correctamente.");
}
async function openProjectDialog() {
  const select = $("#project-client");
  select.innerHTML = '<option value="">Seleccionar cliente…</option>' + state.clients.map(c => `<option value="${c.id}">${safe(c.legal_name)}</option>`).join("");
  if (!state.clients.length) { notify("Primero registrá un cliente para poder asociar el proyecto.", true); showView("clients"); return; }
  $("#project-dialog").showModal();
}

$("#login-form").addEventListener("submit", async event => {
  event.preventDefault(); const form = event.currentTarget, button = $("#login-button");
  const email = form.email.value.trim(), password = form.password.value;
  setButtonBusy(button,true,"Verificando acceso…"); feedback($("#login-feedback"),"");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  setButtonBusy(button,false);
  if (error) return feedback($("#login-feedback"),"No se pudo iniciar sesión. Verificá tus datos o los permisos de la cuenta.","error");
  try { await checkSession(); } catch (e) { feedback($("#login-feedback"),"No se pudo validar el perfil: " + e.message,"error"); await supabase.auth.signOut(); showAuth(); }
});
$("#logout-button").addEventListener("click", async () => { await supabase.auth.signOut(); showAuth(); });
$("#refresh-button").addEventListener("click", async () => { try { await loadAll(); notify("Datos actualizados."); } catch(e) { notify(e.message,true); } });
$$(".nav-item").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
$$("[data-goto]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.goto)));
$$("[data-close]").forEach(btn => btn.addEventListener("click", () => $("#" + btn.dataset.close).close()));
$("#new-client-button").addEventListener("click", () => { const form=$("#client-form"); delete form.dataset.editId; form.reset(); $("#client-dialog").querySelector("h2").textContent="Agregar cliente"; $("#client-dialog").showModal(); });
$("#new-project-button").addEventListener("click", () => { const form=$("#project-form"); delete form.dataset.editId; form.reset(); $("#project-dialog").querySelector("h2").textContent="Crear proyecto"; openProjectDialog(); });
$("#client-form").addEventListener("submit", saveClient);
$("#project-form").addEventListener("submit", saveProject);
$("#request-search").addEventListener("input", renderRequests);
$("#request-filter").addEventListener("change", renderRequests);
$("#client-search").addEventListener("input", renderClients);
$("#clients-table").addEventListener("click", event => { const btn=event.target.closest("[data-edit-client]"); if(!btn)return; const client=state.clients.find(c=>c.id===btn.dataset.editClient); if(!client)return notify("No se encontró el cliente.",true); const form=$("#client-form"); form.dataset.editId=client.id; ["legal_name","contact_name","email","phone","tax_id","website","notes"].forEach(key=>{const field=form.elements.namedItem(key);if(field)field.value=client[key]||"";}); $("#client-dialog").querySelector("h2").textContent="Editar cliente"; $("#client-dialog").showModal(); });
$("#quote-search").addEventListener("input", renderQuotes);
$("#project-search").addEventListener("input", renderProjects);
$("#requests-table").addEventListener("change", event => { const el = event.target.closest("[data-request-status]"); if (el) updateStatus("quote_requests",el.dataset.requestStatus,el.value,state.requests,renderRequests); });
$("#requests-table").addEventListener("click", event => { const el = event.target.closest("[data-convert-request]"); if (el) convertRequestToClient(el.dataset.convertRequest); });
$("#projects-table").addEventListener("change", event => { const el = event.target.closest("[data-project-status]"); if (el) updateStatus("projects",el.dataset.projectStatus,el.value,state.projects,renderProjects); });
$("#projects-table").addEventListener("click", event => { const history = event.target.closest("[data-project-events]"); if (history) showProjectHistory(history.dataset.projectEvents); const edit = event.target.closest("[data-edit-project]"); if (edit) { const project=state.projects.find(p=>p.id===edit.dataset.editProject); if(!project)return notify("No se encontró el proyecto.",true); const form=$("#project-form"); form.dataset.editId=project.id; ["name","client_id","description","start_date","target_date"].forEach(key=>{const field=form.elements.namedItem(key);if(field)field.value=project[key]||"";}); $("#project-dialog").querySelector("h2").textContent="Editar proyecto"; $("#project-dialog").showModal(); } });
$("#quotes-table").addEventListener("change", event => { const el = event.target.closest("[data-quote-status]"); if (el) updateStatus("quotes",el.dataset.quoteStatus,el.value,state.quotes,renderQuotes); });
supabase.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_OUT") showAuth(); });
checkSession().catch(error => { console.error("YUNA admin:", error); showAuth(); feedback($("#login-feedback"),"No se pudo conectar con el sistema. Intentá actualizar la página.","error"); });
