# QA acceptance ledger and procedures

2026-10-16. Review basis: all37 acceptance IDs in FRONTEND_TASKS.md. Current rerun outcomes are recorded in [frontend-validation.md](frontend-validation.md) and machine-readable artifacts/verification. This ledger maps the checks to their evidence and separates performed automation from unperformed human acceptance. No screenshot baseline, school approval, native zoom or assistive-technology result is fabricated.

## Current automated outcome

The complete post-fix run passed **99/99 browser cases**,33 each in Chromium/Firefox/WebKit, with zero failures/skips/flaky results in16.9 minutes. All44 unit tests, clean install, lint/TypeScript, production build/budgets/boundaries,17 built staff deep links/reloads, missing-asset404, dev-tool exclusion, visitor history and separate live-mode fail-closed checks pass. The local emulator rerun passed27 quarantine denials with an unchanged seed. Source/configuration integrity and all26 dist checksums are recorded in the [local handoff manifest](../artifacts/verification/handoff-manifest.json).

After that full run, visual artifact inspection identified transparent executive bar fills using undefined bg-brand. The final two-file correction uses existing bg-primary and adds rendered color/width assertions. All6 affected cross-browser visual/golden cases pass, and44 unit/static/production checks passed again on final source. The full99-case suite predates this isolated visual correction; it was not rerun afterward. [Follow-up JSON](../artifacts/verification/browser-final-visual-results.json) and both source snapshots in the checksum manifest preserve that distinction.

Automation found and fixed skip-link history/focus handling and a WebKit modal-opener capture regression. Twelve repeated WebKit focus/guard cases passed before the final full run. No original focus-return or privacy assertion was removed. Golden captures are dimension-checked review artifacts, not approved baselines. Formal T14 and its dependent T15 acceptance remain partial; independent QA/handoff work is complete and LIVE tasks stay blocked.

## Automated evidence map

| ID | Required witness | Automated evidence / remaining acceptance |
|---|---|---|
| UT01 | Safe amount parsing/formatting, invalid/exponent/unsafe values, zero fee | MockAdapter.test.ts and domain money helpers |
| UT02 | Allocation sum, same student/period, uniqueness, no overpay | invariants.test.ts; receive contract tests |
| UT03 | Unique physical book/page, exact50 membership, AVAILABLE link, VOID reason, no recycle | MockAdapter.test.ts, Scenarios.test.ts, StockReports.test.ts |
| UT04 | Bangkok/Buddhist instant, distinct academic/fiscal years and history2568 | MockAdapter.test.ts, invariants.test.ts, golden.spec.ts |
| UT05 | Canonical role/capability, assigned room, optional grant absent, inactive/unknown denied | permissions.test.ts, Homeroom.test.ts, Scenarios.test.ts, SchoolAuthBridge.test.ts |
| UT06 | Student/room/school equations and separated cash | Homeroom.test.ts, Workspace.test.ts, workspace.spec.ts |
| CT01 | Same command/payload replays once; changed payload rejects | MockAdapter.test.ts, Workspace.test.ts, StockReports.test.ts |
| CT02 | Competing physical-page commands have one winner | MockAdapter.test.ts, Workspace.test.ts |
| CT03 | Pending reference link adds no cash | Workspace.test.ts, workspace.spec.ts |
| CT04 | Principal/scope change cancels old reads/cache; late response stays cleared | Homeroom.test.ts, SchoolAuthBridge.test.ts; acceptance.spec.ts revocation/logout and admin-reports-stock.spec.ts room revocation |
| CT05 | Lost response resolves original command without duplicate | MockAdapter.test.ts, Workspace.test.ts, golden.spec.ts, acceptance.spec.ts |
| CT06 | Rejected writes leave records unchanged; no cross-kind allocation | MockAdapter.test.ts, Workspace.test.ts, Scenarios.test.ts; live durable proof remains LIVE-02 |
| E2E01 | Code69024, account/reference detail, no receipt output | golden.spec.ts visitor lookup/reference |
| E2E02 | History2568=4000, change code and back reveals no prior account | golden.spec.ts; immediate-back and lookup/no-name assertions retained |
| E2E03 | Full1500, explicit379/page13, one commit, balance/page updates, reset next | golden.spec.ts finance; qa-acceptance.spec.ts keyboard review/cancel/submit |
| E2E04 | Page/balance conflict, retain safe draft, no silent retry | golden.spec.ts, acceptance.spec.ts and adapter conflict tests |
| E2E05 | Unknown outcome recovery; offline no queued commit | golden.spec.ts, acceptance.spec.ts, adapter tests |
| E2E06 | Other12000/book380/page5, no student-debt effect | workspace.spec.ts and Workspace.test.ts |
| E2E07 |50 cells, AVAILABLE VOID, USED correction unavailable,49 mismatch, partial-return gate | golden.spec.ts, admin-reports-stock.spec.ts, StockReports.test.ts |
| E2E08 | Human-note save, read-only money, unauthorized room denied | homeroom.spec.ts; qa-acceptance.spec.ts keyboard note save |
| E2E09 | Frozen12500 then reviewed11000 revision, missing DOCX blocked | monthly.spec.ts and Monthly.test.ts |
| E2E10 | Six-grade equations/88.9%, other78000 separate, executive read-only and filters | workspace.spec.ts, acceptance.spec.ts, Workspace.test.ts |
| E2E11 | Copy/edit/publish separately from generation; duplicate skip and policy gates | golden.spec.ts, acceptance.spec.ts, Scenarios.test.ts |
| E2E12 | Role/room reason+diff, last-admin/stale protection, executive read-only, scoped audit | admin-reports-stock.spec.ts, Workspace.test.ts; qa-acceptance.spec.ts keyboard diff/confirmation |
| E2E13 | Broken USED link blocks final; no missing-template draft bypass; allowlist | admin-reports-stock.spec.ts, StockReports.test.ts |
| QA01 | Golden390x844/1440x1000, fixed data/fonts, reviewed committed baselines | Captures exist, including new fixed-size golden captures; official reviewed image baselines and approval remain pending |
| QA02 | Five widths,200% zoom and320px effective reflow | acceptance.spec.ts plus qa-acceptance.spec.ts720 CSS px/2x raster and320 CSS px/4x raster; native browser zoom menu/OS magnifier testing remains pending |
| QA03 | Keyboard form/review/cancel/submit, note/access diff, focus trap/return, skip link | qa-acceptance.spec.ts real key activation, native selects, staff/visitor skip focus; gallery/manual tabs and homeroom guard tests; no human AT claim |
| QA04 | Axe plus manual screen reader | Axe across engine/route/state coverage; manual headings/landmarks/errors/status announcements pending |
| QA05 | Actual contrast/focus/status pairs,44px, Thai names, reduced motion | Axe, rendered logout contrast, common visible main buttons/icon target measurements, reduced-motion computed styles; complete manual contrast/diacritics/device target review pending |
| QA06 | Loading/empty/error/denied/stale/offline/conflict/incomplete | acceptance.spec.ts, homeroom.spec.ts, golden.spec.ts, admin-reports-stock.spec.ts and scenario adapter tests; verify additional real-source failures during LIVE work |
| QA07 | No receipt generation/print/download or disguised output | Source/bundle boundary scan, route/action checks and reference/history/report artifact inspection; human release review of wording/output remains pending |
| BUILD01 | Clean install, lint, typecheck, unit/browser and production build | Run the complete sequence below; record actual exit codes/results, not only command definitions |
| BUILD02 | Static output only, no live credentials/SDK calls/server functions | check:boundaries and check:static; public artifact must contain only dist contents |
| BUILD03 | All canonical deep links/reloads, asset404 and documented rewrites | test:built and deployment procedure; actual host behavior remains external LIVE-06 |
| BUILD04 | JS/CSS/font budgets and lazy routes | check:static includes entry+modulepreload graph, raw CSS/fonts and13 feature chunks; report measurements |
| BUILD05 | No dev privilege/gallery tooling in production; live fails closed; no persistent app PII | test:built, test:live-unavailable, source/bundle checks; future live adapters require separate privacy verification |

The mapping does not turn mock authorization or in-memory atomicity into production guarantees. Test counts are not a numerical coverage percentage. A passed automated part does not close a row with pending manual evidence.

## Reproducible full automated acceptance

Use the pinned lockfile and installed Chromium/Firefox/WebKit binaries. Do not run against a stale externally started Vite server. Keep source and documentation unchanged while the browser run is active; run independent checks before or after it. Use separate result filenames for historical failed runs rather than overwriting their evidence and claiming they passed.

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run lint
npm run typecheck
npm test -- --reporter=default --reporter=json --outputFile=artifacts/verification/unit-results.json
npm run build
npm run check:boundaries
npm run check:static
npm run test:built
npm run test:live-unavailable
npm run test:emulator
$env:PLAYWRIGHT_JSON_OUTPUT_FILE='artifacts/verification/browser-results.json'
npm run test:e2e -- --browser=all --workers=2 --reporter=list,json
```

Run commands individually and stop on a nonzero exit. New QA tests use an effective viewport/raster model for200% and400% reflow, not the browser's native zoom menu, mobile pinch zoom or a screen reader. Record both the emulated result and the native-zoom gap. Source snapshots, money and approved UI tokens remain unchanged.

The emulator command uses the explicit demo-hongson-schoolpay project and loopback endpoints. It must never be redirected at a real project. Current rules deny all reads/writes. Rejected multi-document commits must leave the administrative test seed unchanged; owner bypass is confined to fixture setup/verification, never application authorization. Operational positive-read/write/security/concurrency tests are blocked until approved contracts exist.

## Pending manual acceptance protocol

No manual result is filled in. For each observation record tester/reviewer, date, OS/device/browser/AT and versions, fixture/scenario, exact steps, expected/actual result, screenshot/audio-safe evidence and defect reference. Re-test fixes before approval. Do not include real student information in review artifacts.

1. **QA01 baseline review:** compare all four golden screens at390x844 and1440x1000 with the approved SCREEN_SPEC/tokens, exact amounts, Thai text, geometry and states. Review generated captures; only the designated design/school reviewer can approve baseline promotion. No automatic snapshot update counts as approval.
2. **QA02 native zoom/devices:** in each desktop engine set native zoom200%, navigate all routes and complete core tasks; also test400%/320px effective reflow, browser back, long content and modal scrolling. On actual iOS Safari/Android Chrome check orientation, virtual keyboard, touch, select/month controls, focus visibility and sticky controls. Emulated WebKit is not an iPhone certification.
3. **QA03/04 AT:** with approved screen-reader combinations such as NVDA+Firefox/Chromium and VoiceOver+Safari, navigate headings/landmarks, lookup and finance errors, money/statuses, table headers/mobile definition lists, manual tab activation, dialog title/description/trap/return, note save, access diff and polite result announcements. Confirm labels/required/errors are announced once and protected content disappears after logout/revocation. Actual combinations are to be selected and recorded by the QA authority.
4. **QA05 visual/interaction:** verify actual text/status/control/focus contrast pairs, visible focus under zoom, long Thai names/diacritics,44px effective targets including checkbox/radio labels, high-contrast/forced-color preferences where supported and reduced motion. Axe and common-button measurements do not cover every native-control/device combination.
5. **QA06/07 school workflow:** school/finance users inspect missing/incomplete/stale/conflict/unknown states, verify no unavailable number is shown as zero, review reference/history/report labels and confirm there is no official receipt output. Review all policy/template limitations; do not approve fictional data as actual school accounting.

Acceptance owners: accessibility/QA lead, school product/design reviewer and finance/accounting reviewer; privacy/security authorities review access/PII handling. Names, signatures and dates remain unspecified until supplied. T14 stays partial until required evidence exists. T15 independent documentation/build work can be packaged now, but formal handoff remains dependent on T14; no LIVE task is completed by this protocol.
