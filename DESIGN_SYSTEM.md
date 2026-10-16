# Hongson-SchoolPay — Design system

Revision: 2026-10-16 · UI baseline v1 · Thai-first · White / Green / Silver.

Read [ARCHITECTURE_RISKS.md](ARCHITECTURE_RISKS.md) first. Confirmed audited rules outrank visual decisions. This document fixes visual choices for implementation; it does not authorize live integration or changes to school policy.

## 1. Visual direction

An academic finance office: white working surfaces, forest-green navigation and primary actions, cool silver structure, generous but purposeful spacing. Financial figures lead; decoration stays quiet. The only dark surface is the staff sidebar and the student outstanding-balance panel. Use crisp borders, restrained corner radii and flat charts. No stock photography, glass effects, gradient backgrounds, decorative currency icons, oversized hero area or invented school crest. Until an approved crest is supplied, use a 32px square `HS` typographic monogram and the exact product wordmark `Hongson-SchoolPay`.

Staff screens prioritize scanning, number alignment and keyboard flow. Student screens prioritize one clear balance, readable line items and private read-only access. Share tokens, components, terminology and financial states across roles. Do not use a different dashboard theme for each role.

## 2. Exact tokens

Define these once in `src/styles/tokens.css`; component styles reference variables. Light theme only in v1. No component-specific hex values.

```css
:root {
  --canvas: #F4F6F5;
  --surface: #FFFFFF;
  --surface-subtle: #EEF2F0;
  --silver: #D7DEDA;
  --border: #D7DEDA;
  --control-border: #76877E;
  --text: #182C23;
  --text-secondary: #52645B;
  --text-muted: #617268;
  --brand: #14633F;
  --brand-hover: #104F32;
  --brand-pressed: #0C3E27;
  --brand-subtle: #E8F3EC;
  --sidebar: #103E2B;
  --sidebar-active: #21573F;
  --on-dark: #FFFFFF;
  --on-dark-muted: #C5D9CE;
  --success: #14633F;
  --success-bg: #E8F3EC;
  --warning: #805400;
  --warning-bg: #FFF4D6;
  --danger: #A52A32;
  --danger-bg: #FDECEF;
  --info: #245A78;
  --info-bg: #EAF2F8;
  --focus: #245A78;
  --overlay: rgb(16 38 27 / 40%);
  --shadow-card: 0 1px 2px rgb(16 38 27 / 4%);
  --shadow-overlay: 0 16px 48px rgb(16 38 27 / 16%);
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-dialog: 16px;
  --radius-pill: 999px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --z-sticky: 10;
  --z-nav: 20;
  --z-overlay: 40;
  --z-dialog: 50;
  --z-toast: 60;
}
```

The decorative silver border is not sufficient alone to identify a form field: controls use `--control-border`. Dark text on white/subtle surfaces and white on brand surfaces are approved combinations. Status foreground/background pairs are fixed as above. Never put white text on pale status backgrounds. Green and red always accompany words and icons; red is reserved for VOID, errors and destructive actions, not every unpaid student.

## 3. Typography and number formatting

Web font: self-host Noto Sans Thai, weights 400/500/600/700, with license included; fallback `Tahoma, system-ui, sans-serif`. Use the same family for Thai/Latin text to avoid mixed baselines. Preserve Thai marks with generous line-height; no uppercase transformation of Thai labels. Official document fonts/layout are owned by the future real template, not this web typography.

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
| 320–767px | 56px topbar, labelled menu button, modal navigation drawer | 56px wordmark header; 64px bottom navigation plus safe area | 16px side padding, single column, 16px vertical gaps |
| 768–1199px | 72px rail with labelled tooltips and accessible full names; 64px topbar | Centered content max 720px, top navigation | 24px padding; finance blocks stack; filters wrap |
| ≥1200px | Fixed 240px sidebar; 72px topbar; content beside sidebar | Centered content max 960px, top navigation | 32px padding, max 1440px working width; 24px gaps |

At 1440px staff viewport: sidebar x=0..239; main x=240..1439; inner content x=272..1407 (1136px). At 1600px and above retain maximum content width; do not stretch form controls indefinitely. Staff sidebar has 72px brand block, role badge, nav groups, and bottom staff identity/sign-out. Topbar contains breadcrumb on left, current period/context and account control on right. Never put a global student search into unrelated roles.

Desktop staff KPI strip: four equal columns, 16px gaps, minimum height 112px, 20px padding. Three metrics use three equal columns. Below 1200px two columns; below 480px one column unless a screen explicitly specifies a compact two-metric pair. Form panels use 24px padding desktop, 16px mobile. Card title precedes content by 16px. Section spacing 24px desktop / 16px mobile.

Finance split: available width ≥1056px yields `minmax(0, 1fr) 344px` with 24px gap; otherwise one column, summary after fields. No horizontal page scrolling at 320px. Wide audit/report tables may scroll inside a labelled region with visible scroll affordance; student data and payment forms must reflow.

## 5. Controls and interaction anatomy

| Element | Locked specification |
|---|---|
| Primary button | Brand fill, white text, 44px minimum height, 16px horizontal padding, 8px radius; one per task region |
| Secondary button | White fill, control-border outline, text color; same geometry |
| Tertiary/link action | Brand text, underline for inline links; 44px hit area for standalone actions |
| Destructive button | Danger fill only inside explicit reason/confirmation flow |
| Input/select | 44px minimum height; 16px input text; 12px horizontal padding; label above; helper/error below |
| Textarea | Minimum 104px, vertical resize; Thai text wrapping; visible character count near limit |
| Checkbox/radio | Native semantic input, 20px visual, 44×44px label hit area |
| Badge | 28px minimum visual height, 8px horizontal padding, icon 14px + text; not a button |
| Icon | Shared 20px outline icons, 1.75–2px stroke; use one icon library/system; decorative icons aria-hidden |
| Table | 44px header, minimum 56px rows, 16px horizontal cells; amount columns aligned; full names wrap |
| Detail drawer | 480px desktop, max 100vw; full-screen mobile; heading, close button, scroll body; no nested drawer |
| Confirm dialog | 520px desktop max, `calc(100vw - 32px)` mobile; bounded height and scrolling body |
| Toast | Bottom right desktop, above bottom navigation mobile; never the only record of a financial result |
| Skeleton | Match final geometry; no fake numeric data while loading |

Buttons have hover/pressed/focus/disabled/submitting states. Disabled controls expose a nearby reason, not just low opacity. Focus uses 3px `--focus` outline plus 2px white offset; on dark surfaces use white ring. Do not remove outlines. A submitting button says `กำลังบันทึก…`; its accessible name retains the action meaning. Click target remains stable while spinner appears.

Opening a drawer moves focus to its heading; Tab stays inside while modal; Escape closes unless an explicit irreversible request is currently unresolved, in which case offer “return to workspace” without claiming cancellation. Closing restores focus to the trigger. For confirmation dialogs focus the title/summary, not the destructive button. Dirty form exit presents `อยู่หน้านี้` / `ละทิ้งการแก้ไข`; default is stay. No hidden keyboard shortcuts that submit money. Enter submits search/forms only when appropriate; Enter in notes inserts a newline.

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

Demo banner on every mock page: `ข้อมูลสาธิต · ไม่ใช่รายการเงินจริง`. Never put synthetic records in a live-looking success screen without this banner.

## 9. Visual QA contract

Golden viewport baselines and content are fixed in [SCREEN_SPEC.md](SCREEN_SPEC.md). Capture at 390×844 and 1440×1000 with the mock clock frozen, fonts loaded and animations off. Add 320px, 768px, 1024px and 200% zoom checks. Validate normal, loading, empty, error, denied, stale and conflict states. Compare geometry, typography, exact amounts and copy; do not accept a “similar” redesign. Screens may grow vertically for translated/long text; specified heights are minimums except shell dimensions.
