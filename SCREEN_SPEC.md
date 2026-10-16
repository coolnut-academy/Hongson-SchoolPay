# Hongson-SchoolPay — Screen specification and golden screens

Revision: 2026-10-16 · v1 · Specification deliverable (no rendered application claimed).

These four golden screens are specified at high fidelity: exact content, component composition, geometry, tokens, interaction, responsive changes and acceptance states. Implement them literally with [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [UI_CONTRACT.md](UI_CONTRACT.md). No design choices are delegated to the coding model. All names, codes, prices and transactions below are synthetic; they are not official school rates or real people. Amounts shown in baht convert to integer satang in fixtures.

Coordinates describe reference viewport composition, not absolute positioning instructions. Use normal CSS flow/grid and minimum heights; wrapped Thai text can increase height and push later sections downward. Capture full-page images as well as the stated viewport so content below the fold is reviewed. Never clip content or overlap panels to force a reference coordinate.

## 1. Shared fixture `baseline-v1`

Clock: `2026-10-16T09:30:00+07:00`. Academic year `2569`, term `1`, fiscal year `2570`. Previous academic year `2568`. These period selections are explicit fixture settings, not an inferred school calendar. Source directory updated `09:00`, financial snapshot `09:25`, both on October 16. Display `ข้อมูลสาธิต · ไม่ใช่รายการเงินจริง` on every screen.

### Staff and student

| Fixture ID | Display identity | Role/scope |
|---|---|---|
| `staff-finance-01` | นางสาวกมลชนก ใจดี | finance_officer; current receiver |
| `staff-finance-02` | นายธนกฤต รุ่งเรือง | finance_teacher; default restricted grants |
| `staff-homeroom-01` | นางสาวศิริพร แสงทอง | homeroom_teacher; ม.2/1 only |
| `staff-executive-01` | นายวรวิทย์ ธรรมรักษ์ | executive; read/authorized report export |
| `staff-admin-01` | นางสาวปิยาภรณ์ สุขใจ | superadmin |
| `student-001` | เด็กหญิงพิมพ์ชนก ใจมั่น · รหัส 69024 | ม.2/1 · แผนการเรียนทั่วไป · active |

### Student account (G1/G2)

| Obligation ID / fee | Original = adjusted | Paid | Outstanding | State |
|---|---:|---:|---:|---|
| `obl-001` / SPT-111 ค่าจ้างครู บุคลากรและครูต่างชาติ | 3,500.00 | 2,000.00 | 1,500.00 | partial |
| `obl-002` / SPT-118 เงินประกันอุบัติเหตุ | 300.00 | 300.00 | 0.00 | paid |
| `obl-003` / ASC-220 ค่าบำรุงสมาคมรายปี | 700.00 | 700.00 | 0.00 | paid |
| **Total, 1/2569** | **4,500.00** | **3,000.00** | **1,500.00** | partial |

All three paid amounts came from separate synthetic payments on `2026-10-10`, linked respectively to book `30ก58379`, pages 9, 10 and 11. Receiver `staff-finance-01`. IDs `pay-009`, `pay-010`, `pay-011`. This is not a recommendation that receipt groups may share physical books in production; the fixture records are synthetic and live group eligibility is G05. Do not infer such a policy from the fixture. No printed receipt numbers are invented; display `ไม่ได้ระบุ` for the optional paper number.

Previous year 2568/1: adjusted 4,000.00, paid 4,000.00, outstanding 0.00. One archived payment `pay-history-001`, 2025-06-10, reference book `27ก70110` page 21. This historical book is outside FY2570 opening stock. Historical fixture needs only read projections, not fabricated current-year stock movements.

Approved mock announcement `announcement-01`: `ประกาศการเรียกเก็บเงิน ภาคเรียนที่ 1/2569`, published `1 พ.ค. 2569`, audience ม.2, file descriptor PDF 248 KB. No source PDF exists yet: mock download returns an explicitly unavailable-document state rather than a fake successful download. It is an announcement, never a receipt.

### Physical ledger (G2 and S10–12)

| Book / holder | Status | Page membership | Used / void / available |
|---|---|---|---|
| `book-379` / 30ก58379 / กมลชนก ใจดี | active | USED 1–11; VOID 12 (`เขียนข้อมูลผิดก่อนรับเงิน`); AVAILABLE 13–50 | 11 / 1 / 38 |
| `book-380` / 30ก58380 / ธนกฤต รุ่งเรือง | active | USED 1–4; AVAILABLE 5–50 | 4 / 0 / 46 |

All USED fixture pages must have a transaction projection with type, amount, payer/source, receiver and date. Fill pages 1–8 of book-379 and 1–4 of book-380 with deterministic synthetic transactions in fixture code; do not leave dangling links. They are outside the selected student/room view and must not be summed into that student's totals. Transaction index `ledger-history-v1` is separate from the selected academic-term cohort.

For deterministic ledger seed: book-379 pages 1–8 each represent OTHER_RECEIPT, amount 1,000.00, source `ผู้สนับสนุนสาธิต 01` through `08`, category `เงินบริจาค`, date 2026-10-05, receiver staff-finance-01. Book-380 pages 1–4 each represent OTHER_RECEIPT, amount 2,000.00, source `ผู้สนับสนุนสาธิต 09` through `12`, same category/date, receiver staff-finance-02 (historical record visibility does not grant current receive permission). IDs derive from `other-379-01`…`other-380-04`; no random money or names. Book versions start `v1`, page versions `v1`.

Stock summary preserves confirmed 6 carry-forward + 80 new = 86 books. This is a source-baseline card, not a claim that the mock includes 86 individually reconciled books. Show `รายการยกมาอยู่ระหว่างตรวจสอบ` and the ambiguous `28ก83122–28ก83128` text. Only the two explicit active books are instantiated for editable golden workflows. Never fill missing opening book identities from the range.

### Homeroom snapshot (G3)

Batch `followup-2569-1-2026-10-m2-1`, snapshot `2026-10-16T09:25:00+07:00`, draft version `v1`. Room roster 40 students; 33 fully paid, 7 outstanding. Adjusted 180,000.00; paid 167,500.00; outstanding 12,500.00. Each student's adjusted total is 4,500.00 in this synthetic room. The seven below plus 33 synthetic settled students reconcile exactly. Seed settled students as `นักเรียนสาธิต 08`…`40`, codes 69108…69140, internal IDs student-008…student-040, paid 4,500.00 each; avoid inventing 33 realistic personal identities.

| Student / code | Outstanding | Reason / solution / note |
|---|---:|---|
| พิมพ์ชนก ใจมั่น / 69024 | 1,500.00 | รอรายได้ผู้ปกครอง / นัดชำระวันที่ 30 ต.ค. 2569 / ติดตามแล้ว 15 ต.ค. |
| กิตติพงษ์ วัฒนกุล / 69025 | 2,500.00 | รอรายได้ผู้ปกครอง / ขอแบ่งชำระตามการพิจารณาของการเงิน / ติดตามแล้ว 14 ต.ค. |
| ณัฐธิดา แก้วคำ / 69026 | 2,000.00 | blank / blank / ยังไม่บันทึก |
| ธนวัฒน์ อินทร์สุข / 69027 | 1,000.00 | รอผู้ปกครองยืนยัน / นัดติดตาม 20 ต.ค. / ติดตามแล้ว 15 ต.ค. |
| สุภาวดี แสนดี / 69028 | 3,000.00 | blank / blank / ยังไม่บันทึก |
| ปกรณ์ ศรีดอย / 69029 | 1,500.00 | อยู่ระหว่างประสานผู้ปกครอง / นัดติดตาม 21 ต.ค. / ติดตามแล้ว 15 ต.ค. |
| อรอุมา คำแปง / 69030 | 1,000.00 | blank / blank / ยังไม่บันทึก |

Four followed up, three missing human notes. A note requesting installments is not an approved installment schedule or permission to change balances. Do not turn notes into money mutations.

### Executive aggregate (G4)

Dataset `school-summary-v1`, academic 1/2569, as-of 09:25. It is an explicit school aggregate mock, not computed from the 40-row room fixture. Drilldown is available only where a fixture exists; other grade/room detail shows `ไม่มีรายละเอียดในชุดข้อมูลสาธิต` without fabricated results. The ม.2/1 room is a subset of grade ม.2 and its amount changes propagate to that grade on a simulated successful payment.

| Grade | Students | Fully paid | Adjusted collectible | Collected | Outstanding |
|---|---:|---:|---:|---:|---:|
| ม.1 | 200 | 180 | 900,000.00 | 810,000.00 | 90,000.00 |
| ม.2 | 200 | 178 | 850,000.00 | 765,000.00 | 85,000.00 |
| ม.3 | 200 | 176 | 800,000.00 | 720,000.00 | 80,000.00 |
| ม.4 | 200 | 175 | 950,000.00 | 855,000.00 | 95,000.00 |
| ม.5 | 200 | 174 | 900,000.00 | 810,000.00 | 90,000.00 |
| ม.6 | 200 | 167 | 1,000,000.00 | 840,000.00 | 160,000.00 |
| **Total** | **1,200** | **1,050** | **5,400,000.00** | **4,800,000.00** | **600,000.00** |

Collection rate 88.9%; 150 students have outstanding balances. Separate fiscal other-money summary FY2570 = 78,000.00 (scholarships 50,000.00, donations 16,000.00, activity support 12,000.00). The detailed ledger seed above accounts for the 16,000.00 donations only; other category totals are aggregate fixtures. Never add 78,000.00 to the student collection numerator. Monthly memo status summary: 30 room batches, 24 submitted, 6 draft. Do not infer electronic approvals from submission counts.

## 2. Golden G1 — Student/Parent current balance

Route `/student`, S01, viewport 390×844, principal visitor scoped to student-001. Read-only. Primary job: understand what remains and inspect prior payment references. There is no pay-now CTA.

### Exact visual composition

Use the student shell. White header x0 y0 w390 h56; monogram at x16 y12 size32, wordmark x60 y18; session action `เปลี่ยนรหัส` right aligned in a 44px hit area. Demo band y56 h32 uses info background and 12px text. Scroll content begins y104 with 16px gutters, width358. Bottom nav fixed y780 h64 plus safe area; reserve 88px bottom content padding. Active `ยอดชำระ` has brand icon/text and top 3px indicator; other tabs are `ประวัติ`, `เอกสาร`.

| Region | Geometry / exact content |
|---|---|
| Profile | x16 y104 w358 min-h92; eyebrow `ข้อมูลการชำระเงิน`, H1 `พิมพ์ชนก ใจมั่น` 24/36; next line `69024 · ม.2/1 · แผนการเรียนทั่วไป` |
| Period control | x16 y212 w358 h44; label `ภาคเรียน` and value `1 / 2569`; opens available periods, does not mutate records |
| Balance hero | x16 y272 w358 min-h184, sidebar green, radius12, padding20; `ยอดค้างชำระ`, `฿1,500.00` 36/48; white outlined badge `ชำระบางส่วน`; divider then two columns `ภาระทั้งหมด ฿4,500.00` / `ชำระแล้ว ฿3,000.00` |
| Freshness | x16 y468; caption `ข้อมูลการเงิน ณ 16 ต.ค. 2569 09:25 น.`; source disclosure underneath |
| Section | x16 y520; H2 `รายการภาระชำระ` with count `3 รายการ`; below 16px gap |
| Charge cards | White, 16px padding, 12px gap, min-h136 each. First label full fee name wraps; status warning; `คงเหลือ 1,500.00 บาท`; tertiary `ดูรายละเอียด` at bottom. Paid cards show `ชำระครบ` and `ดูรายละเอียดใบเสร็จ` |

At 844px only the beginning of the charge list is visible; deliberate vertical scroll, not clipped content. No wide table on mobile. Desktop at ≥768px uses top three-tab nav, profile/period row, hero at left 320px and charge list at right with 24px gap within max960px; history remains a distinct route.

### Interaction and states

- Tap first card details → full-height mobile detail sheet with fee original/adjusted/paid/outstanding, term and payment history. Tap `pay-009` → replace detail contents with reference detail (one overlay, back within sheet).
- Reference detail: `วันที่รับเงิน 10 ต.ค. 2569`, `จำนวนเงิน 2,000.00 บาท`, `เล่ม 30ก58379`, `หน้า 9 / 50`, `เลขที่พิมพ์บนใบเสร็จ ไม่ได้ระบุ`, `ใช้แล้ว · USED`, item name. Footer uses exact receipt-reference notice from design system. No print/download, bank details or contact/family information.
- History tab lists 2569 and 2568 even when selected period has no transactions. A genuine empty history reads `ยังไม่มีรายการในช่วงที่เลือก`; access/read failure is an error, not empty.
- Change-code action clears visitor data before returning to `/`. Back must not reveal previous student.
- Stale financial data inserts amber freshness banner above hero, labels figures as last known; no payment action appears. Missing projection displays error panel and retry, not a green zero balance.
- Success after G2 full payment: hero becomes white with green top border, label `ไม่มีภาระคงค้าง`, amount `฿0.00`, paid `฿4,500.00`; first item paid; new reference page13 visible. This requires successful command acknowledgement.

Golden assertion: total 4,500 = 3,000 + 1,500; exactly three tab destinations; exactly zero receipt-output controls.

## 3. Golden G2 — Finance receive-and-link workspace

Route `/app/finance/payments`, S08, viewport 1440×1000, finance_officer. Selected student-001, cash full outstanding 1,500.00, book-379 page13 selected. No submission has occurred. Design makes the physical reference explicit before commit.

### Exact visual composition

Shared staff shell: 240px forest sidebar, topbar y0 h72, mock band y72 h32. Inner width1136 at x272. Active nav `รับชำระนักเรียน`. Breadcrumb `งานการเงิน / รับชำระนักเรียน`; staff identity กมลชนก ใจดี. H1 at x272 y136 `รับชำระนักเรียน`; subtitle at y180 `ตรวจสอบภาระ รับเงิน และบันทึกเล่ม/หน้าใบเสร็จจริง`.

| Region | Geometry / anatomy |
|---|---|
| Step 1 search + identity | x272 y216 w1136 min-h128. Title `1 ค้นหานักเรียน`; 320px code/name search, explicit `ค้นหา`; selected identity to right with code, room, source time and `เปลี่ยนนักเรียน` |
| Main column | x272 y368 w768; stack three white panels, 16px gaps |
| Step 2 obligations | min-h352; title `2 เลือกภาระที่รับชำระ`; columns select44 / item flexible / outstanding120 / receive132. First item checked with 1,500.00; paid items disabled with text `ชำระครบ`. Total row `รับชำระครั้งนี้ 1,500.00 บาท` |
| Step 3 money | y736 min-h212; title `3 รายละเอียดรับเงิน`; method segmented radios เงินสด selected / โอนเงิน / อื่น ๆ; date `16 ต.ค. 2569`; receiver read-only `กมลชนก ใจดี`; optional collapsed note field |
| Step 4 reference | y964 min-h264; title `4 บันทึกข้อมูลใบเสร็จจริง`; book select `30ก58379 · กมลชนก · ว่าง 38 หน้า`; page select `13`; optional printed number blank. Green inline availability cue `หน้า 13 ว่าง ณ เวลาตรวจสอบ`; caption says availability is checked again on save |
| Summary aside | x1064 y368 w344 min-h432, sticky top120; title `ตรวจสอบก่อนบันทึก`; student/code; selected one item; received1,500.00; remaining-after0.00; divider; exact book/page `30ก58379 / 13`; receiver/date; primary full-width `ตรวจสอบรายการ` h44; reference-only notice below |
| Active books card | x1064 after summary +16; heading `เล่มที่เปิดใช้ 2 เล่ม`; two rows with book, holder, counts and `ดูเล่ม`; selecting a card does not silently assign it |

The amount field is locked to full outstanding in baseline policy. Explicit partial-payment scenario enables editing with the same layout. Never type into a fee or original-balance cell to change student debt. “Other method” reveals a required explanation; transfer has no slip uploader or PromptPay action. The workspace scrolls as one page; the summary stays visible. Review links for each summary section scroll/focus its fields. Add a second golden capture at scrollY=480 to inspect the reference controls before the confirmation-dialog capture.

### Commit flow

1. `ตรวจสอบรายการ` opens 520px dialog, title `ยืนยันบันทึกรับชำระ`, exact student, 1,500.00 cash, date, receiver, selected fee, book30ก58379/page13 and resulting outstanding0.00. Reminder `ตรวจสอบให้ตรงกับใบเสร็จจริงที่เขียนแล้ว`.
2. Footer secondary `กลับไปแก้ไข`, primary `ยืนยันบันทึก`. Escape returns to form without mutation. Only primary submits one command.
3. On mock acknowledged success, replace summary with persistent success panel `บันทึกรับชำระแล้ว`, transaction ID labelled `รหัสรายการ` (not receipt no.), 1,500.00 and reference. Buttons `ดูรายการ` / `รับชำระคนถัดไป`.
4. Student paid becomes4,500, outstanding0; book-379 becomes12 USED +1 VOID +37 AVAILABLE. Live room read model becomes34 paid/6 outstanding/11,000.00; executive collected4,801,500, outstanding598,500. Frozen monthly snapshot stays33/7/12,500 until explicitly refreshed.

### Error variants and responsive behavior

- Page conflict: inline red message at page select `หน้านี้ถูกใช้แล้ว กรุณาเลือกหน้าอื่น`; selection cleared, allocations and notes retained. Modal closes to field; refreshed count shown. No payment created, no automatic next-page selection.
- Balance changed: show before/current amount and `ตรวจสอบยอดใหม่`; invalidate review. Unknown outcome: persistent amber panel with status-check action; no duplicate-save option.
- Empty active books: disable reference/review; `ยังไม่มีเล่มที่เปิดใช้` and authorized `ไปทะเบียนคุมเล่ม`. Unauthorized issue users get read-only explanation.
- Offline/source stale/inactive role blocks commit. Failed search keeps prior draft until explicit student change, but must not replace identity silently.
- 768–1199px: rail shell and single-column panels, summary after reference. Below768px: menu drawer and all fields stacked, obligations as selectable cards, summary in flow and bottom review button with total; reserve safe-area footer space. Never hide book/page behind an overflow menu.

Golden assertion: one student, one selected obligation, one existing active book/page, one explicit review/commit. Two simultaneous attempts on page13 yield one success; failed attempt leaves balances unchanged.

## 4. Golden G3 — Monthly homeroom follow-up

Route `/app/monthly-followup`, S06, viewport1440×1000, homeroom_teacher assigned ม.2/1. Selected month `ตุลาคม 2569`, academic `1/2569`, batch draft v1, selected first student.

### Exact visual composition

Same shell, active `ติดตามรายเดือน`; H1 x272 y136 `ติดตามการชำระรายเดือน`; subtitle `ม.2/1 · ครูศิริพร แสงทอง`. Header right secondary `ดูตัวอย่างบันทึกข้อความ` and disabled final DOCX action with adjacent missing-template explanation.

Filter bar x272 y224 w1136 h44: month220px, academic year160px, term120px, room180px (only assigned choices), right snapshot caption. Changing month/room with unsaved human notes triggers dirty-form confirmation.

KPI cards y292 h112, four equal272px widths, 16px gaps: `นักเรียนทั้งหมด 40 คน`, `ชำระครบ 33 คน`, `ค้างชำระ 7 คน`, `ยอดค้างรวม ฿12,500.00`. Under the last value use caption `ณ วันที่จัดทำข้อมูล`. Missing-follow-up count is a table filter badge `ยังไม่บันทึก 3`; it is not mislabeled as seven students.

Body y428: table x272 w744, editor x1040 w368, gap24. Table header region56px: `นักเรียนค้างชำระ 7 คน`, segmented filter `ทั้งหมด 7` / `ยังไม่บันทึก 3`. Columns name/code272, outstanding128, follow-up216, action128 with16px cell padding accounted within widths. Header44px, rows min64px; all seven rows fit within a 548px table card at default copy. First row pale-green selected with a 3px brand inset marker. Name wraps if needed; never ellipsize the only accessible identity.

Editor white card padding24: title `บันทึกการติดตาม`; subtitle selected name/code; read-only amount `1,500.00 บาท`; labels `สาเหตุการค้างชำระ` and `แนวทางแก้ไข / ความต้องการผู้ปกครอง`, two104px textareas containing the first-row fixture text; optional tracking note collapsed; caption `ข้อมูลการเงินเป็นข้อมูล ณ 16 ต.ค. 2569 09:25 น.`; full-width primary `บันทึกการติดตาม` and status `บันทึกแล้ว 15 ต.ค. 2569`. Change this status to `มีการแก้ไขที่ยังไม่บันทึก` on edits.

### Workflow and states

- Save human notes only; no payment/waiver/receipt edits in this screen. Save is explicit, versioned, does not change selected student or reorder rows. Success uses inline saved time and polite announcement.
- Preview opens a wide reading drawer with semantic memo fields and annex, visibly marked `ตัวอย่างข้อมูล · ยังไม่ใช่เอกสารพร้อมส่ง`. Includes month, teacher, room, term/year,40/33/7/12,500 and seven reason/solution rows; empty fields show `ยังไม่บันทึก`. No invented official crest or template.
- Memo readiness validates all required human fields; missing three entries links back to their rows. Save draft remains available. Final `.docx` unavailable until G04; preview cannot pretend to generate a file.
- Approval-status panel displays `ครูที่ปรึกษา → งานการเงินและบัญชี → หัวหน้ากลุ่มบริหารงานงบประมาณ → รองผู้อำนวยการกลุ่มบริหารงานงบประมาณ → ผู้อำนวยการ`; current draft stays at teacher. No digital-sign button.
- A payment after snapshot adds banner `มีข้อมูลการชำระใหม่หลังจัดทำข้อมูล` with `ตรวจสอบข้อมูลใหม่`. Refresh draft shows old33/7/12,500 versus new34/6/11,000; explicit confirmation creates v2 and preserves matching human notes. Generated/submitted version is not overwritten.
- Unassigned room query gives forbidden state before data loads. No assigned rooms shows `ยังไม่ได้รับมอบหมายห้อง` with school-admin contact instruction; no open room picker.
- Mobile: four metrics become2×2 cards (amount card full width below if needed at320px); list uses name/amount/status cards; select opens full-screen editor. Sticky save bar only in editor. Paper memo preview remains responsive semantic data until real template preview is available.

Golden assertion: seven debts sum12,500; four have notes and three lack them; new payments cannot silently change monthly numbers.

## 5. Golden G4 — Executive overview

Route `/app/dashboard`, S04, viewport1440×1000, executive. Read-only financial analysis with permitted report access. No receive, fee-publish or role-edit control.

### Exact visual composition

Shared shell; active `ภาพรวม`. H1 x272 y136 `ภาพรวมการจัดเก็บ`; subtitle `ปีการศึกษา 2569 · ภาคเรียนที่ 1`; right secondary `ดูรายงาน` opens S15 preserving filters. Filter bar y224 h44: academic year160, term120, grade160, receipt group200, explicit `แสดงข้อมูล`; as-of caption right. Default scope all grades/all student-charge groups.

KPI strip y292 h112: `ภาระเรียกเก็บ ฿5,400,000.00`, `ชำระแล้ว ฿4,800,000.00`, `คงค้าง ฿600,000.00`, `อัตราจัดเก็บ 88.9%`. Money figures28px; explanatory caption on rate `ยอดชำระนักเรียน ÷ ภาระหลังปรับปรุง`. If longest money cannot fit, use24px metric only for this four-card strip; do not abbreviate the amount.

Body y428: left chart card x272 w744 h280, right context card x1040 w368 h280. Chart title `ยอดค้างตามระดับชั้น`; six horizontal bars in grade order, max160,000 axis; lengths proportional to90,000/85,000/80,000/95,000/90,000/160,000. Bars solid brand, silver track, right-aligned exact values; no 3D, animation or misleading truncated axis. Provide `ดูตารางข้อมูล` toggle and an accessible summary. Bar selection filters the table only after explicit click, not hover.

Context card: title `สถานะการติดตาม`; rows `นักเรียนทั้งหมด 1,200 คน`, `ชำระครบ 1,050 คน`, `ค้างชำระ 150 คน`; divider; `บันทึกข้อความรายเดือน ส่งแล้ว 24 / 30 ห้อง`, `ฉบับร่าง 6 ห้อง`; text link `ดูสถานะบันทึกข้อความ`.

Grade table x272 y732 w1136: heading `ผลการจัดเก็บรายระดับชั้น`; columns grade96 / students96 / adjusted216 / collected216 / outstanding216 / rate136 / detail160 (sum1136). Use the executive fixture exact values; grade1–5 rate90.0%, grade6 rate84.0%; total88.9%. Rows min56px, scroll vertically with page. Grade2 detail reveals the available ม.2/1 slice; unsupported drilldowns show explicit fixture limitation.

Below table separate panel `เงินรับประเภทอื่น · ปีงบประมาณ 2570`, total78,000.00 and category breakdown, caption `ไม่นำมารวมอัตราจัดเก็บเงินนักเรียน`. Receipt-stock summary further below retains6+80=86 and unresolved opening-range notice; do not put unresolved stock into a falsely green “all reconciled” KPI.

### States and responsive behavior

- Loading: skeleton cards/chart/table; no zero placeholders. Error: query error with retry and last valid as-of if authorized; charts never imply complete data from partial results.
- Empty valid period: no-data state, percentage `—`; no fake “100% success”. Stale: explicit as-of banner and refresh; report validation still rechecks independently.
- Executive report export can only follow S15 validation and actual-template availability. `ดูรายงาน` does not immediately download a file.
- Tablet: KPI2×2, chart/context stack. Mobile: KPI cards stack, grade figures become cards with expandable detail; chart bars keep exact textual values; no whole-page horizontal scrolling.

Golden assertion:5.4m=4.8m+0.6m;1,200=1,050+150; collection88.9%; other78,000 stays separate.

## 6. Remaining screen specifications (all roles)

All use shared state/error contracts, role guards and token dimensions. Primary actions below operate on mocks only; live/policy/template gates still apply.

| ID / route | Exact content and primary workflow | Responsive / required exceptional states |
|---|---|---|
| S00 `/` | Centered max960px white entry panel; wordmark, H1 `ตรวจสอบข้อมูลการชำระเงิน`; two tabs นักเรียน/ผู้ปกครอง and ครู/บุคลากร. Student: labelled code field, `ตรวจสอบข้อมูลการชำระเงิน`, no phone/national ID. Staff: `เข้าสู่ระบบบุคลากร` delegates to adapter; no guessed password form. Receipt prohibition footer. | At390px one card with16px gutters; invalid code, generic not-found, throttled, identity unavailable, role pending. Mock persona selector is clearly labelled demo tooling. |
| S02 `/student/history` | H1 `ประวัติการชำระ`; year2569/2568 selector, term filter; date/item/amount/reference/status rows. 2569 shows three payments above;2568 shows4,000 historical payment. `ดูรายละเอียด` only. | Mobile chronological cards; empty period distinct from denied/read error; no history print/download. |
| S03 `/student/documents` | H1 `ประกาศและเอกสาร`; approved cards with title, period, published date, type/size; `เปิดเอกสาร`, `ดาวน์โหลดประกาศ`. Audience filter applied before display. | Long title wraps; mock missing-file message; unauthorized/withdrawn file disappears on refreshed permissions. No receipt documents. |
| S04 role variants | Homeroom:40/33/7/12,500 with `ติดตามรายเดือน`; Finance: student receive and other-money entry, pending-reference queue and two active books, latest transactions. Superadmin: configuration readiness and role/fee/stock/report gates, detailed below. Executive:G4. | No generic shared dashboard exposing every action; partial summary clearly labelled. |
| S05 `/app/homeroom` | Assigned-room picker;40/33/7/12,500 live metrics. Table no./code/name/paid/outstanding/status/latest/action; `ดูข้อมูล` opens read-only student drawer. Filter all/owing/settled. CTA `ติดตามรายเดือน` carries room/year/term. | Mobile cards with same money/status; empty assignment, source-stale, forbidden room; no edit of directory or payment. |
| S07 `/app/memos` | Table month/room/teacher/snapshot/version/document status/paper stage/last update; `ดูรายละเอียด` displays memo metadata, annex and stage timeline. Authorized `สร้างบันทึกจากข้อมูลรายเดือน` goes to batch preview. | Mobile stacked rows, timeline vertical; missing template, missing notes, superseded version and no permission to record stage. No electronic signature. |
| S09 `/app/finance/other` | Four groups: category/date/FY; payer/source + description; amount/receiver; active book/page. 768+344 split with semantic report-mapping preview. Example donor `ชมรมศิษย์เก่าสาธิต`, donation12,000.00, description `สนับสนุนอุปกรณ์การเรียน`, book-380 page5. CTA `ตรวจสอบรายการรับเงินอื่น` → confirm `บันทึกรายการรับเงินอื่น`. | Single-column mobile. No student/obligation field. Category missing/inactive or mapping unknown shown; final report mapping stays pending. Page race/unknown outcome uses same flow as G2. |
| S10 `/app/receipts/books` | Tabs `เล่มใบเสร็จ` / `ทะเบียนเคลื่อนไหว`; source-baseline86 card with reconciliation notice; filters FY/status/holder. Book table book/source/status/holder/used/void/available/latest/actions. Movement columns date/description/received/issued/balance/book/holder/status. Authorized `รับเข้าสต็อก` records explicit identifiers and confirmed quantity; `เปิดใช้` requires holder/date and review. | Mobile book cards; no singleton current book. Missing stock identities cannot be generated from ambiguous range. Duplicate identity and quantity mismatch block finalization. |
| S11 book detail | Header book30ก58379 + ACTIVE + holder; counters11/1/38; page grid10 columns ×5 rows desktop,5×10 mobile,44px cells minimum,8px gap. Clicking page opens drawer with status/type/amount/payer/receiver/date/audit. Tabs pages/movements/return. | 50 accessible native buttons, status words/legend. USED/VOID cannot be selected for receipt linking. AVAILABLE VOID action requires reason. Return details below. |
| S12 `/app/receipts/pages` | FY/book/page-or-printed-number exact search. Result reference metadata, source transaction link, category/money/payer/receiver/date and timeline. CTA `ดูทั้งเล่ม` to S11. | Single result card on mobile; not found, ambiguous printed number, unauthorized link and data-incomplete states; no print/download reference. |
| S13 `/app/fees` | Two tabs `ภาระนักเรียน` and `หมวดรับเงินอื่น`; separate schemas. Student columns code/name/category/group/frequency/active; other columns code/name/report mapping/active. Create/edit drawer; disable via status, never delete referenced item. Year-copy action creates draft. | Mobile searchable cards; read-only executive; duplicate code, used-category deactivation impact, unsaved edits. Prices live in assignments; no hard-coded fee count. |
| S14 `/app/assignments` | Year/term/grade/room/program filters; template name/version/status. Grouped charge cards; preview per-student amount/count/total and affected roster/version. `ตรวจสอบก่อนเผยแพร่`→review→`เผยแพร่เวอร์ชัน`; separate `ตรวจสอบการสร้างภาระ`→`สร้างภาระชำระ`. Secondary lifecycle-review tab shows source status changes, original obligations and proposed differences. | Mobile groups stack; executive read. Overlap, unknown eligibility, unpublished template, stale roster, duplicate-generation outcome and paid-line changes block affected action. No automatic waiver or destructive lifecycle edit. |
| S15 `/app/reports` | Groups monthly/receipt-control/financial. Cards for monthly memo, ledger, OBEC inspection, annual usage, book return, student received/outstanding, other money. Selecting opens filters relevant to academic or fiscal scope, semantic preview, validation list, template metadata. `ตรวจสอบข้อมูล` precedes final format action. Persistent no-receipt-output notice. | On mobile filter sheet then readable preview; oversized data instructs bounded period; no fake file download. Missing template, incomplete records, mismatch, stale source, cancelled preparation and unauthorized export handled. |
| S16 `/app/admin/users` | Exact admin specification below. | Executive read only; other roles denied. |
| S17 `/app/audit` | Filters date/user/module/action/entity, cursor25. Columns timestamp/actor/action/entity/reason; drawer redacted before/after, command ID, source/version and timestamp. No edit/delete. Default homeroom own events only. | Mobile event list; limited finance-teacher projection; no raw sensitive before/after blob. Unavailable audit distinguished from no events. |
| S18 shared | `/access-pending`: identity established but no active school role; `/forbidden`: no permitted data; unknown route: `ไม่พบหน้านี้` with allowed-home action. Error boundary preserves shell with retry/reload. | Same mobile shell; no leakage of student or hidden navigation content. |

### S11 return/reconciliation subflow

Receipt-book detail tab `คืนเล่ม / ตรวจนับ` shows read-only expected counts and three integer physical-count inputs USED/VOID/AVAILABLE, all50 page records, from/to staff, date, note. Live count `รวมตรวจนับ 50 / 50` is green only if exact membership/links/history also reconcile. Mismatch example12+1+36=49 shows `จำนวนตรวจนับไม่ครบ 50 หน้า` and missing-page detail; no confirm.

For book-379 baseline11+1+38=50, show `มีหน้าว่าง 38 หน้า · รอยืนยันนโยบายคืนเล่มบางส่วน`; `บันทึกฉบับร่างการตรวจนับ` allowed, final return disabled pending G03. A separate complete-book fixture (50 USED, all linked) may exercise approved full return, not by mutating the golden baseline. Review must show holder, receiver, date, counts, discrepancy status; record immutable movement/return/audit on acknowledged commit. No reopen/delete button without approved policy.

### S16 Superadmin workspace — full implementation specification

Superadmin dashboard uses standard four-card strip: `บุคลากร 5 คน`, `บทบาทที่ใช้งาน 5 บทบาท`, `เล่มเปิดใช้ 2 เล่ม`, `รายการต้องตรวจสอบ 4 รายการ`. These four readiness tasks are opening stock reconciliation, official templates, external identity mapping, and fee/policy confirmation; they are not counted as financial transactions. List each with status `รอข้อมูลยืนยัน` and direct internal link to relevant screen. No “system ready” green badge.

Users page H1 `ผู้ใช้งานและสิทธิ์`; subtitle `ข้อมูลบุคลากรมาจากระบบต้นทาง`. Search name, role select, active select, explicit search. Desktop table width1136, columns name240 / role200 / rooms180 / active120 / last activity200 / action196. Five staff fixture rows above; homeroom row assignedม.2/1, other staff rooms `—`; all active. Action `จัดการสิทธิ์` opens480px drawer; executive sees `ดูสิทธิ์` with all controls read-only.

Drawer contains immutable name/identity/source, role select with five canonical options, active checkbox, assigned-room multi-select enabled for homeroom role, and permitted capability toggles with policy-dependent grants labelled `ต้องมีนโยบายรองรับ`. Show current-versus-proposed diff before confirm, mandatory change reason, affected rooms/count and warning if homeroom room access is removed. `ตรวจสอบการเปลี่ยนสิทธิ์`→dialog→`ยืนยันเปลี่ยนสิทธิ์`. No UI user creation, password editing, source profile editing, or first-admin claim.

Mock safety behavior: prevent removing the final active superadmin, reject self-escalation from a non-admin, reject version conflicts, and re-resolve scope after acknowledged change. This is an explicit protective engineering rule to validate with the future access owner, not an assertion about a pre-existing backend. Deactivating a user preserves audit history and source profile. On conflict keep draft with current values shown and require review again; never overwrite newer grants.

Mobile uses staff cards, full-screen permission editor,44px controls and sticky review action with reserved padding. No horizontal matrix of tiny permission checkboxes. Required variants: no results; inactive user; missing source profile; unauthorized executive mutation attempt; final-admin protection; stale role version; source read error.

## 7. Golden scenario manifest and state coverage

Implement a deterministic development scenario picker, excluded from live builds. Reset replaces all in-memory records and clock; never mix independently randomized data.

| Scenario ID | Trigger/result | Screens to verify |
|---|---|---|
| `baseline-v1` | Data above,300ms mock read delay | G1–G4, S00–S18 |
| `loading` | Query promise held until released by harness | Every route skeleton |
| `empty-valid` | Valid scope with no records, not error | Student history, roster, reports |
| `read-error` | One named query returns error | Error panel, retry, no fabricated0 |
| `source-stale` | Directory source timestamp7 days earlier | G1,G2,S14; warning/block affected mutation |
| `page-conflict` | Page13 consumed by another synthetic transaction before commit | G2; no money mutation |
| `balance-changed` | Expected obligation version rejected with authoritative new amount | G2 re-review |
| `outcome-unknown-committed` | Command commits but initial response lost; lookup returns original result | G2; exactly one payment |
| `offline` | Adapter offline; no writes accepted or queued | G2,S09,S11 |
| `no-assigned-rooms` | Homeroom scope empty | S05/G3 |
| `permission-revoked` | Current scopeVersion invalidated | Protected content/cache cleared |
| `reconciliation-49` | Physical counts12+1+36 | S11 final action blocked |
| `template-missing` | No approved XLSX/DOCX template | G3,S07,S15 |
| `report-invalid` | USED page missing link in isolated damaged-data fixture | S15 validation blocks final export |
| `after-payment` | G2 acknowledged full payment | G1/room/executive update; G3 snapshot unchanged |

Screens must also cover >40-character Thai names, two-line fee names,320px width,200% zoom, keyboard-only navigation, visible focus, reduced motion and screen-reader error announcements. A textual specification is not evidence that these tests have run; execution belongs to the task plan.
