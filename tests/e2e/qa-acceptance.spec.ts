import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["dashboard", "homeroom", "homeroom/collections", "monthly-followup", "memos", "finance/payments", "finance/other", "finance/pending", "receipts/books", "receipts/books/book-379", "receipts/pages", "receipts/movements", "fees", "assignments", "reports", "admin/users", "audit"];

test("emulated 200% and 400% effective zoom reflow, reduced motion and control targets", async ({ browser, browserName }) => {
  test.setTimeout(240000);
  // Effective CSS viewport and raster scale emulate zoom reflow. This does not
  // operate the native browser zoom menu or certify real-device magnification.
  for (const [width, deviceScaleFactor] of [[720, 2], [320, 4]]) {
    const context = await browser.newContext({ baseURL: "http://127.0.0.1:5173", viewport: { width, height: 500 }, deviceScaleFactor, reducedMotion: "reduce" });
    try {
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(`/app/${route}`);
        await expect(page.locator("main h1")).toBeVisible();
        await expect(page.getByText("กำลังโหลดข้อมูล", { exact: true })).toHaveCount(0);
        expect(await page.evaluate(() => innerWidth)).toBe(width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
        const undersized = await page.locator("main .btn:visible, main .icon-button:visible").evaluateAll(elements => elements.filter(element => { const box = element.getBoundingClientRect(); return box.width < 43.5 || box.height < 43.5; }).map(element => element.textContent));
        expect(undersized, route).toEqual([]);
        const motion = await page.locator("main").evaluate(element => ({ reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, transition: getComputedStyle(element.querySelector(".btn") ?? element).transitionDuration, animation: getComputedStyle(element).animationName }));
        expect(motion).toEqual({ reduced: true, transition: "0s", animation: "none" });
        if (width === 720 && ["finance/payments", "homeroom/collections"].includes(route)) {
          expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
          await page.screenshot({ path: `artifacts/screenshots/${browserName}-zoom-200-${route.replaceAll("/", "-")}.png`, fullPage: true });
        }
      }
      await page.goto("/");
      await page.getByLabel("รหัสนักเรียน").fill("69024");
      await page.getByRole("button", { name: "ตรวจสอบข้อมูลการชำระเงิน", exact: true }).click();
      for (const path of ["/student", "/student/history", "/student/documents"]) {
        await page.goto(path);
        // A full reload deliberately clears the in-memory visitor session.
        await expect(page.getByLabel("รหัสนักเรียน")).toBeVisible();
        await page.getByLabel("รหัสนักเรียน").fill("69024");
        await page.getByRole("button", { name: "ตรวจสอบข้อมูลการชำระเงิน", exact: true }).click();
        if (path.endsWith("history")) await page.getByRole("link", { name: "ประวัติ", exact: true }).click();
        if (path.endsWith("documents")) await page.locator('a[href="/student/documents"]').click();
        await expect(page.locator("main h1")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
      }
      await page.goto("/dev/components");
      const busyIndicator = page.locator('[class*="animate-spin"]').first();
      await expect(busyIndicator).toBeVisible();
      expect(await busyIndicator.evaluate(element => getComputedStyle(element).animationName)).toBe("none");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      expect(await busyIndicator.evaluate(element => getComputedStyle(element).animationName)).not.toBe("none");
      expect(await page.locator("main .btn").first().evaluate(element => getComputedStyle(element).transitionDuration)).not.toBe("0s");
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect(await busyIndicator.evaluate(element => getComputedStyle(element).animationName)).toBe("none");
    } finally { await context.close(); }
  }
});

test("keyboard skip links focus staff and visitor content landmarks", async ({ page }) => {
  const blockerWarnings: string[] = [];
  page.on("console", message => { if (message.text().includes("blocker on a POP navigation")) blockerWarnings.push(message.text()); });
  await page.goto("/app/finance/payments");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("main h1")).toBeFocused();
  await page.getByRole("link", { name: "ข้ามไปเนื้อหา", exact: true }).focus();
  await expect(page.getByRole("link", { name: "ข้ามไปเนื้อหา", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/\/app\/finance\/payments$/);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("main"))).toBe(true);
  await page.goto("/");
  await page.getByLabel("รหัสนักเรียน").fill("69024");
  await page.getByRole("button", { name: "ตรวจสอบข้อมูลการชำระเงิน", exact: true }).click();
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("main h1")).toBeFocused();
  await page.getByRole("link", { name: "ข้ามไปเนื้อหา", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/\/student$/);
  expect(blockerWarnings).toEqual([]);
});

test("keyboard completes finance review and submit, human note save and access diff", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/app/finance/payments");
  const book = page.getByLabel("เล่มใบเสร็จที่เปิดใช้");
  await book.focus(); await book.press("ArrowDown"); await book.press("Enter");
  await expect(book).toHaveValue("book-379");
  const physicalPage = page.locator("#receipt-page");
  await physicalPage.focus(); await physicalPage.press("ArrowDown"); await physicalPage.press("Enter");
  await expect(physicalPage).toHaveValue("page-379-13");
  await page.getByRole("button", { name: "ตรวจสอบรายการ", exact: true }).press("Enter");
  await expect(page.getByRole("dialog")).toContainText("30ก58379 / 13");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "ตรวจสอบรายการ", exact: true }).press("Space");
  await page.getByRole("button", { name: "ยืนยันบันทึก", exact: true }).press("Enter");
  await expect(page.getByRole("heading", { name: "บันทึกรับชำระแล้ว (สาธิต)", exact: true })).toBeVisible();
  // Full navigation resets the fictional store for the independent note case.
  await page.goto("/app/homeroom/collections");
  const reason = page.getByLabel("สาเหตุการค้างชำระ", { exact: true });
  await reason.focus(); await reason.press("ControlOrMeta+A"); await reason.pressSequentially("QA keyboard follow-up");
  await page.getByRole("button", { name: "บันทึกการติดตาม", exact: true }).press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "บันทึกการติดตามแล้ว" })).toBeVisible();
  await page.goto("/app/admin/users");
  await page.getByRole("button", { name: "จัดการสิทธิ์ นางสาวศิริพร แสงทอง" }).filter({ visible: true }).press("Enter");
  await page.getByLabel("ม.2/1", { exact: true }).press("Space");
  await page.getByLabel("เหตุผลการเปลี่ยนสิทธิ์").pressSequentially("QA room scope review");
  await page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์", exact: true }).press("Enter");
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toContainText("ม.2/1");
  await page.getByRole("button", { name: "ยืนยันเปลี่ยนสิทธิ์", exact: true }).press("Enter");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("golden review captures use exact viewport sizes and role fixtures without approving baselines", async ({ page, browserName }) => {
  test.setTimeout(90000);
  for (const [width, height] of [[390, 844], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    for (const [golden, path, role] of [
      ["G1", "/", "visitor"],
      ["G2", "/app/finance/payments", "finance_officer"],
      ["G3", "/app/monthly-followup", "homeroom_teacher"],
      ["G4", "/app/dashboard", "executive"],
    ]) {
      await page.goto(path);
      if (role === "visitor") {
        await page.getByLabel("รหัสนักเรียน").fill("69024");
        await page.getByRole("button", { name: "ตรวจสอบข้อมูลการชำระเงิน", exact: true }).click();
        await expect(page.locator(".balance-value")).toContainText("1,500.00");
      } else {
        await page.getByRole("button", { name: "สาธิต", exact: true }).click();
        await page.getByLabel("บทบาทจำลอง").selectOption(role);
        await expect(page.locator("main h1")).toBeVisible();
        await expect(page.getByText("กำลังโหลดข้อมูล", { exact: true })).toHaveCount(0);
        if (await page.locator('.dev-toggle[aria-expanded="true"]').count()) await page.getByRole("button", { name: "สาธิต", exact: true }).click();
        if (golden === "G2") {
          await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-379");
          await page.locator("#receipt-page").selectOption("page-379-13");
        }
        if (golden === "G3") await expect(page.locator("main")).toContainText("12,500.00");
        if (golden === "G4") await expect(page.locator("main")).toContainText("5,400,000.00");
      }
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, 0));
      const capture = await page.screenshot({ path: `artifacts/screenshots/${browserName}-${golden}-${width}x${height}-review.png`, animations: "disabled" });
      expect(capture.readUInt32BE(16)).toBe(width);
      expect(capture.readUInt32BE(20)).toBe(height);
    }
  }
});
