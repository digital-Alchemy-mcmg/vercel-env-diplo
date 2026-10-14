import { SegmentBSession } from 'pinned-b:src/runtime/session.ts';
import { handleCommand } from 'pinned-b:src/runtime/commands.ts';
import { identity } from 'b-build:identity';
const sessions=new Map<string,InstanceType<typeof SegmentBSession>>();
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
let queue=Promise.resolve();
self.onmessage=event=>{queue=queue.then(async()=>{
 const m=event.data;
 try{
 if(m.type==='INGRESS'){
  const results=[],artifacts=[];sessions.clear();
  for(const p of m.pairs){const session=new SegmentBSession();const response=await handleCommand(session,{action:'INGRESS',files:[{name:'SEALED_A_ENVELOPE.json',text:p.envelope},{name:'STAGE_A_SIDECAR.json',text:p.sidecar},{name:'candidate.sdna.yaml',text:m.sdna}]});sessions.set(p.uid,session);results.push({uid:p.uid,view:response.view});artifacts.push({uid:p.uid,envelopeHash:await hash(p.envelope),sidecarHash:await hash(p.sidecar),accepted:response.view.progression.INGRESS==='PASS'&&response.view.ready==='B1'&&!response.view.failed,reason:JSON.stringify(response.view.refusals)});}
  self.postMessage({id:m.id,attempt:m.attempt,transactionId:m.transactionId,identity,sdnaHash:await hash(m.sdna),results,artifacts,timestamp:new Date().toISOString()});
 }else{const session=sessions.get(m.uid);if(!session)throw new Error('No acknowledged B session for UID.');self.postMessage({id:m.id,uid:m.uid,response:await handleCommand(session,m.command)});}
 }catch(e){self.postMessage({id:m.id,error:String(e)});}
 });};
