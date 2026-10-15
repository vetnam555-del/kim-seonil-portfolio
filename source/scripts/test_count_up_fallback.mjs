import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/components/CountUpValue.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;

function mount({ reduced = false, observer = true, hidden = false } = {}) {
  const states = [], effects = [], timers = [], frames = [], listeners = [];
  let callback;
  const node = { closest: () => null };
  const react = {
    useMemo: fn => fn(), useRef: () => ({ current: node }),
    useEffect: fn => effects.push(fn),
    useState: initial => { const index = states.push(initial) - 1; return [initial, value => { states[index] = value; }]; },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: name => name === "react" ? react : require(name),
    window: { matchMedia: () => ({ matches: reduced }), setTimeout: fn => timers.push(fn), clearTimeout() {} },
    document: { hidden, addEventListener: name => listeners.push(name), removeEventListener() {} },
    IntersectionObserver: observer ? class { constructor(fn) { callback = fn; } observe() {} disconnect() {} } : undefined,
    performance: { now: () => 0 }, requestAnimationFrame: fn => frames.push(fn), cancelAnimationFrame() {},
  });
  const tree = exports.default({ value: "월 10억+", duration: 1450, delay: 150 });
  return { states, effects, timers, frames, listeners, tree, intersect: () => callback([{ isIntersecting: true }]) };
}

const initial = mount();
assert.equal(initial.tree.props.children.find(c => c.props["data-count-up-visual"] !== undefined).props.children, "월 10억+");
assert.equal(initial.states[0], "월 10억+");
for (const options of [{ reduced: true }, { observer: false }]) {
  const result = mount(options);
  result.effects[0]();
  assert.equal(result.states[0], "월 10억+");
  assert.equal(result.states[1], "reduced");
  assert.equal(result.frames.length, 0);
}
const background = mount({ hidden: true });
background.effects[0](); background.intersect();
assert.equal(background.states[0], "월 10억+");
assert.ok(background.listeners.includes("visibilitychange"));
assert.equal(background.timers.length, 0);
const running = mount();
running.effects[0](); running.intersect();
assert.equal(running.states[0], "월 10억+", "delay must not leave zero visible");
running.timers[0]();
running.frames[0](1450);
assert.equal(running.states[0], "월 10억+");
assert.equal(running.states[1], "done");
console.log("Count-up: initial render, reduced motion, missing observer, hidden tab, delay, completion passed");
