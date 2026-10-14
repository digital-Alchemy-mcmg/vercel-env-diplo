import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname,join,posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
export const root=dirname(fileURLToPath(import.meta.url));
export const PIN='d1b8348ded0190cccc7017526b8a16c84005db2a';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const git=(...args:string[])=>execFileSync('git',args,{cwd:root,encoding:'utf8'});
export function buildIdentity(){
 const paths=git('ls-tree','-r','--name-only','--full-tree',PIN).trim().split('\n').filter(p=>p.startsWith('src/'));
 const closure=paths.map(p=>[p,git('show',`${PIN}:${p}`)]);
 const dependencyHash=hash(git('show',`${PIN}:package-lock.json`)+readFileSync(join(root,'package-lock.json'),'utf8'));
 return {validator:PIN,sourceHash:hash(JSON.stringify(closure)),dependencyHash,buildHash:hash(JSON.stringify(closure)+dependencyHash+['pinned-source.ts','vite.config.ts','src/worker.ts','src/receiver.ts'].map(p=>readFileSync(join(root,p),'utf8')).join('\n'))};
}
export function pinnedPlugin():Plugin {
 const prefix='\0pinned-b:';
 return {name:'approved-b-source',resolveId(source,importer){
  if(source==='mara-a-ui')return join(root,'../segment-a/src/main.ts')+'?integrated';
  if(source==='b-build:identity')return '\0b-build:identity';
  if(source.startsWith('pinned-b:'))return '\0'+source;
  if(importer?.startsWith(prefix)&&source.startsWith('.')){const p=posix.join(posix.dirname(importer.slice(prefix.length)),source);return prefix+p+(p.endsWith('.ts')?'':'.ts');}
 },load(id){
  if(id.endsWith('segment-a/src/main.ts?integrated'))return readFileSync(join(root,'../segment-a/src/main.ts'),'utf8')+'\nexport function getPipeline(){return pipeline;} export function refreshAUI(){render();}\n';
  if(id==='\0b-build:identity')return 'export const identity='+JSON.stringify(buildIdentity());
  if(id.startsWith(prefix))return git('show',`${PIN}:${id.slice(prefix.length)}`);
 },async transform(code,id){if(id.startsWith(prefix)){const {transformWithEsbuild}=await import('vite');const r=await transformWithEsbuild(code,'reference.ts',{loader:'ts',tsconfigRaw:{compilerOptions:{target:'ES2022'}}});return {code:r.code,map:null};}}};
}
