import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { gzipSync } from "node:zlib";
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
for (const name of Object.keys({
  ...pkg.dependencies,
  ...pkg.devDependencies,
})) {
  assert(
    !/^(next|firebase|firebase-admin|express|@vercel\/node|jspdf|pdfmake|html2canvas)$/.test(
      name,
    ),
    `Forbidden dependency: ${name}`,
  );
}
for (const path of [
  "api",
  "pages/api",
  "src/api",
  "middleware.ts",
  "src/middleware.ts",
])
  assert(!existsSync(path), `Server entry present: ${path}`);
for (const path of walk("src").filter(
  (p) => /\.(ts|tsx)$/.test(p) && !p.endsWith(".test.ts"),
)) {
  const source = readFileSync(path, "utf8");
  assert(
    !/window\.print\s*\(|localStorage|sessionStorage|indexedDB|https?:\/\//.test(
      source,
    ),
    `Unexpected output, persistence, or network path: ${path}`,
  );
  assert(
    !/from\s+['"](?:firebase|firebase-admin)/.test(source),
    `Live integration: ${path}`,
  );
  if (path.includes("domain"))
    assert(
      !/from\s+['"].*(?:components|features|react)/.test(source),
      `Domain/UI dependency: ${path}`,
    );
  if (path.includes("features"))
    assert(
      !/from\s+['"].*adapters\//.test(source),
      `Feature bypasses adapter port: ${path}`,
    );
}
if (process.argv.includes("--boundaries")) {
  console.log("Source boundaries passed.");
  process.exit(0);
}
assert(existsSync("dist/index.html"), "Run npm run build first.");
const assets = walk("dist");
assert(
  assets.every((p) =>
    [".html", ".js", ".css", ".svg", ".woff2", ".txt"].includes(extname(p)),
  ),
  "Non-static build output.",
);
const scripts = assets.filter((p) => p.endsWith(".js"));
const combined = scripts.map((p) => readFileSync(p, "utf8")).join("\n");
assert(
  !combined.includes("เครื่องมือทดสอบ UI เท่านั้น"),
  "Dev-only tools leaked into production bundle.",
);
assert(!/TEST-(?:ADMIN|STUDENT|TEACHER|FINANCE)|MockAdapter|69024/.test(combined), "Review IDs or seeded records leaked into production.");
const html = readFileSync("dist/index.html", "utf8");
const entryPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+\.js)"/g)].map(match => join("dist", match[1].slice(1)));
assert(entryPaths.length, "Initial module graph is missing.");
const initialGzip = [...new Set(entryPaths)].reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0);
const totalGzip = scripts.reduce(
  (sum, p) => sum + gzipSync(readFileSync(p)).length,
  0,
);
assert(
  initialGzip < 180 * 1024,
  `Initial JS exceeds 180 KiB gzip: ${initialGzip}`,
);
assert(totalGzip < 250 * 1024, `All JS exceeds 250 KiB gzip: ${totalGzip}`);
assert(!combined.includes("แกลเลอรีส่วนประกอบ"), "Development gallery leaked into production.");
const cssGzip = assets.filter(p => p.endsWith(".css")).reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0);
const cssBytes = assets.filter(p => p.endsWith(".css")).reduce((sum, path) => sum + statSync(path).size, 0);
const fontBytes = assets.filter(p => p.endsWith(".woff2")).reduce((sum, path) => sum + statSync(path).size, 0);
// UI v3 adds the reference dashboard, grade charts, portal and shared responsive
// visual layer. Measured at 59.5 KiB raw / 12.4 KiB gzip; keep bounded headroom.
assert(cssBytes <= 64 * 1024, "CSS raw-byte budget exceeded.");
assert(cssGzip <= 14 * 1024, "CSS gzip budget exceeded.");
assert(fontBytes <= 200 * 1024, "Font budget exceeded.");
for (const feature of ["StudentPage", "FinancePage", "LedgerPage", "FeesPage", "HomeroomPage", "MonthlyPage", "DashboardPage", "RoomPage", "OtherMoneyPage", "AdminPage", "AuditPage", "ReportsPage", "StockPage"])
  assert(
    scripts.some((p) => p.includes(feature)),
    `Missing lazy chunk: ${feature}`,
  );
console.log(
  `Static/boundary checks passed. Initial JS ${(initialGzip / 1024).toFixed(1)} KiB gzip; all JS ${(totalGzip / 1024).toFixed(1)} KiB gzip; CSS ${(cssBytes / 1024).toFixed(1)} KiB raw / ${(cssGzip / 1024).toFixed(1)} KiB gzip; fonts ${(fontBytes / 1024).toFixed(1)} KiB. No server runtime, persistent PII store, or receipt exporter.`,
);
