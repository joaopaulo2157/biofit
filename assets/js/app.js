(() => {
  "use strict";
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  let config = {};

  const sanitize = (v, max=180) => String(v || "").replace(/[<>`{}]/g,"").replace(/\s+/g," ").trim().slice(0,max);
  const digits = (v) => String(v || "").replace(/\D/g,"");

  function scrollUI(){
    const y = scrollY || document.documentElement.scrollTop;
    $("#siteHeader")?.classList.toggle("is-scrolled", y > 10);
    $("#backTop")?.classList.toggle("is-visible", y > 520);
    const max = document.documentElement.scrollHeight - innerHeight;
    const bar = $("#scrollProgress");
    if(bar) bar.style.width = `${max > 0 ? y / max * 100 : 0}%`;
  }

  function menu(){
    const btn = $("#menuToggle");
    btn?.addEventListener("click", () => {
      const opened = document.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(opened));
    });
    $$(".main-menu a").forEach(a => a.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      btn?.setAttribute("aria-expanded", "false");
    }));
    addEventListener("keydown", e => {
      if(e.key === "Escape"){
        document.body.classList.remove("menu-open");
        btn?.setAttribute("aria-expanded","false");
        $("#cookieBanner")?.classList.remove("is-visible");
      }
    });
    const current = location.pathname.split("/").pop() || "index.html";
    $$(".main-menu a").forEach(a => {
      const page = (a.getAttribute("href") || "").split("#")[0] || "index.html";
      a.classList.toggle("is-active", page === current);
    });
  }

  function reveal(){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:.14, rootMargin:"0px 0px -8% 0px"});
    $$(".reveal").forEach(el => obs.observe(el));
  }

  async function loadConfig(){
    try{
      const res = await fetch("assets/data/config.json", {cache:"no-store"});
      config = await res.json();
    }catch{ config = {}; }
    applyConfig();
    renderPlans();
  }

  function waHref(message){
    const phone = digits(config?.contact?.whatsapp);
    if(!phone) return "";
    const number = phone.startsWith("55") ? phone : `55${phone}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function applyConfig(){
    const address = config?.location?.address || "São José da Tapera - AL";
    const whatsapp = config?.contact?.whatsapp || "";
    const label = whatsapp || "A confirmar";
    const hour = config?.hours?.[0]?.time || "A confirmar";
    $$("[data-config='address']").forEach(el => el.textContent = address);
    $$("[data-config='whatsappLabel']").forEach(el => el.textContent = label);
    $$("[data-config='hours']").forEach(el => el.textContent = hour);

    const msg = "Olá! Vim pelo site da BioFit e gostaria de agendar uma aula experimental.";
    ["#floatingWhatsApp","#heroWhatsApp","#ctaWhatsApp","#plansWhatsApp"].forEach(sel => {
      const el = $(sel);
      if(!el) return;
      const href = waHref(msg);
      if(href){
        el.href = href;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.classList.remove("is-disabled");
      }else{
        el.href = "contato.html#agendar";
        if(sel === "#floatingWhatsApp") el.classList.add("is-disabled");
      }
    });

    const mapUrl = config?.location?.mapUrl || "";
    const mapLink = $("#mapLink");
    if(mapLink && mapUrl){
      mapLink.href = mapUrl;
      $("#mapText").textContent = "Abrir localização da BioFit no mapa.";
    }
  }

  function renderPlans(){
    const plans = config?.plans || [];
    const html = plans.map((p, i) => `<article class="price-card ${p.highlight || i===1 ? "featured" : ""}">
      <h3>${sanitize(p.name, 70)}</h3>
      <strong>${sanitize(p.price, 40)}</strong>
      <ul>${(p.features || []).map(f => `<li>${sanitize(f, 90)}</li>`).join("")}</ul>
      <a class="btn btn-primary" href="contato.html#agendar">Consultar plano</a>
    </article>`).join("");
    const mini = $("#miniPlans");
    const grid = $("#pricingGrid");
    if(mini) mini.innerHTML = html;
    if(grid) grid.innerHTML = html;
  }

  function calculator(){
    $("#fitnessCalc")?.addEventListener("submit", e => {
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
      const altura = alturaCm/100;
      const imc = peso/(altura*altura);
      const tmb = Math.round(10*peso + 6.25*alturaCm - 5*idade + 5);
      let sug = "Musculação de Alta Performance";
      if(imc >= 25) sug = "Treino Funcional & Cardio";
      if(idade >= 45) sug = "Recovery & Mobilidade";
      result.innerHTML = `<strong>IMC: ${imc.toFixed(1)}</strong><br>TMB estimada: ${tmb} kcal/dia.<br>Modalidade sugerida: ${sug}.`;
    });
  }

  function leadForm(){
    $("#leadForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.currentTarget;
      const status = $("#leadStatus");
      const nome = sanitize(f.nome.value, 80);
      const email = sanitize(f.email.value, 120);
      const whatsapp = sanitize(f.whatsapp.value, 20);
      const modalidade = sanitize(f.modalidade.value, 90);
      const mensagem = sanitize(f.mensagem.value, 300);
      if(!nome || !email.includes("@") || digits(whatsapp).length < 10 || !modalidade){
        status.textContent = "Confira nome, e-mail, WhatsApp e modalidade.";
        return;
      }
      if(!f.querySelector(".privacy-check input").checked){
        status.textContent = "Aceite a Política de Privacidade para continuar.";
        return;
      }
      const text = `Olá! Vim pelo site da BioFit.\n\nNome: ${nome}\nE-mail: ${email}\nWhatsApp: ${whatsapp}\nModalidade: ${modalidade}\nObjetivo: ${mensagem || "Não informado"}`;
      const href = waHref(text);
      if(!href){
        status.textContent = "WhatsApp oficial ainda não configurado em assets/data/config.json.";
        return;
      }
      status.textContent = "Abrindo WhatsApp. Nenhum dado foi salvo no site.";
      open(href, "_blank", "noopener,noreferrer");
      f.reset();
    });
  }

  function billing(){
    $$("[data-billing]").forEach(btn => btn.addEventListener("click", () => {
      $$("[data-billing]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      $$("#pricingGrid .price-card strong").forEach(el => {
        el.textContent = btn.dataset.billing === "anual" ? "Consultar anual" : "Consultar";
      });
    }));
  }

  function cookies(){
    const key = "biofit_cookie_preferences_v2";
    const panel = $("#cookieBanner");
    let saved = "";
    try{ saved = localStorage.getItem(key) || ""; }catch{}
    if(!saved) setTimeout(() => panel?.classList.add("is-visible"), 700);
    const save = (analytics=false, marketing=false) => {
      try{ localStorage.setItem(key, JSON.stringify({necessary:true, analytics, marketing, date:new Date().toISOString()})); }catch{}
      panel?.classList.remove("is-visible");
    };
    $("#saveCookies")?.addEventListener("click", () => save($("#analyticsConsent")?.checked, $("#marketingConsent")?.checked));
    $("#rejectCookies")?.addEventListener("click", () => save(false,false));
    $$("[data-cookie-open]").forEach(btn => btn.addEventListener("click", () => panel?.classList.add("is-visible")));
  }

  function init(){
    menu(); reveal(); calculator(); leadForm(); billing(); cookies(); scrollUI();
    addEventListener("scroll", scrollUI, {passive:true});
    $("#backTop")?.addEventListener("click", () => scrollTo({top:0, behavior:"smooth"}));
    loadConfig();
  }

  init();
})();