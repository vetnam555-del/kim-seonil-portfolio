/* =========================================================
   김선일 Portfolio — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
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
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    $$(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
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

  if (sections.length && "IntersectionObserver" in window) {
    const map = new Map();
    const secObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => map.set(e.target, e.intersectionRatio));
        let best = null, bestRatio = 0;
        map.forEach((ratio, sec) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = sec; }
        });
        if (best) {
          const id = "#" + best.id;
          navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
        }
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: "-30% 0px -45% 0px" }
    );
    sections.forEach((s) => secObserver.observe(s));
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
  if (prefersReduced || !("IntersectionObserver" in window)) {
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

  /* ---------- copy email ---------- */
  const EMAIL = "vetnam@nate.com";
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
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });
})();
