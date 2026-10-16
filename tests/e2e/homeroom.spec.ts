import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";

async function openHomeroom(page: Page, role = "homeroom_teacher") {
  await page.goto("/app/homeroom/collections");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("บทบาทจำลอง").selectOption(role);
  await expect(page.getByRole("heading", { name: "นักเรียนค้างชำระ 7 คน" })).toBeVisible();
  if (await page.locator('.dev-toggle[aria-expanded="true"]').count()) await page.getByRole("button", { name: "สาธิต", exact: true }).click();
}
async function scenario(page: Page, value: string) {
  if (await page.locator('.dev-toggle[aria-expanded="false"]').count()) await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("สถานการณ์จำลอง").selectOption(value);
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
}
test("homeroom desktop: approved debts, note save and scoped month reload", async ({ page }) => {
  await openHomeroom(page);
  await expect(page.getByLabel("ห้องที่รับผิดชอบ").locator("option")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await expect(page.getByLabel("สรุปห้องเรียน")).toContainText("฿12,500.00");
  const amounts = await page.locator("tbody .money").allTextContents();
  expect(amounts.reduce((sum, value) => sum + Number(value.replace(/[^\d.]/g, "")), 0)).toBe(12500);
  await page.getByRole("button", { name: "ยังไม่บันทึก 3", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByRole("button", { name: "ดูบันทึก ณัฐธิดา แก้วคำ" }).click();
  await page.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("ประสานผู้ปกครองแล้ว");
  await page.getByLabel("แนวทางแก้ไข / ความต้องการผู้ปกครอง", { exact: true }).fill("นัดติดตามครั้งถัดไป");
  await page.getByRole("button", { name: "บันทึกการติดตาม", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "บันทึกการติดตามแล้ว" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ยังไม่บันทึก 2", exact: true })).toBeVisible();
  await expect(page.getByLabel("สรุปห้องเรียน")).toContainText("฿12,500.00");
  await page.getByLabel("เดือน", { exact: true }).fill("2026-09");
  await expect(page.getByRole("heading", { name: "ไม่มีข้อมูลเดือนที่เลือก" })).toBeVisible();
  await page.getByLabel("เดือน", { exact: true }).fill("2026-10");
  await page.getByRole("button", { name: "ดูบันทึก ณัฐธิดา แก้วคำ" }).click();
  await expect(page.getByLabel("สาเหตุการค้างชำระ", { exact: true })).toHaveValue("ประสานผู้ปกครองแล้ว");
});
test("homeroom guards row, month, browser back and route changes", async ({ page }) => {
  await openHomeroom(page);
  await page.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("ยังไม่บันทึก");
  await page.getByRole("button", { name: "ดูบันทึก ณัฐธิดา แก้วคำ" }).click();
  await expect(page.getByRole("dialog")).toContainText("มีการแก้ไขที่ยังไม่บันทึก");
  await page.getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("สาเหตุการค้างชำระ", { exact: true })).toHaveValue("ยังไม่บันทึก");
  await page.getByLabel("เดือน", { exact: true }).fill("2026-09");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "อยู่หน้านี้", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("เดือน", { exact: true })).toBeFocused();
  await expect(page.getByLabel("เดือน", { exact: true })).toHaveValue("2026-10");
  await page.getByRole("link", { name: "กลับหน้าสาธิต", exact: true }).click();
  await page.getByRole("button", { name: "อยู่หน้านี้", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "กลับหน้าสาธิต", exact: true })).toBeFocused();
  await page.getByLabel("เดือน", { exact: true }).fill("2026-09");
  await page.getByRole("button", { name: "ออกโดยไม่บันทึก", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ไม่มีข้อมูลเดือนที่เลือก", exact: true })).toBeVisible();
  await page.getByLabel("เดือน", { exact: true }).fill("2026-10");
  await page.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("ฉบับร่างใหม่");
  await page.goBack();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "อยู่หน้านี้", exact: true }).click();
  await expect(page.getByLabel("สาเหตุการค้างชำระ", { exact: true })).toHaveValue("ฉบับร่างใหม่");
});
test("homeroom read errors, empty assignment, stale source, validation and offline retry", async ({ page }) => {
  await openHomeroom(page);
  await page.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("ก".repeat(1001));
  await page.getByRole("button", { name: "บันทึกการติดตาม", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("1,000");
  await page.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("ข้อความที่ต้องเก็บไว้");
  await scenario(page, "offline");
  await page.getByRole("button", { name: "บันทึกการติดตาม", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("เชื่อมต่ออินเทอร์เน็ต");
  await scenario(page, "baseline");
  await page.getByRole("button", { name: "บันทึกการติดตาม", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "บันทึกการติดตามแล้ว" })).toBeVisible();
  await scenario(page, "stale");
  await expect(page.getByText("ข้อมูลต้นทางล้าสมัย", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "บันทึกการติดตาม", exact: true })).toBeDisabled();
  await scenario(page, "read-error");
  await expect(page.getByRole("heading", { name: "ไม่สามารถโหลดข้อมูลได้" })).toBeVisible();
  await scenario(page, "no-assigned-rooms");
  await expect(page.getByRole("heading", { name: "ยังไม่ได้รับมอบหมายห้อง" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "ห้องที่รับผิดชอบ", exact: true })).toHaveCount(0);
});
test("homeroom unauthorized room deep link and executive read-only view", async ({ page }) => {
  await page.goto("/app/homeroom/collections?room=ม.2/2");
  await expect(page.getByRole("heading", { name: "ไม่มีสิทธิ์ดูข้อมูลห้องนี้" })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await page.getByRole("button", { name: "กลับห้องที่รับผิดชอบ" }).click();
  await expect(page.getByRole("heading", { name: "นักเรียนค้างชำระ 7 คน" })).toBeVisible();
  await openHomeroom(page, "executive");
  await expect(page.getByLabel("สาเหตุการค้างชำระ", { exact: true })).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "บันทึกการติดตาม", exact: true })).toBeDisabled();
  await expect(page.getByRole("link", { name: "รับชำระนักเรียน", exact: true })).toHaveCount(0);
});
for (const width of [1440, 390]) {
  test(`homeroom ${width}px screenshot, keyboard editor and accessibility`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openHomeroom(page);
    await page.evaluate(() => document.fonts.ready);
    mkdirSync("artifacts/screenshots", { recursive: true });
    await page.screenshot({ path: `artifacts/screenshots/homeroom-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const action = page.getByRole("button", { name: "ดูบันทึก ณัฐธิดา แก้วคำ" }).filter({ visible: true });
    await action.focus(); await page.keyboard.press("Enter");
    const scope = width === 390 ? page.getByRole("dialog") : page.locator(".homeroom-desktop-editor");
    await expect(scope.getByLabel("สาเหตุการค้างชำระ", { exact: true })).toBeVisible();
    await scope.getByLabel("สาเหตุการค้างชำระ", { exact: true }).fill("ติดตามทางโทรศัพท์");
    await scope.getByRole("button", { name: "บันทึกการติดตาม", exact: true }).click();
    await expect(scope.getByRole("status")).toContainText("บันทึกการติดตามแล้ว");
    await page.screenshot({ path: `artifacts/screenshots/homeroom-editor-${width}.png`, fullPage: width !== 390 });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
    if (width === 390) {
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(action).toBeFocused();
    }
  });
}
test("homeroom fits 320px, tablet and narrow desktop", async ({ page }) => {
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/app/homeroom/collections");
    await expect(page.getByRole("heading", { name: "นักเรียนค้างชำระ 7 คน" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`).toBe(true);
  }
});
