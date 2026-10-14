import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const manifest = JSON.parse(await readFile('docs/source-manifest.json','utf8'));
for(const f of manifest.files){
  const bytes=await readFile(f.target);
  const blob=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if(blob!==f.blob)throw new Error(`Source drift: ${f.target} from ${f.repository}@${f.ref}:${f.source}`);
}
const changed=execFileSync('git',['diff','--name-only','57f9d054a9c0ddf3c1cfed70086a03c509f9e378'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
if(changed.some(p=>!p.startsWith('segment-a/')))throw new Error('Legacy/B/C surface changed outside segment-a/.');
console.log(`${manifest.files.length} reused files are byte-identical to pinned source blobs; tracked legacy/B/C paths unchanged.`);
