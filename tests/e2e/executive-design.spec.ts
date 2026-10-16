import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Uses the existing development-only empty review accounts. No financial fixtures.
async function capture(page: Page, name: string) {
  await page.locator("main").waitFor();
  await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  // Full-page captures must start at the top so Chromium does not paint fixed
  // offscreen skip links into the stitched image after clicking bottom navigation.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator("main h1")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('400 14px "IBM Plex Sans Thai"', 'การชำระเงิน'))).toBe(true);
  // Detect clipped text in bounded controls and headings, not intentional scroll regions.
  const clipped = await page.locator("h1, h2, h3, .btn, .badge, .nav-item, .overview-value").evaluateAll(nodes => nodes.flatMap(node => {
    const e = node as HTMLElement, r = e.getBoundingClientRect();
    return r.width && r.height && (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2)
      ? [{ text: e.textContent, width: e.clientWidth, scroll: e.scrollWidth }] : [];
  }));
  expect(clipped).toEqual([]);
  await page.screenshot({ path: `artifacts/fintech/screens/${name}.png`, fullPage: true, animations: "disabled" });
}

for (const width of [1440, 390]) {
  for (const role of ["admin", "finance", "finance-teacher", "teacher", "executive"]) {
    test(`${role} authorized routes at ${width}px`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      await page.getByTestId(`test-${role}`).click();
      await page.getByTestId("staff-dashboard").waitFor();
      const routes = await page.locator(".sidebar nav a").evaluateAll(links => links.map(a => a.getAttribute("href")!));
      for (const route of routes) {
        if (width === 390) {
          await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
          await page.locator(`.drawer-content nav a[href="${route}"]`).click();
          await expect(page.getByRole("dialog")).toHaveCount(0);
        } else {
          await page.locator(`.sidebar nav a[href="${route}"]`).click();
        }
        await expect(page).toHaveURL(new RegExp(`${route}$`));
        await capture(page, `${role}-${route.slice(5).replaceAll("/", "-")}-${width}`);
        if (role === "admin" || route === "/app/dashboard") {
          const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
          expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
        }
      }
      expect(errors).toEqual([]);
    });
  }
  test(`entry and student portal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    await capture(page, `entry-${width}`);
    await page.getByTestId("student-id-input").fill("TEST-STUDENT");
    await page.getByTestId("student-login").click();
    await page.getByTestId("student-page").waitFor();
    for (const route of ["/student", "/student/history", "/student/documents"]) {
      await page.locator(`.student-nav a[href="${route}"]`).click();
      await capture(page, `${route.slice(1).replaceAll("/", "-")}-${width}`);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
    }
  });
  test(`route status and receipt detail at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of ["/access-pending", "/forbidden", "/not-a-route"]) {
      await page.goto(route);
      await capture(page, `${route.slice(1)}-${width}`);
    }
    await page.goto("/");
    await page.getByTestId("test-admin").click();
    await page.getByTestId("staff-dashboard").waitFor();
    // Reach the existing parameterized route without creating any school record.
    await page.evaluate(() => { history.pushState({}, "", "/app/receipts/books/unavailable"); dispatchEvent(new PopStateEvent("popstate")); });
    await capture(page, `receipt-detail-empty-${width}`);
  });
}

test("sidebar scrolling, search, keyboard dialog and tablet layout", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("test-admin").click();
  await page.getByTestId("staff-dashboard").waitFor();
  await page.setViewportSize({ width: 1440, height: 760 });
  await page.locator('.sidebar nav a[href="/app/audit"]').click();
  await expect(page.getByRole("button", { name: "ออกจากระบบ", exact: true })).toBeInViewport();
  await page.getByLabel("ค้นหาเมนู").fill("รายงาน");
  await expect(page.locator(".sidebar nav a")).toHaveCount(1);
  await page.getByLabel("ค้นหาเมนู").fill("เมนูที่ไม่มี");
  await expect(page.getByText("ไม่พบเมนูที่ค้นหา")).toBeVisible();
  await page.getByLabel("ค้นหาเมนู").fill("");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await page.locator('.drawer-content nav a[href="/app/dashboard"]').click();
  await capture(page, "tablet-768");
  await page.getByRole("button", { name: "วิธีใช้งาน", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "วิธีใช้งาน", exact: true })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "artifacts/fintech/screens/mobile-navigation-390.png", animations: "disabled" });
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "เปิดเมนู", exact: true })).toBeFocused();
});

for (const width of [768, 1024]) {
  test(`tablet menu and all admin routes at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/");
    await page.getByTestId("test-admin").click();
    await page.getByTestId("staff-dashboard").waitFor();
    const routes = await page.locator(".sidebar nav a").evaluateAll(links => links.map(a => a.getAttribute("href")!));
    await expect(page.locator(".sidebar")).toBeHidden();
    for (const route of routes) {
      await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const target = page.locator(`.drawer-content nav a[href="${route}"]`);
      await expect(target.locator("span")).toBeVisible();
      await target.click();
      await capture(page, `admin-${route.slice(5).replaceAll("/", "-")}-${width}`);
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  });
}

test("compact sidebar, mobile dock, advanced filters and reduced motion", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("test-admin").click();
  await page.getByTestId("staff-dashboard").waitFor();
  await page.getByRole("button", { name: "ย่อแถบเมนู", exact: true }).click();
  await expect(page.getByRole("button", { name: "ขยายแถบเมนู", exact: true })).toHaveAttribute("aria-expanded", "false");
  expect(await page.locator(".sidebar").evaluate(e => e.getBoundingClientRect().width)).toBe(76);
  await capture(page, "sidebar-collapsed-1440");
  await page.locator('.sidebar nav a[href="/app/audit"]').click();
  await page.locator(".advanced-filters summary").focus();
  await page.keyboard.press("Space");
  await page.getByLabel("รหัสผู้ดำเนินการ", { exact: true }).fill("TEST-ADMIN");
  await page.getByRole("button", { name: "ค้นหา", exact: true }).click();
  await expect(page.locator(".advanced-filters summary")).toContainText("ระบุแล้ว 1 ตัวกรอง");
  await capture(page, "audit-expanded-1440");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.staff-dock a[href="/app/dashboard"]').click();
  await expect(page.locator('.staff-dock a[href="/app/dashboard"]')).toHaveAttribute("aria-current", "page");
  expect(await page.locator(".dashboard-page").evaluate(e => getComputedStyle(e).animationName)).toBe("none");
  await page.locator('.staff-dock a[href="/app/homeroom"]').click();
  await expect(page).toHaveURL(/\/app\/homeroom$/);
  await page.getByRole("button", { name: "เปิดเมนูทั้งหมด", exact: true }).click();
  await page.getByLabel("ค้นหาในเมนูทั้งหมด").fill("รายงาน");
  await expect(page.locator(".drawer-content nav a")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "เปิดเมนูทั้งหมด", exact: true })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator(".staff-dock")).toBeInViewport();
  await capture(page, "mobile-dock-390");
});
