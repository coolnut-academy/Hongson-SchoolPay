# Hongson-SchoolPay — Deterministic frontend execution plan

Revision: 2026-10-16 · v1 · Handoff for a coding model.

## Continuous implementation checkpoint — 2026-10-16

**24 unique implementation IDs:16 complete,8 remaining (2 partial +6 externally blocked).** Counts include T09 and its two named subtasks separately. T00–T13, including T09a/T09b, meet their mock acceptance criteria. T14 remains partial for manual screen-reader, actual200% browser zoom, real-device/school-user review and approved image baselines; T15 automation/documentation passes but its handoff depends on T14. All six LIVE tasks remain externally blocked. See [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) for the reconciled inventory, dependencies and exact external inputs.

Current T14/T15 verification:44/44 unit tests;99/99 Chromium/Firefox/WebKit browser cases (33 each), zero failed/skipped/flaky; lint/TypeScript; production build, bundle/boundary checks; all17 staff deep links/reloads; production dev-tool exclusion; missing-asset404; separate live-mode fail-closed build/smoke. Local Firebase emulators passed27 denial checks against unapplied deny-all quarantine rules. Auth Bridge orchestration and fictional-driver tests are prepared; no configured Firebase SDK driver, real school identity/directory transport or live financial writes are active. All independently completable T14 QA and T15 handoff deliverables are finished. The QA ledger maps all37 criteria; new automated checks cover emulated200%/400% reflow, native-key workflows, skip-link focus/history, actual reduced-motion transitions/indicator and exact390x844/1440x1000 golden review captures. Fixed WebKit opener capture after a focusable landmark was introduced. Subsequent visual review corrected executive grade fills to the existing primary token;6/6 targeted visual cases across all engines and44 unit/static/production checks passed on final source. The99-case full run precedes this final two-file visual correction; separate follow-up evidence is retained. See docs/qa-acceptance.md, docs/implementation-handoff.md and docs/live-integration-checklist.md. Formal T14/T15 remain partial until manual acceptance and the original dependency are met; no LIVE task is completed. This checkpoint supersedes older backlog statements below; historical evidence is retained.

## Stage B actual implementation — 2026-10-16

**Working React frontend implemented.** This status supersedes the documentation-only status and the earlier golden-screen sequence. The user's Stage B instructions explicitly authorize Tailwind instead of CSS Modules, and select Student/Parent, Finance Payment, Physical Receipt Ledger and Fee Master/Assignment as the four golden workspaces. The T00–T15 matrix below remains the broader backlog; it is not a claim of full-product completion.

| Work | Actual status and implementation |
|---|---|
| Static foundation | Complete: Vite, React, strict TS, Tailwind, exact npm lock, local Thai font/license, lazy routes; no server code |
| Shared UI | Complete for Stage B: `src/styles/`, `src/components/ui.tsx`, `Shell.tsx`, `UnsavedChangesGuard.tsx`; shells, navigation, panels, fields, buttons, status/money/detail components, dialog/drawer, errors/loading/empty states |
| Mock boundary | Complete: `src/ports/SchoolPayAdapter.ts`, `src/app/AppProvider.tsx`, `src/adapters/mock/`; in-memory fixtures, abortable reads, scenarios, satang validation, idempotency, atomic local changes and version/page checks |
| Student/Parent | Complete: code69024 lookup, balance/cards, two-year history, reference drawer, unavailable announcement-file state; `src/features/StudentPage.tsx` |
| Finance payment | Complete: lookup, full single-obligation amount, method, explicit book/page selection, review/confirmation, conflict/error/lost-response recovery, unsaved-navigation protection; `src/features/FinancePage.tsx` |
| Physical receipt ledger | Complete golden workspace: two active books,50-page grid, search/filter/details, AVAILABLE VOID reason, mock audit and return reconciliation preview; `src/features/LedgerPage.tsx` |
| Fee Master / Assignment | Complete golden workspace: student/other masters, filters, create/edit/deactivate, room/year selection, draft amounts, copy-next-year, versioned publication and duplicate-generation skip; `src/features/FeesPage.tsx` |
| T09a Homeroom Monthly Collections | Complete bounded mock feature: lazy `/app/homeroom/collections`, assigned-room/month filters, seven-debtor desktop table/mobile cards, versioned human-note editing, read-only live amounts, scoped access and loading/empty/error/stale states; `src/features/HomeroomPage.tsx` |
| Verification and running | See `docs/frontend-validation.md` for actual results and `docs/implementation-toolchain.md` for `npm ci` / `npm run dev`, module boundaries and Stage B overrides |

Current code deliberately consolidates domain helpers and fixtures instead of creating empty future modules from the earlier directory skeleton. Font files are self-hosted build assets from the pinned Fontsource package, with the license in `public/licenses/`. The package manifest and lockfile now exist and must be inherited.

### Remaining full-product backlog

The core mock backlog through T13 is implemented and verified, including shared tooling, scoped caches/navigation, other-money/pending references, stock/issue/full-return, monthly revisions/memo registry, dashboards, generation/lifecycle previews, access management, audit and all eight report families. Policy-gated new debt, partial/group payment, USED corrections, partial-return commit, paper-stage mutation and template-dependent files remain unavailable as required. T14 manual QA and T15 dependent handoff remain partial; LIVE-01–06 require the external contracts recorded in the progress register. No live backend, official receipt output or deployment was added.

### T09a — completed and verified, 2026-10-16

Implemented `/app/homeroom/collections` as an isolated mock feature using the existing shell, tokens, fields, badges, dialogs and unsaved-change guard. Scoped adapters seed the approved ม.2/1 roster:40 students,7 debtors,฿180,000 adjusted,฿167,500 paid,฿12,500 outstanding and3 missing human entries. Human notes save explicitly with version checks, documented text limits, blank draft support and inline status; financial values remain read-only and derive from account fixtures. Finance/Executive roles have read-only follow-up access. Unassigned-room deep links, empty assignments/months, loading, validation, offline retry, read errors and stale data have explicit states. Month/room navigation, browser back, row changes and editor close protect unsaved notes. Notes remain in memory across scoped re-reads and reset on a full browser reload, consistent with the existing mock lifecycle.

Verification passed: TypeScript;21 unit tests;16 Chromium browser tests including every Stage B regression; production build; static/boundary checks; production SPA smoke including the new deep link/reload. Desktop1440px and mobile390px screenshots were inspected in `artifacts/screenshots/homeroom-*.png`; keyboard editing, focus return, WCAG2/2.1 A/AA automated checks and320/768/1280px overflow checks pass. No dependency, live backend, real transaction, receipt output or deployment was added.

### T09b — completed in the continuous implementation mission

Implemented immutable monthly financial revisions, explicitly reviewed refresh differences, matching-note retention, prior revision inspection, draft-note version checking, readiness links and semantic memo preview at `/app/monthly-followup`. The five-stage paper timeline is read-only under unresolved G12; final DOCX remains unavailable under G04. Initial bounded verification passed22 unit tests and8 relevant browser tests. The subsequent room workspace and memo registry complete parent T09; final regression passes44 unit and87 browser tests across three engines. T09b is not the final task; T14/T15 acceptance still controls the frontend integration milestone.

## 1. Execution contract

Implement the specified mock frontend, not a new design. Do not start live Firebase/Auth/Storage/T-Academy/T-Folio integration, deploy a site, modify confirmed business rules, or generate/print official receipts. Preserve the original fourteen Markdown files and existing proposal assets. The Stage B status above describes the implemented app; the remaining matrix describes the full-product backlog.

Read in this order:

1. [ARCHITECTURE_RISKS.md](ARCHITECTURE_RISKS.md): precedence, locked decisions, risks and G01–G12.
2. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): exact tokens, shell, typography and responsive behavior.
3. [UI_CONTRACT.md](UI_CONTRACT.md): roles, routes, adapter ports, commands and error states.
4. [SCREEN_SPEC.md](SCREEN_SPEC.md): fixture baseline and golden G1–G4.
5. [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md): file/component ownership and prop contracts.
6. This task sequence and acceptance matrix.

Missing policy/template/source data is not permission to guess. Implement the documented unavailable/blocked state, leave the feature mock-only and record the relevant gate. No clarification is needed for colors, spacing, navigation, table columns, screen selection or labels: they are already fixed. If these documents conflict with a confirmed audit rule, preserve the audit rule and report the conflict before changing behavior.

## 2. Toolchain and project shape

Use Vite React TypeScript with strict TS; React Router client routing; Tailwind + shared token/component CSS per the Stage B user override; a single TanStack Query cache; native controls; Radix Dialog behind shared Dialog/Drawer wrappers; tree-shaken Lucide outline icons. Do not add a dashboard template, second component library, Redux, chart library, Next.js, server code or Firebase packages in this mock phase. Six-grade chart uses HTML/CSS plus an accessible table. Stage B uses Vitest domain/adapter tests and Playwright + axe browser checks; add a component test library only when a later task needs it.

Stage B resolved exact package versions (no `^`/`~`) and supplies `package-lock.json`; Node/npm versions are recorded in `docs/implementation-toolchain.md`. Inherit these versions and use `npm ci`. This is not permission to change the UI contract. Use npm only. Do not pin the old README's Vite5/React18 badges as if audited requirements demanded them. Review package support/security when intentionally upgrading dependencies.

Use the primary setup references: [Vite React TypeScript/static build](https://vite.dev/guide/), [React Router declarative installation](https://reactrouter.com/start/declarative/installation), [TanStack Query overview](https://tanstack.com/query/latest/docs/framework/react/overview), and [Radix Dialog accessibility/API](https://www.radix-ui.com/primitives/docs/components/dialog). These informed the boundary choices; they do not override this project's static-only constraint.

Expected scripts: `dev`, `typecheck`, `lint`, `test`, `test:e2e`, `build`, `preview`, `check:boundaries`, `check:static`. `build` must typecheck then emit static assets into `dist/`. `check:boundaries` rejects Firebase imports outside the future adapter boundary, domain imports of UI, and any receipt export type. `check:static` rejects server/framework directories/dependencies and checks emitted output contains only static assets. Denylist checks supplement, not replace, behavior tests.

Directory skeleton follows COMPONENT_INVENTORY. Additional deterministic paths:

```text
src/app/createAdapters.ts
src/app/AdapterProvider.tsx
src/app/router.tsx
src/app/navigation.ts
src/domain/money.ts
src/domain/periods.ts
src/domain/permissions.ts
src/domain/financialInvariants.ts
src/domain/receiptState.ts
src/domain/errors.ts
src/ports/index.ts
src/adapters/mock/fixtures/baseline.ts
src/adapters/mock/fixtures/scenarios.ts
src/adapters/mock/MockStore.ts
src/adapters/mock/createMockAdapters.ts
src/development/ScenarioPanel.tsx
src/test/domain/
src/test/components/
tests/e2e/
docs/implementation-toolchain.md
docs/frontend-validation.md
```

Do not create live adapter implementation files yet. A short boundary README may reserve `src/adapters/firebase/`. All approved fonts are self-hosted under `public/fonts/` with their license. No runtime Google Fonts or remote image dependencies. No app PII in persistent browser storage.

## 3. Ordered task DAG

Execute in ascending order. Dependencies listed are mandatory; all required mock tasks complete before handoff. Each task is small enough for a separate reviewable change. Do not treat future release gates as permission to leave core mock navigation or failure states unimplemented.

| Task / dependency | Concrete implementation output | Acceptance / stop conditions |
|---|---|---|
| T00 / none | Read all foundation documents and this package; record source precedence and G01–G12 in implementation notes; inventory current workspace before changes | Confirm DEC-001–011 preserved; no original document edited; no official template assumed present |
| T01 / T00 | Scaffold package, strict TS, Vite, router shell, scripts, exact dependency lock, token/global CSS, local font/license, test configuration | `npm ci`, typecheck and production build pass; no Firebase calls/server runtime; no redesigned token values |
| T02 / T01 | Domain types, satang parser/formatter, explicit period formatters, role/capability selector, financial invariants, page state guards | UT01–UT06 pass; all arithmetic uses safe integers; no role from localStorage; academic/fiscal types distinct |
| T03 / T02 | Ports, typed errors, MockStore, fixed baseline-v1, query aborts, deterministic scenario hooks, idempotent command outcomes | CT01–CT06 pass; no random totals; all used pages linked; isolated scenario reset; unknown outcome can resolve by key |
| T04 / T03 | P01–P18 primitives, domain Money/Badge/Field patterns, gallery, modal focus handling, state panels | Thai labels/long names, keyboard/error-summary/focus tests pass; palette/tokens only; accessible control targets |
| T05 / T04 | Staff/Student shells, navigation metadata, all route guards, role-specific landing, demo banner, scoped query provider, error boundaries, dev persona/scenario tools | Every audited route has correct shell; denied routes do not fetch; all five roles + visitor tested; dev controls absent in non-dev route manifest |
| T06 / T05 | S00–S03; golden G1 including minimal visitor lookup, balances/cards, payment/reference sheet,2-year history, announcement unavailable-file behavior | E2E01/02, G1 snapshots; no receipt-output affordance; change-code clears data; desktop/mobile complete |
| T07 / T06 | Shared receipt selectors/review/outcome; S08 golden G2, S09 other money, pending reference read/link path; commit reducer | E2E03–06, G2 snapshots; exact1,500 payment updates student/book/live summaries once; no other-money debt; races/offline/unknown handled |
| T08 / T07 | S10–S12 book/movement lists,50-page grid/detail, AVAILABLE VOID reason, issue mock, return preview and reconciliation states | E2E07; two active books visible;49 blocks; partial return gate explicit; original6+80=86 unchanged; no arbitrary page recycling |
| T09 / T08 | S05–S07; golden G3 room/month scope, human-note editor, frozen snapshot/diff refresh, semantic memo preview, paper-stage timeline | E2E08/09, G3 snapshots; seven debts12,500; three missing entries shown; actual DOCX export correctly unavailable |
| T10 / T09 | S04 all role dashboards; golden G4 executive aggregate, six-grade bars/table, separate other-money totals, readiness dashboard | E2E10, G4 snapshots;5.4m=4.8m+0.6m;88.9%; receipt/other totals not mixed; mock drilldown limits explicit |
| T11 / T10 | S13–S14 separate masters, year-copy draft, assignment preview, versioned publish, separate generation preview, lifecycle-review placeholder data | E2E11; readonly executive; overlap/unpublished/stale blocked; no automatic debt waiver; amounts configurable in mock, not fee code constants |
| T12 / T11 | S16/S17 access management, room assignments, capability diff/reason, scoped audit; fill superadmin dashboard links | E2E12; final-admin safety, stale-role conflict, executive read only; source profiles immutable; audit readonly |
| T13 / T12 | S15 report families, scoped filters, semantic previews, validations, template metadata, format availability and no-receipt-output allowlist | E2E13; missing templates block files; failed reconciliation blocks final; draft mode never bypasses missing template |
| T14 / T13 | Responsive, accessibility, empty/error/denied/stale/unknown-state pass across all routes; golden screenshots and fixture arithmetic check | QA01–QA07; no unimplemented core route; no blank button/no-op disguised as success; all limitations visibly explained |
| T15 / T14 | Static build/reload verification, bundle report, boundary checks, mock-only release safeguards, validation report and run instructions | BUILD01–BUILD05; record actual test outputs and limitations; no deployment or live data credentials |

The full-product mock backlog is done only after T15; the narrower Stage B completion is recorded above. Later production work is a new phase, gated by the audit. Do not label a successful static build as production approval.

## 4. Adapter fixture implementation detail

Use one in-memory store per app session. `reset('baseline-v1')` restores immutable fixture objects by cloning; clears command outcomes, cache and selection. Freeze clock in test harness; normal demo clock remains the declared snapshot time so screenshots do not drift. Mock read delay300ms; writes500ms. Tests can advance timers without sleeping. `loading` scenario is explicitly held/released, not an infinite accidental promise.

Populate every selected student's obligations and payment allocations, each ledger USED page and its linked transaction, and the seven room debts exactly as SCREEN_SPEC. For other six outstanding room students derive paid as4,500 minus outstanding, using a single synthetic room-account projection per student; the mock room totals must reconcile. These projections do not require inventing additional pages in the two visible books. Their detailed ledger history is unavailable unless explicitly seeded. A user asking for unseeded detail gets an honest demo limitation, never fake data.

School aggregate is a separate fixture with explicit delta handling. A committed payment for student-001 changes grade2 and school collected/outstanding/counts exactly once. A failed command changes none. Its homeroom live view updates, while monthly batch remains frozen until refresh. Export preview identifies which dataset/revision it uses. Other-money examples update only other-money views and physical pages. A test must detect accidental mixing of academic and fiscal datasets.

Optional finance grants and partial/multi-item payment policies use explicit scenario objects. The normal product interface cannot toggle school policy to bypass a gate. These scenarios demonstrate layouts and validation, not confirmed production permission.

## 5. Automated acceptance cases

### Domain and contract tests

| ID | Given / when / then |
|---|---|
| UT01 money | Parse `1500.00`→150000 satang; format→1,500.00; reject1.001, negative payment,NaN,Infinity,exponent and unsafe integer; allow0 fee |
| UT02 allocations | Sum allocations equals payment, same student, unique target IDs, each≤outstanding; duplicate/overpaid/mixed-student rejects without mutation |
| UT03 page | book+page unique; page1..50; only AVAILABLE can be linked; VOID has reason; no delete/recycle; available+used+void50 plus exact membership |
| UT04 periods | Display ISO instant using Bangkok and BE year; fixture academic2569 remains separate from fiscal2570;2568 history selectable; no academic term guessed from clock |
| UT05 role/scope | Homeroom sees onlyassigned rooms; executive cannot receive/write roles; optional finance-teacher grant omitted by default; inactive/unknown principal denied |
| UT06 summary |4500=3000+1500; room180000=167500+12500; school5400000=4800000+600000; zero denominator is unavailable; waiver not counted as cash |
| CT01 idempotency | Same command ID + same payload twice yields one transaction; same ID + different payload rejected |
| CT02 competing links | Two commands select page13; one commits, other PAGE_UNAVAILABLE; one increment only |
| CT03 pending link | Existing pending transaction linked to page changes reference and audit only, never received money twice |
| CT04 scope/cache | Switching principal or assigned-room version cancels inflight read and clears scoped data; late response cannot repopulate old scope |
| CT05 unknown outcome | Commit accepted/response lost; status lookup recovers original result; no duplicate submission |
| CT06 invariants | Mock transaction failure restores all records; no orphan payment/page/audit; other-money command cannot contain student allocation |

These prove mock behavior and domain rules only. They do not replace future direct-SDK Security Rules/emulator/concurrency tests.

### Browser workflow tests

| ID | User task / pass condition |
|---|---|
| E2E01 | Enter69024, inspect current balance, open pay-009 reference; no official receipt action/output route exists |
| E2E02 | Switch history2568, inspect4,000; clear lookup/change student; browser back reveals no previous visitor data |
| E2E03 | Finance select student, full1,500, book379/page13, review/confirm; persistent success; balance0, book12/1/37; next student clears form |
| E2E04 | Trigger page-conflict and balance-changed scenarios; preserve valid draft fields, clear/review conflicting fields; no silent resubmit |
| E2E05 | Unknown committed outcome resolves using original key; offline commit blocked with no queued financial write |
| E2E06 | Other money12,000/book380/page5 recorded; no student obligation/payment balance change; appropriate ledger link |
| E2E07 | Inspect50 pages, VOID available with reason; no USED cancellation shortcut;49 mismatch blocks return; partial return gate shown |
| E2E08 | Homeroom saves human note; no money fields editable; unauthorized room deep link denied |
| E2E09 | Payment after frozen monthly snapshot leaves12,500 unchanged; refresh preview shows11,000 and creates revision only on confirmation; missing template blocks DOCX |
| E2E10 | Executive exact aggregate/bar/table data; other78,000 separate; no receive/role-edit control; report route retains filters |
| E2E11 | Copy fee draft, modify amount, preview scope, publish then separately generate; duplicate generation skips existing records; overlapping assignment blocked |
| E2E12 | Superadmin reviews role/room diff with reason; last-admin removal rejected; executive view read-only; scoped audit displayed without edit/delete |
| E2E13 | Report validation shows broken used-page link; no final export; absent XLSX/DOCX cannot be bypassed by draft mode; allowed document types exclude receipts |

### Visual/accessibility checks

| ID | Check |
|---|---|
| QA01 | G1 at390×844; G2/G3/G4 at1440×1000; also all four at both sizes; fixed clock/data/fonts; committed image baselines after review |
| QA02 | All routes at320/390/768/1024/1440 widths,200% zoom and320px effective reflow; no page-level horizontal scrolling except explicitly labelled data regions |
| QA03 | Keyboard completes lookup, reference inspection, finance review/cancel/submit, note save and role diff; visible focus; modal trap/return; skip link |
| QA04 | axe checks plus manual screen-reader headings/landmarks/field errors/status announcements; automated results alone do not establish WCAG compliance |
| QA05 | Verify contrast for actual text/status/control/focus pairs;44px targets; long Thai names/diacritics; reduced-motion preference |
| QA06 | Loading/empty/error/forbidden/stale/offline/conflict/incomplete variants for relevant routes; no zeros substituted for unavailable amounts |
| QA07 | Search UI/action/output code and route manifest for receipt generation/print/download affordances; manually inspect references, history and reports so banned behavior cannot hide behind different labels |

### Static and boundary checks

| ID | Check |
|---|---|
| BUILD01 | `npm ci`, lint, typecheck, unit/component tests, e2e and `npm run build` pass once after final changes |
| BUILD02 | Output `dist` only static HTML/JS/CSS/font/assets; no `/api`, middleware, SSR/runtime function outputs, service-account keys or Firebase connections |
| BUILD03 | Preview direct entry and reload on every canonical route under static SPA fallback; missing assets return asset errors rather than index HTML; document hosting rewrite requirement |
| BUILD04 | Initial JS≤250KiB gzip, CSS≤40KiB, initial font≤200KiB; per-route lazy loading; report libraries absent until template spike; no external requests in mock except local assets |
| BUILD05 | Non-dev builds contain no dev route/persona/scenario privilege tooling; live mode fails unavailable; no mock fallback; source/profile/financial data absent from localStorage/IndexedDB and telemetry |

## 6. Future production tasks — intentionally not implemented now

| Later task | Prerequisites / acceptance evidence |
|---|---|
| LIVE-01 identity and lookup | G01/G07/G08 resolved; authorized identity mapping, minimal visitor projection, privacy/abuse tests; no browser bootstrap |
| LIVE-02 finance persistence | G02/G05/G06/G09/G11; integer unit mapping, bounded command schema, atomicity/idempotency, authoritative actor/time, append-only audit, rules/emulator attack tests |
| LIVE-03 stock migration/return | G03/G10; signed six carry-forward IDs/movements,80 new books,4,300 unique pages, reconciliation, resumable idempotent import |
| LIVE-04 official templates | G04; actual XLSX/DOCX version/checksum and semantic mappings; compare candidate engines using real files; preserve formulas/merges/styles/print areas/Thai layout/signature spaces |
| LIVE-05 school policies | G05/G06/G09/G12; actual fee assignments, frequency/overlap/partial/group policy, pending references, correction SOP, paper-stage authority and retention |
| LIVE-06 pilot and hosting | All relevant gates, costs/load tests, provider plan review, backups/restore, scoped pilot/finance sign-off; static deployment artifact remains no-SSR/no-API/no-middleware |

Do not choose an XLSX/DOCX engine solely because the legacy README named one. Test actual templates first; a generic grid export is not an acceptable replacement for OBEC output. If Firestore rules cannot safely enforce the command invariants, stop that live feature and present an explicit trusted Firebase-side service proposal. Never work around it with a hidden Vercel API route or weaker validation.

## 7. Handoff report requirements

Write `docs/frontend-validation.md` with actual commands/results, screenshot locations, measured bundle sizes, accessibility checks, unresolved gates and mock limitations. State plainly that no live backend is connected and no official receipts can be produced. Link instructions to start/reset the demo and select each persona/scenario. Do not claim tests, generated document fidelity, security enforcement or production readiness that have not been verified.

For this design-only delivery, verification is limited to source reading, cross-document review, fixture arithmetic, token contrast calculations and document/link checks. There is no app build, visual rendering or browser test result yet.

### Design package verification — 2026-10-16

- Checked all six deliverables for UTF-8 replacement characters, balanced code fences, conflict markers and local link targets:37 local links resolved before final wording updates; rechecked the complete package after edits.
- Calculated student/room/school totals,88.9% collection rate,11+1+38 and12+1+37 page states,6+80=86 opening stock,4,300 pages and78,000 other-money category sum; all reconcile.
- Calculated sRGB contrast: text/white14.75:1, secondary/white6.30:1, muted/canvas4.70:1, white/brand7.28:1; status pairs6.01–6.61:1; control-border/white3.79:1; focus/white7.48:1. These are palette checks, not rendered accessibility certification.
- Four golden specifications and S00–S18 coverage are present. Only the six new Markdown deliverables are workspace changes; source documents and proposal assets remain unchanged.
