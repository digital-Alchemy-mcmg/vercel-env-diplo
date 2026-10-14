// Build-only source acquisition. No secrets enter the browser bundle.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PIN } from '../pinned-source';
export const BASE='29c54dc2eff750c1d284e56775cb01e34de7fb9d';
for(const commit of [PIN,BASE]){
 try{execFileSync('git',['cat-file','-e',`${commit}^{commit}`],{stdio:'ignore'});}
 catch{try{
 const helper=fileURLToPath(new URL('./git-credential.ts',import.meta.url));
 const args=process.env.MARA_B_SOURCE_TOKEN?['-c','credential.helper=!node --import tsx '+JSON.stringify(helper),'-c','credential.useHttpPath=true']:[];
 execFileSync('git',[...args,'fetch','--no-tags','--depth=1','https://github.com/digital-Alchemy-mcmg/Envoy_Diplomat.git',commit],{stdio:'pipe',env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});
 }catch{throw new Error('Approved source unavailable: '+commit+'. Supply read-only Git access. No source substitute is permitted.');}}
}
console.log('Pinned B and protection baseline sources available.');
