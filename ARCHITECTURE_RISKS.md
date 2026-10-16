# Hongson-SchoolPay — Architecture audit and release gates

Revision: 2026-10-16 · Design baseline v1 · Audit performed before frontend implementation.

## 1. Verdict and scope

Proceed with the static, synthetic-data frontend specified in this package. Do not connect production identities, student records, money, storage, or exports yet. The audited workflows are suitable for design; the legacy security rules and zero-cost assertions are not suitable for production. This is a blueprint review, not a penetration test or certification of a deployed system. The repository contains documentation/proposal assets, not an existing application to test.

The four golden screens are specified at implementation fidelity in [SCREEN_SPEC.md](SCREEN_SPEC.md). No backend, official receipt, replacement official form, or deployed site is delivered by this design phase.

## 2. Source manifest and precedence

All eleven files in `Hongson-SchoolPay_Foundation_Audit_2026-10-04/` were read. The repository additionally has three older Markdown files; these were read for conflicts, making fourteen existing Markdown files in total. Original files remain unchanged.

| ID | Source | What it controls |
|---|---|---|
| F00 | [00_README](Hongson-SchoolPay_Foundation_Audit_2026-10-04/00_README.md) | Authority hierarchy, non-negotiables, source boundaries |
| F01 | [01_blueprint](Hongson-SchoolPay_Foundation_Audit_2026-10-04/01_blueprint.md) | BR-001–010, modules, static architecture |
| F02 | [02_workflow](Hongson-SchoolPay_Foundation_Audit_2026-10-04/02_workflow.md) | Payment/link sequence, monthly tracking, lifecycle review |
| F03 | [03_ui_spec](Hongson-SchoolPay_Foundation_Audit_2026-10-04/03_ui_spec.md) | Screens, labels, error prevention |
| F04 | [04_data_model](Hongson-SchoolPay_Foundation_Audit_2026-10-04/04_data_model.md) | Separate entities, statuses, versions, reconciliation |
| F05 | [05_roles_permissions](Hongson-SchoolPay_Foundation_Audit_2026-10-04/05_roles_permissions.md) | Five staff roles, visitor identity, room scopes, capabilities |
| F06 | [06_receipt_control](Hongson-SchoolPay_Foundation_Audit_2026-10-04/06_receipt_control.md) | Fifty pages, concurrent active books, immutable history |
| F07 | [07_fee_master](Hongson-SchoolPay_Foundation_Audit_2026-10-04/07_fee_master.md) | Two masters, variable prices, template publication |
| F08 | [08_reporting_export](Hongson-SchoolPay_Foundation_Audit_2026-10-04/08_reporting_export.md) | Real XLSX/DOCX templates, validation, return reporting |
| F09 | [09_implementation_plan](Hongson-SchoolPay_Foundation_Audit_2026-10-04/09_implementation_plan.md) | Phase boundaries and production prerequisites |
| F10 | [10_decisions_audit](Hongson-SchoolPay_Foundation_Audit_2026-10-04/10_decisions_audit.md) | DEC-001–011, stock discrepancy, deferred features, open decisions |
| L01 | [README](README.md) | Legacy context only where not superseded |
| L02 | [blueprint](blueprint.md) | Legacy architecture/rules audited below |
| L03 | [implementation_plan](implementation_plan.md) | Legacy phase order and implementation suggestions |

Authority: current user constraints → confirmed October audit decisions and workflows → other audited foundation detail → compatible legacy detail → this UI specification's explicit design decisions. The originals give primary authority to `School Pay.pdf`, actual receipt ledgers, OBEC workbooks, and the real monthly memo. Those primary artifacts are absent from this repository; the two proposal PDFs are not substitutes. This audit relies on their consolidated Markdown account and does not claim to verify their contents. Reconcile any newly supplied primary evidence before production.

## 3. Confirmed-rule preservation ledger

| Rule/source | Locked implementation consequence | Verification |
|---|---|---|
| BR-001; DEC-001 | Never generate, print, download, rasterize, or format an official receipt; only show reference metadata | No receipt exporter/print route/action; negative route and output tests |
| DEC-002–004; BR-003–006 | Exactly 50 pages/book; multiple active books; AVAILABLE/USED/VOID; one transaction per page | Page count, atomic competing-link test, disabled USED/VOID selection |
| DEC-005–006 | Current and previous academic year minimum; approved announcement downloads allowed | Student history 2569/2568; announcement distinct from receipt |
| DEC-007 | Monthly follow-up and real-template DOCX; paper approval chain | Frozen monthly snapshot; no electronic signature substitution |
| DEC-008–009 | Actual OBEC workbook contract and book return reconciliation | Template version/checksum; total 50 before return |
| DEC-010; BR-007 | Other money has its own categories/transactions; never creates student debt | Discriminated command types, no student allocation on other receipt |
| DEC-011; F07 | Year/term/grade/room/program assignment; published versions immutable | Preview plus explicit publish/generate; overlap conflict blocked |
| F02 §9 | Transfers preserve payments; withdrawal stops future charges and sends existing debt to review | No automatic debt erasure from legacy documents |
| DATA-VERIFY-01 | Carry-forward quantity 6, new stock 80, total 86 | Never expand the ambiguous carry-forward range into 7 books |
| F07 §2 | Enumerated fee items are 9+2, not a fixed 10+2 | Configurable masters; no fixed category-count validation |

## 4. Risk register

Severity: Critical = production exposure or money-integrity blocker; High = feature release blocker; Medium = measured mitigation needed. Owners are accountable roles for later work, not people already assigned. All mitigations below are requirements/proposals, not claims that a backend exists.

| ID / severity | Evidence and failure | Required mitigation and frontend consequence | Owner / release evidence |
|---|---|---|---|
| SEC-01 Critical | L02 §8 permits self-creation of `hsp_roles` without constraining role/permissions. Its existence-path syntax also needs correction. The intended branch could let a new user become superadmin. A frontend email whitelist is public and cannot authorize bootstrap. | Do not copy those rules. Provision first admin through an authorized out-of-band administrative process; no browser first-claim flow. Validate active role, room scope, field allowlists and immutable UID on every write. | Security owner: rules tests reject self-promotion, inactive users, forged scopes and unknown fields. |
| SEC-02 Critical | L02 grants any authenticated user student/invoice reads and payment creation (`isFinanceStaff() || isAuthenticated()`); allows deletion of financial records. Anonymous auth can make this worse. | Deny by default, distinguish visitor/staff identities, scope queries and documents, forbid destructive money/history writes. UI route guards only improve usability. | Security owner: direct SDK attack tests, not just hidden-menu tests. |
| SEC-03 Critical | F01/F05 retain student-code-only lookup. Student codes are enumerable identifiers, not proof of ownership; anonymous auth/App Check do not establish the student relationship. | Keep the confirmed one-field mock entry. Live lookup remains blocked until a controlled, minimal-data lookup design and residual privacy risk are explicitly accepted, or an additional factor is approved. Do not silently add login/OTP. No collection-wide visitor reads. No PII in URLs or analytics. | School privacy owner + security owner: enumeration/abuse test, response minimization, access decision. [App Check limitations](https://firebase.google.com/docs/app-check). |
| SEC-04 High | F01/F05 leave cross-project T-Academy/T-Folio/Auth mapping unspecified; initializing two Firebase apps does not grant cross-project authority. | Isolated adapters and opaque identity mapping; unknown staff → access pending. No credentials or service-account keys in Vite env. No editable source student/staff profile. | Integration owner: UID mapping and revocation tests before live adapter work. |
| SEC-05 High | Role switches, caches, exported files and monthly reasons can expose minors' financial circumstances on shared devices. | In-memory data only in initial UI; clear on sign-out/scope change. No localStorage/IndexedDB student data or service-worker data caches. Redact diagnostic logs; authorized report downloads only. Retention and export handling require school policy. | Privacy owner: shared-device/back-navigation test, export scope review. |
| SEC-06 High | Free-text notes, announcement files and spreadsheet cells can carry active content/formulas. | React text rendering; no raw HTML. File type/size/access validation later; reject executable formats. Export user strings as literal text, preserve only approved template formulas, escape CSV formula prefixes if CSV is ever approved. | Security/report owner: malicious note and file test corpus. |
| FIN-01 Critical | Separate Payment, Allocation and Page writes can partially commit, race or duplicate on retry. UI selection is not a page reservation. | One idempotent command; compare expected versions, validate balance/allocation sum, consume canonical book/page atomically with audit. Timeout means outcome unknown, not failure. No optimistic success or offline financial queue. | Finance/backend owner: two clients compete, one wins; repeated key creates one result; failed operation leaves no partial records. |
| FIN-02 Critical | F04 generic `number` money and counters are underspecified. Floating point, negative balances, duplicate allocations or stale counters can change totals. | Integer satang in frontend domain, explicit persistence conversion, sum allocations exactly, unique obligation per allocation, immutable originals, authorized adjustments. Counters reconcile to records. | Finance/backend owner: math and reconciliation tests, migration unit mapping approved. |
| FIN-03 High | F02 permits receipt-reference-pending only if finance policy allows; F04 also lists `not_required`. Neither establishes general permission to omit references. | Default mock policy requires link in combined commit. Model pending separately, show outstanding reference queue, keep optional pending-save/not-required controls disabled until policy decision. Linking an existing pending payment must not add payment money again. | Finance owner: approve pending conditions and reconciliation handling. |
| FIN-04 Critical | F06 USED→VOID is conditional; F10 asks correction/reversal sequence and partial book reissue policy. An ordinary edit could recycle a page or hide collected cash. | Display existing states, but disable unapproved correction/reopen actions. AVAILABLE→VOID requires reason. VOID never returns to AVAILABLE via ordinary edit. Payment reversal, reference correction and USED cancellation stay separate commands with policy gates. | Finance owner: signed correction SOP and audited compensating-event tests. |
| FIN-05 High | F07 overlapping room/program assignments, once/annual/custom frequencies and changing rosters have no full conflict/eligibility policy. | Versioned preview; block overlapping targets instead of inventing precedence; generation keyed by student/period/item/assignment. No automatic term inference, prorating, withdrawal waiver or retroactive paid-line rewrite. | Finance + registrar: amounts, precedence, once/annual eligibility and lifecycle rules approved. |
| FIN-06 High | F10 carry-forward range looks like 7 while confirmed quantity is 6. Counts alone cannot prove physical stock or unique pages. | Store quantityConfirmed=6 separately from text. Show discrepancy; block opening-stock finalization until six actual book IDs/movements confirmed. Never fabricate the missing/excluded identifier. Reconcile unique page membership and movements as well as count totals. | Finance/migration owner: signed opening ledger and reconciliation evidence. |
| FIN-07 High | Academic year and fiscal year are separate; historical rosters and monthly snapshots can drift when today’s data changes. | Explicit year types and snapshot IDs/versions/as-of times. Read-only historical batches. Freeze export source revision; stale snapshot refresh creates a deliberate new revision. | Finance/report owner: year-boundary, transfer and snapshot consistency tests. |
| FIN-08 High | Official XLSX/DOCX files/mappings absent. Generic Excel output may lose formulas/print areas or misclassify other money. | Mock report preview only. Block final files until template preservation spike and finance mapping sign-off. No invented sheet/cell mappings or official-looking substitute. | Report owner: actual workbook/DOCX opens with correct Thai layout, totals, merges, signature spaces and print settings. |
| FIN-09 Critical | Client-written audit rows alone cannot prove that every financial write is logged; client clocks/actors can be forged. | Require coupled append-only audit with validated actor/time and entity versions; no update/delete. Prove bounded rules can enforce each command; otherwise propose a trusted Firebase-side service as a separate approved architecture decision. | Security/backend owner: direct tamper and missing-audit rejection; restore procedure. |
| COST-01 High | L01/L02 promise free hosting forever based only on zero server compute. Static traffic, builds and provider plan eligibility still matter. | Keep Vite static-only; budget CDN bytes/requests/builds separately. Confirm school deployment eligibility and plan with provider/account owner; do not declare Hobby eligible automatically. | Hosting owner: plan/usage review before publishing. [Vercel Hobby](https://vercel.com/docs/plans/hobby). |
| COST-02 High | Global real-time listeners, repeated roster fetches and full-school client aggregations can multiply Firestore reads. | Bounded cursors, no global listeners, room/year scoped fetches, cached read models, explicit refresh, lazy detail queries. Measure index/rules/read overhead as well as returned rows. | Backend owner: load/cost measurements with realistic data. [Firestore billing](https://firebase.google.com/docs/firestore/pricing). |
| COST-03 High | Legacy Storage free-tier assumptions are outdated; announcement downloads still cost resources even with no slip uploads. | Keep Storage optional and unconnected now. Firebase documentation states Blaze is required for Cloud Storage access starting February 3, 2026. Budget storage, egress and operations; no public private-file URLs. | Hosting owner: billing/region/bucket review. [Storage billing changes](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024). |
| COST-04 Medium | Big exports, book migration and obligation generation can freeze the browser or partially complete writes. | Worker-ready export ports; bounded preview; cancellable reads; resumable idempotent generation plan. Never pretend a cancelled committed write was rolled back. | Frontend/backend owner: largest roster, 86-book migration and memory tests. |
| ARCH-01 Critical | Client-heavy is not equivalent to client-trusted. Cross-document validation can exceed Firestore rules access-call limits. | Prototype each live command in emulator before accepting direct SDK writes. Rules support `getAfter`; limits include 10 calls per operation and 20 for multi-document operations. If invariants cannot be enforced, block release and document alternative; do not weaken invariants or add Vercel APIs. | Security architect: bounded command/rules proof. [Rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions), [transactions](https://firebase.google.com/docs/firestore/manage-data/transactions). |

## 5. Cost model and operational budgets

These are planning scenarios and engineering limits, not provider quotas or quoted prices. Recheck billing documentation at deployment. Budget notifications must not be treated as a guaranteed spending cap.

| Scenario | Explicit arithmetic | Consequence |
|---|---|---|
| Initial physical stock | 86 × 50 = 4,300 page records, plus 86 books, batches/movements/audits | Chunked migration; no single browser batch pretending all succeeded |
| Naive executive refresh | 3,000 students × 8 obligations × 10 opens/day = 240,000 obligation reads/day before overhead | Read versioned scoped summaries, not every obligation on dashboard open |
| Naive generation | 3,000 × 8 = 24,000 obligation writes before audits/summary updates | Plan quotas, resumability and service boundary before term generation |
| Bounded room screen | 40 roster entries + 40 financial summaries + batch metadata | One scoped fetch per explicit filter selection; lazy student detail |
| Lookup scenario | 3,000 visits/day × 15 returned records = 45,000 reads before index/rules/auth overhead | Minimal student projection and abuse protection; not proof of free operation |
| Static delivery | 3,000 cold visits × 1 MB initial assets = about 3 GB transfer before documents/revisits | Bundle budgets and immutable asset cache; exclude exports from startup |

Frontend target budgets: initial JS ≤250 KiB gzip; route chunk ≤150 KiB gzip excluding lazy export engines; CSS ≤40 KiB gzip; initial fonts ≤200 KiB compressed with Thai coverage. Tables default 25 rows (50 maximum). No automatic pagination prefetch. Search only on submit initially. Report preview ≤100 rows; bounded full export only after measured spike. No polling by default. Read-only summaries have a 60-second stale interval in memory, not a freshness guarantee; authoritative checks occur at mutation. Pause background refetch when hidden; no financial mutation retries without command identity/outcome resolution.

## 6. Open decision register — no silent defaults in production

| Gate | Decision needed | Safe mock behavior now |
|---|---|---|
| G01 | Student-code privacy model; second factor only if explicitly approved | Synthetic one-code lookup; live port unavailable |
| G02 | USED page cancellation/reversal/correction SOP | Disabled reason-labelled correction action |
| G03 | Part-used return/reissue and returned/closed reopening policy | Inspect/save draft counts; final partial-return/reopen disabled |
| G04 | Actual OBEC mapping and DOCX templates | Semantic preview; final export unavailable |
| G05 | Actual fee amounts, overlaps, frequency eligibility, partial/multi-item/group compatibility | Synthetic amounts; baseline full single-item payment; gated alternatives |
| G06 | finance_teacher optional permissions; delegation of fee setup | Explicit mock grants in UI_CONTRACT; live grants must be authoritative |
| G07 | T-Academy data transport and freshness threshold | Mock stale scenario; no live sync |
| G08 | T-Folio/Auth project/UID mapping; first admin provisioning | Synthetic staff identity; no browser bootstrap |
| G09 | Pending-reference and `not_required` policy; backdating/period locking | Linked-only normal commit; existing pending records viewable |
| G10 | Carry-forward six physical IDs and movements | Confirmed aggregate 6+80=86 with visible unresolved range |
| G11 | Direct-SDK invariant/rules proof, trusted-service need, budget/hosting plan | Mock-only build; no live mutation export |
| G12 | Who records paper memo stages and retention policy | Show full chain; stage changes disabled unless explicit capability/policy provided |

These do not block the requested design deliverables. They block the corresponding live features. A later implementer must not resolve them by guessing.

## 7. Production gates (future work)

1. Resolve applicable G01–G12; record school/finance/security decisions with date and scope.
2. Rebuild rules from audited entities. Test forbidden cross-room access, self-promotion, inactive users, orphan records and audit tampering using direct calls.
3. Prove command idempotency, concurrency, atomicity and authoritative timestamps; reject stale versions.
4. Verify actual templates and opening stock. Approve finance UAT and correction SOP.
5. Measure costs, backups/restores, retention and exports. Review static hosting plan; inspect deployment output for zero runtime functions.
6. Remove development role/scenario tooling from live build; prevent mock fallback on live adapter failure. Conduct a scoped pilot before wider release.

Companion documents: [design system](DESIGN_SYSTEM.md), [UI contract](UI_CONTRACT.md), [screen specifications](SCREEN_SPEC.md), [component inventory](COMPONENT_INVENTORY.md), [execution tasks](FRONTEND_TASKS.md).
