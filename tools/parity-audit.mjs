import fs from "node:fs";
import path from "node:path";

// --- CONFIG: Angular vs React reference roots & expected landmarks ---
const NG = {
  root: "src/app",
  routes: ["app.routes.ts", "app-routing.module.ts"],
  pages: [
    "pages/existing-store",
    "pages/wizard/step-1",
    "pages/wizard/step-2",
    "pages/reports",
    "components/dashboard"
  ],
  mustHave: [
    "components/projected-performance",
    "components/expenses",
    "components/dashboard"
  ]
};

const REACT = {
  root: "react-reference/stable-main/src", // ← uses your imported path
  routes: ["router.tsx", "routes.tsx", "App.tsx"],
  pages: [
    "pages/QuickStart",
    "pages/IncomeExpense",
    "pages/ExpenseManagement",
    "pages/Reports",
    "components/Dashboard"
  ],
  mustHave: [
    "components/ProjectedPerformance",
    "components/ExpenseManagement",
    "components/Dashboard"
  ]
};

function existsAny(base, files) {
  return files.some(f => fs.existsSync(path.join(base, f)));
}
function listMissing(base, rels) {
  return rels.filter(rel => !fs.existsSync(path.join(base, rel)));
}
function summary(label, ok, detail = []) {
  return { label, ok, detail: detail.sort() };
}

const report = {
  paths: { angularRoot: NG.root, reactRoot: REACT.root },
  angularRoutes: summary(
    "Angular route files present",
    existsAny(NG.root, NG.routes),
    listMissing(NG.root, NG.routes)
  ),
  angularPages: summary(
    "Angular pages present",
    listMissing(NG.root, NG.pages).length === 0,
    listMissing(NG.root, NG.pages)
  ),
  angularMustHave: summary(
    "Angular must-have components present",
    listMissing(NG.root, NG.mustHave).length === 0,
    listMissing(NG.root, NG.mustHave)
  ),
  reactRoutes: summary(
    "React route files present",
    existsAny(REACT.root, REACT.routes),
    listMissing(REACT.root, REACT.routes)
  ),
  reactPages: summary(
    "React pages present",
    listMissing(REACT.root, REACT.pages).length === 0,
    listMissing(REACT.root, REACT.pages)
  ),
  reactMustHave: summary(
    "React must-have components present",
    listMissing(REACT.root, REACT.mustHave).length === 0,
    listMissing(REACT.root, REACT.mustHave)
  ),
  notes: [
    "This is a structure/landmark audit, not a logic diff.",
    "Use the missing Angular items to drive exact Cursor tasks."
  ]
};

fs.mkdirSync("docs/parity", { recursive: true });
fs.writeFileSync("docs/parity/parity-report.json", JSON.stringify(report, null, 2));
console.log("Wrote docs/parity/parity-report.json");
