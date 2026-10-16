import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build, preview } from "vite";
import { chromium } from "@playwright/test";

// Separate temporary artifact: never replace the verified mock dist or guess
// Firebase configuration. This only tests the fail-closed runtime branch.
const previousMode = process.env.VITE_DATA_MODE;
const outDir = mkdtempSync(join(tmpdir(), "schoolpay-unavailable-"));
let server, browser;
try {
  process.env.VITE_DATA_MODE = "live";
  await build({ build: { outDir } });
  server = await preview({ configFile: false, build: { outDir }, preview: { host: "127.0.0.1", port: 4174, strictPort: true } });
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [], external = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (new URL(request.url()).origin !== "http://127.0.0.1:4174") external.push(request.url()); });
  for (const path of ["/", "/student", "/app/finance/payments", "/app/admin/users"]) {
    await page.goto(`http://127.0.0.1:4174${path}`);
    await page.getByRole("heading", { name: "ยังไม่เปิดการเชื่อมต่อระบบจริง", exact: true }).waitFor();
    assert.equal(await page.locator("button,input,select,textarea").count(), 0);
    assert(!(await page.locator("body").innerText()).includes("69024"));
    await page.reload();
    await page.getByRole("heading", { name: "ยังไม่เปิดการเชื่อมต่อระบบจริง", exact: true }).waitFor();
  }
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  console.log("Live-mode fail-closed smoke passed: four direct URLs/reloads, no mock account, controls, external requests or browser exceptions. No live connection attempted.");
} finally {
  if (previousMode === undefined) delete process.env.VITE_DATA_MODE;
  else process.env.VITE_DATA_MODE = previousMode;
  await browser?.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
