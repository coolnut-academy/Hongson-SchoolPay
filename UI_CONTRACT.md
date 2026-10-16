# Hongson-SchoolPay — UI and adapter contract

Revision: 2026-10-16 · v1 · Normative frontend behavior; no live integration in this phase.

Business authority and risks: [ARCHITECTURE_RISKS.md](ARCHITECTURE_RISKS.md). Visual authority: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Fixture authority: [SCREEN_SPEC.md](SCREEN_SPEC.md). New engineering policies below are explicit design decisions, not claims that finance has approved unresolved business policies.

## 1. Architecture boundary

Static Vite + React + TypeScript SPA. React Router for client routing, CSS variables + CSS Modules for styling, native semantic controls and accessible overlay primitives. TanStack Query provides the single query/cache layer; no second global server-state store. Feature state uses React hooks/reducers. Components never import Firebase, Firestore types, external directory clients or export engines.

```text
route → feature controller → application command/query → domain types + adapter ports
                                                        ↓
                                           in-memory mock adapters (now)
                                           isolated Firebase adapters (future)
```

Composition root selects the complete adapter set once. No per-component mock/live flag. `VITE_DATA_MODE=mock` is the only executable data mode in this phase. `live` must fail closed with “integration unavailable”; it must not silently fall back to mock data. Development role/scenario switcher requires both development build and mock mode. Mock preview builds show the persistent synthetic-data banner but no role-privilege mechanism usable against a backend. No SSR, server actions, API routes, Vercel Functions, edge middleware or background server handlers. Static SPA rewrites are hosting configuration, not middleware.

## 2. Identity, permission and scope

Canonical staff roles: `homeroom_teacher`, `finance_teacher`, `finance_officer`, `executive`, `superadmin`. Student/Parent is a read-only visitor principal, never a sixth staff role.

```ts
type StaffRole = 'homeroom_teacher' | 'finance_teacher' |
  'finance_officer' | 'executive' | 'superadmin';
type Capability = 'student.read' | 'payment.receive' | 'other.receive' |
  'receipt.link' | 'receipt.voidAvailable' | 'book.issue' | 'book.return' |
  'followup.edit' | 'memo.generate' | 'memo.stageRecord' |
  'fee.edit' | 'fee.publish' | 'obligation.generate' |
  'report.operational' | 'report.obec' | 'role.manage' | 'audit.read';
type Principal =
  | { kind: 'visitor'; sessionId: string; studentScope: string }
  | { kind: 'staff'; uid: string; role: StaffRole; active: boolean;
      assignedRoomIds: readonly string[]; capabilities: readonly Capability[];
      scopeVersion: string }
  | { kind: 'anonymous' };
```

Production permissions come from authoritative RBAC and policy, never localStorage, URL parameters, displayed role badge or client-supplied UID. Inactive/missing role fails closed. Clear scoped query cache, selection, student lookup and open drawers whenever principal/scope changes. Every query key includes principal identity, scopeVersion and filters; never share cached student data across visitors.

### Mock capability matrix

`Y` = enabled in fixture; `R` = read only; `S` = own student/assigned room; `G` = visible only when an explicit optional grant is present; `—` = unavailable. This matrix implements F05 and marks its policy-dependent grants; it does not settle G06.

| Capability/domain | Student | Homeroom | Finance teacher | Finance officer | Executive | Superadmin |
|---|---|---|---|---|---|---|
| Student/history/reference read | S | S | Y | Y | R | Y |
| Student payment / reference link | — | — | Y | Y | — | Y |
| Other money receive | — | — | G | Y | — | Y |
| AVAILABLE page VOID | — | — | G | Y | — | Y |
| Book issue/return | — | — | G | Y | R | Y |
| Follow-up | — | S edit | R | R | R | Y |
| Memo generation | — | S | Y | Y | R | Y |
| Fee/assignment edit/publish/generate | — | — | R/G | Y (delegation checked live) | R | Y |
| Operational reports | — | S summary | Y | Y | R | Y |
| OBEC export | — | — | Y | Y | Y | Y |
| User/role admin | — | — | — | — | R | Y |
| Audit | — | own limited | limited | Y | R | Y |
| Official receipt output | — | — | — | — | — | — |

Default finance_teacher fixture omits other.receive, VOID, book issue/return, fee.edit/publish and obligation.generate; an explicit `delegated-finance` scenario adds those grants for testing. `memo.stageRecord`, corrections, reversal, partial-return/reopen and pending-save are absent from default grants until policies are approved. Superadmin does not bypass invariants or unresolved policy gates. Permission-denied routes show a scoped recovery link, never partial restricted data.

## 3. Route and navigation contract

Keep audited routes. Additional detail routes are implementation refinements, not new business workflows. No student IDs/codes or names in student-facing URLs. Staff identifiers in authorized detail routes must remain opaque and access-checked. Financial drafts and notes never enter URL query strings.

| Route | Screen ID | Allowed context / landing behavior |
|---|---|---|
| `/` | S00 | Student lookup / staff entry tabs |
| `/student` | S01 / G1 | Scoped visitor current status |
| `/student/history` | S02 | Same visitor; current + prior academic year minimum |
| `/student/documents` | S03 | Same visitor; approved audience-scoped announcements |
| `/app` | — | Redirect to `/app/dashboard` after identity resolution |
| `/app/dashboard` | S04 / G4 | Role-specific dashboard; no mixed-role action dashboard |
| `/app/homeroom` | S05 | Homeroom assigned rooms; authorized staff read |
| `/app/monthly-followup` | S06 / G3 | Room/month scope, edit only with permission |
| `/app/memos` | S07 | Scoped memo list/preview and paper-stage history |
| `/app/finance/payments` | S08 / G2 | Receive-authorized staff; existing payments read via detail |
| `/app/finance/other` | S09 | Other-money authorized staff |
| `/app/receipts/books` | S10 | Finance, executive read, superadmin |
| `/app/receipts/books/:bookId` | S11 | Same; page grid + return workflow |
| `/app/receipts/pages` | S12 | Same; exact book/page lookup |
| `/app/fees` | S13 | Finance, executive read, superadmin |
| `/app/assignments` | S14 | Same; publication/generation separately permissioned |
| `/app/reports` | S15 | Authorized report families; homeroom only own-room summaries/memos |
| `/app/admin/users` | S16 | Superadmin write; executive read |
| `/app/audit` | S17 | Scoped audit access according to matrix |
| `/access-pending`, `/forbidden`, unknown route | S18 | Shared access/error recovery; no data fallback |

All staff share sidebar order and group headings. Omit unauthorized entries without leaving blank groups:

1. `ภาพรวม`: ภาพรวม (`dashboard`).
2. `ติดตามนักเรียน`: ห้องที่รับผิดชอบ (`homeroom`), ติดตามรายเดือน (`monthly-followup`), บันทึกข้อความ (`memos`).
3. `งานการเงิน`: รับชำระนักเรียน (`payments`), รับเงินประเภทอื่น (`other`).
4. `ทะเบียนคุม`: เล่มใบเสร็จ (`books`), ตรวจสอบรายหน้า (`pages`).
5. `ข้อมูลและรายงาน`: รายการเงิน (`fees`), กำหนดภาระรายห้อง (`assignments`), รายงาน (`reports`).
6. `ดูแลระบบ`: ผู้ใช้งานและสิทธิ์ (`admin/users`), ประวัติการดำเนินงาน (`audit`).

Homeroom sees dashboard, three tracking entries, scoped reports and own audit. Finance sees dashboard, read tracking/memos, its finance entries, ledger, fees, reports and scoped audit. Executive sees dashboard, read tracking/memos, ledger, fees/assignments, reports, read users/audit; no receive-money menu. Superadmin sees all groups. Student navigation is exactly `ยอดชำระ`, `ประวัติ`, `เอกสาร`; “change student” is a session-clearing header action, not a fourth tab.

Non-sensitive filters such as year/month/room/status may be query parameters on staff routes. Browser back restores filters and scroll; never restores a committed money form as an editable new draft. Unauthorized deep links are denied before fetching restricted data. A hard reload of a visitor detail route without lookup session returns to entry with a generic explanation.

## 4. Domain value contract

```ts
type Satang = number & { readonly __satang: unique symbol };
type AcademicYearBE = number & { readonly __academicYear: unique symbol };
type FiscalYearBE = number & { readonly __fiscalYear: unique symbol };
type ISOInstant = string;
type Version = string;
type PageStatus = 'available' | 'used' | 'void';
type ObligationStatus = 'open' | 'partial' | 'paid' | 'waived' | 'voided';
type ReceiptReference = {
  bookId: string; bookNo: string; pageId: string; pageNo: number;
  printedReceiptNo?: string; pageStatus: PageStatus;
};
type ObligationView = {
  id: string; studentId: string; feeItemId: string; label: string;
  academicYear: AcademicYearBE; term: number;
  original: Satang; adjusted: Satang; paid: Satang; outstanding: Satang;
  status: ObligationStatus; version: Version; assignmentVersion: number;
};
type DataEnvelope<T> = {
  data: T; version: Version; asOf: ISOInstant;
  sourceUpdatedAt?: ISOInstant; completeness: 'complete' | 'partial';
};
type PageResult<T> = { items: readonly T[]; nextCursor?: string };
```

Satang constructor rejects non-finite, non-safe-integer and invalid-sign input. Parse a decimal input string without floating multiplication: at most two decimal places, no exponent or thousands separator on input. Format may show grouping. Never round an excessive-decimal financial input silently. `0` fee is allowed; receive-money amount must be positive. Do not infer negative credits/refunds from this model; those require approved correction policy. Adapter serialization explicitly documents whether persisted money is baht or satang; never reinterpret existing fields in place.

`outstanding = adjusted - paid`; `paid` is net active allocations under the approved correction model. Allocation sum equals payment amount. Each allocation targets one unique obligation of the same student and permitted period. Reject over-allocation; do not clamp a negative result to zero. Original amounts remain immutable. Other money does not enter student paid/collection percentage KPIs. Waivers reduce adjusted collectible amount, not collected cash. Students with no collectible obligation are a separate “no charge” count where relevant.

UI collection rate = net student collections / adjusted student collectible amount × 100; zero denominator displays `—` and `ไม่มีภาระเรียกเก็บ`, never 100%. Display percentages to one decimal; do not round inputs before summing. Fiscal year and academic year may legitimately differ: fixture date October 2569 uses academic year 2569 and fiscal year 2570. Fiscal calendar policy must be confirmed before live date derivation; mock fixture declares these values explicitly.

## 5. Adapter ports and commands

Port names and required operations below define the integration seams. Return frontend DTOs, never Firestore DocumentSnapshot/Timestamp objects. All queries accept AbortSignal and a scoped request context. Aborting a query must suppress late results after navigation/scope changes. Mutation cancellation is not a rollback.

| Port | Required operations / purpose |
|---|---|
| AuthBridgeAdapter | `resolveSession`, `signIn`, `signOut`, session-change subscription; no role creation |
| StudentLookupAdapter | `lookupByCode`, `endLookup`; returns only visitor projection, no directory enumeration |
| StudentDirectoryAdapter | `getStudent`, `getRoomRoster`, `searchStudents` with explicit query submit, limit/cursor; snapshots read only |
| StaffProfileAdapter | `getCurrentStaff`; read-only name/position/provenance |
| AccessAdapter | `getAccess`, `listStaffAccess`, `changeAccess`; immutable identity, expected version |
| StudentAccountAdapter | `getAccount`, `getHistory`, `getPaymentDetail`; scoped periods and minimal visitor projection |
| FinanceAdapter | `receiveStudentPayment`, `receiveOtherMoney`, `linkExistingReference`, `getCommandOutcome`, `listPendingReferences` |
| ReceiptLedgerAdapter | `listBooks`, `getBookPages`, `getPageDetail`, `issueBook`, `voidAvailablePage`, `previewReturn`, `confirmReturn` |
| FeeAdapter | `listMasters`, `saveDraft`, `copyTemplate`, `previewAssignments`, `publishTemplate`, `previewGeneration`, `generateObligations`, `listLifecycleReviews` |
| FollowupAdapter | `getOrCreateDraftSnapshot`, `saveFollowup`, `refreshDraftSnapshot`, `listMemos`, `getMemo`; versioned batches |
| ReportingAdapter | `getSummary`, `validateReport`, `previewReport`, `prepareExport`; semantic report DTO, future worker/export engine boundary |
| AnnouncementAdapter | `listApproved`, `getAuthorizedDocument`; only approved document type/audience |
| AuditAdapter | `listEvents`, `getEvent`; scoped/redacted DTOs |

```ts
type ReceiptSelection = {
  bookId: string; pageId: string; expectedBookVersion: Version;
  expectedPageVersion: Version; printedReceiptNo?: string;
};
type CommandMeta = { commandId: string; expectedScopeVersion: string };
type ReceiveStudentPayment = CommandMeta & {
  studentId: string; academicYear: AcademicYearBE; term: number;
  paymentDate: string; // local YYYY-MM-DD; adapter validates calendar/period
  method: 'cash' | 'transfer' | 'other'; amount: Satang;
  allocations: readonly { obligationId: string; amount: Satang; expectedVersion: Version }[];
  receipt: ReceiptSelection; note?: string;
};
type ReceiveOtherMoney = CommandMeta & {
  fiscalYear: FiscalYearBE; transactionDate: string;
  categoryId: string; categoryVersion: Version;
  payerOrSource: string; description: string; amount: Satang;
  receipt: ReceiptSelection; reportNote?: string;
  // No studentId, obligationId or allocation property.
};
type LinkExistingReference = CommandMeta & {
  transactionType: 'student_payment' | 'other_receipt';
  transactionId: string; expectedTransactionVersion: Version;
  receipt: ReceiptSelection;
};
type CommittedResult = {
  commandId: string; transactionId: string; committedAt: ISOInstant;
  version: Version; reference: ReceiptReference;
};
type DomainErrorCode = 'VALIDATION' | 'AUTH_REQUIRED' | 'FORBIDDEN' |
  'NOT_FOUND' | 'SOURCE_STALE' | 'VERSION_CONFLICT' | 'PAGE_UNAVAILABLE' |
  'BALANCE_CHANGED' | 'OUTCOME_UNKNOWN' | 'OFFLINE' | 'RATE_LIMITED' |
  'TEMPLATE_MISSING' | 'REPORT_INVALID' | 'POLICY_REQUIRED';
type DomainError = {
  code: DomainErrorCode; messageKey: string;
  fieldErrors?: Record<string, string>; correlationId?: string;
  retryAfterSeconds?: number;
};
```

Commands do not accept an authoritative receiver UID, actor UID, timestamp or computed paid balance from the form. The adapter/service derives actor from authenticated context; received-by displays that context. Future delegated receivers require an approved capability/command extension. Idempotency command IDs are opaque random IDs generated once per submitted draft, not receipt numbers. Reuse the ID for status reconciliation/retry of the identical command; bind it to a payload fingerprint and reject same ID/different payload. A new edited submission gets a new ID only after prior outcome is known. Mock uses deterministic seeded IDs for tests.

For a new linked payment, validate and commit payment, allocations, page link, obligation changes and audit as one logical atomic operation. Other money does the same without obligations. For an already pending transaction, link only its reference/page/audit; do not receive funds again. Book/page IDs are canonical uniqueness keys; do not generate multiple documents for the same page. `printedReceiptNo` comes from paper if present and is never algorithmically generated.

Baseline single-item full-balance payment is enabled in mocks. Domain supports partial/multi-item allocation, but controls require explicit mock policy fixture and future G05 approval; do not assume combining different receipt groups is permitted. The audited optional pending-save flow is represented in types/read states but has no default submit control. No `not_required` shortcut.

## 6. State machines and safeguards

### Financial form

`empty → studentSelected → allocating → referenceSelected → reviewing → submitting → committed`.

- Search selects one explicit student; amounts are shown before editing. Changing student after edits requires discard confirmation and clears allocations/book/page.
- Book is explicitly selected from active books; page selection follows. Never silently select or advance to a new page/book. Recheck availability and versions at commit.
- Review shows student/payer, amount, allocations, method/date, receiver, exact book/page and post-payment balance. `ยืนยันบันทึก` is the only commit action.
- While submitting disable duplicate submit. Success is shown only from `CommittedResult`, retained in a persistent result panel; offer `รับชำระคนถัดไป` and `ดูรายการ`. No receipt-output action.
- `PAGE_UNAVAILABLE`/`BALANCE_CHANGED`: return to form, preserve non-conflicting fields, clear invalid selection, show refreshed values, require review again. Never choose another page automatically.
- `OUTCOME_UNKNOWN`: freeze editing/submission and show `กำลังตรวจสอบผลการบันทึก` with `ตรวจสอบสถานะ`. Query by original command ID. If committed show original success; if conclusively not committed allow retry/review. If still unknown escalate with support reference, never “save again” blindly.
- Offline: retain unsent draft in memory, block financial commit and show `เชื่อมต่ออินเทอร์เน็ตเพื่อบันทึก`. No automatic upload on reconnect; user reviews fresh state.

### Receipt lifecycle

Books: in_stock→active; active→returned/closed after authorized reconciliation; in_stock→damaged is an exception requiring policy. Pages: available→used atomically; available→void with required reason. Used→void/correction is policy-gated. No delete or normal transition to available. Return checks all 50 unique page numbers, valid links, reasons, held-book version, ledger counts and physical counts; a total of 50 alone is insufficient. Partial return may be previewed but final confirmation waits for G03. Closed/returned books cannot be selected in receive workflows.

### Follow-up and memo

Follow-up batch uses audited `draft → ready → memo_generated → submitted`. Draft human notes can be saved individually with version checking. Financial figures are fixed at snapshot time. A newer account does not silently rewrite a generated memo. Explicit refresh of a draft shows a before/after count/amount diff, retains matching student notes, and flags removed/new students. Generated/submitted batches cannot be refreshed in place.

Memo has independent `draft / printed / submitted / acknowledged / completed` states and the paper-stage chain. Creating a preview is not signing/approving a memo. Record paper stages only under approved capability; show actor/date/evidence note. No electronic signatures. Real DOCX export remains blocked until template validation; preview success never marks `memo_generated` unless a file was actually generated.

### Fees and generation

Draft → validated preview → published version → generation preview → explicit generation. Publishing is not automatic debt creation. Published templates cannot be edited in place after use; copy to next version with change reason. Generation is idempotent per approved assignment/period/student; show created/skipped/conflict counts. Stop when scope overlap, unknown roster freshness, missing price or unresolved eligibility is detected. Do not mutate T-Academy names/rooms or delete old payments.

## 7. Validation defaults (frontend engineering limits)

| Input | v1 rule |
|---|---|
| Student code | Required trimmed string, max 32 characters, preserve leading zeros; no guessed fixed school code length |
| Money | Required positive satang for payment; nonnegative fee; ≤2 decimals; safe integer domain |
| Page | Integer 1–50, belongs to explicitly selected active book, AVAILABLE |
| Payment date | Required local date; default mock today; unsupported backdate/closed-period edit → POLICY_REQUIRED |
| Required reason | Trimmed nonempty, max 1,000 characters; no meaningless minimum length rule |
| Follow-up reason/solution/note | Up to 1,000/1,000/2,000 characters; blank saved as draft, missing fields listed before memo readiness |
| Other payer/description/report note | Required payer max 200; required description max 1,000; optional report note max 2,000 |
| Fee code/name | Required unique normalized code max 32, display name max 200; never hard-code 11/12 categories |

Limits are validation contracts for mocks and must be matched by future authoritative validation. Do not truncate financial notes silently. Required fields are checked both before review and at command execution. All error summaries link to fields; moving focus does not erase input.

## 8. Shared async and error behavior

| State/error | Behavior / recovery |
|---|---|
| Initial loading | Geometry-matched skeleton, `aria-busy`, one loading announcement; no fabricated zero totals |
| Empty | Contextual explanation and allowed next action; distinguish no obligations from no student or unavailable data |
| No search matches | `ไม่พบข้อมูลที่แสดงได้ กรุณาตรวจสอบรหัสหรือติดต่อโรงเรียน`; no public directory suggestions |
| Partial data | Mark incomplete; suppress authoritative totals/final export and explain missing scope |
| Stale | Show source/as-of time; read allowed; affected publication/payment blocked until fresh authoritative check |
| Auth expired | Resolve any submitted command outcome after reauthentication; clear protected view; unsent drafts never persisted automatically |
| Forbidden | Clear restricted content; `คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้`; link to allowed home |
| Rate limited | Show retry countdown supplied by adapter; avoid automatic retry storms |
| Generic query error | Persistent region with retry; keep previously loaded data explicitly marked stale if still authorized |
| Missing template | `ยังไม่มีแบบฟอร์มที่ผ่านการตรวจสอบ`; explain export unavailable, allow semantic preview |
| Report invalid | Counted validation list links to affected books/pages; final export blocked |
| Version conflict | Show current values next to draft; user resolves and re-reviews; no last-write-wins |

## 9. Reports, downloads and observability

Allowed report families: monthly memo, receipt control ledger, OBEC inspection, annual usage, book-return reconciliation, student collection/outstanding and other-money reports. Export request is a closed discriminated union of these families; no generic “export any entity” and no receipt entity type. Announcement download is a separate approved-document port. UI must not expose public storage links to scoped private material.

Every future report run records filters, source snapshot/version, template ID/version/checksum, validation status, actor and generated time. Final output needs passed validation; flagged draft output is only for authorized Finance/Superadmin, explicitly marked `ข้อมูลยังไม่ครบ`, and still requires a real template. Missing templates cannot be bypassed by draft mode. Cancellation of file preparation does not claim financial rollback. Export data must be reauthorized, not scraped from whatever rows happen to be rendered.

No telemetry containing student code/name, notes, monetary line details, access tokens or downloaded URLs. Diagnostic events may include non-identifying error code, duration, feature and opaque correlation ID. Mock financial audit is a local simulation, never described as tamper-proof. Future production audit rules are a separate release gate.

## 10. Contract acceptance

All roles must traverse allowed routes; forbidden deep links reveal no data. Mock adapter reset restores fixture `baseline-v1`. Same command ID returns same result; page conflict does not change balance; read errors never render zero as fact; visitor changes clear history. Every financial result, monthly memo preview and dashboard amount must be explainable from the fixture records or the explicitly separate aggregate dataset in SCREEN_SPEC. Feature acceptance and test IDs are in [FRONTEND_TASKS.md](FRONTEND_TASKS.md).
