import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";
async function loginStudent(page: Page) {
  await page.goto("/");
  await page.getByLabel("รหัสนักเรียน").fill("69024");
  await page.getByRole("button", { name: "ตรวจสอบข้อมูลการชำระเงิน" }).click();
  await expect(
    page.getByRole("heading", { name: "พิมพ์ชนก ใจมั่น" }),
  ).toBeVisible();
}
async function selectReference(page: Page) {
  await page.getByLabel("เล่มใบเสร็จที่เปิดใช้").selectOption("book-379");
  await page.locator("#receipt-page").selectOption("page-379-13");
}
test("student lookup, two-year history and reference-only details", async ({
  page,
}) => {
  await loginStudent(page);
  await expect(page.locator(".balance-value")).toContainText("1,500.00");
  await page.getByRole("link", { name: "ประวัติ", exact: true }).click();
  await page.getByLabel("ปีการศึกษา", { exact: true }).selectOption("2568");
  await expect(page.getByText("฿4,000.00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ดูรายละเอียด", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("27ก70110");
  await expect(
    page.getByRole("dialog").getByRole("button", { name: /พิมพ์|ดาวน์โหลด/ }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "ดูรายละเอียด", exact: true }),
  ).toBeFocused();
  await page.getByRole("link", { name: "เปลี่ยนรหัส" }).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel("รหัสนักเรียน")).toBeVisible();
  await expect(page.getByText("พิมพ์ชนก ใจมั่น", { exact: true })).toHaveCount(0);
});
test("finance validates and commits once, ledger updates", async ({ page }) => {
  await page.goto("/app/finance/payments");
  await expect(
    page.getByRole("heading", { name: "รับชำระนักเรียน", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ตรวจสอบรายการ", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("เลือกเล่ม");
  await selectReference(page);
  await page
    .getByRole("button", { name: "ตรวจสอบรายการ", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("30ก58379 / 13");
  await page.getByRole("button", { name: "ยืนยันบันทึก", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "บันทึกรับชำระแล้ว (สาธิต)" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "เล่มใบเสร็จ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "เล่ม 30ก58379 หน้า 13 used" }),
  ).toBeVisible();
});
test("unknown outcome can be resolved without duplicate submit", async ({
  page,
}) => {
  await page.goto("/app/finance/payments");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("unknown-outcome");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await selectReference(page);
  await page
    .getByRole("button", { name: "ตรวจสอบรายการ", exact: true })
    .click();
  await page.getByRole("button", { name: "ยืนยันบันทึก", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "กำลังตรวจสอบผลการบันทึก" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ตรวจสอบสถานะ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "บันทึกรับชำระแล้ว (สาธิต)" }),
  ).toBeVisible();
});
test("ledger renders 50 pages, reference detail, void and return validation", async ({
  page,
}) => {
  await page.goto("/app/receipts/books");
  await expect(page.locator(".page-cell")).toHaveCount(50);
  await page.getByRole("button", { name: "เล่ม 30ก58379 หน้า 9 used" }).click();
  await expect(page.getByRole("dialog")).toContainText("2,000.00");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "เล่ม 30ก58379 หน้า 13 available" })
    .click();
  await page
    .getByRole("button", { name: "ยืนยันยกเลิกหน้าว่าง (สาธิต)" })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await page.getByLabel("เหตุผลการยกเลิก").fill("ชำรุดก่อนรับเงิน");
  await page
    .getByRole("button", { name: "ยืนยันยกเลิกหน้าว่าง (สาธิต)" })
    .click();
  await expect(
    page.getByRole("button", { name: "เล่ม 30ก58379 หน้า 13 void" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ตรวจนับ / คืนเล่ม" }).click();
  await page.locator("#count-available").fill("36");
  await page.getByRole("button", { name: "ตรวจสอบยอดตรวจนับ" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "จำนวนตรวจนับไม่ครบ 50 หน้า",
  );
});
test("fee filters, validation, draft editing and separate publication", async ({
  page,
}) => {
  await page.goto("/app/fees");
  await page.getByLabel("ค้นหารายการ").fill("does-not-exist");
  await expect(
    page.getByRole("heading", { name: "ไม่พบรายการที่ตรงกับตัวกรอง" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ล้างตัวกรอง" }).click();
  await page.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
  await page.getByRole("button", { name: "บันทึกรายการ (สาธิต)" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await page.getByLabel("รหัสรายการ").fill("TEST-001");
  await page.getByLabel("ชื่อรายการ").fill("รายการทดสอบสาธิต");
  await page.getByRole("button", { name: "บันทึกรายการ (สาธิต)" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
  await page.getByLabel("ชื่อรายการ").fill("แบบร่างยังไม่บันทึก");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toContainText(
    "มีการแก้ไขที่ยังไม่บันทึก",
  );
  await page.getByRole("button", { name: "ยกเลิกแบบร่าง" }).click();
  await page
    .getByRole("link", { name: "กำหนดภาระรายห้อง", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /ม\.2\/2.*ฉบับร่าง/ }).click();
  await page.locator("#amount-SPT-111").fill("3600.00");
  await page
    .getByRole("button", { name: "บันทึกฉบับร่าง", exact: true })
    .click();
  await expect(page.getByText("เวอร์ชัน 2", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "ตรวจสอบก่อนเผยแพร่" }).click();
  await page.getByRole("button", { name: "เผยแพร่เวอร์ชัน (สาธิต)" }).click();
  await expect(page.locator(".assignment-item.selected")).toContainText(
    "เผยแพร่แล้ว",
  );
  await expect(
    page.getByText("ยังไม่เปิดสร้างภาระสำหรับห้องใหม่", { exact: false }),
  ).toBeVisible();
});
test("read errors and executive role deny writes", async ({ page }) => {
  await page.goto("/app/finance/payments");
  await page.getByRole("button", { name: "สาธิต", exact: true }).click();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("read-error");
  await expect(
    page.getByRole("heading", { name: "ไม่สามารถโหลดข้อมูลได้" }),
  ).toBeVisible();
  await page.getByLabel("สถานการณ์จำลอง").selectOption("baseline");
  await page.getByLabel("บทบาทจำลอง").selectOption("executive");
  await expect(
    page.getByRole("heading", { name: "หน้านี้สำหรับผู้มีสิทธิ์รับชำระ" }),
  ).toBeVisible();
});
test("desktop and mobile visual inspection artifacts, accessibility and overflow", async ({
  page,
}) => {
  test.setTimeout(60000);
  mkdirSync("artifacts/screenshots", { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const [name, path] of [
      ["student", "/student"],
      ["finance", "/app/finance/payments"],
      ["ledger", "/app/receipts/books"],
      ["assignments", "/app/assignments"],
      ["fees", "/app/fees"],
    ] as const) {
      if (name === "student") await loginStudent(page);
      else await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(
        page.getByText("กำลังโหลดข้อมูล", { exact: true }),
      ).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `artifacts/screenshots/${name}-${width}.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test("draft navigation keeps edits and invalid amounts never show a partial total", async ({
  page,
}) => {
  await page.goto("/app/finance/payments");
  await selectReference(page);
  await page.getByRole("link", { name: "เล่มใบเสร็จ", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "มีการแก้ไขที่ยังไม่บันทึก",
  );
  await page.getByRole("button", { name: "อยู่หน้านี้" }).click();
  await expect(page.locator("#receipt-page")).toHaveValue("page-379-13");
  await page
    .getByRole("link", { name: "กำหนดภาระรายห้อง", exact: true })
    .click();
  await page.getByRole("button", { name: "ออกโดยไม่บันทึก" }).click();
  await page.getByRole("button", { name: /ม\.2\/2.*ฉบับร่าง/ }).click();
  await page.locator("#amount-SPT-111").fill("not-money");
  await expect(page.locator(".assignment-summary")).toContainText(
    "ตรวจสอบอัตรา",
  );
  await expect(page.locator("#assignment-room")).toBeDisabled();
  await page
    .getByRole("button", { name: "บันทึกฉบับร่าง", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "ยกเลิกการแก้ไข" }).click();
  await expect(page.locator("#assignment-room")).toBeEnabled();
  await expect(page.locator(".assignment-summary")).toContainText("4,500.00");
});

test("320px, tablet and narrow desktop layouts fit without page overflow", async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/student",
      "/app/finance/payments",
      "/app/receipts/books",
      "/app/assignments",
      "/app/fees",
    ]) {
      if (path === "/student") await loginStudent(page);
      else await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}px`,
      ).toBe(true);
    }
  }
});
