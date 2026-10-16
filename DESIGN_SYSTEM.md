# Hongson-SchoolPay — Design system

Revision: 2026-10-16 · UI refresh v3 · Thai-first · White / Forest green · User reference dashboard.

Read [ARCHITECTURE_RISKS.md](ARCHITECTURE_RISKS.md) first. Confirmed audited rules outrank visual decisions. This document fixes visual choices for implementation; it does not authorize live integration or changes to school policy.

## 1. Visual direction

The Figma executive reference (MhOCb1uTqbFo9156LT5aCu, node 2:2) informs the visual direction: navy navigation, cool gray canvas, white surfaces with fine borders, and emerald primary actions. Retain the HS monogram and Hongson-SchoolPay wordmark. Four compact financial cards show total obligations, paid, outstanding and collection percentage, using the existing calculations. Scope counts remain visible below the cards. Analytical content and role-specific shortcuts share a responsive workspace. The entry page pairs a navy introduction with student lookup and a separate staff workspace. Every route uses the tokens and shared visual layer in src/styles/refresh.css. Unavailable values remain em dashes with explicit empty states. No financial fixtures or decorative chart values are introduced. Existing role restrictions and integration boundaries remain unchanged.

Staff screens prioritize scanning, number alignment and keyboard flow. Student screens prioritize one clear balance, readable line items and private read-only access. Share tokens, components, terminology and financial states across roles. Do not use a different dashboard theme for each role.

## 2. Exact tokens

Define these once in `src/styles/tokens.css`; component styles reference variables. Light theme only in v1. No component-specific hex values.

```css
:root {
  --canvas: #f5f7fa;
  --surface: #ffffff;
  --surface-subtle: #eef2f6;
  --silver: #c9d3df;
  --border: #dfe5ed;
  --control-border: #8796a9;
  --text: #16283e;
  --text-secondary: #4f6177;
  --text-muted: #617187;
  --brand: #087b5b;
  --brand-hover: #066449;
  --brand-pressed: #05523c;
  --brand-subtle: #e9f5ef;
  --sidebar: #10243a;
  --sidebar-active: #213d52;
  --on-dark: #ffffff;
  --on-dark-muted: #bccddd;
  --success: #176342;
  --success-bg: #eaf6ee;
  --warning: #795b26;
  --warning-bg: #f8f2e6;
  --danger: #a13e38;
  --danger-bg: #fbefec;
  --info: #37577a;
  --info-bg: #edf3fa;
  --focus: #087b5b;
  --overlay: rgb(10 26 44 / 48%);
  --shadow-card: 0 2px 5px rgb(16 36 58 / 2%);
  --shadow-overlay: 0 24px 80px -16px rgb(16 36 58 / 28%);
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-dialog: 16px;
  --brand-gradient: linear-gradient(135deg, #10243a, #1b4651);
  --chart-fill: #a8d9c6;
  --frame: #e8edf3;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --sidebar-width: 248px;
  --header-height: 68px;
}
```

The decorative silver border is not sufficient alone to identify a form field: controls use `--control-border`. Dark text on white/subtle surfaces and white on brand surfaces are approved combinations. Status foreground/background pairs are fixed as above. Never put white text on pale status backgrounds. Green and red always accompany words and icons; red is reserved for VOID, errors and destructive actions, not every unpaid student.

## 3. Typography and number formatting

Web font: self-host IBM Plex Sans Thai (Thai/Latin WOFF2 only), weights 400/500/600/700, with license included; fallback `Tahoma, system-ui, sans-serif`. Use the same family for Thai/Latin text to avoid mixed baselines. Preserve Thai marks with generous line-height; no uppercase transformation of Thai labels. Official document fonts/layout are owned by the future real template, not this web typography.

| Token | Size / line height / weight | Use |
|---|---|---|
| display-money | 36 / 48 / 700 | Student hero balance; never a whole dashboard of giant figures |
| metric | 28 / 40 / 600 | Staff KPI values |
| page-title | 28 / 40 / 600 | Desktop H1 |
| mobile-title | 24 / 36 / 600 | Mobile H1 |
| section-title | 18 / 28 / 600 | Card title, H2 |
| body | 16 / 26 / 400 | Forms, student text, explanatory copy |
| table | 14 / 22 / 400 | Desktop table body; 500 for names/row totals |
| label | 14 / 22 / 500 | Field labels and navigation |
| caption | 12 / 20 / 400 | As-of time, provenance, helper metadata only |
| button | 14 / 22 / 600 | Buttons, including Thai text |

Use `font-variant-numeric: tabular-nums lining-nums` on money, counts and book/page identifiers. Money is right-aligned; labels and names left-aligned. Format THB with two decimals: `฿1,500.00` in KPIs; `1,500.00` under a `จำนวนเงิน (บาท)` table heading. Never abbreviate money to K/M in accounting tables. Negative adjustments use a real minus sign plus an explicit adjustment label; no red-only semantics.

Store money as integer satang in the domain. Store instants as UTC ISO strings; show dates in `Asia/Bangkok`. UI uses Arabic digits, Thai month names and Buddhist calendar years: `16 ต.ค. 2569 · 09:30 น.` Academic year and fiscal year always have separate labels. Academic year is supplied by configuration, never guessed from today. Browser locale must not change financial formatting. Mock clock is `2026-10-16T09:30:00+07:00`.

## 4. Layout rules

| Width | Staff shell | Student shell | Content |
|---|---|---|---|
| 320–767px | 68px topbar, labelled menu button, modal navigation drawer | 72px wordmark header; bottom navigation plus safe area | 16px side padding, single column, 16px vertical gaps |
| 768–1199px | 76px rail with labelled tooltips and accessible full names; 68px topbar | Centered content, top navigation | 24px padding; finance blocks stack; filters wrap |
| ≥1200px | Fixed 248px navy sidebar; 68px topbar; content beside sidebar | Centered content max 960px, top navigation | 28px horizontal padding; 16?20px dashboard gaps |

At 1440px: sidebar x=0..247, content begins at x=276. Content is capped at 1504px on wider screens without a decorative outer frame. The sidebar has an 80px brand block, role-filtered menu search, independently scrolling menu and pinned account controls. Mobile uses a focus-trapped navigation drawer with 44px links. The topbar provides breadcrumbs, help and staff identity.

Dashboard KPIs use four columns with 16px gaps and 18px padding on desktop; two columns on tablet and mobile (10px gaps on mobile), one below 360px. General metrics use 18?20px padding; panels use 20px desktop / 18px mobile. Thai headings use at least 1.5?1.65 line height. Never clip numeric values; allow large amounts to wrap within their card.

Finance split: available width ≥1056px yields `minmax(0, 1fr) 344px` with 24px gap; otherwise one column, summary after fields. No horizontal page scrolling at 320px. Wide audit/report tables may scroll inside a labelled region with visible scroll affordance; student data and payment forms must reflow.

## 5. Controls and interaction anatomy

| Element | Locked specification |
|---|---|
| Primary button | Solid emerald, white text, 44px minimum height, 16px horizontal padding, 8px radius; one per task region |
| Secondary button | White fill, subtle border, text color; same geometry |
| Tertiary/link action | Brand text, underline for inline links; 44px hit area for standalone actions |
| Destructive button | Danger fill only inside explicit reason/confirmation flow |
| Input/select | 44px minimum height; 16px input text; 12px horizontal padding; label above; helper/error below |
| Textarea | Minimum 104px, vertical resize; Thai text wrapping; visible character count near limit |
| Checkbox/radio | Native semantic input, 20px visual, 44×44px label hit area |
| Badge | 28px minimum visual height, 8px horizontal padding, icon 14px + text; not a button |
| Icon | Shared 20px outline icons, 1.75–2px stroke; use one icon library/system; decorative icons aria-hidden |
| Table | 44px header, minimum 56px rows, 16px horizontal cells; amount columns aligned; full names wrap |
| Detail drawer | 540px desktop, max 100vw; full-screen mobile; fixed header and scrolling body; no nested drawer |
| Confirm dialog | 560px desktop max, `calc(100vw - 32px)` mobile; header/footer do not shrink; body scrolls independently |
| Document preview | 800px desktop max; same viewport bounds; metric columns respond to the content container width |
| Toast | Bottom right desktop, above bottom navigation mobile; never the only record of a financial result |
| Skeleton | Match final geometry; no fake numeric data while loading |

Buttons have hover/pressed/focus/disabled/submitting states. Disabled controls expose a nearby reason, not just low opacity. Focus uses 3px `--focus` outline plus 2px white offset; on dark surfaces use white ring. Do not remove outlines. A submitting button says `กำลังบันทึก…`; its accessible name retains the action meaning. Click target remains stable while spinner appears.

Opening a drawer moves focus to its heading; Tab stays inside while modal; Escape closes unless an explicit irreversible request is currently unresolved, in which case offer “return to workspace” without claiming cancellation. Closing restores focus to the trigger. For confirmation dialogs focus the title/summary, not the destructive button. Dirty form exit presents `อยู่หน้านี้` / `ละทิ้งการแก้ไข`; default is stay. No hidden keyboard shortcuts that submit money. Enter submits search/forms only when appropriate; Enter in notes inserts a newline.

Dialog descriptions appear only when supplied by the caller and are linked with `aria-describedby`. Header titles wrap, close controls retain a 44px target, and the body contains overscroll. Mobile action buttons wrap without pushing the footer out of the viewport. Enter animations are short opacity/position transitions and are disabled for reduced motion.

## 6. Shared state language

| Domain | Value | Thai label | Tone / icon |
|---|---|---|---|
| Obligation | open | ยังไม่ชำระ | neutral / circle |
| Obligation | partial | ชำระบางส่วน | warning / half-circle |
| Obligation | paid | ชำระครบ | success / check-circle |
| Obligation | waived | ยกเว้นภาระชำระ | info / minus-circle |
| Obligation | voided | ยกเลิกภาระชำระ | neutral / slash |
| Page | available | ว่าง · AVAILABLE | neutral / empty square |
| Page | used | ใช้แล้ว · USED | success / check |
| Page | void | ยกเลิก · VOID | danger / slash |
| Reference | pending | รอผูกเล่ม/หน้า | warning / clock |
| Reference | linked | ผูกเล่ม/หน้าแล้ว | success / link |
| Book | in_stock / active | ในคลัง / เปิดใช้ | neutral / success |
| Book | returned / closed / damaged | คืนแล้ว / ปิดเล่ม / ชำรุด | info / neutral / danger |

Page status is independent of payment status: VOID does not imply a refunded payment. Avoid `ชำระครบ` for a student whose zero balance came only from waiver; show `ไม่มีภาระคงค้าง` with the waiver detail. No overdue badge without an authoritative due date. “Last updated” is always an as-of timestamp, never a promise of real-time accuracy.

## 7. Accessibility and responsive acceptance

Target WCAG 2.2 AA. Normal text contrast ≥4.5:1; large text ≥3:1; essential non-text controls/focus ≥3:1. Product target sizes are 44×44px, exceeding the minimum in many WCAG cases. Verify with actual rendered states rather than assuming a palette establishes conformance. Use the [W3C WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/) for the audit.

- One H1, logical H2 sections, landmarks, skip-to-content, `lang="th"`, real buttons/links/tables. Route changes focus H1 and announce page title.
- Labels are persistent, placeholders are examples only. Required fields are labelled `จำเป็น`; use `aria-invalid` and linked error text. Submit errors appear in a focusable summary with links to fields.
- Results and saves use polite live regions; blocking errors use an alert once. No continuously announcing clocks or balance updates.
- Sorting uses explicit header buttons and `aria-sort`; no click-only rows. Row action names include student/book identity. Chart values have an equivalent table.
- Mobile money cards use definition lists; do not create a visual table that screen readers cannot interpret. At 200% zoom layouts reflow; at 400%/320px effective width core tasks remain usable.
- Sticky bars must not cover focused controls, validation text or last rows. Reserve bar height plus safe-area padding. Test mobile keyboard, long Thai names and translated fallback strings.
- Respect `prefers-reduced-motion`: no skeleton shimmer, count-up metrics, bouncing toasts or chart animation. Normal transitions 120ms controls / 180ms overlays; no essential animation.
- Show labels with all statuses; no green/red-only page grid. Each grid button announces book, page and status. Keyboard follows row-major native button order.

## 8. Copy, privacy and output

Primary vocabulary: `ภาระชำระ`, `รับชำระ`, `บันทึกข้อมูลใบเสร็จจริง`, `เล่ม / หน้า / เลขที่`, `รับเงินประเภทอื่น`, `บันทึกข้อความติดตามรายเดือน`. Use respectful, neutral language about unpaid balances; never shame students or rank them publicly.

Receipt detail footer: `ข้อมูลอ้างอิงใบเสร็จจริงแบบเขียนมือ ไม่มีการพิมพ์ใบเสร็จจากระบบ`. No printer/download icon in receipt detail. Authorized report/memo exports have distinct document types and screen boundaries. Generic browser printing cannot be prevented reliably; the app must never provide an official receipt layout or receipt output path. Do not claim to prevent screenshots or browser Save As.

Source label shown to ordinary users: `ข้อมูลจากทะเบียนนักเรียน · อัปเดต 16 ต.ค. 2569 09:00 น.` Staff source tooltip may name Hongson T-Academy/T-Folio. Keep Firebase, SDK, collection names and implementation jargon out of normal product flows.

The development review runtime contains no business records. It displays `โหมดตรวจหน้าจอ · ยังไม่เชื่อมข้อมูลโรงเรียน · ไม่สามารถบันทึกรายการ`. Production has no review IDs. Never add synthetic financial records to fill a visual design.

## 9. Visual QA contract

The user reference and v3 rules above supersede the previous visual geometry in [SCREEN_SPEC.md](SCREEN_SPEC.md); its business workflows remain applicable. Capture with fonts loaded. Verify 320px, 390px, 768px, 1024px, 1440px and 1824px widths. Screens may grow vertically for Thai and long text. Reference captures are in `artifacts/review/green-entry-desktop.png` and `artifacts/review/green-dashboard-{390,1440,1824}.png`.

Validation for this refresh: all 16 staff navigation routes fit all six widths without document-level horizontal overflow; dashboard passes automated WCAG A/AA checks at 390px, 1440px and 1824px. Search, chart tabs, help dialog and mobile drawer were exercised. Existing integration, permissions, unit and browser checks remain required. Live-data behavior still depends on the school integration.

The additional dashboard and shared responsive styling uses 59.5 KiB raw / 12.3 KiB gzip CSS. V3 has bounded budgets of 64 KiB raw and 14 KiB gzip in `scripts/check-static.mjs`; JavaScript and font budgets remain unchanged.
