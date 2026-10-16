import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("other-money receive and pending link preserve academic cash", async ({ page }) => {
  await page.goto("/app/finance/other");
  await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-380");
  await page.locator("#workspace-page").selectOption("page-380-5");
  await page.getByRole("button", { name: "ตรวจสอบรายการรับเงินอื่น", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("12,000.00");
  await page.getByRole("button", { name: "บันทึกรายการรับเงินอื่น", exact: true }).click();
  await expect(page.getByRole("heading", { name: "บันทึกรับเงินอื่นแล้ว (สาธิต)" })).toBeVisible();
  await page.getByRole("link", { name: "รายการรอผูกอ้างอิง", exact: true }).click();
  await page.getByLabel("รายการรับเงินแล้ว").selectOption("pending-other-001");
  await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-380");
  await page.locator("#workspace-page").selectOption("page-380-6");
  await page.getByRole("button", { name: "ตรวจสอบการผูกอ้างอิง", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("ไม่รับเงินซ้ำ");
  await page.getByRole("button", { name: "ยืนยันผูกอ้างอิง", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ผูกอ้างอิงแล้ว (สาธิต)" })).toBeVisible();
  await page.getByRole("link", { name: "รับชำระนักเรียน", exact: true }).click();
  await expect(page.locator("main")).toContainText("1,500.00");
});
test("executive dashboard exact aggregates and scoped room/memo navigation", async ({ page }) => {
  await page.goto("/app/dashboard");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("บทบาทจำลอง").selectOption("executive");
  await expect(page.getByRole("heading", { name: "ภาพรวมการจัดเก็บ", exact: true })).toBeVisible();
  if (await page.locator('.dev-toggle[aria-expanded="true"]').count()) await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await expect(page.locator("main")).toContainText("5,400,000.00");
  await expect(page.locator("main")).toContainText("4,800,000.00");
  await expect(page.locator("main")).toContainText("600,000.00");
  await expect(page.locator("main")).toContainText("88.9%");
  await expect(page.locator("main")).toContainText("78,000.00");
  const fills = page.locator('[aria-label="ยอดค้างสูงสุด 160,000 บาท"] button > span + span > span');
  await expect(fills).toHaveCount(6);
  const bars = await fills.evaluateAll(elements => elements.map(element => ({ color: getComputedStyle(element).backgroundColor, trackColor: getComputedStyle(element.parentElement!).backgroundColor, ratio: element.getBoundingClientRect().width / element.parentElement!.getBoundingClientRect().width })));
  for (const bar of bars) { expect(bar.color).not.toBe("rgba(0, 0, 0, 0)"); expect(bar.color).not.toBe(bar.trackColor); }
  expect(bars[0].ratio).toBeCloseTo(0.5625, 2);
  expect(bars[5].ratio).toBeCloseTo(1, 2);
  await expect(page.getByRole("link", { name: "รับชำระนักเรียน", exact: true })).toHaveCount(0);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/screenshots/executive-${width}.png`, fullPage: true });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("link", { name: "ห้องที่รับผิดชอบ", exact: true }).click();
  await page.getByLabel("สถานะชำระ").selectOption("owing");
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page.getByRole("link", { name: "บันทึกข้อความ", exact: true }).click();
  await expect(page.getByRole("region", { name: "ทะเบียนบันทึกข้อความ", exact: true })).toBeVisible();
});
