import { defineConfig } from 'vitest/config';
import { transformWithEsbuild } from 'vite';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { posix } from 'node:path';

// Read unchanged B source from its exact Git commit, in memory, for contract
// tests only. No B file or branch is edited and no B runtime is in A's bundle.
const PIN = 'd1b8348ded0190cccc7017526b8a16c84005db2a';
const originals=new Map<string,string>();
const prefix = '\0frozen-b:';
export default defineConfig({
  plugins: [{
    name: 'pinned-b-contract-reference',
    resolveId(source, importer) {
      if (source.startsWith('frozen-b:')) return '\0' + source;
      if (importer?.startsWith(prefix) && source.startsWith('.')) {
        const path = posix.join(posix.dirname(importer.slice(prefix.length)), source);
        return prefix + path + (path.endsWith('.ts') ? '' : '.ts');
      }
    },
    load(id) {
      if (id === prefix + 'identity') return `import { attest } from ${JSON.stringify(new URL('./tests/execution-attestation.ts',import.meta.url).pathname)}; export function identity(){return attest();}`;
      if (id.startsWith(prefix)) {
        const path=id.slice(prefix.length);
        const code=execFileSync('git', ['show', `${PIN}:${path}`], { encoding:'utf8' });
        originals.set(id,code); return code;
      }
    },
    async transform(code, id) {
      if (id.startsWith(prefix)) {
        const result = await transformWithEsbuild(code, `tests/reference/${id.slice(prefix.length)}`, { loader: 'ts', tsconfigRaw: { compilerOptions: { target: 'ES2022' } } });
        const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
        const hook=new URL('./tests/execution-attestation.ts',import.meta.url).pathname;
        if(id===prefix+'identity')return {code:result.code,map:null};
        return { code: `import { recordLoaded } from ${JSON.stringify(hook)}; recordLoaded(${JSON.stringify(id.slice(prefix.length))},${JSON.stringify(digest(originals.get(id)!))},${JSON.stringify(digest(result.code))});\n`+result.code, map: null };
      }
    },
  }],
  test: { include: ['tests/**/*.test.ts'] },
});
