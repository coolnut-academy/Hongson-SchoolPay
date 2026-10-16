> Historical Stage B document. Current runtime, test IDs and validation commands: [production-handoff.md](production-handoff.md). The seeded mock runtime has been removed.

﻿# Frontend validation and integration preparation

Verified locally on2026-10-16. Results cover fictional in-memory workflows and independent Auth Bridge/security preparation. No real Firebase source, identity login, directory or financial-write adapter is connected. No deployment or official receipt output was created.

## Inventory

24 unique implementation IDs, including parent T09 and its two named subtasks: **16 complete /8 remaining =2 partial +6 externally blocked**. The18 frontend IDs comprise16 complete and T14/T15 partial. The six LIVE tasks remain blocked. See [IMPLEMENTATION_PROGRESS.md](../IMPLEMENTATION_PROGRESS.md) for every ID, dependencies, batch history and external inputs.

T00-T13 and T09a/T09b have verified mock implementations. T14 has passing automated coverage but outstanding manual QA acceptance. T15 independent build/release automation and the full implementation handoff package pass; formal acceptance still depends on T14. All independently executable work in this bounded mission is complete. A successful build is not production approval.

## Final observed results

| Check | Result |
|---|---|
| npm ci | Passed;99 packages installed,100 audited, zero reported vulnerabilities |
| npm run lint | Passed; strict/unused-symbol TypeScript checks plus source boundaries |
| npm run typecheck | Passed, including the check executed by build |
| npm test | **44/44 passed**, nine files; final JSON in artifacts/verification/unit-results.json |
| npm run test:e2e -- --browser=all --workers=2 --reporter=list,json | **99/99 passed**,33 cases per engine: Chromium, Firefox, WebKit; zero failed/skipped/flaky;16.9 minutes |
| Final visual follow-up | **6/6 passed** across all three engines after the final isolated executive-bar utility correction; rendered color/width assertions and all G1-G4 role/viewport captures; JSON in artifacts/verification/browser-final-visual-results.json |
| npm run build | Passed; static dist only, lazy product routes and local Thai fonts |
| npm run check:static / check:boundaries | Passed; output/budgets, domain/UI and adapter boundaries, no server/live SDK/receipt exporter/persistent PII paths |
| npm run test:built | Passed; visitor lookup/history, all17 staff direct entries/reloads, missing-asset404, no dev gallery/controls, external requests or browser exceptions |
| npm run test:live-unavailable | Passed after final visitor fix; separate temporary live-mode build, four direct URLs/reloads; unavailable screen, no account fallback/controls/external requests/exceptions |
| npm run test:emulator | **27 direct REST denials passed**, local Firebase CLI15.29.0, Java21, Auth/Firestore emulators; five fictional roles, denied tampering and rejected multi-document writes; seed balance unchanged |

Full-suite browser JSON: [99-case results](../artifacts/verification/browser-results.json). After this full run, artifact review found invisible executive bar fills using undefined bg-brand. The isolated fix reuses existing bg-primary; the6-case [final visual follow-up](../artifacts/verification/browser-final-visual-results.json) passes rendered bar color/width checks and all golden captures in all engines. All44 unit, lint/TypeScript, build/budget/boundary,17 production-route and live-mode-isolation checks passed again on final source. The complete99-case suite was not repeated after this two-file visual-only correction; the checksum manifest preserves both source snapshots and the exact two-file difference. All four added QA cases passed in all engines. Skip links now focus programmatically focusable content without inserting native hash history outside the router. Focusable landmarks exposed a WebKit modal-opener issue; click capture fixes opener recording after native focus. Twelve repeated WebKit reference/gallery/guard/skip checks passed, then the complete99-case run passed with unchanged66-file source/configuration fingerprint. The original assertions remain. Interrupted focus-run evidence is retained in browser-t14-focus-before-fix.json and t14-reference-focus-webkit.trace.zip under artifacts/verification.

Historical evidence: The previous87-case run found one WebKit immediate-back failure. Committing one navigation before clearing visitor scope corrected competing logout/guard redirects. Three focused WebKit repetitions and the subsequent full87-case run pass. Original immediate-back assertion remains, with lookup-form and no-student-name assertions added. The superseded run and trace remain under artifacts/verification/browser-before-visitor-fix.json and visitor-back-webkit.trace.zip. An earlier intermittent Firefox confirmation timeout did not reproduce in three repeats or the final full run.

## Workflow coverage

- Student/Parent: minimal account projection, lookup code69024, current/history2568 balance4000, reference-only details, cleared-session back navigation and no receipt output.
- Staff: five personas, explicit demo login/logout, denied actions, principal/access-version query scopes, loading release and revoked permissions clearing protected content.
- Finance: full single-obligation1500, explicit physical page, required fields/error focus, confirmation, idempotency, competing pages/balance changes, offline/stale blocks and unknown-outcome recovery.
- Other money/pending references:12000 receive affects only fiscal other-money totals; an existing pending reference links without receiving cash twice; audit and physical page references stay coupled.
- Receipt stock/ledger: exact50 unique physical pages and linked USED transactions, AVAILABLE VOID with reason,49-page mismatch, explicit stock identifiers/quantity/version, holder issue, bounded independent25-row book/movement cursors, full-return unit scenario, no recycled pages and partial-return G03 gate.
- Homeroom: assigned-room/month scope, seven debts12500, three missing notes, draft/validation/version conflicts, guarded row/month/back navigation and mobile editor. Frozen monthly finance stays12500 after a payment; reviewed refresh creates11000 revision, retains matching notes and immutable history. Memo registry/semantic preview and five read-only paper stages expose G04/G12.
- Dashboards: all role layouts, exact six-grade5.4m=4.8m+.6m and88.9%, separate78000 other money, honest unseeded drilldown limits and superadmin readiness links.
- Fee Master/obligations: separate student/other masters, safe amounts, draft year copy, versioned publication, separate duplicate-generation skip/eligibility preview and transfer/withdrawal reviews; no automatic debt waiver.
- Access/audit/reports: immutable source profiles, role/room diff and reason, stale/final-admin safety, room revocation, bounded redacted read-only audit, eight report families, reconciliation failure and missing-template/draft bypass prevention.
- Integration preparation: explicit cross-system identity mapping, inactive/unknown-role/wrong-project denial, memory-persistence requirements and late-response suppression after logout. Mock write tests reject signed-out/inactive/changed-role/revoked sessions and logout during writes.

## Layout and accessibility evidence

All17 staff routes were exercised at320/390/768/1024/1440px in all three engines. Axe WCAG2 A/AA and WCAG2.1 AA tags report no detected violations in the tested390/1440px views. Golden/visitor views have additional reflow checks. Keyboard tests cover forms, error summary, manual tab activation, modal trap/return, single active dialog, note editing and access diffs. The added QA case completes finance review/cancel/submit, note save and access confirmation with keyboard events/native selects. The logout control now has a rendered4.5:1 minimum contrast assertion using existing tokens. Reduced-motion checks verify actual button transition durations and the persistent gallery busy indicator with preference on/off, as well as media state. Common visible staff main buttons/icon controls are measured at a44px minimum in both effective reflow viewports.

Actual screenshots use fictional data, fixed fixture time and loaded local fonts. Engine-specific all-route captures: artifacts/screenshots/{chromium,firefox,webkit}-{route-with-hyphens}-{390,1440}.png. Golden visitor/finance/ledger/fee captures also exist. Reviewed desktop monthly table/editor and mobile cards/editor, administration, reports, executive summary, other-money form and stock pagination/logout contrast.

| Example | Desktop | Mobile |
|---|---|---|
| Student | [1440](../artifacts/screenshots/student-1440.png) | [390](../artifacts/screenshots/student-390.png) |
| Finance | [1440](../artifacts/screenshots/finance-1440.png) | [390](../artifacts/screenshots/finance-390.png) |
| Monthly | [1440](../artifacts/screenshots/chromium-monthly-followup-1440.png) | [390](../artifacts/screenshots/chromium-monthly-followup-390.png) |
| Executive | [1440](../artifacts/screenshots/executive-1440.png) | [390](../artifacts/screenshots/executive-390.png) |
| Access | [1440](../artifacts/screenshots/chromium-admin-users-1440.png) | [390](../artifacts/screenshots/chromium-admin-users-390.png) |

New G1-G4 per-role viewport captures use exact390x844 and1440x1000 PNG dimensions, local fonts and disabled animations: artifacts/screenshots/{chromium,firefox,webkit}-{G1,G2,G3,G4}-{390x844,1440x1000}-review.png. QA reflow emulation uses720 CSS px/2x raster and320 CSS px/4x raster over all staff routes and visitor views. This models effective200%/400% reflow; native browser menu zoom/pinch/OS magnification was not operated.

These are review captures, not approved pixel-regression baselines. Automated axe/reflow does not certify WCAG compliance. Manual screen-reader headings/landmarks/errors/announcements, actual200% browser zoom, real devices, school/finance user review and approved image baselines remain outstanding under T14. Zero violations applies only to tested states. No numerical code-coverage percentage was measured.

## Measured final build

| Asset | Measurement |
|---|---|
| Initial entry + modulepreload JS |142.4KiB gzip |
| All lazy/initial JS combined |195.5KiB gzip |
| CSS |39.7KiB raw /8.9KiB gzip |
| All local fonts |71.9KiB raw |

The checker includes preloaded shared modules, enforces the stronger180KiB initial/250KiB total JS limits and40KiB raw CSS limit, and checks local font budget and13 lazy feature chunks. Tailwind scans application source rather than unrelated documents/artifacts. No chart/export runtime dependency was added.

## Live integration and remaining limits

[Auth Bridge input register](auth-bridge-readiness.md) identifies approved Firebase/provider/domain/tenant settings, explicit Auth UID-to-T-Folio-to-SchoolPay mapping, authoritative role/room provisioning and revocation, T-Academy directory schema/transport/freshness, visitor privacy/abuse approval, financial persistence schema/unit/atomic command policy, templates/checksums, carry-forward IDs and paper-stage authority.

The rules are an **unapplied deny-all quarantine**, not operational RBAC rules. Negative emulator tests prove denial only; positive authorized reads/writes, school identity interoperability, production concurrency/idempotency/reconciliation, backups/restore, load tests and pilot approval remain blocked. No production financial mutations are enabled. No real data or service-account secret was used.

Mock changes reset on full reload and provide no durable multi-user accounting. There is one detailed student account, one seeded40-student room projection and two initial detailed books; synthetic grade aggregates and86-book opening are explicitly separate projections, not a fully loaded/reconciled database. Newly received demo books remain reachable through bounded pages. Missing official XLSX/DOCX templates, policy-gated generation/corrections/partial payments/returns and paper recording remain visibly unavailable; no substitute official-looking files were generated.

Local Vite preview proves17 SPA fallback/reload paths and asset errors. Actual host rewrites/cache/provider plan, deployment and production behavior are unverified. The exact next gate is **T14 outstanding manual QA acceptance**, then formal T15 acceptance; its implementation handoff package is complete. Live activation requires the external contracts; no readiness milestone is silently waived.

## Completed handoff artifacts

- [QA acceptance ledger/procedures](qa-acceptance.md): all37 criteria, exact command sequence, tested scopes and unfilled manual protocols.
- [Implementation handoff](implementation-handoff.md): environment/setup, actual Auth Bridge and source adapter contracts, RBAC/rules, financial/audit invariants and conditional static deployment/rollback procedure.
- [Ordered Live Integration Checklist](live-integration-checklist.md): gate sequence, evidence, responsible authorities and explicit stop conditions; every blocked LIVE gate stays open.
- [Local checksum manifest](../artifacts/verification/handoff-manifest.json): source/configuration fingerprint,26 static dist-file SHA256 values and final unit/browser/emulator totals. This is local integrity evidence, not an approval/signature or deployment.
- [Sanitized emulator result](../artifacts/verification/emulator-results.log):27 denial checks and exit0, with verbose environment diagnostics omitted.

Run/reset/persona/scenario and emulator instructions: [implementation-toolchain.md](implementation-toolchain.md).
