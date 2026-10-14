// Independent harness inspection of pinned source closure and installed tooling.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const pin='d1b8348ded0190cccc7017526b8a16c84005db2a';
const hash=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
const read=(p:string)=>readFileSync(p,'utf8');
const paths=execFileSync('git',['ls-tree','-r','--name-only','--full-tree',pin],{encoding:'utf8'}).trim().split('\n').filter(p=>p.startsWith('src/'));
const source=paths.map(p=>[p,execFileSync('git',['show',`${pin}:${p}`],{encoding:'utf8'})]);
const frozenLock=execFileSync('git',['show',`${pin}:package-lock.json`],{encoding:'utf8'});
const localLock=read('package-lock.json');
function tree(p:string):string {return readdirSync(p,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).map(e=>e.isDirectory()?tree(join(p,e.name)):e.name+hash(readFileSync(join(p,e.name)))).join('\n');}
const yaml=tree('node_modules/yaml');
const loader=read('vitest.config.ts');
const harnessPaths=['tests/execution-attestation.ts','src/integration/local-receiver.ts','src/core/local-evidence.ts'];
const harness=harnessPaths.map(p=>[p,read(p)]);
const tooling=['vite','vitest','tsx','typescript','esbuild'].map(p=>[p,tree(`node_modules/${p}`)]);
const toolingHash=hash(JSON.stringify(tooling));
const loaded=new Map<string,string>();
export function recordLoaded(path:string,sourceHash:string,transformedHash:string){
 const expected=source.find(([p])=>p===path);if(!expected || hash(expected[1])!==sourceHash)throw new Error('Executed B source drift.');
 loaded.set(path,transformedHash);
}
export function attest(){
 if(!loaded.has('src/runtime/session.ts') || !loaded.has('src/runtime/ingress.ts'))throw new Error('B session/validator not executed by pinned loader.');
 if(read('package-lock.json')!==localLock || read('vitest.config.ts')!==loader || tree('node_modules/yaml')!==yaml)throw new Error('Dependency/build identity drift.');
 if(harness.some(([p,s])=>read(p)!==s) || hash(JSON.stringify(tooling.map(([p])=>[p,tree(`node_modules/${p}`)])))!==toolingHash)throw new Error('Harness/toolchain execution identity drift.');
 const expected=JSON.parse(frozenLock).packages['node_modules/yaml'].version;
 if(JSON.parse(read('node_modules/yaml/package.json')).version!==expected)throw new Error('Wrong B yaml dependency version.');
 return {commit:pin,sourceHash:hash(JSON.stringify(source)),dependencyHash:hash(frozenLock+localLock+yaml),buildHash:hash(JSON.stringify([...loaded].sort())+loader+process.version+localLock+yaml+JSON.stringify(harness)+toolingHash)};
}
