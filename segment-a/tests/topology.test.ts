import { describe, expect, it } from 'vitest';
import { ENDPOINTS, GATES, JUNCTIONS, allocateGates, validateGates, validateJunctions } from '../src/core/topology';
import { SegmentA } from '../src/core/pipeline';
import { validateTransaction } from '../src/core/certification';
import { sha256 } from '../src/vendor/scout/compiler';
import { definition, returned } from './fixtures';

describe('GV-01–GV-07 local topology',()=>{
  it('allocates a single shared ingress/egress counter starting G1 per component',()=>{
    expect(validateGates()).toEqual([]);expect(validateJunctions()).toEqual([]);
    expect(GATES.filter(g=>g.component==='A2').map(g=>g.address)).toEqual(['A2<G1:','A2>G2:','A2>G3:','A2>G4:']);
    expect(GATES.filter(g=>g.component==='A5').map(g=>g.address)).toEqual(['A5<G1:','A5<G2:','A5>G3:','A5>G4:','A5_G5:']);
    expect(GATES).toHaveLength(20);expect(new Set(GATES.map(g=>g.address)).size).toBe(20);
  });
  it('requires classification before allocation and preserves reserved endpoints',()=>{
    const draft=structuredClone(ENDPOINTS);draft[0].direction='unknown' as any;
    expect(()=>allocateGates(draft)).toThrow('Classify');
    expect(GATES.filter(g=>g.mode==='RESERVED_DISABLED').map(g=>g.address)).toEqual(['A2>G3:','A2>G4:']);
    expect(GATES.find(g=>g.endpoint==='handoff-control')?.mode).toBe('TEST_ONLY');
  });
  it.each(['duplicate number','wrong direction','missing reserved','wrong component','activated reserve','no evidence'])('refuses %s gate registers',kind=>{
    const g=structuredClone([...GATES]);
    if(kind==='duplicate number'){g[1].number=1;g[1].address='A1>G1:';}
    if(kind==='wrong direction'){g[0].direction='egress';g[0].address='A1>G1:';}
    if(kind==='missing reserved')g.splice(4,1);
    if(kind==='wrong component')g[0].component='B1' as any;
    if(kind==='activated reserve')g[4].mode='LOCAL';
    if(kind==='no evidence')g[0].evidence='';
    expect(validateGates(g).length).toBeGreaterThan(0);
  });
  it('separates PIN export source accounting, independent SDNA and external delivery',()=>{
    expect(JUNCTIONS).toHaveLength(17);
    expect(JUNCTIONS.find(j=>j.id==='J17')).toMatchObject({from:'A3>G5:',to:'Operator manual saving → J08'});
    expect(JUNCTIONS.find(j=>j.id==='J06')?.status).toBe('EXTERNAL_UNVERIFIED');
    expect(JUNCTIONS.find(j=>j.id==='J15')?.from).toBe('Operator-supplied SDNA (outside A)');
    expect(GATES.some(g=>(g.component as string).startsWith('B'))).toBe(false);
    expect(JUNCTIONS.find(j=>j.id==='J16')?.to).toBe('A5_G5:');
  });
  it.each(['reversed','missing','promoted','duplicate'])('refuses %s junction certification',kind=>{
    const j=structuredClone([...JUNCTIONS]);
    if(kind==='reversed'){const t=j[1].from;j[1].from=j[1].to;j[1].to=t;}
    if(kind==='missing')j.pop();
    if(kind==='promoted')j.find(x=>x.id==='J06')!.status='LOCAL';
    if(kind==='duplicate')j.push(j[0]);
    expect(validateJunctions(j).length).toBeGreaterThan(0);
  });
});

async function capture(){
  const p=new SegmentA();const scope=await p.compile(definition());
  await p.importPayload(JSON.stringify(await returned('ACTIVE')),'active.txt',scope.invocation);p.decide('job-1','PUSH');
  await p.importPayload(JSON.stringify(await returned('EXCLUDED','Excluded original source')),'excluded.txt',scope.invocation);p.decide('job-2','REJECT',true);
  await p.importPayload(JSON.stringify(await returned('LATER','Pinned source')),'later.txt',scope.invocation);p.decide('job-3','PIN');
  await p.importPayload(JSON.stringify(await returned('PENDING','Pending source')),'pending.txt',scope.invocation);
  const tx=await p.commit(p.prepareCommit().token,true,{runId:'run',candidateId:'candidate',pipelineVersion:'1.0.0'});
  return {p,tx};
}

describe('Plan 02 A5 source/UID/exclusion/batch certification',()=>{
  it('preserves certified search-scope context across PIN export/reset/reimport',async()=>{
    const p=new SegmentA();const scope=await p.compile(definition());await p.importPayload(JSON.stringify(await returned()),'one',scope.invocation);p.decide('job-1','PIN');
    const exported=p.exportPinned();const q=new SegmentA();await q.importPayload(exported,'saved.txt');q.decide('job-1','PUSH');
    const tx=await q.commit(q.prepareCommit().token,true,{runId:'run',candidateId:'candidate',pipelineVersion:'1.0.0'});
    expect(JSON.parse(tx.pairs[0].envelope).history[0].search_scope).toEqual(scope.cartridge);expect(await validateTransaction(tx)).toEqual([]);
  });
  it('preserves source corpus in sidecar and activates exactly the selected UID',async()=>{
    const {p,tx}=await capture();expect(await validateTransaction(tx)).toEqual([]);
    const sidecar=JSON.parse(tx.pairs[0].sidecar);expect(sidecar.A_staging.records).toHaveLength(4);
    expect(sidecar.A_staging.records.filter((r:any)=>r.active)).toHaveLength(1);
    expect(sidecar.A_staging.records.find((r:any)=>r.uid==='EXCLUDED')).toMatchObject({decision:'REJECT',excluded:true,active:false,raw_posting:'Excluded original source'});
    expect(sidecar.A_staging.records.find((r:any)=>r.uid==='LATER')).toMatchObject({decision:'PIN',active:false});
    expect(sidecar.A_staging.records.find((r:any)=>r.uid==='PENDING')).toMatchObject({decision:'PENDING',active:false});
    expect(sidecar.A_staging.payloads[0].raw).toBe(tx.payloads[0].raw);
    const before=structuredClone(tx.pairs);expect((await p.certify(tx.id)).state).toBe('LOCALLY_VERIFIED');expect(p.view().transactions[0].pairs).toEqual(before);
  });
  it.each(['exclusion','active UID','batch','source reference','payload','corpus hash','scope','audit','duplicate source'])('blocks %s mismatch even when the transmitted version hash is recomputed',async kind=>{
    const {tx}=await capture();const pair=tx.pairs[0];const s=JSON.parse(pair.sidecar),e=JSON.parse(pair.envelope);
    if(kind==='exclusion')s.A_staging.records[1].excluded=false;
    if(kind==='active UID')s.A_staging.records[1].active=true;
    if(kind==='batch')e.history[0].batch_id='other';
    if(kind==='source reference')s.A_staging.records[0].source_references=['missing'];
    if(kind==='payload')s.A_staging.payloads[0].raw+='tampered';
    if(kind==='corpus hash')tx.corpus[0].sourceHash='0'.repeat(64);
    if(kind==='scope')e.history[0].search_scope.definition.id='DSK-999999';
    if(kind==='audit')e.audit_trail[1].decision='PUSH';
    if(kind==='duplicate source')s.A_staging.payloads[1].ref=s.A_staging.payloads[0].ref;
    pair.sidecar=JSON.stringify(s);pair.sidecarHash=await sha256(pair.sidecar);
    pair.envelope=JSON.stringify(e);pair.envelopeHash=await sha256(pair.envelope);
    expect((await validateTransaction(tx)).length).toBeGreaterThan(0);
  });
});
