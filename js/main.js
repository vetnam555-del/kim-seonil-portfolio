(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var staticMode = /[?&]static=1/.test(window.location.search);
  /* QA 전용: ?from=섹션id — 해당 섹션 이전을 숨겨 하단부 캡처를 가능하게 함 */
  var fromMatch = window.location.search.match(/[?&]from=([a-zA-Z-]+)/);
  if (fromMatch) {
    var main = document.getElementById("main");
    if (main) {
      var found = false;
      Array.prototype.forEach.call(main.children, function (child) {
        if (child.id === fromMatch[1]) found = true;
        if (!found) child.style.display = "none";
      });
      if (!found) {
        Array.prototype.forEach.call(main.children, function (child) {
          child.style.display = "";
        });
      }
    }
  }

  /* 지원사 맞춤 클로징: ?to=회사명 → 컨택트 문구 치환 */
  var toMatch = window.location.search.match(/[?&]to=([^&]+)/);
  if (toMatch) {
    try {
      var toName = decodeURIComponent(toMatch[1]).trim();
      var contactTo = document.getElementById("contactTo");
      if (contactTo && toName && toName.length <= 24) contactTo.textContent = toName;
    } catch (e) { /* 잘못된 인코딩은 무시 */ }
  }

  var prefersReduced = staticMode || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (staticMode) {
    var railEl = document.getElementById("rail");
    if (railEl) railEl.style.display = "none";
  }

  /* ---------- scroll progress (top bar + left rail) ---------- */
  var progressBar = document.getElementById("progressBar");
  var railPct = document.getElementById("railPct");
  var railFill = document.getElementById("railFill");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    var rounded = Math.round(pct);
    if (progressBar) progressBar.style.width = pct + "%";
    if (railFill) railFill.style.height = pct + "%";
    if (railPct) railPct.textContent = rounded + "%";
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 700);
    syncHeaderTheme();
  }

  /* ---------- header light/dark theme sync ---------- */
  var header = document.getElementById("siteHeader");
  var rail = document.getElementById("rail");
  var darkSections = Array.prototype.slice.call(document.querySelectorAll(".section--dark, .footer"));

  function syncHeaderTheme() {
    var probeY = (header ? header.offsetHeight : 64) / 2;
    var onDark = darkSections.some(function (sec) {
      var r = sec.getBoundingClientRect();
      return r.top <= probeY && r.bottom >= probeY;
    });
    if (header) header.classList.toggle("on-light", !onDark);
    if (rail) {
      var midY = window.innerHeight / 2;
      var railOnDark = darkSections.some(function (sec) {
        var r = sec.getBoundingClientRect();
        return r.top <= midY && r.bottom >= midY;
      });
      rail.classList.toggle("is-dark", railOnDark);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var navTargets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && navTargets.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var current = a.getAttribute("href") === "#" + entry.target.id;
          if (current) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navTargets.forEach(function (t) { navObserver.observe(t); });
  }

  /* ---------- reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function formatNumber(value, decimals) {
    return decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("ko-KR");
  }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(target)) return;
    if (prefersReduced) { el.textContent = formatNumber(target, decimals); return; }
    var duration = 1200;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNumber(target * eased, decimals);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    }
  }

  /* ---------- evidence lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var canDialog = lightbox && typeof lightbox.showModal === "function";
  Array.prototype.forEach.call(document.querySelectorAll("[data-lightbox]"), function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-lightbox");
      if (!canDialog) { window.open(src, "_blank", "noopener"); return; }
      var img = btn.querySelector("img");
      lightboxImg.src = src;
      lightboxImg.alt = img ? img.alt : "";
      lightbox.showModal();
    });
  });
  if (canDialog) {
    lightboxClose.addEventListener("click", function () { lightbox.close(); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", function () { lightboxImg.removeAttribute("src"); });
  }

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  var copyStatus = document.getElementById("copyStatus");
  var EMAIL = "makefair@naver.com";
  var statusTimer = null;
  function setStatus(msg) {
    if (!copyStatus) return;
    copyStatus.textContent = msg;
    if (statusTimer) window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () { copyStatus.textContent = ""; }, 2600);
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(
          function () { setStatus("복사되었습니다: " + EMAIL); },
          function () { fallbackCopy(); }
        );
      } else {
        fallbackCopy();
      }
    });
  }
  function fallbackCopy() {
    var ta = document.createElement("textarea");
    ta.value = EMAIL;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, EMAIL.length);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    setStatus(ok ? "복사되었습니다: " + EMAIL : "복사에 실패했습니다. " + EMAIL + " 주소를 직접 입력해 주세요.");
  }

  /* ---------- print: 수치 확정 + 아카이브 펼침 ---------- */
  window.addEventListener("beforeprint", function () {
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (!isNaN(target)) el.textContent = formatNumber(target, decimals);
    });
    Array.prototype.forEach.call(document.querySelectorAll("details"), function (d) {
      d.setAttribute("open", "");
    });
  });

  /* ---------- 앵커로 지목된 아코디언 사례 자동 펼침 ---------- */
  function openTargetDetails(hash) {
    if (!hash || hash.length < 2) return;
    var el = null;
    try { el = document.getElementById(hash.slice(1)); } catch (e) { return; }
    if (el && el.tagName === "DETAILS") el.setAttribute("open", "");
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#case-"]') : null;
    if (a) openTargetDetails(a.getAttribute("href"));
  });
  openTargetDetails(window.location.hash);
  window.addEventListener("hashchange", function () { openTargetDetails(window.location.hash); });

  /* ---------- year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
