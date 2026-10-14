# Plan 02 — data flow and gate report, Revision 2

Inspection and final verification: October 13, 2026, 08:23–08:24 UTC (04:23–04:24 America/New_York). Controlling authority: [verbatim Operator Plan 02](operator-plan02-r2.txt), following [Plan 01](operator-directive-r2.txt). This report describes local construction and freshly executed checks; it does not claim a live runner or production receiver.

| Milestone | Result | Limit |
| --- | --- | --- |
| STRUCTURE COMPLETE | Complete locally | 20 A addresses, 17 junctions; reserved routes disabled; external services unverified |
| CONTRACTS VERIFIED | Partial, supported local route verified | Existing returned artifacts and newly minted A pairs pass frozen B ingress; vendor formats and production receipt contract unresolved |
| B1 HANDOFF ACCEPTED | NOT ACCEPTED in production | Isolated B ingress succeeds in tests; no production acknowledgment mechanism established |

## Evidence and lineage

| Source | Exact ref / path | Status and use |
| --- | --- | --- |
| Envoy main | 57f9d054a9c0ddf3c1cfed70086a03c509f9e378 | Unchanged baseline; independent segment-a root |
| Plan 01 A | f464b67d6d15f7ff24ac46ceee818e25ae75b707; receipt 501c436a80dc5057009aee4223ae0533c9441276 | Local predecessor, branch a1-a5-structural-r2 |
| Compiler | A-A2_multicompiler @ 191cf1c04c2ac36a2577f2938cb33ca9ba2d2564, webapp/src/components/{compiler,types,batch-compiler,batch-ingress-adapter,observation-artifacts,decomposition-engine}.ts | Confirmed immutable source; six exact copies. Compiler owns A1 certification; returned artifact producer owns observation identifiers, not A-side inference |
| B | Envoy_Diplomat @ d1b8348ded0190cccc7017526b8a16c84005db2a, src/b/authority/{envelope,sidecar}.ts and src/b/types.ts | Three exact copies for local checks; B unchanged |
| B actual ingress | Same B ref, src/runtime/{input-names,ingress,session,protocol,worker}.ts; src/b/engine.ts | Read directly from Git; real acceptThreeFiles/executeIngress exercised in isolated tests |
| Legacy A | maraSEGMENTS/segment/A @ d50abda722aa4e6222e7a5e6d2ca1c9176271db0, STAGE_A_YAML_FIRST.zip | Prior reconnaissance only; A0–A11 not renamed, deleted or substituted for new structural stages |
| New A logic | segment-a/src/core/{topology,pipeline,imports,certification,model}.ts; src/main.ts | Plan 02 structural adaptations, distinct from byte-preserved vendors |

[Source manifest](source-manifest.json) records all nine independent Git blob hashes. Source verification passed 9/9 and confirms tracked legacy/B/C paths unchanged. Pinned [B protocol](https://github.com/digital-Alchemy-mcmg/Envoy_Diplomat/blob/d1b8348ded0190cccc7017526b8a16c84005db2a/src/runtime/protocol.ts) returns WorkerResponse `{view,envelope?}`; this is not an A transaction receipt acknowledging both input version hashes. Its worker/session ingress feedback does not establish such a receipt.

## Component contracts and boundaries

| Component | Ingress → egress | Ownership, dependency and refusal boundary |
| --- | --- | --- |
| A1 | Existing DiskDefinition → certified Cartridge | Frozen compileDisk/validateCartridge; invalid definition/certification refuses. Repeated invocations retain independent outputs |
| A2 | Stored compiler invocation → full manual JSON display/copy | Existing optional batch adapter; folder/automation remain disabled. Display/copy does not run external software |
| A3 | Runner text/Markdown or saved PIN text → confirmed decisions and exact evidence | Existing returned structures preserve UID/source/batch/runner context. Duplicate identity, malformed return, hash mismatch or exclusion bypass refuses; PIN/PENDING/REJECT are not active PUSH targets |
| A4 | Explicitly confirmed PUSH selection plus corpus/payloads → one envelope/sidecar pair per UID | Confirmation/revision guard, identity/source checks and original qualified taxonomy. No auto decomposition; commit preserves staging and hashes exact serialized artifacts |
| A5 | Committed pair versions plus committed source snapshot → locally certified downloads; test-only receipt evaluation | Independent certification, topology and source accounting. All selected pairs must have exact-version acceptance or zero accepted; no repair or rewrite |

Stage boundaries here are operator-controlled transitions in one stateless browser application, not independently deployed APIs. In particular A3→A4 decisions and source evidence are separate logical fields carried by the same commit call. Extraction/minting and certification remain separate. A artifact completion markers do not mean B acceptance; A5 production transmission is disabled. A does not create or consume candidate SDNA.

## Gate inventory

One uninterrupted counter per A component, starting G1, shared across directions. Disabled reservations consume their numbers. Direction classification precedes allocation. Addresses are logical, not invented physical endpoints.

| Component | Final addresses and roles |
| --- | --- |
| A1 | A1<G1: configuration; A1>G2: certified search JSON |
| A2 | A2<G1: search JSON; A2>G2: manual display/copy; A2>G3: reserved folder; A2>G4: reserved automation |
| A3 | A3<G1: returned result; A3<G2: PIN reimport; A3>G3: decisions; A3>G4: source evidence; A3>G5: PIN export |
| A4 | A4<G1: decisions; A4<G2: source evidence; A4>G3: envelope; A4>G4: sidecar |
| A5 | A5<G1: envelope; A5<G2: sidecar; A5>G3: certified envelope; A5>G4: certified sidecar; A5_G5: bidirectional test-only handoff control |

A5_G5 reflects request and response through Receiver.receive, not a confirmed public B endpoint. No external runner or B gate numbers are allocated. Runtime declarations and source-symbol evidence: [topology.ts](../src/core/topology.ts). UI exposes this inventory read-only.

| Junction | Source → destination | Status |
| --- | --- | --- |
| J01 | Operator → A1<G1 | Local |
| J02 | A1>G2 → A2<G1 | Local |
| J03 | A2>G2 → Operator display/copy | Local |
| J04 | A2>G3 → future folder | Reserved, disabled |
| J05 | A2>G4 → future automation | Reserved, disabled |
| J06 | Manual A2>G2 output → external runner | External unverified; manual operator action |
| J07 | Returned external result → A3<G1 | Local import verified; runner execution unverified |
| J08 | Saved PIN text → A3<G2 | Local |
| J09 | A3>G3 → A4<G1 | Local |
| J10 | A3>G4 → A4<G2 | Local |
| J11 | A4>G3 → A5<G1 | Local |
| J12 | A4>G4 → A5<G2 | Local |
| J13 | A5>G3 → existing B envelope ingress | Isolated test only; physical gate undeclared |
| J14 | A5>G4 → existing B sidecar ingress | Isolated test only; physical gate undeclared |
| J15 | Independent Operator SDNA → existing B SDNA ingress | Isolated test only; outside A |
| J16 | B acknowledgment → A5_G5 | Test seam only; production mechanism absent |
| J17 | A3>G5 → Operator saving → J08 | Local; completes accounting of existing PIN export |

J17 accounts for a preexisting Plan 01 endpoint omitted from the suggested J01–J16 list. It does not add an external service.

GV-01 checks unique consecutive shared counters; GV-02 checks directions/routes; GV-03 checks classification/source evidence; GV-04 checks complete, nonduplicate endpoint/junction accounting; GV-05 is enforced by independent certification without altering artifact bytes; GV-06 preserves reserved/test-only branch semantics; GV-07 preserves component ownership. Mutation tests cover invalid counters, directions, classification, missing/duplicate/moved endpoints, route reversal and unauthorized promotion.

## A5 → existing B compatibility

“B1 ingress” denotes the existing B system boundary before pure B1. B's three-file validation receives SDNA; pure B1 remains target-only. Neither target/candidate stage blindness nor B semantics is changed.

| Artifact | Producer / format / validator | Evidence and remaining unknown |
| --- | --- | --- |
| SEALED_A_ENVELOPE.json | A4, B existing envelope shape; A5 validatePair/validateTransaction and frozen B acceptThreeFiles/executeIngress | Actual generated bytes accepted locally for supported qualified return; production exact-version receipt absent |
| STAGE_A_SIDECAR.json | A4, B existing sidecar fields plus provisional A_staging corpus extension; same validators | Actual extension accepted by unchanged B. Formal external extension contract not established |
| candidate.sdna.yaml | Operator or independent candidate producer, never A; unchanged B parser/gate | Separate test-receiver fixture; real candidate provenance and transfer outside A remain Operator-owned |

Frozen B has one target_id/raw_posting per invocation. A therefore mints a pair per PUSH UID; aggregate all-or-zero acknowledgment is A-side test behavior. A multi-target production receiver transaction is unresolved.

Newly minted A_staging records account for every PUSH/PIN/PENDING/REJECT record, exclusion/activity flags, exact raw source/hash, references, batch/runner and certified search-scope association. Original payloads and their hashes are retained. Only the selected UID is active in each pair; other PUSH records are inactive in that pair and REJECT is always excluded/inactive. A5 compares this against the committed corpus and envelope provenance/audit trail. Tampering tests recompute outer artifact hashes, demonstrating that underlying integrity checks still refuse. This extension is explicitly an A-side adaptation permitted by B's existing extensible type and observed validator behavior, not a new permanent upstream runner schema. Prior artifact versions are never rewritten.

New PIN exports preserve archived compiler scope certification across reset/reimport. Older exports without that archive do not acquire invented historical context. Plain descriptions without authoritative qualified fact_table cannot pass A5; thresholds/taxonomy are not manufactured.

## Fresh verification and receipts

Final run: October 13, 2026, 08:23:40 UTC onward, Node 24.19.0, npm 11.9.0, system Chromium / Playwright 1.56.1.

| Check | Actual result |
| --- | --- |
| npm test | 50/50: 26 pipeline, 24 topology/integrity tests |
| npm run verify:source | 9/9 byte-identical; tracked legacy/B/C unchanged |
| npm run build | Strict TypeScript and production Vite build passed |
| ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e | 6/6 browser workflows passed against fresh production output |
| Clean install | Plan 01 receipt records executed clean install; dependencies unchanged in Plan 02; not falsely reported as rerun |

Tests exercise real unchanged B ingress with actual A4 strings and separate SDNA, including a real candidate identity refusal. Test receipt acceptance binds exact sent versions. Connection-only, missing, partial, duplicate, rejected, wrong-transaction/version, transport-error and timeout responses all yield zero accepted while preserving artifacts. Browser tests verify manual routes, disabled paths, read-only inventory, cancellation/rejection/PIN behavior, local downloads and missing-taxonomy refusal under deployment CSP. Tests are local evidence, not real vendor delivery or production handoff.

Detailed receipts: [verification receipt](verification-receipt.md); tests: [pipeline](../tests/pipeline.test.ts), [topology](../tests/topology.test.ts), [browser](../tests/workflow.e2e.ts).

## Deployment assessment and decisions

Vercel-compatible static build: branch a1-a5-structural-r2, Root Directory segment-a, npm ci, npm run build, output dist. Existing repository root workspace settings are untouched. Static HTTPS hosting is an alternative. CSP forbids runtime network connections; activating any real transport requires separately established contract and authorized configuration, not deployment alone.

Blockers and Operator decisions:

- Supply authoritative production receiver endpoint/adapter, authentication, exact-version receipt and timeout/retry rules; confirm atomic multi-pair acceptance. Existing B WorkerResponse is insufficient. Keep B/C unchanged.
- Establish real runner delivery/returned formats and provenance. Manual copy/import is not an automatic runner connection.
- Supply authoritative qualified taxonomy for prose-only returns; A will not infer it.
- Confirm external acceptance/version policy for provisional A_staging, despite successful unchanged-B local validation. Do not silently turn it into a permanent producer schema.
- Preserve B-U001: wall-clock timestamps prevent deterministic full serialized B envelopes. No timestamp substitution or B repair performed.

Completion receipt: local A construction, gate/accounting validation, evidence-preserving certification, negative acknowledgment checks, source verification, browser verification and production build performed. Branch remains local. No push, PR creation, main/B/C change, merge, settings change, live runner, live B transmission or deployment performed. Production handoff remains blocked; no additional implementation of external contracts follows from local test success.

STOP — AWAITING OPERATOR APPROVAL.
