# START HERE — VERCEL PREVIEW (MARA A1–B5)

**This is the entry point for deploying the existing integrated MARA application.** Do not select `webapp`, `segment-a`, or the repository root as Vercel's Root Directory.

## Identify the correct source

- **GitHub repository:** `digital-Alchemy-mcmg/Envoy_Diplomat`
- **Working branch:** `integration/a1-b5-vercel` (PR #5)
- **Vercel Root Directory:** `integrated`
- **Application source and build configuration:** `integrated/`
- **Application instructions:** [integrated/README.md](integrated/README.md)
- **Vercel-specific interface specification:** [integrated/INTERFACE-SPECIFICATION.md](integrated/INTERFACE-SPECIFICATION.md)
- **Build/test evidence:** [integrated/DEPLOYMENT-READINESS.md](integrated/DEPLOYMENT-READINESS.md)
- **Canonical interface requirements (on main):** [docs/interface/MARA_INTERFACE_PREREQUISITES.md](https://github.com/digital-Alchemy-mcmg/Envoy_Diplomat/blob/main/docs/interface/MARA_INTERFACE_PREREQUISITES.md)

## Vercel setup — preview only

1. Import `digital-Alchemy-mcmg/Envoy_Diplomat` into the **intended Vercel team**. Verify team access before creating a project; avoid duplicate projects.
2. Set **Root Directory = `integrated`**. Enable **Include source files outside of the Root Directory** (needed for existing Segment A imports).
3. Use **Install Command = `npm ci`**, **Build Command = `npm run build`**, **Output Directory = `dist`**, and **Node.js 24.x**. Build requires Git.
4. Ensure build-time read-only access to the pinned protected B source commit. For private shallow builds, `MARA_B_SOURCE_TOKEN` may be needed as a **build-only** secret. Never prefix it `VITE_`.
5. **Deploy the `integration/a1-b5-vercel` branch as Preview only.** Do not accidentally deploy default `main` as Production; if Vercel's import screen offers only `main`, stop and select an explicit-branch deployment mechanism.
6. Inspect deployment build logs, load the preview URL, and run the actual A1→A5→B1→B5 browser workflow with independently supplied candidate SDNA and external runner return evidence. Local fixtures do not establish production trust.

## Authority and STOP conditions

- No merge to `main`, no production deployment, no protected B edits, no reconstruction of A or B.
- A2 external runner execution is **manual**; exported JSON is not proof of runner execution.
- A5 browser-local ingress is not proof of authenticated production acceptance.
- B stages require explicit RUN and SEAL at their existing gates.
- The Vercel-specific specification still requires reconciliation with the now-present canonical document on `main`. This navigation file does **not** claim that reconciliation or deployment verification has passed.

**Quick recognition:** In the Vercel Root Directory picker, choose the folder literally named **`integrated`**. `src` is an internal source folder, not the deployment root.
