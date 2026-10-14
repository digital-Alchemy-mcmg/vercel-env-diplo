# Change manifest — A1–A5 structural Revision 2

Branch: a1-a5-structural-r2. Base: Envoy_Diplomat main
57f9d054a9c0ddf3c1cfed70086a03c509f9e378.

Implementation commit: f464b67d6d15f7ff24ac46ceee818e25ae75b707.
The subsequent receipt-only commit records this reference; it changes no runtime
or test behavior. The branch is local and has not been pushed, merged or deployed.

All added files are under segment-a/. Existing root/workspace, webapp, legacy B,
B standalone branch/PR #2, C, compiler source repository and legacy A repository
are unchanged. This document accompanies the implementation commit; use
`git log --oneline -- segment-a` for exact implementation commit references.

| Added surface | Purpose |
| --- | --- |
| package.json, package-lock.json, tsconfig.json, vite.config.ts, index.html, vercel.json | Independent clean TypeScript/Vite build and proposed static deployment root |
| src/vendor/scout/*.ts; src/vendor/types.ts; src/vendor/b-ingress/*.ts | Nine byte-identical reused files, pinned by docs/source-manifest.json |
| src/core/model.ts | Session-only structural state and provisional test receiver seam |
| src/core/imports.ts | Existing return-contract ingestion, text/Markdown delineation, exact source preservation and PIN reimport |
| src/core/pipeline.ts | Compiler/dispatch routes, operator decisions, safe commitment, minting and all-or-zero acknowledgment gate |
| src/core/certification.ts | Local B structure, provenance and exact artifact-version validation |
| src/main.ts, src/style.css | Five-stage UI, manual copy/download, review controls and explicit destructive confirmation dialogs |
| tests/*.ts, playwright.config.ts, vitest.config.ts | Stage, frozen-B contract and browser verification; reference B source read from Git in memory |
| scripts/verify-source.ts | Independent source-blob preservation checks and legacy/B/C change guard |
| README.md, docs/* | Operator directive, reuse inventory, interface gaps, change inventory and verification evidence |

No production receiver, network transport, database, automatic draft persistence,
candidate SDNA pipeline, merge or deployment is included.

## Plan 02 follow-up

Adds core/topology.ts, tests/topology.test.ts, verbatim operator-plan02-r2.txt and plan02-data-flow-and-gate-report.md. Updates A-only minting/certification/imports/model/UI and tests for full corpus/exclusion/source accounting, archived PIN scope and explicit receipt refusal reasons. No dependency or vendor source change. Exact follow-up commit is recorded in the verification receipt.
