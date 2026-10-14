import { it,expect } from 'vitest';
import { SegmentA } from '../../segment-a/src/core/pipeline';
import { definition,returned } from '../../segment-a/tests/fixtures';
import { SegmentBSession } from 'pinned-b:src/runtime/session.ts';
import { handleCommand } from 'pinned-b:src/runtime/commands.ts';
import { currentLocalAttempt,issueLocalEvidence } from '../../segment-a/src/core/local-evidence';
import { identity } from 'b-build:identity';
import { sha256 } from '../../segment-a/src/vendor/scout/compiler';
import type { Receiver } from '../../segment-a/src/core/model';
const sdna='candidate_id: candidate-test\natoms:\n  - atom_id: fixture-only\n    content: Python systems experience is required\n    domain: WORK_HISTORY\n';
it('connects actual A1 dispatch/return/decisions/minting/A5 to B1–B5 with explicit seals',async()=>{
 const a=new SegmentA();const scope=await a.compile(definition());a.dispatch(scope.invocation);await a.importPayload(JSON.stringify(await returned()),'fixture-return');
 const session=new SegmentBSession();a.decide('job-1','PUSH');const tx=await a.commit(a.prepareCommit().token,true,{runId:'run',candidateId:'candidate-test',pipelineVersion:'1'});
 const receiver:Receiver={receive:async(id,pairs)=>{const p=pairs[0];const view=await session.ingress([{name:'SEALED_A_ENVELOPE.json',text:p.envelope},{name:'STAGE_A_SIDECAR.json',text:p.sidecar},{name:'candidate.sdna.yaml',text:sdna}]);const receipt={transactionId:id,receiver:'controlled-integration-test',artifacts:[{uid:p.uid,envelopeHash:await sha256(p.envelope),sidecarHash:await sha256(p.sidecar),accepted:view.progression.INGRESS==='PASS'}]};issueLocalEvidence(receiver,receipt,{...identity,attempt:currentLocalAttempt(receiver),transactionId:id,environment:'test-local',timestamp:new Date().toISOString(),sdnaHash:await sha256(sdna),results:[view]});return receipt;}};
 expect((await a.handoff(tx.id,receiver)).state).toBe('ACCEPTED');expect(a.view().transactions[0].pairs).toEqual(tx.pairs);
 for(const stage of ['B1','B2','B3','B4','B5']){expect(session.view().ready).toBe(stage);const r=await handleCommand(session,{action:'RUN',stage});expect(r.view.stop).toBe(stage);const forbidden=await handleCommand(session,{action:'RUN',stage});expect(forbidden.view.refusals.at(-1)?.code).toBe('HARD_STOP');expect(session.view().stop).toBe(stage);session.seal(stage);}
 expect((await session.finish()).complete).toBe(true);const envelope=JSON.parse(session.envelope()!);expect(envelope.Z_state.current_stage).toBe('B5_COMPLETE');expect(envelope.B_sdna).toBeTruthy();
});
it.each(['missing','yaml','candidate','run','uid','hash','envelope','sidecar'])('B refuses %s authority without correction',async kind=>{const a=new SegmentA();await a.importPayload(JSON.stringify(await returned()),'fixture');a.decide('job-1','PUSH');const tx=await a.commit(a.prepareCommit().token,true,{runId:'r',candidateId:'candidate-test',pipelineVersion:'1'});const p=tx.pairs[0];let e=p.envelope,s=p.sidecar,y=sdna;if(kind==='yaml')y='candidate: [broken';if(kind==='candidate')y=sdna.replace('candidate-test','wrong');if(['run','uid','hash'].includes(kind)){const raw=JSON.parse(s);if(kind==='run')raw.run_binding.run_id='wrong';if(kind==='uid')raw.run_binding.target_id='wrong';if(kind==='hash')raw.raw_posting+='changed';s=JSON.stringify(raw);}if(kind==='envelope')e='{}';if(kind==='sidecar')s='{}';const session=new SegmentBSession();const files=[{name:'SEALED_A_ENVELOPE.json',text:e},{name:'STAGE_A_SIDECAR.json',text:s},{name:'candidate.sdna.yaml',text:y}];if(kind==='missing')files.pop();const view=await session.ingress(files);expect(view.failed).toBe(true);expect(view.refusals.length).toBeGreaterThan(0);expect(view.ready).toBe(null);});
it('preserves B3 proposal vocabulary, B4 clearance/refusal and five-prism planning',async()=>{
 const {acceptThreeFiles}=await import('pinned-b:src/runtime/ingress.ts');const engine=await import('pinned-b:src/b/engine.ts');
 const a=new SegmentA();await a.importPayload(JSON.stringify(await returned()),'fixture');a.decide('job-1','PUSH');const tx=await a.commit(a.prepareCommit().token,true,{runId:'run',candidateId:'candidate-test',pipelineVersion:'1'});const p=tx.pairs[0];
 const ctx=await acceptThreeFiles([{name:'SEALED_A_ENVELOPE.json',text:p.envelope},{name:'STAGE_A_SIDECAR.json',text:p.sidecar},{name:'candidate.sdna.yaml',text:sdna}]);await engine.executeIngress(ctx);await engine.executeB1(ctx);engine.sealB1(ctx);await engine.executeB2(ctx);engine.freezeB2(ctx);engine.executeB3(ctx);
 expect(ctx.b3Result.bindings.some((b:any)=>b.status==='BOUND')).toBe(true);expect(ctx.b3Result.bindings.every((b:any)=>b.binding_basis.every((basis:string)=>basis.startsWith('EXACT_PHRASE')||basis.startsWith('TOKEN_COVERAGE')))).toBe(true);
 engine.sealB3(ctx);await engine.executeB4(ctx);expect(ctx.b4Result.ledger.some((r:any)=>r.disposition==='PASS')).toBe(true);expect(ctx.b4Result.ledger.some((r:any)=>r.disposition==='UNRESOLVED')).toBe(true);engine.sealB4(ctx);engine.executeB5(ctx);expect(ctx.b5Result.ranked_prisms).toHaveLength(5);
 // Negative harness mutation of a proposal, never source or minted artifacts.
 ctx.stageProgression.B4='READY';ctx.b3Result.bindings[0].bound_atom_id='nonexistent';await engine.executeB4(ctx);expect(ctx.b4Result.ledger.some((r:any)=>r.disposition==='REJECTED_INTEGRITY')).toBe(true);
});
