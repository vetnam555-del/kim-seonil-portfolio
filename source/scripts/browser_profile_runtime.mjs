import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const PROJECT = "kim-seonil-portfolio-HLL-source";
const MARKER = ".codex-browser-profile-owner.json";
const ownedProfiles = new Map();

function samePath(a, b) {
  return path.relative(a, b) === "";
}

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`));
}

// Fail closed for Desktop locations and junction/symlink ancestors, including
// an override that would route an apparently external path back into Desktop.
function assertSafeLocation(candidate) {
  const absolute = path.resolve(candidate);
  if (isWithin(absolute, path.join(os.homedir(), "Desktop"))) {
    throw new Error("Browser profile cache must be outside Desktop.");
  }
  for (let cursor = absolute; ; cursor = path.dirname(cursor)) {
    try {
      if (fs.lstatSync(cursor).isSymbolicLink()) {
        throw new Error(`Browser profile cache cannot use a junction or symlink: ${cursor}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (path.dirname(cursor) === cursor) break;
  }
  return absolute;
}

// QA_CACHE_ROOT overrides the cache parent, not the per-run profile directory.
// Keep runtime data outside AppData too: packaged app hosts can virtualize it.
export function browserProfileRoot() {
  const cache = process.env.QA_CACHE_ROOT || path.join(os.homedir(), "CodexLocalRuntime", "cache");
  if (!path.isAbsolute(cache)) throw new Error("QA_CACHE_ROOT must be an absolute path.");
  return assertSafeLocation(path.join(cache, PROJECT, "browser-profiles"));
}

export function createBrowserProfile(kind) {
  if (typeof kind !== "string" || !/^[a-z][a-z0-9-]{0,48}$/.test(kind)) {
    throw new Error("Invalid browser profile kind.");
  }
  const root = browserProfileRoot();
  fs.mkdirSync(root, { recursive: true });
  assertSafeLocation(root);
  const realRoot = fs.realpathSync(root);
  const profile = fs.mkdtempSync(path.join(root, `${kind}-${process.pid}-`));
  const token = randomUUID();
  fs.writeFileSync(path.join(profile, MARKER), JSON.stringify({ project: PROJECT, pid: process.pid, token }), { flag: "wx" });
  const stat = fs.lstatSync(profile, { bigint: true });
  ownedProfiles.set(profile, { root, realRoot, token, dev: stat.dev, ino: stat.ino });
  return profile;
}

// Only print_resume's pre-existing cleanup calls this. Other generators do not
// gain automatic cleanup; old profiles are never scanned, adopted, or removed.
export function removeOwnedBrowserProfile(profile) {
  const owner = ownedProfiles.get(profile);
  if (!owner) throw new Error("Refusing to remove a profile not created by this process.");
  const absolute = assertSafeLocation(profile);
  if (!samePath(absolute, profile) || !samePath(path.dirname(absolute), owner.root) || samePath(absolute, owner.root)) {
    throw new Error("Refusing to remove a profile outside its recorded root.");
  }
  if (!samePath(fs.realpathSync(owner.root), owner.realRoot) || !samePath(fs.realpathSync(absolute), path.join(owner.realRoot, path.basename(absolute)))) {
    throw new Error("Refusing to remove a profile whose real path changed.");
  }
  const stat = fs.lstatSync(absolute, { bigint: true });
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.dev !== owner.dev || stat.ino !== owner.ino) {
    throw new Error("Refusing to remove a replaced profile directory.");
  }
  const markerPath = path.join(absolute, MARKER);
  if (fs.lstatSync(markerPath).isSymbolicLink()) throw new Error("Refusing a linked profile ownership marker.");
  const marker = JSON.parse(fs.readFileSync(markerPath, "utf8"));
  if (marker.project !== PROJECT || marker.pid !== process.pid || marker.token !== owner.token) {
    throw new Error("Refusing to remove a profile with a changed ownership marker.");
  }
  fs.rmSync(absolute, { recursive: true, force: false });
  ownedProfiles.delete(profile);
}
