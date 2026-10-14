// Controlled-process capability registry. Not a network authentication protocol.
import type { Receiver, HandoffReceipt, Pair } from './model';
export interface ExecutionEvidence {
  attempt: string; transactionId: string; environment: string; timestamp: string;
  validator: string; sourceHash: string; dependencyHash: string; buildHash: string;
  sdnaHash: string; results: unknown[];
}
const pending = new WeakMap<Receiver,string>();
const issued = new WeakMap<HandoffReceipt,{receiver:Receiver; snapshot:string; evidence:ExecutionEvidence; used:boolean}>();
export function beginLocalAttempt(receiver:Receiver):string {
  const attempt=crypto.randomUUID(); pending.set(receiver,attempt); return attempt;
}
// Only the trusted local harness calls issuance; code inside this process is trusted.
export function currentLocalAttempt(receiver:Receiver):string {
  const attempt=pending.get(receiver); if(!attempt)throw new Error('No active A5 invocation.'); return attempt;
}
export function issueLocalEvidence(receiver:Receiver,receipt:HandoffReceipt,evidence:ExecutionEvidence):void {
  issued.set(receipt,{receiver,snapshot:JSON.stringify(receipt),evidence:structuredClone(evidence),used:false});
}
export function verifyLocalEvidence(receiver:Receiver,receipt:HandoffReceipt,attempt:string,transactionId:string,pairs:readonly Pair[]):ExecutionEvidence {
  const record=issued.get(receipt);
  if(!record || record.receiver!==receiver)throw new Error('Unverified execution origin; controlled local harness evidence required.');
  if(record.used)throw new Error('Replayed execution evidence.');
  record.used=true;
  const e=record.evidence;
  if(pending.get(receiver)!==attempt || e.attempt!==attempt || e.transactionId!==transactionId)throw new Error('Wrong invocation/transaction execution evidence.');
  if(JSON.stringify(receipt)!==record.snapshot)throw new Error('Execution receipt integrity mismatch.');
  const age=Date.now()-Date.parse(e.timestamp);
  if(!Number.isFinite(age) || age<0 || age>1000)throw new Error('Stale execution evidence.');
  if(e.validator!=='d1b8348ded0190cccc7017526b8a16c84005db2a' || ![e.sourceHash,e.dependencyHash,e.buildHash,e.sdnaHash].every(h=>/^[a-f0-9]{64}$/.test(h)))throw new Error('Invalid validator/build identity evidence.');
  if(receipt.transactionId!==transactionId || receipt.artifacts.length!==pairs.length)throw new Error('Incomplete or wrong-transaction execution acknowledgment.');
  for(const p of pairs){const a=receipt.artifacts.filter(a=>a.uid===p.uid);if(a.length!==1 || a[0].envelopeHash!==p.envelopeHash || a[0].sidecarHash!==p.sidecarHash)throw new Error('Exact artifact execution binding mismatch.');}
  return structuredClone(e);
}
