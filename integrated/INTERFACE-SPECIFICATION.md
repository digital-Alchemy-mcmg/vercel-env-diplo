# MARA A1–B5 — Vercel deployment interface specification

Status: DRAFT — canonical document located; commit binding and requirement reconciliation pending.
Deployment branch: integration/a1-b5-vercel.
Deployment platform: Vercel static Vite hosting.
Execution environment: browser main realm plus a dedicated same-origin module worker; build-time Node 24.x and Git.

## Authority and version binding

The Operator's Deployment Branch Interface Policy supplied in this conversation controls the specification hierarchy:

canonical interface requirements on main → deployment-specific interface specification → implementation.

This document implements platform-specific mechanisms; it does not authorize changes to universal requirements. Deployment branches must not silently weaken or override canonical requirements. Universal changes require canonical-level review and Operator authorization; deployment-specific changes remain on this branch.

Canonical reference: `docs/interface/MARA_INTERFACE_PREREQUISITES.md`, version 1.0 (2026-10-13), approved on `main` at commit `4f31b58ba048360a87136283f57e4e5d5b0f98d4`. The original main baseline `29c54dc2eff750c1d284e56775cb01e34de7fb9d` predates that document. Canonical path/version/commit are now identified, but identification alone is not implementation compliance or deployed acceptance. See [canonical reconciliation](CANONICAL-RECONCILIATION.md) for control mapping, gaps and unresolved discrepancies.

Implementation references: existing standalone A source on main; protected B d1b8348ded0190cccc7017526b8a16c84005db2a; current integrated implementation and its readiness report. The earlier Operator implementation directives remain applicable pending reconciliation against the canonical document.

## Applicable requirements and controls

These existing implementation controls are mapped against the approved canonical specification in [CANONICAL-RECONCILIATION.md](CANONICAL-RECONCILIATION.md). The table is not a substitute for stage-by-stage verification.

| Requirement | Vercel/browser implementation mechanism | Verification / acceptance |
| --- | --- | --- |
| Preserve A1–A5 architecture and component authority | Existing A core/UI reused; build adapter adds only UI integration access; B source read from its pinned Git commit | Changes confined to integrated/; protected-file and vendor-blob verification |
| A2 remains an independent external runner | Complete manual dispatch JSON and explicit returned-input staging; no collection service or preloaded demo | Browser dispatch/return workflow; fixture evidence labelled test-only |
| Operator staging/decision authority | Existing PUSH/PIN/REJECT controls and confirmation dialogs | Decision, exclusion, cancellation and missing-taxonomy tests |
| Preserve minted A4 artifacts | Receiver passes exact strings to worker; worker measures exact input SHA-256 | Exact-version acknowledgment and mismatch tests |
| Independent candidate SDNA | Operator supplies candidate.sdna.yaml to integration boundary; B receives its existing three-file input | Missing/malformed/candidate mismatch refusals; no A SDNA production |
| A5 verified handoff | Existing receiver seam and local-evidence verifier; invocation/request IDs, worker-origin capture and build fingerprints | Acceptance requires actual ingress PASS and verified exact versions; forged/stale/replayed evidence blocks |
| B hard STOPs and explicit seals | Existing session/command gate execution, separate RUN/SEAL buttons | Every B1–B5 STOP halts progression; no automatic sealing |
| Preserve B3/B4/B5 semantics | Pinned unmodified binding, audit and prism source | Closed match vocabulary, UNBOUND, clearance/integrity-refusal and prism tests |
| Restricted B disclosure/egress | Only session progression/refusals shown; explicit sealed B export after verification/termination | Production browser export test; no raw context/vault/tree debug surface |
| Preserve U-001 | No B receipt-clock or hashing modifications | Pinned source preservation; no deterministic B-output-byte claim |

## Platform configuration and artifact lifecycle

- Vercel root: integrated. Include repository files outside root because existing segment-a modules are reused.
- Install npm ci; build npm run build; output dist. Node 24.x recommended. Git required during build.
- Source preparer verifies availability of exact B and protection-baseline commits. Private shallow clones require read-only source access. Optional MARA_B_SOURCE_TOKEN is build-only; credential helper restricts its destination. No VITE_ secret and no runtime secret are required.
- Vite emits same-origin module-worker and application assets under /assets. The application uses / with no client route rewrite requirement.
- CSP retains connect-src none; worker-src self permits the necessary B worker. This documented platform allowance does not authorize broader networking or script origins.
- Source/runtime transport is browser-local worker messaging; A2 collection/return remains manual. There is no invented B network endpoint.
- Session storage is ephemeral memory only. No database, localStorage/sessionStorage persistence, queue or automatic restoration. Reload loses state. Existing confirmed reset clears the session; cancellation preserves it.
- Exact A artifacts remain in the committed session and may be saved using existing A preparation controls. B exposes only its permitted sealed handoff. Independent SDNA is retained only for the active browser invocation and is not authored/exported by A.
- One active integrated transaction; separate B session per target UID. Aggregate A5 acknowledgment is all-or-zero, not a distributed durable transaction.

## Authentication and unsupported capabilities

Controlled browser evidence assumes trusted same-origin assets, shell, loader and worker. It is not authenticated remote delivery or signed deployed-build attestation. Receipt fields and self-declared receiver names do not independently establish production trust. Process/realm-local capabilities cannot be exported and reimported as valid authentication; reload clears replay state. No global persistent replay ledger is claimed.

Unsupported: automatic external collection; production runner provenance certification without real evidence; authenticated remote receiver; durable sessions; cross-environment receipt verification; retry/remint controller; C execution; production deployment authorization.

The existing one-second controlled handoff timeout remains. Large inputs or multiple targets may safely block rather than accept late evidence. No timeout expansion or threshold tuning is authorized by this document.

## Deviations and approval boundary

No deviation from universal requirements is authorized here. Because canonical commit binding and requirement-by-requirement reconciliation remain incomplete, full compliance and potential conflicts are UNVERIFIED. Record any discovered conflict explicitly and obtain Operator authorization at the canonical level before changing implementation.

The worker-src self allowance is a documented deployment mechanism required for worker execution, not approval to weaken universal CSP requirements. Its canonical compatibility remains subject to deployed CSP verification.

## Verification and acceptance

Existing receipts: 20 integrated tests and three integrated production Chromium workflows; original 73 tests and six Chromium workflows; nine source-blob checks; clean remote shallow-checkout install/build/test. These are recorded implementation evidence, not newly rerun tests for this documentation-only change.

Final interface acceptance requires:

1. Confirm the now-identified canonical path/version, bind its exact authority commit SHA, and complete requirement-by-requirement reconciliation.
2. Protected source, serialization, authority and stage topology preservation checks.
3. Connected A1–B5 browser execution under deployment CSP, explicit external fixture/real-return distinction, all STOPs and seals, exact artifacts and permitted export.
4. Negative tests for missing/invalid inputs, decisions, continuity, untrusted/replayed/stale acknowledgment and unavailable execution.
5. Reproducible install/build and verified Vercel root/outside-root/source-access configuration.
6. Separate production trust evidence: real runner provenance, approved production receiving environment and authentic execution evidence. Local integration results do not satisfy that gate.

INTEGRATION and BUILD evidence remain valid within their stated local scope. Canonical interface acceptance is BLOCKED pending exact authority commit binding and full reconciliation. Production trust remains BLOCKED independently.
