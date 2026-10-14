// Harness-only module: never imported by the browser app. B is loaded from Git,
// in memory, by the existing pinned Vitest loader; no copied validator files.
import { SegmentBSession } from 'frozen-b:src/runtime/session.ts';
import { identity } from 'frozen-b:identity';
import { createHash } from 'node:crypto';
import type { Receiver, Pair, HandoffReceipt } from '../core/model';
import { currentLocalAttempt, issueLocalEvidence } from '../core/local-evidence';
const hash=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const PIN='d1b8348ded0190cccc7017526b8a16c84005db2a';
const approved=Object.freeze(identity());
export function createLocalReceiver(operatorSdna:string):Receiver {
  const receiver:Receiver={async receive(transactionId:string,pairs:readonly Pair[]):Promise<HandoffReceipt>{
    const attempt=currentLocalAttempt(receiver);
    const measured=identity(); // Throws if loaded module bytes or lockfile drift.
    if(measured.sourceHash!==approved.sourceHash || measured.dependencyHash!==approved.dependencyHash || measured.buildHash!==approved.buildHash)throw new Error('Wrong dependency/build/source execution identity.');
    if(measured.commit!==PIN)throw new Error('Wrong approved B validator version.');
    const results:any[]=[],artifacts:HandoffReceipt['artifacts']=[];
    for(const p of pairs){
      const session=new SegmentBSession();
      const view=await session.ingress([{name:'SEALED_A_ENVELOPE.json',text:p.envelope},{name:'STAGE_A_SIDECAR.json',text:p.sidecar},{name:'candidate.sdna.yaml',text:operatorSdna}]);
      results.push(view);
      artifacts.push({uid:p.uid,envelopeHash:hash(p.envelope),sidecarHash:hash(p.sidecar),accepted:view.progression.INGRESS==='PASS' && view.ready==='B1' && !view.failed,reason:JSON.stringify(view.refusals)});
    }
    const receipt={transactionId,receiver:'CONTROLLED_LOCAL_B_SESSION',artifacts};
    issueLocalEvidence(receiver,receipt,{attempt,transactionId,environment:`local-node:${process.version}:pid:${process.pid}`,timestamp:new Date().toISOString(),validator:measured.commit,sourceHash:measured.sourceHash,dependencyHash:measured.dependencyHash,buildHash:measured.buildHash,sdnaHash:hash(operatorSdna),results});
    return receipt;
  }};
  return receiver;
}
