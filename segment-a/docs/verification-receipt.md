# Fresh verification receipt

Implementation: Operator Plan 01, Segment A structural Revision 2.
Source baseline: Envoy_Diplomat main
57f9d054a9c0ddf3c1cfed70086a03c509f9e378.
Frozen B consumer reference: d1b8348ded0190cccc7017526b8a16c84005db2a.
Tested implementation commit: f464b67d6d15f7ff24ac46ceee818e25ae75b707
(the implementation content tested before committing). Receipt-only follow-up
adds commit references without changing runtime, tests, dependencies or build.

Fresh verification performed October 12, 2026, approximately 8:15 p.m. America/New_York
(October 13 UTC). Node v24.19.0; npm 11.9.0; system Chromium with Playwright 1.56.1.

| Command / layer | Result | Evidence scope |
| --- | --- | --- |
| npm ci --no-audit --no-fund | Exit 0 | Clean independent install under segment-a; no original Amazon webapp installation |
| npm run verify:source | Exit 0; 9/9 | Nine source files byte-identical to independently pinned Git blobs; tracked changes confined to segment-a |
| npm test | Exit 0; 24/24 | A1/A2 3 checks; A3 6 checks; A3→A4 4 checks; A5/B compatibility/acknowledgment 11 checks |
| npm run build | Exit 0 | Strict TypeScript and Vite production output dist; no deployment |
| ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e | Exit 0; 5/5 | Repeated compile/manual copy; multiple uploads/duplicates/rejection; PIN export/reimport; commitment cancel/local certification/download/ACK blocking; plain-text missing-taxonomy refusal |

The browser commitment/handoff-readiness flow was run with the actual Vercel
document CSP applied locally. It reported no page errors, no local/session
storage use, and only local static-asset requests. B transmission remained disabled.

Actual A4-produced artifact strings were passed to B's unchanged pinned
acceptThreeFiles and executeIngress. Candidate SDNA was supplied only to the
isolated test receiver, not to A. Another test used the existing unchanged
buildObservationArtifact producer before A3→A4→B, rather than relying solely on
hand-shaped return fixtures. These prove local contract compatibility for that
supported return route, not a production transport or real runner execution.

Acknowledgment tests exercise full acceptance, wrong hashes, partial delivery,
explicit rejection, wrong transaction, duplicate entries, transport error and
missing acknowledgment timeout. Every failure preserves committed artifact
versions and upstream jobs. An accepted receipt is available only through the
test receiver seam; the production UI does not supply one.

Initial verification exposed test-infrastructure failures: a virtual-reference
filename incompatible with tsconfig lookup, sandbox process restrictions, a
source-map type mismatch, and fake timer advancement before the receiver wait
began. They were corrected in the test loader/test setup. Fresh final runs above
passed; no B or compiler behavior was changed to make them pass.

Not verified or performed: live B acknowledgment endpoint, live runner search,
production A→B→C E2E, deployment, merge, or changes to B-U001. Missing target
taxonomy and unresolved receiver contracts remain explicit blockers. No overall
production handoff completion is claimed.

## Plan 02 fresh verification

October 13, 2026, 08:23:40 UTC onward (04:23 America/New_York). Final Plan 02 implementation content: npm test 50/50 (26 pipeline, 24 topology); verify:source 9/9 unchanged source blobs; strict TypeScript/Vite production build passed; fresh production Chromium workflows 6/6 passed. Dependencies unchanged; earlier clean-install evidence remains historical. Positive and negative tests use actual frozen B ingress without modifying B. Connection-only receipts and real candidate-identity refusal cannot yield A acceptance. No live acknowledgment, deployment, push or merge. See plan02-data-flow-and-gate-report.md for milestone limits.

Plan 02 tested implementation commit: 19728d2e4e9b08c826df405b9c34e1a1de5060b8. Subsequent receipt-only commit adds this identity without runtime changes. Post-commit source verification passed again under the required subprocess-capable sandbox profile; an initial restricted-profile repeat returned git EPERM, a tooling restriction rather than source drift. Original B checkout remains clean at d1b8348ded0190cccc7017526b8a16c84005db2a.
