# Vercel deployment repository specification and receipt

Target: digital-Alchemy-mcmg/vercel-env-diplo, main.
Initial target commit: c0967f1bcf706b5f1fb0ef2ffda4f834b7a58421.
Upstream: digital-Alchemy-mcmg/Envoy_Diplomat, integration/a1-b5-vercel, ab74a3d8bfc11d5f6c4d520b21f459fd116f83bb.
Canonical authority: docs/interface/MARA_INTERFACE_PREREQUISITES.md on source main, version 1.0, commit 4f31b58ba048360a87136283f57e4e5d5b0f98d4, as referenced by the preserved upstream interface/reconciliation documents. This packaging does not modify universal requirements or resolve recorded implementation gaps.

## Platform and mechanisms

Vercel Vite static hosting; Node 24.x/Git build environment; same-origin browser main realm and dedicated module worker. Repository-root vercel.json forwards install/build to integrated/ and publishes integrated/dist. Because the build root is repository root, existing segment-a imports remain available without Vercel's outside-root inclusion setting.

Runtime, ephemeral storage, manual external transport, independent SDNA, same-realm acknowledgment evidence, authentication limitations, permitted artifact handling and STOP controls remain as specified in the preserved integrated/INTERFACE-SPECIFICATION.md and CANONICAL-RECONCILIATION.md. No new server/storage/runner/receipt protocol or protected-stage modification is introduced. CSP retains connect-src none and same-origin worker allowance.

Build-only source access is required to fetch protected B d1b8348ded0190cccc7017526b8a16c84005db2a and the protection baseline. MARA_B_SOURCE_TOKEN must have read-only access to the source repository, not merely this target. Credential helper only sends it to the expected source host/path; it never enters the runtime bundle. No new secret was committed or configured externally.

## Unpacking and source-preservation proof

The supplied ZIP and serialized manifest each enumerate 122 files with the same path set. ZIP bytes were independently compared to Git blobs at the current upstream branch head: zero mismatches. All 122 source files were unpacked; no embedded .git or node_modules were extracted. docs/SOURCE-SNAPSHOT.json records their SHA-256 digests. npm run verify:source verifies all 122, using docs/UPSTREAM-PACKAGE.json and docs/UPSTREAM-README.md for the two explicitly adapted root files.

Root package.json is a clean build wrapper; root README contains target deployment instructions. Root package-lock.json, vercel.json, .gitignore and target verification/provenance documentation are deployment additions. integrated/, segment-a/ and legacy source files remain byte-identical. Original archive files are preserved. Legacy webapp packages are not installed or used in the Vercel build.

## Fresh verification receipt

October 14, 2026, approximately 1:18 a.m. America/New_York.

- npm --prefix integrated ci --cache /tmp/envoy-npm-cache --no-audit --no-fund: clean install passed.
- npm run build: protected-source acquisition, strict TypeScript and Vite build passed. Build-only token supplied through environment inheritance without printing or bundling it.
- npm test: 20/20 integrated tests passed.
- ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e: 3/3 production browser workflows passed, including actual A1–B5 under CSP, malformed/independent SDNA refusal and decision controls.
- npm --prefix segment-a ci and npm --prefix segment-a test: original 73/73 tests passed after obtaining the original pinned test reference.
- npm run verify:source: 122/122 upstream files matched; root adapters explicitly identified.
- Application/worker production assets: index-EeI8Ez7l.js and worker-CGpFXBHT.js, matching the source branch build.

No tests were weakened. No Vercel project settings, source branches, source main, existing source tags or production deployment were changed.

## Acceptance and limits

Build/package integration PASS. Source equivalence PASS. Vercel configuration prepared; actual Vercel project credential settings and deployed execution remain unverified. Production runner provenance, authenticated production receiving evidence and canonical interface/control acceptance remain subject to the source reconciliation's open gaps. Successful fixture tests are not production certification.

Operator prerequisites: import this repository with root configuration, configure read-only source access if needed, authorize deployment separately, then verify the hosted workflow with authoritative runner returns and independent candidate SDNA. Do not assume the root packaging resolves A1/A2 dispatch receipts or other canonical gaps.
