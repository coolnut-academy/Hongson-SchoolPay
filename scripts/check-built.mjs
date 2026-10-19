import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { preview } from "vite";
import { chromium } from "@playwright/test";
const js = readdirSync("dist/assets").filter(p => p.endsWith(".js")).map(p => readFileSync("dist/assets/" + p, "utf8")).join("\n");
for (const value of ["TEST-ADMIN", "TEST-STUDENT", "TEST-TEACHER", "MockAdapter", "พิมพ์ชนก", "69024"])
  assert(!js.includes(value), "Review account or seeded data in production: " + value);
const server = await preview({ preview: { host: "127.0.0.1", port: 4173, strictPort: true } });
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  for (const route of ["/", "/app/admin/users", "/app/dashboard", "/student", "/student/history", "/student/documents"]) {
    await page.goto("http://127.0.0.1:4173" + route);
    await page.getByTestId("entry-page").waitFor();
    assert.equal(await page.getByTestId("review-accounts").count(), 0);
    assert(await page.getByTestId("student-login").isEnabled());
    assert(await page.getByTestId("staff-login").isEnabled());
  }
  const response = await page.request.get("http://127.0.0.1:4173/assets/missing.js");
  assert.equal(response.status(), 404);
  assert.deepEqual(errors, []);
  console.log("Production checks passed: no review IDs or seeded data; protected routes denied; missing assets return 404.");
} finally { await browser?.close(); await new Promise(resolve => server.httpServer.close(resolve)); }
