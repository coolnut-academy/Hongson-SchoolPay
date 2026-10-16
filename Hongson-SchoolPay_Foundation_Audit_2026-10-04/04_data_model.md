# Hongson-SchoolPay — Data Model Foundation

**Revision:** 2026-10-04 Audit Consolidated

---

## 1. Modeling Principles

1. เก็บข้อมูลต้นทางแบบ Reference/Snapshot ไม่แย่ง ownership จาก T-Academy/T-Folio
2. แยก `Student Obligation`, `Payment`, `Physical Receipt Page` ออกจากกัน
3. แยก `Student Charge` กับ `Other Receipt`
4. ไม่ลบประวัติทางการเงิน ใช้ status + correction event + audit
5. ทุก record สำคัญมี `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
6. เก็บ fiscal year แยก academic year
7. Template/Assignment ต้องมี version เพื่อย้อนดูได้

---

## 2. Core Entities

### 2.1 StaffRole
```ts
type StaffRole =
  | 'superadmin'
  | 'executive'
  | 'finance_officer'
  | 'finance_teacher'
  | 'homeroom_teacher'
```

### 2.2 StudentProfileSnapshot
```ts
interface StudentProfileSnapshot {
  studentId: string
  studentCode: string
  fullName: string
  grade: string
  roomId: string
  roomName: string
  programId?: string
  programName?: string
  status: 'active' | 'transferred' | 'withdrawn' | 'graduated' | 'unknown'
  source: 'hongson_t_academy'
  sourceUpdatedAt: Timestamp
  syncedAt: Timestamp
}
```

### 2.3 StaffProfileSnapshot
```ts
interface StaffProfileSnapshot {
  uid: string
  fullName: string
  position?: string
  source: 'hongson_t_folio'
  sourceUpdatedAt?: Timestamp
  syncedAt: Timestamp
}
```

---

## 3. Fee Master

### 3.1 StudentChargeItem
```ts
interface StudentChargeItem {
  id: string
  code: string
  name: string
  categoryId: string
  receiptGroup?: 'obec' | 'association' | 'other_configured'
  frequency: 'once' | 'annual' | 'term' | 'custom'
  defaultAmount?: number
  isActive: boolean
  validFromAcademicYear?: number
  validToAcademicYear?: number
}
```

### 3.2 OtherReceiptCategory
```ts
interface OtherReceiptCategory {
  id: string
  code: string
  name: string
  reportMappingKey?: string
  isActive: boolean
  description?: string
}
```

> `OtherReceiptCategory` ไม่ถูกใช้สร้าง Student Obligation

### 3.3 FeeTemplate
```ts
interface FeeTemplate {
  id: string
  academicYear: number
  term: number
  name: string
  version: number
  status: 'draft' | 'published' | 'archived'
  copiedFromId?: string
  createdAt: Timestamp
}
```

### 3.4 FeeAssignment
```ts
interface FeeAssignment {
  id: string
  templateId: string
  scope: {
    grade?: string
    roomId?: string
    programId?: string
  }
  feeItemId: string
  amount: number
  enabled: boolean
}
```

---

## 4. Student Obligation

```ts
interface StudentObligation {
  id: string
  studentId: string
  academicYear: number
  term: number
  feeItemId: string
  assignmentId: string
  assignmentVersion: number
  originalAmount: number
  adjustedAmount: number
  paidAmount: number
  outstandingAmount: number
  status: 'open' | 'partial' | 'paid' | 'waived' | 'voided'
  roomAtCreation: string
  programAtCreation?: string
  adjustmentReason?: string
}
```

### Rule
`outstandingAmount = adjustedAmount - paidAmount`

ห้ามแก้ `originalAmount` หลังสร้าง ให้สร้าง Adjustment Event

---

## 5. Payments

### 5.1 StudentPayment
```ts
interface StudentPayment {
  id: string
  studentId: string
  academicYear: number
  term?: number
  paymentDate: Timestamp
  fiscalYear: number
  amount: number
  method: 'cash' | 'transfer' | 'other'
  receivedByUid: string
  note?: string
  receiptReferenceStatus: 'pending' | 'linked' | 'not_required'
  receiptPageId?: string
  status: 'active' | 'reversed'
}
```

### 5.2 PaymentAllocation
หนึ่ง Payment อาจครอบคลุมหลาย Obligation

```ts
interface PaymentAllocation {
  id: string
  paymentId: string
  obligationId: string
  amount: number
}
```

---

## 6. Other Receipt Transactions

```ts
interface OtherReceiptTransaction {
  id: string
  fiscalYear: number
  transactionDate: Timestamp
  categoryId: string
  description: string
  payerOrSource: string
  amount: number
  receivedByUid: string
  receiptPageId?: string
  receiptReferenceStatus: 'pending' | 'linked'
  reportNote?: string
  status: 'active' | 'reversed'
}
```

---

## 7. Physical Receipt Control

### 7.1 ReceiptStockBatch
```ts
interface ReceiptStockBatch {
  id: string
  fiscalYear: number
  sourceType: 'carry_forward' | 'received_from_authority' | 'other'
  receivedDate?: Timestamp
  sourceDocumentNo?: string
  series?: string
  firstBookNo: string
  lastBookNo: string
  quantityConfirmed: number
  note?: string
}
```

### 7.2 ReceiptBook
```ts
interface ReceiptBook {
  id: string
  fiscalYear: number
  stockBatchId: string
  bookNo: string           // e.g. 30ก58379
  pageCount: 50
  status: 'in_stock' | 'active' | 'closed' | 'returned' | 'damaged'
  holderUid?: string
  issuedAt?: Timestamp
  returnedAt?: Timestamp
  returnedToUid?: string
}
```

### 7.3 ReceiptPage
```ts
interface ReceiptPage {
  id: string
  bookId: string
  pageNo: number           // 1..50
  printedReceiptNo?: string
  status: 'available' | 'used' | 'void'
  transactionType?: 'student_payment' | 'other_receipt'
  transactionId?: string
  voidReason?: string
  usedAt?: Timestamp
  voidedAt?: Timestamp
  updatedByUid?: string
}
```

### Invariants
- `pageNo` unique per `bookId`
- 50 pages per normal book
- `used` ต้องมี transactionType + transactionId
- `void` ต้องมี voidReason
- ห้าม delete Page

### 7.4 ReceiptBookMovement
```ts
interface ReceiptBookMovement {
  id: string
  bookId: string
  action: 'received' | 'issued' | 'opened' | 'returned' | 'closed' | 'damaged'
  fromHolder?: string
  toHolder?: string
  occurredAt: Timestamp
  performedByUid: string
  note?: string
}
```

### 7.5 ReceiptBookReturn
```ts
interface ReceiptBookReturn {
  id: string
  bookId: string
  returnedAt: Timestamp
  returnedByUid: string
  receivedByUid: string
  usedCount: number
  voidCount: number
  availableCount: number
  reconciledTotal: number // must be 50
  note?: string
}
```

---

## 8. Monthly Follow-up

### 8.1 MonthlyFollowupBatch
```ts
interface MonthlyFollowupBatch {
  id: string
  academicYear: number
  term: number
  monthKey: string
  roomId: string
  homeroomTeacherUid: string
  totalStudents: number
  paidStudents: number
  outstandingStudents: number
  outstandingAmount: number
  snapshotAt: Timestamp
  status: 'draft' | 'ready' | 'memo_generated' | 'submitted'
}
```

### 8.2 MonthlyFollowupStudent
```ts
interface MonthlyFollowupStudent {
  id: string
  batchId: string
  studentId: string
  outstandingAmount: number
  outstandingDetail: Array<{
    academicYear: number
    term?: number
    feeItemId: string
    amount: number
  }>
  reason?: string
  solutionOrParentNeed?: string
  trackingNote?: string
  acknowledgedByStudent?: boolean
}
```

---

## 9. Official Memo

```ts
interface OfficialMemo {
  id: string
  type: 'monthly_payment_followup'
  sourceBatchId: string
  documentDate: Timestamp
  roomId: string
  generatedByUid: string
  templateVersion: string
  docxFileRef?: string
  status: 'draft' | 'printed' | 'submitted' | 'acknowledged' | 'completed'
  workflowSteps?: Array<{
    step: 'finance' | 'budget_head' | 'deputy' | 'director'
    status: 'pending' | 'reviewed' | 'approved'
    actedAt?: Timestamp
    actorUid?: string
  }>
}
```

---

## 10. Announcement / Document

```ts
interface FinanceAnnouncement {
  id: string
  title: string
  academicYear?: number
  term?: number
  audienceScope: 'all' | 'grade' | 'room' | 'program'
  audienceIds?: string[]
  fileRef: string
  isPublicToStudentLookup: boolean
  publishedAt: Timestamp
}
```

---

## 11. Report Run

```ts
interface ReportRun {
  id: string
  reportType: string
  filters: Record<string, unknown>
  templateVersion?: string
  generatedByUid: string
  generatedAt: Timestamp
  validationStatus: 'passed' | 'warning' | 'failed'
  validationMessages?: string[]
}
```

---

## 12. Audit Log

```ts
interface AuditLog {
  id: string
  actorUid: string
  action: string
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
  reason?: string
  createdAt: Timestamp
}
```

Audit required for at least:
- Role change
- Fee Master publish
- Obligation adjustment/waive
- Payment create/reverse
- Receipt page USED/VOID
- Book issue/return/close
- Report export

---

## 13. Suggested Firestore Collections

```text
/hsp_roles/{uid}
/hsp_staff_profiles/{uid}
/hsp_student_snapshots/{studentId}
/hsp_fee_categories/{id}
/hsp_fee_items/{id}
/hsp_other_receipt_categories/{id}
/hsp_fee_templates/{id}
/hsp_fee_assignments/{id}
/hsp_obligations/{id}
/hsp_payments/{id}
/hsp_payment_allocations/{id}
/hsp_other_receipts/{id}
/hsp_receipt_stock_batches/{id}
/hsp_receipt_books/{id}
/hsp_receipt_pages/{id}
/hsp_receipt_movements/{id}
/hsp_receipt_returns/{id}
/hsp_monthly_followup_batches/{id}
/hsp_monthly_followup_students/{id}
/hsp_official_memos/{id}
/hsp_finance_announcements/{id}
/hsp_report_runs/{id}
/hsp_audit_logs/{id}
```

---

## 14. Derived Counters

ค่าต่อไปนี้ควรคำนวณจาก source records หรือ denormalized พร้อม reconciliation:

- Book usedCount
- Book voidCount
- Book availableCount
- Student paid/outstanding total
- Room collection summary
- Fiscal year book stock

ห้ามถือ counter เดี่ยวเป็น source of truth หากย้อนตรวจรายการจริงไม่ได้

