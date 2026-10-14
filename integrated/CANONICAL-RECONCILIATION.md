# Canonical reconciliation — MARA A1–B5 Vercel interface

Status: **REFERENCE RESOLVED; CONTROL VERIFICATION INCOMPLETE**.
Canonical: [MARA_INTERFACE_PREREQUISITES.md](https://github.com/digital-Alchemy-mcmg/Envoy_Diplomat/blob/4f31b58ba048360a87136283f57e4e5d5b0f98d4/docs/interface/MARA_INTERFACE_PREREQUISITES.md), version 1.0, commit `4f31b58ba048360a87136283f57e4e5d5b0f98d4`.
Deployment branch: `integration/a1-b5-vercel`; application root `integrated/`.
Implementation baseline: protected B `d1b8348ded0190cccc7017526b8a16c84005db2a`. This document is a documentation audit, not a new test run.

## Control-to-implementation traceability

| Canonical control | Existing integration evidence / interface | Current assessment |
| --- | --- | --- |
| Stage state, STOPs, explicit authority (sections 3, 10–14) | B worker session/command gates; explicit RUN/SEAL; readiness report | Local test evidence; deployed behavior UNVERIFIED |
| Identity, artifacts, hashes, receipts (section 3) | A4 exact strings and SHA-256, A5 invocation-bound worker receipts | Browser-local evidence; production authenticity UNVERIFIED |
| A1 compile and certified selection (section 4) | Existing A compiler/UI via integration adapter | Local evidence; control-by-control UI audit UNVERIFIED |
| A1→A2 certified invocation, JSON export, dispatch state distinctions (section 5) | Manual JSON export, no integrated external runner | Manual exchange documented; actual runner handoff/ACK/execution UNVERIFIED |
| A2→A3 return provenance (sections 6–7) | Explicit import, Operator PUSH/PIN/REJECT, missing taxonomy blocks | Local negative tests recorded; real return provenance UNVERIFIED |
| A4 commit and immutable mint (section 8) | Existing A4 commit and sealed artifacts | Local evidence; deployed irreversible-action confirmation UNVERIFIED |
| A5 B ingress + independent SDNA (section 9) | Independent candidate.sdna.yaml; exact envelope/sidecar versions; worker receipt | Browser-local evidence only; production receiver BLOCKED |
| B1/B2 target decomposition/tree (sections 10–11) | Pinned protected B worker and command gates | Runtime source reused; detailed UI evidence exposure UNVERIFIED |
| B3 binding, B4 truth, B5 semantic lock (sections 12–14) | Pinned B implementation; STOP/seal; restricted output | No stage logic changes; UI-level evidence inspection UNVERIFIED |
| Accessible operational controls (section 15) | Integrated progressive disclosure | Keyboard/accessibility audit UNVERIFIED |
| Deployment matrix: runtime, storage, auth, secrets, background, audit (section 16) | Browser worker; ephemeral session; build-only Git credential; no backend | Documented; no durable state or authenticated production transport |
| Acceptance and artifacts (sections 17–18) | Readiness report, deployment spec, this mapping/register | Preview deployment and production trust NOT PASSED |

## Unresolved gaps and deviations register

- **G-001 — Vercel team scope:** connected Vercel API returns 403 on intended team; preview not deployed. No substitute project or production deployment authorized.
- **G-002 — Canonical-to-UI coverage:** detailed control-by-control verification for evidence panels, recovery, accessibility and stage views remains unperformed.
- **G-003 — Runner provenance:** A2 external execution/return is manual; no verified authenticated runner acknowledgment or production receipt.
- **G-004 — Production B receiver:** browser-local worker evidence does not establish a production authenticated receiver.
- **G-005 — Ephemeral session:** reload discards progress; no durable state, queue, or global replay ledger.
- **G-006 — Source build access:** Vercel must read pinned B and baseline commits; validate build-time credentials without exposing secrets.
- **G-007 — Canonical text inconsistency:** section 19 calls the canonical document a draft not committed/approved, while its header declares Operator-authorized canonical status on main. Do not alter canonical main without Operator approval; treat the committed header and version binding as the reference and flag the contradictory historical paragraph for Operator decision.
- **G-008 — Deployment CSP/accessibility:** actual hosted behavior and accessibility remain untested.
- **D-001 — No approved deviations:** none recorded. Any proposed change to universal requirements requires Operator approval.

## Acceptance evidence / next checks

Previously recorded in `DEPLOYMENT-READINESS.md`: 20 integrated tests, 73 standalone A tests, nine browser workflows across the two roots, clean build and source checks. These are **prior local receipts**, not new verification and not Vercel deployment evidence.

Next: resolve Vercel team authorization; configure root `integrated`, outside-root sources, Node 24.x, `npm ci`, `npm run build`, output `dist`; deploy **integration branch preview only**; inspect hosted logs/CSP; run connected positive and refusal workflows; record each actual outcome. Do not merge main or claim production trust from fixtures.
