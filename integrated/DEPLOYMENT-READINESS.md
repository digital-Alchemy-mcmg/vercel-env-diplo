# A1–B5 Vercel integration — readiness report

Base: remote main 29c54dc2eff750c1d284e56775cb01e34de7fb9d, verified through GitHub and fetched with authenticated Git credentials. New isolated branch integration/a1-b5-vercel. Protected B remains d1b8348ded0190cccc7017526b8a16c84005db2a. Existing integration tags are untouched.

## Status

- INTEGRATION PASS: connected fixture A1 compilation → manual A2 dispatch/explicit return → A3 Operator selection → A4 minting → A5 verified browser-local ingress → B1–B5 explicit STOP/seal → verification/termination → sealed B export.
- VERCEL BUILD PASS: clean installation, strict TypeScript and Vite production build; separate browser worker and static assets emitted.
- DEPLOYMENT READY: static application configuration prepared and verified locally. Actual Vercel project/root/include-outside-root settings and build source credentials must be configured by the Operator. No deployed environment was tested or claimed.
- PRODUCTION TRUST PASS: BLOCKED. No verified production runner artifact, approved authenticated receiver, remote acceptance origin or deployed build attestation established.

## Boundaries and preservation

All changes are under integrated/. Existing segment-a source, A1–A4 semantics/serialization, A5 core verifier/local harness, compiler, topology, B frozen doctrine/stages, SDNA authority and C remain byte-unchanged. The shell loads the existing A main module through an adapter that appends getter/render exports in memory; original files and methods are not edited. Progressive disclosure is applied by the shell to existing sections. The worker invokes unchanged SegmentBSession/handleCommand from pinned Git source. No validator copies, automatic seals, correction loop, reminting or fake runner are added.

Candidate SDNA is an independent file selected in the integration boundary, never produced by A. Each target has its own B session. Every B RUN/SEAL/FINISH/EXPORT goes through the existing command/session gates. UI exposes only session progression/refusal diagnostics and the permitted sealed export, not raw B context, bindings, trees or vault. B3/B4/B5 semantics are those of the pinned source. U-001 timestamps remain unchanged; exact A input hashes and source/build fingerprints supply identity rather than serialized B output.

## Browser evidence

The existing Receiver.receive seam and local-evidence registry are preserved. The browser adapter creates a dedicated Worker, random request IDs and the existing A5 attempt UUID. Only the pending request's worker response can be consumed. Worker runs actual B ingress on exact A4 strings, independently measures both SHA-256s, captures SessionView/refusals and returns attempt/transaction/time/build identity. Adapter compares the source/dependency/build fingerprint generated for both sides of this build, then issues the existing process-local receipt capability. A5 verifies freshness, origin, one-use invocation binding and exact versions before acknowledgment.

This establishes controlled browser-realm execution evidence, not production authentication. Same-origin scripts, build loader and deployed assets are trusted. A malicious trusted script/build can subvert the realm; matching build strings alone are not a signed supply-chain attestation. No external receiver string is treated as authentication. Receipts cannot be serialized and imported as valid capabilities. Reload clears both capability and worker sessions; no cross-process/global replay protection is claimed. Timeout remains the existing one-second controlled boundary; large inputs/multi-target runs can safely block rather than accept late evidence.

## Infrastructure

Root integrated; install npm ci; build npm run build; dist output; Node 24.x recommended; Git required during build. Repository files outside root must be included. The pinned source must already be in the checkout or fetched with read-only repository access. Optional build-only MARA_B_SOURCE_TOKEN supports private shallow clones and is never exposed to client modules. No runtime secrets/services are needed. CSP worker-src self is the only added execution allowance; connect-src none remains.

## Fresh verification

October 13, 2026, America/New_York. Commands run from their stated roots:

- integrated: npm ci --cache /tmp/envoy-npm-cache --no-audit --no-fund — clean install passed.
- integrated: npm test — connected pipeline plus negative authority and receipt tests passed (20/20).
- integrated: npm run build — strict TypeScript and production worker build passed.
- integrated: ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e — three connected workflows passed, including full A1–B5 under CSP, invalid SDNA, decision/cancellation and reload loss.
- segment-a: npm ci, npm test — original 73/73 passed, including replay, forged/missing/partial/stale/version receipt and timeout protections; original production build passed.
- integrated: npm run verify:source — exact protected-path and nine source-blob checks (rerun after staging).

Initial build found a top-level await TypeScript module marker missing in the build-only Git helper; corrected with export {}. Initial git fetch authentication failed before work began; explicit GitHub credential helper and remote-tracking ref fetch established the correct base before edits. No source semantics were changed to pass tests.

## Remaining blockers / Operator prerequisites

1. Configure Vercel root, inclusion of outside-root repository files, Node and read-only build source access; inspect a preview deployment separately when authorized.
2. Supply authoritative real runner return/provenance and independent SDNA. Fixtures only prove mechanics.
3. Approve production trust/receiving environment and authentic evidence mechanism before claiming production acceptance.

No main merge or production deployment. No source-derived stage semantics are invented to eliminate UNBOUND or refusal. No threshold tuning.

## Clean-checkout execution receipt

Implementation 69bc4915032cf441599db2085cab0e3e1b129ecc was pushed and cloned from the remote into a fresh depth-1 checkout. Clean npm ci passed. The build fetched protected B using the build-only credential helper and passed TypeScript/Vite compilation with identical worker/main asset names to the working-tree build. All 20 integrated tests passed again. No workstation server, local source path or copied validator was needed. The build-only token was supplied through environment inheritance without printing it or adding it to client assets.

The source preparer also makes the exact main protection baseline available for independent source verification in shallow checkouts. Final protected-file verification confirms all changes are new integrated/ files; nine vendor blob checks passed. Original suite: 73/73 tests and 6/6 Chromium workflows; integrated suite: 20/20 tests and 3/3 Chromium workflows. Total fresh results: 93 tests and nine browser workflows across both roots. This is local/clean-build verification, not a Vercel deployment or production trust claim.

## Interface policy reconciliation

[Deployment-specific interface specification](INTERFACE-SPECIFICATION.md) records platform controls, requirements, unsupported capabilities and acceptance gates. Canonical interface specification on main is now identified: `docs/interface/MARA_INTERFACE_PREREQUISITES.md`, version 1.0, commit `4f31b58ba048360a87136283f57e4e5d5b0f98d4`. See [canonical reconciliation and gap register](CANONICAL-RECONCILIATION.md). Final acceptance remains blocked pending control-level and hosted verification. This update does not alter runtime behavior or override universal authority. This documentation-only update does not alter runtime behavior or override universal authority.
