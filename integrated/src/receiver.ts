import { identity } from 'b-build:identity';
import { currentLocalAttempt,issueLocalEvidence } from '../../segment-a/src/core/local-evidence';
import type { Receiver,HandoffReceipt,Pair } from '../../segment-a/src/core/model';
export class BrowserBridge implements Receiver {
 readonly worker:Worker;
 #requests=new Map<string,{resolve:(v:any)=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
 views:{uid:string;view:any}[]=[];
 constructor(){this.worker=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'});this.worker.onmessage=e=>{const p=this.#requests.get(e.data.id);if(!p)return;clearTimeout(p.timer);this.#requests.delete(e.data.id);e.data.error?p.reject(new Error(e.data.error)):p.resolve(e.data);};this.worker.onerror=()=>this.close();}
 sdna='';
 request(data:Record<string,unknown>):Promise<any>{return new Promise((resolve,reject)=>{const id=crypto.randomUUID();const timer=setTimeout(()=>{this.#requests.delete(id);reject(new Error('Browser B execution timed out.'));},1000);this.#requests.set(id,{resolve,reject,timer});this.worker.postMessage({...data,id});});}
 async receive(transactionId:string,pairs:readonly Pair[]):Promise<HandoffReceipt>{
  if(!this.sdna.trim())throw new Error('Independent candidate.sdna.yaml is required.');
  const attempt=currentLocalAttempt(this);const result=await this.request({type:'INGRESS',attempt,transactionId,pairs,sdna:this.sdna});
  if(result.attempt!==attempt||result.transactionId!==transactionId||JSON.stringify(result.identity)!==JSON.stringify(identity))throw new Error('Unverified worker invocation/build identity.');
  const receipt={transactionId,receiver:'BROWSER_LOCAL_PINNED_B_WORKER',artifacts:result.artifacts};
  issueLocalEvidence(this,receipt,{...identity,attempt,transactionId,environment:`browser-local:${location.origin}`,timestamp:result.timestamp,sdnaHash:result.sdnaHash,results:result.results});
  this.views=result.results;return receipt;
 }
 async command(uid:string,command:Record<string,unknown>){const r=await this.request({type:'COMMAND',uid,command});const entry=this.views.find(v=>v.uid===uid);if(entry)entry.view=r.response.view;return r.response;}
 close(){this.worker.terminate();for(const p of this.#requests.values()){clearTimeout(p.timer);p.reject(new Error('Browser B execution unavailable.'));}this.#requests.clear();}
}
