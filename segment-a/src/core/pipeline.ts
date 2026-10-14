import { beginLocalAttempt, verifyLocalEvidence } from './local-evidence';
import { compileDisk, validateCartridge, sha256, computeDedupKey } from '../vendor/scout/compiler';
import { toScoutIngressEnvelope } from '../vendor/scout/batch-ingress-adapter';
import type { DiskDefinition } from '../vendor/scout/types';
import { delineate } from './imports';
import { validateTransaction } from './certification';
import { required, type ScopeRun, type Job, type Decision, type Committed, type Pair, type Receiver, type Refusal } from './model';

export class SegmentA {
  #scopes: ScopeRun[] = [];
  #jobs: Job[] = [];
  #payloads: { ref: string; raw: string }[] = [];
  #dispatches: { id: string; invocation: string; json: string }[] = [];
  #transactions: Committed[] = [];
  #refusals: Refusal[] = [];
  #revision = 0;
  #busy = false;
  #commitWarning: { token: string; revision: number } | null = null;

  view() { return structuredClone({ scopes: this.#scopes, dispatches: this.#dispatches, jobs: this.#jobs, transactions: this.#transactions, refusals: this.#refusals, payloads: this.#payloads }); }
  #fail(stage: string, resource: string, reason: string): never {
    this.#refusals.push({ stage, resource, reason }); throw new Error(reason);
  }
  #editable() { if (this.#busy) this.#fail('A3', 'workspace', 'A receiving commitment is in progress. Staging cannot change.'); }

  async compile(definition: DiskDefinition): Promise<ScopeRun> {
    const source = structuredClone(definition);
    let validation;
    try { validation = await validateCartridge(compileDisk(source)); }
    catch (error) { return this.#fail('A1', 'DiskDefinition', error instanceof Error ? error.message : String(error)); }
    if (!validation.passed || !validation.certified_cartridge) return this.#fail('A1', 'compiler validation', validation.checks.filter(c => !c.passed).map(c => `${c.id}: ${c.name}`).join('; '));
    const run: ScopeRun = { invocation: `scope-${this.#scopes.length + 1}`, cartridge: validation.certified_cartridge, validation };
    this.#scopes.push(structuredClone(run));
    return structuredClone(run);
  }

  dispatch(invocation: string, binding?: { batchId: string; runnerId: string }): string {
    const run = this.#scopes.find(s => s.invocation === invocation);
    if (!run) return this.#fail('A2', invocation, 'Unknown compiler invocation.');
    if (binding) { required(binding.batchId, 'Batch identity'); required(binding.runnerId, 'Dispatch runner identity'); }
    // Per-dispatch binding only, using the unchanged existing adapter.
    const json = binding ? JSON.stringify(toScoutIngressEnvelope(binding.batchId, [{ runner_id: binding.runnerId, disk_id: run.cartridge.definition.id, compiled_cartridge: structuredClone(run.cartridge), validation: structuredClone(run.validation) }]), null, 2) : JSON.stringify(run.cartridge, null, 2);
    this.#dispatches.push({ id: `dispatch-${this.#dispatches.length + 1}`, invocation, json });
    return json;
  }

  async importPayload(raw: string, name: string, scopeInvocation: string | null = null): Promise<void> {
    this.#editable();
    if (scopeInvocation && !this.#scopes.some(s => s.invocation === scopeInvocation)) return this.#fail('A3', name, 'Operator-selected search context is unknown.');
    const revision = this.#revision;
    let drafts;
    const sourceRef = `payload-${this.#payloads.length + 1}:${name}`;
    try { drafts = await delineate(raw, sourceRef); }
    catch (error) { return this.#fail('A3', name, error instanceof Error ? error.message : String(error)); }
    this.#editable();
    if (revision !== this.#revision) return this.#fail('A3', name, 'Workspace changed during import; retry without discarding existing state.');
    const imported: Job[] = [];
    for (const d of drafts) {
      const existing = [...this.#jobs, ...imported];
      const dedup = d.sourceUrl && d.employer ? await computeDedupKey(d.sourceUrl, d.employer) : null;
      let duplicate: Job | undefined;
      for (const j of existing) {
        const sameSource = j.sourceUrl && j.employer && dedup === await computeDedupKey(j.sourceUrl, j.employer);
        if ((d.uid && d.uid === j.uid) || d.sourceHash === j.sourceHash || sameSource) { duplicate = j; break; }
      }
      const rejected = existing.some(j => j.decision === 'REJECT' && ((d.uid && j.uid === d.uid) || j.sourceHash === d.sourceHash));
      imported.push({ ...d, key: `job-${this.#jobs.length + imported.length + 1}`, scopeInvocation,
        decision: rejected ? 'REJECT' : raw.startsWith('# MARA pinned text export\n') ? 'PIN' : 'PENDING', duplicateOf: duplicate?.key ?? null });
    }
    this.#editable();
    if (revision !== this.#revision) return this.#fail('A3', name, 'Workspace changed during import; nothing was replaced.');
    this.#jobs.push(...imported); this.#payloads.push({ ref: sourceRef, raw }); this.#revision++;
  }

  assignUid(key: string, uid: string) {
    this.#editable(); required(uid, 'Operator UID');
    const job = this.#jobs.find(j => j.key === key); if (!job) return this.#fail('A3', key, 'Unknown job.');
    if (job.decision === 'REJECT') return this.#fail('A3', key, 'A rejected record cannot be restored or altered in this session.');
    if (this.#jobs.some(j => j.decision === 'REJECT' && j.uid === uid)) return this.#fail('A3', key, 'This UID was rejected and cannot be restored within the session.');
    if (job.uid && job.uid !== uid) return this.#fail('A3', key, 'An existing source UID cannot be silently replaced.');
    job.uid = uid; this.#revision++;
  }

  decide(key: string, decision: Decision, confirmed = false) {
    this.#editable();
    if (!['PENDING', 'PUSH', 'PIN', 'REJECT'].includes(decision)) return this.#fail('A3', key, 'Unknown decision.');
    const job = this.#jobs.find(j => j.key === key); if (!job) return this.#fail('A3', key, 'Unknown job.');
    if (job.decision === 'REJECT') return this.#fail('A3', key, 'Rejection is irreversible within the current staging session.');
    if (decision !== 'REJECT' && this.#jobs.some(j => j.decision === 'REJECT' && ((job.uid && j.uid === job.uid) || j.sourceHash === job.sourceHash))) return this.#fail('A3', key, 'Equivalent rejected evidence cannot be restored through a duplicate row.');
    if (decision === 'REJECT' && !confirmed) return this.#fail('A3', key, 'Rejection requires an explicit warning and affirmative confirmation.');
    job.decision = decision; this.#revision++;
  }

  exportPinned(): string {
    const jobs = this.#jobs.filter(j => j.decision === 'PIN').map(j=>({ ...j,
      archivedScope: structuredClone(this.#scopes.find(s=>s.invocation===j.scopeInvocation)??j.archivedScope??null) }));
    jobs.forEach(j => required(j.uid, 'Pinned UID'));
    // Lossless plain-text session export, not a new permanent runner schema.
    return '# MARA pinned text export\n' + JSON.stringify(jobs, null, 2);
  }

  prepareCommit(): { token: string; warning: string } {
    this.#editable();
    const token = `commit-${this.#revision}`;
    this.#commitWarning = { token, revision: this.#revision };
    return { token, warning: 'Committing transfers only PUSH jobs to A4. Original evidence, decisions, exclusions and unselected jobs will remain in this session until a separately confirmed reset. This workspace is ephemeral and will be lost when closed or reset. Export PIN jobs and save them manually before leaving.' };
  }

  cancelCommit() { this.#commitWarning = null; }

  async commit(token: string, confirmed: boolean, identity: { runId: string; candidateId: string; pipelineVersion: string }): Promise<Committed> {
    this.#editable();
    if (!confirmed || !this.#commitWarning || token !== this.#commitWarning.token || this.#revision !== this.#commitWarning.revision) return this.#fail('A3', 'commit', 'A current warning and affirmative Operator confirmation are required.');
    required(identity.runId, 'Operator run_id'); required(identity.candidateId, 'Operator candidate_id reference (not SDNA)'); required(identity.pipelineVersion, 'Operator pipeline_version');
    const corpus = structuredClone(this.#jobs);
    const selected = corpus.filter(j => j.decision === 'PUSH');
    if (!selected.length) return this.#fail('A4', 'selection', 'No PUSH jobs were selected.');
    const uids = new Set<string>();
    for (const job of selected) {
      required(job.uid, 'Selected UID');
      if (uids.has(job.uid)) return this.#fail('A4', job.uid, 'Duplicate selected UID. No selection was silently changed.');
      if (this.#transactions.some(t => t.pairs.some(p => p.runId === identity.runId && p.uid === job.uid))) return this.#fail('A4', job.uid, 'This run/UID is already committed. Use an explicit new run identity.');
      if (corpus.some(j => j.decision === 'REJECT' && (j.uid === job.uid || j.sourceHash === job.sourceHash))) return this.#fail('A4', job.uid, 'Selected evidence conflicts with a rejected record.');
      uids.add(job.uid);
    }
    this.#busy = true;
    try {
      const pairs: Pair[] = [];
      // Plan 02 source accounting. This is an A-side corpus extension, not a
      // new required B schema. Top-level B source text remains one target.
      const payloadEvidence = await Promise.all(this.#payloads.map(async p => ({ ...p, content_sha256: await sha256(p.raw) })));
      for (const job of selected) {
        if (await sha256(job.raw) !== job.sourceHash) throw new Error(`Source integrity mismatch for ${job.uid}.`);
        const scope = this.#scopes.find(s => s.invocation === job.scopeInvocation) ?? job.archivedScope;
        const envelope = JSON.stringify({
          Z_state: { run_id: identity.runId, candidate_id: identity.candidateId, target_id: job.uid,
            pipeline_version: identity.pipelineVersion, current_stage: 'A_COMPLETE', status: 'complete:HANDOFF_TO_B' },
          A_scout: { target_entity: { company_name: job.employer, job_title: job.title }, source_url: job.sourceUrl,
            original_content_sha256: job.sourceHash,
            requirements_taxonomy: job.taxonomy ?? { hard_requirements: [], soft_requirements: [], keyword_lexicon: [] } },
          history: [{ stage: 'A4', operation: 'OPERATOR_PUSH_COMMIT', target_id: job.uid,
            batch_id: job.batchId, runner_id: job.runnerId, source_references: job.sourceRefs,
            search_scope: scope?.cartridge ?? null }],
          audit_trail: corpus.map(j => ({ target_id: j.uid, decision: j.decision, source_sha256: j.sourceHash })),
        }, null, 2);
        const sidecar = JSON.stringify({
          run_binding: { run_id: identity.runId, target_id: job.uid }, raw_posting: job.raw, original_content_sha256: job.sourceHash,
          A_staging: {
            // Provisional local extension: retain decisions/exclusions/source
            // rather than fabricate a permanent runner-side wire contract.
            records: corpus.map(j => ({ key: j.key, uid: j.uid, decision: j.decision,
              excluded: j.decision === 'REJECT', active: j.key === job.key,
              raw_posting: j.raw, source_sha256: j.sourceHash, source_references: j.sourceRefs,
              batch_id: j.batchId, runner_id: j.runnerId, search_scope_invocation: j.scopeInvocation ?? j.archivedScope?.invocation ?? null })),
            payloads: payloadEvidence,
          },
        }, null, 2);
        pairs.push({ uid: job.uid!, runId: identity.runId, envelope, sidecar, envelopeHash: await sha256(envelope), sidecarHash: await sha256(sidecar) });
      }
      const transaction: Committed = { id: `transaction-${this.#transactions.length + 1}`, pairs, corpus, payloads: structuredClone(this.#payloads), scopes: structuredClone(this.#scopes), state: 'COMMITTED', failures: [] };
      this.#transactions.push(transaction);
      this.#commitWarning = null;
      // No upstream clearing: receiving A4 owns its snapshot; A3 remains intact.
      return structuredClone(transaction);
    } catch (error) { return this.#fail('A4', 'commit', error instanceof Error ? error.message : String(error)); }
    finally { this.#busy = false; }
  }

  async certify(id: string): Promise<Committed> {
    const tx = this.#transactions.find(t => t.id === id); if (!tx) return this.#fail('A5', id, 'Unknown committed transaction.');
    if (tx.state === 'AWAITING_ACK') return this.#fail('A5', id, 'Certification cannot replace an in-flight acknowledgment state.');
    if (tx.state === 'ACCEPTED') return structuredClone(tx);
    tx.failures = await validateTransaction(tx);
    tx.state = tx.failures.length ? 'BLOCKED' : 'LOCALLY_VERIFIED';
    return structuredClone(tx);
  }

  async handoff(id: string, receiver?: Receiver): Promise<Committed> {
    const tx = this.#transactions.find(t => t.id === id); if (!tx) return this.#fail('A5', id, 'Unknown committed transaction.');
    if (tx.state === 'AWAITING_ACK') return this.#fail('A5', id, 'A handoff transaction is already awaiting acknowledgment.');
    if (tx.state === 'ACCEPTED') return structuredClone(tx);
    await this.certify(id);
    if (tx.state !== 'LOCALLY_VERIFIED') return structuredClone(tx);
    if (!receiver) { tx.state = 'BLOCKED'; tx.failures.push({ stage: 'A5', resource: 'B1 acknowledgment', reason: 'No verified B1 receipt channel exists. No artifacts were transmitted; zero accepted.' }); return structuredClone(tx); }
    const attempt = beginLocalAttempt(receiver);
    tx.state = 'AWAITING_ACK';
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // No production receiver is supplied by the UI. This is a testable seam.
      const receipt = await Promise.race([
        receiver.receive(tx.id, structuredClone(tx.pairs)),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('B1 acknowledgment timed out.')), 1000); }),
      ]);
      verifyLocalEvidence(receiver, receipt, attempt, tx.id, tx.pairs);
      if (receipt.transactionId !== tx.id) throw new Error('Wrong-transaction acknowledgment; zero accepted.');
      if (!receipt.receiver || !Array.isArray(receipt.artifacts)) throw new Error('Connection/receiver information alone is not artifact acceptance; zero accepted.');
      if (receipt.artifacts.length !== tx.pairs.length) throw new Error('Incomplete artifact acknowledgment; zero accepted.');
      for (const pair of tx.pairs) {
        const matches = receipt.artifacts.filter(a => a.uid === pair.uid);
        if (matches.length !== 1) throw new Error(`Missing or duplicate acknowledgment for ${pair.uid}; zero accepted.`);
        if (matches[0].accepted !== true) throw new Error(`B1 rejected ${pair.uid}: ${matches[0].reason ?? 'receiver supplied no rejection reason'}; zero accepted.`);
        if (matches[0].envelopeHash !== pair.envelopeHash) throw new Error(`B1 envelope version mismatch for ${pair.uid}; zero accepted.`);
        if (matches[0].sidecarHash !== pair.sidecarHash) throw new Error(`B1 sidecar version mismatch for ${pair.uid}; zero accepted.`);
      }
      tx.state = 'ACCEPTED';
    } catch (error) { tx.state = 'BLOCKED'; tx.failures.push({ stage: 'A5', resource: 'B1 acknowledgment', reason: error instanceof Error ? error.message : String(error) }); }
    finally { if (timer) clearTimeout(timer); }
    return structuredClone(tx);
  }
}
