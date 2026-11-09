import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";
const cfg=window.YUNA_SUPABASE_CONFIG;
const db=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:2}).format(Number(v||0));
let loaded=false, report={clients:[],quotes:[],projects:[],transactions:[],requests:[]};
function addNav(){
 const nav=$(".admin-nav"),main=$(".admin-content"); if(!nav||!main||$("#view-reports"))return;
 const btn=document.createElement("button");btn.className="nav-item";btn.dataset.view="reports";btn.innerHTML="<span>▥</span> Reportes";nav.append(btn);
 main.insertAdjacentHTML("beforeend",'<section class="view-panel" id="view-reports"><div class="section-toolbar"><div><span class="admin-eyebrow">INTELIGENCIA / CONTROL</span><h2>Reportes y exportaciones</h2><p>Indicadores consolidados y descarga de datos operativos en CSV.</p></div><div class="toolbar-actions"><button class="admin-button secondary" id="report-refresh">Actualizar</button></div></div><div class="ops-metrics" id="report-metrics"><div class="empty-state">Cargando indicadores…</div></div><div class="panel-card table-card"><div class="panel-heading"><div><span class="admin-eyebrow">DESCARGAS</span><h3>Exportar información</h3></div></div><div class="report-export-grid"><article><strong>Clientes</strong><p>Base de clientes y contactos.</p><button class="admin-button secondary" data-export="clients">Descargar CSV</button></article><article><strong>Cotizaciones</strong><p>Estados e importes comerciales.</p><button class="admin-button secondary" data-export="quotes">Descargar CSV</button></article><article><strong>Proyectos</strong><p>Estado y fechas de ejecución.</p><button class="admin-button secondary" data-export="projects">Descargar CSV</button></article><article><strong>Finanzas</strong><p>Ingresos y egresos registrados.</p><button class="admin-button secondary" data-export="transactions">Descargar CSV</button></article><article><strong>Solicitudes</strong><p>Entradas comerciales del sitio.</p><button class="admin-button secondary" data-export="requests">Descargar CSV</button></article></div></div><p class="secondary-cell" style="margin-top:14px">Los archivos incluyen los registros visibles para tu rol según las políticas de acceso de Supabase. No se exportan hashes de IP ni agentes de usuario.</p></section>');
 btn.addEventListener("click",()=>showReports());
}
function showReports(){
 document.querySelectorAll(".view-panel").forEach(x=>x.classList.toggle("active",x.id==="view-reports"));
 document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.view==="reports"));
 const title=$("#page-title");if(title)title.textContent="Reportes y exportaciones";
 refresh().catch(e=>notice("No se pudieron cargar los reportes: "+e.message,true));
}
function notice(m,bad=false){const n=$("#global-notice");if(!n)return;n.textContent=m;n.hidden=false;n.classList.toggle("error",bad);setTimeout(()=>n.hidden=true,5000);}
async function refresh(){
 const specs=[["clients","clients","id,legal_name,contact_name,email,phone,tax_id,website,created_at"],["quotes","quotes","id,quote_number,title,status,currency,subtotal,discount,total,valid_until,created_at,client_id"],["projects","projects","id,name,status,start_date,target_date,created_at,client_id,quote_id"],["transactions","financial_transactions","id,transaction_type,description,amount,currency,status,transaction_date,client_id,project_id,reference,notes"],["requests","quote_requests","id,name,company,email,phone,service,message,status,source_page,created_at"]];
 const results=await Promise.all(specs.map(async([key,table,cols])=>{const {data,error}=await db.from(table).select(cols).order("created_at",{ascending:false}).limit(5000);if(error)throw error;report[key]=data||[];}));
 const paid=report.transactions.filter(x=>x.status==="paid"),income=paid.filter(x=>x.transaction_type==="income").reduce((a,x)=>a+Number(x.amount),0),expense=paid.filter(x=>x.transaction_type==="expense").reduce((a,x)=>a+Number(x.amount),0);
 const accepted=report.quotes.filter(x=>x.status==="accepted").length,active=report.projects.filter(x=>["planning","in_progress"].includes(x.status)).length;
 const cards=[["Clientes",report.clients.length],["Solicitudes",report.requests.length],["Cotizaciones aceptadas",accepted],["Proyectos activos",active],["Ingresos cobrados",money(income)],["Egresos pagados",money(expense)],["Saldo registrado",money(income-expense)]];
 $("#report-metrics").innerHTML=cards.map(([k,v])=>'<article class="metric-card"><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></article>').join("");
}
function csvCell(v){let s=String(v??"");if(/^[=+@\\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function exportCsv(key){
 const rows=report[key];if(!rows)return;
 if(!rows.length)return notice("No hay registros para exportar.",true);
 const cols=Object.keys(rows[0]),content="\\uFEFF"+[cols.map(csvCell).join(";"),...rows.map(r=>cols.map(c=>csvCell(r[c])).join(";"))].join("\\r\\n");
 const blob=new Blob([content],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="yuna-"+key+"-"+new Date().toISOString().slice(0,10)+".csv";document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
 notice("Exportación generada: "+key+".csv");
}
async function init(){
 addNav();
 try{const {data:{session}}=await db.auth.getSession();if(session){const {data:p}=await db.from("profiles").select("role").eq("id",session.user.id).maybeSingle();if(p&&["admin","staff"].includes(p.role))await refresh();}
 db.auth.onAuthStateChange(async(_,session)=>{if(session){const {data:p}=await db.from("profiles").select("role").eq("id",session.user.id).maybeSingle();if(p&&["admin","staff"].includes(p.role))refresh().catch(console.error);}});
 }catch(e){console.error("YUNA reports",e);}
 document.addEventListener("click",e=>{const b=e.target.closest("[data-view=reports]");if(b)showReports();const ex=e.target.closest("[data-export]");if(ex)exportCsv(ex.dataset.export);if(e.target.closest("#report-refresh"))refresh().then(()=>notice("Reportes actualizados.")).catch(e=>notice(e.message,true));});
}
init();
