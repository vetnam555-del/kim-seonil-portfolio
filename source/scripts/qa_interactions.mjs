import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import vm from "node:vm";

// Component-level regression tests with mocked DOM and hook lifecycles.
// These test production callbacks, not browser rendering or layout.
const require = createRequire(import.meta.url);
const ts = require("typescript");
const option = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const sourceRoot = resolve(option("source-root") ?? "src");
const read = (name) => readFileSync(join(sourceRoot, name), "utf8");
const equalDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

function environment({ reduced = false, observer = true, hidden = false } = {}) {
  const listeners = new Map();
  const timers = new Map();
  const frames = new Map();
  const observers = [];
  let counter = 0;
  let clock = 0;
  class Element {
    constructor(top = 0, enter = "") {
      this.top = top;
      this.dataset = { enter };
      this.classes = new Set();
      this.classList = { add: (c) => this.classes.add(c), contains: (c) => this.classes.has(c) };
      this.style = { setProperty: () => {} };
      this.parentElement = null;
      this.focusCount = 0;
    }
    getBoundingClientRect() { return { top: this.top, bottom: this.top + 100 }; }
    closest() { return null; }
    setAttribute() {}
    select() {}
    remove() { document.temporaryNodes.delete(this); }
    focus() { this.focusCount++; document.activeElement = this; }
  }
  const document = {
    hidden, nodes: [], selectors: new Map(), temporaryNodes: new Set(),
    documentElement: Object.assign(new Element(), { scrollHeight: 4000 }),
    activeElement: new Element(),
    body: { appendChild: (e) => document.temporaryNodes.add(e) },
    querySelectorAll: () => document.nodes,
    querySelector: (selector) => document.selectors.get(selector) ?? null,
    createElement: () => new Element(),
    execCommand: () => true,
    addEventListener: (name, fn) => { const set = listeners.get(name) ?? new Set(); set.add(fn); listeners.set(name, set); },
    removeEventListener: (name, fn) => listeners.get(name)?.delete(fn),
  };
  const window = {
    innerHeight: 800, scrollY: 0, location: { href: "" },
    matchMedia: () => ({ matches: reduced }),
    setTimeout: (fn) => { const id = ++counter; timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
    addEventListener: document.addEventListener,
    removeEventListener: document.removeEventListener,
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); this.disconnected = true; }
    emit(target, isIntersecting = true) { if (!this.disconnected) this.callback([{ target, isIntersecting }]); }
  }
  return {
    document, window, Element, observers, frames, timers, listeners,
    pathname: "/", navigator: {},
    globals: {
      document, window, HTMLElement: Element,
      IntersectionObserver: observer ? Observer : undefined,
      performance: { now: () => clock },
      requestAnimationFrame: (fn) => { const id = ++counter; frames.set(id, fn); return id; },
      cancelAnimationFrame: (id) => frames.delete(id),
      setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    },
    flushTimers() { const work = [...timers.values()]; timers.clear(); work.forEach((fn) => fn()); },
    frame(now) { clock = now; const work = [...frames.values()]; frames.clear(); work.forEach((fn) => fn(now)); },
    dispatch(name, event = {}) { [...(listeners.get(name) ?? [])].forEach((fn) => fn(event)); },
  };
}

function walk(tree, predicate) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((node) => walk(node, predicate));
  return [...(predicate(tree) ? [tree] : []), ...walk(tree.props?.children, predicate)];
}

function component(file, exported = "default", env = environment()) {
  const hooks = [];
  let index = 0;
  let pending = [];
  const react = {
    useState(initial) {
      const i = index++;
      if (!(i in hooks)) hooks[i] = { value: typeof initial === "function" ? initial() : initial };
      return [hooks[i].value, (next) => { hooks[i].value = typeof next === "function" ? next(hooks[i].value) : next; }];
    },
    useRef(initial) { const i = index++; return (hooks[i] ??= { current: initial }); },
    useMemo(fn, deps) {
      const i = index++;
      if (!equalDeps(hooks[i]?.deps, deps)) hooks[i] = { deps, value: fn() };
      return hooks[i].value;
    },
    useEffect(fn, deps) {
      const i = index++;
      if (!equalDeps(hooks[i]?.deps, deps)) pending.push(() => {
        hooks[i]?.cleanup?.();
        hooks[i] = { deps, cleanup: fn() };
      });
    },
  };
  const jsx = (type, props) => ({ type, props });
  const imports = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "next/link": { default: "link" },
    "next/navigation": { usePathname: () => env.pathname },
    "@/data/edition": { edition: { showWhyStudio: false, portfolioPdfPath: "/portfolio.pdf" } },
    "@/data/site": { site: { name: "김선일", role: "마케터" } },
  };
  const exports = {};
  const code = ts.transpileModule(read(file), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  vm.runInNewContext(code, {
    ...env.globals, navigator: env.navigator, exports, console,
    process: { env: { NEXT_PUBLIC_BASE_PATH: "/kim-seonil-portfolio" } },
    require: (name) => { if (!(name in imports)) throw new Error(`Unmocked import: ${name}`); return imports[name]; },
  }, { filename: file });
  return {
    env,
    render(props = {}) {
      index = 0; pending = [];
      const tree = exports[exported](props);
      for (const node of walk(tree, (n) => n.props?.ref)) {
        node.props.ref.current ??= new env.Element();
      }
      pending.forEach((fn) => fn());
      return tree;
    },
    dispose() { hooks.forEach((hook) => hook.cleanup?.()); },
  };
}

const results = [];
async function test(name, run) {
  try { await run(); results.push({ name, pass: true }); console.log(`PASS ${name}`); }
  catch (error) { const reason = error.message.split("Input:")[0].trim().slice(0, 500); results.push({ name, pass: false, reason }); console.log(`FAIL ${name}: ${reason}`); }
}

await test("route change registers fresh reveal elements", () => {
  const h = component("components/MotionRuntime.tsx", "MotionRuntime");
  h.env.pathname = "/projects/jestina/"; h.render();
  const target = new h.env.Element(1600);
  h.env.document.nodes = [target]; h.env.pathname = "/"; h.render();
  assert.ok(h.env.observers.some((o) => o.targets.has(target)));
  h.dispose();
});
await test("wipe observes its unclipped parent", () => {
  const h = component("components/MotionRuntime.tsx", "MotionRuntime");
  const target = new h.env.Element(1600, "wipe"); target.parentElement = new h.env.Element(1600);
  h.env.document.nodes = [target]; h.render();
  const observer = h.env.observers.find((o) => o.targets.has(target.parentElement));
  assert.ok(observer); observer.emit(target.parentElement);
  assert.ok(target.classes.has("is-in")); h.dispose();
});
await test("reveal failsafe recovers an unresponsive observer", () => {
  const h = component("components/MotionRuntime.tsx", "MotionRuntime");
  const target = new h.env.Element(1800, "wipe"); h.env.document.nodes = [target]; h.render();
  h.env.flushTimers(); assert.ok(target.classes.has("is-in")); h.dispose();
});
for (const [name, settings] of [["reduced motion", { reduced: true }], ["missing observer", { observer: false }]]) {
  await test(`${name} reveals content without waiting`, () => {
    const env = environment(settings); const target = new env.Element(1800, "wipe"); env.document.nodes = [target];
    const h = component("components/MotionRuntime.tsx", "MotionRuntime", env); h.render();
    assert.ok(target.classes.has("is-in")); h.dispose();
  });
}
await test("header observes home sections after client navigation", () => {
  const h = component("components/Header.tsx"); h.env.pathname = "/resume/"; h.render();
  const target = new h.env.Element(); target.id = "projects";
  h.env.document.selectors.set("#projects", target); h.env.pathname = "/"; h.render();
  assert.ok(h.env.observers.some((o) => o.targets.has(target))); h.dispose();
});
await test("header still renders without IntersectionObserver", () => {
  const env = environment({ observer: false }); env.document.selectors.set("#projects", new env.Element());
  const h = component("components/Header.tsx", "default", env); h.render(); h.dispose();
});
await test("Escape closes mobile menu and restores trigger focus", () => {
  const h = component("components/Header.tsx");
  let tree = h.render(); const button = walk(tree, (n) => n.type === "button")[0];
  button.props.onClick(); h.render();
  h.env.dispatch("keydown", { key: "Escape" }); tree = h.render();
  const closedButton = walk(tree, (n) => n.type === "button")[0];
  assert.equal(closedButton.props["aria-expanded"], false);
  assert.ok(closedButton.props.ref?.current.focusCount > 0); h.dispose();
});
await test("route navigation closes a previously open mobile menu", () => {
  const h = component("components/Header.tsx"); let tree = h.render();
  walk(tree, (n) => n.type === "button")[0].props.onClick(); h.render();
  h.env.pathname = "/resume/"; h.render(); tree = h.render();
  assert.equal(walk(tree, (n) => n.type === "button")[0].props["aria-expanded"], false); h.dispose();
});

const numberText = (tree) => walk(tree, (n) => n.props?.["data-count-up-visual"] !== undefined)[0]?.props.children;
await test("count-up completes with exact decimal and grouping", () => {
  const h = component("components/CountUpValue.tsx"); const props = { value: "104,257건 · 2.24%", duration: 1200 };
  let tree = h.render(props); assert.equal(numberText(tree), props.value);
  h.env.observers[0].emit([...h.env.observers[0].targets][0]); h.env.flushTimers(); h.env.frame(1200);
  tree = h.render(props); assert.equal(numberText(tree), props.value); assert.equal(tree.props["data-count-up-state"], "done"); h.dispose();
});
await test("background tab retains final values until visible", () => {
  const h = component("components/CountUpValue.tsx", "default", environment({ hidden: true }));
  const props = { value: "5,482명" }; h.render(props);
  h.env.observers[0].emit([...h.env.observers[0].targets][0]);
  assert.equal(numberText(h.render(props)), props.value); assert.equal(h.env.frames.size, 0);
  h.env.document.hidden = false; h.env.dispatch("visibilitychange"); h.env.flushTimers(); h.env.frame(1200);
  assert.equal(numberText(h.render(props)), props.value); h.dispose();
});
await test("reduced motion keeps count-up values static", () => {
  const h = component("components/CountUpValue.tsx", "default", environment({ reduced: true }));
  const props = { value: "583%" }; h.render(props); const tree = h.render(props);
  assert.equal(numberText(tree), props.value); assert.equal(tree.props["data-count-up-state"], "reduced"); h.dispose();
});
await test("count-up unmount cancels scheduled work", () => {
  const h = component("components/CountUpValue.tsx"); h.render({ value: "30여 개" });
  h.env.observers[0].emit([...h.env.observers[0].targets][0]); h.env.flushTimers(); h.dispose();
  assert.equal(h.env.frames.size, 0); assert.equal(h.env.timers.size, 0);
});

async function copyTest(mode) {
  const h = component("components/EmailCopyButton.tsx"); const email = "makefair@naver.com";
  let copied;
  h.env.navigator.clipboard = { writeText: async (text) => { if (mode !== "clipboard") throw Error("denied"); copied = text; } };
  h.env.document.execCommand = () => mode === "fallback";
  const focus = h.env.document.activeElement; const tree = h.render({ email });
  await walk(tree, (n) => n.type === "a")[0].props.onClick({ preventDefault() {} });
  const result = h.render({ email }); const status = walk(result, (n) => n.props?.role === "status")[0].props.children;
  assert.match(status, mode === "failure" ? /복사하지 못해/ : /복사되었습니다/);
  if (mode === "clipboard") assert.equal(copied, email);
  if (mode === "failure") assert.equal(h.env.window.location.href, `mailto:${email}`);
  if (mode === "fallback") assert.ok(focus.focusCount > 0);
  assert.equal(h.env.document.temporaryNodes.size, 0);
  h.env.flushTimers(); assert.equal(walk(h.render({ email }), (n) => n.props?.role === "status")[0].props.children, "");
  h.dispose();
}
for (const mode of ["clipboard", "fallback", "failure"]) await test(`email copy ${mode} reports an accurate result`, () => copyTest(mode));

const css = read("app/globals.css");
await test("short viewport mobile menu has a bounded scroll container", () => {
  assert.match(css, /\.mobile-nav\s*\{[^}]*max-height:[^}]*overflow-y:\s*auto/s);
  assert.match(read("components/Header.tsx"), /className="mobile-nav\s/);
});
await test("print uses final values and reveals clipped text", () => {
  const print = css.slice(css.lastIndexOf("@media print"));
  assert.match(print, /\.count-up-measure\s*\{[^}]*visibility:\s*visible/);
  assert.match(print, /\.count-up-visual\s*\{[^}]*display:\s*none/);
  assert.match(print, /\[data-enter\][^}]*clip-path:\s*none/s);
});
await test("Gangwon homepage image has accurate responsive dimensions", () => {
  const source = read("components/ProjectsSection.tsx");
  assert.match(source, /"gangwon-meta-originals\.webp":\s*\{\s*width:\s*1896,\s*height:\s*700/);
  const sizes = JSON.parse(read("data/evidence-sizes.json"));
  assert.equal(sizes["gangwon-meta-originals-960.webp"].width, 960);
});
await test("Gangwon caption distinguishes kimchi from water search event", () => {
  assert.match(read("components/ProjectsSection.tsx"), /여름김치 랜딩별 소재 2종과 천년동안 검색 이벤트 1종/);
});
await test("header and body use the same page grid", () => {
  assert.match(read("components/Header.tsx"), /max-w-\[1240px\].*sm:px-10/);
});
await test("first heading identifies the person and current profession", () => {
  assert.match(read("data/site.ts"), /title:\s*\["김선일", "퍼포먼스 마케터"\]/);
});
await test("creative report text does not deny the visible D2C conversions", () => {
  const source = read("data/projects.ts");
  assert.ok(!source.includes("전환은 네이버 스토어 랜딩 소재에서만"));
  assert.ok(source.includes("베이비워터 자사몰 4.08%"));
});

const report = { sourceRoot, checkedAt: new Date().toISOString(), type: "mocked-component-and-static-contract", results,
  passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).length };
if (option("report")) writeFileSync(resolve(option("report")), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.passed, failed: report.failed }));
process.exitCode = report.failed ? 1 : 0;
