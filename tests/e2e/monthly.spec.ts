import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("frozen monthly snapshot, note draft, explicit payment diff refresh and semantic memo", async ({ page }) => {
  await page.goto("/app/monthly-followup");
  await expect(page.getByText("ยังไม่บันทึก 3 คน", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "บันทึกรายเดือน ณัฐธิดา แก้วคำ" }).filter({ visible: true }).click();
  await page.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("นัดผู้ปกครอง");
  await page.getByRole("button", { name: "บันทึกฉบับร่าง", exact: true }).click();
  await expect(page.getByText("บันทึกการติดตามแล้ว", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "รับชำระนักเรียน", exact: true }).click();
  await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-379");
  await page.locator("#receipt-page").selectOption("page-379-13");
  await page.getByRole("button", { name: "ตรวจสอบรายการ", exact: true }).click();
  await page.getByRole("button", { name: "ยืนยันบันทึก", exact: true }).click();
  await expect(page.getByRole("heading", { name: "บันทึกรับชำระแล้ว (สาธิต)" })).toBeVisible();
  await page.getByRole("link", { name: "ติดตามรายเดือน", exact: true }).click();
  await expect(page.getByText("มีข้อมูลการชำระใหม่หลังจัดทำข้อมูล", { exact: true })).toBeVisible();
  await expect(page.locator(".homeroom-metrics")).toContainText("12,500.00");
  await page.getByRole("button", { name: "ตรวจสอบข้อมูลใหม่", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("11,000.00");
  await page.getByRole("button", { name: "ยืนยันสร้างเวอร์ชันใหม่" }).click();
  await expect(page.locator(".homeroom-metrics")).toContainText("11,000.00");
  await page.getByRole("button", { name: "ดูตัวอย่างบันทึกข้อความ" }).click();
  await expect(page.getByRole("dialog")).toContainText("นัดผู้ปกครอง");
  await expect(page.getByRole("dialog")).toContainText("ยังไม่มีแม่แบบ DOCX จริง");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "ดาวน์โหลด DOCX · ยังไม่มีแม่แบบ" })).toBeDisabled();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/screenshots/monthly-${width}.png`, fullPage: true });
  }
});
