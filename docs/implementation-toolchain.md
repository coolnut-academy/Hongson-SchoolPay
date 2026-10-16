# Frontend implementation toolchain

Verified on Windows with Node22.23.1 and npm10.9.8. Exact dependencies remain pinned in package.json/package-lock.json; no runtime dependencies were added during this mission.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Student fixture code: **69024**. Staff entry uses explicit fictional demo login; direct golden links begin with the baseline fictional persona. Development-only demo controls select five roles, reset fixtures and select deterministic scenarios. They are absent from production builds. Reload resets in-memory changes. No student/profile/financial data is stored in browser persistence.

```powershell
npm run lint
npm run typecheck
npm test
npx playwright install chromium firefox webkit
npm run test:e2e -- --browser=all
npm run build
npm run check:boundaries
npm run check:static
npm run test:built
npm run test:live-unavailable
npm run preview
```

Lint uses strict TypeScript/unused-symbol checks and the source-boundary checker. Browser tests start Vite locally, use one worker and write screenshots under artifacts/screenshots and failure traces under test-results. Install browser binaries once. Machine-readable evidence uses Vitest's JSON reporter and Playwright's list,json reporters with PLAYWRIGHT_JSON_OUTPUT_FILE set. No screenshot is an official receipt.

## Module boundaries

The static SPA uses React Router, TanStack Query, native fields, shared token CSS/Tailwind, Radix dialogs and Lucide icons. Thai fonts/licenses are local. AppProvider composes the typed SchoolPayAdapter; features do not import concrete adapters. Staff queries include principal and access/grant version. Visitor queries use a separate minimal projection and opaque in-memory session key. Principal/logout changes cancel and clear protected cache.

All product features are lazy-loaded. The component gallery exists only in development. No report/chart/PDF/receipt-output engine is installed. The eight report families produce bounded semantic previews; actual XLSX/DOCX templates and versions/checksums remain absent.

VITE_DATA_MODE=mock is the working runtime. An explicitly different mode fails unavailable with no mock fallback. Never put real student information in fixtures: static mock assets are public. Auth Bridge ports/orchestration are preparation; no configured Firebase SDK driver or school source transport is connected.

Production output is dist only. A static host must rewrite non-asset SPA URLs to index.html, return404 for missing assets, cache hashed assets immutably and revalidate HTML. The Vite preview plugin verifies this locally; it is build tooling and emits no server runtime. No deployment or actual host configuration was performed.

## Financial and integration boundaries

The adapter demonstrates integer satang, explicit references, versions, idempotency, outcome recovery and atomic in-memory transitions. It provides no durable accounting or concurrency guarantee across users. Baseline payments accept the entire remainder of one obligation. Unsupported partial/group/overlap/generation/correction/partial-return policies remain visibly gated; publication never creates debt automatically. Monthly revisions stay frozen until reviewed refresh. Other-money totals stay separate from student debt.

Local security preparation requires Firebase CLI and Java21+:

```powershell
npm run test:emulator
```

This selects demo-hongson-schoolpay and local Auth/Firestore only. The loopback/demo-project-guarded REST harness tests unapplied deny-all quarantine rules. It does not activate app login, deploy rules or prove positive financial writes. See [auth-bridge-readiness.md](auth-bridge-readiness.md) for exact external inputs and [frontend-validation.md](frontend-validation.md) for actual results and coverage gaps.

Full acceptance commands/evidence mapping and manual procedures: [qa-acceptance.md](qa-acceptance.md). Adapter/RBAC/financial/environment and conditional static release contracts: [implementation-handoff.md](implementation-handoff.md). Ordered external gates and approval authorities: [live-integration-checklist.md](live-integration-checklist.md). These documents enable review and future work; they do not enable a deployment target or live mutation path.
