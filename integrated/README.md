# MARA A1–B5 integrated application

**START HERE:** [operator Vercel preview entry point](../START-HERE-VERCEL.md). Select **`integrated`** as the Vercel Root Directory; `webapp`, `segment-a` and `src` are not the integrated deployment root.

**Operator starting point:** [START-HERE-VERCEL.md](../START-HERE-VERCEL.md). Vercel Root Directory is `integrated`; do not select `src`, `webapp`, or `segment-a`.

This independent build root reuses the existing A UI/core and loads the protected B commit directly from Git at build time. It does not copy or modify B validators. Runtime execution is browser-local in a dedicated worker; no server, external runner, persistence or remote authentication service is introduced.

```sh
cd integrated
npm ci
npm run prepare:source
npm test
npm run build
npm run verify:source
ENVOY_CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

Use `npm run dev` for development. Production preview uses port 4185. Node >=22.12 is required; verification used Node 24.19.0. Install Chromium via Playwright if system Chromium is unavailable.

The build must have Git and pinned B commit d1b8348ded0190cccc7017526b8a16c84005db2a. prepare:source checks it and the exact main protection baseline, fetching those exact commits if absent, never a floating branch. For a private shallow checkout without inherited Git access, set **MARA_B_SOURCE_TOKEN** as a build-only secret with read-only Contents access to this repository. The credential helper restricts credentials to the expected GitHub host/repository and never imports the token into browser code. Do not use a VITE_ secret variable. If source access is unavailable the build refuses, rather than substituting validators.

## Operator workflow

1. Open A1, supply the existing compiler definition and compile it.
2. Open A2 and prepare/copy the full dispatch JSON. Send it to the actual external runner yourself. No collection is simulated or automatic.
3. Open A3, associate source scope if appropriate, import returned text/Markdown or the existing returned JSON structure, then decide PUSH/PIN/REJECT. Missing taxonomy stays a blocker.
4. Open A4, supply run/candidate references and explicitly confirm commitment. Artifacts remain unchanged.
5. Refresh the committed transaction list in the integration panel, independently supply candidate.sdna.yaml, then certify A5 and validate B ingress.
6. A5 checks exact artifact versions and invocation-bound worker evidence before acknowledging browser-local ingress. B1 is READY; no B stage runs automatically.
7. Select the target UID. Explicitly run each B stage, inspect its status/refusals, and seal at each HARD STOP.
8. After B5 seal, explicitly verify/terminate/seal, then export only the sealed B handoff.

Refresh/reload loses all state. Reset requires A's existing confirmation; cancelled reset preserves the session. Accepted SDNA is locked to the receiving invocation. Multiple selected targets have separate B sessions; select each UID to complete it. One integrated transaction is active at a time; reset to start another.

## Vercel configuration

Select branch integration/a1-b5-vercel and **Root Directory integrated**. Include repository files outside the Root Directory in the build (required for the existing segment-a imports). Install `npm ci`, build `npm run build`, output `dist`, Node 24.x. No runtime environment variables are required. Build-only Git source access is required as described above.

The app serves at `/`; no client-side route rewriting is needed. Vite emits the module worker and assets under `/assets`. CSP adds `worker-src 'self'` to A's restrictions because B now runs in a worker; `connect-src 'none'` and other restrictions remain. No outbound runtime requests or exposed secrets are required.

Browser tests apply actual deployment CSP to the production document. Source acquisition occurs only during build. Hosting the static result does not establish authenticated production delivery or real runner provenance.

See [readiness and verification report](DEPLOYMENT-READINESS.md). No production deployment is authorized by this branch.

Deployment interface authority and platform controls are recorded in [INTERFACE-SPECIFICATION.md](INTERFACE-SPECIFICATION.md). The canonical document now exists on `main` at `docs/interface/MARA_INTERFACE_PREREQUISITES.md` (version 1.0). The deployment-specific specification still requires commit-SHA binding and requirement-by-requirement reconciliation before final interface acceptance; this draft does not override universal requirements.
