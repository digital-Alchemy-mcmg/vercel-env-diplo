import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('docs/SOURCE-SNAPSHOT.json','utf8'));
for(const [path,digest] of Object.entries(manifest.files)){const actual=path==='README.md'?'docs/UPSTREAM-README.md':path==='package.json'?'docs/UPSTREAM-PACKAGE.json':path; if(createHash('sha256').update(readFileSync(actual)).digest('hex')!==digest)throw new Error('Upstream drift: '+path);}
console.log(Object.keys(manifest.files).length+' upstream files match '+manifest.commit+'; root package/readme are explicit deployment adapters.');
