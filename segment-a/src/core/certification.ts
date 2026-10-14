import { hydrateEnvelope } from '../vendor/b-ingress/envelope';
import { hydrateSidecar } from '../vendor/b-ingress/sidecar';
import { sha256, canonicalStringify, validateCartridge } from '../vendor/scout/compiler';
import { required, type Pair, type Refusal, type Committed } from './model';
import { validateGates, validateJunctions } from './topology';

export async function validatePair(pair: Pair): Promise<Refusal[]> {
  const failures: Refusal[] = [];
  const fail = (resource: string, reason: string) => failures.push({ stage: 'A5', resource, reason });
  let e: any, s: any;
  try { e = JSON.parse(pair.envelope); hydrateEnvelope(e); } catch (error) { fail('envelope', String(error)); }
  try { s = JSON.parse(pair.sidecar); hydrateSidecar(s); } catch (error) { fail('sidecar', String(error)); }
  if (e && s) {
    try {
      for (const k of ['run_id', 'candidate_id', 'target_id', 'pipeline_version', 'current_stage', 'status']) required(e.Z_state?.[k], `Z_state.${k}`);
      if (!e.A_scout?.target_entity || typeof e.A_scout.target_entity !== 'object' || Array.isArray(e.A_scout.target_entity)) throw new Error('A_scout.target_entity must be an object.');
      const t = e.A_scout.requirements_taxonomy;
      for (const k of ['hard_requirements', 'soft_requirements', 'keyword_lexicon']) {
        if (!Array.isArray(t?.[k]) || !t[k].every((v: unknown) => typeof v === 'string' && v.trim())) throw new Error(`requirements_taxonomy.${k} must contain only nonempty strings.`);
      }
      if (!t.hard_requirements.length) throw new Error('No authoritative hard requirements were returned. A will not infer them from source text.');
      if (e.Z_state.target_id !== pair.uid || s.run_binding.target_id !== pair.uid) throw new Error('UID correspondence mismatch.');
      if (e.Z_state.run_id !== pair.runId || s.run_binding.run_id !== pair.runId) throw new Error('Run identity mismatch.');
      const source = await sha256(s.raw_posting);
      if (source !== s.original_content_sha256 || source !== e.A_scout.original_content_sha256) throw new Error('Three-way source provenance mismatch.');
      if (!/^[a-f0-9]{64}$/.test(e.A_scout.original_content_sha256)) throw new Error('Source hash is not lowercase SHA-256.');
      if (await sha256(pair.envelope) !== pair.envelopeHash || await sha256(pair.sidecar) !== pair.sidecarHash) throw new Error('Committed artifact version integrity mismatch.');
    } catch (error) { fail(pair.uid, error instanceof Error ? error.message : String(error)); }
  }
  return failures;
}

// GV-05: topology classification/allocation and source extraction are separate
// from certification. This validator checks captured state without rewriting it.
export async function validateTransaction(tx: Committed): Promise<Refusal[]> {
  const failures: Refusal[] = [...validateGates(), ...validateJunctions()].map(f => ({ stage:'A5', resource:f.resource, reason:`${f.rule}: ${f.reason}` }));
  const fail = (resource:string,reason:string) => failures.push({stage:'A5',resource,reason});
  failures.push(...(await Promise.all(tx.pairs.map(validatePair))).flat());
  const selected=tx.corpus.filter(j=>j.decision==='PUSH');
  const keys=new Set(tx.corpus.map(j=>j.key));
  const uids=new Set(selected.map(j=>j.uid));
  if(!selected.length || selected.length!==tx.pairs.length || uids.size!==selected.length || keys.size!==tx.corpus.length || tx.pairs.some(p=>selected.filter(j=>j.uid===p.uid).length!==1))fail(tx.id,'UID and selection reconciliation failed.');
  const payloadRefs=new Set(tx.payloads.map(p=>p.ref));
  if(payloadRefs.size!==tx.payloads.length)fail(tx.id,'Source payload references are ambiguous.');
  for(const job of tx.corpus){
    if(await sha256(job.raw)!==job.sourceHash)fail(job.key,'Captured corpus source hash mismatch.');
    if(!job.sourceRefs.some(ref=>payloadRefs.has(ref)))fail(job.key,'No current-session payload resolves the source references.');
    if(job.scopeInvocation && !tx.scopes.some(s=>s.invocation===job.scopeInvocation))fail(job.key,'Search-scope association does not resolve.');
  }
  for(const pair of tx.pairs){
    try {
      const e=JSON.parse(pair.envelope),s=JSON.parse(pair.sidecar);
      const job=selected.find(j=>j.uid===pair.uid);
      if(!job)throw new Error('Active envelope UID has no committed PUSH source.');
      if(s.raw_posting!==job.raw || s.original_content_sha256!==job.sourceHash)throw new Error('Sidecar target is not the selected UID source.');
      const staging=s.A_staging;
      if(!Array.isArray(staging?.records) || staging.records.length!==tx.corpus.length || !Array.isArray(staging.payloads) || staging.payloads.length!==tx.payloads.length)throw new Error('Sidecar corpus/source accounting is incomplete.');
      const active=staging.records.filter((r:any)=>r.active===true);
      if(active.length!==1 || active[0].key!==job.key || active[0].uid!==pair.uid || active[0].decision!=='PUSH' || active[0].excluded!==false)throw new Error('Sidecar active UID/exclusion marking mismatch.');
      const recordKeys=new Set<string>();
      for(const r of staging.records){
        if(recordKeys.has(r.key))throw new Error('Duplicate sidecar corpus key.');recordKeys.add(r.key);
        const source=tx.corpus.find(j=>j.key===r.key);
        if(!source || r.uid!==source.uid || r.decision!==source.decision || r.excluded!==(source.decision==='REJECT') || r.active!==(source.key===job.key))throw new Error('Sidecar decision/exclusion integrity mismatch.');
        if(r.raw_posting!==source.raw || r.source_sha256!==source.sourceHash || await sha256(r.raw_posting)!==r.source_sha256)throw new Error('Sidecar corpus source integrity mismatch.');
        if(canonicalStringify(r.source_references)!==canonicalStringify(source.sourceRefs) || r.batch_id!==source.batchId || r.runner_id!==source.runnerId || r.search_scope_invocation!==(source.scopeInvocation ?? source.archivedScope?.invocation ?? null))throw new Error('Sidecar source/batch/search identity mismatch.');
      }
      const seenPayloads=new Set<string>();
      for(const p of staging.payloads){
        if(seenPayloads.has(p.ref))throw new Error('Duplicate sidecar payload reference.');seenPayloads.add(p.ref);
        const original=tx.payloads.find(o=>o.ref===p.ref);
        if(!original || p.raw!==original.raw || await sha256(p.raw)!==p.content_sha256)throw new Error('Sidecar returned payload integrity mismatch.');
      }
      const h=e.history?.[0];
      if(h?.stage!=='A4' || h.target_id!==pair.uid || h.batch_id!==job.batchId || h.runner_id!==job.runnerId || canonicalStringify(h.source_references)!==canonicalStringify(job.sourceRefs))throw new Error('Envelope provenance/batch identity mismatch.');
      const scope=job.scopeInvocation ? tx.scopes.find(s=>s.invocation===job.scopeInvocation) : job.archivedScope;
      if(canonicalStringify(h.search_scope)!==canonicalStringify(scope?.cartridge??null))throw new Error('Envelope search-scope identity mismatch.');
      if(scope){const v=await validateCartridge(structuredClone(scope.cartridge));if(!v.passed || v.certified_cartridge?.certification.content_hash!==scope.cartridge.certification.content_hash)throw new Error('Captured search scope is not compiler-certified.');}
      const audit=tx.corpus.map(j=>({target_id:j.uid,decision:j.decision,source_sha256:j.sourceHash}));
      if(canonicalStringify(e.audit_trail)!==canonicalStringify(audit))throw new Error('Envelope exclusion/decision audit mismatch.');
      if(tx.corpus.some(j=>j.decision==='REJECT' && (j.uid===pair.uid || j.sourceHash===job.sourceHash)))throw new Error('Rejected evidence is active.');
    }catch(error){fail(pair.uid,error instanceof Error?error.message:String(error));}
  }
  return failures;
}
