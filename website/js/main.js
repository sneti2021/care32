/* Care32 — interaction layer */
(function () {
  "use strict";

  /* ---- Nav: scrolled state + menu morph + scroll progress ---- */
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav-burger");
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle("scrolled", window.scrollY > 24);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll(".menu-overlay a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        document.documentElement.style.overflow = "";
      })
    );
  }

  /* ---- Scroll reveals ---- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el, i) => {
      const stagger = el.closest("[data-reveal-group]");
      if (stagger) {
        const siblings = Array.from(stagger.querySelectorAll("[data-reveal]"));
        el.style.setProperty("--reveal-delay", `${(siblings.indexOf(el) % 6) * 0.08}s`);
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const dur = 1600;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            el.textContent = (target % 1 ? (target * eased).toFixed(1) : Math.round(target * eased)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.closest(".faq-list").querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = "0px";
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Before/After slider ---- */
  document.querySelectorAll(".ba-slider").forEach((slider) => {
    const after = slider.querySelector(".ba-after");
    const handle = slider.querySelector(".ba-handle");
    const setPos = (clientX) => {
      const r = slider.getBoundingClientRect();
      const pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + "%";
    };
    const move = (e) => setPos(e.touches ? e.touches[0].clientX : e.clientX);
    const start = (e) => {
      move(e);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop, { once: true });
    };
    const stop = () => window.removeEventListener("pointermove", move);
    slider.addEventListener("pointerdown", start);
  });

  /* ---- Smile explorer ---- */
  const smile = document.querySelector("[data-smile]");
  if (smile) {
    const panelTitle = document.querySelector("[data-smile-title]");
    const panelText = document.querySelector("[data-smile-text]");
    const panelLink = document.querySelector("[data-smile-link]");
    smile.querySelectorAll(".tooth").forEach((tooth) => {
      const show = () => {
        smile.querySelectorAll(".tooth.active").forEach((t) => t.classList.remove("active"));
        tooth.classList.add("active");
        panelTitle.textContent = tooth.dataset.title;
        panelText.textContent = tooth.dataset.text;
        panelLink.href = tooth.dataset.href;
        panelLink.querySelector("span").textContent = "Explore " + tooth.dataset.title.toLowerCase();
      };
      tooth.addEventListener("mouseenter", show);
      tooth.addEventListener("click", show);
      tooth.addEventListener("focus", show);
    });
  }

  /* ---- Magnetic buttons (desktop, fine pointers only) ---- */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn-primary, .btn-light").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.12;
        const y = (e.clientY - r.top - r.height / 2) * 0.22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });

    /* ---- Spotlight glow tracks cursor on cards ---- */
    document.querySelectorAll("[data-spot]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });

    /* ---- Hero card 3D tilt ---- */
    const tiltCard = document.querySelector(".hero-card");
    if (tiltCard) {
      const wrap = tiltCard.closest(".hero-visual") || tiltCard;
      wrap.addEventListener("mousemove", (e) => {
        const r = tiltCard.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
        tiltCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      wrap.addEventListener("mouseleave", () => (tiltCard.style.transform = ""));
    }
  }

  /* ---- Nav dropdown (Treatments) ---- */
  document.querySelectorAll(".nav-dd").forEach((dd) => {
    const trigger = dd.querySelector(".nav-dd-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle("open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dd.open").forEach((dd) => {
      dd.classList.remove("open");
      dd.querySelector(".nav-dd-trigger")?.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav-dd.open").forEach((dd) => {
        dd.classList.remove("open");
        dd.querySelector(".nav-dd-trigger")?.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* ---- Contact form -> WhatsApp ---- */
  const cform = document.getElementById("contactForm");
  if (cform) {
    const successEl = document.getElementById("formSuccess");
    const fieldOf = (id) => document.getElementById(id).closest(".field");
    cform.querySelectorAll("input, select, textarea").forEach((el) =>
      el.addEventListener("input", () => el.closest(".field")?.classList.remove("invalid"))
    );
    cform.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("cf-name");
      const phoneEl = document.getElementById("cf-phone");
      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();
      const phoneOk = phone.replace(/\D/g, "").length >= 10;
      fieldOf("cf-name").classList.toggle("invalid", !name);
      fieldOf("cf-phone").classList.toggle("invalid", !phoneOk);
      if (!name || !phoneOk) {
        (!name ? nameEl : phoneEl).focus();
        return;
      }
      const treatment = document.getElementById("cf-treatment").value;
      const message = document.getElementById("cf-msg").value.trim();
      // 1) Record the enquiry in Netlify Forms (emails support@care32.co.in). No-op locally.
      try {
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(cform)).toString(),
        }).catch(() => {});
      } catch (_) {}
      // 2) Also open WhatsApp with the same details for an instant reply.
      const lines = ["Hello Care32, I'd like to book an appointment.", "Name: " + name, "Phone: " + phone];
      if (treatment) lines.push("Treatment: " + treatment);
      if (message) lines.push("Message: " + message);
      window.open("https://wa.me/918282821409?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      cform.reset();
      if (successEl) { successEl.classList.add("show"); successEl.scrollIntoView({ block: "center", behavior: "smooth" }); }
    });
  }

  /* ---- Cookie consent + GA4 (consent-gated, free, no third-party library) ---- */
  const GA_ID = "G-XXXXXXXXXX"; // TODO: replace with Care32's real GA4 Measurement ID
  const loadGA = () => {
    if (!GA_ID || GA_ID.indexOf("XXXX") !== -1 || window.__gaLoaded) return;
    window.__gaLoaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  };
  const CONSENT_KEY = "care32-consent";
  let consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) {}
  if (consent === "granted") {
    loadGA();
  } else if (consent !== "denied") {
    const prefix = location.pathname.indexOf("/treatments/") !== -1 ? "../" : "";
    const bar = document.createElement("div");
    bar.className = "cookie-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      '<p>We use cookies to measure site traffic and improve your experience. Read our <a href="' +
      prefix + 'privacy-policy.html">Privacy Policy</a>.</p>' +
      '<div class="cc-actions"><button type="button" class="cc-decline">Decline</button>' +
      '<button type="button" class="cc-accept">Accept</button></div>';
    const finish = (value) => {
      try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
      document.body.classList.remove("consent-pending");
      bar.classList.remove("show");
      setTimeout(() => bar.remove(), 450);
    };
    document.body.appendChild(bar);
    document.body.classList.add("consent-pending");
    requestAnimationFrame(() => bar.classList.add("show"));
    bar.querySelector(".cc-accept").addEventListener("click", () => { finish("granted"); loadGA(); });
    bar.querySelector(".cc-decline").addEventListener("click", () => finish("denied"));
  }
})();
