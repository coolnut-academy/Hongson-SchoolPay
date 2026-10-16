# Hongson-SchoolPay — Audit Decisions & Change Log

**Audit baseline:** Finance teacher comments in `School Pay.pdf` + real receipt ledger/report forms + monthly memo

---

## 1. Confirmed Decisions

### DEC-001 — No Digital Receipt Output
**Status:** CONFIRMED / NON-NEGOTIABLE

System must not print/generate/download receipts. Physical handwritten receipt only.

Impact:
- remove old digital receipt generator
- remove receipt print buttons
- rename actions to record/view receipt reference

---

### DEC-002 — Receipt Book Has 50 Pages
**Status:** CONFIRMED

Normal receipt book creates 50 ReceiptPage records.

---

### DEC-003 — Multiple Active Receipt Books
**Status:** CONFIRMED

Receipt UI must support more than one open book concurrently.

Impact:
- no singleton currentBook
- payment form uses book selector
- dashboard shows active books list

---

### DEC-004 — Receipt Page-level Status
**Status:** CONFIRMED

Each page must visibly show:
- AVAILABLE
- USED
- VOID

USED page must reveal what money it received and associated parties.

---

### DEC-005 — Student/Parent History 2 Academic Years
**Status:** CONFIRMED FROM AUDIT COMMENT

Student view must include at least current + previous academic year.

---

### DEC-006 — Student/Parent Can View Fee Collection Announcements
**Status:** CONFIRMED FROM AUDIT COMMENT

Student/parent can view/download approved finance announcement documents, distinct from receipts.

---

### DEC-007 — Monthly Homeroom Memo Is Core Workflow
**Status:** CONFIRMED

Homeroom teacher tracks payment monthly and generates DOCX memo from actual data.

---

### DEC-008 — Report Must Follow OBEC Form
**Status:** CONFIRMED

The official Excel form is an output contract. Do not replace with a custom-designed spreadsheet.

---

### DEC-009 — Receipt Book Return Must Be Tracked
**Status:** CONFIRMED FROM AUDIT COMMENT

Add return/reconciliation workflow and report data.

---

### DEC-010 — Other Receipt Function
**Status:** CONFIRMED FROM FINAL AUDIT NOTE

Finance needs a function for receipt usage when receiving money **other than student tuition/fees**.

Impact:
- separate OtherReceiptTransaction
- separate category master
- share physical receipt ledger
- include in OBEC reporting

---

### DEC-011 — Fee Master by Room/Program
**Status:** CONFIRMED DESIGN DIRECTION

Admin can configure annual/term items and assign different fee sets/amounts by grade, room, and program.

---

## 2. Real Receipt Stock Baseline

Latest provided business input:

```text
Carry forward FY69: 28ก83122–28ก83128 = 6 books
FY70 new stock:      30ก58379–30ก58458 = 80 books
FY70 total:                                  86 books
```

### DATA-VERIFY-01
Range `28ก83122–28ก83128` interpreted as a simple inclusive sequence appears to contain 7 identifiers, while the confirmed business statement says 6 books.

**Decision:**
- do not auto-derive opening quantity from range text
- preserve `quantityConfirmed = 6`
- migration must follow actual receipt ledger movements / finance confirmation

This is a data reconciliation item, not permission to silently change the finance-provided quantity.

---

## 3. Changes from Old Blueprint

| Old Concept | New Audited Concept |
|---|---|
| System issues/prints receipts | System only records handwritten receipt reference |
| Student can print receipt | Student can only view details/book/page |
| One active receipt book | Multiple active books |
| Receipt treated mainly as payment output | Receipt is stock-controlled asset with page lifecycle |
| Fee-like master used broadly | Separate Student Charge vs Other Receipt |
| Generic annual report | Official OBEC template export |
| Memo periodic/term concept | Monthly homeroom follow-up memo |
| No explicit return workflow | Track return/reconciliation of receipt books |
| Digital running receipt number | Physical book/page is authoritative |

---

## 4. Legacy Features Not Yet Reconfirmed

Keep outside audited core unless user reconfirms:
- PromptPay QR collection workflow
- Slip upload by homeroom/student
- Automated warning letter to parent
- E-signature approvals
- Digital invoice/receipt document output

---

## 5. Open Questions for Future UAT

These do not block foundation design but must be confirmed before production:

1. Can a USED receipt page ever be canceled after money was recorded? If yes, what correction sequence is legally/operationally required?
2. When returning a partially used book, may it be re-issued later or must it remain assigned/closed?
3. Exact mapping of receipt usage columns in OBEC form, especially fields whose label/formula meaning is ambiguous in the source workbook.
4. Exact Student Charge amounts by room/program for each academic year.
5. Whether finance_teacher and finance_officer differ materially in live permissions.
6. How T-Academy exposes student data: same Firebase project, Firestore bridge, export, or API.
7. How T-Folio/Auth Bridge identity mapping is exposed in production.
8. Whether student-code-only access requires a second lightweight verification factor in production.

---

## 6. Vocabulary Lock

Use:
- ภาระชำระ
- รับชำระ
- ใบเสร็จจริงแบบเขียนมือ
- บันทึกข้อมูลใบเสร็จจริง
- เล่ม / หน้า / เลขที่
- ทะเบียนคุมใบเสร็จ
- รับเงินประเภทอื่น
- บันทึกข้อความติดตามรายเดือน

Avoid:
- e-Receipt
- Print Receipt
- Generate Receipt
- ใบเสร็จจากระบบ

---

## 7. Current Foundation Status

The design is sufficiently defined to start implementation of:
- UI shell
- adapters
- Fee Master
- obligations
- receipt book/page schema
- student read-only view

Before production use of reporting/receipt close, complete UAT for the open questions above.

