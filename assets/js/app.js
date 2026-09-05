/* ==========================================================
   ACADEMIA BIOFIT — SCROLL STORYTELLING + UI/UX
========================================================== */

(() => {
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const menuLinks = Array.from(document.querySelectorAll(".main-menu a"));
  const railLinks = Array.from(document.querySelectorAll(".story-rail a"));
  const progress = document.getElementById("pageProgress");
  const backToTop = document.getElementById("backToTop");

  const updateUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (scrollTop / max) * 100 : 0;

    header?.classList.toggle("is-scrolled", scrollTop > 18);
    backToTop?.classList.toggle("is-visible", scrollTop > 620);

    if (progress) progress.style.width = `${percent}%`;
  };

  updateUI();
  window.addEventListener("scroll", updateUI, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach((item) => observer.observe(item));

  const sectionMap = ["inicio", "modalidades", "ecossistema", "conceito", "agendar"];

  const setActive = (id) => {
    menuLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
    railLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.sectionLink === id);
    });
  };

  const activeObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) setActive(visible.target.id);
  }, { threshold: [0.24, 0.42, 0.62] });

  sectionMap.forEach((id) => {
    const el = document.getElementById(id);
    if (el) activeObserver.observe(el);
  });

  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".ecosystem-card"));

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      const filter = button.dataset.filter;
      cards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  const modal = document.getElementById("pillarModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalKicker = document.getElementById("modalKicker");
  const modalText = document.getElementById("modalText");

  const modalCopy = {
    strength: {
      kicker: "Heavy Strength",
      title: "Carga, foco e presença.",
      text: "Uma área pensada para transformar repetição em evolução: menos distração, mais controle e sensação de força a cada movimento."
    },
    engine: {
      kicker: "Engine & Sweat",
      title: "Movimento que liga o corpo.",
      text: "O ritmo sobe, a respiração muda e o treino vira fluxo. Aqui, energia e resistência trabalham juntas."
    },
    recovery: {
      kicker: "Reset & Heal",
      title: "Recuperar também é performar.",
      text: "Mobilidade, respiração e cuidado criam continuidade. O corpo descansa sem sair da jornada."
    },
    mind: {
      kicker: "Core & Mind",
      title: "Controle de dentro para fora.",
      text: "Postura, respiração e presença. O pilar mais silencioso da performance também sustenta os demais."
    }
  };

  const openModal = (key) => {
    const data = modalCopy[key];
    if (!modal || !data) return;

    modalKicker.textContent = data.kicker;
    modalTitle.textContent = data.title;
    modalText.textContent = data.text;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    modal.querySelector(".modal__close")?.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  };

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.openModal));
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  document.getElementById("conceptForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const feedback = document.getElementById("formFeedback");
    const name = form.nome.value.trim();
    const goal = form.objetivo.value.trim();

    if (!name || !goal) {
      feedback.textContent = "Preencha nome e objetivo para simular o agendamento conceitual.";
      return;
    }

    feedback.textContent = `Perfeito, ${name}. Seu tour conceitual para "${goal}" foi simulado com sucesso.`;
    form.reset();
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".pillar").forEach((section) => {
      const visual = section.querySelector(".pillar__visual img");
      const word = section.querySelector(".pillar__bg-word");
      const copy = section.querySelector(".pillar__copy");

      gsap.fromTo(visual,
        { y: 80, scale: .92, rotate: -3 },
        {
          y: -70,
          scale: 1.04,
          rotate: 2,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );

      gsap.fromTo(word,
        { xPercent: -54, opacity: .45 },
        {
          xPercent: -46,
          opacity: .95,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
          }
        }
      );

      gsap.fromTo(copy,
        { y: 40 },
        {
          y: -28,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "bottom 20%",
            scrub: .9
          }
        }
      );
    });

    gsap.fromTo(".ecosystem-card",
      { y: 90, opacity: .3 },
      {
        y: 0,
        opacity: 1,
        stagger: .12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".ecosystem__grid",
          start: "top 78%",
          end: "top 25%",
          scrub: 1
        }
      }
    );

    gsap.fromTo(".lifestyle-card img",
      { scale: 1.12 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".lifestyle",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );

    gsap.utils.toArray(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * .08, y: y * .16, duration: .35, ease: "power2.out" });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: .45, ease: "elastic.out(1, .45)" });
      });
    });
  }
})();
