import assert from "node:assert/strict";
import { checkHome, checkRuntime, requiredWidths, requiredShortWindows, requiredInteractions } from "./release_contract.mjs";

const routes = ["/", "/resume/", ...["jestina", "newbalance", "daekyo", "gangwon", "dyson", "automation", "edith", "hanssem", "ktalpha"].map(s => `/projects/${s}/`)];
const frames = [{ visual: "4", target: "10", state: "running", width: 90 }, { visual: "10", target: "10", state: "done", width: 90 }];
const valid = {
  version: 1, fingerprint: "current",
  viewports: requiredWidths.map(width => ({ width, height: 1000, heroHeight: 600, scrollWidth: width, clientWidth: width, clipped: [] })),
  shortWindows: requiredShortWindows.map(([width, height]) => ({ width, height, clientWidth: width, scrollWidth: width, innerHeight: height, proofBottom: height - 60, primaryBottom: height - 10 })),
  pages: [390, 1440].flatMap(width => routes.map(route => ({ width, route, scrollWidth: width, clientWidth: width, brokenImages: [], missingTitle: false, loadingErrors: [] }))),
  motion: { hero: frames, case: frames },
  interactions: requiredInteractions.map(name => ({ name, passed: true, observed: "Test fixture observation" })),
  visualReview: { openIssues: 0, screenshots: Array(8).fill("fixture.png") },
};
assert.deepEqual(checkRuntime(valid, "current"), []);
assert.ok(checkRuntime(valid, "new-build").length, "stale browser evidence must fail");
const stationary = structuredClone(valid);
stationary.motion.hero = [frames.at(-1)];
assert.ok(checkRuntime(stationary, "current").some(s => s.includes("intermediate")), "stationary final numbers are not animation proof");
const overflow = structuredClone(valid);
overflow.viewports[0].scrollWidth += 20;
assert.ok(checkRuntime(overflow, "current").some(s => s.includes("Viewport")), "mobile overflow must fail");
const missing = structuredClone(valid);
missing.interactions.pop();
assert.ok(checkRuntime(missing, "current").some(s => s.includes("demo")), "missing interaction must fail");
const belowFold = structuredClone(valid);
belowFold.shortWindows[0].primaryBottom = belowFold.shortWindows[0].height + 24;
assert.ok(checkRuntime(belowFold, "current").some(s => s.includes("Short window 360x640")), "a primary button below a short first screen must fail");
const noShort = structuredClone(valid);
delete noShort.shortWindows;
assert.equal(checkRuntime(noShort, "current").filter(s => s.includes("Short window")).length, requiredShortWindows.length, "missing short-window evidence must fail");
assert.ok(checkHome('<section class="final-hero on-ink"></section>').length, "missing evidence or motion must fail");
console.log("Release contract: 8 regression checks passed");
