import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = ["dashboard", "homeroom", "homeroom/collections", "monthly-followup", "memos", "finance/payments", "finance/other", "finance/pending", "receipts/books", "receipts/books/book-379", "receipts/pages", "receipts/movements", "fees", "assignments", "reports", "admin/users", "audit"];
test("all staff routes reflow at five widths, render accessible states and expose no receipt output", async ({ page, browserName }) => {
  test.setTimeout(480000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(`/app/${route}`);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.getByText("กำลังโหลดข้อมูล", { exact: true })).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
      await expect(page.getByRole("button", { name: /พิมพ์ใบเสร็จ|ดาวน์โหลดใบเสร็จ|สร้างใบเสร็จ/ })).toHaveCount(0);
      if ([390, 1440].includes(width)) {
        expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), route).toEqual([]);
        await page.screenshot({ path: `artifacts/screenshots/${browserName}-${route.replaceAll("/", "-")}-${width}.png`, fullPage: true });
      }
    }
  }
  expect(errors).toEqual([]);
});
test("gallery modal trap/return, generation preview and lifecycle gates", async ({ page }) => {
  await page.goto("/dev/components");
  const open = page.getByRole("button", { name: "เปิดหน้าต่าง primary", exact: true });
  await open.click(); await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  await page.keyboard.press("Escape"); await expect(open).toBeFocused();
  await page.getByRole("tab", { name: "แท็บหนึ่ง", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "แท็บสอง", exact: true })).toBeFocused();
  await expect(page.getByRole("tab", { name: "แท็บสอง", exact: true })).toHaveAttribute("aria-selected", "false");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tabpanel")).toContainText("เนื้อหาสอง");
  await page.goto("/app/assignments");
  await page.getByRole("button", { name: "ตรวจสอบการสร้างภาระ", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("40 คน");
  await page.getByRole("button", { name: "สร้างภาระชำระ", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("ข้าม 40");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "ดูรายการทบทวนภาระ", exact: true }).click();
  await expect(page.locator("main")).toContainText("รักษาการชำระเดิม");
  await expect(page.locator("main")).toContainText("ไม่ลบการชำระหรือยกหนี้อัตโนมัติ");
});
test("all role personas deny forbidden actions, executive access editor is read-only", async ({ page }) => {
  for (const role of ["homeroom_teacher", "finance_teacher", "finance_officer", "executive", "superadmin"]) {
    await page.goto("/app/dashboard");
    await page.getByRole("button", { name: "สาธิต", exact: true }).click();
    await page.getByLabel("บทบาทจำลอง").selectOption(role);
    await expect(page.locator("main h1")).toBeVisible();
    if (await page.locator('.dev-toggle[aria-expanded="true"]').count()) await page.getByRole("button", { name: "สาธิต", exact: true }).click();
    if (["homeroom_teacher", "executive"].includes(role)) await expect(page.getByRole("link", { name: "รับชำระนักเรียน", exact: true })).toHaveCount(0);
    if (role === "finance_teacher") await expect(page.getByRole("link", { name: "รับเงินประเภทอื่น", exact: true })).toHaveCount(0);
    if (role === "executive") {
      await page.getByRole("link", { name: "ผู้ใช้งานและสิทธิ์", exact: true }).click();
      await page.getByRole("button", { name: "ดูสิทธิ์ นางสาวศิริพร แสงทอง" }).filter({ visible: true }).click();
      await expect(page.getByLabel("บทบาทที่กำหนด")).toBeDisabled();
      await expect(page.getByRole("button", { name: "ตรวจสอบการเปลี่ยนสิทธิ์", exact: true })).toHaveCount(0);
    }
  }
});
test("loading can be released and revoked permissions clear protected content", async ({ page }) => {
  await page.goto("/app/finance/payments");
  await expect(page.getByLabel("เล่มใบเสร็จที่เปิดใช้")).toBeVisible();
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("loading");
  await expect(page.getByText("กำลังโหลดข้อมูล", { exact: true })).toBeVisible();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("baseline");
  await expect(page.getByLabel("เล่มใบเสร็จที่เปิดใช้")).toBeVisible();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("permission-revoked");
  await expect(page.getByRole("heading", { name: "รอยืนยันสิทธิ์บุคลากร", exact: true })).toBeVisible();
  await expect(page.getByText("พิมพ์ชนก ใจมั่น", { exact: true })).toHaveCount(0);
});
test("staff demo logout clears protected scope and explicit login restores the assigned persona", async ({ page }) => {
  await page.goto("/app/dashboard");
  await expect(page.locator("main h1")).toBeVisible();
  await page.getByRole("button", { name: "ออกจากระบบสาธิต", exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.locator('main a[href="/app/finance/payments"]').click();
  await expect(page.getByRole("heading", { name: "รอยืนยันสิทธิ์บุคลากร", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "กลับหน้าสาธิต", exact: true }).click();
  await page.getByRole("button", { name: "เข้าสู่ระบบบุคลากร · สาธิต", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ความพร้อมของระบบ", exact: true })).toBeVisible();
});
test("other-money unknown outcome resolves once and balance conflict never receives a second payment", async ({ page }) => {
  await page.goto("/app/finance/other");
  await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-380");
  await page.locator("#workspace-page").selectOption("page-380-5");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("unknown-outcome");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByRole("button", { name: "ตรวจสอบรายการรับเงินอื่น", exact: true }).click();
  await page.getByRole("button", { name: "บันทึกรายการรับเงินอื่น", exact: true }).click();
  await expect(page.getByRole("heading", { name: "กำลังตรวจสอบผลการบันทึก", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ตรวจสอบสถานะ", exact: true }).click();
  await expect(page.getByRole("heading", { name: "บันทึกรับเงินอื่นแล้ว (สาธิต)", exact: true })).toBeVisible();
  // New isolated app session for the externally committed balance-change fixture.
  await page.goto("/app/finance/payments");
  await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-379");
  await page.locator("#receipt-page").selectOption("page-379-13");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("balance-changed");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByRole("button", { name: "ตรวจสอบรายการ", exact: true }).click();
  await page.getByRole("button", { name: "ยืนยันบันทึก", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("ไม่มีการรับเงินซ้ำ");
  await expect(page.getByRole("heading", { name: "บันทึกรับชำระแล้ว (สาธิต)", exact: true })).toHaveCount(0);
});
