import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/** CONFIG: Update these if your paths differ */
const REACT_STABLE = "react-app-main-reference/src";     // your stable React pull
const REACT_BACKUPS = [
  "react-app-reference/src",
  "react-source-backup/src"
];
const ANGULAR_ROOT = "src/app";

/** Helpers */
const extsReact = new Set([".tsx",".ts",".jsx",".js",".scss",".css",".json"]);
const extsNg    = new Set([".ts",".html",".scss",".css",".json"]);
const toKebab = s => s
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/[_\s]+/g, "-")
  .toLowerCase();
const baseName = p => path.parse(p).name;

/** Crawl a directory and collect files we care about */
function crawl(dir, exts) {
  const out = [];
  (function walk(d) {
    for (const name of fs.existsSync(d) ? fs.readdirSync(d) : []) {
      const full = path.join(d, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else {
        const ext = path.extname(name);
        if (exts.has(ext)) out.push(full.replaceAll("\\","/"));
      }
    }
  })(dir);
  return out.sort();
}

/** Build an inventory of components/pages by folder segments */
function inventoryReact(root) {
  const files = crawl(root, extsReact);
  const items = files.map(f => {
    const rel = f.slice(root.length+1);
    const parts = rel.split("/");
    return {
      rel, parts,
      name: baseName(rel),
      kebab: toKebab(baseName(rel)),
      kind: parts.includes("pages") ? "page" : (parts.includes("components") ? "component" : "other")
    };
  });
  return { root, files: items };
}

function inventoryAngular(root) {
  const files = crawl(root, extsNg);
  const items = files.map(f => {
    const rel = f.slice(root.length+1);
    const parts = rel.split("/");
    return {
      rel, parts,
      name: baseName(rel),
      kebab: toKebab(baseName(rel)),
      kind: parts.includes("pages") ? "page" : (parts.includes("components") ? "component" : "other")
    };
  });
  return { root, files: items };
}

/** Fuzzy map React → Angular candidates by kebab name and “segment affinity” */
function mapReactToAngular(reactInv, ngInv) {
  const ngByKebab = new Map();
  for (const f of ngInv.files) {
    const list = ngByKebab.get(f.kebab) || [];
    list.push(f);
    ngByKebab.set(f.kebab, list);
  }

  const mappings = [];
  const missingInAngular = [];
  for (const r of reactInv.files.filter(x => x.kind === "page" || x.kind === "component")) {
    const candidates = ngByKebab.get(r.kebab) || [];
    if (!candidates.length) {
      missingInAngular.push(r);
      continue;
    }
    // prefer candidates that share a “pages/…” vs “components/…” segment
    const preferred = candidates.find(c => c.kind === r.kind) || candidates[0];
    mappings.push({ react: r.rel, angular: preferred.rel, confidence: preferred.kind === r.kind ? "high" : "medium" });
  }

  const reactKebabs = new Set(reactInv.files.map(x => x.kebab));
  const extraInAngular = ngInv.files
    .filter(x => (x.kind === "page" || x.kind === "component") && !reactKebabs.has(x.kebab))
    .map(x => x.rel);

  return { mappings, missingInAngular, extraInAngular };
}

/** Hash files and compare stable React vs backup folders */
function hashFile(p) {
  const buf = fs.readFileSync(p);
  return crypto.createHash("sha1").update(buf).digest("hex");
}
function dupCheckReact(stableRoot, backupRoots) {
  const stableFiles = crawl(stableRoot, extsReact)
    .filter(p => [".tsx",".ts",".jsx",".js",".json",".scss",".css"].includes(path.extname(p)));
  const stableMap = new Map(stableFiles.map(p => [p.slice(stableRoot.length+1), hashFile(p)]));
  const results = [];
  for (const b of backupRoots) {
    const files = crawl(b, extsReact).filter(p => stableMap.has(p.slice(b.length+1)));
    const diffs = [];
    for (const full of files) {
      const rel = full.slice(b.length+1);
      const hB = hashFile(full);
      const hS = stableMap.get(rel);
      diffs.push({ rel, stableHash: hS, backupHash: hB, status: hS === hB ? "identical" : "modified" });
    }
    // which stable files are missing entirely from this backup?
    const missing = [...stableMap.keys()].filter(rel => !fs.existsSync(path.join(b, rel)));
    results.push({ backupRoot: b, compared: diffs.length, identical: diffs.filter(d=>d.status==="identical").length, modified: diffs.filter(d=>d.status==="modified").length, missingCount: missing.length, missing });
  }
  return results;
}

/** RUN */
const reactInv = inventoryReact(REACT_STABLE);
const ngInv    = inventoryAngular(ANGULAR_ROOT);
const mapping  = mapReactToAngular(reactInv, ngInv);
const dupCheck = dupCheckReact(REACT_STABLE, REACT_BACKUPS);

fs.mkdirSync("docs/parity", { recursive: true });
fs.writeFileSync("docs/parity/react-inventory.json", JSON.stringify(reactInv, null, 2));
fs.writeFileSync("docs/parity/angular-inventory.json", JSON.stringify(ngInv, null, 2));
fs.writeFileSync("docs/parity/mapping-suggestions.json", JSON.stringify(mapping, null, 2));
fs.writeFileSync("docs/parity/react-dup-check.json", JSON.stringify(dupCheck, null, 2));
console.log("Wrote docs/parity/{react-inventory.json,angular-inventory.json,mapping-suggestions.json,react-dup-check.json}");
