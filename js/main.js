/* =========================================================
   김선일 Portfolio — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const isStatic = document.documentElement.classList.contains("static");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state + scroll progress + to-top ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav toggle ---------- */
  const navToggle = $("#navToggle");
  if (navToggle && nav) {
    function setNavOpen(open) {
      nav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    }
    navToggle.addEventListener("click", () => {
      setNavOpen(!nav.classList.contains("open"));
    });
    $$(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => {
        setNavOpen(false);
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const revObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // small stagger for siblings
            const el = entry.target;
            const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal")) : [el];
            const idx = Math.max(0, sibs.indexOf(el));
            el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
            el.classList.add("in");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revObserver.observe(el));
  }

  /* ---------- active section highlight ---------- */
  const navLinks = $$(".nav__links a[data-nav]");
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length) {
    function setActiveSection() {
      const marker = Math.min(window.innerHeight * 0.35, 320);
      let current = sections[0];
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= marker) current = sec;
      });
      const id = "#" + current.id;
      navLinks.forEach((a) => {
        const active = a.getAttribute("href") === id;
        a.classList.toggle("active", active);
        if (active) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }
    window.addEventListener("scroll", setActiveSection, { passive: true });
    window.addEventListener("resize", setActiveSection);
    setActiveSection();
  }

  /* ---------- animated counters (decimal-aware) ---------- */
  function decimalsOf(raw) {
    const dot = String(raw).split(".")[1];
    return dot ? dot.length : 0;
  }
  function formatNum(n, dec) {
    return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function animateCount(el) {
    const raw = el.dataset.count || "0";
    const dec = decimalsOf(raw);
    const target = parseFloat(raw);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const dur = 1700;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = prefix + formatNum(target * eased, dec) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + formatNum(target, dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  const counters = $$("[data-count]");
  if (isStatic || prefersReduced || !("IntersectionObserver" in window)) {
    counters.forEach((el) => {
      el.textContent = (el.dataset.prefix || "") + formatNum(parseFloat(el.dataset.count || "0")) + (el.dataset.suffix || "");
    });
  } else {
    const cObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cObserver.observe(el));
  }

  /* ---------- project card pointer glow ---------- */
  if (!prefersReduced && window.matchMedia("(hover: hover)").matches) {
    $$(".proj").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ---------- project filter ---------- */
  const filterBtns = $$(".filter-btn");
  const projectCards = $$(".work .proj");
  const projectMoreBtn = $("#projectMoreBtn");
  if (filterBtns.length && projectCards.length) {
    let activeProjectFilter = "all";
    let showAllProjects = false;

    function updateProjectVisibility() {
      let hiddenSecondary = 0;
      projectCards.forEach((card) => {
        const tags = (card.dataset.filter || "").split(/\s+/);
        const matchesFilter = activeProjectFilter === "all" || tags.includes(activeProjectFilter);
        const hideSecondary = activeProjectFilter === "all" && !showAllProjects && card.dataset.priority === "secondary";
        const visible = matchesFilter && !hideSecondary;
        card.hidden = !visible;
        if (hideSecondary) hiddenSecondary += 1;
      });

      if (projectMoreBtn) {
        const showControl = activeProjectFilter === "all";
        projectMoreBtn.parentElement.hidden = !showControl;
        projectMoreBtn.setAttribute("aria-expanded", String(showAllProjects));
        projectMoreBtn.textContent = showAllProjects ? "대표 프로젝트만 보기" : "프로젝트 " + hiddenSecondary + "개 더 보기";
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeProjectFilter = btn.dataset.filter || "all";
        filterBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        updateProjectVisibility();
      });
    });

    if (projectMoreBtn) {
      projectMoreBtn.addEventListener("click", () => {
        showAllProjects = !showAllProjects;
        updateProjectVisibility();
      });
    }

    updateProjectVisibility();
  }

  /* ---------- copy email ---------- */
  const EMAIL = "makefair@naver.com";
  const copyBtn = $("#copyBtn");
  function flash(btn, text, cls) {
    const orig = btn.textContent;
    btn.textContent = text;
    btn.classList.add(cls);
    setTimeout(() => { btn.textContent = orig; btn.classList.remove(cls); }, 1600);
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        flash(copyBtn, "복사 완료 ✓", "copied");
      } catch (err) {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = EMAIL; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); flash(copyBtn, "복사 완료 ✓", "copied"); }
        catch (_) { flash(copyBtn, EMAIL, "copied"); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- smooth anchor offset for fixed nav ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (a.classList.contains("skip-link")) target.focus({ preventScroll: true });
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  function alignInitialHash() {
    const id = window.location.hash;
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "auto" });
    onScroll();
  }
  window.addEventListener("load", () => setTimeout(alignInitialHash, 0));
  setTimeout(alignInitialHash, 0);
  setTimeout(alignInitialHash, 350);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignInitialHash).catch(() => {});
  }
})();
