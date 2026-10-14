# MARA A1–B5 — Vercel deployment repository

Unpacked from the two supplied archive representations in this repository. Application source matches Envoy_Diplomat branch integration/a1-b5-vercel at **ab74a3d8bfc11d5f6c4d520b21f459fd116f83bb**. Runtime A/B source is unchanged.

## Vercel settings for THIS repository

Import digital-Alchemy-mcmg/vercel-env-diplo and use **Root Directory = repository root** (leave blank), Framework Vite, Node 24.x. Root vercel.json installs the clean integrated package, builds the existing application and serves integrated/dist:

- Install: npm --prefix integrated ci
- Build: npm run build
- Output: integrated/dist

A private/shallow build must read the pinned source commits from digital-Alchemy-mcmg/Envoy_Diplomat. Set **MARA_B_SOURCE_TOKEN** as a secret with read-only Contents access to that source repository if inherited Git access is unavailable. It is used only during build; never name it VITE_*. No runtime secrets, server or workstation connection are required. If Git source access is missing, the build fails closed.

```sh
npm --prefix integrated ci
npm run build
npm test
npm run verify:source
ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

For original A regression tests, install segment-a separately with npm --prefix segment-a ci; those tests additionally require their pinned historical source commits in the local Git object store.

The root source-verification command is specific to this deployment repository. Upstream integrated/scripts/verify-source.ts compares the original repository's Git history and should not be used to audit this different repository; docs/SOURCE-SNAPSHOT.json and scripts/verify-snapshot.mjs verify the unpacked files here instead.

## Authority and operator workflow

See [deployment configuration and verification](docs/VERCEL-DEPLOYMENT.md), [source interface specification](integrated/INTERFACE-SPECIFICATION.md) and [canonical reconciliation](integrated/CANONICAL-RECONCILIATION.md). Upstream START-HERE-VERCEL.md and docs/UPSTREAM-README.md describe deployment from Envoy_Diplomat; this repository's root wrapper replaces that build-location configuration only.

A2 remains manual external dispatch and returned evidence. Candidate SDNA remains an independent Operator file. B retains every explicit STOP/seal and exports only the permitted sealed envelope. Reload loses session state. The unpacked UI has the same documented canonical/control gaps as the source; this packaging work does not certify production provenance, authentication or full interface compliance.

The original ZIP and serialized text are retained. No actual Vercel deployment is performed by this commit.
