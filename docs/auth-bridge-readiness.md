> Historical Stage B document. Current runtime, test IDs and validation commands: [production-handoff.md](production-handoff.md). The seeded mock runtime has been removed.

# Auth Bridge readiness and external input register

2026-10-16. The user authorizes integration work, but not invented project settings, identity mappings or financial policy. The frontend T15 handoff milestone is still subject to the task inventory and final acceptance run in IMPLEMENTATION_PROGRESS.md.

## Implemented independent preparation

- `AuthBridgeAdapter.ts` defines Firebase identity, immutable source profile and authoritative access seams. `SchoolAuthBridge.ts` implements sign-in/sign-out/session revalidation orchestration, mandatory explicit cross-system UID mapping, inactive/unknown-role denial, room-scoped principals, memory-persistence driver requirements, aborts and stale-response suppression after logout. Unit tests use explicitly fictional drivers and mappings.
- No Firebase SDK driver/provider or source transport is wired into the SPA. The class is preparation, not a working school login. `VITE_DATA_MODE=live` continues to fail unavailable with no mock fallback. Production has no development role switcher or component-gallery route.
- `security/firestore.rules` is an unapplied deny-all quarantine baseline. It does not grant reads or writes even to a superadmin; it is not the future operational RBAC ruleset. `firebase.emulators.json` is local-only configuration, with no real project identifier, API key, authorized domain or deployment target. The test command explicitly selects the fictional `demo-hongson-schoolpay` project.
- Emulator tests use local REST APIs, not the Firebase JS SDK. They test unauthenticated and five role-fixture denials, self-promotion, audit/payment tampering and rejected multi-document commits. These negative tests do not prove a valid finance command can commit atomically under future operational rules.
- No rules deployment, hosting deployment, real authentication, source lookup or production money mutation has been performed. No service-account key belongs in browser environment files.

## Required external inputs

| Gate / owner | Exact missing input | Work that cannot be activated |
|---|---|---|
| G08 / school identity owner | Approved Firebase project(s), web app configuration, Auth provider and sign-in mechanism, authorized domains, tenant/issuer/audience contract, emulator vs production environments | Concrete Firebase JS SDK auth driver and approved login UI delegation |
| G08 / T-Folio owner | Authoritative mapping from Auth UID/project to T-Folio staff ID and SchoolPay principal ID; profile transport/schema, access rules and revocation contract | Real staff profile resolution; no email matching or assumed cross-project UID equality |
| G06/G08 / access owner | SchoolPay role-document schema/location, authority to provision first admin outside the browser, active status, assigned rooms, scope version, approved optional capabilities | Real RBAC/scope enforcement and role administration |
| G07 / T-Academy owner | Authorized transport, exact directory/projection schema, historical room membership, version/freshness/revocation contracts | Real student-directory and assigned-room reads |
| G01 / privacy/security owner | Controlled student-code lookup, accepted residual enumeration risk or approved extra factor, minimization, throttling/App Check/abuse requirements | Live student/parent lookup; anonymous Auth alone is not ownership proof |
| G02/G03/G05/G09/G11 / finance/security owners | Persistence money unit and schema; partial/multi/group/frequency/overlap policy; pending/backdating/locking; correction/reversal/return SOP; bounded atomic command and append-only audit contract | Operational Firestore rules, positive emulator concurrency/idempotency/reconciliation proof, any live financial writes |
| G04 / finance/report owner | Actual OBEC XLSX and monthly DOCX templates, approved mappings, version/checksum and fidelity evidence | Official report files; official receipts remain prohibited in every mode |
| G10/G12 / finance/school owner | Six carry-forward IDs and movement evidence; paper-stage recorders/retention | Opening-stock finalization and paper-stage mutations |
| LIVE-06 / hosting/account owner | Provider plan, budget, domain/fallback/cache contract, backups/restore and pilot sign-off | Actual hosting and production release approval |

## Safe local verification

`npm run test:emulator` requires Firebase CLI and Java 21+, starts only local Auth/Firestore emulators and runs the loopback/demo-project-guarded REST tests. It does not log in to Firebase or deploy anything. Verify emulator output before claiming a pass; compilation/download/environment failures remain failures. The app has no runtime emulator connection or live data mode until a complete, approved adapter set exists.

Official references: [Auth memory persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), [demo projects and Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore), [rules testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator), [deny-by-default rules](https://firebase.google.com/docs/rules/basics). These guide preparation; they do not resolve the school's mapping/privacy/financial decisions.

## Implementation handoff package

The [implementation handoff](implementation-handoff.md) documents actual Auth Bridge DTOs/session states, the currently consolidated mock port versus future Student Directory/Staff Profile responsibilities, scoped queries/cache invalidation, canonical RBAC, deny-by-default operational rule expectations, financial/audit invariants and a conditional static deployment/rollback procedure. The [ordered Live Integration Checklist](live-integration-checklist.md) assigns each gate to the responsible approval authority and separates read-only identity work from later financial-write proof and release. The [QA acceptance ledger](qa-acceptance.md) maps all37 acceptance checks and supplies unfilled manual review procedures.

Current source-boundary checks intentionally reject Firebase SDK dependencies/imports. Future approved SDK work must deliberately update the boundary to allow only authorized adapter/composition code and add tests that continue rejecting UI/domain imports and server/receipt-output code. No such relaxation, SDK activation or rules deployment is part of this handoff.

## Exact Auth Bridge input packet still required

No values or approvals below have been supplied by this handoff. Functional authorities must provide and review them through an authorized channel; do not put private credentials in this repository or public Vite variables.

1. **School identity/Firebase owner:** approved schoolId; staff Auth project and SchoolPay/source project separation; public web configuration (projectId, appId, apiKey, authDomain and any additional approved FirebaseOptions); environment/tenant selection; exact provider IDs and sign-in/redirect mechanism, permitted origins/domains/callback URLs and applicable issuer/audience/scopes. No provider or tenant is assumed.
2. **T-Folio/identity owner:** authoritative Auth UID+project to T-Folio staffId and SchoolPay principal/school mapping, including whether SchoolPay has a separate principal ID; approved mapping transport/schema/access and revoke/change behavior. The current prepared bridge principal.uid carries Auth UID, not an invented independent SchoolPay identity.
3. **T-Folio source owner:** read-only profile field schema for staffId/name/position/updatedAt/provenance, authorized endpoint/project access, schema version, freshness/error/rate-limit contract and account-disable semantics.
4. **SchoolPay access/security owner:** role record/claim location and schema, five canonical role mappings, active status, stable assigned-room IDs, optional grants, scope/grant versions, provisioning and first-admin authority outside the browser, expiry and revocation/revalidation requirements. Include approved positive/negative test identities for emulator/staging, without real student data.
5. **T-Academy and privacy/security owners:** authorized directory/projection transport, stable student/room ID mapping and historical membership, query/index/limit contracts, version/freshness semantics, minimal visitor grant/projection, approved lookup ownership/extra-factor or residual-enumeration decision, throttling/abuse/App Check requirements, session expiry, logging/export/retention constraints and source-access permissions.

Actual Firebase interoperability and positive operational read/write security evidence remain unavailable. Current re-verification passes99 browser cases,44 unit tests and27 local deny-all emulator checks; those results do not satisfy the missing identity/source/financial approval gates.
