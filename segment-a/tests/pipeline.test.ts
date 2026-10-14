import { afterEach, describe, expect, it, vi } from 'vitest';
import { SegmentA } from '../src/core/pipeline';
import { validatePair } from '../src/core/certification';
import { compileDisk, validateCartridge, sha256 } from '../src/vendor/scout/compiler';
import { definition, returned } from './fixtures';
import type { Receiver } from '../src/core/model';
import { buildObservationArtifact } from '../src/vendor/scout/observation-artifacts';
import { acceptThreeFiles } from 'frozen-b:src/runtime/ingress.ts';
import { executeIngress } from 'frozen-b:src/b/engine.ts';

const identity = { runId: 'operator-run', candidateId: 'candidate-test', pipelineVersion: '1.0.0' };
async function committed(p = new SegmentA(), count = 1) {
  for (let i = 0; i < count; i++) await p.importPayload(JSON.stringify(await returned(`OBS-${i}`, `Python systems experience is required ${i}.`)),`return-${i}.txt`);
  p.view().jobs.forEach(j => p.decide(j.key,'PUSH'));
  const warning = p.prepareCommit();
  const tx = await p.commit(warning.token,true,identity);
  return { p, tx };
}
afterEach(()=>vi.useRealTimers());

describe('A1 / A2 reuse and independent dispatch',()=>{
  it('uses unchanged compileDisk/validateCartridge and creates independent outputs',async()=>{
    vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-12T12:00:00Z'));
    const p=new SegmentA();const d=definition();const direct=await validateCartridge(compileDisk(structuredClone(d)));
    const a=await p.compile(d);expect(a.cartridge).toEqual(direct.certified_cartridge);expect(a.validation.checks).toHaveLength(25);
    const b=await p.compile(definition('DSK-000002'));expect(b.invocation).not.toBe(a.invocation);
    b.cartridge.definition.label='changed';expect(p.view().scopes[0].cartridge.definition.label).toBe('Systems scope');
    d.label='mutated input';expect(JSON.parse(p.dispatch(a.invocation)).definition.label).toBe('Systems scope');
  });
  it('preserves batch identity and return instructions only through the existing dispatch adapter',async()=>{
    const p=new SegmentA();const run=await p.compile(definition());
    const first=JSON.parse(p.dispatch(run.invocation,{batchId:'batch-a',runnerId:'runner-a'}));
    const next=JSON.parse(p.dispatch(run.invocation,{batchId:'batch-b',runnerId:'runner-b'}));
    expect(first.batch_id).toBe('batch-a');expect(next.runner_ingress_packages[0].runner_id).toBe('runner-b');
    expect(first.runner_ingress_packages[0].ingress_constraints.output_contract_fields).toHaveLength(13);
    expect(p.dispatch(run.invocation)).not.toContain('runner-a');
  });
  it('refuses invalid compiler definitions without creating an output',async()=>{
    const p=new SegmentA();await expect(p.compile({...definition(),id:'bad'})).rejects.toThrow('Disk ID');expect(p.view().scopes).toEqual([]);
  });
});

describe('A3 evidence, decisions and pinned text',()=>{
  it('imports multiple variable-length jobs preserving exact CRLF and original payloads',async()=>{
    const p=new SegmentA();const raw='UID: short\r\nDescription:\r\na\r\nUID: long\r\nDescription:\r\n'+('long source '.repeat(5000));
    await p.importPayload(raw,'runner.md');await p.importPayload('Unstructured source','another.txt');
    const v=p.view();expect(v.jobs).toHaveLength(3);expect(v.jobs[0].raw).toBe('a\r\n');expect(v.jobs[1].raw.length).toBeGreaterThan(50000);expect(v.jobs[2].uid).toBeNull();expect(v.payloads[0].raw).toBe(raw);
    expect(v.jobs[0].sourceHash).toBe(await sha256('a\r\n'));expect(v.jobs[0].display).toBe('a\n');
  });
  it('never invents a UID and preserves PUSH, PIN, PENDING states',async()=>{
    const p=new SegmentA();await p.importPayload('Original evidence','paste');const j=p.view().jobs[0];
    expect(j.uid).toBeNull();p.assignUid(j.key,'operator-id');p.decide(j.key,'PUSH');expect(p.view().jobs[0].decision).toBe('PUSH');p.decide(j.key,'PIN');p.decide(j.key,'PENDING');expect(p.view().jobs[0].decision).toBe('PENDING');
  });
  it('detects duplicates without hiding or silently changing rows',async()=>{
    const p=new SegmentA();const raw=JSON.stringify(await returned());await p.importPayload(raw,'one');await p.importPayload(raw,'two');expect(p.view().jobs).toHaveLength(2);expect(p.view().jobs[1].duplicateOf).toBe('job-1');expect(p.view().jobs.every(j=>j.decision==='PENDING')).toBe(true);
  });
  it('requires rejection confirmation and blocks restoration and reimport resurrection',async()=>{
    const p=new SegmentA();const raw=JSON.stringify(await returned());await p.importPayload(raw,'one');const before=p.view().jobs;
    expect(()=>p.decide('job-1','REJECT')).toThrow('confirmation');expect(p.view().jobs).toEqual(before);
    p.decide('job-1','REJECT',true);expect(()=>p.decide('job-1','PUSH')).toThrow('irreversible');await p.importPayload(raw,'again');expect(p.view().jobs.every(j=>j.decision==='REJECT')).toBe(true);
  });
  it('round-trips PIN exports through A3 with UID, exact content and context',async()=>{
    const p=new SegmentA();await p.importPayload(JSON.stringify(await returned()),'original');p.decide('job-1','PIN');const exported=p.exportPinned();const q=new SegmentA();await q.importPayload(exported,'saved.txt');
    const a=p.view().jobs[0],b=q.view().jobs[0];expect(b.uid).toBe(a.uid);expect(b.raw).toBe(a.raw);expect(b.batchId).toBe(a.batchId);expect(b.runnerId).toBe(a.runnerId);expect(b.taxonomy).toEqual(a.taxonomy);expect(b.decision).toBe('PIN');
  });
  it('rejects a corrupt saved source without replacing existing staging',async()=>{
    const p=new SegmentA();await p.importPayload(JSON.stringify(await returned()),'original');p.decide('job-1','PIN');const exported=p.exportPinned().replace('Python systems experience is required.','Tampered evidence.');const before=p.view().jobs;
    await expect(p.importPayload(exported,'corrupt')).rejects.toThrow('integrity');expect(p.view().jobs).toEqual(before);
  });
});

describe('A3→A4 atomic commitment',()=>{
  it('requires a current warning and affirmative confirmation; cancellation leaves staging unchanged',async()=>{
    const p=new SegmentA();await p.importPayload(JSON.stringify(await returned()),'one');p.decide('job-1','PUSH');const before=p.view().jobs;const w=p.prepareCommit();expect(w.warning).toContain('Export PIN');p.cancelCommit();await expect(p.commit(w.token,true,identity)).rejects.toThrow('warning');expect(p.view().jobs).toEqual(before);expect(p.view().transactions).toEqual([]);
  });
  it('rejects stale confirmation and duplicate selected UIDs without clearing evidence',async()=>{
    const p=new SegmentA();const raw=JSON.stringify(await returned());await p.importPayload(raw,'one');p.decide('job-1','PUSH');const w=p.prepareCommit();await p.importPayload(raw,'two');await expect(p.commit(w.token,true,identity)).rejects.toThrow('current warning');p.decide('job-2','PUSH');const w2=p.prepareCommit();await expect(p.commit(w2.token,true,identity)).rejects.toThrow('Duplicate selected');expect(p.view().jobs).toHaveLength(2);expect(p.view().transactions).toEqual([]);
  });
  it('mints one pair per UID with correct source references and preserves excluded evidence',async()=>{
    const p=new SegmentA();await p.importPayload(JSON.stringify(await returned('REJECTED','Rejected raw')),'excluded');p.decide('job-1','REJECT',true);
    await p.importPayload(JSON.stringify(await returned('PUSHED','Preserved raw')),'selected');p.decide('job-2','PUSH');const tx=await p.commit(p.prepareCommit().token,true,identity);
    expect(tx.pairs).toHaveLength(1);expect(tx.corpus).toHaveLength(2);expect(tx.payloads).toHaveLength(2);expect(p.view().jobs).toHaveLength(2);
    const pair=tx.pairs[0],e=JSON.parse(pair.envelope),s=JSON.parse(pair.sidecar);expect(s.raw_posting).toBe('Preserved raw');expect(e.Z_state.target_id).toBe('PUSHED');expect(e.audit_trail.find((r:any)=>r.target_id==='REJECTED').decision).toBe('REJECT');expect(e.history[0].source_references).toEqual(tx.corpus[1].sourceRefs);expect(await validatePair(pair)).toEqual([]);
  });
  it('does not invent taxonomy for plain text and blocks A5 rather than tuning B',async()=>{
    const p=new SegmentA();await p.importPayload('UID: plain\nDescription:\nOriginal source','plain');p.decide('job-1','PUSH');const tx=await p.commit(p.prepareCommit().token,true,identity);const checked=await p.certify(tx.id);expect(checked.state).toBe('BLOCKED');expect(checked.failures.length).toBeGreaterThan(0);expect(p.view().jobs).toHaveLength(1);
  });
});

describe('A5 exact-version acknowledgment and unchanged B compatibility',()=>{
  it('blocks an actual frozen B candidate-identity refusal without moving SDNA into A',async()=>{
    const {p,tx}=await committed();const receiver:Receiver={receive:async(id,pairs)=>{
      const pair=pairs[0];const ctx=await acceptThreeFiles([{name:'SEALED_A_ENVELOPE.json',text:pair.envelope},{name:'STAGE_A_SIDECAR.json',text:pair.sidecar},{name:'candidate.sdna.yaml',text:'candidate_id: wrong-independent-candidate\natoms: []\n'}]);await executeIngress(ctx);
      return {transactionId:id,receiver:'frozen-B-test-only',artifacts:[{uid:pair.uid,envelopeHash:await sha256(pair.envelope),sidecarHash:await sha256(pair.sidecar),accepted:ctx.stageProgression.INGRESS==='PASS',reason:ctx.errors.join('; ')}]};
    }};
    const blocked=await p.handoff(tx.id,receiver);expect(blocked.state).toBe('BLOCKED');expect(blocked.failures[0].reason).toContain('Unverified execution origin');expect(blocked.pairs).toEqual(tx.pairs);
  });
  it('does not treat connection acknowledgment as artifact acceptance',async()=>{
    const {p,tx}=await committed();const result=await p.handoff(tx.id,{receive:async(id)=>({transactionId:id,receiver:'connected-only'} as any)});
    expect(result.state).toBe('BLOCKED');expect(result.failures[0].reason).toContain('Unverified execution origin');expect(result.pairs).toEqual(tx.pairs);
  });
  it('routes an actual existing runner artifact builder output into unchanged B intake',async()=>{
    const cart=(await validateCartridge(compileDisk(definition()))).certified_cartridge!;
    const artifact=await buildObservationArtifact(cart,{title:'Engineer',employer:'Example',city:'New York',state:'NY',zip:'10001',lat:40.7,lon:-74,naics_code:'541511',soc_code:'15-1252',source_url:'https://example.com/real-builder',employment_type:'Full time',compensation:'Not supplied',description:'Python systems experience is required. Leadership preferred.',is_active:true,vendor:'Operator test'},'abcd'.repeat(16),1);
    const p=new SegmentA();await p.importPayload(JSON.stringify({runner_id:'independent',observations:[artifact]}),'builder-return.txt');p.decide('job-1','PUSH');const tx=await p.commit(p.prepareCommit().token,true,identity);
    const ctx=await acceptThreeFiles([{name:'SEALED_A_ENVELOPE.json',text:tx.pairs[0].envelope},{name:'STAGE_A_SIDECAR.json',text:tx.pairs[0].sidecar},{name:'candidate.sdna.yaml',text:'candidate_id: candidate-test\natoms: []\n'}]);await executeIngress(ctx);
    expect(ctx.stageProgression.INGRESS).toBe('PASS');expect(JSON.parse(tx.pairs[0].sidecar).raw_posting).toBe(artifact.envelope.payload.scout.section_8_source.source_text);
  });
  it('feeds actual A4 artifacts to the frozen B validator; SDNA is supplied only to the test receiver',async()=>{
    const {p,tx}=await committed();
    const receiver: Receiver={receive:async(transactionId,pairs)=>{
      const artifacts=[];
      for(const pair of pairs){
        const ctx=await acceptThreeFiles([{name:'SEALED_A_ENVELOPE.json',text:pair.envelope},{name:'STAGE_A_SIDECAR.json',text:pair.sidecar},{name:'candidate.sdna.yaml',text:'candidate_id: candidate-test\natoms:\n  - atom_id: test-only\n    content: Python systems experience\n    domain: WORK_HISTORY\n'}]);
        await executeIngress(ctx);artifacts.push({uid:pair.uid,envelopeHash:await sha256(pair.envelope),sidecarHash:await sha256(pair.sidecar),accepted:ctx.stageProgression.INGRESS==='PASS'});
      }
      return {transactionId,receiver:'frozen-B-test-only',artifacts};
    }};
    expect((await p.handoff(tx.id,receiver)).state).toBe('BLOCKED');expect(p.view().transactions[0].pairs).toEqual(tx.pairs);expect(p.view().jobs).toHaveLength(1);
  });
  it('local validation and missing live receiver never imply handoff success',async()=>{
    const {p,tx}=await committed();expect((await p.certify(tx.id)).state).toBe('LOCALLY_VERIFIED');const blocked=await p.handoff(tx.id);expect(blocked.state).toBe('BLOCKED');expect(blocked.failures[0].reason).toContain('zero accepted');expect(blocked.pairs).toEqual(tx.pairs);
  });
  it.each(['wrong hash','partial','rejected','wrong transaction','duplicate','transport error'])('blocks %s acknowledgment and preserves all committed versions',async kind=>{
    const {p,tx}=await committed(new SegmentA(),2);
    const receiver:Receiver={receive:async(id,pairs)=>{
      if(kind==='transport error')throw new Error('Transport unavailable');
      const artifacts=pairs.map(pair=>({uid:pair.uid,envelopeHash:pair.envelopeHash,sidecarHash:pair.sidecarHash,accepted:true}));
      if(kind==='wrong hash')artifacts[0].sidecarHash='wrong';if(kind==='partial')artifacts.pop();if(kind==='rejected')artifacts[0].accepted=false;if(kind==='duplicate')artifacts[1]=artifacts[0];
      return {transactionId:kind==='wrong transaction'?'other':id,receiver:'test-only',artifacts};
    }};
    const result=await p.handoff(tx.id,receiver);expect(result.state).toBe('BLOCKED');expect(result.pairs).toEqual(tx.pairs);expect(p.view().jobs).toHaveLength(2);expect(result.failures).not.toEqual([]);
  });
  it('blocks missing acknowledgment rather than clearing staging',async()=>{
    const {p,tx}=await committed();vi.useFakeTimers();let enter!:()=>void;const entered=new Promise<void>(resolve=>{enter=resolve;});const pending=p.handoff(tx.id,{receive:()=>{enter();return new Promise(()=>{});}});await entered;await vi.advanceTimersByTimeAsync(1001);const result=await pending;expect(result.state).toBe('BLOCKED');expect(result.failures[0].reason).toContain('timed out');expect(result.pairs).toEqual(tx.pairs);
  });
  it('refuses source and artifact-version mismatches',async()=>{
    const {tx}=await committed();const pair=structuredClone(tx.pairs[0]);const s=JSON.parse(pair.sidecar);s.raw_posting+='tampered';pair.sidecar=JSON.stringify(s);const errors=await validatePair(pair);expect(errors.length).toBeGreaterThan(0);
    const changed=structuredClone(tx.pairs[0]);changed.envelopeHash='0'.repeat(64);expect((await validatePair(changed))[0].reason).toContain('version integrity');
  });
});
