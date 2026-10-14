import './style.css';
import { SegmentA } from './core/pipeline';
import { GATES, JUNCTIONS } from './core/topology';
import type { Decision } from './core/model';
import type { DiskDefinition, ExecutionProfile, DiskStatus, ObservationType } from './vendor/scout/types';

let pipeline = new SegmentA();
let working = false;
const app = document.getElementById('app')!;
const field = (id: string, label: string, type = 'text') => `<label>${label}<input id="${id}" type="${type}"></label>`;
app.innerHTML = `
<header><strong>MARA / SEGMENT A</strong><span>STRUCTURAL CONSTRUCTION · REVISION 2</span></header>
<main><section class="intro"><p class="eyebrow">SEARCH → STAGE → COMMIT → CERTIFY</p><h1>Prepare the search.<br>Preserve the evidence.</h1><p>Five operator-controlled stages. External runners remain independent.<br>B and C are unchanged. Candidate SDNA belongs at B1, outside Segment A.</p></section>
<nav aria-label="Stages"><a href="#a1">A1 Compiler</a><a href="#a2">A2 Dispatch</a><a href="#a3">A3 Staging</a><a href="#a4">A4 Minting</a><a href="#a5">A5 Certification</a></nav>
<section id="a1" class="panel"><p class="eyebrow">A1 / SEARCH-SCOPE COMPILER</p><h2>One invocation. One search scope.</h2><p>The existing compiler and its 25-point validator run unchanged. No runner connection is required.</p>
<form id="compiler-form"><div class="grid">
${field('disk-id','Disk ID · DSK-000001')}${field('label','Search label')}${field('description','Search context')}${field('version','Definition version · e.g. 1.0.0')}
${field('zip','Territory ZIP')}${field('radius','Radius in miles','number')}${field('lat','Latitude (optional)','number')}${field('lon','Longitude (optional)','number')}
<label>Observation type<select id="observation">${['job_posting','employer','professional_profile','provider','business_location','market_listing'].map(x=>`<option>${x}</option>`).join('')}</select></label>
<label>Definition status<select id="disk-status">${['draft','active','inactive','retired'].map(x=>`<option>${x}</option>`).join('')}</select></label>
<label>Execution profile<select id="profile">${['standard','discovery','research','forensics','strict'].map(x=>`<option>${x}</option>`).join('')}</select></label>
</div><div class="grid"><label>NAICS · one code | title per line<textarea id="naics" placeholder="Code | title"></textarea></label><label>SOC · one code | title per line<textarea id="soc" placeholder="Code | title"></textarea></label><label>Role prerequisites / keyword phrases · SOC | phrase; phrase<textarea id="keywords"></textarea></label><label>Global exclusions · one phrase per line<textarea id="exclusions"></textarea></label><label>Optional specialty flags · one per line<textarea id="flags"></textarea></label></div><button type="submit" class="primary">Compile and validate search scope</button></form><p id="compile-status" role="status"></p></section>
<section id="a2" class="panel"><p class="eyebrow">A2 / OUTBOUND DISPATCH</p><h2>Manual transport, complete JSON.</h2><div class="grid"><label>Compiler invocation<select id="scope"></select></label>${field('dispatch-batch','Batch ID (optional dispatch binding)')}${field('dispatch-runner','Runner ID (optional dispatch binding)')}</div><p>Leave both binding fields blank for the certified cartridge. Providing both uses the existing batch-ingress adapter for this dispatch only.</p><button id="prepare-json">Display complete JSON</button><button id="copy-json">Copy JSON</button><button disabled>Folder destination · not configured</button><button disabled>Automated transport · not configured</button><textarea id="outbound" readonly aria-label="Complete outbound search JSON"></textarea></section>
<section id="a3" class="panel"><p class="eyebrow">A3 / INBOUND STAGING</p><h2>The operator's review workspace.</h2><p>Import multiple .txt or .md payloads, or paste plain text. Existing runner-return JSON can be supplied as text. Exact source is retained; display cleaning changes line endings only.</p><label>Optional search-scope context<select id="import-scope"></select></label><label>Incoming text / Markdown files<input id="incoming-files" type="file" accept=".txt,.md" multiple></label><label>Pasted runner text<textarea id="incoming-text"></textarea></label><button id="import" class="primary">Stage incoming payloads</button><p id="import-status" role="status"></p><p>Plain-text records may use UID: or Observation_ID: headings. Missing IDs remain unresolved until explicitly assigned. Unqualified prose does not supply a B requirements taxonomy.</p><div id="jobs"></div><button id="export-pins">Export PIN jobs as plain text</button><textarea id="pinned-output" readonly aria-label="Pinned text export"></textarea></section>
<section id="a4" class="panel"><p class="eyebrow">A4 / STATE RESOLUTION AND MINTING</p><h2>Commit exactly the PUSH selection.</h2><p>One envelope/sidecar pair per selected UID. Source bytes, decisions and exclusions remain in this session. The candidate identity below is an Operator reference, not candidate SDNA.</p><div class="grid">${field('run-id','Operator run_id')}${field('candidate-id','Operator candidate_id reference')}${field('pipeline-version','Operator pipeline_version')}</div><button id="commit" class="primary">Review warning and commit PUSH jobs</button></section>
<section id="a5" class="panel"><p class="eyebrow">A5 / CERTIFICATION AND HANDOFF</p><h2>100% verified, or zero accepted.</h2><p class="notice">Live B1 transmission is disabled: no existing exact-version acknowledgment channel has been established. Local certification and artifact download do not constitute B1 acceptance.</p><button disabled>Transmit to B1 · receiver unresolved</button><div id="transactions"></div></section>
<section id="refusal-panel" class="panel" hidden><h2>Refusal log</h2><ol id="refusals"></ol></section><footer><span>Ephemeral session · no database · no automatic draft persistence</span><button id="reset">Reset session with confirmation</button></footer><p id="message" role="status" aria-live="polite"></p>
</main><dialog id="confirmation"><h2>Operator confirmation</h2><p id="warning"></p><button id="cancel-confirm">Cancel — keep workspace</button><button id="affirm-confirm" class="primary">Confirm</button></dialog>`;
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const topologyPanel=document.createElement('section');topologyPanel.className='panel';topologyPanel.id='topology';
topologyPanel.innerHTML='<p class="eyebrow">PLAN 02 / LOCAL GATE INVENTORY</p><h2>Classify, allocate, verify.</h2><p>These are A-side logical gate addresses. Reserved gates consume addresses. External runner and B physical gate numbers are unestablished; live delivery is not inferred from local wiring.</p>';
const topologyList=document.createElement('ul');
for(const g of GATES){const item=document.createElement('li');item.textContent=`${g.address} ${g.endpoint} · ${g.mode}`;topologyList.append(item);}
const topologyDetails=document.createElement('details');const topologySummary=document.createElement('summary');topologySummary.textContent='Inspect all junctions, including unverified external routes';topologyDetails.append(topologySummary);
for(const j of JUNCTIONS){const p=document.createElement('p');p.textContent=`${j.id}: ${j.from} → ${j.to} · ${j.status}`;topologyDetails.append(p);}
topologyPanel.append(topologyList,topologyDetails);document.querySelector('main')!.append(topologyPanel);
const value = (id: string) => el<HTMLInputElement>(id).value;
const lines = (id: string) => value(id).split('\n').map(x=>x.trim()).filter(Boolean);
const escape = (x: string) => x.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!));
function download(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),0);
}
function confirm(message: string): Promise<boolean> {
  const dialog = el<HTMLDialogElement>('confirmation'); el('warning').textContent = message;
  return new Promise(resolve => {
    const finish = (yes: boolean) => { dialog.close(); dialog.oncancel = null; resolve(yes); };
    el('cancel-confirm').onclick = ()=>finish(false); el('affirm-confirm').onclick = ()=>finish(true);
    dialog.oncancel = e=>{e.preventDefault();finish(false);}; dialog.showModal();
  });
}
async function action(fn: ()=>Promise<void> | void) {
  if (working) return;
  working = true;
  try { await fn(); el('message').textContent = ''; } catch (error) { el('message').textContent = error instanceof Error ? error.message : String(error); }
  finally { working = false; render(); }
}
function render() {
  const view = pipeline.view();
  let history = document.getElementById('dispatch-history');
  if (!history) { history = document.createElement('div'); history.id = 'dispatch-history'; el('a2').append(history); }
  history.replaceChildren(...view.dispatches.map(d=>{const button=document.createElement('button');button.textContent=`Recall ${d.id} · ${d.invocation}`;button.onclick=()=>{el<HTMLTextAreaElement>('outbound').value=d.json;};return button;}));
  for (const id of ['scope','import-scope']) {
    const select = el<HTMLSelectElement>(id); const before = select.value;
    select.replaceChildren(...(id === 'import-scope' ? [new Option('No association — context unresolved','')] : []), ...view.scopes.map(s=>new Option(`${s.invocation} · ${s.cartridge.definition.label}`,s.invocation)));
    if ([...select.options].some(o=>o.value === before)) select.value = before;
  }
  el('jobs').innerHTML = view.jobs.map(j=>`<article class="job ${j.decision === 'REJECT'?'rejected':''}" data-key="${j.key}"><div class="job-heading"><strong>${escape(j.uid ?? 'UID UNRESOLVED')} · ${escape(j.title || 'Title not supplied')}</strong><span>${j.decision}</span></div><p>${escape(j.employer || 'Employer not supplied')} · ${escape(j.sourceUrl || 'Source URL not supplied')}</p><small>${escape(j.sourceRefs.join(' · '))} ${j.duplicateOf?` · DUPLICATE / UID CONFLICT: ${j.duplicateOf}`:''}</small><div class="job-controls">${!j.uid && j.decision !== 'REJECT'?`<label>Operator UID<input data-uid="${j.key}"></label><button data-assign="${j.key}">Assign UID</button>`:''}<label>Operator decision<select data-decision="${j.key}" ${j.decision==='REJECT'?'disabled':''}>${['PENDING','PUSH','PIN','REJECT'].map(s=>`<option ${j.decision===s?'selected':''}>${s}</option>`).join('')}</select></label></div><details><summary>Inspect preserved source and context</summary><p>Batch: ${escape(j.batchId ?? 'not supplied')} · Runner: ${escape(j.runnerId ?? 'not supplied')} · Search scope: ${escape(j.scopeInvocation ?? 'not associated')}</p><pre>${escape(j.raw)}</pre><small>SHA-256: ${j.sourceHash}</small><p>${j.taxonomy?'Existing qualified target facts received.':'Target taxonomy unresolved — B1 compatibility blocked.'}</p></details></article>`).join('');
  el('transactions').innerHTML = view.transactions.map(t=>`<article class="transaction"><h3>${t.id} · ${t.state}</h3><p>${t.state==='ACCEPTED'?'All exact artifact versions acknowledged by receiver.':'ZERO ACCEPTED — local preparation is not downstream acceptance.'}</p><button data-certify="${t.id}">Validate committed artifacts</button><button data-readiness="${t.id}">Check handoff readiness</button>${t.pairs.map((p,i)=>`<div class="pair"><strong>UID: ${escape(p.uid)}</strong><small>Envelope SHA-256: ${p.envelopeHash}<br>Sidecar SHA-256: ${p.sidecarHash}</small><button data-envelope="${t.id}:${i}" ${t.state==='COMMITTED'||(t.state==='BLOCKED'&&t.failures.some(f=>f.resource!=='B1 acknowledgment'))?'disabled':''}>Download SEALED_A_ENVELOPE.json</button><button data-sidecar="${t.id}:${i}" ${t.state==='COMMITTED'||(t.state==='BLOCKED'&&t.failures.some(f=>f.resource!=='B1 acknowledgment'))?'disabled':''}>Download STAGE_A_SIDECAR.json</button></div>`).join('')}<ul>${t.failures.map(f=>`<li>${escape(f.resource)}: ${escape(f.reason)}</li>`).join('')}</ul></article>`).join('');
  el('refusal-panel').hidden = !view.refusals.length;
  el('refusals').innerHTML = view.refusals.map(f=>`<li>${escape(f.stage)} / ${escape(f.resource)}: ${escape(f.reason)}</li>`).join('');
}

el<HTMLFormElement>('compiler-form').onsubmit = event=>{ event.preventDefault(); void action(async()=>{
  const entries = (id: string) => lines(id).map(line=>{const [code,...title]=line.split('|'); if(!code.trim()||!title.join('|').trim())throw new Error(`${id}: use code | title, without inventing taxonomy.`);return {code:code.trim(),title:title.join('|').trim()};});
  const coordinates = value('lat') || value('lon') ? {lat:Number(value('lat')),lon:Number(value('lon'))} : undefined;
  if (coordinates && (!value('lat')||!value('lon')||!Number.isFinite(coordinates.lat)||!Number.isFinite(coordinates.lon))) throw new Error('Both coordinates are required when supplied.');
  if (!value('radius') || !Number.isFinite(Number(value('radius'))) || Number(value('radius')) <= 0) throw new Error('A positive search radius is required.');
  const definition: DiskDefinition = {
    id:value('disk-id'), label:value('label'), description:value('description'), version:value('version'), status:value('disk-status') as DiskStatus,
    observation_type:value('observation') as ObservationType, execution_profile:value('profile') as ExecutionProfile,
    territory:{zipCode:value('zip'),radiusMiles:Number(value('radius')),...(coordinates?{coordinates}:{})}, industry:entries('naics'),roles:entries('soc'),
    keywords:{logic:'match_any_role_scope_and_exclude_global',scopes:lines('keywords').map(line=>{const [soc,...phrases]=line.split('|');return {target_soc:soc.trim(),include:phrases.join('|').split(';').map(p=>p.trim()).filter(Boolean)};}),global_exclude:lines('exclusions'),optional_specialty_flags:lines('flags')},
  };
  const result = await pipeline.compile(definition); render(); el<HTMLSelectElement>('scope').value=result.invocation;
  el('compile-status').textContent=`${result.invocation}: ${result.validation.checks.length} compiler checks passed. Earlier outputs remain independently available.`;
});};
el('prepare-json').onclick=()=>void action(()=>{const batchId=value('dispatch-batch'),runnerId=value('dispatch-runner');if(!!batchId!==!!runnerId)throw new Error('Provide both batch and runner IDs, or leave both blank.');el<HTMLTextAreaElement>('outbound').value=pipeline.dispatch(value('scope'),batchId?{batchId,runnerId}:undefined);});
el('copy-json').onclick=()=>void action(async()=>{const json=value('outbound');if(!json)throw new Error('Prepare a compiler output first.');try{await navigator.clipboard.writeText(json);el('compile-status').textContent='Complete outbound JSON copied.';}catch{el<HTMLTextAreaElement>('outbound').select();throw new Error('Clipboard unavailable: complete JSON is selected for manual copy.');}});
el('import').onclick=()=>void action(async()=>{
  const files=[...(el<HTMLInputElement>('incoming-files').files??[])];const pasted=value('incoming-text');
  if(!files.length&&!pasted.trim())throw new Error('Supply runner text before staging.');
  let imported=0;for(const file of files){if(!/\.(txt|md)$/i.test(file.name))throw new Error('Use plain-text or Markdown uploads.');await pipeline.importPayload(await file.text(),file.name,value('import-scope')||null);imported++;}
  if(pasted.trim()){await pipeline.importPayload(pasted,`Operator paste ${pipeline.view().payloads.length+1}`,value('import-scope')||null);imported++;}
  el('import-status').textContent=`${imported} payloads staged. Original payloads and source bytes preserved.`;el<HTMLInputElement>('incoming-files').value='';el<HTMLTextAreaElement>('incoming-text').value='';
});
el('jobs').onchange=e=>{const target=e.target as HTMLSelectElement;const key=target.dataset.decision;if(!key)return;void action(async()=>{const decision=target.value as Decision;if(decision==='REJECT'&&!await confirm('Reject this job? It will be excluded and dimmed, and cannot be restored in this staging session. Its returned evidence and exclusion record will be preserved.'))return;pipeline.decide(key,decision,decision==='REJECT');});};
el('jobs').onclick=e=>{const key=(e.target as HTMLElement).dataset.assign;if(key)void action(()=>{const input=el('jobs').querySelector<HTMLInputElement>(`[data-uid="${key}"]`)!;pipeline.assignUid(key,input.value);});};
el('export-pins').onclick=()=>void action(()=>{const text=pipeline.exportPinned();el<HTMLTextAreaElement>('pinned-output').value=text;download('MARA_PINNED_JOBS.txt',text);});
el('commit').onclick=()=>void action(async()=>{const warning=pipeline.prepareCommit();if(!await confirm(warning.warning)){pipeline.cancelCommit();return;}await pipeline.commit(warning.token,true,{runId:value('run-id'),candidateId:value('candidate-id'),pipelineVersion:value('pipeline-version')});});
el('transactions').onclick=e=>{const d=(e.target as HTMLElement).dataset;void action(async()=>{if(d.certify)await pipeline.certify(d.certify);if(d.readiness)await pipeline.handoff(d.readiness);const ref=d.envelope??d.sidecar;if(ref){const [id,index]=ref.split(':');const pair=pipeline.view().transactions.find(t=>t.id===id)!.pairs[Number(index)];download(d.envelope?'SEALED_A_ENVELOPE.json':'STAGE_A_SIDECAR.json',d.envelope?pair.envelope:pair.sidecar,'application/json');}});};
el('reset').onclick=()=>void action(async()=>{if(!await confirm('Reset this ephemeral session? All search outputs, staged source, decisions and committed artifacts will be lost. Export PIN jobs and manually save any prepared artifacts first. Cancel leaves everything unchanged.'))return;pipeline=new SegmentA();for(const id of ['outbound','pinned-output','incoming-text'])el<HTMLTextAreaElement>(id).value='';el<HTMLInputElement>('incoming-files').value='';el('compile-status').textContent='';el('import-status').textContent='';});
window.addEventListener('beforeunload',event=>{const v=pipeline.view();if(v.jobs.length||v.transactions.length||v.scopes.length){event.preventDefault();event.returnValue='Save your pinned text and prepared artifacts before leaving.';}});
render();
