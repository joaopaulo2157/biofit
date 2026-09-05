(() => {
  "use strict";
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  let config = {};

  const clean = (v, max=180) => String(v || "").replace(/[<>`{}]/g,"").replace(/\s+/g," ").trim().slice(0,max);
  const digits = (v) => String(v || "").replace(/\D/g,"");

  async function loadConfig(){
    try{
      const res = await fetch("assets/data/config.json", {cache:"no-store"});
      config = await res.json();
    }catch{ config = {}; }
    applyConfig();
  }

  function whatsappLink(message){
    const phone = digits(config.whatsapp || "");
    if(!phone) return "";
    const number = phone.startsWith("55") ? phone : `55${phone}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function applyConfig(){
    $$("[data-address]").forEach(el => el.textContent = config.address || "São José da Tapera - AL");
    $$("[data-hours]").forEach(el => el.textContent = config.hours || "Horários a confirmar");
    $$("[data-whatsapp]").forEach(el => el.textContent = config.whatsapp || "Configurar número");

    const defaultMsg = "Olá! Vim pelo site da BioFit e gostaria de agendar uma aula experimental.";
    ["#heroWhatsApp","#ctaWhatsApp","#floatWhatsApp"].forEach(sel => {
      const el = $(sel);
      if(!el) return;
      const href = whatsappLink(defaultMsg);
      if(href){
        el.href = href;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.classList.remove("disabled");
      }else{
        el.href = "#agendar";
        if(sel === "#floatWhatsApp") el.classList.add("disabled");
      }
    });

    const map = $("#mapLink");
    if(map && config.mapUrl) map.href = config.mapUrl;
  }

  function scrollUI(){
    const y = scrollY || document.documentElement.scrollTop;
    $("#header")?.classList.toggle("scrolled", y > 12);
    $("#backTop")?.classList.toggle("visible", y > 520);
    const max = document.documentElement.scrollHeight - innerHeight;
    const bar = $("#progressBar");
    if(bar) bar.style.width = `${max > 0 ? y / max * 100 : 0}%`;
  }

  function menu(){
    const btn = $("#menuToggle");
    btn?.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    $$("#nav a").forEach(a => a.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      btn?.setAttribute("aria-expanded","false");
    }));
    addEventListener("keydown", e => {
      if(e.key === "Escape"){
        document.body.classList.remove("menu-open");
        btn?.setAttribute("aria-expanded","false");
        $("#cookieBanner")?.classList.remove("visible");
      }
    });

    const sections = $$(".section-watch[id], main[id]");
    const links = $$("#nav a[href^='#']");
    const obs = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible) return;
      const id = visible.target.id;
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
    }, {threshold:[.24,.45,.62]});
    sections.forEach(s => obs.observe(s));
  }

  function reveal(){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    }, {threshold:.14, rootMargin:"0px 0px -8% 0px"});
    $$(".reveal").forEach(el => obs.observe(el));
  }

  function plans(){
    $$("[data-billing]").forEach(btn => btn.addEventListener("click", () => {
      $$("[data-billing]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$("#priceCards strong").forEach(s => s.textContent = btn.dataset.billing === "anual" ? "Consultar anual" : "Consultar");
    }));
  }

  function calculator(){
    $("#calcForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.currentTarget;
      const peso = Number(f.peso.value);
      const alturaCm = Number(f.altura.value);
      const idade = Number(f.idade.value);
      const result = $("#calcResult");
      if(!peso || !alturaCm || !idade){
        result.textContent = "Preencha peso, altura e idade corretamente.";
        return;
      }
      const altura = alturaCm / 100;
      const imc = peso / (altura * altura);
      const tmb = Math.round(10 * peso + 6.25 * alturaCm - 5 * idade + 5);
      let sugestao = "Musculação de Alta Performance";
      if(imc >= 25) sugestao = "Treino Funcional & Cardio";
      if(idade >= 45) sugestao = "Recovery & Mobilidade";
      result.innerHTML = `<strong>IMC: ${imc.toFixed(1)}</strong><br>TMB estimada: ${tmb} kcal/dia.<br>Sugestão inicial: ${sugestao}.`;
    });
  }

  function lead(){
    $("#leadForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.currentTarget;
      const status = $("#formStatus");
      const nome = clean(f.nome.value,80);
      const email = clean(f.email.value,120);
      const whats = clean(f.whatsapp.value,20);
      const objetivo = clean(f.objetivo.value,80);
      if(!nome || !email.includes("@") || digits(whats).length < 10 || !objetivo){
        status.textContent = "Confira nome, e-mail, WhatsApp e objetivo.";
        return;
      }
      if(!f.querySelector(".privacy input").checked){
        status.textContent = "Aceite a Política de Privacidade para continuar.";
        return;
      }
      const msg = `Olá! Vim pelo site da BioFit.\n\nNome: ${nome}\nE-mail: ${email}\nWhatsApp: ${whats}\nObjetivo: ${objetivo}`;
      const href = whatsappLink(msg);
      if(!href){
        status.textContent = "WhatsApp oficial ainda não configurado em assets/data/config.json.";
        return;
      }
      status.textContent = "Abrindo WhatsApp. Nenhum dado foi salvo no site.";
      open(href, "_blank", "noopener,noreferrer");
      f.reset();
    });
  }

  function cookies(){
    const key = "biofit_onepage_lgpd_v3";
    const panel = $("#cookieBanner");
    let saved = "";
    try{ saved = localStorage.getItem(key) || ""; }catch{}
    if(!saved) setTimeout(() => panel?.classList.add("visible"), 700);
    const save = (analytics=false, marketing=false) => {
      try{ localStorage.setItem(key, JSON.stringify({necessary:true,analytics,marketing,date:new Date().toISOString()})); }catch{}
      panel?.classList.remove("visible");
    };
    $("#saveCookies")?.addEventListener("click", () => save($("#analyticsConsent")?.checked, $("#marketingConsent")?.checked));
    $("#rejectCookies")?.addEventListener("click", () => save(false,false));
    $$("[data-cookie-open]").forEach(btn => btn.addEventListener("click", () => panel?.classList.add("visible")));
  }

  function init(){
    menu(); reveal(); plans(); calculator(); lead(); cookies(); scrollUI(); loadConfig();
    addEventListener("scroll", scrollUI, {passive:true});
    $("#backTop")?.addEventListener("click", () => scrollTo({top:0, behavior:"smooth"}));
  }

  init();
})();