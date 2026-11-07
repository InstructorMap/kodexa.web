// app.js — KODEXA · Estado local compartido (Fase 1, sin Supabase)
(function () {
  'use strict';

  const STORAGE_KEY = 'kodexa_quote_draft_v1';

  const CATALOG = {
    bases: {
      ecommerce: { id: 'ecommerce', label: 'Tienda Digital E-commerce', price: 220000 },
      gestion:   { id: 'gestion',   label: 'Sistema de Gestión Web',  price: 380000 },
      landing:   { id: 'landing',   label: 'Landing Page Pro',        price: 140000 }
    },
    addons: {
      mercadopago: { id: 'mercadopago', label: 'Mercado Pago Pro Checkout',           price: 35000 },
      afip:        { id: 'afip',        label: 'WebServices Facturación ARCA/AFIP',    price: 42000 },
      whatsapp:    { id: 'whatsapp',    label: 'Alertas WhatsApp & Carga Excel',      price: 33000 }
    }
  };

  function newRef() {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `KDX-${stamp}-${rand}`;
  }

  function defaultState() {
    return {
      ref: newRef(),
      base: 'ecommerce',
      addons: [],
      client: { name: '', cuit: '' },
      createdAt: new Date().toISOString()
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // sanity: si falta ref, regenerar
      if (!parsed.ref) parsed.ref = newRef();
      if (!parsed.client) parsed.client = { name: '', cuit: '' };
      if (!Array.isArray(parsed.addons)) parsed.addons = [];
      return parsed;
    } catch { return defaultState(); }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.dispatchEvent(new CustomEvent('kodexa:state', { detail: state }));
  }

  function total(state) {
    const basePrice = CATALOG.bases[state.base]?.price || 0;
    const addonsPrice = state.addons.reduce((s, id) => s + (CATALOG.addons[id]?.price || 0), 0);
    return basePrice + addonsPrice;
  }

  // Validación CUIT (módulo 11)
  function isValidCuit(raw) {
    if (!raw) return false;
    const cuit = raw.replace(/[^\d]/g, '');
    if (cuit.length !== 11) return false;
    const mult = [5,4,3,2,7,6,5,4,3,2];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cuit[i], 10) * mult[i];
    const mod = 11 - (sum % 11);
    const check = mod === 11 ? 0 : mod === 10 ? 9 : mod;
    return check === parseInt(cuit[10], 10);
  }

  function formatARS(n) {
    return '$' + n.toLocaleString('es-AR');
  }

  // API pública
  window.KODEXA = {
    CATALOG,
    getState: load,
    setState: (patch) => {
      const s = { ...load(), ...patch };
      save(s);
      return s;
    },
    setBase: (baseId) => {
      const s = load(); s.base = baseId; save(s); return s;
    },
    toggleAddon: (addonId) => {
      const s = load();
      s.addons = s.addons.includes(addonId)
        ? s.addons.filter(x => x !== addonId)
        : [...s.addons, addonId];
      save(s); return s;
    },
    setClientField: (field, value) => {
      const s = load(); s.client = { ...s.client, [field]: value }; save(s); return s;
    },
    total,
    isValidCuit,
    formatARS,
    reset: () => { save(defaultState()); }
  };
})();
