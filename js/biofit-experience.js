(() => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const loader = $("#loader");
  window.addEventListener("load", () => {
    setTimeout(() => loader?.classList.add("hide"), 450);
  });

  const header = $("#header");
  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuButton = $("#menuButton");
  const nav = $("#nav");
  menuButton?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  const cursorLight = $("#cursorLight");
  window.addEventListener("pointermove", (event) => {
    if (!cursorLight || window.matchMedia("(max-width: 980px)").matches) return;
    cursorLight.style.left = `${event.clientX}px`;
    cursorLight.style.top = `${event.clientY}px`;
  }, { passive: true });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.16 });
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.counter || "0");
      const decimals = String(el.dataset.counter || "").includes(".") ? 2 : 0;
      const duration = 1150;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toString();
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: .55 });
  $$("[data-counter]").forEach((el) => counterObserver.observe(el));

  const modeCards = $$(".mode-card");
  const modeTitle = $("#modeTitle");
  const modeSubtitle = $("#modeSubtitle");
  const modeCopy = $("#modeCopy");

  modeCards.forEach((card) => {
    card.addEventListener("click", () => {
      modeCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      if (modeTitle) modeTitle.textContent = card.dataset.title || "";
      if (modeSubtitle) modeSubtitle.textContent = card.dataset.subtitle || "";
      if (modeCopy) modeCopy.textContent = card.dataset.copy || "";
    });
  });

  const planButtons = $$(".plan-buttons button");
  const planLabel = $("#planLabel");
  const planTitle = $("#planTitle");
  const planText = $("#planText");
  const planPrice = $("#planPrice");

  planButtons.forEach((button) => {
    button.addEventListener("click", () => {
      planButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const plan = button.dataset.plan || "Start";
      if (planLabel) planLabel.textContent = plan.toUpperCase();
      if (planTitle) planTitle.textContent = `Plano ${plan}`;
      if (planText) planText.textContent = button.dataset.copy || "";
      if (planPrice) planPrice.textContent = button.dataset.price || "Consultar";
    });
  });

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const canvas = $("#energyCanvas");
  const ctx = canvas?.getContext("2d", { alpha: true });
  if (!canvas || !ctx) return;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.innerWidth < 760;

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const amount = reduceMotion ? 0 : (isMobile() ? 38 : 82);
    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .38,
      vy: (Math.random() - .5) * .38,
      r: Math.random() * 2.2 + .6,
      a: Math.random() * .45 + .14
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const scrollBoost = Math.min(1, window.scrollY / 900);
    particles.forEach((p, index) => {
      p.x += p.vx * (1 + scrollBoost);
      p.y += p.vy * (1 + scrollBoost);

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,27,27,${p.a})`;
      ctx.fill();

      for (let j = index + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 118) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - distance / 118) * .055})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resizeCanvas();
  draw();
  window.addEventListener("resize", resizeCanvas, { passive: true });
})();
