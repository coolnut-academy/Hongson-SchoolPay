import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("entry validates IDs and student screens show no fabricated balance or document", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("student-login").click();
  await expect(page.getByText("กรุณากรอกรหัสนักเรียน", { exact: true })).toBeVisible();
  await page.getByTestId("student-id-input").fill("69024");
  await page.getByTestId("student-login").click();
  await expect(page.getByText(/ไม่พบข้อมูลที่แสดงได้/)).toBeVisible();
  await page.getByTestId("student-id-input").fill("TEST-STUDENT");
  await page.getByTestId("student-login").click();
  await expect(page.getByRole("heading", { name: "ยังไม่มีข้อมูลนักเรียน" })).toBeVisible();
  await expect(page.getByTestId("student-balances")).not.toContainText("฿");
  await page.getByRole("link", { name: "ประวัติ", exact: true }).click();
  await expect(page.getByText("ยังไม่มีประวัติการชำระ", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "เอกสาร", exact: true }).click();
  await expect(page.getByText("ยังไม่มีเอกสารเผยแพร่", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /ดาวน์โหลด/ })).toHaveCount(0);
  await page.getByRole("link", { name: /เปลี่ยนรหัส/ }).click();
  await page.goBack();
  await expect(page.getByTestId("entry-page")).toBeVisible();
});

for (const [id, heading] of [
  ["test-admin", "ภาพรวมผู้ดูแลระบบ"], ["test-finance", "ภาพรวมงานการเงิน"],
  ["test-teacher", "ภาพรวมครูที่ปรึกษา"], ["test-finance-teacher", "ภาพรวมงานการเงิน"],
  ["test-executive", "ภาพรวมการจัดเก็บ"],
]) test(`${id} opens its dashboard and logout removes access`, async ({ page }) => {
  await page.goto("/");
  await page.getByTestId(id).click();
  await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  await expect(page.getByTestId("staff-dashboard")).not.toContainText("฿");
  if (id === "test-admin") {
    await page.locator("main").getByRole("link", { name: /ผู้ใช้งานและสิทธิ์/ }).click();
    await expect(page.getByRole("heading", { name: "ยังไม่มีข้อมูลบุคลากร" })).toBeVisible();
    await page.getByLabel("ค้นหาชื่อ").fill("ไม่พบชื่อ");
    await page.getByRole("button", { name: "ค้นหา", exact: true }).click();
    await expect(page.getByRole("heading", { name: "ยังไม่มีข้อมูลบุคลากร" })).toBeVisible();
  }
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(page.getByTestId("entry-page")).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("entry-page")).toBeVisible();
});

test("direct routes and invalid staff IDs cannot grant access", async ({ page }) => {
  for (const route of ["/app/admin/users", "/app/dashboard", "/student/history"]) {
    await page.goto(route);
    await expect(page.getByTestId("entry-page")).toBeVisible();
  }
  await page.getByTestId("staff-id-input").fill("__proto__");
  await page.getByTestId("staff-login").click();
  await expect(page.getByText(/Test ID ไม่ถูกต้อง/)).toBeVisible();
  await page.getByTestId("test-teacher").click();
  await page.getByRole("heading", { name: "ภาพรวมครูที่ปรึกษา" }).waitFor();
  await page.evaluate(() => { window.history.pushState({}, "", "/app/admin/users"); window.dispatchEvent(new PopStateEvent("popstate")); });
  await expect(page.getByText("พื้นที่นี้สำหรับงานการเงิน", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("entry-page")).toBeVisible();
});

test("all staff navigation renders without runtime errors or seeded records", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.getByTestId("test-admin").click();
  await page.getByTestId("staff-dashboard").waitFor();
  const routes = await page.locator(".sidebar nav a").evaluateAll(links => links.map(a => a.getAttribute("href")!));
  for (const route of routes) {
    await page.locator(`.sidebar nav a[href="${route}"]`).click();
    await expect(page.locator("main")).not.toBeEmpty();
    await expect(page.locator("main")).not.toContainText(/69024|30ก58379|พิมพ์ชนก|ข้อมูลสาธิต|\?{3}/);
  }
  expect(errors).toEqual([]);
});

test("priority screens fit mobile and pass accessibility checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const screen of ["entry", "student", "admin"]) {
    if (screen === "student") {
      await page.getByTestId("student-id-input").fill("TEST-STUDENT");
      await page.getByTestId("student-login").click();
      await page.getByTestId("student-page").waitFor();
    }
    if (screen === "admin") {
      await page.getByRole("link", { name: /เปลี่ยนรหัส/ }).click();
      await page.getByTestId("test-admin").click();
      await page.getByTestId("staff-dashboard").waitFor();
      await page.locator("main").getByRole("link", { name: /ผู้ใช้งานและสิทธิ์/ }).click();
      await page.getByRole("heading", { name: "ยังไม่มีข้อมูลบุคลากร" }).waitFor();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `artifacts/review/${screen}-mobile.png`, fullPage: true });
  }
});
