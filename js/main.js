/* =========================================================
   김선일 Portfolio — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const isStatic = document.documentElement.classList.contains("static");
  const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let prefersReduced = reducedMq.matches;

  /* ---------- year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll-driven UI: progress bar, nav state, active section
     Single rAF-throttled handler; all layout reads happen before writes. */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  const navLinks = $$(".nav__links a[data-nav]");
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function handleScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    let currentId = "";
    if (sections.length) {
      const marker = Math.min(window.innerHeight * 0.35, 320);
      let current = null;
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= marker) current = sec;
      });
      if (current) currentId = "#" + current.id;
    }
    if (progress) progress.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (nav) nav.classList.toggle("scrolled", y > 30);
    if (toTop) toTop.classList.toggle("show", y > 600);
    navLinks.forEach((a) => {
      const active = a.getAttribute("href") === currentId;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  let scrollTicking = false;
  function requestScrollUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      handleScroll();
      scrollTicking = false;
    });
  }
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  handleScroll();

  /* ---------- mobile nav toggle ---------- */
  const navToggle = $("#navToggle");
  function setNavOpen(open) {
    if (!nav) return;
    nav.classList.toggle("open", open);
    document.body.classList.toggle("nav-locked", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    }
  }
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      setNavOpen(!nav.classList.contains("open"));
    });
    $$(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => {
        setNavOpen(false);
      })
    );
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target)) setNavOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  function settle(el) {
    el.style.transitionDelay = "";
    el.classList.add("settled");
  }
  function revealAll() {
    revealEls.forEach((el) => {
      el.classList.add("in");
      settle(el);
    });
  }
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealAll();
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
            // release the entrance transition afterwards so component hover styles apply
            el.addEventListener("transitionend", () => settle(el), { once: true });
            setTimeout(() => settle(el), 1400);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revObserver.observe(el));
  }
  if (typeof reducedMq.addEventListener === "function") {
    reducedMq.addEventListener("change", (e) => {
      prefersReduced = e.matches;
      if (e.matches) revealAll();
    });
  }

  /* ---------- animated counters (decimal-aware) ----------
     Markup ships with the final values (correct for SEO, screen readers and
     no-JS); JS only rewinds to 0 and counts up when the tile scrolls in. */
  function decimalsOf(raw) {
    const dot = String(raw).split(".")[1];
    return dot ? dot.length : 0;
  }
  function formatNum(n, dec) {
    return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function finalizeCount(el) {
    const raw = el.dataset.count || "0";
    el.textContent = (el.dataset.prefix || "") + formatNum(parseFloat(raw), decimalsOf(raw)) + (el.dataset.suffix || "");
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
    counters.forEach(finalizeCount);
  } else {
    const cObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.15 }
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
  const projectStatus = $("#projectStatus");
  if (filterBtns.length && projectCards.length) {
    let activeProjectFilter = "all";
    let showAllProjects = false;

    function updateProjectVisibility() {
      let hiddenSecondary = 0;
      let visibleCount = 0;
      projectCards.forEach((card) => {
        const tags = (card.dataset.filter || "").split(/\s+/);
        const matchesFilter = activeProjectFilter === "all" || tags.includes(activeProjectFilter);
        const hideSecondary = activeProjectFilter === "all" && !showAllProjects && card.dataset.priority === "secondary";
        const visible = matchesFilter && !hideSecondary;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
        if (hideSecondary) hiddenSecondary += 1;
      });

      if (projectMoreBtn) {
        const showControl = activeProjectFilter === "all";
        projectMoreBtn.parentElement.hidden = !showControl;
        projectMoreBtn.setAttribute("aria-expanded", String(showAllProjects));
        projectMoreBtn.textContent = showAllProjects ? "대표 프로젝트만 보기" : "프로젝트 " + hiddenSecondary + "개 더 보기";
      }
      if (projectStatus) {
        projectStatus.textContent = "프로젝트 " + visibleCount + "개 표시 중" + (hiddenSecondary > 0 ? " · 보조 프로젝트 " + hiddenSecondary + "개 접힘" : "");
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
  const copyStatus = $("#copyStatus");
  function announceCopy(msg) {
    if (!copyStatus) return;
    copyStatus.textContent = msg;
    setTimeout(() => { copyStatus.textContent = ""; }, 2400);
  }
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
        announceCopy("이메일 주소가 복사되었습니다.");
      } catch (err) {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = EMAIL; document.body.appendChild(ta); ta.select();
        try {
          document.execCommand("copy");
          flash(copyBtn, "복사 완료 ✓", "copied");
          announceCopy("이메일 주소가 복사되었습니다.");
        }
        catch (_) { flash(copyBtn, EMAIL, "copied"); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- anchor navigation ----------
     Scrolling is delegated to the browser (scroll-behavior + scroll-margin-top
     keep the fixed-nav offset in one place); JS only moves keyboard focus so
     the next Tab lands inside the target section. */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", () => {
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* re-align a hash landing once, after load (late layout shifts) */
  function alignInitialHash() {
    const id = window.location.hash;
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "auto", block: "start" });
    handleScroll();
  }
  if (window.location.hash) {
    window.addEventListener("load", () => setTimeout(alignInitialHash, 60));
  }

  /* ---------- marquee: pause while offscreen ---------- */
  const marquee = $(".marquee");
  const marqueeTrack = $(".marquee__track");
  if (marquee && marqueeTrack && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        marqueeTrack.style.animationPlayState = e.isIntersecting ? "" : "paused";
      });
    }).observe(marquee);
  }

  /* ---------- print: make every section visible before printing ---------- */
  window.addEventListener("beforeprint", () => {
    revealAll();
    counters.forEach(finalizeCount);
  });
})();
