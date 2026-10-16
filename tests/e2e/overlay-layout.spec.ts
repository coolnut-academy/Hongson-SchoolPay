import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("payment confirmation stays usable in short and narrow viewports", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 600 }, { width: 320, height: 500 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/app/finance/payments");
    await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-379");
    await page.locator("#receipt-page").selectOption("page-379-13");
    const trigger = page.getByRole("button", { name: "ตรวจสอบรายการ", exact: true }).filter({ visible: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("opacity", "1");
    for (const locator of [dialog, dialog.getByRole("button", { name: "ปิดหน้าต่าง" }), dialog.getByRole("button", { name: "ยืนยันบันทึก", exact: true })]) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
    const body = dialog.locator(".overlay-body");
    expect(await body.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    if (viewport.height <= 600) {
      expect(await body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
      await body.focus();
      await page.keyboard.press("ArrowDown");
      await expect.poll(() => body.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      const footerBefore = await dialog.locator(".overlay-footer").boundingBox();
      await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
      expect(await dialog.locator(".overlay-footer").boundingBox()).toEqual(footerBefore);
    }
    if (viewport.width === 390) {
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test("monthly preview lays out its metrics to fit the dialog", async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/app/monthly-followup");
    await page.getByRole("button", { name: "ดูตัวอย่างบันทึกข้อความ" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("opacity", "1");
    await expect(dialog.locator(".homeroom-metrics")).toContainText("12,500.00");
    expect(await dialog.locator(".overlay-body").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    for (const metric of await dialog.locator(".metric").all()) {
      expect(await metric.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
});
