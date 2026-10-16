# Hongson-SchoolPay — Component inventory

Revision: 2026-10-16 · v1 · Build shared components before role screens.

Visual values come exclusively from [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Permissions, states and ports come from [UI_CONTRACT.md](UI_CONTRACT.md). Screen composition comes from [SCREEN_SPEC.md](SCREEN_SPEC.md). The names/paths below are implementation targets, not claims that code already exists.

## 1. Ownership and import rules

```text
src/
  app/                  composition root, router, providers, error boundary
  styles/               tokens.css, global.css
  domain/               money, periods, obligations, receipts, permissions, errors
  ports/                adapter interfaces and DTOs
  adapters/mock/        deterministic fixtures and in-memory implementations
  adapters/firebase/    future boundary only; no implementation in this phase
  components/ui/        visual primitives; no domain queries
  components/layout/    shells, navigation, page header
  components/domain/    reusable business displays/forms with typed props
  features/             route controllers and feature-specific panels
  development/          scenario and persona tooling; dev/mock only
  test/                 fixtures, helpers and accessibility/integration tests
```

Import direction: feature→shared component/domain/port; mock adapter→domain/port. Domain cannot import React, Firebase or feature modules. Shared components cannot import features or query adapters. Only `app/createAdapters.ts` constructs implementations; feature hooks consume ports through context. Firebase packages/types may only appear in the future adapter directory and composition root wiring after authorization. No money formatting duplicated in route JSX.

Use CSS Modules for component styles and global CSS only for reset/tokens/type/utility primitives. Do not adopt a second visual component kit mid-build. Use native inputs/selects/tables; an accessible dialog primitive may underlie Dialog/Drawer/Menu. Public wrapper contracts below stay stable if implementation libraries change.

## 2. Primitive inventory

| ID / component / path | Public props and behavior | Required states / accessibility |
|---|---|---|
| P01 `Button` `components/ui/Button.tsx` | variant primary/secondary/tertiary/danger; loading; disabled; leadingIcon; type defaults button; children; onClick | Idle/hover/focus/pressed/loading/disabled;44px; disabled reason lives in parent; no automatic submit |
| P02 `Field` `ui/Field.tsx` | id, label, required, hint, error, children; generates label/describedby links | Required wording, field error, focusable error-summary target; never label-only placeholder |
| P03 `TextInput` / `TextArea` `ui/TextInput.tsx`, `TextArea.tsx` | Controlled value/onChange; type/inputMode/maxLength; readOnly; native attributes | Readonly differs visually from disabled; textarea preserves Thai wrapping and newline |
| P04 `Select` `ui/Select.tsx` | Labelled native select, options value/label/disabled/reason, placeholder, value/onChange | Empty selection required for book/page; no automatic first option |
| P05 `ChoiceGroup` `ui/ChoiceGroup.tsx` | Radios or checkboxes with labels, value(s), onChange, disabled | fieldset/legend;44px label targets; arrow-key radio behavior |
| P06 `StatusBadge` `ui/StatusBadge.tsx` | domain + exact status union; optional concise variant | Fixed label/tone/icon mapping; unknown status fails visibly, never maps to success |
| P07 `Card` / `SectionHeader` `ui/Card.tsx` | title, description, actions, children; optional padding density | Semantic section with heading; no clickable-div cards |
| P08 `Dialog` `ui/Dialog.tsx` | open/onOpenChange, title, description, footer, children, initialFocusRef | Focus trap/return/Escape, scroll body, accessible description, no nested modals |
| P09 `Drawer` `ui/Drawer.tsx` | Dialog contract + width480/wide; in-sheet back action | Desktop right overlay/mobile fullscreen; heading focus, one overlay at a time |
| P10 `Tabs` `ui/Tabs.tsx` | id, tabs, value/onChange, activation manual | Keyboard roving focus; arrow keys then Enter/Space activates; nav links use nav component instead |
| P11 `Alert` `ui/Alert.tsx` | tone info/warning/danger/success; title/body/actions; announce boolean | Text + icon; no repeated live announcement on every rerender |
| P12 `EmptyState` / `ErrorState` `ui/StatePanel.tsx` | title, body, allowed action, correlationId optional | Distinct empty/error/denied; never cheerful illustration for financial error |
| P13 `Skeleton` `ui/Skeleton.tsx` | width/height/rows with token dimensions | aria-hidden; parent busy message; reduced-motion support |
| P14 `DataTable<T>` `ui/DataTable.tsx` | typed columns, rows, getRowKey, sort/onSort, pagination; loading/empty/error slots | Semantic caption/headers, aria-sort; explicit row action; no hidden row click requirement |
| P15 `Pagination` `ui/Pagination.tsx` | pageSize25/50, nextCursor, canPrevious, onNext/onPrevious | Cursor semantics, no invented total-page count; scoped change resets cursor |
| P16 `ErrorSummary` `ui/ErrorSummary.tsx` | entries fieldId/message, title, focusOnAppear | Link to invalid controls; submit focuses summary |
| P17 `ToastRegion` `ui/ToastRegion.tsx` | structured notices id/tone/message | Polite live region; financial results also persist inline; no toast-only recovery |
| P18 `Icon` `ui/Icon.tsx` | named icon, size16/20/24, decorative or accessible name | One outline system, aria-hidden when paired with text; no receipt printer icon |

## 3. Shell and navigation inventory

| ID / component | Contract / responsibility | Used by |
|---|---|---|
| L01 `StaffShell` `components/layout/StaffShell.tsx` | Principal, navigation, topbar context, children. Desktop sidebar/tablet rail/mobile drawer; owns skip link and main region | S04–S17 |
| L02 `StudentShell` `layout/StudentShell.tsx` | Visitor context, current route, endLookup callback. Mobile three-tab bottom nav/desktop top nav; safe-area reservation | S01–S03 |
| L03 `RoleNavigation` `layout/RoleNavigation.tsx` | Pure `getNavigation(principal)` result, fixed order/group labels. No independent permission logic in each menu row | All staff |
| L04 `PageHeader` `layout/PageHeader.tsx` | breadcrumb/title/subtitle/actions/context; mobile actions stack | All screens |
| L05 `FilterBar` `layout/FilterBar.tsx` | labelled filter children + apply/reset actions; explicit applied-state indicator | Staff lists/reports |
| L06 `DemoBanner` `layout/DemoBanner.tsx` | Fixed synthetic-data copy; development persona tools separate | Every mock route |
| L07 `StickyActionBar` `layout/StickyActionBar.tsx` | summary, actions, dirty/submitting state; reserves document bottom space | Mobile payment/follow-up/admin forms |
| L08 `RouteAccessBoundary` `app/RouteAccessBoundary.tsx` | Auth state/capability/scope gate; denies before query mount; never security enforcement substitute | Protected routes |
| L09 `AppErrorBoundary` `app/AppErrorBoundary.tsx` | Redacted error message, retry/reload and safe home; no raw exception dump | App root + route chunks |
| L10 `DirtyFormGuard` `layout/DirtyFormGuard.tsx` | isDirty, leave intent, confirm discard; browser unload warning only best effort | Money/follow-up/fee/access forms |

The student bottom nav and staff sidebar are built from route metadata, not tab-panel components. Active route uses `aria-current="page"`. Staff role badge is informational; clicking it cannot escalate access.

## 4. Shared domain components

| ID / component | Stable input/output contract | Use / invariants |
|---|---|---|
| D01 `Money` `components/domain/Money.tsx` | value:Satang, currency:true/false, emphasis:body/metric/display | All financial displays; one exact formatter; null is unavailable, not0 |
| D02 `MetricCard` `domain/MetricCard.tsx` | label, formatted value, unit, caption, loading, completeness | G1–G4; not responsible for calculating money |
| D03 `PeriodSelector` `domain/PeriodSelector.tsx` | discriminated academic(year/term) or fiscal(year), options, onChange | Never interchange year meanings; no hard-coded school term calendar |
| D04 `SourceFreshness` `domain/SourceFreshness.tsx` | sourceLabel, sourceUpdatedAt, fetchedAt, stale, completeness, onRefresh | Directory/profile/report contexts; no fabricated current time |
| D05 `StudentIdentity` `domain/StudentIdentity.tsx` | minimal profile, density; optional source disclosure | Search result/finance/student/drawers; excludes family contact fields |
| D06 `ReceiptReferenceView` `domain/ReceiptReferenceView.tsx` | reference, date, amount, items, permission-filtered payer/receiver | Read-only metadata; no export/print prop; no official-looking receipt template |
| D07 `ReceiptBookSelector` `domain/ReceiptBookSelector.tsx` | activeBooks, selectedBookId, onSelect, disabled; holder/count labels | G2/S09; explicit selection; multiple active books |
| D08 `ReceiptPageSelector` `domain/ReceiptPageSelector.tsx` | selected book pages, selectedPageId, onSelect, availabilityAsOf | AVAILABLE options only for selection; explain used/void separately; no reservation claim |
| D09 `ReceiptPageGrid` `domain/ReceiptPageGrid.tsx` | exactly50 unique pages, mode inspect/select, onInspect/onSelect |10×5 desktop/5×10 mobile,44px cells; accessible label includes book/page/status |
| D10 `ReceiptReferenceFields` `domain/ReceiptReferenceFields.tsx` | book/page selectors + printedNo + error map; returns ReceiptSelection draft | Shared G2/S09/pending link; no auto-running number |
| D11 `AllocationEditor` `domain/AllocationEditor.tsx` | obligations, policy fullSingle/partial/multi, allocations, onChange | Reject duplicated/over-allocated targets; read-only paid rows; receives allowed policy, never invents one |
| D12 `MoneyInput` `domain/MoneyInput.tsx` | decimal string, onChange, error, allowZero; parsed by domain constructor | Input preserves typing; no float coercion/rounding on blur |
| D13 `CommandReview` `domain/CommandReview.tsx` | discriminated student/other/link/return/access draft, onConfirm/onEdit | Explicit financial identity/reference/amount; no generic “are you sure?” dialog |
| D14 `CommandOutcomePanel` `domain/CommandOutcomePanel.tsx` | reviewing/submitting/committed/unknown/error, safe next actions | Persistent result; unknown prevents resubmit; acknowledged result only |
| D15 `AuditTimeline` `domain/AuditTimeline.tsx` | scoped event DTOs; onLoadMore | Who/when/action/reason; redact sensitive raw fields; no edit/delete |
| D16 `ReconciliationPanel` `domain/ReconciliationPanel.tsx` | expected counts, physical counts, discrepancies, bookVersion, onEdit | Shows50 membership and counts; does not infer integrity solely from sum |
| D17 `PolicyGate` `domain/PolicyGate.tsx` | gateId, allowed, explanation, children | Makes unresolved policy explicit; no runtime bypass toggle in normal product UI |
| D18 `ReportValidationList` `domain/ReportValidationList.tsx` | issues severity/code/entityLink/message, status | No final-export action when failed/incomplete; links reauthorized |
| D19 `ReportPreview` `domain/ReportPreview.tsx` | allowed report type, semantic data, source revision, template status | Only report families; no ReceiptReferenceView-to-document conversion |
| D20 `PaperWorkflowTimeline` `domain/PaperWorkflowTimeline.tsx` | fixed five-stage chain, recorded stage events, capability | Paper status tracking; absent capability means read-only, no signatures |
| D21 `HorizontalBarChart` `domain/HorizontalBarChart.tsx` | labelled categories/values/max, valueFormatter, onSelect optional | Native HTML/CSS bars for six grades; equivalent data table; no chart library needed |
| D22 `VersionDiff` `domain/VersionDiff.tsx` | before/after structured values, reason, blocking conflicts | Fee publish, role change, snapshot refresh; never raw JSON-only UI |

### Key reusable prop shapes

```ts
type AvailabilityCounts = { used: number; void: number; available: number };
type BookChoice = {
  id: string; bookNo: string; holderName: string;
  counts: AvailabilityCounts; version: string;
};
type ReferenceFieldsProps = {
  books: readonly BookChoice[];
  pages: readonly { id: string; pageNo: number; status: PageStatus; version: string }[];
  selectedBookId?: string; selectedPageId?: string; printedNo: string;
  onBookChange(id: string): void; // parent clears page selection
  onPageChange(id: string): void;
  onPrintedNoChange(value: string): void;
  errors: Readonly<Record<string, string>>;
  busy: boolean;
};
type ReportKind = 'monthly_memo' | 'receipt_ledger' | 'obec_inspection' |
  'annual_usage' | 'book_return' | 'student_collections' |
  'student_outstanding' | 'other_money';
```

There is deliberately no receipt-output component, official receipt layout, receipt canvas, receipt PDF route or generic exporter accepting arbitrary entity HTML.

## 5. Feature composition (avoid screen-specific duplicates)

| Feature directory / route controller | Composition | Responsibility outside shared components |
|---|---|---|
| `features/entry/EntryPage.tsx` | Field, TextInput, Tabs, Button, StatePanel | Visitor lookup/session lifecycle; staff adapter entry |
| `features/student/StudentAccountPage.tsx` | StudentShell, StudentIdentity, PeriodSelector, MetricCard, Money, SourceFreshness, ReceiptReferenceView | Projection loading, charge cards and scoped history |
| `features/student/StudentHistoryPage.tsx`, `StudentDocumentsPage.tsx` | Table/cards, filters, reference drawer, document cards | Authorized history/document operations |
| `features/finance/StudentPaymentPage.tsx` | Search, StudentIdentity, AllocationEditor, MoneyInput, ReceiptReferenceFields, CommandReview/Outcome | Full form reducer, validation and one idempotent command |
| `features/finance/OtherMoneyPage.tsx` | Category/payer fields + same reference/review/outcome components | Other-money command with no student allocation |
| `features/receipts/BookListPage.tsx`, `BookDetailPage.tsx`, `PageLookupPage.tsx` | Table, PageGrid, ReferenceView, ReconciliationPanel, AuditTimeline | Movement/stock/return previews and gated commands |
| `features/homeroom/RoomPage.tsx`, `MonthlyFollowupPage.tsx` | PeriodSelector, MetricCard, Table/cards, human-note form, VersionDiff | Room scope and immutable snapshot vs live-data separation |
| `features/memos/MemoListPage.tsx` | Table, ReportPreview, PaperWorkflowTimeline | Memo metadata/stage capability; no imaginary file generation |
| `features/dashboard/DashboardPage.tsx` | Role-specific composition using metrics/chart/table/gate list | Chooses homeroom/finance/executive/superadmin model |
| `features/fees/FeeMasterPage.tsx`, `AssignmentPage.tsx` | Tabs, Table, forms, VersionDiff, PolicyGate | Separate masters, publish/generate steps, lifecycle review |
| `features/reports/ReportCenterPage.tsx` | Report cards, filters, ValidationList, ReportPreview | Report allowlist, format/template availability and authorization |
| `features/admin/UserAccessPage.tsx` | Table/cards, Drawer, ChoiceGroup, VersionDiff, review | Role/scope diff, active-state handling, last-admin safety |
| `features/audit/AuditPage.tsx` | FilterBar, Table, AuditTimeline | Scope/redaction; never mutation |

## 6. Component gallery and verification

Development route `/dev/components` is available only in dev/mock mode and excluded from production routing. Render all primitives with Thai labels, long values, keyboard focus and error states; domain gallery includes all audited statuses, both active books, empty books,50-page grid and a failed reconciliation. This is a local implementation aid, not a new production menu.

Meaningful tests: money parsing, allocation invariants, page uniqueness, command unknown-outcome behavior, focus trap/return, accessible field errors, role scoping, report allowlist and snapshot immutability. Avoid tests merely asserting every CSS class or shallow implementation detail. Golden screenshots verify visual composition after real fonts load. Full verification ownership and task dependencies are in [FRONTEND_TASKS.md](FRONTEND_TASKS.md).
