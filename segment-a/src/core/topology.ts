// Plan 02: classify endpoints first, allocate one shared counter per local
// component second, validate third. Addresses are A-side logical interfaces,
// not invented HTTP URLs, ownership assertions, or gate numbers for B/runners.
export type Component = 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
export type Direction = 'ingress' | 'egress' | 'bidirectional';
export type Mode = 'LOCAL' | 'RESERVED_DISABLED' | 'TEST_ONLY';
export interface Endpoint {
  component: Component; endpoint: string; direction: Direction; mode: Mode; evidence: string;
}
export interface Gate extends Endpoint { number: number; address: string }
export interface GateFailure { rule: string; resource: string; reason: string }

// Confirmed local ordering. Shared functions may carry two logical fields;
// this inventory does not pretend they are separate deployed services.
export const ENDPOINTS: readonly Endpoint[] = Object.freeze([
  { component:'A1', endpoint:'configuration', direction:'ingress', mode:'LOCAL', evidence:'pipeline.ts SegmentA.compile(definition)' },
  { component:'A1', endpoint:'search-json', direction:'egress', mode:'LOCAL', evidence:'pipeline.ts compile returns/stores certified ScopeRun.cartridge' },
  { component:'A2', endpoint:'search-json', direction:'ingress', mode:'LOCAL', evidence:'pipeline.ts dispatch resolves stored invocation' },
  { component:'A2', endpoint:'manual-display-copy', direction:'egress', mode:'LOCAL', evidence:'main.ts prepare-json/copy-json and outbound textarea' },
  { component:'A2', endpoint:'folder', direction:'egress', mode:'RESERVED_DISABLED', evidence:'main.ts disabled Folder destination control' },
  { component:'A2', endpoint:'automated', direction:'egress', mode:'RESERVED_DISABLED', evidence:'main.ts disabled Automated transport control' },
  { component:'A3', endpoint:'runner-result', direction:'ingress', mode:'LOCAL', evidence:'pipeline.ts importPayload; imports.ts delineate existing returns/text' },
  { component:'A3', endpoint:'pinned-reimport', direction:'ingress', mode:'LOCAL', evidence:'imports.ts pinned-text prefix branch' },
  { component:'A3', endpoint:'committed-decisions', direction:'egress', mode:'LOCAL', evidence:'pipeline.ts commit confirmed PUSH selection snapshot' },
  { component:'A3', endpoint:'source-evidence', direction:'egress', mode:'LOCAL', evidence:'pipeline.ts commit corpus/payload snapshot, without clearing A3' },
  { component:'A3', endpoint:'pinned-export', direction:'egress', mode:'LOCAL', evidence:'pipeline.ts exportPinned; main.ts plain-text download' },
  { component:'A4', endpoint:'committed-decisions', direction:'ingress', mode:'LOCAL', evidence:'pipeline.ts commit validates confirmed selection/identity' },
  { component:'A4', endpoint:'source-evidence', direction:'ingress', mode:'LOCAL', evidence:'pipeline.ts commit verifies raw-source hashes, keeps corpus/payloads' },
  { component:'A4', endpoint:'traveling-envelope', direction:'egress', mode:'LOCAL', evidence:'pipeline.ts commit Pair.envelope and its byte hash' },
  { component:'A4', endpoint:'sidecar', direction:'egress', mode:'LOCAL', evidence:'pipeline.ts commit Pair.sidecar and its byte hash' },
  { component:'A5', endpoint:'traveling-envelope', direction:'ingress', mode:'LOCAL', evidence:'certification.ts validatePair JSON envelope/hydrateEnvelope' },
  { component:'A5', endpoint:'sidecar', direction:'ingress', mode:'LOCAL', evidence:'certification.ts validatePair JSON sidecar/hydrateSidecar' },
  { component:'A5', endpoint:'certified-envelope', direction:'egress', mode:'LOCAL', evidence:'main.ts separate locally validated envelope download' },
  { component:'A5', endpoint:'certified-sidecar', direction:'egress', mode:'LOCAL', evidence:'main.ts separate locally validated sidecar download' },
  { component:'A5', endpoint:'handoff-control', direction:'bidirectional', mode:'TEST_ONLY', evidence:'pipeline.ts handoff calls Receiver.receive and verifies returned HandoffReceipt; no production receiver' },
].map(e => Object.freeze(e)) as Endpoint[]);

const directionMark = { ingress:'<', egress:'>', bidirectional:'_' } as const;
export function allocateGates(endpoints: readonly Endpoint[]): Gate[] {
  const counters: Partial<Record<Component,number>> = {};
  return endpoints.map(e => {
    if (!['A1','A2','A3','A4','A5'].includes(e.component) || !Object.hasOwn(directionMark,e.direction) || !e.endpoint || !e.evidence || !['LOCAL','RESERVED_DISABLED','TEST_ONLY'].includes(e.mode)) throw new Error('Classify the local component and direction before allocating a gate.');
    const number = counters[e.component] = (counters[e.component] ?? 0) + 1;
    return { ...e, number, address:`${e.component}${directionMark[e.direction]}G${number}:` };
  });
}
export const GATES: readonly Gate[] = Object.freeze(allocateGates(ENDPOINTS).map(g => Object.freeze(g)));

export function validateGates(gates: readonly Gate[] = GATES): GateFailure[] {
  const failures: GateFailure[] = [];
  const fail = (rule:string,resource:string,reason:string) => failures.push({rule,resource,reason});
  const addresses = new Set<string>();
  const endpoints = new Set<string>();
  for (const g of gates) {
    const key = `${g.component}:${g.endpoint}`;
    const expected = ENDPOINTS.find(e => e.component === g.component && e.endpoint === g.endpoint);
    if (!expected) { fail('GV-07',key,'Endpoint does not belong to the confirmed local component inventory.'); continue; }
    if (addresses.has(g.address) || gates.some(other => other !== g && other.component === g.component && other.number === g.number)) fail('GV-01',g.address,'Local gate number/address is reused.');
    addresses.add(g.address);
    if (endpoints.has(key)) fail('GV-04',key,'Endpoint is accounted for more than once.');
    endpoints.add(key);
    if (g.direction !== expected.direction || g.address !== `${g.component}${directionMark[expected.direction]}G${g.number}:`) fail('GV-02',key,'Direction/address disagrees with the evidenced endpoint.');
    if (!g.evidence || g.evidence !== expected.evidence) fail('GV-03',key,'Endpoint classification lacks the confirmed source evidence.');
    if (g.mode !== expected.mode) fail('GV-06',key,'Reserved/test-only branch semantics were changed.');
  }
  for (const component of ['A1','A2','A3','A4','A5'] as const) {
    const numbers = gates.filter(g => g.component === component).map(g => g.number).sort((a,b)=>a-b);
    if (numbers.some((n,i) => n !== i+1)) fail('GV-01',component,'Ingress, egress and reserved endpoints must share one uninterrupted counter starting at G1.');
  }
  for (const e of ENDPOINTS) if (!endpoints.has(`${e.component}:${e.endpoint}`)) fail('GV-04',`${e.component}:${e.endpoint}`,'Confirmed endpoint is missing, including any reserved endpoint.');
  return failures;
}

export interface Junction {
  id:string; from:string; to:string; status:'LOCAL'|'RESERVED_DISABLED'|'EXTERNAL_UNVERIFIED'|'TEST_ONLY';
}
const gate = (component:Component,endpoint:string) => GATES.find(g => g.component===component && g.endpoint===endpoint)!.address;
export const JUNCTIONS: readonly Junction[] = Object.freeze([
  {id:'J01',from:'Operator search configuration',to:gate('A1','configuration'),status:'LOCAL'},
  {id:'J02',from:gate('A1','search-json'),to:gate('A2','search-json'),status:'LOCAL'},
  {id:'J03',from:gate('A2','manual-display-copy'),to:'Operator manual display/copy',status:'LOCAL'},
  {id:'J04',from:gate('A2','folder'),to:'Future configured folder',status:'RESERVED_DISABLED'},
  {id:'J05',from:gate('A2','automated'),to:'Future automated transport',status:'RESERVED_DISABLED'},
  {id:'J06',from:gate('A2','manual-display-copy'),to:'External runner ingress [address unknown]',status:'EXTERNAL_UNVERIFIED'},
  {id:'J07',from:'External runner results [address unknown]',to:gate('A3','runner-result'),status:'LOCAL'},
  {id:'J08',from:'Operator-saved PIN text',to:gate('A3','pinned-reimport'),status:'LOCAL'},
  {id:'J09',from:gate('A3','committed-decisions'),to:gate('A4','committed-decisions'),status:'LOCAL'},
  {id:'J10',from:gate('A3','source-evidence'),to:gate('A4','source-evidence'),status:'LOCAL'},
  {id:'J11',from:gate('A4','traveling-envelope'),to:gate('A5','traveling-envelope'),status:'LOCAL'},
  {id:'J12',from:gate('A4','sidecar'),to:gate('A5','sidecar'),status:'LOCAL'},
  {id:'J13',from:gate('A5','certified-envelope'),to:'Existing B INGRESS: SEALED_A_ENVELOPE.json [gate number undeclared]',status:'TEST_ONLY'},
  {id:'J14',from:gate('A5','certified-sidecar'),to:'Existing B INGRESS: STAGE_A_SIDECAR.json [gate number undeclared]',status:'TEST_ONLY'},
  {id:'J15',from:'Operator-supplied SDNA (outside A)',to:'Existing B INGRESS: candidate.sdna.yaml [gate number undeclared]',status:'TEST_ONLY'},
  {id:'J16',from:'B acceptance receipt [production mechanism absent]',to:gate('A5','handoff-control'),status:'TEST_ONLY'},
  // Complete accounting includes the existing Plan 01 PIN egress, omitted from J01–J16.
  {id:'J17',from:gate('A3','pinned-export'),to:'Operator manual saving → J08',status:'LOCAL'},
].map(j => Object.freeze(j)) as Junction[]);

export function validateJunctions(junctions: readonly Junction[] = JUNCTIONS): GateFailure[] {
  const failures:GateFailure[]=[];
  const ids=new Set<string>();
  for(const j of junctions){
    const expected=JUNCTIONS.find(e=>e.id===j.id);
    if(ids.has(j.id))failures.push({rule:'GV-04',resource:j.id,reason:'Duplicate logical junction.'});ids.add(j.id);
    if(!expected || j.from!==expected.from || j.to!==expected.to)failures.push({rule:'GV-02',resource:j.id,reason:'Direction/component endpoints differ from the confirmed route.'});
    if(expected && j.status!==expected.status)failures.push({rule:'GV-06',resource:j.id,reason:'Unverified, reserved or test-only route was promoted without evidence.'});
  }
  for(const j of JUNCTIONS)if(!ids.has(j.id))failures.push({rule:'GV-04',resource:j.id,reason:'Logical junction is unaccounted for.'});
  return failures;
}
