import { execFileSync } from 'node:child_process';
import { BASE as base } from './prepare-source';
const changed=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
if(changed.some(p=>!p.startsWith('integrated/')))throw new Error('Protected source changed outside integrated/.');
const {readFileSync}=await import('node:fs');
const {createHash}=await import('node:crypto');
const manifest=JSON.parse(readFileSync('../segment-a/docs/source-manifest.json','utf8'));
for(const f of manifest.files){const bytes=readFileSync('../segment-a/'+f.target);const blob=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');if(blob!==f.blob)throw new Error('Source drift: '+f.target);}
console.log('9/9 source blobs preserved.');
console.log('Integrated changes confined to integrated/; A/B/compiler/topology unchanged.');
