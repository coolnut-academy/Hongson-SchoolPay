import { readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

// Review artifacts only: no application data, adapter or authentication changes.
const folder = process.argv[2] || "artifacts/fintech/screens";
const files = readdirSync(folder).filter(f => f.endsWith(".png") && !f.startsWith("contact-"));
const primary = files.filter(f => /^(admin-|entry-|student(?:-|\.)|access-|forbidden-|not-a-|receipt-detail)/.test(f));
const card = file => `<a href="${file}" target="_blank"><img src="${file}" loading="eager" alt="${file.replace('.png', '')}"><span>${file.replace('.png', '')}</span></a>`;
const base = `<!doctype html><html lang="en"><meta charset="utf-8"><title>SchoolPay · Visual review</title><style>
*{box-sizing:border-box}body{margin:0;padding:32px;background:#f5f7fa;color:#16283e;font:14px/1.6 system-ui}h1{font-size:24px;margin:0}p{color:#4f6177}section{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}a{display:block;border:1px solid #dfe5ed;border-radius:8px;overflow:hidden;background:white;text-decoration:none;color:inherit}img{display:block;width:100%;height:250px;object-fit:cover;object-position:top;border-bottom:1px solid #dfe5ed}span{display:block;font-size:11px;padding:10px;overflow-wrap:anywhere}.mobile img{height:410px;object-fit:contain;object-position:top;background:#e8edf3}@media(max-width:800px){section{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style><h1>Hongson-SchoolPay · Fintech workspace</h1><p>Rendered in Chromium · 1440px / 1024px / 768px / 390px · Existing empty review mode, no school financial records. Click any image to inspect the full page.</p>`;
writeFileSync(`${folder}/index.html`, base + `<h2>Desktop</h2><section>${primary.filter(f => f.endsWith('-1440.png')).map(card).join('')}</section><h2>Mobile</h2><section class="mobile">${primary.filter(f => f.endsWith('-390.png')).map(card).join('')}</section><h2>Role and interaction coverage</h2><section>${files.filter(f => !primary.includes(f)).map(card).join('')}</section></html>`);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  for (const [name, width] of [["desktop", 1440], ["mobile", 390]]) {
    const selected = primary.filter(f => f.endsWith(`-${width}.png`));
    writeFileSync(`${folder}/contact-${name}.html`, base + `<section class="${name}">${selected.map(card).join('')}</section></html>`);
    await page.goto(pathToFileURL(resolve(`${folder}/contact-${name}.html`)).href);
    await page.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode())); });
    await page.screenshot({ path: `${folder}/contact-${name}.png`, fullPage: true });
  }
} finally { await browser.close(); }
console.log(`Created review gallery for ${files.length} screenshots.`);
