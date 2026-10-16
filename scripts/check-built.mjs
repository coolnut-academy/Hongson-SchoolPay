import assert from "node:assert/strict";
import { preview } from "vite";
import { chromium } from "@playwright/test";
const server = await preview({
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [],
    external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173")
      external.push(request.url());
  });
  await page.goto("http://127.0.0.1:4173");
  await page.getByLabel("รหัสนักเรียน").fill("69024");
  await page.getByRole("button", { name: "ตรวจสอบข้อมูลการชำระเงิน" }).click();
  await page.getByRole("heading", { name: "พิมพ์ชนก ใจมั่น" }).waitFor();
  await page.getByRole("link", { name: "ประวัติ", exact: true }).click();
  await page.getByLabel("ปีการศึกษา", { exact: true }).selectOption("2568");
  assert((await page.locator("main").innerText()).includes("4,000.00"));
  for (const path of [
    "/app/finance/payments",
    "/app/receipts/books",
    "/app/assignments",
    "/app/fees",
    "/app/homeroom/collections",
    "/app/dashboard",
    "/app/homeroom",
    "/app/monthly-followup",
    "/app/memos",
    "/app/finance/other",
    "/app/finance/pending",
    "/app/receipts/books/book-379",
    "/app/receipts/pages",
    "/app/receipts/movements",
    "/app/reports",
    "/app/admin/users",
    "/app/audit",
  ]) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    await page.locator("h1").waitFor();
    await page.reload();
    await page.locator("h1").waitFor();
    assert.equal(
      await page.getByRole("button", { name: "สาธิต", exact: true }).count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("button", { name: /พิมพ์ใบเสร็จ|ดาวน์โหลดใบเสร็จ/ })
        .count(),
      0,
    );
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await page.goto("http://127.0.0.1:4173/dev/components");
  assert.equal(await page.getByRole("heading", { name: "ไม่พบหน้านี้" }).count(), 1);
  const missingAsset = await page.request.get("http://127.0.0.1:4173/assets/not-a-real-built-asset.js");
  assert.equal(missingAsset.status(), 404, "Missing assets must not be SPA HTML success responses.");
  console.log(
    "Built SPA smoke passed: student lookup/history, all 17 staff deep links/reloads, missing asset 404, no dev gallery/controls, external requests or browser exceptions.",
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
