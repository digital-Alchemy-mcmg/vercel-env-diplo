import { it,expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const base='84f08b27c719bbc7fbefa6735fb7446fe846c47e';
const original=(p:string)=>execFileSync('git',['show',`${base}:segment-a/${p}`],{encoding:'utf8'});
it('protects A1–A4, serialization, topology, compiler and local certification',()=>{
 const current=readFileSync('src/core/pipeline.ts','utf8');
 expect(current.slice(current.indexOf('export class SegmentA'),current.indexOf('  async certify'))).toBe(original('src/core/pipeline.ts').slice(original('src/core/pipeline.ts').indexOf('export class SegmentA'),original('src/core/pipeline.ts').indexOf('  async certify')));
 for(const p of ['src/core/imports.ts','src/core/certification.ts','src/core/model.ts','src/core/topology.ts','src/main.ts','src/vendor/scout/compiler.ts'])expect(readFileSync(p,'utf8')).toBe(original(p));
});
