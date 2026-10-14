# MARA-INTEGRATION-05 — controlled local execution receipt

Result: **LOCAL INTEGRATION VERIFIED**. Date: October 13, 2026, approximately 4:27 p.m. America/New_York (20:27 UTC). No production acceptance claimed.

## 01 — Implementation inventory

Isolated branch `integration/a5-b1-trusted-handoff`, base `84f08b27c719bbc7fbefa6735fb7446fe846c47e`. Original A and B worktrees remain clean. Protected B and compiler refs reconfirmed remotely at `d1b8348ded0190cccc7017526b8a16c84005db2a` and `191cf1c04c2ac36a2577f2938cb33ca9ba2d2564`.

| Changed file | Purpose |
| --- | --- |
| src/core/pipeline.ts | A5 handoff only: create invocation challenge and verify local execution capability before existing acknowledgment checks |
| src/core/local-evidence.ts | Process-local origin, integrity, freshness, exact-version and single-use verification |
| src/integration/local-receiver.ts | Harness-only Receiver adapter invoking unchanged pinned SegmentBSession.ingress |
| vitest.config.ts | Extend existing in-memory Git loader with source/transformed-module execution measurements |
| tests/execution-attestation.ts | Independent pinned-source, dependency, installed-tooling and harness measurements/checks |
| tests/trusted-handoff.test.ts | Actual session integration and evidence-negative cases |
| tests/protection.test.ts | Exact A1–A4 implementation/serialization and protected module comparisons |
| tests/pipeline.test.ts | Preserve historical compatibility cases, now refuse unauthenticated test receivers |
| docs/integration-05-receipt.md | This report |

No dependency changes. Existing installed dependencies reused; no fresh clean-install claim. Browser UI remains disabled for live transmission. The bridge runs through existing Vitest infrastructure, not an invented service or browser deployment.

## 02 — Actual interface trace

Existing fixture return → unchanged A3 staging/PUSH → unchanged A4 commit → A5 handoff → Receiver.receive(transactionId,pairs) → independently supplied test SDNA → fresh pinned SegmentBSession → ingress(files) → actual SessionView → exact-byte receiver hashes and execution record → A5 verifyLocalEvidence → existing all-pairs acknowledgment checks → ACCEPTED locally.

Each pair uses a fresh B session. No next-stage execution/sealing occurs. Multi-target acceptance is all-or-zero at A5; independent B sessions are not a distributed production transaction. No A4 string is parsed/reserialized by the bridge; strings are passed directly to B, which performs its own unchanged parsing.

## 03 — Evidence mechanism and actual sample

Each A5 call creates a random attempt UUID, separate from session-local transaction IDs. A process-local WeakMap binds the receiver object, actual returned receipt object, immutable serialized receipt snapshot, execution record and one-use status. Altered or copied JSON is not a valid capability. Prior-attempt or consumed capabilities cannot authorize a new execution; timestamp freshness is bounded by the existing one-second local wait.

The pinned loader reads unchanged B source with git show. Harness instrumentation outside B records evaluated module paths, original source hashes and transformed-code hashes. Original bytes are independently compared with the pinned Git source. The identity also measures B/local lockfiles, installed yaml, installed execution tooling, loader and harness source, plus Node runtime version. Measured identity must match the harness's captured approved identity before B invocation. The receiver hashes the actual submitted strings and retains actual SessionView/refusals. A5 verifies capability origin, transaction, invocation, freshness, intact receipt and complete exact-version bindings before acceptance.

This is a controlled-process trust boundary: the harness, loader and code executing inside the process are trusted. Issuance helpers are internal integration APIs, not exposed receipt endpoints. Malicious code with execution inside this trusted process can subvert that boundary; this is not sandbox isolation or production cryptographic authentication. Merely supplying plausible receipt fields or a receiver string does not satisfy the verifier.

Actual recorded fixture execution:

- Attempt: d732b6d4-6cd9-4bd3-9200-22f150f6162f
- Transaction: transaction-1
- Environment: local-node:v24.19.0:pid:9834
- Timestamp: 2026-10-13T20:27:03.691Z
- B: d1b8348ded0190cccc7017526b8a16c84005db2a
- Source SHA-256: 2fd6593378ce819727af319598bf42f4cdf9096ec2847f2e90e199612da1511b
- Dependency SHA-256: 86bc124e25a4dd715c39ce2691c9b7c5868c82922825ee01c47e82f4edd098a8
- Harness/transformed-build SHA-256: 95a81de9c2545c8eb13d0ee2c18b5d466d0abcc400b3d8f34b5b27e061ab9bbb
- Envelope SHA-256: dcfaf481f550f8958c5b5ca0296382ea29af154e2858e6fde26a00bb45f6720f
- Sidecar SHA-256: 1e051a48c3216ecbb6dfd9ee183d72de7268f8e3232dfd3d81786695c3c8e1d8
- Independent fixture SDNA SHA-256: 3462b84d49121b44e49fe9e2e1cad723ed691a361214ca322ba0ebfeb0652442
- Actual decision: INGRESS PASS; B1 READY; B2–B5/T06/EXPORT LOCKED; failed=false; refusals=[]

Reproduce the execution-record output: `MARA_PRINT_RECORD=1 npm test`. UUID/time/process identity vary intentionally; B serialized output is never the identity anchor.

## 04 — Tests and diagnostics

Executed from segment-a using the subprocess-capable sandbox profile:

| Command | Result |
| --- | --- |
| npm test (final run with MARA_PRINT_RECORD=1) | 73/73: 26 pipeline, 24 topology, 22 trusted-handoff, 1 protection |
| npm run build | Strict TypeScript and Vite production build passed |
| npm run verify:source | 9/9 byte-identical reused files; changes confined to segment-a |
| ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e | 6/6 browser workflows passed against fresh production build |

Trusted tests execute actual pinned B refusal for invalid envelope, sidecar, source continuity, target UID and taxonomy. Candidate mismatch preserves B's exact refusal records (including candidate_id_match). A5 retains BLOCKED public state and reports B rejection diagnostics; no public state expansion.

Receipt negatives cover wrong transaction, envelope/sidecar hashes, forged receiver, partial acknowledgment, copied/mutated evidence, replay across invocations, stale evidence, absent receipt and unavailable execution. Independent identity tests alter attestation commit, source, dependency and build identities and require blocking. Existing tests retain missing taxonomy, missing receiver and timeout coverage. All failures preserve artifacts and return explicit diagnostics; accepted fixture integration is not production certification.

Initial verification exposed a loader attestation path error: git ls-tree from the segment-a working directory omitted root B src paths. It was corrected with --full-tree and independently compared module bytes. An accidental root npm build invocation failed before legacy build execution (rimraf absent); correct segment-a build then passed. No legacy files were changed. Final passing runs supersede these initial tooling failures.

## 05 — Protection verification

Protection test compares the entire SegmentA implementation before certify with the base: A1–A4 methods, minting and JSON serialization are byte-identical. Imports, certification, model, topology, UI and compiler are byte-identical to base. Only import wiring and A5 handoff lines change in pipeline.ts. Gate inventory remains 20 addresses/17 junctions, with the existing A5_G5 TEST_ONLY boundary; no new numbers.

B is neither copied nor edited: modules load in memory from pinned Git source; instrumentation belongs to the external loader. Session ingress leaves B1 READY and later stages locked. Existing browser STOP flow remains unchanged. B U-001 wall-clock behavior is preserved by unchanged source; no B output determinism claim or timestamp substitution. C is untouched. Original A and B branches remain unchanged. No push, merge or deployment.

## 06 — Limits

Process-local capability evidence cannot be serialized and reimported as trusted evidence. Process restart clears authority and replay state; receipts from another process/environment have no recognized capability. There is no persistent/global replay ledger, production authentication or remote origin verification. Existing session-local transaction IDs alone are insufficient; attempts and capabilities supply local binding.

The harness fingerprint describes controlled execution, not a Vercel production build attestation or signed supply-chain proof. No production environment was approved. No verified production runner artifact is available. Fixtures exercise mechanics and qualified taxonomy transport only. Existing live UI transport remains disabled.

**PRODUCTION CERTIFICATION BLOCKED — VERIFIED RUNNER ARTIFACT REQUIRED**

## 07 — Next Operator decision

Provide a verified production runner return and provenance, independent candidate SDNA, and approve the production receiving environment plus authenticated execution-evidence return mechanism. Separately authorize any production bridge adaptation. This local bridge does not authorize deployment or public receipt-schema changes.
