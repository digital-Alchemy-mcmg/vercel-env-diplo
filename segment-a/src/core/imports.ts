import { sha256, validateCartridge } from '../vendor/scout/compiler';
import { required, type Job } from './model';

type Draft = Omit<Job, 'key' | 'decision' | 'duplicateOf' | 'scopeInvocation'>;
const text = (v: unknown): string => typeof v === 'string' ? v : '';

async function runnerObservation(value: unknown, sourceRef: string, batchId: string | null, runnerId: string | null): Promise<Draft> {
  const artifact = value as Record<string, any>;
  const envelope = artifact?.envelope ?? artifact;
  const scout = envelope?.payload?.scout;
  const identity = envelope?.target_identity;
  const canonical = artifact?.canonical ?? scout?.path_a_structured;
  const raw = scout?.section_8_source?.source_text;
  required(raw, 'Returned envelope payload.scout.section_8_source.source_text');
  required(identity?.observation_id, 'Returned observation_id');
  if (canonical?.Observation_ID && canonical.Observation_ID !== identity.observation_id) throw new Error('Returned UID conflicts with canonical Observation_ID.');
  const sourceHash = await sha256(raw);
  if (scout.section_8_source.source_hash !== `sha256:${sourceHash}`) throw new Error('Returned source_hash does not match the exact source_text.');
  const facts = scout.path_b_semantic?.fact_table;
  let taxonomy: Draft['taxonomy'] = null;
  if (Array.isArray(facts)) {
    for (const f of facts) {
      required(f?.text, 'Returned fact_table text');
      if (!['requirement', 'preference', 'availability'].includes(f.qualifier)) throw new Error('Unsupported returned fact qualifier. No A classification is inferred.');
    }
    // Route existing qualified target facts verbatim; never decompose raw text here.
    taxonomy = {
      hard_requirements: facts.filter(f => f.qualifier === 'requirement').map(f => f.text),
      soft_requirements: facts.filter(f => f.qualifier === 'preference').map(f => f.text),
      keyword_lexicon: [],
    };
  }
  return {
    uid: identity.observation_id, employer: text(identity.employer || canonical?.Employer),
    title: text(identity.job_title || canonical?.Job_Title), sourceUrl: text(canonical?.Source_URL),
    raw, display: raw.replace(/\r\n/g, '\n'), sourceHash, sourceRefs: [sourceRef], batchId, runnerId, taxonomy, archivedScope:null,
  };
}

export async function delineate(payload: string, sourceRef: string): Promise<Draft[]> {
  required(payload, 'Runner payload');
  if (payload.startsWith('# MARA pinned text export\n')) {
    const saved = JSON.parse(payload.slice('# MARA pinned text export\n'.length));
    if (!Array.isArray(saved)) throw new Error('Pinned text export must contain a record list.');
    return Promise.all(saved.map(async (r: Draft) => {
      required(r.raw, 'Pinned original source'); required(r.uid, 'Pinned UID');
      if (await sha256(r.raw) !== r.sourceHash) throw new Error('Pinned source integrity mismatch.');
      if (!Array.isArray(r.sourceRefs) || !r.sourceRefs.every(s => typeof s === 'string')) throw new Error('Pinned source references are malformed.');
      for (const key of ['employer', 'title', 'sourceUrl'] as const) if (typeof r[key] !== 'string') throw new Error(`Pinned ${key} is malformed.`);
      if (r.taxonomy !== null) {
        for (const key of ['hard_requirements', 'soft_requirements', 'keyword_lexicon'] as const) {
          if (!Array.isArray(r.taxonomy?.[key]) || !r.taxonomy[key].every(s => typeof s === 'string' && s.trim())) throw new Error('Pinned taxonomy is malformed.');
        }
      }
      if(r.archivedScope){
        required(r.archivedScope.invocation,'Saved search invocation');
        const checked=await validateCartridge(structuredClone(r.archivedScope.cartridge));
        if(!checked.passed || checked.certified_cartridge?.certification.content_hash!==r.archivedScope.cartridge.certification.content_hash)throw new Error('Pinned search-scope certification integrity mismatch.');
      }
      return { ...r, archivedScope:r.archivedScope??null, display: r.raw.replace(/\r\n/g, '\n'), sourceRefs: [...r.sourceRefs, sourceRef] };
    }));
  }
  const trimmed = payload.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    // Reuse RunnerOutput.observations[] and existing TravelingEnvelope structures.
    const containers = Array.isArray(parsed) ? parsed : [parsed];
    const result: Draft[] = [];
    for (const c of containers) {
      const observations = Array.isArray(c?.observations) ? c.observations : [c];
      for (const o of observations) result.push(await runnerObservation(o, sourceRef, text(c.batch_id) || null, text(c.runner_id) || null));
    }
    return result;
  }
  // Plain-text/Markdown delineation is structural only. Explicit UID headers
  // separate records; unmarked input is retained as one unresolved record.
  const headers = [...payload.matchAll(/^(?:#{1,6}\s+)?(?:UID|Observation_ID):[ \t]*(.+)[ \t]*\r?$/gm)];
  const blocks = headers.length ? headers.map((h, i) => ({
    uid: h[1].trim(), block: payload.slice(h.index!, headers[i + 1]?.index ?? payload.length),
  })) : [{ uid: null, block: payload }];
  return Promise.all(blocks.map(async ({ uid, block }) => {
    const meta = (key: string) => block.match(new RegExp(`^${key}:[ \\t]*(.*)\\r?$`, 'm'))?.[1]?.trim() ?? '';
    const description = /^Description:[ \t]*\r?\n/m.exec(block);
    const raw = description ? block.slice(description.index + description[0].length) : block;
    required(raw, 'Original job source');
    return {
      uid, employer: meta('Employer'), title: meta('Job_Title'), sourceUrl: meta('Source_URL'),
      batchId: meta('Batch_ID') || null, runnerId: meta('Runner_ID') || null,
      raw, display: raw.replace(/\r\n/g, '\n'), sourceHash: await sha256(raw), sourceRefs: [sourceRef], taxonomy: null, archivedScope:null,
    };
  }));
}
