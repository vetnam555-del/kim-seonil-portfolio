import fs from "node:fs";
const edit = (f, pairs) => {
  let s = fs.readFileSync(f, "utf8");
  for (const [a, b, why] of pairs) {
    if (!s.includes(a)) { console.error("MISS " + f + " ─ " + why); process.exit(1); }
    s = s.replace(a, b); console.log("  ✓ " + f + " · " + why);
  }
  fs.writeFileSync(f, s);
};

edit("src/app/page.tsx", [
  [`import ShinsegaeFit from "@/components/ShinsegaeFit";`,
   `import ShinsegaeFit from "@/components/ShinsegaeFit";\nimport AblyFit from "@/components/AblyFit";`,
   "AblyFit import"],
  [`      {edition.showWhyShinsegae ? <ShinsegaeFit /> : null}`,
   `      {edition.showWhyShinsegae ? <ShinsegaeFit /> : null}\n      {edition.showWhyAbly ? <AblyFit /> : null}`,
   "AblyFit 렌더"],
  [`      {edition.showWhyStudio || edition.showWhyShinsegae ? null : <WhatsNext />}`,
   `      {edition.showWhyStudio || edition.showWhyShinsegae || edition.showWhyAbly ? null : <WhatsNext />}`,
   "지원 판에서는 WhatsNext 숨김"],
]);

edit("src/components/Header.tsx", [
  [`const IS_TARGETED = edition.showWhyStudio || edition.showWhyShinsegae;
const WHY = edition.showWhyShinsegae
  ? { href: "/#why-shinsegae", anchor: "#why-shinsegae", label: "직무 적합성" }`,
   `const IS_TARGETED = edition.showWhyStudio || edition.showWhyShinsegae || edition.showWhyAbly;
const WHY = edition.showWhyAbly
  ? { href: "/#why-ably", anchor: "#why-ably", label: "직무 적합성" }
  : edition.showWhyShinsegae
  ? { href: "/#why-shinsegae", anchor: "#why-shinsegae", label: "직무 적합성" }`,
   "헤더 앵커"],
]);
