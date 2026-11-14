// 지금 홈(빌드 결과)의 글 · 링크 · 이미지 주소를 화면에서 그대로 읽어 JSON 으로 만든다 — 시안에 글을 다시 치지 않으려고.
// Usage: node extract.mjs <base url> <out.json>     (먼저 render_c.mjs … now 로 mock-now.html 을 만들어 둔다 · out 은 사이트 사본 옆의 content.json)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , baseUrl, out] = process.argv;
const browser = await chromium.launch();
const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`${baseUrl}/mock-now.html`, { waitUntil: "load" });
const data = await p.evaluate(() => {
  const T = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : "");
  const H = (el) => (el ? el.innerHTML : "");
  const A = (el) => (el ? { text: T(el).replace(/\s*[→↗↓]\s*$/, "").replace(/\s*\(새 탭\)\s*$/, "").replace(/\s*[→↗↓]\s*$/, ""), href: el.getAttribute("href"), ext: el.target === "_blank" } : null);
  const q = (s, r = document) => r.querySelector(s); const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const after = (root) => { const m = q(".count-up-measure", root); return m ? T(m) : T(root); };
  const sents = (root) => qa(".sent", root).map((s) => H(s));     // 문장 안의 줄바꿈 금지 묶음(.nw) · 붙임표를 그대로 둔다
  const hero = q("#hero");
  const d = {};
  d.header = { name: T(q(".site-header a")).replace(/, 처음으로$/, ""), nav: qa(".site-header nav[aria-label='주요 메뉴'] > a").slice(0, 6).map(A) };
  d.hero = {
    eyebrow: T(q(".folio-eyebrow", hero)).replace(T(q(".folio-eyebrow-org", hero)), "").trim(), org: T(q(".folio-eyebrow-org", hero)),
    display: qa(".folio-hero-display", hero).map(T), sub: qa(".folio-hero-sub > span", hero).map(T),
    strengths: qa(".folio-hero-strengths li", hero).map((li) => ({ no: T(q("span", li)), text: T(li).replace(T(q("span", li)), "").trim() })),
    proofs: qa(".folio-proofs > li", hero).map((li) => ({ href: q("a", li).getAttribute("href"), before: T(q(".folio-proof-before", li)), value: after(q(".folio-proof-value", li)),
      bar: (q(".folio-proof-bars i", li) || { style: { getPropertyValue: () => "" } }).style.getPropertyValue("--w"), marks: qa(".folio-proof-marks i", li).map(T), label: T(q(".folio-proof-label", li)), basis: T(q(".folio-proof-basis", li)) })),
    note: sents(q(".folio-hero-note", hero)),
    actions: qa(".folio-hero-actions > a", hero).map(A), photo: { src: q(".folio-hero-photo img", hero).getAttribute("src"), alt: q(".folio-hero-photo img", hero).alt, caption: T(q(".folio-hero-photo figcaption", hero)) },
  };
  const career = q(".folio-career");
  d.career = {
    label: T(q(".folio-story-label", career)),
    jobs: qa("ol > li", career).map((li) => ({ logo: q("img", li).getAttribute("src"), period: T(q(".folio-career-period", li)), title: T(q("strong", li)), sents: sents(li) })),
    brandsLabel: T(q(".folio-brands > span", career)), brands: T(q(".folio-brands", career)).replace(T(q(".folio-brands > span", career)), "").trim(),
    stack: qa(".folio-stack > div", career).map((x) => ({ label: T(q("dt", x)), text: T(q("dd", x)) })), more: A(q(".folio-stack-more a", career)),
    recordsLabel: q("#records").getAttribute("aria-label"),
    records: qa("#records > li").map((li) => ({ ...A(q("a", li)), sub: T(q(":scope > span", li)) })),
  };
  const loop = q("#capabilities");
  d.loop = {
    kicker: T(q(".folio-kicker", loop)), title: T(q(".loop-title", loop)), more: A(q(".loop-more", loop)),
    steps: qa(".loop-panel", loop).map((a) => ({ id: a.id, word: T(q(".loop-panel-stage span", a)), ko: T(q(".loop-panel-stage", a)).replace(T(q(".loop-panel-stage span", a)), "").replace(/^[\s·]+/, ""),
      line: T(q(".loop-panel-line", a)), sents: sents(q(".loop-panel-story", a)), name: T(q(".loop-metrics dt", a)), before: T(q(".loop-metric-before", a)), value: after(q(".loop-metric-value", a)),
      basis: T(q(".loop-metric-basis", a)), points: T(q(".loop-panel-points", a)), proofLabel: T(q(".loop-panel-proof span", a)), proof: qa(".loop-panel-proof a", a).map(A) })),
  };
  const work = q("#projects");
  d.work = {
    kicker: T(q(".folio-kicker", work)), title: T(q(".folio-h2", work)), lead: T(q(".folio-lead", work)),
    cases: qa(".folio-case", work).map((a) => ({ id: a.id, lg: a.classList.contains("folio-case-lg"), href: q(".folio-case-media", a).getAttribute("href"), img: q(".folio-case-media img", a).getAttribute("src"),
      no: T(q(".folio-case-no", a)), tag: T(q(".folio-tag", a)), brand: T(q(".folio-case-brand", a)), period: T(q(".folio-case-period", a)), award: T(q(".folio-case-award", a)),
      title: T(q(".folio-case-title", a)), story: T(q(".folio-case-story", a)), label: T(q(".folio-case-label", a)),
      before: T(q(".folio-case-before", a)).replace(/\s*→?\s*에서\s*$/, "").replace(/\s*→\s*$/, ""), value: after(q(".folio-case-metric", a)), basis: T(q(".folio-case-basis", a)),
      scopeLabel: T(q(".folio-case-scope span", a)), scope: T(q(".folio-case-scope", a)).replace(T(q(".folio-case-scope span", a)), "").trim(),
      links: qa(".folio-case-evidence a", a).map(A) })),
    moreLabel: T(q(".folio-more-label", work)),
    more: qa(".folio-more li a", work).map((a) => ({ href: a.getAttribute("href"), name: T(q("strong", a)), text: T(q("span", a)) })),
  };
  const auto = q("#automation");
  d.auto = {
    kicker: T(q(".folio-kicker", auto)), title: T(q(".folio-h2", auto)), lead: T(q(".folio-lead", auto)),
    demo: { head: qa("#inventory-demo p.flex span", auto).map(T), button: T(q("#inventory-demo button", auto)), countLabel: T(q("#inventory-demo .grid > div > p", auto)),
      count: T(q("#inventory-demo .figure", auto)), status: T(qa("#inventory-demo .grid > div > p", auto)[2]),
      steps: qa(".automation-demo-steps li", auto).map((li) => { const s = qa(":scope > span", li); const t = qa(":scope > span", s[1]); return { no: T(s[0]), name: T(t[0]), text: T(t[1]) }; }) },
    systems: qa(".folio-systems li", auto).map((li) => ({ no: T(q(".folio-system-no", li)), name: T(q("strong", li)), built: T(q(".folio-system-built", li)), effect: T(q(".folio-system-effect", li)) })),
    links: qa(".folio-links a", auto).map(A),
  };
  const c = q("#contact");
  d.contact = { kicker: T(q(".folio-kicker", c)), title: qa(".folio-contact-title span", c).map(T), note: T(q(".folio-contact-note", c)), email: A(q(".folio-email", c)), actions: qa(".folio-contact-actions a", c).map(A), about: A(q(".folio-about-link", c)) };
  d.footer = { lines: qa("footer.site-footer p").flatMap((p) => p.innerText.split("\n")).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean) };
  return d;
});
writeFileSync(out, JSON.stringify(data, null, 1));
console.log("jobs", data.career.jobs.length, "steps", data.loop.steps.length, "cases", data.work.cases.length, "systems", data.auto.systems.length, "proofs", data.hero.proofs.length, "records", data.career.records.length);
await browser.close();
