(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const header = $("#header");
  const menuBtn = $("#menuBtn");
  const menu = $("#menu");
  const progress = $("#scrollProgress");
  const backTop = $("#backTop");
  const cookieBanner = $("#cookieBanner");
  const acceptCookies = $("#acceptCookies");
  const modal = $("#infoModal");
  const privacyModal = $("#privacyModal");

  const setHeaderState = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header?.classList.toggle("is-scrolled", y > 16);
    backTop?.classList.toggle("is-visible", y > 520);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  menuBtn?.addEventListener("click", () => {
    const opened = document.body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", String(opened));
  });

  $$(".menu a").forEach(link => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  $$(".reveal").forEach(el => revealObserver.observe(el));

  const sections = $$(".section-observe[id]");
  const menuLinks = $$(".menu a[href^='#']");
  const activeObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    menuLinks.forEach(link => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }, { threshold: [0.24, 0.45, 0.62] });

  sections.forEach(section => activeObserver.observe(section));

  const modalContent = {
    musculacao: {
      title: "Musculação de Alta Performance",
      text: "Força, controle e constância. Este pilar apresenta a sensação de uma área de treino forte, objetiva e premium, sem depender de tabela técnica de equipamentos."
    },
    funcional: {
      title: "Treino Funcional & Cardio",
      text: "Movimento, respiração e suor. Um bloco pensado para comunicar energia, ritmo e evolução física de forma visual."
    },
    recovery: {
      title: "Área Recovery & Mobilidade",
      text: "A experiência também valoriza recuperação, mobilidade e cuidado com o corpo como parte da performance."
    },
    pilates: {
      title: "Studio de Pilates/Yoga",
      text: "Controle, postura e presença. Este pilar equilibra alta performance com bem-estar e consciência corporal."
    }
  };

  const openModal = (key) => {
    const item = modalContent[key];
    if (!modal || !item) return;
    $("#modalTitle").textContent = item.title;
    $("#modalText").textContent = item.text;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    $(".modal__close", modal)?.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  $$("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.modal));
  });

  $$("[data-close-modal]").forEach(btn => btn.addEventListener("click", closeModal));

  const openPrivacy = () => {
    if (!privacyModal) return;
    privacyModal.classList.add("is-open");
    privacyModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    $(".modal__close", privacyModal)?.focus();
  };

  const closePrivacy = () => {
    if (!privacyModal) return;
    privacyModal.classList.remove("is-open");
    privacyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  $$("[data-open-privacy]").forEach(btn => btn.addEventListener("click", openPrivacy));
  $$("[data-close-privacy]").forEach(btn => btn.addEventListener("click", closePrivacy));

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closePrivacy();
    }
  });

  // LGPD: no marketing cookies; localStorage only stores consent preference for UI.
  const consentKey = "biofit_concept_lgpd_consent";
  try {
    if (localStorage.getItem(consentKey) !== "accepted") {
      setTimeout(() => cookieBanner?.classList.add("is-visible"), 800);
    }
  } catch {
    cookieBanner?.classList.add("is-visible");
  }

  acceptCookies?.addEventListener("click", () => {
    try { localStorage.setItem(consentKey, "accepted"); } catch {}
    cookieBanner?.classList.remove("is-visible");
  });

  const cleanInput = (value, limit) => {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  };

  $("#bookingForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = $("#formStatus");
    const name = cleanInput(form.nome.value, 80);
    const email = cleanInput(form.email.value, 120);
    const message = cleanInput(form.mensagem.value, 300);

    if (!name || !email || !email.includes("@")) {
      status.textContent = "Informe nome e e-mail válido para simular o agendamento.";
      return;
    }

    if (!form.querySelector(".privacy-check input").checked) {
      status.textContent = "É necessário aceitar a política conceitual de privacidade.";
      return;
    }

    status.textContent = `Agendamento conceitual simulado para ${name}. Nenhum dado foi enviado para servidor.`;
    form.reset();
  });
})();