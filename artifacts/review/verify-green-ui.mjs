import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser = await chromium.launch();
try {
 const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } }); const page = await context.newPage();
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');
 await page.getByTestId('entry-page').waitFor();
 await page.evaluate(() => document.fonts.ready);
 await page.screenshot({path:'artifacts/review/green-entry-desktop.png',fullPage:true});
 for (const width of [320,390,768,1024,1440,1824]) {
  await page.setViewportSize({width,height:1050});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `entry ${width}`).toBe(true);
 }
 await page.getByTestId('test-admin').click();
 await page.getByTestId('staff-dashboard').waitFor();
 const routes = await page.locator('.sidebar nav a').evaluateAll(links => links.map(a => a.getAttribute('href')));
 await page.getByLabel('ค้นหาเมนู', {exact:true}).fill('รายงาน');
 await expect(page.locator('.sidebar nav a')).toHaveCount(1);
 await page.getByLabel('ค้นหาเมนู', {exact:true}).fill('not-found');
 await expect(page.getByText('ไม่พบเมนูที่ค้นหา')).toBeVisible();
 await page.getByLabel('ค้นหาเมนู', {exact:true}).fill('');
 await expect(page.locator('.sidebar nav a')).toHaveCount(routes.length);
 await page.getByRole('button',{name:'คงค้าง',exact:true}).click();
 await expect(page.getByRole('button',{name:'คงค้าง',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'วิธีใช้งาน',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 for (const width of [320,390,768,1024,1440,1824]) {
  await page.setViewportSize({width,height:1050});
  for (const route of routes) {
   await page.evaluate(route => { history.pushState({},'',route); window.dispatchEvent(new PopStateEvent('popstate')); },route);
   await expect(page.locator('main')).not.toBeEmpty(); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`${route} at ${width}`).toBe(true);
  }
 }
 await page.evaluate(() => { history.pushState({},'','/app/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); });
 await page.getByTestId('staff-dashboard').waitFor();
 for (const width of [390,1440,1824]) {
  await page.setViewportSize({width,height:1050});
  const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),`dashboard accessibility ${width}`).toEqual([]);
  await page.screenshot({path:`artifacts/review/green-dashboard-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'เปิดเมนู'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('dialog').getByRole('link',{name:'รายการเงิน',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(errors).toEqual([]);
 console.log(`Verified ${routes.length} staff routes at 6 widths, dashboard accessibility, search, tabs, help and mobile navigation.`);
} finally { await browser.close(); }


