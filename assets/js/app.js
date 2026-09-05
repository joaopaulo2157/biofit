(() => {
  "use strict";
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const state = { config: null };

  const sanitize = (value, max=160) => String(value || "")
    .replace(/[<>`{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

  const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

  const setMenuActive = () => {
    const current = location.pathname.split("/").pop() || "index.html";
    $$(".main-menu a").forEach(a => {
      const href = a.getAttribute("href") || "";
      const page = href.split("#")[0] || "index.html";
      a.classList.toggle("is-active", page === current);
    });
  };

  const updateScrollUI = () => {
    const y = scrollY || document.documentElement.scrollTop;
    $("#siteHeader")?.classList.toggle("is-scrolled", y > 12);
    $("#backTop")?.classList.toggle("is-visible", y > 540);
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? y / max * 100 : 0;
    const bar = $("#scrollProgress");
    if (bar) bar.style.width = `${pct}%`;
  };

  const initMenu = () => {
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
      if (e.key === "Escape") {
        document.body.classList.remove("menu-open");
        btn?.setAttribute("aria-expanded", "false");
      }
    });
  };

  const initReveal = () => {
    const items = $$(".reveal");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, {threshold: .14, rootMargin:"0px 0px -8% 0px"});
    items.forEach(i => obs.observe(i));
  };

  const loadConfig = async () => {
    try {
      const res = await fetch("assets/data/config.json", {cache:"no-store"});
      state.config = await res.json();
    } catch {
      state.config = {};
    }
    applyConfig();
    renderPlans();
  };

  const whatsappHref = (message) => {
    const phone = onlyDigits(state.config?.contacts?.whatsapp);
    if (!phone) return "";
    return `https://wa.me/55${phone.replace(/^55/,"")}?text=${encodeURIComponent(message)}`;
  };

  const applyConfig = () => {
    const cfg = state.config || {};
    const address = cfg.location?.address || "São José da Tapera - AL";
    const phone = cfg.contacts?.whatsapp || "";
    const label = phone ? phone : "A confirmar";
    $$("[data-config='address']").forEach(el => el.textContent = address);
    $$("[data-config='whatsappLabel']").forEach(el => el.textContent = label);
    const firstHour = cfg.hours?.[0]?.value || "A confirmar";
    $$("[data-config='hours']").forEach(el => el.textContent = firstHour);

    const msg = "Olá! Vim pelo site da BioFit e gostaria de agendar uma aula experimental.";
    ["#floatingWhatsApp","#heroWhatsApp","#ctaWhatsApp"].forEach(selector => {
      const el = $(selector);
      if (!el) return;
      const href = whatsappHref(msg);
      if (href) {
        el.href = href;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.classList.remove("is-disabled");
      } else {
        el.href = "contato.html#agendar";
        if (selector === "#floatingWhatsApp") el.classList.add("is-disabled");
      }
    });
  };

  const renderPlans = () => {
    const plans = state.config?.plans || [];
    const mini = $("#miniPlans");
    const grid = $("#pricingGrid");
    const template = (p, i) => `<article class="${grid ? "price-card" : ""} ${i===1 ? "featured" : ""}">
      <h3>${sanitize(p.name, 60)}</h3>
      <strong>${sanitize(p.price, 40)}</strong>
      <ul>${(p.features || []).map(f => `<li>${sanitize(f, 90)}</li>`).join("")}</ul>
      <a class="btn btn-primary" href="contato.html#agendar">Consultar plano</a>
    </article>`;
    if (mini) mini.innerHTML = plans.slice(0,3).map(template).join("");
    if (grid) grid.innerHTML = plans.map(template).join("");
  };

  const initBilling = () => {
    $$("[data-billing]").forEach(btn => btn.addEventListener("click", () => {
      $$("[data-billing]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      $$("#pricingGrid .price-card strong").forEach(strong => {
        strong.textContent = btn.dataset.billing === "anual" ? "Consultar anual" : "Consultar";
      });
    }));
  };

  const initCalc = () => {
    $("#fitnessCalc")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.currentTarget;
      const peso = Number(f.peso.value);
      const alturaCm = Number(f.altura.value);
      const idade = Number(f.idade.value);
      const result = $("#calcResult");
      if (!peso || !alturaCm || !idade) {
        result.textContent = "Preencha peso, altura e idade corretamente.";
        return;
      }
      const altura = alturaCm / 100;
      const imc = peso / (altura * altura);
      const tmb = Math.round(10*peso + 6.25*alturaCm - 5*idade + 5);
      let sugestao = "Musculação de Alta Performance";
      if (imc >= 25) sugestao = "Treino Funcional & Cardio";
      if (imc < 20) sugestao = "Musculação de Alta Performance";
      if (idade >= 45) sugestao = "Recovery & Mobilidade";
      result.innerHTML = `<strong>IMC: ${imc.toFixed(1)}</strong><br>TMB estimada: ${tmb} kcal/dia.<br>Sugestão inicial: ${sugestao}.`;
    });
  };

  const initLead = () => {
    $("#leadForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = e.currentTarget;
      const status = $("#leadStatus");
      const nome = sanitize(f.nome.value, 80);
      const email = sanitize(f.email.value, 120);
      const whats = sanitize(f.whatsapp.value, 20);
      const modalidade = sanitize(f.modalidade.value, 80);
      const mensagem = sanitize(f.mensagem.value, 300);

      if (!nome || !email.includes("@") || onlyDigits(whats).length < 10 || !modalidade) {
        status.textContent = "Confira nome, e-mail, WhatsApp e modalidade.";
        return;
      }
      if (!f.querySelector(".privacy-check input").checked) {
        status.textContent = "Aceite a Política de Privacidade para continuar.";
        return;
      }
      const msg = `Olá! Vim pelo site da BioFit.%0A%0ANome: ${nome}%0AE-mail: ${email}%0AWhatsApp: ${whats}%0AModalidade: ${modalidade}%0AObjetivo: ${mensagem || "Não informado"}`;
      const href = whatsappHref(decodeURIComponent(msg));
      if (!href) {
        status.textContent = "O WhatsApp oficial ainda não foi configurado no arquivo assets/data/config.json.";
        return;
      }
      status.textContent = "Abrindo WhatsApp com sua mensagem. Nenhum dado foi salvo neste site.";
      open(href, "_blank", "noopener,noreferrer");
      f.reset();
    });
  };

  const initCookies = () => {
    const panel = $("#cookiePanel");
    const key = "biofit_lgpd_cookie_preferences_v1";
    let saved = null;
    try { saved = localStorage.getItem(key); } catch {}
    if (!saved) setTimeout(() => panel?.classList.add("is-visible"), 600);

    const save = (analytics=false, marketing=false) => {
      try {
        localStorage.setItem(key, JSON.stringify({necessary:true, analytics, marketing, savedAt:new Date().toISOString()}));
      } catch {}
      panel?.classList.remove("is-visible");
      document.body.classList.remove("cookie-open");
    };
    $("#saveCookies")?.addEventListener("click", () => save($("#analyticsConsent")?.checked, $("#marketingConsent")?.checked));
    $("#rejectCookies")?.addEventListener("click", () => save(false, false));
    $$("[data-open-cookie-panel]").forEach(btn => btn.addEventListener("click", () => {
      panel?.classList.add("is-visible");
      document.body.classList.add("cookie-open");
    }));
  };

  const init = async () => {
    setMenuActive();
    initMenu();
    initReveal();
    initBilling();
    initCalc();
    initLead();
    initCookies();
    updateScrollUI();
    addEventListener("scroll", updateScrollUI, {passive:true});
    $("#backTop")?.addEventListener("click", () => scrollTo({top:0, behavior:"smooth"}));
    await loadConfig();
  };

  init();
})();