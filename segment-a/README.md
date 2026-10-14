# MARA Segment A — Structural Revision 2

Independent A1–A5 application under `segment-a/`. Existing repository files,
legacy A implementations in their source repository, B1–B5, C and PR #2 remain
unchanged. The controlling directive is [Operator Revision 2](docs/operator-directive-r2.txt).

```sh
cd segment-a
npm ci
npm run dev
```

A1 uses the unchanged Scout compiler and 25-point validator. Fill the existing
definition fields; repeated invocations retain independent certified outputs.
A2 displays/selects/copies the complete JSON. Optional batch/runner fields use
the existing dispatch adapter for that invocation only. Prior displayed outputs
remain recallable. Folder/automated transports are visible and disabled.

A3 imports `.txt`/`.md` files or pasted text, including the existing JSON
`RunnerOutput.observations[]` / `ObservationArtifact` / `TravelingEnvelope` return
structures. UID/Observation_ID headers delineate plain records. Unmarked text is
kept as one unresolved record; the Operator may explicitly assign its UID.
Descriptions are not rewritten or semantically analyzed. Original payloads and
exact source bytes remain available; only display line endings are cleaned.
Duplicates remain visible. REJECT requires confirmation and is irreversible in
the session. PIN exports a lossless plain-text session file for A3 reimport.

A3→A4 commitment requires a warning and explicit confirmation. A4 snapshots the
PUSH selection, source corpus and original payloads. It never clears A3. Duplicate
selected UIDs, missing identity or exclusion conflicts refuse rather than alter
selections. One artifact pair is minted per target UID, using B's existing field
contract. Operator supplies run_id, candidate_id reference and pipeline_version;
this is not candidate SDNA. Raw SDNA is never created, parsed or exported by A.

A5 locally verifies artifact versions, identities, target/source hashes and B
structure. Qualified requirements come only from an already-returned target
fact_table; A does not classify plain descriptions to fill missing taxonomy.
Plain-text-only jobs can be staged and committed, but missing taxonomy blocks
B1 compatibility. Locally verified pairs have separate envelope/sidecar download
paths. Downloads are preparation for manual testing, not acknowledged handoff.

**Live B1 transmission remains disabled.** Frozen B has no established receipt
channel for exact transmitted artifact versions. The receiver seam is exercised
only in isolated tests. A5 accepts a transaction only if every UID and both hashes
are acknowledged as accepted by that receiver. Missing, partial, rejected,
duplicate, wrong-transaction or wrong-version acknowledgments give zero accepted
and preserve all committed artifacts. No Operator checkbox can fabricate receipt.

No database, automatic browser storage, draft persistence, server endpoint or
runtime network transport is added. Reset and navigation warn about losing the
ephemeral session. PIN export/artifact files must be manually saved.

```sh
npm run verify:source
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Tests read B directly from its pinned Git commit
`d1b8348ded0190cccc7017526b8a16c84005db2a`; no B source file is modified. A clone
must contain that commit. If absent, fetch the B branch explicitly before running
contract tests. A1–A5 production code does not include B's SDNA parser/runtime.
Existing system Chromium may be selected using `ENVOY_CHROMIUM_PATH`.

For a separately approved Vercel deployment set **Root Directory = segment-a**,
install `npm ci`, build `npm run build`, output `dist`. The local `vercel.json`
provides static hosting and a CSP forbidding network connections. Root repository
workspace/build settings are intentionally untouched. HTTPS static hosting is
also possible. No deployment, merge or B transmission is performed here.

See [reuse and compatibility](docs/reuse-and-contracts.md),
[unresolved interfaces](docs/unresolved-contracts.md) and
[change manifest](docs/change-manifest.md).

Plan 02 adds the read-only gate register, complete sidecar source/exclusion accounting and archived PIN scope validation. See [Plan 02 data-flow and gate report](docs/plan02-data-flow-and-gate-report.md) for final addresses, junctions, fresh verification and separately reported milestones. Production B handoff remains unaccepted.
