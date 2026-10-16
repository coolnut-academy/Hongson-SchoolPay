# Hongson-SchoolPay — Revised Implementation Plan

**Revision:** 2026-10-04 Audit Consolidated  
**Strategy:** Feature-First, Integration-Stable, Audit-by-Design

---

## Overview

```text
Phase 0  Freeze Business Rules & Templates
Phase 1  Foundation / Design System / Mock Adapters
Phase 2  Directory Integration & RBAC
Phase 3  Fee Master / Obligations
Phase 4  Payment + Other Receipt
Phase 5  Physical Receipt Ledger
Phase 6  Homeroom Monthly Follow-up + DOCX
Phase 7  OBEC Reporting / Fiscal Closing
Phase 8  Production Auth / Rules / Pilot / Data Migration
```

---

## Phase 0 — Requirement Freeze & Template Spike

### Tasks
- เก็บไฟล์ Excel สพฐ. ต้นฉบับเป็น versioned template
- เก็บ DOCX บันทึกข้อความต้นฉบับ
- Confirm field mapping
- Confirm receipt book = 50 pages
- Confirm multi-active-book rule
- Confirm list of Student Charge Master
- Confirm list of Other Receipt Categories
- Confirm return-book process
- Excel preservation technical spike
- DOCX merge technical spike

### Acceptance
- Mapping document exists
- Test export opens in Excel with correct layout
- Test DOCX preserves Thai layout

---

## Phase 1 — App Foundation & Design System

### Tasks
- Vite + React + TypeScript
- Routing
- White/Green/Silver design system
- Responsive shell
- Error boundary
- Feature flags
- Dev Role Switcher
- Mock adapters for T-Academy/T-Folio

### Acceptance
- Can navigate all core routes
- Each role sees intended shell/menu
- No receipt-print action anywhere

---

## Phase 2 — Directory Integration & RBAC

### Tasks
- StudentDirectoryAdapter
- StaffProfileAdapter
- Firebase Auth Bridge interface
- hsp_roles
- assignedRooms
- sourceUpdatedAt indicators
- student code read-only lookup

### Acceptance
- Student lookup returns only intended fields
- Staff login maps profile + role
- Homeroom data scoped by assignedRooms

---

## Phase 3 — Fee Master & Obligation Engine

### Tasks
- StudentChargeItem CRUD
- FeeTemplate versioning
- Room/Program Assignment
- Preview
- Publish
- Generate Obligations
- Student lifecycle adjustment

### Acceptance
- Different rooms can have different charge sets
- Template copied from previous year
- Published template immutable/versioned
- T-Academy roster drives generation

---

## Phase 4 — Payment & Other Receipt

### Student Payment
- search student
- allocate payment to obligations
- receive method/date/receiver
- create Payment

### Other Receipt
- Category Master
- payer/source
- description
- amount
- create transaction without student obligation

### Acceptance
- Student and Other receipt workflows are separate
- Both can later link physical receipt page
- Payment reversal is audited

---

## Phase 5 — Physical Receipt Ledger

### Tasks
- Stock batch
- Book records
- Auto-create 50 pages/book
- Multi-active books
- Book holder/movement
- Page status
- USED linking
- VOID with reason
- Page search
- Book grid
- Return/reconciliation
- FY opening/movement counters

### Acceptance
- One page cannot be used twice
- Multiple books Active concurrently
- `USED + VOID + AVAILABLE = 50` before return confirmation
- No delete of used/void history
- FY2570 opening data can be migrated

---

## Phase 6 — Homeroom Follow-up & Official Memo

### Tasks
- Monthly batch snapshot
- Outstanding list
- reason/solution fields
- auto totals
- DOCX generation
- workflow status chain

### Acceptance
- Memo values match dashboard
- Annex list generated correctly
- Teacher types only human-only information
- Printable DOCX follows real template

---

## Phase 7 — Reports / OBEC Export / Fiscal Closing

### Tasks
- Report Center
- Receipt ledger export
- OBEC inspection form mapping
- Annual receipt usage report
- Other receipt notes
- Return/reconciliation report
- Fiscal year close checklist

### Acceptance
- Export uses official workbook template
- Output totals reconcile to receipt pages and transactions
- No manual Excel re-entry required for supported fields
- Validation catches incomplete data

---

## Phase 8 — Production Integration & Pilot

### Tasks
- Live Firebase Auth Bridge
- Security Rules
- App Check if applicable
- Disable Dev Role Switcher
- Production data migration
- Import opening receipt stock
- Pilot with finance staff + selected homeroom
- UAT checklist
- Backup/export procedure

### Acceptance
- Finance staff signs off core workflows
- Student/Parent read-only scope verified
- Receipt control reconciles sample books
- Monthly memo generated from real class
- OBEC export tested against official file

---

## Cross-cutting Testing

### Unit
- obligation math
- allocation math
- fiscal year resolver
- receipt page state machine
- reconciliation

### Integration
- T-Academy adapter
- T-Folio adapter
- Auth bridge
- Excel template populate
- DOCX merge

### E2E
1. Admin sets M.1/1 fees
2. Obligations generated
3. Student sees due amount
4. Finance receives payment
5. Finance links physical receipt page
6. Student sees receipt reference
7. Teacher monthly follow-up updates
8. Memo generated
9. Book returned/reconciled
10. Annual report exported

---

## Do Not Build Until Confirmed

- Online payment gateway
- Digital/e-receipt
- Receipt PDF
- PromptPay slip upload
- Automated parent notice letter beyond audited monthly memo
- Electronic signature workflow replacing real signatures

These may be future extensions but are not part of the current audited foundation.

