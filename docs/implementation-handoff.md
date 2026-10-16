# Implementation handoff

Prepared 2026-10-16. This is a reviewable implementation package, not approval to deploy, activate school authentication, read real student data, or enable financial writes. T14 manual acceptance remains open; T15's independent deliverables are packaged, but its formal dependency on T14 is not waived. All six LIVE tasks remain blocked.

## Setup and environment contract

Use the pinned package-lock.json with Node22.12+ compatible tooling. The recorded environment uses Node22.23.1/npm10.9.8. Run `npm ci`, then `npm run dev`; open http://127.0.0.1:5173. Code69024 is fictional. Demo controls select five staff personas/scenarios and reset fixtures; full reload resets all mock mutations. No app data is stored persistently in the browser. See [toolchain](implementation-toolchain.md) for commands.

| Setting/artifact | Current behavior | Handoff requirement |
|---|---|---|
| VITE_DATA_MODE=mock | Fictional in-memory adapters | Use only fictional data; static assets are public |
| VITE_DATA_MODE unset/empty | Same mock runtime | Explicitly set mock in reproducible demo builds; never interpret an unset value as permission for live data |
| VITE_DATA_MODE=live or another nonempty value | Unavailable screen; no mock fallback | Keep this closed until the approved adapter set and release gates exist |
| .env.example | Contains only VITE_DATA_MODE=mock | No production project or provider configuration has been supplied |
| VITE_* values | Bundled public client configuration | Never place service-account keys, tokens, client secrets or private directory credentials here |
| dist/ | Static HTML, lazy JS, CSS, fonts/assets | Build artifact only; no server/API/functions or deployment target |
| firebase.emulators.json | Loopback Auth9099/Firestore8080, demo project selected by script | Local testing only; not a production configuration |
| security/firestore.rules | Deny every read/write | Unapplied quarantine baseline; do not loosen it to make a demo login work |

Production Firebase environment-variable names are deliberately not invented. Once approved, document the actual public FirebaseOptions/provider inputs and validate them before composition. An unknown environment/project/tenant must fail unavailable, never connect to a guessed default. Do not initialize school projects opportunistically from legacy snippets.

## Existing Auth Bridge contracts

Code: [AuthBridgeAdapter](../src/ports/AuthBridgeAdapter.ts), [SchoolAuthBridge](../src/auth/SchoolAuthBridge.ts), [permission selectors](../src/domain/permissions.ts).

| Port | Existing contract | Required future binding |
|---|---|---|
| FirebaseAuthDriver | useMemoryPersistence, currentIdentity, signIn, signOut, onIdentityChanged | Approved Firebase JS SDK project/provider/tenant driver; no SDK driver is installed or connected |
| FirebaseIdentity | uid, projectId | Authoritative Auth identity; never infer a role from email/name or equate UIDs across projects |
| SchoolIdentitySource.resolveMapping | Identity + AbortSignal -> authUid/projectId/schoolId/staffId or null | Owner-controlled cross-system mapping; exact transport/schema/access and revocation behavior required |
| SchoolIdentitySource.profile | staffId + AbortSignal -> immutable StaffSourceProfile or null | Authorized T-Folio read-only profile transport |
| SchoolIdentitySource.access | staffId + AbortSignal -> authoritative active role/rooms/capabilities/scopeVersion | Approved SchoolPay access record, school boundary and provisioning authority |
| AuthBridgeAdapter | resolveSession, signIn, signOut, subscribe, dispose | Composition must clear protected caches/subscriptions on identity/scope changes and dispose subscriptions |

Sessions are signed_out, access_pending, unavailable or ready. Revalidation clears the previous protected principal before source reads. Ready requires matching Auth project/UID, school/staff mapping, source profile and active canonical role. Missing mapping/profile, unknown role or inactive access does not create an admin. Source failures remain unavailable. Aborts/epochs suppress late responses after logout. Memory persistence is a driver requirement; fictional unit drivers do not prove real SDK persistence behavior.

The prepared StaffPrincipal.uid currently carries the Auth UID. If SchoolPay's approved schema uses a different principal ID, extend the explicit mapping/port and test that binding; no separate SchoolPay principal identifier has been supplied or inferred. Source updatedAt is provenance, not a verified freshness guarantee without the owner's threshold/version contract.

The bridge is not wired into AppProvider: the UI still uses consolidated SchoolPayAdapter demo identity methods. Future integration must replace the composition deliberately, remove role arguments as authorization claims, bind the real principal, and retain live-mode closure until all required adapters exist. Financial commands must authorize independently of frontend selectors. Check that token expiration, account disablement, room/grant changes and school changes clear data even while a request or command is in flight. Outcome recovery after reauthentication must use the original command identity.

## Student Directory and Staff Profile boundaries

UI_CONTRACT specifies separate source adapters; current mock functionality is consolidated in [SchoolPayAdapter](../src/ports/SchoolPayAdapter.ts). No live StudentDirectoryAdapter class or source transport exists. The following is the approved interface responsibility, not an invented Firestore schema.

| Adapter responsibility | Data and scope | Read/error requirements |
|---|---|---|
| StudentDirectoryAdapter.getStudent | Stable source student identifier and authorized minimal identity/room projection | Read-only T-Academy source; bind school and viewer scope before fetching |
| getRoomRoster | Explicit assigned room, academic period, bounded page/cursor | Default25/max50 per list request; no full-directory preload or pagination prefetch; no guessed historical membership |
| searchStudents | Explicitly submitted query, limit/cursor and permitted search scope | Bounded indexed query; never download all students to search in the browser |
| StudentLookupAdapter.lookupByCode/endLookup | Approved visitor access grant and one minimal student account projection | Separate visitor flow; no staff directory, room notes, stock, role list or audit payload; no enumeration endpoint |
| StudentAccountAdapter | SchoolPay obligations, allocations, history and reference details | Financial source is SchoolPay, not a writable T-Academy profile; scope periods and pages |
| StaffProfileAdapter.getCurrentStaff | T-Folio staffId, fullName, position, source updatedAt/provenance | Current code equivalent is SchoolIdentitySource.profile; profile/name/identity stay immutable in SchoolPay |
| AccessAdapter | SchoolPay active role, room IDs, optional grants and scope version | Separate authority from profile/position; do not derive permissions from job title |

Source owners must supply field schemas, stable ID mappings, project/transport permissions, historical room semantics, timestamp/version meanings, freshness thresholds, revocation and rate-limit contracts. Display labels are not stable room IDs. Do not treat the mock's source label or emulator collection names as production mappings. Source snapshots need provenance/as-of/version plus incomplete/stale/unavailable behavior; exact DTO bindings remain subject to those contracts. Missing data is unavailable, not a financial zero. Recheck freshness at a command boundary; query-cache stale time is not authoritative freshness.

AbortSignal must reach the transport. Staff query keys bind principal UID, access/grant version, school, room and period; cancel/clear them on scope changes. Visitors use a separate opaque in-memory grant/session and one authorized account. No personal profile/financial/free-text data or lookup credentials in localStorage/IndexedDB, telemetry, URLs or unredacted diagnostics. Authorized nonsecret room/period routing parameters follow the UI contract. Unknown source identity must not leave previous student's data visible. No source-profile writes, directory backfill or cross-project privileged credentials in the browser.

G01 still blocks live visitor lookup: a student code or anonymous Auth is not proof of ownership. The privacy authority must approve the extra factor or residual enumeration risk, minimal projection, throttling/abuse/App Check expectations, error wording, session expiry and shared-device behavior before activation.

## RBAC and Security Rules expectations

The role matrix below describes current canonical selectors; backend rules/trusted commands must independently enforce the approved matrix and assigned-room scope. UI hiding is not authorization. Unknown/inactive/unmapped principals deny access.

| Operation | Default permitted staff |
|---|---|
| Scoped student reads, operational reports | All five; homeroom restricted to assigned rooms |
| Student receive, existing-reference link | Finance teacher, finance officer, superadmin |
| Other receive, AVAILABLE VOID, issue/return, fee edit/publish/generate | Finance officer and superadmin; finance teacher only with each explicit approved grant |
| Follow-up human notes | Assigned homeroom teacher and superadmin |
| Memo preparation | Assigned homeroom teacher, finance teacher/officer, superadmin; actual files G04-gated |
| OBEC report preview | Finance officer, executive, superadmin; actual files G04-gated |
| Access management | Superadmin; reason, version conflict, immutable source fields and final-active-admin safety |
| Audit reads | Scoped/redacted; homeroom own events only; no update/delete |
| Paper-stage recording | Unavailable under G12; no implicit superadmin bypass |

Keep rules deny-by-default and test direct SDK/REST bypasses. Reads must enforce school, principal, room and field minimization; rules are not post-query filters. Reject unbounded/cross-scope queries and direct role self-promotion. Authoritative role/claim provisioning and first-admin bootstrap happen outside the browser under an approved owner procedure. Require grant/revocation tests rather than trusting a cached role token indefinitely.

Operational collection paths, custom claims, rules schema and first-admin procedure are unresolved. The emulator's fictional hsp_* paths are test fixtures, not an approved schema. Current27 quarantine denials prove all access is closed; they prove neither positive RBAC reads nor permitted financial writes. Add separate positive/negative operational emulator tests only after the schema and command contract are approved. If rules cannot enforce every bounded command invariant, escalate a trusted Firebase-side service design for approval; do not weaken rules or add a hidden SPA-host API.

## Financial command and audit requirements

- Use safe integer satang in the domain. Finance/security owners must approve the persisted unit/conversion/schema. Keep academic year/term and fiscal year distinct; do not derive school terms from the browser clock.
- Validate an approved full/partial/group policy, same student/period, unique allocations, exact sum and no overpayment. Separate other-money categories from student obligations and academic totals. Prices/configuration come from versioned approved masters, not fee-code constants.
- A receive command must atomically bind expected obligation/page/book versions, permitted actor/scope, eligible fresh source, available physical book+page, payment/allocations, counters and audit. One physical page has at most one linked transaction. USED/VOID pages cannot be recycled; AVAILABLE VOID needs reason. Reject mismatched membership and50-page reconciliation failures.
- Reuse one command ID and immutable payload fingerprint for retries. Same ID/same payload returns the original result; changed payload is rejected. Concurrent same-page or same-obligation commands have one valid winner. A rejected command leaves every coupled record unchanged.
- Unknown outcome freezes editing/resubmission while status is resolved by the original ID. Offline drafts stay in memory; no queued automatic financial replay on reconnect. Reauthenticate before authorized recovery when necessary.
- Linking an existing pending reference changes the reference and audit only, not received cash. Waivers/adjustments are not cash; counters must reconcile to immutable underlying records. Correction/reversal/backdating/locking/partial-return workflows require their approved SOPs.
- Audit is append-only and coupled to the command, with authoritative actor/time, action, target, command ID, reason where required and before/after entity versions. Prevent forged actor/time, omitted audit, updates/deletes and orphan links. Redact financial circumstances/free text by scope; retention/export access needs an owner decision.
- Monthly financial revisions remain frozen. Reviewed draft refresh creates a revision, retains matching human notes and preserves history. Generated/submitted memos are not rewritten. G12 paper states require authorized actor/date/evidence; no electronic signatures are implied.
- No official receipt generation/printing. Report allowlist stays restricted to eight semantic families. Missing approved XLSX/DOCX/version/checksum blocks files, including draft mode. Failed reconciliation blocks final output; previews are not generated official documents.

Positive authorized mutation, atomicity, concurrency, idempotency, rollback, reconciliation and audit-tampering evidence is required before any live financial write. None is claimed from mock tests or deny-all emulator tests.

## Production configuration and deployment procedure (documented only)

No hosting provider/project/domain or deployment action is enabled here. The following is a future release procedure, conditional on approvals and the [Live Integration Checklist](live-integration-checklist.md).

1. Record release owner, school/security/finance/privacy approvals, target account/plan, domain, budget, backup/restore and rollback authority. Keep staging/emulator and production project IDs/providers/source permissions distinct. Never reuse real student data as a public demo fixture.
2. Review the exact supported client configuration and complete adapter set. Current supported artifact is mock only; live remains unavailable. A build toggle cannot constitute permission to activate financial writes. Do not add server functions to the static host.
3. From the pinned lockfile run all commands in the acceptance procedure. Archive artifact checksum, configuration revision, rules/index revision, test JSON/logs and reviewed screenshots. Do not include .env, credentials, emulator seeds/debug logs or test traces in the public dist artifact.
4. Under a separately approved release action, upload dist only using the selected static provider. Non-asset SPA routes must fall back to index.html; missing assets must return404 rather than HTML200. Hashed assets use immutable caching, HTML revalidates. Preserve old hashed chunks while older HTML may still be cached. Apply appropriate HTTPS/security headers without breaking the approved Auth redirect/provider flow; validate the actual policy in staging first.
5. Test actual host student/staff URLs and reloads, base-path/404/cache behavior, local font MIME types, no dev controls, no source/financial data in browser storage/logs and no unexpected third-party requests. Local Vite preview is not actual host verification.
6. Begin with approved restricted read-only access; independently release financial commands only after the finance/security evidence and pilot gates pass. Archive reconciliation and audit evidence. Stop on permission, privacy, cash, uniqueness or audit drift.
7. Roll back through the authorized provider procedure to the previous verified blocked/read-only artifact and restore compatible rules/configuration. Never hide a live outage by falling back to mock. Reconcile possibly committed commands by original ID before retrying. Restore/backup and rollback drills remain unperformed external acceptance.

No deployment commands, credentials, target configuration or financial feature-enable switch were added. Actual hosted behavior, provider eligibility/costs and production sign-off remain LIVE-06 work.

## Acceptance and owner handoff

Run [QA acceptance procedures](qa-acceptance.md) and preserve machine-readable results in artifacts/verification. Manual observations need tester, device/browser/AT version, date, steps, actual result, evidence and approving authority; empty records remain pending. The [input register](auth-bridge-readiness.md) assigns approval authorities by function; no individual owner or approval has been fabricated. Follow the [ordered Live Integration Checklist](live-integration-checklist.md); completion of this document does not satisfy its blocked gates.

The automated checkpoint is99 full-suite browser cases (33 per engine), followed by6 affected cross-browser visual cases after an isolated executive-bar color-utility correction,44 unit tests and27 local quarantine denials, plus the recorded static/environment checks. The full99-case suite was not repeated after the two-file visual correction. [Local checksum manifest](../artifacts/verification/handoff-manifest.json) identifies both source snapshots, their exact difference and26 final dist files; it is integrity evidence, not a signature, deployment or school approval. Raw environment/CLI debug logs are not public handoff artifacts; the recorded emulator summary is sanitized. All independent T15 outputs are complete; formal handoff acceptance remains dependent on outstanding T14 manual evidence.
